-- Check the actual structure of the categories table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'categories'
ORDER BY ordinal_position;