use crate::models::db::activity::{ActivityRow, ActivityInsert, ActivityStreamsRow, ActivityStreamsInsert};
use sqlx::PgPool;

pub async fn fetch_all(
    pool: &PgPool
) -> Result<Vec<ActivityRow>, sqlx::Error> {
    let activities = sqlx::query_as!(
        ActivityRow,
        r#"
        SELECT
            id,
            user_id,
            strava_activity_id,

            activity_type,

            distance,
            moving_time,
            elapsed_time,

            start_date,

            average_speed,
            max_speed,

            average_watts,
            weighted_average_watts,
            max_watts,

            average_heartrate,
            max_heartrate,

            average_cadence,

            total_elevation_gain,

            summary_polyline,

            laps,

            created_at
        FROM activities
        ORDER BY start_date DESC
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(activities)
}

pub async fn get_by_id(
    pool: &PgPool,
    id: i64,
) -> Result<Option<ActivityRow>, sqlx::Error> {
    let row = sqlx::query_as!(
        ActivityRow,
        r#"
        SELECT
            id,
            user_id,
            strava_activity_id,

            activity_type,

            distance,
            moving_time,
            elapsed_time,

            start_date,

            average_speed,
            max_speed,

            average_watts,
            weighted_average_watts,
            max_watts,

            average_heartrate,
            max_heartrate,

            average_cadence,

            total_elevation_gain,

            summary_polyline,

            laps,

            created_at
        FROM activities
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool)
    .await?;

    Ok(row)
}

pub struct InsertResult {
    pub id: i64,
    pub inserted: bool,
}

pub async fn insert(
    pool: &PgPool,
    input: &ActivityInsert,
) -> Result<InsertResult, sqlx::Error> {
    let rec = sqlx::query!(
        r#"
        INSERT INTO activities (
            user_id,
            strava_activity_id,

            activity_type,

            distance,
            moving_time,
            elapsed_time,

            start_date,

            average_speed,
            max_speed,

            average_watts,
            weighted_average_watts,
            max_watts,

            average_heartrate,
            max_heartrate,

            average_cadence,

            total_elevation_gain,

            summary_polyline,

            laps
        )
        VALUES (
            $1,$2,
            $3,$4,
            $5,$6,$7,
            $8,
            $9,$10,
            $11,$12,$13,
            $14,$15,
            $16,
            $17,
            $18
        )
        ON CONFLICT (user_id, strava_activity_id)
        DO UPDATE SET
            activity_type = EXCLUDED.activity_type,

            distance = EXCLUDED.distance,
            moving_time = EXCLUDED.moving_time,
            elapsed_time = EXCLUDED.elapsed_time,

            start_date = EXCLUDED.start_date,

            average_speed = EXCLUDED.average_speed,
            max_speed = EXCLUDED.max_speed,

            average_watts = EXCLUDED.average_watts,
            weighted_average_watts = EXCLUDED.weighted_average_watts,
            max_watts = EXCLUDED.max_watts,

            average_heartrate = EXCLUDED.average_heartrate,
            max_heartrate = EXCLUDED.max_heartrate,

            average_cadence = EXCLUDED.average_cadence,

            total_elevation_gain = EXCLUDED.total_elevation_gain,

            summary_polyline = EXCLUDED.summary_polyline,

            laps = EXCLUDED.laps

        RETURNING id, (xmax = 0) as "inserted!"
        "#,
        input.user_id,
        input.strava_activity_id,

        input.activity_type,

        input.distance,
        input.moving_time,
        input.elapsed_time,

        input.start_date,

        input.average_speed,
        input.max_speed,

        input.average_watts,
        input.weighted_average_watts,
        input.max_watts,

        input.average_heartrate,
        input.max_heartrate,

        input.average_cadence,

        input.total_elevation_gain,

        input.summary_polyline,

        input.laps
    )
    .fetch_one(pool)
    .await?;

    Ok(InsertResult {
        id: rec.id,
        inserted: rec.inserted,
    })
}

pub async fn get_latest_activity_time(
    pool: &PgPool,
    user_id: i64,
) -> Result<Option<chrono::NaiveDateTime>, sqlx::Error> {
    let row = sqlx::query!(
        r#"
        SELECT start_date as "start_date?"
        FROM activities
        WHERE user_id = $1
        ORDER BY start_date DESC
        LIMIT 1
        "#,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(row.and_then(|r| r.start_date))
}

pub async fn upsert_streams(
    pool: &PgPool,
    streams: &ActivityStreamsInsert,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO activity_streams
        (activity_id, time, latlng, altitude, velocity, heartrate, cadence, watts, distance, grade)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (activity_id) DO UPDATE SET
            time      = EXCLUDED.time,
            latlng    = EXCLUDED.latlng,
            altitude  = EXCLUDED.altitude,
            velocity  = EXCLUDED.velocity,
            heartrate = EXCLUDED.heartrate,
            cadence   = EXCLUDED.cadence,
            watts     = EXCLUDED.watts,
            distance  = EXCLUDED.distance,
            grade     = EXCLUDED.grade,
            fetched_at = NOW()
        "#,
        streams.activity_id,
        streams.time.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.latlng.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.altitude.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.velocity.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.heartrate.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.cadence.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.watts.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.distance.as_ref().map(|v| serde_json::to_value(v).unwrap()),
        streams.grade.as_ref().map(|v| serde_json::to_value(v).unwrap()),
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_all_strava_ids(
    pool: &PgPool,
    user_id: i64,
) -> Result<Vec<i64>, sqlx::Error> {
    let rows = sqlx::query!(
        "SELECT strava_activity_id FROM activities WHERE user_id = $1 ORDER BY start_date DESC",
        user_id
    )
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().map(|r| r.strava_activity_id).collect())
}

pub async fn get_streams(
    pool: &PgPool,
    activity_id: i64,
) -> Result<Option<ActivityStreamsRow>, sqlx::Error> {
    let row = sqlx::query_as!(
        ActivityStreamsRow,
        r#"
        SELECT
            activity_id,
            time,
            latlng,
            altitude,
            velocity,
            heartrate,
            cadence,
            watts,
            distance,
            grade
        FROM activity_streams
        WHERE activity_id = $1
        "#,
        activity_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(row)
}
