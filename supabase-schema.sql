-- Van Hool Parts Database Schema
-- Enable RLS on all tables for security

-- Categories table
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

-- Products table
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
  category_id UUID REFERENCES categories(id) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  compatibility JSONB DEFAULT '[]',
  weight_kg DECIMAL(8,2),
  dimensions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
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

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RON',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  promo_code VARCHAR(50),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo codes table
CREATE TABLE promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table (for logged in users)
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist table
CREATE TABLE wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Product reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity log
CREATE TABLE admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are manageable by admins" ON categories FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Products: Public read, admin write
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Products are manageable by admins" ON products FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Profiles: Users can view/edit own profile, admins can view all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Orders: Users can view own orders, admins can view all
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Order items: Same as orders
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Promo codes: Public read for active codes, admin write
CREATE POLICY "Active promo codes are viewable" ON promo_codes FOR SELECT USING (
  is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at >= NOW())
);
CREATE POLICY "Promo codes are manageable by admins" ON promo_codes FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Cart items: Users can manage own cart
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Wishlist: Users can manage own wishlist
CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Reviews: Users can create/view, admins can moderate
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can moderate reviews" ON reviews FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Admin logs: Only admins can view
CREATE POLICY "Only admins can view logs" ON admin_logs FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);
CREATE POLICY "Admins can create logs" ON admin_logs FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger to create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'VH' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(EXTRACT(EPOCH FROM NOW())::INTEGER % 10000, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for order numbers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_part_code ON products(part_code);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Full text search indexes
CREATE INDEX idx_products_search_en ON products USING GIN(to_tsvector('english', name_en || ' ' || COALESCE(description_en, '') || ' ' || part_code));
CREATE INDEX idx_products_search_ro ON products USING GIN(to_tsvector('romanian', name_ro || ' ' || COALESCE(description_ro, '') || ' ' || part_code));

-- Storage bucket for product images (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
-- CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
-- CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));
-- CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));