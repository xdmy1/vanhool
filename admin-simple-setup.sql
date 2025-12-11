-- Simple Admin System Setup
-- Run this in your Supabase SQL Editor

-- 1. First, add missing columns to existing tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(8, 3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL(8, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height DECIMAL(8, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_months INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 2. Create Promo Codes Table
CREATE TABLE promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create Promo Code Usage Tracking
CREATE TABLE promo_code_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- 4. Create Orders Table
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

-- 5. Create Order Items Table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Payment History Table
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

-- 7. Create Admin Activity Log
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

-- 8. Add RLS Policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for promo codes (admin only)
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- 10. Create policies for orders (users see own, admins see all)
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

CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- 11. Create policies for order items
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

-- 12. Create policies for promo usage
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

-- 13. Create policies for payment history
CREATE POLICY "Users can see own payments" ON payment_history FOR SELECT USING (
    user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- 14. Create policies for admin activity log (admin only)
CREATE POLICY "Admins can see activity log" ON admin_activity_log FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- 15. Insert sample promo codes
INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) VALUES
('SAVE10', 10, 100, true),
('SAVE20', 20, 50, true),
('VANHOOL25', 25, 25, true),
('WELCOME15', 15, 200, true);

-- 16. Create indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_code_usage_promo_id ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_user_id ON promo_code_usage(user_id);
CREATE INDEX idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX idx_admin_activity_admin_id ON admin_activity_log(admin_id);

-- Success message
SELECT 'Admin system setup completed successfully!' as message;