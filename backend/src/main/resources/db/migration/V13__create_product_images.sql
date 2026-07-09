CREATE TABLE IF NOT EXISTS product_images (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    alt_text    VARCHAR(150),
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_sort
    ON product_images (product_id, sort_order, id);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order)
SELECT id, image_url, name, 0
FROM products
WHERE image_url IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM product_images
      WHERE product_images.product_id = products.id
        AND product_images.image_url = products.image_url
  );
