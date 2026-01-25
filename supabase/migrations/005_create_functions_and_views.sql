-- Create helpful functions and views for the application

-- Function to get user's watchlist with latest signal information
CREATE OR REPLACE FUNCTION get_user_watchlist_with_signals(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  market_id VARCHAR,
  platform VARCHAR,
  question TEXT,
  category VARCHAR,
  current_odds DECIMAL,
  current_price DECIMAL,
  liquidity DECIMAL,
  volume_24h DECIMAL,
  ends_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR,
  added_at TIMESTAMP WITH TIME ZONE,
  last_signal_id VARCHAR,
  last_signal_direction VARCHAR,
  last_signal_probability DECIMAL,
  last_signal_edge DECIMAL,
  last_signal_confidence DECIMAL,
  last_signal_generated_at TIMESTAMP WITH TIME ZONE,
  signal_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.market_id,
        w.platform,
        w.question,
        w.category,
        w.current_odds,
        w.current_price,
        w.liquidity,
        w.volume_24h,
        w.ends_at,
        w.status,
        w.added_at,
        last_signal.signal_id as last_signal_id,
        last_signal.direction as last_signal_direction,
        last_signal.probability as last_signal_probability,
        last_signal.edge as last_signal_edge,
        last_signal.confidence as last_signal_confidence,
        last_signal.generated_at as last_signal_generated_at,
        signal_count.signal_count
    FROM watchlist w
    LEFT JOIN LATERAL (
        SELECT us.*
        FROM user_signals us
        WHERE us.watchlist_item_id = w.id
        ORDER BY us.generated_at DESC
        LIMIT 1
    ) last_signal ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as signal_count
        FROM user_signals us
        WHERE us.watchlist_item_id = w.id
    ) signal_count ON true
    WHERE w.user_id = p_user_id
    ORDER BY w.added_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's signal performance metrics
CREATE OR REPLACE FUNCTION get_user_signal_performance(p_user_id UUID)
RETURNS TABLE (
  total_signals BIGINT,
  active_signals BIGINT,
  executed_signals BIGINT,
  resolved_signals BIGINT,
  correct_signals BIGINT,
  incorrect_signals BIGINT,
  win_rate DECIMAL,
  avg_edge DECIMAL,
  avg_confidence DECIMAL,
  total_profit_loss DECIMAL,
  avg_profit_loss DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_signals,
        COUNT(*) FILTER (WHERE status = 'active') as active_signals,
        COUNT(*) FILTER (WHERE status = 'executed') as executed_signals,
        COUNT(*) FILTER (WHERE outcome IS NOT NULL) as resolved_signals,
        COUNT(*) FILTER (WHERE outcome = 'CORRECT') as correct_signals,
        COUNT(*) FILTER (WHERE outcome = 'INCORRECT') as incorrect_signals,
        CASE 
            WHEN COUNT(*) FILTER (WHERE outcome IS NOT NULL) > 0 
            THEN ROUND(COUNT(*) FILTER (WHERE outcome = 'CORRECT')::DECIMAL / COUNT(*) FILTER (WHERE outcome IS NOT NULL)::DECIMAL, 4)
            ELSE 0 
        END as win_rate,
        ROUND(AVG(edge), 4) as avg_edge,
        ROUND(AVG(confidence), 4) as avg_confidence,
        COALESCE(SUM(profit_loss), 0) as total_profit_loss,
        ROUND(AVG(profit_loss), 8) as avg_profit_loss
    FROM user_signals
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- View for active signals across all users (for admin/analytics)
CREATE OR REPLACE VIEW active_signals_view AS
SELECT 
    us.*,
    u.email as user_email,
    u.name as user_name,
    w.question as market_question,
    w.category as market_category,
    w.platform as market_platform
FROM user_signals us
JOIN users u ON us.user_id = u.id
LEFT JOIN watchlist w ON us.watchlist_item_id = w.id
WHERE us.status = 'active'
AND us.expires_at > NOW();

-- View for market performance analytics
CREATE OR REPLACE VIEW market_performance_view AS
SELECT 
    w.market_id,
    w.platform,
    w.question,
    w.category,
    COUNT(DISTINCT w.user_id) as watching_users,
    COUNT(us.id) as total_signals,
    COUNT(us.id) FILTER (WHERE us.outcome = 'CORRECT') as correct_signals,
    COUNT(us.id) FILTER (WHERE us.outcome = 'INCORRECT') as incorrect_signals,
    CASE 
        WHEN COUNT(us.id) FILTER (WHERE us.outcome IS NOT NULL) > 0 
        THEN ROUND(COUNT(us.id) FILTER (WHERE us.outcome = 'CORRECT')::DECIMAL / COUNT(us.id) FILTER (WHERE us.outcome IS NOT NULL)::DECIMAL, 4)
        ELSE 0 
    END as signal_accuracy,
    AVG(us.edge) as avg_edge,
    AVG(us.confidence) as avg_confidence,
    MAX(us.generated_at) as last_signal_at
FROM watchlist w
LEFT JOIN user_signals us ON w.id = us.watchlist_item_id
GROUP BY w.market_id, w.platform, w.question, w.category
ORDER BY watching_users DESC, signal_accuracy DESC;

-- Function to clean up expired signals
CREATE OR REPLACE FUNCTION cleanup_expired_signals()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_signals 
    WHERE expires_at < NOW() 
    AND status = 'active';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job function (you'll need to set this up in your Supabase dashboard)
-- This function can be called by a cron job to clean up expired signals daily
