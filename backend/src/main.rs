mod db;
mod app;
mod routes;
mod services;
mod models;
mod app_state;

use app_state::AppState;
use tokio::net::TcpListener;
use crate::services::strava_service::StravaService;
use crate::services::activities::ActivityService;

#[tokio::main]
async fn main() {
    let pool = db::init_pool().await;

    let state = AppState {
        activity: ActivityService::new(pool.clone()),
        strava: StravaService::new(pool.clone()),
    };

    let auth_url = format!(
        "https://www.strava.com/oauth/authorize?client_id={}&redirect_uri=http://localhost:3000/callback&response_type=code&scope=read,activity:read,activity:read_all&state=1",
        state.strava.client.client_id
    );

    println!("{}", auth_url);

    let app = app::create_app(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Server running on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .await
        .unwrap();

}
