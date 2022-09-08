CREATE TABLE transfers
(
    contract_address text,
    from_address     text,
    to_address       text,
    token_id         int,
    block            int,
    PRIMARY KEY(contract_address, from_address, to_address, token_id, block)
);

CREATE TABLE collections
(
    contract_address text PRIMARY KEY
);

INSERT INTO collections
VALUES ('0x5c9D55b78FEBCC2061715BA4f57EcF8EA2711F2c');
INSERT INTO collections
VALUES ('0x7cEee88E71F5C3614F6d0153e922871Ae402d1d1');