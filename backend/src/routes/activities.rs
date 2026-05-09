use axum::{Json, extract::State, http::StatusCode};
use crate::app_state::AppState;
use crate::models::domain::activity::{Activity, ActivityStreams};
use axum::{extract::Path};

pub async fn get_activities(
    State(state): State<AppState>,
) -> Result<Json<Vec<Activity>>, StatusCode> {
    let activities = state
        .activity
        .get_activities()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(activities))
}

pub async fn get_activity(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Activity>, StatusCode> {
    let activity = crate::db::activities::get_by_id(&state.activity.db, id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match activity {
        Some(row) => {
            let domain: Activity = row.into();
            Ok(Json(domain))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn get_streams(
    State(state): State<AppState>,
    Path(activity_id): Path<i64>,
) -> Result<Json<ActivityStreams>, StatusCode> {
    let streams = crate::db::activities::get_streams(&state.activity.db, activity_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match streams {
        Some(row) => {
            let domain: ActivityStreams = row.into();
            Ok(Json(domain))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}
