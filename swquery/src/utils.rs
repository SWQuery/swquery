use {
    crate::{errors::SdkError, models::*},
    reqwest::Client,
    serde::de::DeserializeOwned,
    serde_json::{json, Value},
    solana_sdk::{native_token::LAMPORTS_PER_SOL, pubkey::Pubkey},
    std::{
        collections::{HashMap, HashSet},
        str::FromStr,
    },
};

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

pub async fn get_transaction_details_with_info(
    client: &Client,
    url: &str,
    signature: &str,
    wallet_address: &str,
) -> Result<FullTransaction, SdkError> {
    let response = get_transaction_details(client, url, signature).await?;
    let transaction_result = response.result;

    let mut token_metadata_map = HashMap::new();
    let mut transfers = Vec::new();
    let mut fee_payer = None;
    let mut fee_amount = 0;

    if let Some(meta) = &transaction_result.meta {
        // Determine fee payer and fees
        fee_amount = meta.fee.unwrap_or(0);
        if let Some(inner_instructions) = meta.innerInstructions.get(0) {
            if let Some(fee_payer_key) = inner_instructions["accountKeys"][0].as_str() {
                fee_payer = Some(fee_payer_key.to_string());
            }
        }

        let mints: HashSet<String> = meta
            .postTokenBalances
            .iter()
            .chain(meta.preTokenBalances.iter())
            .filter_map(|balance| balance.get("mint")?.as_str().map(|s| s.to_string()))
            .collect();

        // Fetch metadata for each mint
        for mint in mints {
            if let Ok(metadata) = get_asset_metadata(client, url, &mint).await {
                token_metadata_map.insert(mint.clone(), metadata);
            }
        }

        // Track transfers for the user's wallet
        let mut account_balance_map = HashMap::new();

        for balance in &meta.preTokenBalances {
            if let (Some(account), Some(mint)) = (
                balance.get("owner").and_then(|v| v.as_str()),
                balance.get("mint").and_then(|v| v.as_str()),
            ) {
                let amount = balance["uiTokenAmount"]["uiAmount"].as_f64().unwrap_or(0.0);
                account_balance_map.insert((account.to_string(), mint.to_string()), -amount);
            }
        }

        for balance in &meta.postTokenBalances {
            if let (Some(account), Some(mint)) = (
                balance.get("owner").and_then(|v| v.as_str()),
                balance.get("mint").and_then(|v| v.as_str()),
            ) {
                let amount = balance["uiTokenAmount"]["uiAmount"].as_f64().unwrap_or(0.0);
                *account_balance_map
                    .entry((account.to_string(), mint.to_string()))
                    .or_insert(0.0) += amount;
            }
        }

        // Filter transfers for the user's wallet
        for ((account, mint), delta) in account_balance_map {
            if account == wallet_address && delta != 0.0 {
                transfers.push(json!({
                    "mint": mint,
                    "amount": format!("{:.6}", delta.abs()),
                    "decimals": 6,
                    "metadata": token_metadata_map.get(&mint),
                    "direction": if delta > 0.0 { "in" } else { "out" },
                }));
            }
        }

        // Handle SOL transfers
        let mut total_sol_change = 0.0;
        for (pre_sol, post_sol) in meta.preBalances.iter().zip(meta.postBalances.iter()) {
            let amount_diff = (*post_sol as f64 - *pre_sol as f64) / LAMPORTS_PER_SOL as f64;
            if amount_diff != 0.0 {
                if amount_diff > 0.0 {
                    total_sol_change += amount_diff;
                } else {
                    total_sol_change += amount_diff;
                }
            }
        }

        if total_sol_change != 0.0 {
            transfers.push(json!({
                "mint": "SOL",
                "amount": format!("{:.9}", total_sol_change.abs()),
                "decimals": 9,
                "metadata": null,
                "direction": if total_sol_change > 0.0 { "in" } else { "out" },
            }));
        }
    }

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
        details: json!({
            "fee_payer": fee_payer,
            "fee_amount": fee_amount,
            "transfers": transfers,
        }),
        token_metadata: token_metadata_map,
    })
}

pub async fn get_asset_metadata(client: &Client, url: &str, mint: &str) -> Result<Value, SdkError> {
    let payload = json!([mint]);
    let response: Value = make_rpc_call(client, url, "getAsset", payload).await?;

    if let Some(result) = response.get("result") {
        match result {
            Value::Array(assets) if !assets.is_empty() => {
                Ok(assets[0].get("content").cloned().unwrap_or_default())
            }
            Value::Object(_) => {
                // If result is a single object, return it directly
                Ok(result.get("content").cloned().unwrap_or_default())
            }
            _ => Err(SdkError::Unexpected(format!(
                "Unexpected asset format for mint: {}",
                mint
            ))),
        }
    } else {
        Err(SdkError::Unexpected(format!(
            "No metadata found for mint: {}",
            mint
        )))
    }
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

/// Extracts the total amount from a transaction's details.
///
/// # Arguments
///
/// * `details` - The `Value` containing transaction details.
///
/// # Returns
///
/// The total amount transferred as a `f64`.
pub fn extract_total_amount(details: &serde_json::Value) -> f64 {
    details["transfers"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .map(|transfer| {
            transfer["amount"]
                .as_str()
                .unwrap_or("0")
                .parse::<f64>()
                .unwrap_or(0.0)
        })
        .sum()
}
