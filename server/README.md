# SWQuery Backend Server

A Rust-based backend server for SWQuery, providing API endpoints for user management, chat interactions, and token operations on the Solana blockchain.

## Features

- User management with Solana public keys
- Credit system with API key authentication
- Real-time chat interactions with AI
- WebSocket connections for token and trade monitoring
- Rate limiting middleware
- Token creation and management on Solana
- PostgreSQL database integration

## Tech Stack

- **Runtime**: Rust 1.82
- **Web Framework**: Axum 0.7.9
- **Database**: PostgreSQL (via SQLx)
- **Authentication**: API Key-based
- **WebSocket**: tokio-tungstenite
- **Other Key Dependencies**:
  - tokio (async runtime)
  - serde (serialization)
  - tower-http (middleware)
  - sqlx (database)
  - reqwest (HTTP client)

## Project Structure

```
server/
├── src/
│   ├── db/            # Database connection and utilities
│   ├── middlewares/   # Custom middleware (rate limiting)
│   ├── models/        # Data models and database schemas
│   ├── routes/        # API route handlers
│   └── main.rs        # Application entry point
├── database/
│   └── init.sql       # Database initialization script
└── Dockerfile         # Container configuration
```

## API Endpoints

### Users
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /users/:pubkey` - Get user by public key

### Credits
- `POST /credits/buy` - Purchase credits
- `POST /credits/refund` - Refund credits

### Chatbot
- `POST /chatbot/interact` - Interact with AI chatbot
- `GET /chatbot/chats` - Get user chat history
- `GET /chatbot/chats/:id` - Get specific chat details

### Agent
- `POST /agent/generate-query` - Generate query
- `POST /agent/generate-report` - Generate report

### Token
- `POST /token/create-token` - Create new token (currently disabled)

## Database Schema

The application uses three main tables:

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    pubkey VARCHAR NOT NULL UNIQUE
);
```

### Credits Table
```sql
CREATE TABLE credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) UNIQUE,
    balance BIGINT NOT NULL DEFAULT 0,
    api_key VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chats Table
```sql
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    input_user TEXT NOT NULL,
    response TEXT,
    tokens_used BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Rate Limiting

The application implements rate limiting through a custom middleware that allows:
- 100 requests per minute per IP address
- Configurable window size and request limits
- IP-based tracking using X-Forwarded-For header

## WebSocket Integration

The server maintains a WebSocket connection to `wss://pumpportal.fun/api/data` for real-time monitoring of:
- New token creation
- Account trades
- Token trades

Yes, let's add the new package verification functionality to the README. I'll update the API Endpoints and Database Schema sections:

### Packages
- `GET /packages` - Get all available packages
- `POST /packages/verify` - Verify USDC transaction and add credits
  - Verifies Solana USDC transfers
  - Retries up to 10 times with 2s delay
  - Checks recipient (BXVjUeXZ5GgbPvqCsUXdGz2G7zsg436GctEC3HkNLABK)
  - Validates exact USDC amount
  - Returns updated credit balance

### Database Schema

Add this new table:

```sql
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price_usdc DECIMAL NOT NULL,
    requests_amount INTEGER NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    package_id INTEGER NOT NULL REFERENCES packages(id),
    signature VARCHAR NOT NULL UNIQUE,
    status VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The packages system allows users to:
1. Purchase predefined credit packages with USDC
2. Verify their Solana transactions automatically
3. Get credits added to their account instantly
4. Track all purchases with transaction history

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- Additional configuration can be set via `.env` file

## Running the Application

### Using Docker

```bash
docker build -t swquery-server .
docker run -p 5500:5500 swquery-server
```

### Local Development

```bash
cargo build
cargo run
```

The server will start on `http://0.0.0.0:5500`

## License

Apache-2.0

## Authors

- Arthur Bretas
- Marcelo G Feitoza
- Pedro Hagge Baptista
- Victor Carvalho