use chrono::NaiveDateTime;

use crate::models::external::strava::{StravaActivityResponse, StravaActivityStream, StravaActivityStreamsResponse};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ActivityLap {
    pub elapsed_time: i32,
    pub moving_time: i32,
    pub distance: f64,

    pub average_speed: Option<f64>,
    pub average_watts: Option<f64>,
    pub average_cadence: Option<f64>,

    pub total_elevation_gain: Option<f64>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct Activity {
    pub id: i64,
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

    pub laps: Option<Vec<ActivityLap>>,
}

impl From<StravaActivityResponse> for Activity {
    fn from(s: StravaActivityResponse) -> Self {
        Self {
            id: 0,
            strava_activity_id: s.id,

            activity_type: Some(s.activity_type),

            distance: Some(s.distance),

            moving_time: Some(s.moving_time),
            elapsed_time: s.elapsed_time,

            start_date: s.start_date.map(|dt| dt.naive_utc()),

            average_speed: s.average_speed,
            max_speed: s.max_speed,

            average_watts: s.average_watts,
            weighted_average_watts: s.weighted_average_watts,
            max_watts: s.max_watts,

            average_heartrate: s.average_heartrate,
            max_heartrate: s.max_heartrate,

            average_cadence: s.average_cadence,

            total_elevation_gain: s.total_elevation_gain,

            summary_polyline: s.map.and_then(|m| m.summary_polyline),

            laps: s.laps.map(|laps| {
                laps.into_iter()
                    .map(|l| ActivityLap {
                        elapsed_time: l.elapsed_time,
                        moving_time: l.moving_time,
                        distance: l.distance,
                        average_speed: l.average_speed,
                        average_watts: l.average_watts,
                        average_cadence: l.average_cadence,
                        total_elevation_gain: l.total_elevation_gain,
                    })
                    .collect()
            }),
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ActivityStreams {
    pub time: Option<Vec<i32>>,
    pub latlng: Option<Vec<[f64; 2]>>,
    pub altitude: Option<Vec<f64>>,
    pub velocity: Option<Vec<f64>>,
    pub heartrate: Option<Vec<i32>>,
    pub cadence: Option<Vec<f64>>,
    pub watts: Option<Vec<i32>>,
    pub distance: Option<Vec<f64>>,
    pub grade: Option<Vec<f64>>,
}

fn decode_vec<T: serde::de::DeserializeOwned>(
    v: Option<&StravaActivityStream>
) -> Option<T> {
    v.and_then(|s| serde_json::from_value(s.data.clone()).ok())
}

impl From<StravaActivityStreamsResponse> for ActivityStreams {
    fn from(s: StravaActivityStreamsResponse) -> Self {
        Self {
            time: decode_vec(s.time.as_ref()),
            latlng: decode_vec(s.latlng.as_ref()),
            altitude: decode_vec(s.altitude.as_ref()),
            velocity: decode_vec(s.velocity_smooth.as_ref()),
            heartrate: decode_vec(s.heartrate.as_ref()),
            cadence: decode_vec(s.cadence.as_ref()),
            watts: decode_vec(s.watts.as_ref()),
            distance: decode_vec(s.distance.as_ref()),
            grade: decode_vec(s.grade_smooth.as_ref()),
        }
    }
}
