-- Create comprehensive user chat history table
-- Stores all user interactions with Zigma chat system

CREATE TABLE IF NOT EXISTS user_chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL DEFAULT '', -- Groups messages by conversation session
  message_type TEXT NOT NULL CHECK (message_type IN ('user_query', 'zigma_response', 'system_message', 'error_message')),
  content TEXT NOT NULL,
  
  -- Query-specific fields
  query_type TEXT CHECK (query_type IN ('market_analysis', 'user_profile', 'general_query', 'multi_market_comparison', 'signal_request')),
  market_id TEXT, -- Associated market if any
  market_question TEXT, -- Market question being analyzed
  polymarket_user TEXT, -- User profile being analyzed
  
  -- Response-specific fields
  response_type TEXT CHECK (response_type IN ('recommendation', 'analysis', 'user_profile_data', 'comparison', 'error')),
  recommendation_data JSONB, -- Full recommendation object
  analysis_data JSONB, -- Full analysis object
  user_profile_data JSONB, -- User profile analysis
  comparison_data JSONB, -- Multi-market comparison results
  
  -- Performance metrics
  processing_time_ms INTEGER, -- Time taken to generate response
  context_used BOOLEAN DEFAULT FALSE, -- Whether conversation context was used
  context_id TEXT, -- Context ID for conversation continuity
  
  -- User interaction metrics
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5), -- User feedback rating
  user_feedback TEXT, -- User feedback comments
  was_helpful BOOLEAN, -- Whether user marked as helpful
  follow_up_queries TEXT[], -- Array of follow-up questions suggested
  
  -- Metadata
  metadata JSONB, -- Additional metadata like source, version, etc.
  api_version TEXT DEFAULT 'v1',
  client_info JSONB, -- User agent, browser info, etc.
  ip_address INET, -- User IP for analytics
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_chat_history_user_required CHECK (user_id IS NOT NULL),
  CONSTRAINT user_chat_history_content_length CHECK (length(content) >= 1)
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_user_chat_history_user_id ON user_chat_history(user_id DESC);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_session_id ON user_chat_history(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_created_at ON user_chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_message_type ON user_chat_history(message_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_market_id ON user_chat_history(market_id) WHERE market_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_chat_history_query_type ON user_chat_history(query_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_chat_history_context_id ON user_chat_history(context_id) WHERE context_id IS NOT NULL;

-- Create composite index for user session queries
CREATE INDEX IF NOT EXISTS idx_user_chat_history_user_session ON user_chat_history(user_id, session_id, created_at ASC);

-- Create trigger for updated_at
CREATE TRIGGER update_user_chat_history_updated_at 
    BEFORE UPDATE ON user_chat_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own chat history
CREATE POLICY "Users can view own chat history" ON user_chat_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own chat messages
CREATE POLICY "Users can insert own chat messages" ON user_chat_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own chat messages (for feedback, ratings)
CREATE POLICY "Users can update own chat messages" ON user_chat_history
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own chat messages
CREATE POLICY "Users can delete own chat messages" ON user_chat_history
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create a view for chat analytics
CREATE OR REPLACE VIEW user_chat_analytics AS
SELECT 
  user_id,
  DATE_TRUNC('day', created_at) as chat_date,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE message_type = 'user_query') as total_queries,
  COUNT(*) FILTER (WHERE message_type = 'zigma_response') as total_responses,
  COUNT(*) FILTER (WHERE query_type = 'market_analysis') as market_analysis_queries,
  COUNT(*) FILTER (WHERE query_type = 'user_profile') as user_profile_queries,
  COUNT(*) FILTER (WHERE response_type = 'recommendation') as recommendation_responses,
  AVG(processing_time_ms) as avg_processing_time_ms,
  COUNT(*) FILTER (WHERE user_rating IS NOT NULL) as rated_messages,
  AVG(user_rating) as avg_user_rating,
  COUNT(*) FILTER (WHERE was_helpful = TRUE) as helpful_messages,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT market_id) FILTER (WHERE market_id IS NOT NULL) as unique_markets_analyzed
FROM user_chat_history
GROUP BY user_id, DATE_TRUNC('day', created_at);

-- Create a view for user chat summaries
CREATE OR REPLACE VIEW user_chat_summary AS
SELECT 
  user_id,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE message_type = 'user_query') as total_queries,
  COUNT(*) FILTER (WHERE message_type = 'zigma_response') as total_responses,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT DATE_TRUNC('day', created_at)) as active_days,
  MIN(created_at) as first_chat_at,
  MAX(created_at) as last_chat_at,
  AVG(processing_time_ms) as avg_processing_time_ms,
  COUNT(*) FILTER (WHERE user_rating IS NOT NULL) as rated_messages,
  AVG(user_rating) as avg_user_rating,
  COUNT(*) FILTER (WHERE was_helpful = TRUE) as helpful_messages,
  COUNT(DISTINCT market_id) FILTER (WHERE market_id IS NOT NULL) as unique_markets_analyzed,
  COUNT(*) FILTER (WHERE query_type = 'market_analysis') as market_analysis_count,
  COUNT(*) FILTER (WHERE query_type = 'user_profile') as user_profile_count
FROM user_chat_history
GROUP BY user_id;

-- Create function to get chat session history
CREATE OR REPLACE FUNCTION get_user_chat_session(
  p_user_id UUID,
  p_session_id TEXT,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  message_type TEXT,
  content TEXT,
  query_type TEXT,
  response_type TEXT,
  recommendation_data JSONB,
  analysis_data JSONB,
  user_profile_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.message_type,
    h.content,
    h.query_type,
    h.response_type,
    h.recommendation_data,
    h.analysis_data,
    h.user_profile_data,
    h.created_at
  FROM user_chat_history h
  WHERE h.user_id = p_user_id 
    AND h.session_id = p_session_id
  ORDER BY h.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's recent chat sessions
CREATE OR REPLACE FUNCTION get_user_recent_chat_sessions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  session_id TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER,
  last_message_preview TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.session_id,
    MAX(h.created_at) as last_message_at,
    COUNT(*) as message_count,
    SUBSTRING(h.content FROM 1 FOR 100) as last_message_preview
  FROM user_chat_history h
  WHERE h.user_id = p_user_id
  GROUP BY h.session_id
  ORDER BY MAX(h.created_at) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search chat history
CREATE OR REPLACE FUNCTION search_user_chat_history(
  p_user_id UUID,
  p_search_query TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  session_id TEXT,
  message_type TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.session_id,
    h.message_type,
    h.content,
    h.created_at,
    CASE 
      WHEN h.content ILIKE '%' || p_search_query || '%' THEN 1.0
      ELSE 0.5
    END as relevance_score
  FROM user_chat_history h
  WHERE h.user_id = p_user_id 
    AND (
      h.content ILIKE '%' || p_search_query || '%' OR
      h.market_question ILIKE '%' || p_search_query || '%'
    )
  ORDER BY relevance_score DESC, h.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_chat_history TO authenticated;
GRANT SELECT ON user_chat_analytics TO authenticated;
GRANT SELECT ON user_chat_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_chat_session TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_recent_chat_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION search_user_chat_history TO authenticated;
