-- Quick setup for Van Hool Parts - Run this FIRST
-- This creates just the essential tables for testing

-- Check if tables exist and create if they don't
DO $$ 
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            company VARCHAR(255),
            phone VARCHAR(20),
            is_admin BOOLEAN DEFAULT false,
            language_preference VARCHAR(2) DEFAULT 'en',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Add policies
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- Create categories table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        CREATE TABLE categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            slug VARCHAR(255) UNIQUE NOT NULL,
            name_en VARCHAR(255) NOT NULL,
            name_ro VARCHAR(255) NOT NULL,
            name_ru VARCHAR(255) NOT NULL,
            parent_id UUID REFERENCES categories(id),
            icon VARCHAR(255),
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
    END IF;

    -- Create products table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE TABLE products (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            slug VARCHAR(255) UNIQUE NOT NULL,
            part_code VARCHAR(100) UNIQUE NOT NULL,
            name_en VARCHAR(255) NOT NULL,
            name_ro VARCHAR(255) NOT NULL,
            name_ru VARCHAR(255) NOT NULL,
            description_en TEXT,
            description_ro TEXT,
            description_ru TEXT,
            category_id UUID REFERENCES categories(id),
            price DECIMAL(10,2) NOT NULL,
            stock_quantity INTEGER DEFAULT 0,
            is_featured BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            images JSONB DEFAULT '[]',
            specifications JSONB DEFAULT '{}',
            compatibility JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Insert some basic categories
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('brake-system', 'Brake System', 'Sistem de Frânare', 'Тормозная система', 1),
('air-pressure', 'Air Pressure', 'Presiune Aer', 'Пневматическая система', 2),
('engine-cooling', 'Engine & Cooling', 'Motor și Răcire', 'Двигатель и охлаждение', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert a sample product
DO $$
DECLARE 
    brake_id UUID;
BEGIN
    SELECT id INTO brake_id FROM categories WHERE slug = 'brake-system' LIMIT 1;
    
    IF brake_id IS NOT NULL THEN
        INSERT INTO products (slug, part_code, name_en, name_ro, name_ru, description_en, description_ro, description_ru, category_id, price, stock_quantity, is_featured) 
        VALUES (
            'brake-pad-front-vanhool',
            'VH-BP-F-001',
            'Front Brake Pads Van Hool',
            'Plăcuțe Frână Față Van Hool',
            'Передние тормозные колодки Van Hool',
            'High-quality front brake pads for Van Hool buses',
            'Plăcuțe de frână față de înaltă calitate pentru autobuze Van Hool',
            'Высококачественные передние тормозные колодки для автобусов Van Hool',
            brake_id,
            299.99,
            15,
            true
        ) ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;