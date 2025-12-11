-- Van Hool Parts Complete Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_compatibility CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS promocodes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Romania',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ro TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_en TEXT,
    description_ro TEXT,
    description_ru TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    part_code TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL,
    name_ro TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description_en TEXT,
    description_ro TEXT,
    description_ru TEXT,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT,
    weight DECIMAL(8,3),
    dimensions_length DECIMAL(8,2),
    dimensions_width DECIMAL(8,2),
    dimensions_height DECIMAL(8,2),
    image_url TEXT,
    images TEXT[], -- Array of image URLs
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product compatibility (for Van Hool models)
CREATE TABLE product_compatibility (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    van_hool_model TEXT NOT NULL, -- e.g., 'AG300', 'A330', 'T917', etc.
    year_from INTEGER,
    year_to INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promocodes table
CREATE TABLE promocodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carts table
CREATE TABLE carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest carts
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    promo_code TEXT,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Either user_id or session_id must be present
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Cart items table
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(cart_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_number TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    promo_code TEXT,
    
    -- Shipping details
    shipping_first_name TEXT NOT NULL,
    shipping_last_name TEXT NOT NULL,
    shipping_company TEXT,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    shipping_phone TEXT,
    
    -- Billing details (same as shipping if not specified)
    billing_first_name TEXT,
    billing_last_name TEXT,
    billing_company TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_postal_code TEXT,
    billing_country TEXT,
    billing_phone TEXT,
    
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    notes TEXT,
    
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    part_code TEXT NOT NULL, -- Store part code in case product is deleted
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_part_code ON products(part_code);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (is_active = true);

-- Brands policies (public read)  
CREATE POLICY "Brands are viewable by everyone" ON brands FOR SELECT USING (is_active = true);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true AND status = 'active');

-- Product compatibility policies (public read)
CREATE POLICY "Product compatibility is viewable by everyone" ON product_compatibility FOR SELECT USING (true);

-- Promocodes policies (public read for validation)
CREATE POLICY "Active promocodes are viewable by everyone" ON promocodes FOR SELECT USING (is_active = true);

-- Cart policies (users can manage their own carts)
CREATE POLICY "Users can view own carts" ON carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own carts" ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own carts" ON carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own carts" ON carts FOR DELETE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can view own cart items" ON cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample data

-- Van Hool brand
INSERT INTO brands (name, description) VALUES 
('Van Hool', 'Original Van Hool OEM parts and accessories');

-- Main categories
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Brake System', 'Sistem Frânare', 'Тормозная система', 'brake-system', 1),
('Air Pressure', 'Presiune Aer', 'Пневматика', 'air-pressure', 2),
('Chassis & Suspension', 'Șasiu & Suspensie', 'Шасси и подвеска', 'chassis-suspension', 3),
('Axles & Transmission', 'Punți & Transmisie', 'Оси и трансмиссия', 'axles-transmission', 4),
('Body & Interior', 'Caroserie & Interior', 'Кузов и салон', 'body-interior', 5),
('Engine & Cooling', 'Motor & Răcire', 'Двигатель и охлаждение', 'engine-cooling', 6),
('Electrical System', 'Sistem Electric', 'Электрооборудование', 'electrical-system', 7);

-- Sample products
INSERT INTO products (
    part_code, slug, name_en, name_ro, name_ru,
    description_en, description_ro, description_ru,
    category_id, brand_id, price, stock_quantity, is_featured
) 
SELECT 
    'VH-BP-F-AG300-001',
    'brake-pad-front-vanhool-ag300',
    'Front Brake Pads Van Hool AG300',
    'Plăcuțe Frână Față Van Hool AG300', 
    'Передние тормозные колодки Van Hool AG300',
    'Original Van Hool front brake pads for AG300 bus model. Premium quality ceramic compound for optimal braking performance.',
    'Plăcuțe de frână originale Van Hool pentru modelul de autobuz AG300. Compus ceramic premium pentru performanță optimă de frânare.',
    'Оригинальные передние тормозные колодки Van Hool для автобуса модели AG300. Премиум керамический состав для оптимальной тормозной производительности.',
    (SELECT id FROM categories WHERE slug = 'brake-system'),
    (SELECT id FROM brands WHERE name = 'Van Hool'),
    125.99,
    15,
    true
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'brake-system')
AND EXISTS (SELECT 1 FROM brands WHERE name = 'Van Hool');

INSERT INTO products (
    part_code, slug, name_en, name_ro, name_ru,
    description_en, description_ro, description_ru,
    category_id, brand_id, price, stock_quantity, is_featured
)
SELECT 
    'VH-AS-R-A330-002',
    'air-suspension-rear-vanhool-a330',
    'Rear Air Suspension Van Hool A330',
    'Suspensie Pneumatică Spate Van Hool A330',
    'Задняя пневмоподвеска Van Hool A330',
    'Original Van Hool rear air suspension system for A330 coach. Complete assembly with air spring and shock absorber.',
    'Sistem original de suspensie pneumatică spate Van Hool pentru autocar A330. Ansamblu complet cu arc pneumatic și amortizor.',
    'Оригинальная система задней пневмоподвески Van Hool для автобуса A330. Полная сборка с пневморессорой и амортизатором.',
    (SELECT id FROM categories WHERE slug = 'chassis-suspension'),
    (SELECT id FROM brands WHERE name = 'Van Hool'),
    890.50,
    8,
    true
WHERE EXISTS (SELECT 1 FROM categories WHERE slug = 'chassis-suspension')
AND EXISTS (SELECT 1 FROM brands WHERE name = 'Van Hool');

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update cart totals
CREATE OR REPLACE FUNCTION public.update_cart_total()
RETURNS trigger AS $$
BEGIN
    -- Update cart total when cart items change
    UPDATE carts 
    SET 
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM cart_items 
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for cart total updates
DROP TRIGGER IF EXISTS cart_items_total_update ON cart_items;
CREATE TRIGGER cart_items_total_update
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW EXECUTE PROCEDURE public.update_cart_total();