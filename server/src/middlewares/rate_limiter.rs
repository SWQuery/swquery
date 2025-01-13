use {
    axum::{
        body::Body,
        extract::State,
        http::{Request, StatusCode},
        middleware::Next,
        response::Response,
    },
    std::{
        collections::HashMap,
        sync::Arc,
        time::{Duration, Instant},
    },
    tokio::sync::Mutex,
};

#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<Mutex<HashMap<String, (Instant, u32)>>>,
    max_requests: u32,
    window_size: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: u32, window_size: Duration) -> Self {
        Self {
            requests: Arc::new(Mutex::new(HashMap::new())),
            max_requests,
            window_size,
        }
    }

    pub async fn check_rate_limit(&self, key: &str) -> bool {
        let mut requests = self.requests.lock().await;
        let now = Instant::now();

        if let Some((window_start, count)) = requests.get_mut(key) {
            if now.duration_since(*window_start) > self.window_size {
                *window_start = now;
                *count = 1;
                true
            } else if *count >= self.max_requests {
                false
            } else {
                *count += 1;
                true
            }
        } else {
            requests.insert(key.to_string(), (now, 1));
            true
        }
    }
}

pub async fn rate_limit_middleware(
    State(rate_limiter): State<RateLimiter>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let key = req
        .headers()
        .get("x-forwarded-for")
        .and_then(|hv| hv.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    if rate_limiter.check_rate_limit(&key).await {
        Ok(next.run(req).await)
    } else {
        Err(StatusCode::TOO_MANY_REQUESTS)
    }
}
