-- Minimal sync script - only essential columns
-- Run this in Supabase SQL Editor

-- Check table structures first
SELECT 'promocodes columns and types:' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'promocodes'
ORDER BY ordinal_position;

SELECT 'promo_codes columns and types:' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'promo_codes'
ORDER BY ordinal_position;

-- Show existing data
SELECT 'promo_codes data count:' as info, COUNT(*) as count FROM promo_codes;
SELECT 'promocodes data count:' as info, COUNT(*) as count FROM promocodes;

-- Minimal sync - only the absolutely essential columns
INSERT INTO promocodes (code, discount_type, discount_value, is_active)
SELECT 
    pc.code,
    'percentage' as discount_type,
    COALESCE(pc.discount_percent, 0) as discount_value,
    pc.is_active
FROM promo_codes pc
WHERE NOT EXISTS (
    SELECT 1 FROM promocodes p WHERE p.code = pc.code
)
ON CONFLICT (code) DO UPDATE SET
    discount_value = EXCLUDED.discount_value,
    is_active = EXCLUDED.is_active;

-- Show the result
SELECT 'Sync completed. promocodes now has:' as info, COUNT(*) as count FROM promocodes;

-- Show sample data
SELECT 'Sample promocodes after sync:' as info, id, code, discount_type, discount_value, is_active 
FROM promocodes 
ORDER BY id DESC 
LIMIT 5;