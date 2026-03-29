use crate::db;
use crate::models::activity::{Activity, CreateActivity};

pub async fn get_activities(
    pool: &sqlx::PgPool,
) -> Result<Vec<crate::models::activity::Activity>, sqlx::Error> {
    db::activities::fetch_all(pool).await
}

pub fn validate_activity(input: &CreateActivity) -> Result<(), String> {
    if let Some(distance) = input.distance {
        if distance < 0.0 {
            return Err("Distance must be positive".into());
        }
    }

    if let Some(time) = input.moving_time {
        if time < 0 {
            return Err("Time must be positive".into());
        }
    }

    Ok(())
}

pub async fn create_activity(
    pool: &sqlx::PgPool,
    input: CreateActivity,
) -> Result<Activity, String> {
    validate_activity(&input)?;

    let activity = crate::db::activities::insert(pool, &input)
        .await
        .map_err(|e| e.to_string())?;

    Ok(activity)
}
