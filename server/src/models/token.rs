use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct CreateTokenRequest {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image_path: String,
    pub twitter: String,
    pub telegram: String,
    pub website: String,
}

#[derive(Serialize)]
pub struct CreateTokenResponse {
    pub transaction_url: String,
}
