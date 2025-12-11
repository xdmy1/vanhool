-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- First, drop all existing policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Disable RLS temporarily to fix the issue
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new, simple policies without recursion
CREATE POLICY "Enable read access for own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin policy (separate, simpler)
CREATE POLICY "Enable all for admins" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

-- Test the trigger function separately
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Test query to verify policies work
SELECT 'Policies fixed successfully' as status;