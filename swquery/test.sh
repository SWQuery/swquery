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
curl -X POST -H "Content-Type: application/json" -d '{
  "input_user": "Hello, how are you?",
  "address": "GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8"
}' "$BASE_URL/chatbot/interact"
echo
