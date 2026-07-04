-- Align cart/order snapshot product references with the catalog model.
-- Existing lab cart/order rows are removed because old UUID product IDs cannot be
-- safely converted to catalog BIGINT product IDs.

CREATE TABLE IF NOT EXISTS cart_item (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id  UUID          NOT NULL,
    product_id   BIGINT        NOT NULL,
    variant_id   BIGINT,
    product_name VARCHAR(255)  NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    quantity     INTEGER       NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id    UUID          NOT NULL,
    status         VARCHAR(50)   NOT NULL,
    payment_status VARCHAR(50)   NOT NULL,
    street         VARCHAR(255)  NOT NULL,
    zip_code       VARCHAR(20)   NOT NULL,
    city           VARCHAR(100)  NOT NULL,
    total_price    DECIMAL(10,2) NOT NULL,
    order_date     TIMESTAMP     NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID          NOT NULL REFERENCES orders(id),
    product_id   BIGINT        NOT NULL,
    variant_id   BIGINT,
    product_name VARCHAR(255)  NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    quantity     INTEGER       NOT NULL
);

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

DELETE FROM return_item;
DELETE FROM return_request;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_item;

ALTER TABLE cart_item
    ALTER COLUMN product_id TYPE BIGINT USING NULL::BIGINT;

ALTER TABLE cart_item
    ADD COLUMN IF NOT EXISTS variant_id BIGINT;

ALTER TABLE order_items
    ALTER COLUMN product_id TYPE BIGINT USING NULL::BIGINT;

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS variant_id BIGINT;
