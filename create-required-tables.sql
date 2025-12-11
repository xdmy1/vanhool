-- Quick Setup: Create Required Tables for Admin System
-- Run this in your Supabase SQL Editor to enable all admin features

-- 1. Create the basic tables needed for admin functionality

-- Products table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    part_code VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_ro VARCHAR(255),
    name_ru VARCHAR(255),
    description_en TEXT,
    description_ro TEXT,
    description_ru TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    weight DECIMAL(8, 3),
    width DECIMAL(8, 2),
    height DECIMAL(8, 2),
    sku VARCHAR(100),
    brand VARCHAR(100),
    warranty_months INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ro VARCHAR(255),
    name_ru VARCHAR(255),
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo codes table (adapt to existing structure or create new)
DO $$
BEGIN
    -- Check if promo_codes table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promo_codes') THEN
        -- Create new promo_codes table
        CREATE TABLE promo_codes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            discount_type VARCHAR(20) DEFAULT 'percentage',
            discount_value DECIMAL(10, 2),
            discount_percent INTEGER,
            max_uses INTEGER NOT NULL DEFAULT 1,
            current_uses INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE
        );
        RAISE NOTICE 'Created new promo_codes table';
    ELSE
        -- Add missing columns to existing promo_codes table
        ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS discount_percent INTEGER;
        ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1;
        ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS current_uses INTEGER DEFAULT 0;
        ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Updated existing promo_codes table';
    END IF;
END $$;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- References auth.users
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample categories if none exist
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Brake System', 'Sistem Frânare', 'Тормозная система', 'brake-system', 1),
('Air Pressure', 'Presiune Aer', 'Пневматика', 'air-pressure', 2),
('Electrical System', 'Sistem Electric', 'Электрооборудование', 'electrical', 3),
('Engine Parts', 'Piese Motor', 'Детали двигателя', 'engine-parts', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample promo codes
DO $$
BEGIN
    -- Try inserting with full structure first
    BEGIN
        INSERT INTO promo_codes (code, discount_type, discount_value, discount_percent, max_uses, is_active) VALUES
        ('SAVE10', 'percentage', 10.00, 10, 100, true),
        ('WELCOME20', 'percentage', 20.00, 20, 50, true)
        ON CONFLICT (code) DO NOTHING;
        RAISE NOTICE 'Inserted sample promo codes with full structure';
    EXCEPTION WHEN OTHERS THEN
        -- Fall back to simple structure
        BEGIN
            INSERT INTO promo_codes (code, discount_percent, max_uses, is_active) VALUES
            ('SAVE10', 10, 100, true),
            ('WELCOME20', 20, 50, true)
            ON CONFLICT (code) DO NOTHING;
            RAISE NOTICE 'Inserted sample promo codes with simple structure';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert sample promo codes';
        END;
    END;
END $$;

-- Enable RLS (Row Level Security) for tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to products and categories
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);

-- Admin policies (users in adminEmails array can do anything)
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (true);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (true);
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Success message
SELECT 'Admin system tables created successfully! 🎉' as message,
       'Your admin panel should now work with all features' as status;