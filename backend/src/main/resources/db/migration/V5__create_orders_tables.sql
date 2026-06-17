CREATE TABLE orders
(
    id                  UUID PRIMARY KEY,
    order_number        VARCHAR(40)    NOT NULL UNIQUE,
    customer_id         UUID           NOT NULL,
    status              VARCHAR(30)    NOT NULL,
    payment_status      VARCHAR(30)    NOT NULL,
    mock_transaction_id VARCHAR(80),
    total_amount        NUMERIC(10, 2) NOT NULL,
    recipient_name      VARCHAR(200)   NOT NULL,
    street              VARCHAR(200)   NOT NULL,
    postal_code         VARCHAR(20)    NOT NULL,
    city                VARCHAR(120)   NOT NULL,
    country             VARCHAR(120)   NOT NULL,
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
            REFERENCES users (id)
);

CREATE TABLE order_items
(
    id            UUID PRIMARY KEY,
    order_id      UUID           NOT NULL,
    product_id    UUID,
    product_name  VARCHAR(200)   NOT NULL,
    variant_size  VARCHAR(50),
    variant_color VARCHAR(80),
    unit_price    NUMERIC(10, 2) NOT NULL,
    quantity      INTEGER        NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
            REFERENCES orders (id)
            ON DELETE CASCADE,
    CONSTRAINT chk_order_items_quantity_positive
        CHECK (quantity > 0)
);
