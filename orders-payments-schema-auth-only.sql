-- Complete Orders and Payments Database Schema (Authenticated Users Only)
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Create orders table (users must be logged in)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed')),
    
    -- Customer information
    customer_info JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    
    -- Order totals
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    
    -- Promo code information
    promocode_id UUID REFERENCES promocodes(id) ON DELETE SET NULL,
    promocode_code TEXT,
    
    -- Payment and shipping methods
    payment_method TEXT NOT NULL CHECK (payment_method IN ('paynet', 'cash', 'transfer')),
    shipping_method TEXT NOT NULL DEFAULT 'standard' CHECK (shipping_method IN ('standard', 'express')),
    
    -- Additional information
    notes TEXT,
    session_id TEXT,
    
    -- Status timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Product snapshot at time of order
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_image TEXT,
    product_details JSONB, -- Brand, category, etc.
    
    -- Pricing and quantity
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('paynet', 'cash', 'transfer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_delivery', 'awaiting_transfer', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
    
    -- Gateway/external information
    gateway_response JSONB,
    transaction_id TEXT,
    transfer_details JSONB,
    
    -- Additional information
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE
);

-- Create payment_refunds table
CREATE TABLE IF NOT EXISTS public.payment_refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Refund details
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Gateway information
    gateway_response JSONB,
    refund_transaction_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create user_addresses table for saved addresses
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Address details
    label TEXT NOT NULL, -- e.g., "Home", "Work", "Billing"
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'România',
    
    -- Address flags
    is_default BOOLEAN DEFAULT FALSE,
    is_billing BOOLEAN DEFAULT FALSE,
    is_shipping BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carts table for persistent cart storage
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Cart data
    items JSONB NOT NULL DEFAULT '[]',
    promocode_id UUID REFERENCES promocodes(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create order_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Status change details
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promocodes table (if not exists)
CREATE TABLE IF NOT EXISTS public.promocodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Discount settings
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')),
    value DECIMAL(10,2) NOT NULL,
    
    -- Usage limits
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    min_order_amount DECIMAL(10,2),
    
    -- Validity period
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment_id ON payment_refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_order_id ON payment_refunds(order_id);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_active ON promocodes(is_active);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON user_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promocodes_updated_at ON promocodes;
CREATE TRIGGER update_promocodes_updated_at 
    BEFORE UPDATE ON promocodes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create order status history
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create history if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply status history trigger
DROP TRIGGER IF EXISTS order_status_change_history ON orders;
CREATE TRIGGER order_status_change_history
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_status_history();

-- Set up Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders (users can only see their own orders)
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Users can view items of their orders" ON order_items;
CREATE POLICY "Users can view items of their orders" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert items for their orders" ON order_items;
CREATE POLICY "Users can insert items for their orders" ON order_items
    FOR INSERT WITH CHECK (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for payments
DROP POLICY IF EXISTS "Users can view payments for their orders" ON payments;
CREATE POLICY "Users can view payments for their orders" ON payments
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can insert payments" ON payments;
CREATE POLICY "System can insert payments" ON payments
    FOR INSERT WITH CHECK (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can update payments" ON payments;
CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for payment_refunds
DROP POLICY IF EXISTS "Users can view refunds for their orders" ON payment_refunds;
CREATE POLICY "Users can view refunds for their orders" ON payment_refunds
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for user_addresses
DROP POLICY IF EXISTS "Users can manage their own addresses" ON user_addresses;
CREATE POLICY "Users can manage their own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for carts
DROP POLICY IF EXISTS "Users can manage their own cart" ON carts;
CREATE POLICY "Users can manage their own cart" ON carts
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for order_status_history
DROP POLICY IF EXISTS "Users can view history of their orders" ON order_status_history;
CREATE POLICY "Users can view history of their orders" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for promocodes (read-only for users)
DROP POLICY IF EXISTS "Users can view active promocodes" ON promocodes;
CREATE POLICY "Users can view active promocodes" ON promocodes
    FOR SELECT USING (is_active = true);

-- Insert sample promocodes
INSERT INTO promocodes (code, name, description, type, value, max_uses, min_order_amount, is_active)
VALUES 
    ('WELCOME10', 'Welcome 10%', '10% discount for new customers', 'percentage', 10, 100, 50, true),
    ('FREESHIP', 'Free Shipping', 'Free shipping on all orders', 'free_shipping', 0, NULL, 100, true),
    ('SAVE20EUR', 'Save 20 EUR', '20 EUR off orders over 200 EUR', 'fixed_amount', 20, 50, 200, true)
ON CONFLICT (code) DO NOTHING;

-- Success message
SELECT 'Orders and Payments schema created successfully for authenticated users only!' as status;