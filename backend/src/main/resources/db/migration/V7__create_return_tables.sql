

CREATE TABLE IF NOT EXISTS return_request (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID         NOT NULL REFERENCES orders(id),
    customer_id  UUID         NOT NULL,
    reason       VARCHAR(500),
    status       VARCHAR(50)  NOT NULL,
    created_at   TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS return_item (
    id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    return_request_id UUID    NOT NULL REFERENCES return_request(id),
    order_item_id     UUID    NOT NULL REFERENCES order_items(id),
    quantity          INTEGER NOT NULL
);