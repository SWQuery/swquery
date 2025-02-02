#!/bin/bash

BASE_URL="http://localhost:5500"

# Test health endpoint
echo "Testing /health..."
curl -X GET "$BASE_URL/health"
echo

# Test create user
echo "Creating user..."
curl -X POST -H "Content-Type: application/json" -d '{
  "pubkey": "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8"
}' "$BASE_URL/users"
echo

# Test get users
echo "Fetching users..."
curl -X GET "$BASE_URL/users"
echo

# Test buy credits
echo "Buying credits..."
curl -X POST -H "Content-Type: application/json" -d '{
  "user_pubkey": "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8",
  "amount": 5000
}' "$BASE_URL/credits/buy"
echo

# Test chatbot interaction
echo "Chatbot interaction..."
curl -X POST \
-H "Content-Type: application/json" \
-H "x-api-key: WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM" \
-d '{
  "input_user": "What are the trending tokens on last 24hrs?",
  "address": "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8",
  "helius_key": "bf387173-8363-45e8-a0e0-86985e6d0219",
  "openai_key": "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"
}' "$BASE_URL/chatbot/interact"
echo
