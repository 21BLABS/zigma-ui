-- Temporarily disable RLS for chat_usage to allow fallback auth
ALTER TABLE chat_usage DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for chat_usage table!' as status;
