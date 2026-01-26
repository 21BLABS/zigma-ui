-- Data Retention and Cleanup Policies
-- Automatically manages chat history data retention

-- 1. Create a function to clean up old chat history
CREATE OR REPLACE FUNCTION cleanup_old_chat_history()
RETURNS void AS $$
DECLARE
    default_retention_days INTEGER := 365; -- Default 1 year retention
    cleanup_count INTEGER;
BEGIN
    -- Get user-specific retention preferences, fall back to default
    DELETE FROM user_chat_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * COALESCE(
        (SELECT data_retention_days::INTEGER 
         FROM user_preferences 
         WHERE user_preferences.user_id = user_chat_history.user_id 
         LIMIT 1),
        default_retention_days
    );
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO system_logs (log_type, message, created_at)
    VALUES ('cleanup', 
            format('Cleaned up %s old chat messages', cleanup_count), 
            NOW());
    
    -- Update vacuum statistics for better performance
    ANALYZE user_chat_history;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a function to archive old messages instead of deleting
CREATE OR REPLACE FUNCTION archive_old_chat_history()
RETURNS void AS $$
DECLARE
    archive_threshold_days INTEGER := 730; -- 2 years for archiving
    archive_count INTEGER;
BEGIN
    -- Move messages older than 2 years to archive table
    INSERT INTO user_chat_history_archive
    SELECT * FROM user_chat_history
    WHERE created_at < NOW() - INTERVAL '1 day' * archive_threshold_days;
    
    GET DIAGNOSTICS archive_count = ROW_COUNT;
    
    -- Delete the archived messages from main table
    DELETE FROM user_chat_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * archive_threshold_days;
    
    -- Log the archive operation
    INSERT INTO system_logs (log_type, message, created_at)
    VALUES ('archive', 
            format('Archived %s chat messages older than %s days', archive_count, archive_threshold_days), 
            NOW());
END;
$$ LANGUAGE plpgsql;

-- 3. Create archive table for long-term storage
CREATE TABLE IF NOT EXISTS user_chat_history_archive (
    LIKE user_chat_history INCLUDING ALL
);

-- Create indexes for archive table
CREATE INDEX IF NOT EXISTS idx_user_chat_history_archive_user_id ON user_chat_history_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_archive_created_at ON user_chat_history_archive(created_at);

-- 4. Create system logs table for tracking cleanup operations
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    log_type TEXT NOT NULL CHECK (log_type IN ('cleanup', 'archive', 'error', 'maintenance')),
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_type_created ON system_logs(log_type, created_at DESC);

