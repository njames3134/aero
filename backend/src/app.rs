use axum::{Router};
use axum::routing::get;
use crate::routes::activities::{get_activities, create_activity};
use crate::app_state::AppState;

pub fn create_app(state: AppState) -> Router {
    Router::new()
        .route("/activities", get(get_activities).post(create_activity))
        .with_state(state)
}
