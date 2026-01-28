import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

// Solana configuration
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
const ZIGMA_TOKEN_MINT = 'xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai';

// Chat payment configuration
// 10,000 ZIGMA tokens (~$1.41) = 3 chats
export const CHAT_CONFIG = {
  ZIGMA_PER_PACKAGE: 10000,
  CHATS_PER_PACKAGE: 3,
  ZIGMA_TOKEN_MINT,
  DECIMALS: 9, // ZIGMA token decimals
};

// Create Solana connection
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Get ZIGMA token balance for a wallet address
 */
export async function getZigmaBalance(walletAddress: string): Promise<number> {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const mintPublicKey = new PublicKey(ZIGMA_TOKEN_MINT);

    // Get associated token account
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintPublicKey,
      walletPublicKey
    );

    // Get token account info
    const tokenAccount = await getAccount(connection, tokenAccountAddress);
    
    // Convert balance from lamports to tokens
    const balance = Number(tokenAccount.amount) / Math.pow(10, CHAT_CONFIG.DECIMALS);
    
    return balance;
  } catch (error) {
    console.error('Error fetching ZIGMA balance:', error);
    // If token account doesn't exist, balance is 0
    return 0;
  }
}

/**
 * Calculate available chats based on ZIGMA balance
 */
export function calculateAvailableChats(zigmaBalance: number): number {
  const packages = Math.floor(zigmaBalance / CHAT_CONFIG.ZIGMA_PER_PACKAGE);
  return packages * CHAT_CONFIG.CHATS_PER_PACKAGE;
}

/**
 * Check if user has enough ZIGMA for chat
 */
export async function canUseChat(walletAddress: string): Promise<{
  canChat: boolean;
  balance: number;
  availableChats: number;
  requiredZigma: number;
}> {
  const balance = await getZigmaBalance(walletAddress);
  const availableChats = calculateAvailableChats(balance);
  
  return {
    canChat: availableChats > 0,
    balance,
    availableChats,
    requiredZigma: CHAT_CONFIG.ZIGMA_PER_PACKAGE,
  };
}

/**
 * Verify Solana wallet address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
