mod db;
mod app;
mod routes;
mod services;
mod models;
mod app_state;
use app_state::AppState;

#[tokio::main]
async fn main() {
    let pool = db::init_pool().await;

    let state = AppState {
        db: pool,
    };

    let app = app::create_app(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Server running on http://{}", addr);

    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
