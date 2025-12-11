-- Fix Slug Constraint for Products Table
-- This script makes the slug field optional and creates a function to auto-generate slugs

-- 1. Make slug field nullable (if it exists and is NOT NULL)
DO $$
BEGIN
    -- Check if slug column exists and is not nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'slug' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE products ALTER COLUMN slug DROP NOT NULL;
        RAISE NOTICE 'Made slug column nullable';
    ELSE
        RAISE NOTICE 'Slug column is already nullable or does not exist';
    END IF;
END $$;

-- 2. Create function to generate slug from product name or part_code
CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT, part_code TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Use product name if available, otherwise use part_code
    IF product_name IS NOT NULL AND product_name != '' THEN
        RETURN lower(regexp_replace(trim(product_name), '[^a-zA-Z0-9]+', '-', 'g'));
    ELSIF part_code IS NOT NULL AND part_code != '' THEN
        RETURN lower(regexp_replace(trim(part_code), '[^a-zA-Z0-9]+', '-', 'g'));
    ELSE
        RETURN 'product-' || extract(epoch from now())::text;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION auto_generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate slug if it's null or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_product_slug(NEW.name_en, NEW.part_code);
        
        -- Ensure uniqueness by adding a number if needed
        DECLARE
            base_slug TEXT := NEW.slug;
            counter INTEGER := 1;
        BEGIN
            WHILE EXISTS (SELECT 1 FROM products WHERE slug = NEW.slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
                NEW.slug = base_slug || '-' || counter;
                counter = counter + 1;
            END LOOP;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_auto_generate_product_slug ON products;
CREATE TRIGGER trigger_auto_generate_product_slug
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_product_slug();

-- 5. Update existing products that have null slugs
UPDATE products 
SET slug = generate_product_slug(name_en, part_code)
WHERE slug IS NULL OR slug = '';

-- Success message
SELECT 'Slug constraint fixed! Products can now be added without providing a slug.' as message,
       'Slugs will be auto-generated from product names or part codes.' as note;