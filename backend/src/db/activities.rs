use crate::models::activity::{Activity, CreateActivity};

pub async fn fetch_all(pool: &sqlx::PgPool) -> Result<Vec<Activity>, sqlx::Error> {
    let activities = sqlx::query_as!(
        Activity,
        r#"
        SELECT id, user_id, name, type, distance, moving_time
        FROM activities
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(activities)
}

pub async fn insert(
    pool: &sqlx::PgPool,
    input: &CreateActivity,
) -> Result<Activity, sqlx::Error> {
    sqlx::query_as!(
        Activity,
        r#"
        INSERT INTO activities (user_id, name, type, distance, moving_time)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, name, type, distance, moving_time
        "#,
        input.user_id,
        input.name,
        input.r#type,
        input.distance,
        input.moving_time
    )
    .fetch_one(pool)
    .await
}
