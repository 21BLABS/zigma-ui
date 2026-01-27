-- Comprehensive fix for chat_usage RLS issues
-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'chat_usage';

-- Disable RLS completely
ALTER TABLE chat_usage DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to be sure
DROP POLICY IF EXISTS "Users can view own chat usage" ON chat_usage;
DROP POLICY IF EXISTS "Users can update own chat usage" ON chat_usage;
DROP POLICY IF EXISTS "Users can insert own chat usage" ON chat_usage;
DROP POLICY IF EXISTS "Users can delete own chat usage" ON chat_usage;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'chat_usage';

SELECT 'RLS completely disabled for chat_usage!' as status;
