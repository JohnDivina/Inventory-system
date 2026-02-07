-- ============================================
-- Karinderya Inventory & Sales Management System
-- PostgreSQL Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table
-- Linked to Supabase Auth
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================================
-- Ulams Table (Food Items/Dishes)
-- ============================================
CREATE TABLE ulams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ulams_name ON ulams(name);
CREATE INDEX idx_ulams_status ON ulams(status);

-- ============================================
-- Ingredients Table
-- ============================================
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    category VARCHAR(50) DEFAULT 'others',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_stock ON ingredients(stock_quantity);

-- ============================================
-- Ulam Ingredients (Recipe Relationships)
-- ============================================
CREATE TABLE ulam_ingredients (
    id SERIAL PRIMARY KEY,
    ulam_id INTEGER NOT NULL REFERENCES ulams(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity_per_serving DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ulam_id, ingredient_id)
);

CREATE INDEX idx_ulam_ingredients_ulam ON ulam_ingredients(ulam_id);
CREATE INDEX idx_ulam_ingredients_ingredient ON ulam_ingredients(ingredient_id);

-- ============================================
-- Sales Table
-- ============================================
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    sale_date DATE NOT NULL,
    sale_time TIME NOT NULL,
    ulam_id INTEGER NOT NULL REFERENCES ulams(id) ON DELETE RESTRICT,
    quantity_sold INTEGER NOT NULL,
    price_per_serving DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_ulam ON sales(ulam_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- ============================================
-- System Settings Table
-- ============================================
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ulams_updated_at BEFORE UPDATE ON ulams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Stored Procedures for Sales Operations
-- ============================================

-- Function to record a sale with automatic stock deduction
CREATE OR REPLACE FUNCTION record_sale(
    p_ulam_id INTEGER,
    p_quantity_sold INTEGER,
    p_price_per_serving DECIMAL
)
RETURNS JSON AS $$
DECLARE
    v_total_price DECIMAL;
    v_sale_id INTEGER;
    v_ingredient RECORD;
    v_required_qty DECIMAL;
BEGIN
    -- Calculate total price
    v_total_price := p_quantity_sold * p_price_per_serving;
    
    -- Check if enough ingredients are available
    FOR v_ingredient IN 
        SELECT ui.ingredient_id, ui.quantity_per_serving, i.stock_quantity, i.name
        FROM ulam_ingredients ui
        JOIN ingredients i ON ui.ingredient_id = i.id
        WHERE ui.ulam_id = p_ulam_id
    LOOP
        v_required_qty := v_ingredient.quantity_per_serving * p_quantity_sold;
        IF v_ingredient.stock_quantity < v_required_qty THEN
            RETURN json_build_object(
                'success', false,
                'message', 'Kulang ang stock ng ' || v_ingredient.name
            );
        END IF;
    END LOOP;
    
    -- Insert sale record
    INSERT INTO sales (sale_date, sale_time, ulam_id, quantity_sold, price_per_serving, total_price)
    VALUES (CURRENT_DATE, CURRENT_TIME, p_ulam_id, p_quantity_sold, p_price_per_serving, v_total_price)
    RETURNING id INTO v_sale_id;
    
    -- Deduct ingredients
    FOR v_ingredient IN 
        SELECT ui.ingredient_id, ui.quantity_per_serving
        FROM ulam_ingredients ui
        WHERE ui.ulam_id = p_ulam_id
    LOOP
        v_required_qty := v_ingredient.quantity_per_serving * p_quantity_sold;
        UPDATE ingredients
        SET stock_quantity = stock_quantity - v_required_qty
        WHERE id = v_ingredient.ingredient_id;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'message', 'Sale recorded successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to delete a sale and restore stock
CREATE OR REPLACE FUNCTION delete_sale(p_sale_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_sale RECORD;
    v_ingredient RECORD;
    v_restore_qty DECIMAL;
BEGIN
    -- Get sale details
    SELECT * INTO v_sale FROM sales WHERE id = p_sale_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Sale not found'
        );
    END IF;
    
    -- Restore ingredients
    FOR v_ingredient IN 
        SELECT ui.ingredient_id, ui.quantity_per_serving
        FROM ulam_ingredients ui
        WHERE ui.ulam_id = v_sale.ulam_id
    LOOP
        v_restore_qty := v_ingredient.quantity_per_serving * v_sale.quantity_sold;
        UPDATE ingredients
        SET stock_quantity = stock_quantity + v_restore_qty
        WHERE id = v_ingredient.ingredient_id;
    END LOOP;
    
    -- Delete sale
    DELETE FROM sales WHERE id = p_sale_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Sale deleted and stock restored'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate available servings for an ulam
CREATE OR REPLACE FUNCTION get_available_servings(p_ulam_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_min_servings INTEGER := 999999;
    v_ingredient RECORD;
    v_possible_servings INTEGER;
BEGIN
    FOR v_ingredient IN 
        SELECT ui.quantity_per_serving, i.stock_quantity
        FROM ulam_ingredients ui
        JOIN ingredients i ON ui.ingredient_id = i.id
        WHERE ui.ulam_id = p_ulam_id
    LOOP
        IF v_ingredient.quantity_per_serving > 0 THEN
            v_possible_servings := FLOOR(v_ingredient.stock_quantity / v_ingredient.quantity_per_serving);
            IF v_possible_servings < v_min_servings THEN
                v_min_servings := v_possible_servings;
            END IF;
        END IF;
    END LOOP;
    
    IF v_min_servings = 999999 THEN
        RETURN 0;
    END IF;
    
    RETURN v_min_servings;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- End of Schema
-- ============================================
