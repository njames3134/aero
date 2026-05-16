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

#[derive(Debug, Deserialize)]
pub struct SyncParams {
    #[serde(default)]
    pub force: bool,
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
    Query(params): Query<SyncParams>,
) -> Result<String, String> {
    let user_id = 1;

    let summary = state
        .strava
        .sync(user_id, params.force)
        .await
        .map_err(|e| e.to_string())?;

    println!("New: {}", summary.new);
    println!("Updated: {}", summary.updated);
    println!("Fetched: {}", summary.total_fetched);
    println!("Rate Limits: {:?}", summary.rate_limit);

    if params.force {
        Ok(format!("Backfilled laps for {} activities", summary.updated))
    } else {
        Ok("Synced Strava activities".to_string())
    }
}
