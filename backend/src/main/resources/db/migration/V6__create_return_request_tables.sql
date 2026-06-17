CREATE TABLE return_requests
(
    id            UUID PRIMARY KEY,
    return_number VARCHAR(40)  NOT NULL UNIQUE,
    order_id      UUID         NOT NULL,
    customer_id   UUID         NOT NULL,
    status        VARCHAR(30)  NOT NULL,
    reason        TEXT,
    processed_by  UUID,
    processed_at  TIMESTAMP,
    staff_comment TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_return_requests_order
        FOREIGN KEY (order_id)
            REFERENCES orders (id)
            ON DELETE CASCADE,
    CONSTRAINT fk_return_requests_customer
        FOREIGN KEY (customer_id)
            REFERENCES users (id),
    CONSTRAINT fk_return_requests_processed_by
        FOREIGN KEY (processed_by)
            REFERENCES users (id)
);

CREATE TABLE return_request_items
(
    id                UUID PRIMARY KEY,
    return_request_id UUID    NOT NULL,
    order_item_id     UUID    NOT NULL,
    quantity          INTEGER NOT NULL,
    reason            TEXT,

    CONSTRAINT fk_return_request_items_request
        FOREIGN KEY (return_request_id)
            REFERENCES return_requests (id)
            ON DELETE CASCADE,
    CONSTRAINT fk_return_request_items_order_item
        FOREIGN KEY (order_item_id)
            REFERENCES order_items (id),
    CONSTRAINT chk_return_request_items_quantity_positive
        CHECK (quantity > 0)
);