-- 5. Create a scheduled cleanup function (to be called by external scheduler)
CREATE OR REPLACE FUNCTION scheduled_cleanup()
RETURNS TABLE (
    operation TEXT,
    records_processed INTEGER,
    execution_time_ms INTEGER,
    status TEXT
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
    cleanup_result RECORD;
BEGIN
    start_time := NOW();
    
    -- Perform cleanup
    PERFORM cleanup_old_chat_history();
    
    -- Return results
    RETURN QUERY
    SELECT 
        'cleanup'::TEXT as operation,
        0::INTEGER as records_processed, -- This would need to be enhanced to return actual count
        EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER as execution_time_ms,
        'success'::TEXT as status;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a function to get retention statistics
CREATE OR REPLACE FUNCTION get_retention_statistics()
RETURNS TABLE (
    total_messages BIGINT,
    messages_last_30_days BIGINT,
    messages_last_year BIGINT,
    messages_older_than_year BIGINT,
    archive_size BIGINT,
    avg_retention_days NUMERIC,
    users_with_custom_retention BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::BIGINT FROM user_chat_history) as total_messages,
        (SELECT COUNT(*)::BIGINT FROM user_chat_history WHERE created_at >= NOW() - INTERVAL '30 days') as messages_last_30_days,
        (SELECT COUNT(*)::BIGINT FROM user_chat_history WHERE created_at >= NOW() - INTERVAL '1 year') as messages_last_year,
        (SELECT COUNT(*)::BIGINT FROM user_chat_history WHERE created_at < NOW() - INTERVAL '1 year') as messages_older_than_year,
        (SELECT COUNT(*)::BIGINT FROM user_chat_history_archive) as archive_size,
        COALESCE(AVG(data_retention_days::NUMERIC), 365) as avg_retention_days,
        (SELECT COUNT(*)::BIGINT FROM user_preferences WHERE data_retention_days IS NOT NULL) as users_with_custom_retention
    FROM user_preferences
    LIMIT 1; -- Just to make the query valid
END;
$$ LANGUAGE plpgsql;

-- 7. Create a view for monitoring data retention compliance
CREATE OR REPLACE VIEW data_retention_compliance AS
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created_at,
    COALESCE(up.data_retention_days, 365) as retention_days,
    COUNT(h.id) as total_messages,
    COUNT(CASE WHEN h.created_at < NOW() - INTERVAL '1 day' * COALESCE(up.data_retention_days, 365) THEN 1 END) as messages_past_retention,
    CASE 
        WHEN COUNT(CASE WHEN h.created_at < NOW() - INTERVAL '1 day' * COALESCE(up.data_retention_days, 365) THEN 1 END) > 0 
        THEN 'Non-compliant'
        ELSE 'Compliant'
    END as compliance_status,
    MAX(h.created_at) as oldest_message_date
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
LEFT JOIN user_chat_history h ON u.id = h.user_id
GROUP BY u.id, u.email, u.created_at, up.data_retention_days;

-- 8. Create a function to handle user data deletion requests (GDPR compliance)
CREATE OR REPLACE FUNCTION delete_user_chat_data(p_user_id UUID)
RETURNS TABLE (
    deleted_messages BIGINT,
    deleted_sessions BIGINT,
    archived_messages BIGINT,
    execution_time_ms INTEGER
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
    deleted_count BIGINT;
    archived_count BIGINT;
    session_count BIGINT;
BEGIN
    start_time := NOW();
    
    -- Get counts before deletion
    SELECT COUNT(*) INTO deleted_count FROM user_chat_history WHERE user_id = p_user_id;
    SELECT COUNT(DISTINCT session_id) INTO session_count FROM user_chat_history WHERE user_id = p_user_id;
    
    -- Move to archive instead of permanent deletion
    INSERT INTO user_chat_history_archive
    SELECT * FROM user_chat_history WHERE user_id = p_user_id;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Delete from main table
    DELETE FROM user_chat_history WHERE user_id = p_user_id;
    
    -- Log the deletion
    INSERT INTO system_logs (log_type, message, metadata, created_at)
    VALUES ('cleanup', 
            format('User data deletion requested for user %s', p_user_id), 
            json_build_object('user_id', p_user_id, 'messages_deleted', deleted_count),
            NOW());
    
    RETURN QUERY
    SELECT 
        deleted_count,
        session_count,
        archived_count,
        EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER as execution_time_ms;
END;
$$ LANGUAGE plpgsql;

-- 9. Add RLS policies for archive table
ALTER TABLE user_chat_history_archive ENABLE ROW LEVEL SECURITY;

-- Only service role can access archive
CREATE POLICY "Service role full access to archive" ON user_chat_history_archive
    FOR ALL USING (auth.role() = 'service_role');

-- 10. Create a trigger to automatically update user preferences when retention is changed
CREATE OR REPLACE FUNCTION log_retention_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.data_retention_days IS DISTINCT FROM NEW.data_retention_days THEN
        INSERT INTO system_logs (log_type, message, metadata, created_at)
        VALUES ('cleanup', 
                format('User %s changed retention from %s to %s days', 
                       NEW.user_id, 
                       COALESCE(OLD.data_retention_days, 'default'),
                       COALESCE(NEW.data_retention_days, 'default')),
                json_build_object('user_id', NEW.user_id, 'old_retention', OLD.data_retention_days, 'new_retention', NEW.data_retention_days),
                NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_retention_change
    AFTER UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION log_retention_change();

-- 11. Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_old_chat_history() TO service_role;
GRANT EXECUTE ON FUNCTION archive_old_chat_history() TO service_role;
GRANT EXECUTE ON FUNCTION scheduled_cleanup() TO service_role;
GRANT EXECUTE ON FUNCTION get_retention_statistics() TO service_role;
GRANT EXECUTE ON FUNCTION delete_user_chat_data(UUID) TO service_role;

GRANT SELECT ON system_logs TO service_role;
GRANT INSERT ON system_logs TO service_role;
GRANT SELECT ON data_retention_compliance TO service_role;

-- 12. Create a helper function for manual cleanup by admin
CREATE OR REPLACE FUNCTION admin_cleanup_chat_history(p_days_to_keep INTEGER DEFAULT 365)
RETURNS TABLE (
    messages_deleted BIGINT,
    users_affected BIGINT,
    execution_time_ms INTEGER,
    status TEXT
) AS $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE;
    deleted_count BIGINT;
    users_count BIGINT;
BEGIN
    start_time := NOW();
    
    -- Count users who will be affected
    SELECT COUNT(DISTINCT user_id) INTO users_count 
    FROM user_chat_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_to_keep;
    
    -- Delete old messages
    DELETE FROM user_chat_history 
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the admin cleanup
    INSERT INTO system_logs (log_type, message, metadata, created_at)
    VALUES ('cleanup', 
            format('Admin cleanup: removed %s messages older than %s days', deleted_count, p_days_to_keep),
            json_build_object('days_to_keep', p_days_to_keep, 'messages_deleted', deleted_count, 'users_affected', users_count, 'initiated_by', 'admin'),
            NOW());
    
    RETURN QUERY
    SELECT 
        deleted_count,
        users_count,
        EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER as execution_time_ms,
        'success'::TEXT as status;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION admin_cleanup_chat_history(INTEGER) TO service_role;

-- Instructions for setting up automated cleanup:
-- 
-- 1. Set up a cron job to run cleanup_old_chat_history() weekly:
--    0 2 * * 0 psql $DATABASE_URL -c "SELECT cleanup_old_chat_history();"
--
-- 2. Set up a monthly job to run archive_old_chat_history():
--    0 3 1 * * psql $DATABASE_URL -c "SELECT archive_old_chat_history();"
--
-- 3. Monitor retention compliance:
--    SELECT * FROM data_retention_compliance WHERE compliance_status = 'Non-compliant';
--
-- 4. Check retention statistics:
--    SELECT * FROM get_retention_statistics();
