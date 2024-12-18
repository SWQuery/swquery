pub mod errors;
pub mod llm;
pub mod parser;

use {
    crate::errors::SdkError,
    reqwest::Client,
    serde_json::{json, Value},
    std::time::Duration,
    tracing::error,
};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct GetSignaturesForAddressResponse {
    result: Vec<Signature>,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Signature {
    block_time: u64,
    confirmation_status: String,
    err: Value,
    memo: Option<String>,
    signature: String,
    slot: u64,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct RecentTransaction {
    pub signature: String,
    pub slot: u64,
    pub timestamp: u64,
    pub status: String,
    // Add other relevant fields
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct RecentTransactionsResponse {
    pub jsonrpc: String,
    pub result: Vec<RecentTransaction>,
    pub id: u64,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct SignatureInfo {
    pub signature: String,
    pub slot: u64,
    #[allow(non_snake_case)]
    pub blockTime: Option<u64>,
    #[allow(non_snake_case)]
    pub confirmationStatus: String,
    pub err: Option<Value>,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)] // Added Serialize
pub struct SignaturesResponse {
    pub jsonrpc: String,
    pub result: Vec<SignatureInfo>,
    pub id: u64,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct AssetsResponse {
    pub jsonrpc: String,
    pub result: Vec<Asset>,
    pub id: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Asset {
    pub id: String,
    pub content: Value,
    pub ownership: Value,
}

/// [SWqueryClient](https://bretasarthur1.gitbook.io/swquery/) API client
pub struct SWqueryClient {
    pub api_key: String,
    pub helius_api_key: String,
    pub base_url: String,
    pub timeout: Duration,
}

impl SWqueryClient {
    pub fn new(api_key: String, helius_api_key: String, timeout: Option<Duration>) -> Self {
        SWqueryClient {
            api_key,
            helius_api_key,
            base_url: "http://0.0.0.0:5500/agent/generate-query".to_string(),
            timeout: timeout.unwrap_or(Duration::from_secs(5)),
        }
    }

    /// Query the SWQuery API
    /// # Arguments
    /// * `input` - Input query to send to the API
    /// # Returns
    /// * `Result<Value, SdkError>` - Result of the query
    pub async fn query(&self, input: &str, pubkey: &str) -> Result<Value, SdkError> {
        let client = Client::new();

        // Send the request to the Agent API
        let payload = json!({
            "inputUser": input,
            "address": pubkey
        });

        let response = client
            .post(&self.base_url)
            .header("x-api-key", &self.api_key)
            .json(&payload)
            .send()
            .await
            .map_err(|_| SdkError::RequestFailed)?;

        if !response.status().is_success() {
            error!("Agent API returned error status: {}", response.status());
            return Err(SdkError::ApiRequestFailed(response.status().to_string()));
        }

        // Log raw response for debugging
        let response_text = response.text().await.map_err(|e| {
            error!("Failed to get response text: {}", e);
            SdkError::ParseError(e.to_string())
        })?;
        println!("Raw response: {}", response_text);

        let result: Value = serde_json::from_str(&response_text).map_err(|e| {
            error!("Failed to parse Agent API response: {}", e);
            SdkError::ParseError(e.to_string())
        })?;
        println!("Parsed result: {:#?}", result);

        // Extract response type and params
        let response_type = result["result"]["response"]
            .as_str()
            .ok_or(SdkError::Unexpected("Missing response field".to_string()))?;
        println!("Response type: {}", response_type);

        let params = result["result"]
            .get("params")
            .ok_or(SdkError::InvalidInput(
                "Missing 'params' field in response.".to_string(),
            ))?;
        println!("Params: {:#?}", params);

        // Rest of the matching logic remains the same
        match response_type {
            "getRecentTransactions" => {
                let address = params
                    .get("address")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default();
                if address.is_empty() {
                    return Err(SdkError::InvalidInput(
                        "Missing address parameter".to_string(),
                    ));
                }
                // let days = params["days"].as_u64().unwrap_or(1);
                let days = params.get("days").and_then(|v| v.as_u64()).unwrap_or(1);

                Ok(serde_json::to_value(
                    self.get_recent_transactions(address, days)
                        .await
                        .map_err(|e| SdkError::Unexpected(e.to_string()))?,
                )
                .map_err(|e| SdkError::Unexpected(e.to_string()))?)
            }
            "getSignaturesForAddressPeriod" => {
                let address = params
                    .get("address")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default();
                if address.is_empty() {
                    return Err(SdkError::InvalidInput(
                        "Missing address parameter".to_string(),
                    ));
                }
                // let from = params["from"].as_u64().unwrap_or(0);
                let from: u64 = params.get("from").and_then(|v| v.as_u64()).unwrap_or(0);
                // let to = params["to"].as_u64().unwrap_or(0);
                let to: u64 = params.get("to").and_then(|v| v.as_u64()).unwrap_or(0);

                let response = self
                    .get_signatures_for_address_period(address, from, to)
                    .await
                    .map_err(|e| SdkError::Unexpected(e.to_string()))?;

                serde_json::to_value(response).map_err(|e| SdkError::Unexpected(e.to_string()))
            }
            "getSignaturesForAddress" => {
                let address = params["address"].as_str().ok_or(SdkError::InvalidInput(
                    "Missing address parameter".to_string(),
                ))?;

                let response = self
                    .get_signatures_for_address(address)
                    .await
                    .map_err(|e| SdkError::Unexpected(e.to_string()))?;

                serde_json::to_value(response).map_err(|e| SdkError::Unexpected(e.to_string()))
            }
            "getAssetsByOwner" => {
                let owner = params["owner"].as_str().ok_or(SdkError::InvalidInput(
                    "Missing owner parameter".to_string(),
                ))?;

                let response = self
                    .get_assets_by_owner(owner)
                    .await
                    .map_err(|e| SdkError::Unexpected(e.to_string()))?;

                serde_json::to_value(response).map_err(|e| SdkError::Unexpected(e.to_string()))
            }
            _ => Err(SdkError::Unexpected(format!(
                "Unsupported method: {}",
                response_type
            ))),
        }
    }

    /// Fetch recent transactions for the last 'n' days using Helius RPC
    pub async fn get_recent_transactions(
        &self,
        address: &str,
        days: u64,
    ) -> Result<RecentTransactionsResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Address cannot be empty".to_string(),
            ));
        }

        let client = Client::new();
        let url = format!(
            "https://mainnet.helius-rpc.com/?api-key={}",
            self.helius_api_key
        );

        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getRecentTransactions",
            "params": [
                address,
                days,
                { "commitment": "finalized" }
            ]
        });

        let response = client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| SdkError::NetworkError(e.to_string()))?;

        if response.status().is_success() {
            let result: RecentTransactionsResponse = response
                .json()
                .await
                .map_err(|e| SdkError::Unexpected(format!("Failed to parse response: {}", e)))?;
            Ok(result)
        } else {
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }

    /// Fetch signatures for a specific address within a time period
    pub async fn get_signatures_for_address_period(
        &self,
        address: &str,
        from: u64,
        to: u64,
    ) -> Result<SignaturesResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Address cannot be empty".to_string(),
            ));
        }

        let client = Client::new();
        let url = format!(
            "https://mainnet.helius-rpc.com/?api-key={}",
            self.helius_api_key
        );

        let payload = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getSignaturesForAddress",
            "params": [
                address,
                {
                    "before": to,
                    "after": from,
                    "commitment": "finalized"
                }
            ]
        });

        let response = client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| SdkError::NetworkError(e.to_string()))?;

        if response.status().is_success() {
            let result: SignaturesResponse = response
                .json()
                .await
                .map_err(|e| SdkError::Unexpected(format!("Failed to parse response: {}", e)))?;
            Ok(result)
        } else {
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }

    /// Fetch transaction signatures for a specific address.
    pub async fn get_signatures_for_address(
        &self,
        address: &str,
    ) -> Result<SignaturesResponse, SdkError> {
        if address.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Address cannot be empty".to_string(),
            ));
        }

        let client = Client::new();
        let url = format!(
            "https://mainnet.helius-rpc.com/?api-key={}",
            self.helius_api_key
        );

        let payload = json!({
            "jsonrpc": "2.0",
            "id": "1",
            "method": "getSignaturesForAddress",
            "params": [address]
        });

        let response = client
            .post(&url)
            .header("Content-Type", "application/json") // Added explicit content-type
            .json(&payload)
            .send()
            .await
            .map_err(|e| SdkError::NetworkError(format!("Failed to send request: {}", e)))?;

        if response.status().is_success() {
            let result: SignaturesResponse = response
                .json()
                .await
                .map_err(|e| SdkError::Unexpected(format!("Failed to parse response: {}", e)))?;

            Ok(result)
        } else {
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }

    /// Fetch assets owned by an address using Helius RPC
    pub async fn get_assets_by_owner(&self, owner: &str) -> Result<AssetsResponse, SdkError> {
        if owner.trim().is_empty() {
            return Err(SdkError::InvalidInput(
                "Owner address cannot be empty".to_string(),
            ));
        }

        let client = Client::new();
        let url = format!(
            "https://mainnet.helius-rpc.com/?api-key={}",
            self.helius_api_key
        );

        let payload = json!({
            "jsonrpc": "2.0",
            "id": "1",
            "method": "getAssetsByOwner",
            "params": [
                owner,
                { "page": 1 } // Default pagination
            ]
        });

        let response = client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| SdkError::NetworkError(format!("Failed to send request: {}", e)))?;

        if response.status().is_success() {
            let result: AssetsResponse = response
                .json()
                .await
                .map_err(|e| SdkError::Unexpected(format!("Failed to parse response: {}", e)))?;
            Ok(result)
        } else {
            Err(SdkError::ApiRequestFailed(response.status().to_string()))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_query_get_recent_transactions() {
        let client = SWqueryClient::new(
            "WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM".to_string(),
            "1f3f8151-4e8d-46c7-9555-22d4d8b38294".to_string(),
            None,
        );

        let result = client
            .query(
                "I want to get all my transactions",
                "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8",
            )
            .await;

        match result {
            Ok(response) => println!("Success: {:#?}", response),
            Err(e) => eprintln!("Error: {:?}", e),
        }
    }
}
