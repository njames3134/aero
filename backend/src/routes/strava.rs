use axum::{
    extract::{Query, State},
    response::Redirect,
};
use serde::Deserialize;
use crate::app_state::AppState;

#[derive(Debug, Deserialize)]
pub struct CallbackParams {
    pub code: String,
    pub state: Option<String>,
}

pub async fn callback_handler(
    Query(params): Query<CallbackParams>,
    State(state): State<AppState>,
) -> Redirect {
    let user_id = params
        .state
        .unwrap()
        .parse::<i64>()
        .unwrap();

    state
        .strava
        .handle_oauth_callback(user_id, params.code)
        .await
        .unwrap();

    Redirect::to("/success")
}

pub async fn sync_handler(
    State(state): State<AppState>,
) -> Result<String, String> {
    let user_id = 1;

    let summary = state.strava.sync(user_id)
        .await
        .map_err(|e| e.to_string())?;

    println!("New: {}", summary.new);
    println!("Updated: {}", summary.updated);
    println!("Fetched: {}", summary.total_fetched);
    println!("Rate Limits: {:?}", summary.rate_limit);

    Ok("Synced Strava activities".to_string())
}

// pub async fn get_activities_handler(
//     State(state): State<AppState>,
// ) -> Json<Vec<Activity>> {
//     let user_id = 1;
//
//     let activities = fetch_user_activities(&state, user_id)
//         .await
//         .unwrap();
//
//     Json(activities)
// }
