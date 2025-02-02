#!/bin/bash

# Load environment variables from .env
set -a
source .env
set +a

# Debug: Check if variables were loaded
echo "TEST_API_KEY: $TEST_API_KEY"
echo "TEST_HELIUS_API_KEY: $TEST_HELIUS_API_KEY"
echo "TEST_OPENAI_API_KEY: $TEST_OPENAI_API_KEY"

BASE_URL="http://localhost:5500"
API_KEY="$TEST_API_KEY"
TEST_PUBKEY="9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3"

check_response() {
  local response="$1"
  local status="$2"
  local expected="$3"
  
  echo "Response: $response"
  
  if [[ "$status" -eq "$expected" ]]; then
    echo "✅ Test passed"
  else
    echo "❌ Test failed (Expected: $expected, Got: $status)"
    exit 1
  fi
}

# Generate a unique transaction signature using timestamp and random string
generate_signature() {
  local timestamp=$(date +%s)
  local random_string=$(cat /dev/urandom | LC_ALL=C tr -dc 'A-Za-z0-9' | head -c 32)
  echo "${timestamp}${random_string}"
}

# Test health endpoint
echo "Testing /health..."
curl -X GET "$BASE_URL/health"
echo

# Test create user
echo "Creating user..."
response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -X POST -d "{
    \"pubkey\": \"$TEST_PUBKEY\"
}" "$BASE_URL/users")
status=$(echo "$response" | tail -n1)
if [[ "$status" != "201" && "$status" != "200" ]]; then
    echo "❌ Test failed (Expected: 201 or 200, Got: $status)"
    exit 1
fi
echo "✅ Test passed"

# Test get users
echo "Fetching users..."
curl -X GET "$BASE_URL/users"
echo

# Test get packages
echo "Fetching packages..."
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/packages/$TEST_PUBKEY")
status=$(echo "$response" | tail -n1)
check_response "$response" "$status" 200

# # Test verify transaction with real signature
# echo "Verifying transaction..."
# response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -X POST -d '{
#   "package_id": 1,
#   "signature": "3dMe8itJ7Rbc3E42aFMDWyrJJPv4dHUpXgoqWFKhHNKB4mbd2veFp8LMEdfzEAoYS9XbXTTQSpQszwSpmY33q9Ky",
#   "user_pubkey": "9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3"
# }' "$BASE_URL/packages/verify")
# status=$(echo "$response" | tail -n1)
# check_response "$response" "$status" 200

# Test get user usage
echo "Fetching user usage..."
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/9unenHYtwUowNkWdZmSYTwzGxxdzKVJh7npk6W6uqRF3/usage")
status=$(echo "$response" | tail -n1)
check_response "$response" "$status" 200

# Test chatbot interaction
echo "Chatbot interaction..."
response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -H "x-api-key: $API_KEY" -X POST -d "{
    \"input_user\": \"What was the trending tokens today?\",
    \"address\": \"$TEST_PUBKEY\"
}" "$BASE_URL/chatbot/interact")
status=$(echo "$response" | tail -n1)
check_response "$response" "$status" 200

echo "All tests passed 🎉"
