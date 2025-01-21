use {
    futures_util::{SinkExt, StreamExt},
    serde_json::json,
    tokio_tungstenite::{connect_async, tungstenite::Message},
};

pub const WEBSOCKET_URL: &str = "wss://pumpportal.fun/api/data";

pub async fn manage_websocket() {
    match connect_async(WEBSOCKET_URL).await {
        Ok((mut ws_stream, _)) => {
            println!("Connected to WebSocket!");

            let subscribe_new_token = json!({ "method": "subscribeNewToken" });
            let subscribe_account_trade = json!({
                "method": "subscribeAccountTrade",
                "keys": ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"]
            });
            let subscribe_token_trade = json!({
                "method": "subscribeTokenTrade",
                "keys": ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"]
            });

            ws_stream
                .send(Message::Text(subscribe_new_token.to_string()))
                .await
                .expect("Failed to send subscribeNewToken");
            ws_stream
                .send(Message::Text(subscribe_account_trade.to_string()))
                .await
                .expect("Failed to send subscribeAccountTrade");
            ws_stream
                .send(Message::Text(subscribe_token_trade.to_string()))
                .await
                .expect("Failed to send subscribeTokenTrade");

            while let Some(msg) = ws_stream.next().await {
                match msg {
                    Ok(Message::Text(text)) => {
                        println!("Received WebSocket message: {}", text);
                    }
                    Ok(_) => {}
                    Err(e) => {
                        eprintln!("Error in WebSocket connection: {}", e);
                        break;
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("Failed to connect to WebSocket: {}", e);
        }
    }
}
