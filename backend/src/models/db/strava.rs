use chrono::NaiveDateTime;
use sqlx::FromRow;

use crate::models::domain::strava::StravaToken;

#[derive(Debug, Clone, FromRow)]
pub struct StravaTokenRow {
    pub user_id: i64,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: NaiveDateTime,
    pub scope: Option<String>,
}

impl StravaTokenRow {
    pub fn new(
        user_id: i64,
        token: StravaToken,
        scope: Option<String>,
    ) -> Self {
        Self {
            user_id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: token.expires_at,
            scope,
        }
    }
}

impl From<StravaTokenRow> for StravaToken {
    fn from(row: StravaTokenRow) -> Self {
        Self {
            access_token: row.access_token,
            refresh_token: row.refresh_token,
            expires_at: row.expires_at,
        }
    }
}
