-- Fix Product Visibility Issues
-- This script ensures products appear on the frontend by setting correct field values

-- 1. Show current state of products
SELECT 
    id,
    part_code,
    name_en,
    is_active,
    status,
    is_featured,
    created_at
FROM products 
ORDER BY created_at DESC;

-- 2. Update all products to be active and visible
UPDATE products 
SET 
    is_active = true,
    status = 'active'
WHERE is_active IS NULL OR is_active = false OR status != 'active';

-- 3. Set some products as featured (first 4 products)
UPDATE products 
SET is_featured = true 
WHERE id IN (
    SELECT id FROM products 
    ORDER BY created_at DESC 
    LIMIT 4
);

-- 4. Ensure products have required fields for display
UPDATE products 
SET 
    name_en = COALESCE(name_en, part_code, 'Van Hool Part'),
    price = COALESCE(price, 99.99),
    stock_quantity = COALESCE(stock_quantity, 1)
WHERE name_en IS NULL OR price IS NULL OR stock_quantity IS NULL;

-- 5. Show updated state
SELECT 
    'After Update:' as status,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE is_active = true) as active_products,
    COUNT(*) FILTER (WHERE status = 'active') as status_active,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_products
FROM products;

-- 6. Show sample of updated products
SELECT 
    part_code,
    name_en,
    is_active,
    status,
    is_featured,
    price,
    stock_quantity
FROM products 
ORDER BY created_at DESC 
LIMIT 5;