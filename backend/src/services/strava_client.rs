use reqwest::Client;
use std::env;
use anyhow::Result;

use crate::models::external::strava::{
    StravaActivityResponse,
    StravaActivityStreamsResponse,
};
use crate::models::external::strava::StravaTokenResponse;
use crate::services::strava_service::RateLimitInfo;

fn extract_rate_limit(headers: &reqwest::header::HeaderMap) -> Option<RateLimitInfo> {
    let limit = headers.get("x-ratelimit-limit")?.to_str().ok()?;
    let usage = headers.get("x-ratelimit-usage")?.to_str().ok()?;

    let mut limit_parts = limit.split(',');
    let mut usage_parts = usage.split(',');

    Some(RateLimitInfo {
        short_limit: limit_parts.next()?.parse().ok()?,
        daily_limit: limit_parts.next()?.parse().ok()?,
        short_usage: usage_parts.next()?.parse().ok()?,
        daily_usage: usage_parts.next()?.parse().ok()?,
    })
}

#[derive(Debug)]
pub struct ActivitiesPage {
    pub activities: Vec<StravaActivityResponse>,
    pub rate_limit: Option<RateLimitInfo>,
}

#[derive(Clone)]
pub struct StravaClient {
    pub http: Client,
    pub client_id: String,
    pub client_secret: String,
}

impl StravaClient {
    pub fn new() -> Self {
        Self {
            http: Client::new(),
            client_id: env::var("STRAVA_CLIENT_ID")
                .expect("STRAVA_CLIENT_ID not set"),
            client_secret: env::var("STRAVA_CLIENT_SECRET")
                .expect("STRAVA_CLIENT_SECRET not set"),
        }
    }

    pub async fn refresh_token(
        &self,
        refresh_token: &str,
    ) -> Result<StravaTokenResponse> {
        let res = self
            .http
            .post("https://www.strava.com/oauth/token")
            .form(&[
                ("client_id", self.client_id.as_str()),
                ("client_secret", self.client_secret.as_str()),
                ("grant_type", "refresh_token"),
                ("refresh_token", refresh_token),
            ])
            .send()
            .await?;

        if !res.status().is_success() {
            let err_text = res.text().await.unwrap_or_default();
            anyhow::bail!("Strava refresh failed: {}", err_text);
        }

        Ok(res.json::<StravaTokenResponse>().await?)
    }

    pub async fn exchange_code(
        &self,
        code: &str,
    ) -> Result<StravaTokenResponse> {
        let res = self
            .http
            .post("https://www.strava.com/oauth/token")
            .form(&[
                ("client_id", self.client_id.as_str()),
                ("client_secret", self.client_secret.as_str()),
                ("code", code),
                ("grant_type", "authorization_code"),
            ])
            .send()
            .await?;

        if !res.status().is_success() {
            let err = res.text().await.unwrap_or_default();
            anyhow::bail!("OAuth exchange failed: {}", err);
        }

        Ok(res.json::<StravaTokenResponse>().await?)
    }

    pub async fn fetch_activity_detail(
        &self,
        access_token: &str,
        activity_id: i64,
    ) -> Result<StravaActivityResponse> {
        let url = format!(
            "https://www.strava.com/api/v3/activities/{}",
            activity_id
        );

        let res = self
            .http
            .get(&url)
            .bearer_auth(access_token)
            .send()
            .await?;

        if !res.status().is_success() {
            let err = res.text().await.unwrap_or_default();
            anyhow::bail!("Activity detail fetch failed: {}", err);
        }

        Ok(res.json::<StravaActivityResponse>().await?)
    }

    pub async fn fetch_activity_streams(
        &self,
        access_token: &str,
        activity_id: i64,
    ) -> Result<StravaActivityStreamsResponse> {
        let url = format!(
            "https://www.strava.com/api/v3/activities/{}/streams\
            ?keys=time,latlng,altitude,velocity_smooth,heartrate,cadence,watts,distance,grade_smooth\
            &key_by_type=true",
            activity_id
        );

        let res = self
            .http
            .get(&url)
            .bearer_auth(access_token)
            .send()
            .await?;

        if !res.status().is_success() {
            let err = res.text().await.unwrap_or_default();
            anyhow::bail!("Stream fetch failed: {}", err);
        }

        Ok(res.json::<StravaActivityStreamsResponse>().await?)
    }

    pub async fn list_activities(
        &self,
        access_token: &str,
        page: i32,
        per_page: i32,
        after: Option<i64>,
    ) -> Result<ActivitiesPage> {
        let mut query = vec![
            ("page", page.to_string()),
            ("per_page", per_page.to_string()),
        ];

        if let Some(after_ts) = after {
            query.push(("after", after_ts.to_string()));
        }

        let res = self
            .http
            .get("https://www.strava.com/api/v3/athlete/activities")
            .bearer_auth(access_token)
            .query(&query)
            .send()
            .await?;

        let rate_limit = extract_rate_limit(res.headers());

        let activities = res
            .json::<Vec<StravaActivityResponse>>()
            .await?;

        println!(
            "[STRAVA][ACTIVITIES] page={} count={} sample_id={}",
            page,
            activities.len(),
            activities.first().map(|a| a.id).unwrap_or(-1)
        );

        Ok(ActivitiesPage {
            activities,
            rate_limit,
        })
    }
}
