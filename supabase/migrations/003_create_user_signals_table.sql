-- Create user_signals table for tracking signals generated for user's watchlist
CREATE TABLE IF NOT EXISTS user_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  watchlist_item_id UUID REFERENCES watchlist(id) ON DELETE CASCADE,
  signal_id VARCHAR(255) NOT NULL, -- Internal signal ID
  market_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'YES', 'NO'
  probability DECIMAL(5, 4) NOT NULL, -- 0.0000 to 1.0000
  edge DECIMAL(5, 4) NOT NULL, -- Edge percentage (0.0000 to 1.0000)
  confidence DECIMAL(5, 4) NOT NULL, -- Confidence score (0.0000 to 1.0000)
  position_size DECIMAL(5, 4), -- Recommended position size (0.0000 to 1.0000)
  rationale TEXT, -- AI-generated rationale
  risk_factors JSONB, -- Array of risk factors
  technical_indicators JSONB, -- Technical analysis data
  sentiment_data JSONB, -- Sentiment analysis data
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'executed', 'cancelled'
  outcome VARCHAR(20), -- 'CORRECT', 'INCORRECT', 'PENDING' (for resolved signals)
  profit_loss DECIMAL(18, 8), -- P&L if executed
  entry_price DECIMAL(18, 8), -- Entry price if executed
  exit_price DECIMAL(18, 8), -- Exit price if executed
  executed_at TIMESTAMP WITH TIME ZONE, -- When signal was executed
  resolved_at TIMESTAMP WITH TIME ZONE, -- When signal was resolved
  
  -- Constraints
  CONSTRAINT user_signals_direction_check CHECK (direction IN ('YES', 'NO')),
  CONSTRAINT user_signals_probability_check CHECK (probability >= 0 AND probability <= 1),
  CONSTRAINT user_signals_edge_check CHECK (edge >= 0 AND edge <= 1),
  CONSTRAINT user_signals_confidence_check CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT user_signals_position_size_check CHECK (position_size >= 0 AND position_size <= 1 OR position_size IS NULL),
  CONSTRAINT user_signals_status_check CHECK (status IN ('active', 'expired', 'executed', 'cancelled')),
  CONSTRAINT user_signals_outcome_check CHECK (outcome IN ('CORRECT', 'INCORRECT', 'PENDING') OR outcome IS NULL)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_signals_user_id ON user_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signals_watchlist_item_id ON user_signals(watchlist_item_id);
CREATE INDEX IF NOT EXISTS idx_user_signals_market_id ON user_signals(market_id);
CREATE INDEX IF NOT EXISTS idx_user_signals_platform ON user_signals(platform);
CREATE INDEX IF NOT EXISTS idx_user_signals_status ON user_signals(status);
CREATE INDEX IF NOT EXISTS idx_user_signals_generated_at ON user_signals(generated_at);
CREATE INDEX IF NOT EXISTS idx_user_signals_expires_at ON user_signals(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_signals_confidence ON user_signals(confidence);
CREATE INDEX IF NOT EXISTS idx_user_signals_edge ON user_signals(edge);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_signals_updated_at 
    BEFORE UPDATE ON user_signals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own signals
CREATE POLICY "Users can view own signals" ON user_signals
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert signals for themselves
CREATE POLICY "Users can insert own signals" ON user_signals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own signals
CREATE POLICY "Users can update own signals" ON user_signals
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own signals
CREATE POLICY "Users can delete own signals" ON user_signals
    FOR DELETE USING (auth.uid()::text = user_id::text);
