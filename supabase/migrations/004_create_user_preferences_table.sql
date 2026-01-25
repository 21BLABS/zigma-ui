-- Create user_preferences table for storing user settings and preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  signal_notifications BOOLEAN DEFAULT TRUE,
  price_alerts BOOLEAN DEFAULT TRUE,
  resolution_notifications BOOLEAN DEFAULT TRUE,
  
  -- Signal preferences
  min_confidence_threshold DECIMAL(5, 4) DEFAULT 0.7000, -- Minimum confidence for signals
  min_edge_threshold DECIMAL(5, 4) DEFAULT 0.0500, -- Minimum edge for signals
  max_position_size DECIMAL(5, 4) DEFAULT 0.1000, -- Maximum position size per trade
  risk_tolerance VARCHAR(20) DEFAULT 'medium', -- 'conservative', 'medium', 'aggressive'
  
  -- Display preferences
  theme VARCHAR(20) DEFAULT 'dark', -- 'light', 'dark', 'auto'
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Privacy preferences
  profile_public BOOLEAN DEFAULT FALSE,
  share_analytics BOOLEAN DEFAULT FALSE,
  data_retention_days INTEGER DEFAULT 365,
  
  -- API preferences
  api_key_enabled BOOLEAN DEFAULT FALSE,
  api_rate_limit INTEGER DEFAULT 1000, -- requests per hour
  
  -- JSON fields for complex preferences
  custom_alerts JSONB DEFAULT '[]'::jsonb, -- Custom price/alert conditions
  dashboard_layout JSONB DEFAULT '{}'::jsonb, -- Dashboard widget layout
  filter_preferences JSONB DEFAULT '{}'::jsonb, -- Saved filters
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_preferences_risk_tolerance_check CHECK (risk_tolerance IN ('conservative', 'medium', 'aggressive')),
  CONSTRAINT user_preferences_theme_check CHECK (theme IN ('light', 'dark', 'auto')),
  CONSTRAINT user_preferences_confidence_check CHECK (min_confidence_threshold >= 0 AND min_confidence_threshold <= 1),
  CONSTRAINT user_preferences_edge_check CHECK (min_edge_threshold >= 0 AND min_edge_threshold <= 1),
  CONSTRAINT user_preferences_position_size_check CHECK (max_position_size >= 0 AND max_position_size <= 1),
  CONSTRAINT user_preferences_rate_limit_check CHECK (api_rate_limit > 0),
  CONSTRAINT user_preferences_retention_check CHECK (data_retention_days > 0),
  
  -- One preference record per user
  CONSTRAINT user_preferences_unique_user UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX IF NOT EXISTS idx_user_preferences_risk_tolerance ON user_preferences(risk_tolerance);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE USING (auth.uid()::text = user_id::text);
