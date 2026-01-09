-- Add customer fields to orders table
-- Run this in Supabase SQL Editor

-- Add customer_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
        RAISE NOTICE 'Added customer_name column';
    ELSE
        RAISE NOTICE 'customer_name column already exists';
    END IF;
END $$;

-- Add customer_email column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_email TEXT;
        RAISE NOTICE 'Added customer_email column';
    ELSE
        RAISE NOTICE 'customer_email column already exists';
    END IF;
END $$;

-- Add customer_phone column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_phone TEXT;
        RAISE NOTICE 'Added customer_phone column';
    ELSE
        RAISE NOTICE 'customer_phone column already exists';
    END IF;
END $$;

-- Add customer_company column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_company'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_company TEXT;
        RAISE NOTICE 'Added customer_company column';
    ELSE
        RAISE NOTICE 'customer_company column already exists';
    END IF;
END $$;

-- Add shipping_method column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_method'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_method TEXT DEFAULT 'standard';
        RAISE NOTICE 'Added shipping_method column';
    ELSE
        RAISE NOTICE 'shipping_method column already exists';
    END IF;
END $$;

-- Add payment_method column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_method TEXT;
        RAISE NOTICE 'Added payment_method column';
    ELSE
        RAISE NOTICE 'payment_method column already exists';
    END IF;
END $$;

-- Add notes column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'notes'
    ) THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    ELSE
        RAISE NOTICE 'notes column already exists';
    END IF;
END $$;

-- Add order_number column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
        RAISE NOTICE 'Added order_number column';
    ELSE
        RAISE NOTICE 'order_number column already exists';
    END IF;
END $$;

-- Add subtotal column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added subtotal column';
    ELSE
        RAISE NOTICE 'subtotal column already exists';
    END IF;
END $$;

-- Add billing_address column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'billing_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_address TEXT;
        RAISE NOTICE 'Added billing_address column';
    ELSE
        RAISE NOTICE 'billing_address column already exists';
    END IF;
END $$;

-- Add shipping_address column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'shipping_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipping_address TEXT;
        RAISE NOTICE 'Added shipping_address column';
    ELSE
        RAISE NOTICE 'shipping_address column already exists';
    END IF;
END $$;

-- Add items column (JSONB for order items)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'items'
    ) THEN
        ALTER TABLE orders ADD COLUMN items JSONB;
        RAISE NOTICE 'Added items column';
    ELSE
        RAISE NOTICE 'items column already exists';
    END IF;
END $$;

-- Add total column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total'
    ) THEN
        ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added total column';
    ELSE
        RAISE NOTICE 'total column already exists';
    END IF;
END $$;

-- Add total_amount column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added total_amount column';
    ELSE
        RAISE NOTICE 'total_amount column already exists';
    END IF;
END $$;

-- Show final table structure
SELECT 
    'All order fields added:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY column_name;