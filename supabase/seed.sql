-- ============================================
-- Seed Data for Karinderya Inventory System
-- ============================================

-- Note: Users will be created via Supabase Auth
-- After creating users in Supabase Auth, insert corresponding records here

-- Sample Ingredients
INSERT INTO ingredients (name, unit, cost_per_unit, stock_quantity, category) VALUES
-- Karne (Meat)
('Manok (Chicken)', 'kg', 180.00, 50.00, 'karne'),
('Baboy (Pork)', 'kg', 250.00, 40.00, 'karne'),
('Baka (Beef)', 'kg', 350.00, 30.00, 'karne'),
('Isda (Fish)', 'kg', 200.00, 25.00, 'karne'),

-- Gulay (Vegetables)
('Sitaw (String Beans)', 'kg', 60.00, 20.00, 'gulay'),
('Talong (Eggplant)', 'kg', 50.00, 15.00, 'gulay'),
('Kangkong', 'bundle', 20.00, 30.00, 'gulay'),
('Repolyo (Cabbage)', 'kg', 40.00, 25.00, 'gulay'),
('Kamatis (Tomato)', 'kg', 50.00, 20.00, 'gulay'),
('Sibuyas (Onion)', 'kg', 80.00, 30.00, 'gulay'),

-- Bigas at Iba Pa (Rice and Others)
('Bigas (Rice)', 'kg', 50.00, 100.00, 'bigas'),
('Mantika (Cooking Oil)', 'liter', 120.00, 20.00, 'others'),
('Toyo (Soy Sauce)', 'liter', 80.00, 10.00, 'others'),
('Suka (Vinegar)', 'liter', 60.00, 10.00, 'others'),
('Asin (Salt)', 'kg', 20.00, 5.00, 'others'),
('Paminta (Pepper)', 'kg', 150.00, 2.00, 'others'),
('Bawang (Garlic)', 'kg', 120.00, 10.00, 'others'),
('Sili (Chili)', 'kg', 100.00, 5.00, 'others');

-- Sample Ulams
INSERT INTO ulams (name, selling_price, status) VALUES
('Adobong Manok', 50.00, 'active'),
('Sinigang na Baboy', 60.00, 'active'),
('Ginisang Sitaw at Baboy', 45.00, 'active'),
('Pritong Isda', 55.00, 'active'),
('Tortang Talong', 35.00, 'active');

-- Sample Recipes (Ulam Ingredients)
-- Adobong Manok (ID: 1)
INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) VALUES
(1, 1, 0.15),  -- Manok 150g
(1, 13, 0.02), -- Toyo 20ml
(1, 14, 0.02), -- Suka 20ml
(1, 17, 0.01), -- Bawang 10g
(1, 16, 0.005); -- Paminta 5g

-- Sinigang na Baboy (ID: 2)
INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) VALUES
(2, 2, 0.15),  -- Baboy 150g
(2, 5, 0.05),  -- Sitaw 50g
(2, 6, 0.05),  -- Talong 50g
(2, 9, 0.03),  -- Kamatis 30g
(2, 10, 0.02); -- Sibuyas 20g

-- Ginisang Sitaw at Baboy (ID: 3)
INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) VALUES
(3, 2, 0.10),  -- Baboy 100g
(3, 5, 0.10),  -- Sitaw 100g
(3, 10, 0.02), -- Sibuyas 20g
(3, 17, 0.01), -- Bawang 10g
(3, 12, 0.01); -- Mantika 10ml

-- Pritong Isda (ID: 4)
INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) VALUES
(4, 4, 0.20),  -- Isda 200g
(4, 12, 0.03), -- Mantika 30ml
(4, 15, 0.01); -- Asin 10g

-- Tortang Talong (ID: 5)
INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) VALUES
(5, 6, 0.15),  -- Talong 150g
(5, 12, 0.02), -- Mantika 20ml
(5, 15, 0.01); -- Asin 10g

-- Sample Sales Data (Last 7 days)
INSERT INTO sales (sale_date, sale_time, ulam_id, quantity_sold, price_per_serving, total_price) VALUES
-- Today
(CURRENT_DATE, '11:30:00', 1, 5, 50.00, 250.00),
(CURRENT_DATE, '12:00:00', 2, 3, 60.00, 180.00),
(CURRENT_DATE, '12:30:00', 3, 4, 45.00, 180.00),
(CURRENT_DATE, '13:00:00', 1, 2, 50.00, 100.00),

-- Yesterday
(CURRENT_DATE - INTERVAL '1 day', '11:45:00', 1, 6, 50.00, 300.00),
(CURRENT_DATE - INTERVAL '1 day', '12:15:00', 2, 4, 60.00, 240.00),
(CURRENT_DATE - INTERVAL '1 day', '12:45:00', 4, 5, 55.00, 275.00),

-- 2 days ago
(CURRENT_DATE - INTERVAL '2 days', '11:30:00', 1, 4, 50.00, 200.00),
(CURRENT_DATE - INTERVAL '2 days', '12:00:00', 3, 3, 45.00, 135.00),
(CURRENT_DATE - INTERVAL '2 days', '13:00:00', 5, 6, 35.00, 210.00),

-- 3 days ago
(CURRENT_DATE - INTERVAL '3 days', '11:30:00', 2, 5, 60.00, 300.00),
(CURRENT_DATE - INTERVAL '3 days', '12:30:00', 1, 3, 50.00, 150.00),

-- 4 days ago
(CURRENT_DATE - INTERVAL '4 days', '12:00:00', 1, 7, 50.00, 350.00),
(CURRENT_DATE - INTERVAL '4 days', '12:30:00', 4, 4, 55.00, 220.00),

-- 5 days ago
(CURRENT_DATE - INTERVAL '5 days', '11:45:00', 3, 5, 45.00, 225.00),
(CURRENT_DATE - INTERVAL '5 days', '13:00:00', 2, 3, 60.00, 180.00),

-- 6 days ago
(CURRENT_DATE - INTERVAL '6 days', '12:00:00', 1, 8, 50.00, 400.00),
(CURRENT_DATE - INTERVAL '6 days', '12:30:00', 5, 4, 35.00, 140.00);

-- Default System Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('currency_symbol', '₱'),
('low_stock_threshold', '10'),
('business_name', 'Karinderya ni Aling Maria');

-- ============================================
-- End of Seed Data
-- ============================================
