mod db;
mod models;
mod routes;

use {
    axum::{
        routing::{get, post},
        Router,
    },
    db::connect,
    dotenvy::dotenv,
    routes::{agent::generate_query, credits::*, users::*},
};

pub const AGENT_API_URL: &str = "http://localhost:8000";

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let pool = connect().await;

    let agent_router = Router::new().route("/generate-query", post(generate_query));
    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/users", get(get_users).post(create_user))
        .route("/credits/buy", post(buy_credits))
        .route("/credits/refund", post(refund_credits))
        .nest("/agent", agent_router)
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5500").await.unwrap();

    println!("Listening on: http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {}
