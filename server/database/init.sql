-- SQLBook: Code
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    pubkey VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) UNIQUE, -- UNIQUE constraint here
    api_key VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remaining_requests INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    input_user TEXT NOT NULL,
    response TEXT,
    tokens_used BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    price_usdc NUMERIC(10,2) NOT NULL,
    requests_amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    package_id INTEGER NOT NULL REFERENCES packages(id),
    signature VARCHAR NOT NULL UNIQUE,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_id ON chats(user_id);

CREATE INDEX idx_users_pubkey ON users(pubkey);
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_chats_user_id_created_at ON chats(user_id, created_at);

INSERT INTO
    users (pubkey)
VALUES (
        'GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8'
    );

INSERT INTO
    credits (user_id, api_key)
VALUES (
        1,
        'WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM'
    );

INSERT INTO
    chats (user_id, input_user, response, tokens_used)
VALUES (
        1,
        'Hello',
        'Hi there!',
        1
    );

INSERT INTO packages (name, price_usdc, requests_amount) VALUES
    ('Starter', 10, 3),
    ('Basic', 20, 10),
    ('Pro', 50, 30);