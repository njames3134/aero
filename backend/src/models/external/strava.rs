use serde::Deserialize;
use serde_json::Value;
use chrono::{DateTime, Utc};

#[derive(Debug, Deserialize)]
pub struct StravaTokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: i64,
}

#[derive(Debug, Deserialize)]
pub struct StravaLap {
    pub elapsed_time: i32,
    pub moving_time: i32,
    pub distance: f64,

    pub average_speed: Option<f64>,
    pub average_watts: Option<f64>,
    pub average_cadence: Option<f64>,

    pub total_elevation_gain: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct StravaMap {
    pub id: Option<String>,
    pub summary_polyline: Option<String>,
    pub resource_state: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct StravaActivityResponse {
    pub id: i64,

    #[serde(rename = "type")]
    pub activity_type: String,

    pub distance: f64,
    pub moving_time: i32,
    pub elapsed_time: Option<i32>,

    pub start_date: Option<DateTime<Utc>>,

    pub average_speed: Option<f64>,
    pub max_speed: Option<f64>,

    pub average_watts: Option<f64>,
    pub weighted_average_watts: Option<f64>,
    pub max_watts: Option<f64>,

    pub average_heartrate: Option<f64>,
    pub max_heartrate: Option<f64>,

    pub average_cadence: Option<f64>,

    pub total_elevation_gain: Option<f64>,

    pub map: Option<StravaMap>,

    pub laps: Option<Vec<StravaLap>>,
}

#[derive(Debug, Deserialize)]
pub struct StravaActivityStream {
    pub data: Value,
    pub series_type: String,
    pub original_size: i64,
}

#[derive(Debug, Deserialize)]
pub struct StravaActivityStreamsResponse {
    pub time: Option<StravaActivityStream>,
    pub latlng: Option<StravaActivityStream>,
    pub altitude: Option<StravaActivityStream>,
    pub velocity_smooth: Option<StravaActivityStream>,
    pub heartrate: Option<StravaActivityStream>,
    pub cadence: Option<StravaActivityStream>,
    pub watts: Option<StravaActivityStream>,
    pub distance: Option<StravaActivityStream>,
    pub grade_smooth: Option<StravaActivityStream>,
}

