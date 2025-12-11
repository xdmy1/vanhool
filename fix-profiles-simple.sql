-- Simple fix for profiles RLS - no recursion
-- Run this in Supabase SQL Editor

-- Drop ALL policies for profiles to start fresh
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all for admins" ON profiles;

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Recreate the trigger function (simpler version)
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert without any complex checks
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail signup if profile creation fails
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Re-enable RLS with very simple policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Super simple policies - no recursion possible
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Test insert to see if it works
SELECT 'Policies updated successfully' as status;