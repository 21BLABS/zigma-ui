-- Fix the wallet address constraint to handle old fallback data
ALTER TABLE chat_usage DROP CONSTRAINT IF EXISTS chat_usage_wallet_address_check;

-- Add the updated constraint that includes old fallback format
ALTER TABLE chat_usage 
ADD CONSTRAINT chat_usage_wallet_address_check CHECK (
  wallet_address ~ '^0x[a-fA-F0-9]{40}$' OR 
  wallet_address ~ '^mock_[a-zA-Z0-9]+$' OR
  wallet_address ~ '^fallback_wallet_[0-9]+$'
);

-- Clean up any existing chat_usage records with invalid formats
DELETE FROM chat_usage WHERE wallet_address NOT ~ '^0x[a-fA-F0-9]{40}$' AND wallet_address NOT ~ '^mock_[a-zA-Z0-9]+$' AND wallet_address NOT ~ '^fallback_wallet_[0-9]+$';

SELECT 'Database constraint updated and cleaned successfully!' as status;
