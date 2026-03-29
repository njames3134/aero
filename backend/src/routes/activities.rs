use axum::{Json, extract::State};
use crate::app_state::AppState;
use crate::models::activity::{Activity, CreateActivity};

pub async fn get_activities(
    State(state): State<AppState>,
) -> Json<Vec<Activity>> {
    let activities = crate::services::activities::get_activities(&state.db)
        .await
        .unwrap_or_default();

    Json(activities)
}

pub async fn create_activity(
    State(state): State<AppState>,
    Json(payload): Json<CreateActivity>,
) -> Json<Activity> {
    let activity = crate::services::activities::create_activity(
        &state.db,
        payload,
    )
    .await
    .unwrap();

    Json(activity)
}
