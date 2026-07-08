-- 3. Produktvarianten und Bestände
INSERT INTO product_variants (product_id, size, color, pattern, stock_quantity, active, created_at) VALUES
-- Varianten für das Dashiki Shirt (Produkt ID 1)
(1, 'S', 'Braun/Orange', 'Savanna Sun', 5, true, CURRENT_TIMESTAMP),
(1, 'M', 'Braun/Orange', 'Savanna Sun', 10, true, CURRENT_TIMESTAMP),
(1, 'L', 'Braun/Orange', 'Savanna Sun', 5, true, CURRENT_TIMESTAMP),

-- Varianten für das Königliche Boubou (Produkt ID 2)
(2, 'Einheitsgröße', 'Basin-Blau', 'Handbestickt', 10, true, CURRENT_TIMESTAMP),

-- Varianten für das Kente Gold Tuch (Produkt ID 3)
(3, 'Standard', 'Gold/Bunt', 'Authentisches Ghana-Webmuster', 5, true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;