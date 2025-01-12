// use axum::{
//     middleware::Next,
//     response::{IntoResponse, Response},
//     http::{Request, StatusCode},
//     body::Body,
// };
// use std::{
//     collections::HashMap,
//     sync::{Arc, Mutex},
//     time::{Duration, Instant},
// };

// pub struct RateLimiter {
//     requests: HashMap<String, (u32, Instant)>,
//     max_requests: u32,
//     window: Duration,
// }

// impl RateLimiter {
//     pub fn new(max_requests: u32, window: Duration) -> Self {
//         Self {
//             requests: HashMap::new(),
//             max_requests,
//             window,
//         }
//     }

//     pub fn check_rate_limit(&mut self, client_ip: &str) -> bool {
//         let now = Instant::now();
//         let entry = self.requests.entry(client_ip.to_string()).or_insert((0, now));

//         if now.duration_since(entry.1) > self.window {
//             entry.0 = 0;
//             entry.1 = now;
//         }

//         if entry.0 < self.max_requests {
//             entry.0 += 1;
//             true
//         } else {
//             false
//         }
//     }
// }

// pub async fn rate_limit<B>(
//     req: Request<B>,
//     state: Arc<Mutex<RateLimiter>>,
//     next: Next,
// ) -> Response where axum::body::Body: From<B> {
//     let client_ip = req
//         .headers()
//         .get("x-forwarded-for")
//         .and_then(|value| value.to_str().ok())
//         .unwrap_or("unknown");

//     let mut rate_limiter = state.lock().unwrap();

//     if rate_limiter.check_rate_limit(client_ip) {
//         let req = req.map(Body::from); 
//         next.run(req).await
//     } else {
//         (StatusCode::TOO_MANY_REQUESTS, "Too Many Requests").into_response()
//     }
// }
