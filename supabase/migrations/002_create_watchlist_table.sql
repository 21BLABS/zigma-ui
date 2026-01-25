-- Create watchlist table for user's tracked markets
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id VARCHAR(255) NOT NULL, -- Market ID from prediction platforms
  platform VARCHAR(50) NOT NULL DEFAULT 'polymarket', -- 'polymarket', 'kalshi', etc.
  question TEXT NOT NULL, -- Market question/title
  category VARCHAR(100),
  description TEXT,
  current_odds DECIMAL(10, 4), -- Current probability/odds
  current_price DECIMAL(18, 8), -- Current market price
  liquidity DECIMAL(20, 8), -- Market liquidity
  volume_24h DECIMAL(20, 8), -- 24h volume
  ends_at TIMESTAMP WITH TIME ZONE, -- Market end date
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'expired'
  resolution VARCHAR(20), -- 'YES', 'NO', 'CANCELLED' (for resolved markets)
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT watchlist_platform_check CHECK (platform IN ('polymarket', 'kalshi', 'other')),
  CONSTRAINT watchlist_status_check CHECK (status IN ('active', 'resolved', 'expired', 'cancelled')),
  CONSTRAINT watchlist_resolution_check CHECK (resolution IN ('YES', 'NO', 'CANCELLED') OR resolution IS NULL),
  CONSTRAINT watchlist_unique_user_market UNIQUE(user_id, market_id, platform)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_market_id ON watchlist(market_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_platform ON watchlist(platform);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_added_at ON watchlist(added_at);
CREATE INDEX IF NOT EXISTS idx_watchlist_ends_at ON watchlist(ends_at);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_watchlist_updated_at 
    BEFORE UPDATE ON watchlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own watchlist
CREATE POLICY "Users can view own watchlist" ON watchlist
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert items to their own watchlist
CREATE POLICY "Users can insert to own watchlist" ON watchlist
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own watchlist items
CREATE POLICY "Users can update own watchlist" ON watchlist
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own watchlist items
CREATE POLICY "Users can delete from own watchlist" ON watchlist
    FOR DELETE USING (auth.uid()::text = user_id::text);
