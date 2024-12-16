mod db;
mod models;
mod routes;

use axum::{
    routing::{get, post},
    Router,
};
use db::connect;
use dotenvy::dotenv;
use routes::{credits::*, users::*};

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let pool = connect().await;
    // let shared_pool = Arc::new(pool);

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/users", get(get_users).post(create_user))
        .route("/credits/buy", post(buy_credits))
        .route("/credits/refund", post(refund_credits))
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5500").await.unwrap();

    println!("Listening on: http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{self, Request, StatusCode},
    };
    use http_body_util::BodyExt;
    use serde_json::{json, Value};
    use solana_sdk::pubkey::Pubkey;
    use sqlx::{postgres::PgPoolOptions, PgPool};
    use tower::ServiceExt;

    async fn setup_test_db() -> PgPool {
        dotenvy::dotenv().ok();
        let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("Failed to connect to test database");

        // Clean up existing data
        sqlx::query!("TRUNCATE TABLE credits, users CASCADE")
            .execute(&pool)
            .await
            .unwrap();

        pool
    }

    #[tokio::test]
    async fn test_create_user() {
        let unique_pubkey = Pubkey::new_unique().to_string(); // Convert Pubkey to String

        let app = Router::new()
            .route("/users", post(create_user))
            .with_state(setup_test_db().await);

        let response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/users")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from(
                        serde_json::to_vec(&json!({
                            "pubkey": unique_pubkey
                        }))
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        println!("Response: {:?} | {}", response.body(), response.status());
        assert_eq!(response.status(), StatusCode::CREATED);

        let body = response.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&body).unwrap();

        assert_eq!(body["pubkey"].as_str().unwrap(), unique_pubkey);
        assert!(body["id"].as_i64().is_some());
    }

    #[tokio::test]
    async fn test_buy_credits() {
        let pool = setup_test_db().await;
        let pubkey = Pubkey::new_unique().to_string(); // Convert Pubkey to String

        let app = Router::new()
            .route("/users", post(create_user))
            .route("/credits/buy", post(buy_credits))
            .with_state(pool.clone());

        // Create user first
        let user_response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/users")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from(
                        serde_json::to_vec(&json!({
                            "pubkey": pubkey
                        }))
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        println!(
            "User response: {:?} | {:?}",
            user_response.body(),
            user_response.status()
        );
        assert_eq!(user_response.status(), StatusCode::CREATED);

        // Buy credits
        let credits_to_buy = 100;
        let buy_response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/credits/buy")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from(
                        serde_json::to_vec(&json!({
                            "user_pubkey": pubkey,
                            "amount": credits_to_buy
                        }))
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        println!(
            "Buy response: {:?} | {:?}",
            buy_response.body(),
            buy_response.status()
        );
        assert_eq!(buy_response.status(), StatusCode::CREATED);
    }

    #[tokio::test]
    async fn test_refund_credits() {
        let pool = setup_test_db().await;
        let pubkey = Pubkey::new_unique().to_string();

        let app = Router::new()
            .route("/users", post(create_user))
            .route("/credits/buy", post(buy_credits))
            .route("/credits/refund", post(refund_credits))
            .with_state(pool.clone());

        // 1. Create user
        let create_response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/users")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from(
                        serde_json::to_vec(&json!({
                            "pubkey": pubkey
                        }))
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(create_response.status(), StatusCode::CREATED);

        // 2. Buy credits
        let buy_response = app
            .clone()
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/credits/buy")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from(
                        serde_json::to_vec(&json!({
                            "user_pubkey": pubkey,
                            "amount": 100
                        }))
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(buy_response.status(), StatusCode::CREATED);

        // 3. Refund credits
        let refund_response = app
            .oneshot(
                Request::builder()
                    .method(http::Method::POST)
                    .uri("/credits/refund")
                    .header(http::header::CONTENT_TYPE, "application/json")
                    .body(Body::from(
                        serde_json::to_vec(&json!({
                            "user_pubkey": pubkey,
                            "amount": 50
                        }))
                        .unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        println!(
            "Refund response: {:?} | {:?}",
            refund_response.body(),
            refund_response.status()
        );

        assert_eq!(refund_response.status(), StatusCode::CREATED);

        let body = refund_response
            .into_body()
            .collect()
            .await
            .unwrap()
            .to_bytes();
        let body: Value = serde_json::from_slice(&body).unwrap();

        assert_eq!(body["user_pubkey"].as_str().unwrap(), pubkey);
        assert_eq!(body["new_balance"].as_i64().unwrap(), 50);
    }
}
