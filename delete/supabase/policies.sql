-- ============================================
-- Row Level Security (RLS) Policies
-- Karinderya Inventory System
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ulams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ulam_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Users Table Policies
-- ============================================

-- Users can read their own record
CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (auth.uid() = auth_id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can insert users
CREATE POLICY "Admins can insert users"
ON users FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can update users
CREATE POLICY "Admins can update users"
ON users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    )
);

-- Admins can delete users
CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- Ulams Table Policies
-- ============================================

-- All authenticated users can read ulams
CREATE POLICY "Authenticated users can view ulams"
ON ulams FOR SELECT
USING (auth.role() = 'authenticated');

-- All authenticated users can insert ulams
CREATE POLICY "Authenticated users can insert ulams"
ON ulams FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can update ulams
CREATE POLICY "Authenticated users can update ulams"
ON ulams FOR UPDATE
USING (auth.role() = 'authenticated');

-- All authenticated users can delete ulams
CREATE POLICY "Authenticated users can delete ulams"
ON ulams FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- Ingredients Table Policies
-- ============================================

-- All authenticated users can read ingredients
CREATE POLICY "Authenticated users can view ingredients"
ON ingredients FOR SELECT
USING (auth.role() = 'authenticated');

-- All authenticated users can insert ingredients
CREATE POLICY "Authenticated users can insert ingredients"
ON ingredients FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can update ingredients
CREATE POLICY "Authenticated users can update ingredients"
ON ingredients FOR UPDATE
USING (auth.role() = 'authenticated');

-- All authenticated users can delete ingredients
CREATE POLICY "Authenticated users can delete ingredients"
ON ingredients FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- Ulam Ingredients Table Policies
-- ============================================

-- All authenticated users can read ulam_ingredients
CREATE POLICY "Authenticated users can view ulam_ingredients"
ON ulam_ingredients FOR SELECT
USING (auth.role() = 'authenticated');

-- All authenticated users can insert ulam_ingredients
CREATE POLICY "Authenticated users can insert ulam_ingredients"
ON ulam_ingredients FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can update ulam_ingredients
CREATE POLICY "Authenticated users can update ulam_ingredients"
ON ulam_ingredients FOR UPDATE
USING (auth.role() = 'authenticated');

-- All authenticated users can delete ulam_ingredients
CREATE POLICY "Authenticated users can delete ulam_ingredients"
ON ulam_ingredients FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- Sales Table Policies
-- ============================================

-- All authenticated users can read sales
CREATE POLICY "Authenticated users can view sales"
ON sales FOR SELECT
USING (auth.role() = 'authenticated');

-- All authenticated users can insert sales
CREATE POLICY "Authenticated users can insert sales"
ON sales FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can update sales
CREATE POLICY "Authenticated users can update sales"
ON sales FOR UPDATE
USING (auth.role() = 'authenticated');

-- All authenticated users can delete sales
CREATE POLICY "Authenticated users can delete sales"
ON sales FOR DELETE
USING (auth.role() = 'authenticated');

-- ============================================
-- Settings Table Policies
-- ============================================

-- All authenticated users can read settings
CREATE POLICY "Authenticated users can view settings"
ON settings FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON settings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    )
);

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
ON settings FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    )
);

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
ON settings FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- End of RLS Policies
-- ============================================
