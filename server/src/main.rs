mod db;
mod middlewares;
mod models;
mod routes;
mod utils;

use {
    axum::{
        http::Method,
        middleware::from_fn_with_state,
        routing::{get, post},
        Router,
    },
    db::connect,
    dotenvy::dotenv,
    routes::{
        agent::{generate_query, generate_report},
        chatbot::{chatbot_interact, get_chat_by_id, get_chats_for_user},
        credits::{buy_credits, refund_credits},
        packages::{get_packages, get_user_usage, verify_transaction},
        users::{create_user, get_usage, get_user_by_pubkey, get_users, manage_subscription},
        token::{get_token_info, analyze_rug_pull_risk},
        social::{get_user_by_username, get_followers_by_username, get_following_by_username, get_blocked_by_username, search_posts, user_mention_timeline, get_trends_by_woeid},
    },
    std::time::Duration,
    tower_http::cors::{Any, CorsLayer},
};

// pub const AGENT_API_URL: &str = "http://agent:8000";
pub const AGENT_API_URL: &str = "http://localhost:8000";

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let pool = connect().await;

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let rate_limiter = middlewares::rate_limiter::RateLimiter::new(100, Duration::from_secs(60));

    let agent_router = Router::new()
        .route("/generate-query", post(generate_query))
        .route("/generate-report", post(generate_report));
    let chatbot_router = Router::new()
        .route("/interact", post(chatbot_interact))
        .route("/chats", get(get_chats_for_user))
        .route("/chats/:id", get(get_chat_by_id));
    let users_router = Router::new()
        .route("/", get(get_users).post(create_user))
        .route("/:pubkey", get(get_user_by_pubkey))
        .route("/:pubkey/subscriptions", post(manage_subscription))
        .route("/usage", post(get_user_usage))
        .route("/:pubkey/usage", get(get_usage));
    let token_router = Router::new()
        .route("/token_info/:name", get(get_token_info))
        .route("/analyze_rug_pull_risk", post(analyze_rug_pull_risk));
    let social_router = Router::new()
        .route("/user/:username", get(get_user_by_username))
        .route("/user/:username/followers", get(get_followers_by_username))
        .route("/user/:username/following", get(get_following_by_username))
        .route("/user/:username/blocked", get(get_blocked_by_username))
        .route("/search/:query", get(search_posts))
        .route("/mentions/:user_id", get(user_mention_timeline))
        .route("/trends/:woeid", get(get_trends_by_woeid));

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        // .route("/credits/buy", post(buy_credits))
        // .route("/credits/refund", post(refund_credits))
        .route("/packages/:pubkey", get(get_packages))
        .route("/packages/verify", post(verify_transaction))
        .nest("/agent", agent_router)
        .nest("/chatbot", chatbot_router)
        .nest("/users", users_router)
        .nest("/token", token_router)
        .nest("/social", social_router)
        .route("/:api_key/helius", get(|| async { "ok" }))
        .with_state(pool)
        .layer(cors)
        .layer(from_fn_with_state(
            rate_limiter.clone(),
            middlewares::rate_limiter::rate_limit_middleware,
        ));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5500").await.unwrap();

    println!("Listening on: http://{}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}
