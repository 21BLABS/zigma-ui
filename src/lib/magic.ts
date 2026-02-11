import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';

// Magic.link configuration - use environment variable
const MAGIC_PUBLISHABLE_KEY = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY;

if (!MAGIC_PUBLISHABLE_KEY) {
  console.error('[MAGIC] VITE_MAGIC_PUBLISHABLE_KEY environment variable is required');
}

// Create a function to initialize Magic only in browser context
let magicInstance: any = null;

function createMagic() {
  if (typeof window === 'undefined') return null;
  
  if (!magicInstance) {
    try {
      magicInstance = new Magic(MAGIC_PUBLISHABLE_KEY, {
        network: {
          rpcUrl: 'https://api.mainnet-beta.solana.com',
          chainId: 1, // Solana mainnet
        },
        extensions: {
          solana: new SolanaExtension({
            rpcUrl: 'https://api.mainnet-beta.solana.com',
          }),
        },
      });
      
      // Make Magic available globally for debugging
      if (typeof window !== 'undefined') {
        (window as any).magic = magicInstance;
      }
      
      console.log('✅ Magic.link initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Magic.link:', error);
      return null;
    }
  }
  
  return magicInstance;
}

// Initialize Magic instance with Solana extension and network
export const magic = typeof window !== 'undefined' ? createMagic() : null;

// Helper to check if Magic is initialized
export const isMagicInitialized = () => {
  try {
    return !!magic && typeof magic.user !== 'undefined';
  } catch {
    return false;
  }
};

// Helper to get Magic instance safely
export const getMagic = () => {
  if (!magic) {
    return createMagic();
  }
  return magic;
};
