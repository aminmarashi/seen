CREATE TABLE receipts(
    name VARCHAR(256) PRIMARY KEY
);
CREATE TABLE receipt_records(
    receipt VARCHAR(256) REFERENCES receipts(name),
    record TEXT,
    timestamp TIMESTAMP DEFAULT current_timestamp
);
