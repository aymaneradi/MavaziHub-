CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    CONSTRAINT uk_categories_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS products (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(150)  NOT NULL,
    description    TEXT,
    price          DECIMAL(10,2) NOT NULL,
    image_url      VARCHAR(500),
    stock_quantity INTEGER       NOT NULL,
    active         BOOLEAN       NOT NULL,
    category_id    BIGINT        NOT NULL REFERENCES categories(id),
    created_at     TIMESTAMP     NOT NULL,
    updated_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
    id             BIGSERIAL PRIMARY KEY,
    product_id     BIGINT    NOT NULL REFERENCES products(id),
    size           VARCHAR(50),
    color          VARCHAR(80),
    pattern        VARCHAR(100),
    stock_quantity INTEGER   NOT NULL,
    active         BOOLEAN   NOT NULL,
    created_at     TIMESTAMP NOT NULL,
    updated_at     TIMESTAMP
);
