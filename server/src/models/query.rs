#[derive(Debug, Serialize, Deserialize)]
pub struct QueryRequest {
    pub input_user: String,
    pub address: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub helius_key: Option<String>,
}
