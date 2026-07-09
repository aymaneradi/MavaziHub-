CREATE UNIQUE INDEX IF NOT EXISTS uk_product_variants_product_attributes
    ON product_variants (
        product_id,
        lower(coalesce(size, '')),
        lower(coalesce(color, '')),
        lower(coalesce(pattern, ''))
    );
