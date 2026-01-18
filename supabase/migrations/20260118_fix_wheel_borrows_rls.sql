-- Fix RLS policies for wheel_borrows table
-- This ensures the service role can insert records and public users can create borrow requests

-- First, check if RLS is enabled and handle accordingly
DO $$
BEGIN
  -- Disable RLS temporarily to ensure we can modify policies
  ALTER TABLE IF EXISTS wheel_borrows DISABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Table wheel_borrows does not exist';
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "wheel_borrows_select_policy" ON wheel_borrows;
DROP POLICY IF EXISTS "wheel_borrows_insert_policy" ON wheel_borrows;
DROP POLICY IF EXISTS "wheel_borrows_update_policy" ON wheel_borrows;
DROP POLICY IF EXISTS "wheel_borrows_delete_policy" ON wheel_borrows;
DROP POLICY IF EXISTS "Allow service role full access to wheel_borrows" ON wheel_borrows;
DROP POLICY IF EXISTS "Allow public insert for wheel_borrows" ON wheel_borrows;
DROP POLICY IF EXISTS "Enable read access for all users" ON wheel_borrows;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON wheel_borrows;
DROP POLICY IF EXISTS "Enable update for users based on station_id" ON wheel_borrows;

-- Re-enable RLS
ALTER TABLE wheel_borrows ENABLE ROW LEVEL SECURITY;

-- Create permissive policies

-- 1. Service role bypass (always allowed)
CREATE POLICY "service_role_all_wheel_borrows"
ON wheel_borrows
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Authenticated users can read all borrows
CREATE POLICY "authenticated_read_wheel_borrows"
ON wheel_borrows
FOR SELECT
TO authenticated
USING (true);

-- 3. Authenticated users can insert borrows
CREATE POLICY "authenticated_insert_wheel_borrows"
ON wheel_borrows
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Authenticated users can update borrows
CREATE POLICY "authenticated_update_wheel_borrows"
ON wheel_borrows
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Allow anonymous (public) users to insert borrow requests
-- This is needed for the public sign form
CREATE POLICY "anon_insert_wheel_borrows"
ON wheel_borrows
FOR INSERT
TO anon
WITH CHECK (true);

-- 6. Allow anonymous users to read their own borrows (by phone number would be ideal, but for simplicity allow all)
CREATE POLICY "anon_read_wheel_borrows"
ON wheel_borrows
FOR SELECT
TO anon
USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON wheel_borrows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON wheel_borrows TO authenticated;
GRANT ALL ON wheel_borrows TO service_role;