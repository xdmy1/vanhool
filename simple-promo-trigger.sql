-- Simple trigger that avoids timestamp type issues
-- Run this AFTER the minimal sync

-- Create simple sync function
CREATE OR REPLACE FUNCTION sync_promo_codes_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO promocodes (code, discount_type, discount_value, is_active)
        VALUES (
            NEW.code,
            'percentage',
            COALESCE(NEW.discount_percent, 0),
            NEW.is_active
        )
        ON CONFLICT (code) DO UPDATE SET
            discount_value = EXCLUDED.discount_value,
            is_active = EXCLUDED.is_active;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        DELETE FROM promocodes WHERE code = OLD.code;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_promo_codes_simple_trigger ON promo_codes;
CREATE TRIGGER sync_promo_codes_simple_trigger
    AFTER INSERT OR UPDATE OR DELETE ON promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION sync_promo_codes_simple();

-- Test the trigger by showing it was created
SELECT 'Simple trigger created successfully' as status;

-- Show current promocodes
SELECT code, discount_type, discount_value, is_active FROM promocodes ORDER BY id DESC LIMIT 3;