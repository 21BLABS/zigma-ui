-- Run all missing migrations for token integration

-- First, create the chat_usage table
-- (Content from 008_create_chat_usage_table.sql)
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
  CONSTRAINT chat_usage_wallet_address_check CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$' OR wallet_address ~ '^mock_[a-zA-Z0-9]+$')
);

-- Create indexes for chat_usage
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_id ON chat_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_usage_wallet_address ON chat_usage(wallet_address);
CREATE INDEX IF NOT EXISTS idx_chat_usage_last_used_at ON chat_usage(last_used_at);
CREATE INDEX IF NOT EXISTS idx_chat_usage_reset_at ON chat_usage(reset_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_usage_user_wallet ON chat_usage(user_id, wallet_address);

-- Add trigger for chat_usage
CREATE TRIGGER update_chat_usage_updated_at 
    BEFORE UPDATE ON chat_usage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for chat_usage
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- Add policies for chat_usage
CREATE POLICY "Users can view own chat usage" ON chat_usage
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own chat usage" ON chat_usage
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own chat usage" ON chat_usage
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own chat usage" ON chat_usage
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add token columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_zigma_tokens BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS zigma_balance DECIMAL(20, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_check_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for token fields
CREATE INDEX IF NOT EXISTS idx_users_has_zigma_tokens ON users(has_zigma_tokens);
CREATE INDEX IF NOT EXISTS idx_users_zigma_balance ON users(zigma_balance);
CREATE INDEX IF NOT EXISTS idx_users_token_check_at ON users(token_check_at);

-- Success message
SELECT 'Token integration migrations completed successfully!' as status;
