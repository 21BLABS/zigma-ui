-- Add token-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_zigma_tokens BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS zigma_balance DECIMAL(20, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_check_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for token-related fields
CREATE INDEX IF NOT EXISTS idx_users_has_zigma_tokens ON users(has_zigma_tokens);
CREATE INDEX IF NOT EXISTS idx_users_zigma_balance ON users(zigma_balance);
CREATE INDEX IF NOT EXISTS idx_users_token_check_at ON users(token_check_at);
