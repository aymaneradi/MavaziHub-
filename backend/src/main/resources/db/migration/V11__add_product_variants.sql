INSERT INTO product_variants (product_id, size, color, pattern, stock_quantity, active, created_at)
SELECT
    products.id,
    seed.size,
    seed.color,
    seed.pattern,
    seed.stock_quantity,
    true,
    CURRENT_TIMESTAMP
FROM (
    VALUES
        ('Dashiki Shirt - Savanna Sun', 'S', 'Braun/Orange', 'Savanna Sun', 5),
        ('Dashiki Shirt - Savanna Sun', 'M', 'Braun/Orange', 'Savanna Sun', 10),
        ('Dashiki Shirt - Savanna Sun', 'L', 'Braun/Orange', 'Savanna Sun', 5),
        ('Königliches Boubou', 'Einheitsgröße', 'Basin-Blau', 'Handbestickt', 10),
        ('Kente Gold Tuch', 'Standard', 'Gold/Bunt', 'Authentisches Ghana-Webmuster', 5)
) AS seed(product_name, size, color, pattern, stock_quantity)
JOIN products ON products.name = seed.product_name
WHERE NOT EXISTS (
    SELECT 1
    FROM product_variants existing
    WHERE existing.product_id = products.id
      AND lower(coalesce(existing.size, '')) = lower(coalesce(seed.size, ''))
      AND lower(coalesce(existing.color, '')) = lower(coalesce(seed.color, ''))
      AND lower(coalesce(existing.pattern, '')) = lower(coalesce(seed.pattern, ''))
);
