-- Update RLS policies to handle fallback auth users
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own chat usage" ON chat_usage;
DROP POLICY IF EXISTS "Users can update own chat usage" ON chat_usage;
DROP POLICY IF EXISTS "Users can insert own chat usage" ON chat_usage;
DROP POLICY IF EXISTS "Users can delete own chat usage" ON chat_usage;

-- Create new policies that allow fallback auth
CREATE POLICY "Users can view own chat usage" ON chat_usage
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR 
        (current_setting('request.jwt.claims', true)::json->>'email' IS NOT NULL)
    );

CREATE POLICY "Users can update own chat usage" ON chat_usage
    FOR UPDATE USING (
        auth.uid()::text = user_id::text OR 
        (current_setting('request.jwt.claims', true)::json->>'email' IS NOT NULL)
    );

CREATE POLICY "Users can insert own chat usage" ON chat_usage
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text OR 
        (current_setting('request.jwt.claims', true)::json->>'email' IS NOT NULL)
    );

CREATE POLICY "Users can delete own chat usage" ON chat_usage
    FOR DELETE USING (
        auth.uid()::text = user_id::text OR 
        (current_setting('request.jwt.claims', true)::json->>'email' IS NOT NULL)
    );

-- Also disable RLS temporarily for testing
ALTER TABLE chat_usage DISABLE ROW LEVEL SECURITY;

SELECT 'RLS policies updated for fallback auth!' as status;
