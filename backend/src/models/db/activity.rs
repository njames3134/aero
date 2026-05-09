use chrono::NaiveDateTime;
use serde::{Serialize, Deserialize};
use sqlx::FromRow;

use crate::models::domain::activity::{Activity, ActivityStreams};

#[derive(Debug, Serialize, FromRow)]
pub struct ActivityRow {
    pub id: i64,
    pub user_id: i64,
    pub strava_activity_id: i64,

    pub activity_type: Option<String>,

    pub distance: Option<f64>,
    pub moving_time: Option<i32>,
    pub elapsed_time: Option<i32>,

    pub start_date: Option<NaiveDateTime>,

    pub average_speed: Option<f64>,
    pub max_speed: Option<f64>,

    pub average_watts: Option<f64>,
    pub weighted_average_watts: Option<f64>,
    pub max_watts: Option<f64>,

    pub average_heartrate: Option<f64>,
    pub max_heartrate: Option<f64>,

    pub average_cadence: Option<f64>,

    pub total_elevation_gain: Option<f64>,

    pub summary_polyline: Option<String>,

    pub laps: Option<serde_json::Value>,

    pub created_at: NaiveDateTime,
}

impl From<ActivityRow> for Activity {
    fn from(r: ActivityRow) -> Self {
        Self {
            id: r.id,
            strava_activity_id: r.strava_activity_id,

            activity_type: r.activity_type,

            distance: r.distance,
            moving_time: r.moving_time,
            elapsed_time: r.elapsed_time,

            start_date: r.start_date,

            average_speed: r.average_speed,
            max_speed: r.max_speed,

            average_watts: r.average_watts,
            weighted_average_watts: r.weighted_average_watts,
            max_watts: r.max_watts,

            average_heartrate: r.average_heartrate,
            max_heartrate: r.max_heartrate,

            average_cadence: r.average_cadence,

            total_elevation_gain: r.total_elevation_gain,

            summary_polyline: r.summary_polyline,

            laps: r.laps.and_then(|v| serde_json::from_value(v).ok()),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ActivityInsert {
    pub user_id: i64,
    pub strava_activity_id: i64,

    pub activity_type: Option<String>,

    pub distance: Option<f64>,
    pub moving_time: Option<i32>,
    pub elapsed_time: Option<i32>,

    pub start_date: Option<NaiveDateTime>,

    pub average_speed: Option<f64>,
    pub max_speed: Option<f64>,

    pub average_watts: Option<f64>,
    pub weighted_average_watts: Option<f64>,
    pub max_watts: Option<f64>,

    pub average_heartrate: Option<f64>,
    pub max_heartrate: Option<f64>,

    pub average_cadence: Option<f64>,

    pub total_elevation_gain: Option<f64>,

    pub summary_polyline: Option<String>,

    pub laps: Option<serde_json::Value>,
}

impl ActivityInsert {
    pub fn from_domain(user_id: i64, a: Activity) -> Self {
        Self {
            user_id,
            strava_activity_id: a.strava_activity_id,

            activity_type: a.activity_type,

            distance: a.distance,
            moving_time: a.moving_time,
            elapsed_time: a.elapsed_time,

            start_date: a.start_date,

            average_speed: a.average_speed,
            max_speed: a.max_speed,

            average_watts: a.average_watts,
            weighted_average_watts: a.weighted_average_watts,
            max_watts: a.max_watts,

            average_heartrate: a.average_heartrate,
            max_heartrate: a.max_heartrate,

            average_cadence: a.average_cadence,

            total_elevation_gain: a.total_elevation_gain,

            summary_polyline: a.summary_polyline,        

            laps: a.laps.and_then(|v| serde_json::to_value(v).ok()),
        }
    }
}

#[derive(sqlx::FromRow, Debug)]
pub struct ActivityStreamsRow {
    pub activity_id: i64,

    pub time: Option<serde_json::Value>,
    pub latlng: Option<serde_json::Value>,
    pub altitude: Option<serde_json::Value>,
    pub velocity: Option<serde_json::Value>,
    pub heartrate: Option<serde_json::Value>,
    pub cadence: Option<serde_json::Value>,
    pub watts: Option<serde_json::Value>,
    pub distance: Option<serde_json::Value>,
    pub grade: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ActivityStreamsInsert {
    pub activity_id: i64,

    pub time: Option<serde_json::Value>,
    pub latlng: Option<serde_json::Value>,
    pub altitude: Option<serde_json::Value>,
    pub velocity: Option<serde_json::Value>,
    pub heartrate: Option<serde_json::Value>,
    pub cadence: Option<serde_json::Value>,
    pub watts: Option<serde_json::Value>,
    pub distance: Option<serde_json::Value>,
    pub grade: Option<serde_json::Value>,
}

fn from_json<T: serde::de::DeserializeOwned>(v: serde_json::Value) -> Option<T> {
    serde_json::from_value(v).ok()
}

impl From<ActivityStreamsRow> for ActivityStreams {
    fn from(row: ActivityStreamsRow) -> Self {
        Self {
            time: row.time.and_then(from_json),
            latlng: row.latlng.and_then(from_json),
            altitude: row.altitude.and_then(from_json),
            velocity: row.velocity.and_then(from_json),
            heartrate: row.heartrate.and_then(from_json),
            cadence: row.cadence.and_then(from_json),
            watts: row.watts.and_then(from_json),
            distance: row.distance.and_then(from_json),
            grade: row.grade.and_then(from_json),
        }
    }
}

fn to_json<T: serde::Serialize>(v: &T) -> serde_json::Value {
    serde_json::to_value(v).unwrap_or(serde_json::Value::Null)
}

impl ActivityStreamsInsert {
    pub fn from_domain(activity_id: i64, s: ActivityStreams) -> Self {
        Self {
            activity_id,
            time: s.time.map(|v| to_json(&v)),
            latlng: s.latlng.map(|v| to_json(&v)),
            altitude: s.altitude.map(|v| to_json(&v)),
            velocity: s.velocity.map(|v| to_json(&v)),
            heartrate: s.heartrate.map(|v| to_json(&v)),
            cadence: s.cadence.map(|v| to_json(&v)),
            watts: s.watts.map(|v| to_json(&v)),
            distance: s.distance.map(|v| to_json(&v)),
            grade: s.grade.map(|v| to_json(&v)),
        }
    }
}
