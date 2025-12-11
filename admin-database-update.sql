-- Admin System Database Update
-- Add necessary tables for the comprehensive admin system

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS promo_code_usage CASCADE;
-- DROP TABLE IF EXISTS promo_codes CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS payment_history CASCADE;
-- DROP TABLE IF EXISTS admin_activity_log CASCADE;

-- Promo Codes Table
DROP TABLE IF EXISTS promo_codes CASCADE;
CREATE TABLE promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
    max_uses INTEGER NOT NULL DEFAULT 1,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Promo Code Usage Tracking
DROP TABLE IF EXISTS promo_code_usage CASCADE;
CREATE TABLE promo_code_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Orders Table (Enhanced)
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    billing_name VARCHAR(255),
    billing_email VARCHAR(255),
    billing_phone VARCHAR(50),
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    shipping_name VARCHAR(255),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment History Table
DROP TABLE IF EXISTS payment_history CASCADE;
CREATE TABLE payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    gateway_response TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Product Table (Add missing columns)
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8, 3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL(8, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height DECIMAL(8, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_months INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Enhanced Profiles Table (Add missing columns for admin)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Admin Activity Log
DROP TABLE IF EXISTS admin_activity_log CASCADE;
CREATE TABLE admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_id ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_id ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_log(admin_id);

-- Row Level Security Policies

-- Promo Codes - Only admins can manage
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Promo Code Usage - Users can see their own, admins see all
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own promo usage" ON promo_code_usage FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);
CREATE POLICY "System can insert promo usage" ON promo_code_usage FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- Orders - Users can see their own, admins see all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own orders" ON orders FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (
    user_id = auth.uid()
);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Order Items - Follow orders permissions
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        ))
    )
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Payment History - Users can see their own, admins see all
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own payments" ON payment_history FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Admin Activity Log - Only admins can see
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see activity log" ON admin_activity_log FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- Functions for automated tasks

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders 
    SET subtotal = (
        SELECT COALESCE(SUM(total), 0) 
        FROM order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    ),
    total_amount = subtotal - discount_amount
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update order totals
DROP TRIGGER IF EXISTS trigger_update_order_totals ON order_items;
CREATE TRIGGER trigger_update_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_totals();

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
    action_type VARCHAR(100),
    target_type VARCHAR(50) DEFAULT NULL,
    target_id UUID DEFAULT NULL,
    details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details)
    VALUES (auth.uid(), action_type, target_type, target_id, details);
END;
$$ LANGUAGE plpgsql;

-- Function to check and apply promo code
CREATE OR REPLACE FUNCTION apply_promo_code(
    p_code VARCHAR(50),
    p_order_total DECIMAL(10, 2),
    p_user_id UUID
)
RETURNS TABLE(
    is_valid BOOLEAN,
    discount_amount DECIMAL(10, 2),
    promo_id UUID,
    message TEXT
) AS $$
DECLARE
    v_promo promo_codes%ROWTYPE;
    v_usage_count INTEGER;
    v_discount DECIMAL(10, 2);
BEGIN
    -- Get promo code
    SELECT * INTO v_promo 
    FROM promo_codes 
    WHERE code = p_code AND is_active = true;
    
    -- Check if promo exists
    IF v_promo.id IS NULL THEN
        RETURN QUERY SELECT false, 0.00::DECIMAL(10, 2), NULL::UUID, 'Invalid promo code';
        RETURN;
    END IF;
    
    -- Check if expired
    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
        RETURN QUERY SELECT false, 0.00::DECIMAL(10, 2), v_promo.id, 'Promo code has expired';
        RETURN;
    END IF;
    
    -- Check usage count
    SELECT COUNT(*) INTO v_usage_count 
    FROM promo_code_usage 
    WHERE promo_code_id = v_promo.id;
    
    IF v_usage_count >= v_promo.max_uses THEN
        RETURN QUERY SELECT false, 0.00::DECIMAL(10, 2), v_promo.id, 'Promo code usage limit reached';
        RETURN;
    END IF;
    
    -- Calculate discount
    v_discount := (p_order_total * v_promo.discount_percent / 100);
    
    RETURN QUERY SELECT true, v_discount, v_promo.id, 'Promo code applied successfully';
END;
$$ LANGUAGE plpgsql;

-- Sample promo codes for testing
INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) VALUES
('SAVE10', 10, 100, true),
('SAVE20', 20, 50, true),
('VANHOOL25', 25, 25, true),
('WELCOME15', 15, 200, true)
ON CONFLICT (code) DO NOTHING;

-- Add some sample admin activity for demo
-- Note: This will only work if there are admin users in the profiles table

COMMENT ON TABLE promo_codes IS 'Promo codes for discounts';
COMMENT ON TABLE promo_code_usage IS 'Tracking usage of promo codes';
COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON TABLE order_items IS 'Items within orders';
COMMENT ON TABLE payment_history IS 'Payment transaction history';
COMMENT ON TABLE admin_activity_log IS 'Log of admin actions for audit trail';