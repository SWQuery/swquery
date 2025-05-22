// User Mention Timeline by Id
pub fn user_mention_timeline() -> String {
    format!(
        "{}/1.1/statuses/user_mention_timeline.json",
        crate::twitter_api::TWITTER_API_URL
    )
}

// Recent Search
pub fn recent_search() -> String {
    format!(
        "{}/2/tweets/search/recent",
        crate::twitter_api::TWITTER_API_URL
    )
}

// User lookup by usernames
pub fn user_lookup_by_usernames() -> String {
    format!(
        "{}/2/users/by",
        crate::twitter_api::TWITTER_API_URL
    )
}

// Followers by User ID
pub fn followers_by_user_id() -> String {
    format!(
        "{}/2/users/:id/followers",
        crate::twitter_api::TWITTER_API_URL
    )
}

// Following by User ID
pub fn following_by_user_id() -> String {
    format!(
        "{}/2/users/:id/following",
        crate::twitter_api::TWITTER_API_URL
    )
}

// Returns User objects that are blocked by provided User ID
pub fn blocked_by_user_id() -> String {
    format!(
        "{}/2/users/:id/blocked",
        crate::twitter_api::TWITTER_API_URL
    )
}

// Engagement Metrics
// Returns the Trend associated with the supplied WoeId.