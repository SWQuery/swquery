pub mod errors;
pub mod llm;
pub mod parser;

use crate::errors::SdkError;
use futures::future::join_all;
use reqwest::Client;
use serde_json::{json, Value};
use std::time::Duration;
use tracing::{error, info};

#[derive(Debug)]
enum QueryType {
    QueryWallet,
    QueryMultipleWallets,
}

impl QueryType {
    fn as_str(&self) -> &str {
        match self {
            QueryType::QueryWallet => "query_wallet",
            QueryType::QueryMultipleWallets => "query_multiple_wallets",
        }
    }
}

/// [SWqueryClient](https://bretasarthur1.gitbook.io/swquery/) API client
pub struct SWqueryClient {
    pub api_key: String,
    pub base_url: String,
    pub timeout: Duration,
}

impl SWqueryClient {
    /// Create a new [SWqueryClient](https://bretasarthur1.gitbook.io/swquery/) instance
    /// # Arguments
    /// * `api_key` - API key for the SWQuery API
    /// * `timeout` - Optional timeout for requests
    /// # Returns
    /// * `SWqueryClient` - A new SWqueryClient instance
    /// # Example
    /// ```
    /// use swquery_sdk::SWqueryClient;
    /// let client = SWqueryClient::new("test_api_key".to_string(), None);
    /// ```
    pub fn new(api_key: String, timeout: Option<Duration>) -> Self {
        SWqueryClient {
            api_key,
            base_url: "http://localhost:5500/agent/generate-query".to_string(),
            timeout: timeout.unwrap_or(Duration::from_secs(5)),
        }
    }

    /// Query the SWQuery API
    /// # Arguments
    /// * `input` - Input query to send to the API
    /// # Returns
    /// * `Result<Value, SdkError>` - Result of the query
    /// # Example
    pub async fn query(&self, input: &str, pubkey: &str) -> Result<Value, SdkError> {
        let client = Client::new();
        let payload = json!({
            "inputUser": input,
            "address": pubkey
        });
        let response = client
            .post(format!("{}/agent/generate-query", self.base_url))
            .timeout(self.timeout)
            .header("Authorization ", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await
            .expect("Failed to send request");

        if response.status().is_success() {
            let result = response.json::<Value>().await.map_err(|e| {
                error!("Failed to parse response: {}", e);
                SdkError::Unexpected(e.to_string())
            })?;

            let method_str = result["result"]["response"].as_str().unwrap_or("");
            let method = match method_str {
                "query_wallet" => QueryType::QueryWallet,
                "query_multiple_wallets" => QueryType::QueryMultipleWallets,
                _ => {
                    error!("Unexpected response from API: {:?}", result);
                    return Err(SdkError::Unexpected("Unexpected response".to_string()));
                }
            };
            info!("Query type: {}", method.as_str());

            match method {
                QueryType::QueryWallet => {
                    let wallet_address = result["result"]["params"]["wallet_address"]
                        .as_str()
                        .unwrap_or("");
                    let query = result["result"]["params"]["query"].as_str().unwrap_or("");
                    self.query_wallet(wallet_address, query).await
                }
                QueryType::QueryMultipleWallets => {
                    let vec = Vec::new();
                    let wallets_array = result["result"]["params"]["wallets"]
                        .as_array()
                        .unwrap_or(&vec);
                    let wallets = wallets_array
                        .iter()
                        .map(|wallet| wallet.as_str().unwrap_or(""))
                        .collect();
                    let query = result["result"]["params"]["query"].as_str().unwrap_or("");
                    self.query_multiple_wallets(wallets, query).await
                }
            }
        } else {
            error!("API returned error status: {}", response.status());
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }

    async fn query_wallet(&self, wallet_address: &str, query: &str) -> Result<Value, SdkError> {
        todo!()
    }

    async fn query_multiple_wallets(
        &self,
        wallets: Vec<&str>,
        query: &str,
    ) -> Result<Value, SdkError> {
        todo!()
    }
}
