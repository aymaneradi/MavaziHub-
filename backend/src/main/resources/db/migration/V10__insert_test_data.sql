INSERT INTO categories (name, description) VALUES
    ('Stoffe', 'Hochwertige afrikanische Stoffe wie Wax-Prints und echtes Kente'),
    ('Kleidung', 'Traditionelle und moderne afrikanische Mode für jeden Anlass'),
    ('Accessoires', 'Handgefertigter Schmuck und traditionelle Accessoires'),
    ('Kopftücher', 'Traditionelle Kopfbedeckungen, Gele und Tücher'),
    ('Specials', 'Limitierte Editionen und besondere Angebote')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, price, image_url, stock_quantity, active, category_id, created_at)
SELECT
    'Dashiki Shirt - Savanna Sun',
    'Unisex Dashiki Oberteil in Braun und Orange. 100% Baumwolle, traditionelles Savanna Sun Muster. Bequem und stilvoll.',
    29.95,
    'https://africanfabs.de/cdn/shop/products/dashiki-shirt-dashiki-kleid-braun-orange-savanna-sun-afrikanisches-top-unisex-791_1000x.jpg',
    20,
    true,
    (SELECT id FROM categories WHERE name = 'Kleidung' LIMIT 1),
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dashiki Shirt - Savanna Sun');

INSERT INTO products (name, description, price, image_url, stock_quantity, active, category_id, created_at)
SELECT
    'Königliches Boubou',
    'Prachtvolles Boubou aus hochwertigem Basin-Stoff mit traditioneller Handstickerei.',
    89.90,
    'https://images.unsplash.com/photo-1572804013307-59c85b4ec665?q=80&w=800&auto=format&fit=crop',
    10,
    true,
    (SELECT id FROM categories WHERE name = 'Kleidung' LIMIT 1),
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Königliches Boubou');

INSERT INTO products (name, description, price, image_url, stock_quantity, active, category_id, created_at)
SELECT
    'Kente Gold Tuch',
    'Authentisches, handgewebtes Kente-Tuch aus Ghana.',
    120.00,
    'https://images.unsplash.com/photo-1583243265032-441f69201e74?q=80&w=800&auto=format&fit=crop',
    5,
    true,
    (SELECT id FROM categories WHERE name = 'Stoffe' LIMIT 1),
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Kente Gold Tuch');
