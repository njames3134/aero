use crate::db;
use sqlx::PgPool;
use crate::models::domain::activity::Activity;

#[derive(Clone)]
pub struct ActivityService {
    pub db: PgPool,
}

impl ActivityService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn get_activities(
        &self,
    ) -> Result<Vec<Activity>, sqlx::Error> {
        let rows = db::activities::fetch_all(&self.db).await?;

        Ok(rows.into_iter().map(Into::into).collect())
    }
}
