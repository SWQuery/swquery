-- SQLBook: Code
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    pubkey VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) UNIQUE, -- UNIQUE constraint here
    balance BIGINT NOT NULL DEFAULT 0,
    api_key VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    users (pubkey)
VALUES (
        'GtJHNhKQnnJZQTHq2Vh49HpR4yKKJmUonVYbLeS1RPs8'
    );

INSERT INTO
    credits (user_id, balance, api_key)
VALUES (
        1,
        100000000000000,
        'WDAO4Z1Z503DWJH7060GIYGR0TWIIPBM'
    );