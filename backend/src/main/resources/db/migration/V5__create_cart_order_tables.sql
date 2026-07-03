

CREATE TABLE IF NOT EXISTS cart_item (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id  UUID          NOT NULL,
    product_id   UUID          NOT NULL,
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
    product_id   UUID          NOT NULL,
    product_name VARCHAR(255)  NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    quantity     INTEGER       NOT NULL
);