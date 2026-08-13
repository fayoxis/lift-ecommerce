-- ============================================================
--  LIFT E-Commerce — Seed Data
--  Run after schema.sql. Mirrors the demo CATALOG array that
--  currently lives in js/lift-shop.js, so the UI shows the same
--  products whether it's reading localStorage or the real API.
-- ============================================================

SET NAMES utf8mb4;

INSERT INTO products (id, name, category_id, price, rating, location, image_url, sizes, stock) VALUES
('jogging-set',     'Jogging Set',      (SELECT id FROM categories WHERE name='Apparel'),     25000,  4.6, 'Yaoundé',   'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=700&q=80', 'S,M,L,XL,XXL', 40),
('robe',            'Robe',             (SELECT id FROM categories WHERE name='Apparel'),     25000,  4.5, 'Douala',    'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80', 'S,M,L,XL,XXL', 30),
('tshirt',          'T-Shirt',          (SELECT id FROM categories WHERE name='Apparel'),     7000,   4.4, 'Bafoussam', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80', 'S,M,L,XL,XXL', 100),
('pullover',        'Pullover',         (SELECT id FROM categories WHERE name='Apparel'),     8000,   4.5, 'Bamenda',   'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=700&q=80', 'S,M,L,XL,XXL', 60),
('sneakers',        'Sneakers',         (SELECT id FROM categories WHERE name='Footwear'),    45000,  4.5, 'Garoua',    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80', '39,40,41,42,43,44', 25),
('leather-boots',   'Leather Boots',    (SELECT id FROM categories WHERE name='Footwear'),    55000,  4.4, 'Buea',      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=700&q=80', '39,40,41,42,43,44', 20),
('handbag',         'Handbag',          (SELECT id FROM categories WHERE name='Bags'),        60000,  4.6, 'Yaoundé',   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80', NULL, 15),
('backpack',        'Backpack',         (SELECT id FROM categories WHERE name='Bags'),        35000,  4.3, 'Douala',    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80', NULL, 35),
('smart-tv',        'Smart TV',         (SELECT id FROM categories WHERE name='Electronics'), 250000, 4.7, 'Bafoussam', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=80', NULL, 10),
('smartphone',      'Smartphone',       (SELECT id FROM categories WHERE name='Electronics'), 180000, 4.8, 'Bamenda',   'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=700&q=80', NULL, 18),
('smartwatch',      'Smartwatch',       (SELECT id FROM categories WHERE name='Electronics'), 75000,  4.5, 'Garoua',    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80', NULL, 22),
('laptop',          'Laptop',           (SELECT id FROM categories WHERE name='Electronics'), 320000, 4.7, 'Buea',      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=80', NULL, 12),
('gold-necklace',   'Gold Necklace',    (SELECT id FROM categories WHERE name='Jewelry'),     90000,  4.6, 'Yaoundé',   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&q=80', NULL, 8),
('diamond-ring',    'Diamond Ring',     (SELECT id FROM categories WHERE name='Jewelry'),     150000, 4.9, 'Douala',    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=80', NULL, 5),
('skincare-set',    'Skincare Set',     (SELECT id FROM categories WHERE name='Beauty & Care'), 18000, 4.6, 'Bafoussam', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=80', NULL, 45),
('perfume',         'Perfume',          (SELECT id FROM categories WHERE name='Beauty & Care'), 32000, 4.7, 'Bamenda',   'https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&q=80', NULL, 30),
('blender',         'Blender',          (SELECT id FROM categories WHERE name='Home & Kitchen'), 28000, 4.4, 'Garoua',   'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&q=80', NULL, 20),
('cookware-set',    'Cookware Set',     (SELECT id FROM categories WHERE name='Home & Kitchen'), 45000, 4.6, 'Buea',     'https://images.unsplash.com/photo-1584990347449-a838388f2f0e?w=700&q=80', NULL, 16),
('coffee-beans',    'Coffee Beans Pack',(SELECT id FROM categories WHERE name='Groceries'),   6000,   4.5, 'Yaoundé',   'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=700&q=80', NULL, 80),
('snack-box',       'Snack Box',        (SELECT id FROM categories WHERE name='Groceries'),   9000,   4.3, 'Douala',    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=700&q=80', NULL, 60),
('yoga-mat',        'Yoga Mat',         (SELECT id FROM categories WHERE name='Sports & Fitness'), 15000, 4.6, 'Bafoussam', 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=700&q=80', NULL, 28),
('dumbbell-set',    'Dumbbell Set',     (SELECT id FROM categories WHERE name='Sports & Fitness'), 40000, 4.5, 'Bamenda',   'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=700&q=80', NULL, 14),
('baby-stroller',   'Baby Stroller',    (SELECT id FROM categories WHERE name='Baby & Kids'), 85000,  4.7, 'Garoua',    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=700&q=80', NULL, 9),
('toy-set',         'Kids Toy Set',     (SELECT id FROM categories WHERE name='Baby & Kids'), 12000,  4.4, 'Buea',      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=700&q=80', NULL, 50),
('notebook-bundle', 'Notebook Bundle',  (SELECT id FROM categories WHERE name='Books & Stationery'), 5000, 4.5, 'Yaoundé', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=700&q=80', NULL, 100),
('novel-collection','Novel Collection', (SELECT id FROM categories WHERE name='Books & Stationery'), 14000, 4.6, 'Douala', 'https://images.unsplash.com/photo-1512820790803-83ca734d794a?w=700&q=80', NULL, 40),
('tool-kit',        'Tool Kit',         (SELECT id FROM categories WHERE name='Automotive & Tools'), 38000, 4.5, 'Bafoussam', 'https://images.unsplash.com/photo-1581147036324-c1c9c1e4b4b8?w=700&q=80', NULL, 17),
('car-vacuum',      'Car Vacuum',       (SELECT id FROM categories WHERE name='Automotive & Tools'), 22000, 4.3, 'Bamenda',   'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=700&q=80', NULL, 24)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), price = VALUES(price), rating = VALUES(rating),
  location = VALUES(location), image_url = VALUES(image_url),
  sizes = VALUES(sizes), stock = VALUES(stock);
