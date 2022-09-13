CREATE TABLE transfers
(
    id SERIAL PRIMARY KEY,
    contract_address text,
    from_address     text,
    to_address       text,
    token_id         int,
    block            int
);

CREATE TABLE collections
(
    contract_address text PRIMARY KEY
);


-- address must be lower case
INSERT INTO collections
VALUES ('0x5c9d55b78febcc2061715ba4f57ecf8ea2711f2c');
INSERT INTO collections
VALUES ('0x7ceee88e71f5c3614f6d0153e922871ae402d1d1');