-- ============================================
-- Karinderya Inventory & Sales Management System
-- Database Schema
-- ============================================

DROP DATABASE IF EXISTS cinventory;
CREATE DATABASE cinventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinventory;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Ulams Table (Food Items/Dishes)
-- ============================================
CREATE TABLE ulams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Ingredients Table
-- ============================================
CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    category VARCHAR(50) DEFAULT 'others',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_stock (stock_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Ulam Ingredients (Recipe Relationships)
-- ============================================
CREATE TABLE ulam_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ulam_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_per_serving DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ulam_id) REFERENCES ulams(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_ulam_ingredient (ulam_id, ingredient_id),
    INDEX idx_ulam (ulam_id),
    INDEX idx_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sales Table
-- ============================================
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_date DATE NOT NULL,
    sale_time TIME NOT NULL,
    ulam_id INT NOT NULL,
    quantity_sold INT NOT NULL,
    price_per_serving DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ulam_id) REFERENCES ulams(id) ON DELETE RESTRICT,
    INDEX idx_sale_date (sale_date),
    INDEX idx_ulam (ulam_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- System Settings Table
-- ============================================
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data
-- ============================================

-- Default Admin User (password: admin123)
INSERT INTO users (username, password, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('staff1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff');

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
(1, 3, 0.02),  -- Toyo 20ml
(1, 4, 0.02),  -- Suka 20ml
(1, 7, 0.01),  -- Bawang 10g
(1, 6, 0.005); -- Paminta 5g

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
(3, 7, 0.01),  -- Bawang 10g
(3, 2, 0.01);  -- Mantika 10ml

-- Pritong Isda (ID: 4)
INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) VALUES
(4, 4, 0.20),  -- Isda 200g
(4, 2, 0.03),  -- Mantika 30ml
(4, 5, 0.01);  -- Asin 10g

-- Tortang Talong (ID: 5)
INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) VALUES
(5, 6, 0.15),  -- Talong 150g
(5, 2, 0.02),  -- Mantika 20ml
(5, 5, 0.01);  -- Asin 10g

-- Sample Sales Data (Last 7 days)
INSERT INTO sales (sale_date, sale_time, ulam_id, quantity_sold, price_per_serving, total_price) VALUES
-- Today
(CURDATE(), '11:30:00', 1, 5, 50.00, 250.00),
(CURDATE(), '12:00:00', 2, 3, 60.00, 180.00),
(CURDATE(), '12:30:00', 3, 4, 45.00, 180.00),
(CURDATE(), '13:00:00', 1, 2, 50.00, 100.00),

-- Yesterday
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '11:45:00', 1, 6, 50.00, 300.00),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '12:15:00', 2, 4, 60.00, 240.00),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '12:45:00', 4, 5, 55.00, 275.00),

-- 2 days ago
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:30:00', 1, 4, 50.00, 200.00),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '12:00:00', 3, 3, 45.00, 135.00),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '13:00:00', 5, 6, 35.00, 210.00),

-- 3 days ago
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '11:30:00', 2, 5, 60.00, 300.00),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), '12:30:00', 1, 3, 50.00, 150.00),

-- 4 days ago
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '12:00:00', 1, 7, 50.00, 350.00),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '12:30:00', 4, 4, 55.00, 220.00),

-- 5 days ago
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '11:45:00', 3, 5, 45.00, 225.00),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '13:00:00', 2, 3, 60.00, 180.00),

-- 6 days ago
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '12:00:00', 1, 8, 50.00, 400.00),
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '12:30:00', 5, 4, 35.00, 140.00);

-- Default System Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('currency_symbol', '₱'),
('low_stock_threshold', '10'),
('business_name', 'Karinderya ni Aling Maria');

-- ============================================
-- End of Schema
-- ============================================
