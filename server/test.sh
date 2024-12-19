#!/bin/bash

BASE_URL="http://localhost:5500"
API_KEY="WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM"

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

# Test health endpoint
echo "Testing /health..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/health")
check_response "" "$response" 200

# Test create user
echo "Creating user..."
response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -X POST -d '{
  "pubkey": "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8"
}' "$BASE_URL/users")
status=$(echo "$response" | tail -n1)
check_response "$response" "$status" 200

# Test get users
echo "Fetching users..."
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users")
status=$(echo "$response" | tail -n1)
check_response "$response" "$status" 200

# Test buy credits
echo "Buying credits..."
response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -H "x-api-key: $API_KEY" -X POST -d '{
  "user_pubkey": "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8",
  "amount": 5000
}' "$BASE_URL/credits/buy")
status=$(echo "$response" | tail -n1)
check_response "$response" "$status" 201

# Test chatbot interaction
echo "Chatbot interaction..."
response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -H "x-api-key: $API_KEY" -X POST -d '{
  "input_user": "Hello, how are you?",
  "address": "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8"
}' "$BASE_URL/chatbot/interact")
status=$(echo "$response" | tail -n1)
check_response "$response" "$status" 200

echo "All tests passed 🎉"