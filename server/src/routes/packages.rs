use {
    crate::models::{
        Package, PackageResponse, VerifyTransactionRequest, VerifyTransactionResponse, GetUserUsageRequest, GetUserUsageResponse, ChatQuantity
    },
    axum::{extract::State, http::{StatusCode, HeaderMap}, Json, extract::Path},
    rust_decimal::Decimal as DecimalType,
    solana_client::rpc_client::RpcClient,
    solana_sdk::{pubkey::Pubkey, signature::Signature},
    solana_transaction_status::UiTransactionEncoding,
    sqlx::PgPool,
    std::str::FromStr,
    std::time::Duration,
};

pub async fn get_packages(
    Path(pubkey): Path<String>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<PackageResponse>>, (StatusCode, String)> {
    let mut packages = sqlx::query_as::<_, Package>("SELECT * FROM packages")
        .fetch_all(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // If this is the free trial package, check if user has any transactions
    if packages.iter().any(|p| p.name == "Free Trial") {
        // First get the user_id from the pubkey
        let user_id = sqlx::query_scalar::<_, i32>("SELECT id FROM users WHERE pubkey = $1")
            .bind(&pubkey)
            .fetch_optional(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        if let Some(user_id) = user_id {
            let has_transactions = sqlx::query_scalar::<_, bool>(
                "SELECT EXISTS (SELECT 1 FROM transactions WHERE user_id = $1)",
            )
            .bind(user_id)
            .fetch_one(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            if has_transactions {
                // find where in the list the free trial package is and remove it
                if let Some(index) = packages.iter().position(|p| p.name == "Free Trial") {
                    packages.remove(index);
                }
            }
        }
    }

    // Convert Package to PackageResponse
    let package_responses = packages.into_iter()
        .map(|p| PackageResponse {
            id: p.id,
            name: p.name,
            description: p.description,
            price_usdc: p.price_usdc,
            requests_amount: p.requests_amount,
        })
        .collect::<Vec<PackageResponse>>();

    Ok(Json(package_responses))
}

pub async fn verify_transaction(
    State(pool): State<PgPool>,
    Json(payload): Json<VerifyTransactionRequest>,
) -> Result<(StatusCode, Json<VerifyTransactionResponse>), (StatusCode, String)> {
    // Get package details
    let package = get_package(&pool, payload.package_id).await?;

    // Get user ID
    let user_id = get_user_id(&pool, &payload.user_pubkey).await?;

    // Process the transaction
    process_transaction(&pool, user_id, &package, &payload.signature).await?;

    // Get updated credit balance
    let remaining_requests =
        sqlx::query_scalar::<_, i32>("SELECT remaining_requests FROM credits WHERE user_id = $1")
            .bind(user_id)
            .fetch_one(&pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((
        StatusCode::OK,
        Json(VerifyTransactionResponse {
            message: "Transaction verified successfully. Credits have been added to your account."
                .to_string(),
            remaining_requests: remaining_requests as i64,
            package_requests: package.requests_amount,
        }),
    ))
}

async fn get_package(pool: &PgPool, package_id: i32) -> Result<Package, (StatusCode, String)> {
    sqlx::query_as::<_, Package>("SELECT * FROM packages WHERE id = $1")
        .bind(package_id)
        .fetch_one(pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

async fn get_user_id(pool: &PgPool, pubkey: &str) -> Result<i32, (StatusCode, String)> {
    sqlx::query_scalar::<_, i32>("SELECT id FROM users WHERE pubkey = $1")
        .bind(pubkey)
        .fetch_optional(pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "User not found".to_string()))
}

async fn process_transaction(
    pool: &PgPool,
    user_id: i32,
    package: &Package,
    signature: &str,
) -> Result<(), (StatusCode, String)> {
    // Check if transaction already exists
    let existing_tx = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM transactions WHERE signature = $1)",
    )
    .bind(signature)
    .fetch_one(pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if existing_tx {
        return Err((
            StatusCode::CONFLICT,
            "This transaction has already been processed".to_string(),
        ));
    }

    // Verify the transaction first
    let is_valid = verify_solana_transaction(signature, package.price_usdc).await?;
    if !is_valid {
        return Err((
            StatusCode::BAD_REQUEST,
            "Invalid transaction amount".to_string(),
        ));
    }

    let mut tx = pool
        .begin()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Insert or update credits record
    sqlx::query(
        "INSERT INTO credits (user_id, remaining_requests) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id) 
         DO UPDATE SET remaining_requests = credits.remaining_requests + $2",
    )
    .bind(user_id)
    .bind(package.requests_amount)
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Insert transaction record
    sqlx::query(
        "INSERT INTO transactions (user_id, package_id, signature, status) VALUES ($1, $2, $3, $4)",
    )
    .bind(user_id)
    .bind(package.id)
    .bind(signature)
    .bind("completed")
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(())
}

async fn verify_solana_transaction(
    signature: &str,
    expected_amount: DecimalType,
) -> Result<bool, (StatusCode, String)> {
    const MAX_RETRIES: u32 = 20;
    const RETRY_DELAY_MS: u64 = 2000; // 2 seconds

    // Parse the signature
    let signature = Signature::from_str(signature).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            "Invalid signature format".to_string(),
        )
    })?;

    // Create RPC client
    let rpc_client = RpcClient::new(format!(
        "https://mainnet.helius-rpc.com/?api-key={}",
        std::env::var("TEST_HELIUS_API_KEY").unwrap_or_default()
    ));

    // The official SWQuery USDC receiving wallet
    let expected_recipient = Pubkey::from_str("BXVjUeXZ5GgbPvqCsUXdGz2G7zsg436GctEC3HkNLABK")
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Invalid recipient address".to_string(),
            )
        })?;

    let usdc_mint =
        Pubkey::from_str("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v").map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Invalid USDC mint".to_string(),
            )
        })?;

    for attempt in 0..MAX_RETRIES {
        match rpc_client.get_transaction(&signature, UiTransactionEncoding::Json) {
            Ok(transaction) => {
                if let Some(meta) = transaction.transaction.meta {
                    let pre_balances = meta.pre_token_balances.unwrap();
                    let post_balances = meta.post_token_balances.unwrap();

                    // Find the recipient's balance change
                    for (pre, post) in pre_balances.iter().zip(post_balances.iter()) {
                        let (mint, owner) = (&pre.mint, &post.owner);
                        if mint == &usdc_mint.to_string()
                            && owner.clone().unwrap() == expected_recipient.to_string()
                        {
                            let pre_amount = pre.ui_token_amount.ui_amount.unwrap_or(0.0);
                            let post_amount = post.ui_token_amount.ui_amount.unwrap_or(0.0);
                            let amount_change = (post_amount - pre_amount).abs();

                            println!("Found transfer to recipient: {} USDC", amount_change);
                            println!("Expected: {} USDC", expected_amount);
                            println!("Recipient: {:?}", owner);

                            // Compare with expected amount with some tolerance
                            if (rust_decimal::Decimal::try_from(amount_change).unwrap()
                                - expected_amount)
                                .abs()
                                < rust_decimal::Decimal::new(1, 2)
                            {
                                return Ok(true);
                            }
                        }
                    }
                }

                // If we found the transaction but amounts don't match
                if attempt == MAX_RETRIES - 1 {
                    return Ok(false);
                }
            }
            Err(e) => {
                println!(
                    "Attempt {}: Failed to fetch transaction: {}",
                    attempt + 1,
                    e
                );
                if attempt == MAX_RETRIES - 1 {
                    return Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to fetch transaction after {} attempts", MAX_RETRIES),
                    ));
                }
            }
        }

        // Wait before retrying
        tokio::time::sleep(Duration::from_millis(RETRY_DELAY_MS)).await;
    }

    Ok(false)
}

pub async fn get_user_usage(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<GetUserUsageResponse>, (StatusCode, String)> {
    let api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing API key".to_string()))?;

    // Get user ID via API key
    let user_id = sqlx::query_scalar::<_, i32>(
        "SELECT user_id FROM credits WHERE api_key = $1"
    ).bind(api_key)
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .ok_or((StatusCode::UNAUTHORIZED, "Invalid API key".to_string()))?;

    let remaining_requests = sqlx::query_scalar::<_, i32>(
        "SELECT remaining_requests FROM credits WHERE user_id = $1"
    ).bind(user_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let total_requests_bought = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(SUM(p.requests_amount), 0) FROM transactions t
        JOIN packages p ON t.package_id = p.id
        WHERE t.user_id = $1",
    ).bind(user_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let chats_quantity = sqlx::query_as::<_, ChatQuantity>(
        "SELECT DATE(created_at) AS chat_date, COUNT(*) AS chats_per_day
         FROM chats
         WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY chat_date
         ORDER BY chat_date DESC",
    ).bind(user_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(GetUserUsageResponse {
        remaining_requests: remaining_requests as i64,
        total_requests: total_requests_bought as i64,
        chats_per_day: chats_quantity,
    }))
}
