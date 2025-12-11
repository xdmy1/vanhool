-- Safe Admin System Setup
-- This script handles existing tables safely
-- Run this in your Supabase SQL Editor

-- 1. First, add missing columns to existing tables (safe - won't error if exists)
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

-- 2. Create tables only if they don't exist
DO $$ 
BEGIN
    -- Create Promo Codes Table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promo_codes') THEN
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
        RAISE NOTICE 'Created promo_codes table';
    ELSE
        RAISE NOTICE 'promo_codes table already exists';
    END IF;

    -- Create Promo Code Usage Tracking if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promo_code_usage') THEN
        CREATE TABLE promo_code_usage (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            order_id UUID,
            used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0
        );
        RAISE NOTICE 'Created promo_code_usage table';
    ELSE
        RAISE NOTICE 'promo_code_usage table already exists';
    END IF;

    -- Create Orders Table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
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
        RAISE NOTICE 'Created orders table';
    ELSE
        RAISE NOTICE 'orders table already exists';
    END IF;

    -- Create Order Items Table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        CREATE TABLE order_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
            product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            price DECIMAL(10, 2) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created order_items table';
    ELSE
        RAISE NOTICE 'order_items table already exists';
    END IF;

    -- Create Payment History Table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_history') THEN
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
        RAISE NOTICE 'Created payment_history table';
    ELSE
        RAISE NOTICE 'payment_history table already exists';
    END IF;

    -- Create Admin Activity Log if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_activity_log') THEN
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
        RAISE NOTICE 'Created admin_activity_log table';
    ELSE
        RAISE NOTICE 'admin_activity_log table already exists';
    END IF;
END $$;

-- 3. Add missing columns to promo_codes if they don't exist
DO $$
BEGIN
    -- Check if discount_percent column exists and add it if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promo_codes' AND column_name = 'discount_percent') THEN
        ALTER TABLE promo_codes ADD COLUMN discount_percent INTEGER NOT NULL DEFAULT 10;
        RAISE NOTICE 'Added discount_percent column to promo_codes';
    END IF;
    
    -- Check if max_uses column exists and add it if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promo_codes' AND column_name = 'max_uses') THEN
        ALTER TABLE promo_codes ADD COLUMN max_uses INTEGER NOT NULL DEFAULT 1;
        RAISE NOTICE 'Added max_uses column to promo_codes';
    END IF;
    
    -- Check if current_uses column exists and add it if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promo_codes' AND column_name = 'current_uses') THEN
        ALTER TABLE promo_codes ADD COLUMN current_uses INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added current_uses column to promo_codes';
    END IF;
    
    -- Check if is_active column exists and add it if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'promo_codes' AND column_name = 'is_active') THEN
        ALTER TABLE promo_codes ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added is_active column to promo_codes';
    END IF;
END $$;

-- 4. Enable RLS on all tables (safe - won't error if already enabled)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (will be ignored if they already exist)
DO $$
BEGIN
    -- Promo codes policy
    BEGIN
        CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.is_admin = true
            )
        );
        RAISE NOTICE 'Created promo codes admin policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Promo codes admin policy already exists';
    END;

    -- Orders policies
    BEGIN
        CREATE POLICY "Users can see own orders" ON orders FOR SELECT USING (
            user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.is_admin = true
            )
        );
        RAISE NOTICE 'Created orders select policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Orders select policy already exists';
    END;

    BEGIN
        CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (
            user_id = auth.uid()
        );
        RAISE NOTICE 'Created orders insert policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Orders insert policy already exists';
    END;

    BEGIN
        CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
            user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.is_admin = true
            )
        );
        RAISE NOTICE 'Created orders update policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Orders update policy already exists';
    END;

    -- Order items policies
    BEGIN
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
        RAISE NOTICE 'Created order items select policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Order items select policy already exists';
    END;

    BEGIN
        CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = order_items.order_id 
                AND orders.user_id = auth.uid()
            )
        );
        RAISE NOTICE 'Created order items insert policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Order items insert policy already exists';
    END;

    -- Promo usage policies
    BEGIN
        CREATE POLICY "Users can see own promo usage" ON promo_code_usage FOR SELECT USING (
            user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.is_admin = true
            )
        );
        RAISE NOTICE 'Created promo usage select policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Promo usage select policy already exists';
    END;

    BEGIN
        CREATE POLICY "System can insert promo usage" ON promo_code_usage FOR INSERT WITH CHECK (
            user_id = auth.uid()
        );
        RAISE NOTICE 'Created promo usage insert policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Promo usage insert policy already exists';
    END;

    -- Payment history policy
    BEGIN
        CREATE POLICY "Users can see own payments" ON payment_history FOR SELECT USING (
            user_id = auth.uid() OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.is_admin = true
            )
        );
        RAISE NOTICE 'Created payment history policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Payment history policy already exists';
    END;

    -- Admin activity log policy
    BEGIN
        CREATE POLICY "Admins can see activity log" ON admin_activity_log FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.is_admin = true
            )
        );
        RAISE NOTICE 'Created admin activity log policy';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Admin activity log policy already exists';
    END;
END $$;

-- 6. Create indexes (will be ignored if they already exist)
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

-- 7. Insert sample promo codes (only if they don't exist)
DO $$
BEGIN
    -- Insert sample promo codes if they don't exist
    INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) 
    SELECT 'SAVE10', 10, 100, true
    WHERE NOT EXISTS (SELECT 1 FROM promo_codes WHERE code = 'SAVE10');
    
    INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) 
    SELECT 'SAVE20', 20, 50, true
    WHERE NOT EXISTS (SELECT 1 FROM promo_codes WHERE code = 'SAVE20');
    
    INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) 
    SELECT 'VANHOOL25', 25, 25, true
    WHERE NOT EXISTS (SELECT 1 FROM promo_codes WHERE code = 'VANHOOL25');
    
    INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) 
    SELECT 'WELCOME15', 15, 200, true
    WHERE NOT EXISTS (SELECT 1 FROM promo_codes WHERE code = 'WELCOME15');
    
    RAISE NOTICE 'Sample promo codes added (if they did not exist)';
END $$;

-- Success message
SELECT 'Admin system setup completed successfully! 🎉' as message,
       'Go to admin.html to access your admin panel' as next_step;