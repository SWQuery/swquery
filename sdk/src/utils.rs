use std::str::FromStr;

use crate::{errors::SdkError, models::*};
use reqwest::Client;
use serde::de::DeserializeOwned;
use serde_json::{json, Value};
use solana_sdk::pubkey::Pubkey;

const METAPLEX_PROGRAM_ID: &str = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

// Helper functions for parameter extraction
pub fn get_required_str_param<'a>(
    params: &'a serde_json::Value,
    field: &str,
) -> Result<&'a str, SdkError> {
    params[field]
        .as_str()
        .ok_or_else(|| SdkError::InvalidInput(format!("Missing {} parameter", field)))
}

pub fn get_optional_str_param<'a>(params: &'a serde_json::Value, field: &str) -> Option<&'a str> {
    params[field].as_str()
}

pub fn get_optional_u64_param(params: &serde_json::Value, field: &str, default: u64) -> u64 {
    params[field].as_u64().unwrap_or(default)
}

pub fn get_required_u64_param(params: &serde_json::Value, field: &str) -> Result<u64, SdkError> {
    params[field]
        .as_u64()
        .ok_or_else(|| SdkError::InvalidInput(format!("Missing {} parameter", field)))
}

// Helper to serialize response to Value
pub fn to_value_response<T: serde::Serialize>(response: T) -> Result<serde_json::Value, SdkError> {
    serde_json::to_value(response).map_err(|e| SdkError::Unexpected(e.to_string()))
}

/// Helper to validate address input
pub fn validate_address(address: &str) -> Result<(), SdkError> {
    if address.trim().is_empty() {
        return Err(SdkError::InvalidInput(
            "Address cannot be empty".to_string(),
        ));
    }
    Ok(())
}

/// Helper to filter by timestamp
pub fn is_within_timerange(timestamp: u64, from: Option<u64>, to: Option<u64>) -> bool {
    let mut include = true;

    if let Some(from_ts) = from {
        if timestamp < from_ts {
            include = false;
        }
    }

    if let Some(to_ts) = to {
        if timestamp > to_ts {
            include = false;
        }
    }

    include
}

/// Makes a generic RPC call
pub async fn make_rpc_call<T: DeserializeOwned>(
    client: &Client,
    url: &str,
    method: &str,
    params: Value,
) -> Result<T, SdkError> {
    let payload = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    });

    let response = client
        .post(url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| SdkError::NetworkError(e.to_string()))?;

    if !response.status().is_success() {
        return Err(SdkError::ApiRequestFailed(response.status().to_string()));
    }

    response
        .json()
        .await
        .map_err(|e| SdkError::ParseError(e.to_string()))
}

/// Helper to get block time for a slot
pub async fn get_block_time(client: &Client, url: &str, slot: u64) -> Result<u64, SdkError> {
    let block_time_payload = json!([slot]);

    let response: GetBlockTimeResponse =
        make_rpc_call(client, url, "getBlockTime", block_time_payload).await?;

    Ok(response.result.unwrap_or(0))
}

/// Helper to get signatures for address
pub async fn get_signatures(
    client: &Client,
    url: &str,
    address: &str,
) -> Result<SignaturesResponse, SdkError> {
    let payload = json!([
        address,
        { "commitment": "finalized" }
    ]);

    make_rpc_call(client, url, "getSignaturesForAddress", payload).await
}

pub async fn get_balance(
    client: &Client,
    url: &str,
    address: &str,
) -> Result<SignaturesResponse, SdkError> {
    let payload = json!([address]);

    make_rpc_call(client, url, "getBalance", payload).await
}

/// Helper to get transaction details
pub async fn get_transaction_details(
    client: &Client,
    url: &str,
    signature: &str,
) -> Result<GetTransactionResponse, SdkError> {
    let payload = json!([
        signature,
        {
            "encoding": "json",
            "maxSupportedTransactionVersion": 0
        }
    ]);

    make_rpc_call(client, url, "getTransaction", payload).await
}

/// Helper to get transaction details with additional info
pub async fn get_transaction_details_with_info(
    client: &Client,
    url: &str,
    signature: &str,
) -> Result<FullTransaction, SdkError> {
    let response = get_transaction_details(client, url, signature).await?;
    let transaction_result = response.result;

    Ok(FullTransaction {
        signature: transaction_result.transaction.signatures[0].clone(),
        slot: transaction_result.slot,
        timestamp: transaction_result.blockTime.unwrap_or_default(),
        status: transaction_result
            .meta
            .as_ref()
            .map_or("unknown".to_string(), |m| {
                if m.err.is_some() { "failed" } else { "success" }.to_string()
            }),
        details: transaction_result,
    })
}

fn get_metadata_account(mint: &Pubkey) -> Pubkey {
    let metaplex_program_id = Pubkey::from_str(METAPLEX_PROGRAM_ID).unwrap();
    let seeds = &[b"metadata", metaplex_program_id.as_ref(), mint.as_ref()];
    Pubkey::find_program_address(seeds, &metaplex_program_id).0
}

pub async fn get_token_account_balance(
    client: &Client,
    url: &str,
    address: &str,
) -> Result<SignaturesResponse, SdkError> {
    let payload = json!([address]);

    make_rpc_call(client, url, "getBalance", payload).await
}