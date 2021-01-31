CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL
);
CREATE TABLE receipts(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    name TEXT NOT NULL,
    UNIQUE (id, name)
);
CREATE TABLE receipt_records(
    receipt_id INTEGER REFERENCES receipts(id) NOT NULL,
    record TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);
