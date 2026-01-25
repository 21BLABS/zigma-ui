-- Create users table for authentication and user data
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) UNIQUE, -- Ethereum wallet address
  avatar_url TEXT,
  auth_provider VARCHAR(50) NOT NULL DEFAULT 'email', -- 'email', 'wallet', 'web3auth'
  auth_provider_id VARCHAR(255), -- ID from auth provider (e.g., Web3Auth user ID)
  email_verified BOOLEAN DEFAULT FALSE,
  wallet_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT users_wallet_address_check CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$' OR wallet_address IS NULL),
  CONSTRAINT users_auth_provider_check CHECK (auth_provider IN ('email', 'wallet', 'web3auth'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider_id ON users(auth_provider_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Policy: Users can insert their own data (for signup)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);
