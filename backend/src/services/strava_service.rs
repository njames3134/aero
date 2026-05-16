use crate::models::domain::activity::{Activity, ActivityStreams};
use crate::models::db::activity::{ActivityInsert, ActivityStreamsInsert};
use crate::models::db::strava::StravaTokenRow;
use crate::models::external::strava::StravaTokenResponse;
use crate::models::domain::strava::StravaToken;
use crate::services::strava_client::StravaClient;

use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct RateLimitInfo {
    pub short_limit: i32,
    pub short_usage: i32,
    pub daily_limit: i32,
    pub daily_usage: i32,
}

pub struct SyncSummary {
    pub new: usize,
    pub updated: usize,
    pub total_fetched: usize,
    pub rate_limit: Option<RateLimitInfo>,
}

#[derive(Clone)]
pub struct StravaService {
    pub db: PgPool,
    pub client: StravaClient,
}

impl StravaService {
    pub fn new(db: PgPool) -> Self {
        Self {
            db,
            client: StravaClient::new(),
        }
    }

    async fn throttle(&self, rate: Option<&RateLimitInfo>) -> bool {
        let Some(rate) = rate else {
            tokio::time::sleep(std::time::Duration::from_millis(200)).await;
            return false;
        };

        let short_remaining = rate.short_limit - rate.short_usage;
        let daily_remaining = rate.daily_limit - rate.daily_usage;

        if daily_remaining <= 10 {
            return true;
        }

        let delay = if short_remaining <= 5 {
            2000
        } else if short_remaining <= 20 {
            500
        } else {
            200
        };

        tokio::time::sleep(std::time::Duration::from_millis(delay)).await;
        false
    }

    pub async fn handle_oauth_callback(
        &self,
        user_id: i64,
        code: String,
    ) -> anyhow::Result<()> {
        let api_token = self.client.exchange_code(&code).await?;
        let domain_token: StravaToken = api_token.into();
        let db_token = StravaTokenRow::new(user_id, domain_token, None);
        crate::db::strava::save_token(&self.db, db_token).await?;
        Ok(())
    }

    pub async fn get_valid_token(
        &self,
        user_id: i64,
    ) -> Result<StravaToken, anyhow::Error> {
        let mut token: StravaToken = crate::db::strava::get_token(&self.db, user_id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("No token found"))?
            .into();

        if token.is_expired() {
            let api_token: StravaTokenResponse = self
                .client
                .refresh_token(&token.refresh_token)
                .await?;

            let new_token: StravaToken = api_token.into();
            let db_token = StravaTokenRow::new(user_id, new_token.clone(), None);
            crate::db::strava::save_token(&self.db, db_token).await?;
            token = new_token;
        }

        Ok(token)
    }

    pub async fn sync(&self, user_id: i64, force: bool) -> Result<SyncSummary, anyhow::Error> {
        if force {
            return self.backfill_laps(user_id).await;
        }

        let last = crate::db::activities::get_latest_activity_time(&self.db, user_id).await?;
        let after = last.map(|ts| (ts - chrono::Duration::minutes(5)).and_utc().timestamp());
        self.sync_activities(user_id, after).await
    }

    pub async fn backfill_laps(&self, user_id: i64) -> Result<SyncSummary, anyhow::Error> {
        let token = self.get_valid_token(user_id).await?;
        let ids = crate::db::activities::get_all_strava_ids(&self.db, user_id).await?;

        let mut summary = SyncSummary {
            new: 0,
            updated: 0,
            total_fetched: ids.len(),
            rate_limit: None,
        };

        for strava_id in ids {
            match self.client.fetch_activity_detail(&token.access_token, strava_id).await {
                Ok(detail) => {
                    let activity: Activity = detail.into();
                    let db_row = ActivityInsert::from_domain(user_id, activity);
                    match crate::db::activities::insert(&self.db, &db_row).await {
                        Ok(_) => summary.updated += 1,
                        Err(e) => println!("[BACKFILL] DB error for {}: {:?}", strava_id, e),
                    }
                }
                Err(e) => println!("[BACKFILL] Fetch error for {}: {:?}", strava_id, e),
            }

            // 300ms between detail fetches to stay well under rate limits
            tokio::time::sleep(std::time::Duration::from_millis(300)).await;
        }

        Ok(summary)
    }

    pub async fn sync_activities(
        &self,
        user_id: i64,
        after: Option<i64>,
    ) -> Result<SyncSummary, anyhow::Error> {
        let token = self.get_valid_token(user_id).await?;

        let mut page = 1;
        let per_page = 50;

        let mut summary = SyncSummary {
            new: 0,
            updated: 0,
            total_fetched: 0,
            rate_limit: None,
        };

        loop {
            let response = self
                .client
                .list_activities(&token.access_token, page, per_page, after)
                .await?;

            if response.activities.is_empty() {
                break;
            }

            if self.throttle(response.rate_limit.as_ref()).await {
                break;
            }

            summary.total_fetched += response.activities.len();
            summary.rate_limit = response.rate_limit.clone();

            for api_activity in response.activities {
                let strava_id = api_activity.id;
                let activity: Activity = api_activity.into();
                let db_row = ActivityInsert::from_domain(user_id, activity);
                let result = crate::db::activities::insert(&self.db, &db_row).await?;
                let activity_id = result.id;
                let needs_streams = result.inserted;

                if result.inserted {
                    summary.new += 1;
                } else {
                    summary.updated += 1;
                }

                // Spawn detail + streams fetch for every new activity
                if needs_streams {
                    let client = self.client.clone();
                    let db = self.db.clone();
                    let token_clone = token.access_token.clone();

                    tokio::spawn(async move {
                        // Fetch full detail to get laps
                        match client.fetch_activity_detail(&token_clone, strava_id).await {
                            Ok(detail) => {
                                let activity: Activity = detail.into();
                                let insert = ActivityInsert::from_domain(user_id, activity);
                                if let Err(e) = crate::db::activities::insert(&db, &insert).await {
                                    println!("[DETAIL] DB error {}: {:?}", strava_id, e);
                                }
                            }
                            Err(e) => println!("[DETAIL] Fetch error {}: {:?}", strava_id, e),
                        }

                        // Small gap between detail and streams fetch
                        tokio::time::sleep(std::time::Duration::from_millis(100)).await;

                        // Fetch streams
                        match client.fetch_activity_streams(&token_clone, strava_id).await {
                            Ok(raw) => {
                                let streams: ActivityStreams = raw.into();
                                let db_streams = ActivityStreamsInsert::from_domain(activity_id, streams);
                                if let Err(e) = crate::db::activities::upsert_streams(&db, &db_streams).await {
                                    println!("[STREAMS] DB error {}: {:?}", activity_id, e);
                                }
                            }
                            Err(e) => println!("[STREAMS] Fetch error {}: {:?}", strava_id, e),
                        }
                    });
                }
            }

            page += 1;
        }

        Ok(summary)
    }
}
