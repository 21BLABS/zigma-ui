-- Create chat_usage table for tracking user chat usage limits
CREATE TABLE IF NOT EXISTS chat_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chat_usage_usage_count_check CHECK (usage_count >= 0),
  CONSTRAINT chat_usage_wallet_address_check CHECK (
    wallet_address ~ '^0x[a-fA-F0-9]{40}$' OR 
    wallet_address ~ '^mock_[a-zA-Z0-9]+$' OR
    wallet_address ~ '^fallback_wallet_[0-9]+$'
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_id ON chat_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_usage_wallet_address ON chat_usage(wallet_address);
CREATE INDEX IF NOT EXISTS idx_chat_usage_last_used_at ON chat_usage(last_used_at);
CREATE INDEX IF NOT EXISTS idx_chat_usage_reset_at ON chat_usage(reset_at);

-- Unique constraint on user_id and wallet_address
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_usage_user_wallet ON chat_usage(user_id, wallet_address);

-- Function to automatically update updated_at timestamp
CREATE TRIGGER update_chat_usage_updated_at 
    BEFORE UPDATE ON chat_usage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own chat usage
CREATE POLICY "Users can view own chat usage" ON chat_usage
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can update their own chat usage
CREATE POLICY "Users can update own chat usage" ON chat_usage
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own chat usage
CREATE POLICY "Users can insert own chat usage" ON chat_usage
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own chat usage
CREATE POLICY "Users can delete own chat usage" ON chat_usage
    FOR DELETE USING (auth.uid()::text = user_id::text);
