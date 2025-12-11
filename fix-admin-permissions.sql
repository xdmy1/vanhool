-- Fix Admin Permissions for RLS
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies and create admin-friendly ones

-- Drop all existing policies on products
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Drop all existing policies on categories  
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Drop all existing policies on promo_codes
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;

-- Drop all existing policies on orders
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Users can see own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Drop all existing policies on order_items
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;

-- Create function to check if user is admin (by email)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.email() IN (
        'bobernagadamianw2312@gmail.com',  -- Your email
        'admin@vanhoolparts.com'           -- Default admin email
        -- Add more admin emails here as needed
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Products policies
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (is_admin_user());

-- Categories policies
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING (is_admin_user());

-- Promo codes policies (admin only)
CREATE POLICY "Admins can view promo codes" ON promo_codes FOR SELECT USING (is_admin_user());
CREATE POLICY "Admins can insert promo codes" ON promo_codes FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Admins can update promo codes" ON promo_codes FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admins can delete promo codes" ON promo_codes FOR DELETE USING (is_admin_user());

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
    user_id::text = auth.uid()::text OR is_admin_user()
);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (
    user_id::text = auth.uid()::text
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING (is_admin_user());

-- Order items policies
CREATE POLICY "Users can view order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id::text = auth.uid()::text OR is_admin_user())
    )
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id::text = auth.uid()::text
    )
);
CREATE POLICY "Admins can update order items" ON order_items FOR UPDATE USING (is_admin_user());
CREATE POLICY "Admins can delete order items" ON order_items FOR DELETE USING (is_admin_user());

-- Test the admin function
SELECT 
    auth.email() as current_user_email,
    is_admin_user() as is_admin,
    'Admin permissions should now work!' as message;