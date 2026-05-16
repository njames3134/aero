use chrono::{NaiveDateTime, Utc, Duration};

use crate::models::external::strava::StravaTokenResponse;

#[derive(Debug, Clone)]
pub struct StravaToken {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: NaiveDateTime,
}

impl From<StravaTokenResponse> for StravaToken {
    fn from(api: StravaTokenResponse) -> Self {
        let expires_at = chrono::DateTime::from_timestamp(api.expires_at, 0)
            .expect("Invalid timestamp")
            .naive_utc();

        Self {
            access_token: api.access_token,
            refresh_token: api.refresh_token,
            expires_at,
        }
    }
}

impl StravaToken {
    pub fn is_expired(&self) -> bool {
        let now = Utc::now().naive_utc();
        now >= (self.expires_at - Duration::seconds(120))
    }
}
