import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

// Solana configuration
// Using Helius RPC with user's API key
const SOLANA_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=5d19455d-be52-4a83-b70e-3c062e226a50';
const ZIGMA_TOKEN_MINT = 'xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai';

// Chat payment configuration
// User holds 10,000 ZIGMA tokens in their wallet = 3 chats
export const CHAT_CONFIG = {
  ZIGMA_PER_PACKAGE: 10000,
  CHATS_PER_PACKAGE: 3,
  ZIGMA_TOKEN_MINT,
  DECIMALS: 9, // ZIGMA token decimals
};

// Create Solana connection with fetch options
const connection = new Connection(SOLANA_RPC_URL, {
  commitment: 'confirmed',
  fetch: (url, options) => {
    console.log('🌐 Fetching from Solana RPC:', url);
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    });
  },
});

/**
 * Get ZIGMA token balance for a wallet address using Solscan API
 * (CORS-friendly, works from browser)
 */
export async function getZigmaBalance(walletAddress: string): Promise<number> {
  try {
    console.log('💰 Fetching ZIGMA balance for wallet:', walletAddress);
    console.log('🌐 Using Solscan API (CORS-friendly)');
    
    // Use Solscan API to get token balances
    const response = await fetch(
      `https://api.solscan.io/account/tokens?address=${walletAddress}`
    );
    
    if (!response.ok) {
      throw new Error(`Solscan API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('� Solscan response:', data);
    
    // Find ZIGMA token in the list
    const zigmaToken = data.find((token: any) => 
      token.tokenAddress === ZIGMA_TOKEN_MINT || 
      token.tokenAccount?.mint === ZIGMA_TOKEN_MINT
    );
    
    if (!zigmaToken) {
      console.warn('⚠️ ZIGMA token not found in wallet. Balance: 0');
      return 0;
    }
    
    // Get balance (Solscan returns it in token units, not lamports)
    const balance = Number(zigmaToken.tokenAmount?.uiAmount || zigmaToken.amount || 0);
    console.log('💎 ZIGMA balance:', balance);
    
    return balance;
  } catch (error: any) {
    console.error('❌ Error fetching ZIGMA balance from Solscan:', error);
    console.error('Error message:', error?.message);
    
    // If error, return 0
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
 * Check if user can use chat based on ZIGMA balance
 */
export async function canUseChat(walletAddress: string, userEmail?: string): Promise<{
  canChat: boolean;
  balance: number;
  availableChats: number;
  requiredZigma: number;
}> {
  // DEV EXCEPTION: Allow unlimited chat for dev/test accounts
  const DEV_EMAILS = ['neohex262@gmail.com', 'jissjoseph30@gmail.com'];
  if (userEmail && DEV_EMAILS.includes(userEmail.toLowerCase())) {
    console.log('🔓 DEV MODE: Unlimited chat access for', userEmail);
    return {
      canChat: true,
      balance: 999999,
      availableChats: 999,
      requiredZigma: 0,
    };
  }
  
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
