use sqlx::PgPool;
use crate::models::db::strava::StravaTokenRow;

pub async fn save_token(
    pool: &PgPool,
    token: StravaTokenRow,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO strava_tokens (
            user_id,
            access_token,
            refresh_token,
            expires_at,
            scope
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id)
        DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            expires_at = EXCLUDED.expires_at,
            scope = EXCLUDED.scope,
            updated_at = NOW()
        "#,
        token.user_id,
        token.access_token,
        token.refresh_token,
        token.expires_at,
        token.scope
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_token(
    pool: &PgPool,
    user_id: i64,
) -> Result<Option<StravaTokenRow>, sqlx::Error> {
    let result = sqlx::query_as!(
        StravaTokenRow,
        r#"
        SELECT user_id, access_token, refresh_token, expires_at, scope
        FROM strava_tokens
        WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(result)
}
