# SWQuery SDK

SWQuery is an SDK designed to streamline interaction with Solana blockchain data using enhanced RPC calls. It leverages Helius RPC and integrates with a custom Agent API to provide powerful querying capabilities for developers building Solana-based applications.

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Examples](#examples)
-   [API Reference](#api-reference)
-   [Error Handling](#error-handling)
-   [Contributing](#contributing)
-   [License](#license)

---

## Overview

The SWQuery SDK simplifies querying Solana blockchain data by offering high-level methods to interact with Solana's RPC API. It automates fetching and aggregating transaction data, token balances, and account states, making it ideal for developers building analytics, dashboards, and dApps on Solana.

## Features

-   **Solana RPC Integration** – Provides easy access to Solana's RPC endpoints via Helius.
-   **Agent API** – Translates natural language queries into structured Solana RPC calls.
-   **Token and NFT Metadata** – Extracts token metadata for enhanced transaction analysis.
-   **Account-Level Token Flow** – Tracks SPL token transfers per account, ensuring accurate balance changes.
-   **Error Handling** – Graceful handling of network errors, API failures, and invalid inputs.

## Installation

To integrate the SWQuery SDK into your project:

```bash
cargo add swquery
```

Alternatively, add it manually to your `Cargo.toml`:

```toml
[dependencies]
swquery = "0.0.2"
```

Then, run:

```bash
cargo build
```

## Usage

To begin using the SDK, instantiate the `SWqueryClient` with your API keys:

```rust
use swquery::SWqueryClient;
use std::time::Duration;

#[tokio::main]
async fn main() {
    let client = SWqueryClient::new(
        "YOUR_AGENT_API_KEY".to_string(),
        "YOUR_HELIUS_API_KEY".to_string(),
        Some(Duration::from_secs(10)),
        None,
    );

    let response = client
        .query("Get recent transactions for this wallet", "YourWalletAddress")
        .await
        .unwrap();

    println!("Response: {:#?}", response);
}
```

---

## API Reference

### SWqueryClient

-   `new(api_key: String, helius_api_key: String, timeout: Option<Duration>, network: Option<Network>) -> Self`  
     Instantiates a new SWqueryClient with optional timeout and network parameters.

-   `query(input: &str, pubkey: &str) -> Result<Value, SdkError>`  
     Sends a query to the Agent API and fetches data from Solana.

---

## Error Handling

SWQuery SDK returns structured errors using the `SdkError` enum, which includes:

-   `InvalidInput(String)` – Raised when input parameters are missing or invalid.
-   `NetworkError(String)` – Triggered by network-related issues.
-   `ApiRequestFailed(String)` – Indicates a failure from the Agent or Helius RPC.
-   `ParseError(String)` – Raised when parsing responses fails.

Example:

```rust
match client.get_recent_transactions("InvalidAddress", 7).await {
    Ok(transactions) => println!("Fetched transactions: {:?}", transactions),
    Err(e) => eprintln!("Error: {:?}", e),
}
```

---

## License

This project is licensed under the [MIT License](LICENSE).
