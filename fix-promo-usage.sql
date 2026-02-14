-- Fix promo code usage tracking
-- Run this in Supabase SQL Editor

-- Create an RPC function that increments promo code usage
-- Uses SECURITY DEFINER to bypass RLS (runs with admin privileges)
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code_id UUID)
RETURNS JSON AS $$
DECLARE
    promo RECORD;
    new_uses INTEGER;
BEGIN
    -- Get current promo code data
    SELECT id, code, current_uses, max_uses, is_active
    INTO promo
    FROM promocodes
    WHERE id = promo_code_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Promo code not found');
    END IF;

    -- Calculate new usage count
    new_uses := COALESCE(promo.current_uses, 0) + 1;

    -- Update the promo code
    UPDATE promocodes
    SET current_uses = new_uses,
        is_active = CASE
            WHEN new_uses >= COALESCE(promo.max_uses, 1) THEN false
            ELSE is_active
        END,
        updated_at = NOW()
    WHERE id = promo_code_id;

    RETURN json_build_object(
        'success', true,
        'code', promo.code,
        'new_uses', new_uses,
        'max_uses', COALESCE(promo.max_uses, 1),
        'disabled', new_uses >= COALESCE(promo.max_uses, 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a version that works by code string (fallback)
CREATE OR REPLACE FUNCTION increment_promo_usage_by_code(promo_code TEXT)
RETURNS JSON AS $$
DECLARE
    promo RECORD;
    new_uses INTEGER;
BEGIN
    -- Get current promo code data
    SELECT id, code, current_uses, max_uses, is_active
    INTO promo
    FROM promocodes
    WHERE code = UPPER(promo_code);

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Promo code not found');
    END IF;

    -- Calculate new usage count
    new_uses := COALESCE(promo.current_uses, 0) + 1;

    -- Update the promo code
    UPDATE promocodes
    SET current_uses = new_uses,
        is_active = CASE
            WHEN new_uses >= COALESCE(promo.max_uses, 1) THEN false
            ELSE is_active
        END,
        updated_at = NOW()
    WHERE id = promo.id;

    RETURN json_build_object(
        'success', true,
        'code', promo.code,
        'new_uses', new_uses,
        'max_uses', COALESCE(promo.max_uses, 1),
        'disabled', new_uses >= COALESCE(promo.max_uses, 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_promo_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_promo_usage_by_code(TEXT) TO authenticated;

-- Also allow anon role (in case auth token is anon)
GRANT EXECUTE ON FUNCTION increment_promo_usage(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_promo_usage_by_code(TEXT) TO anon;

-- Verify functions were created
SELECT 'Functions created successfully' as status;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('increment_promo_usage', 'increment_promo_usage_by_code');
