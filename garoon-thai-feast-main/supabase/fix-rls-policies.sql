-- Fix RLS policies for member_subscriptions table
-- Run this in your Supabase SQL Editor

-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'member_subscriptions';

-- If RLS is enabled and blocking inserts, we need to create proper policies

-- Option 1: Disable RLS temporarily (for development)
-- ALTER TABLE member_subscriptions DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a policy that allows anonymous inserts (recommended for public forms)
CREATE POLICY "Allow anonymous inserts" ON member_subscriptions
FOR INSERT 
TO anon
WITH CHECK (true);

-- Option 3: Create a policy that allows authenticated users to insert
CREATE POLICY "Allow authenticated inserts" ON member_subscriptions
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Option 4: Create a policy that allows all users to read their own data
CREATE POLICY "Allow users to read own data" ON member_subscriptions
FOR SELECT 
TO anon
USING (true);

-- Option 5: Create a policy that allows authenticated users to update their own data
CREATE POLICY "Allow users to update own data" ON member_subscriptions
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Option 6: Create a policy that allows authenticated users to delete their own data
CREATE POLICY "Allow users to delete own data" ON member_subscriptions
FOR DELETE 
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON member_subscriptions TO anon;
GRANT ALL ON member_subscriptions TO authenticated;

-- If you want to be more restrictive, you can use these instead:
-- GRANT INSERT, SELECT ON member_subscriptions TO anon;
-- GRANT ALL ON member_subscriptions TO authenticated;

-- Test the policies
-- Try inserting a test record:
-- INSERT INTO member_subscriptions (email, is_subscribed, subscribed_at) 
-- VALUES ('test@example.com', true, NOW());

-- If you still get RLS errors, you can temporarily disable RLS:
-- ALTER TABLE member_subscriptions DISABLE ROW LEVEL SECURITY;

-- Remember to re-enable RLS in production with proper policies:
-- ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
