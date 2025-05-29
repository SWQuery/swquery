use axum::{extract::{Path, State}, http::StatusCode, Json};
use serde_json::Value;
use sqlx::PgPool;

pub const TWITTER_API_URL: &str = "https://api.twitter.com";

// Search Posts
// GET https://api.twitter.com/2/tweets/search/recent?query=Near%20Protocol&max_results=10&tweet.fields=created_at,author_id
// Authorization: Bearer YOUR_BEARER_TOKEN
// query should be a parameter for the method
pub async fn search_posts(
    Path(query): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let bearer = std::env::var("TWITTER_BEARER_TOKEN").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing TWITTER_BEARER_TOKEN environment variable".to_string(),
        )
    })?;

    let url = format!(
        "{}/2/tweets/search/recent?query={}&max_results=10&tweet.fields=created_at,author_id",
        TWITTER_API_URL, query
    );


    let resp = client
        .get(&url)
        .bearer_auth(&bearer)
        .send()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch posts".to_string()))?
        .json::<Value>()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;

    Ok(Json(resp))
}

// User Mention Timeline by Id
// curl --request GET \
//   --url https://api.twitter.com/2/users/{id}/mentions \
//   --header 'Authorization: Bearer <token>'
// pub fn user_mention_timeline()
pub async fn user_mention_timeline(
    Path(user_id): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let bearer = std::env::var("TWITTER_BEARER_TOKEN").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing TWITTER_BEARER_TOKEN environment variable".to_string(),
        )
    })?;

    let url = format!("{}/2/users/{}/mentions", TWITTER_API_URL, "1871356182830391296"); // Mocked User Id to not spend my request per day to get user id

    // if let Some(user_id) = fetch_user_by_username(&client, &bearer, &username).await {
        let resp = client
            .get(&url)
            .bearer_auth(&bearer)
            .send()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch mentions".to_string()))?
            .json::<Value>()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;
    // } else {
    //     Err((StatusCode::NOT_FOUND, "User not found".to_string()))
    // }

    Ok(Json(resp))
}

// User lookup by usernames
// curl --request GET \
//   --url https://api.twitter.com/2/users/by/username/{username} \
//   --header 'Authorization: Bearer <token>'
pub async fn get_user_by_username(Path(username): Path<String>) -> Result<Json<Value>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let bearer = std::env::var("TWITTER_BEARER_TOKEN").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing TWITTER_BEARER_TOKEN environment variable".to_string(),
        )
    })?;

    match fetch_user_by_username(&client, &bearer, &username).await {
        Some(json) => Ok(Json(json)),
        None => Err((StatusCode::NOT_FOUND, "User not found".to_string())),
    }
}

async fn fetch_user_by_username(
    client: &reqwest::Client,
    bearer: &str,
    username: &str,
) -> Option<Value> {
    let url = format!("{}/2/users/by/username/{}", TWITTER_API_URL, username);
    let resp = client
        .get(&url)
        .bearer_auth(bearer)
        .send()
        .await
        .ok()?
        .json::<serde_json::Value>()
        .await
        .ok()?;

    resp.get("data").cloned()
}

// Followers by User ID
// curl --request GET \
//   --url https://api.twitter.com/2/users/{id}/followers \
//   --header 'Authorization: Bearer <token>'
pub async fn get_followers_by_username(
    Path(username): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let bearer = std::env::var("TWITTER_BEARER_TOKEN").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing TWITTER_BEARER_TOKEN environment variable".to_string(),
        )
    })?;

    // if let Some(user_id) = fetch_user_by_username(&client, &bearer, &username).await {
        let url = format!("{}/2/users/{}/followers", TWITTER_API_URL, "1871356182830391296"); // Mocked User Id to not spend my request per day to get user id

        let resp = client
            .get(&url)
            .bearer_auth(&bearer)
            .send()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch followers".to_string()))?
            .json::<Value>()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;

        Ok(Json(resp))
    // } else {
    //     Err((StatusCode::NOT_FOUND, "User not found".to_string()))
    // }
}

// Following by User ID
// curl --request GET \
//   --url https://api.twitter.com/2/users/{id}/following \
//   --header 'Authorization: Bearer <token>'
pub async fn get_following_by_username(
    Path(username): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let bearer = std::env::var("TWITTER_BEARER_TOKEN").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing TWITTER_BEARER_TOKEN environment variable".to_string(),
        )
    })?;

    // if let Some(user_id) = fetch_user_by_username(&client, &bearer, &username).await {
        let url = format!("{}/2/users/{}/following", TWITTER_API_URL, "1871356182830391296"); // Mocked User Id to not spend my request per day to get user id

        let resp = client
            .get(&url)
            .bearer_auth(&bearer)
            .send()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch following".to_string()))?
            .json::<Value>()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;

        Ok(Json(resp))
    // } else {
    //     Err((StatusCode::NOT_FOUND, "User not found".to_string()))
    // }
}

// Returns User objects that are blocked by provided User ID
// curl --request GET \
//   --url https://api.twitter.com/2/users/{id}/blocking \
//   --header 'Authorization: Bearer <token>'
pub async fn get_blocked_by_username(
    Path(username): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let bearer = std::env::var("TWITTER_BEARER_TOKEN").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing TWITTER_BEARER_TOKEN environment variable".to_string(),
        )
    })?;

    // if let Some(user_id) = fetch_user_by_username(&client, &bearer, &username).await {
        let url = format!("{}/2/users/{}/blocking", TWITTER_API_URL, "1871356182830391296"); // Mocked User Id to not spend my request per day to get user id

        let resp = client
            .get(&url)
            .bearer_auth(&bearer)
            .send()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch blocked users".to_string()))?
            .json::<Value>()
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;

        Ok(Json(resp))
    // } else {
    //     Err((StatusCode::NOT_FOUND, "User not found".to_string()))
    // }
}

// Returns the Trend associated with the supplied WoeId.
// curl --request GET \
//   --url https://api.twitter.com/2/trends/by/woeid/{woeid} \
//   --header 'Authorization: Bearer <token>'
pub async fn get_trends_by_woeid(
    Path(woeid): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let client = reqwest::Client::new();
    let bearer = std::env::var("TWITTER_BEARER_TOKEN").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing TWITTER_BEARER_TOKEN environment variable".to_string(),
        )
    })?;

    let url = format!("{}/2/trends/by/woeid/{}", TWITTER_API_URL, "2450091"); // Mocked Woeid to the PoC

    let resp = client
        .get(&url)
        .bearer_auth(&bearer)
        .send()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch trends".to_string()))?
        .json::<Value>()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;

    Ok(Json(resp))
}