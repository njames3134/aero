use axum::{Router, routing::{get, post}};
use crate::routes::activities::{get_activities, get_activity, get_streams};
use crate::routes::strava::{callback_handler, sync_handler};
use crate::app_state::AppState;

pub fn create_app(state: AppState) -> Router {
    Router::new()
        .route("/activities", get(get_activities))
        .route("/activities/:id", get(get_activity))
        .route("/activities/:id/streams", get(get_streams))
        .route("/callback", get(callback_handler))
        .route("/strava/sync", post(sync_handler))
        .with_state(state)
}
