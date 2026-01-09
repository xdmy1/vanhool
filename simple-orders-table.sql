-- Simple orders table - only essential fields
-- Run this in Supabase SQL Editor

-- Drop existing orders table (WARNING: This will delete all data!)
DROP TABLE IF EXISTS orders CASCADE;

-- Create simple orders table with only what we need
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    
    -- Customer info (simple fields)
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    
    -- Order items (as JSON)
    items JSONB NOT NULL DEFAULT '[]',
    
    -- Pricing (simple numbers)
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 25.00,
    total DECIMAL(10,2) DEFAULT 0,
    
    -- Order details
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own orders
CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to update their own orders
CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Show the new table structure
SELECT 
    'New simple orders table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;