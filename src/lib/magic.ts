import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';

// Magic.link configuration - use environment variable
const MAGIC_PUBLISHABLE_KEY = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY || 'pk_live_BAE8AFC38AF40542';

// Initialize Magic instance with Solana extension and network
export const magic = new Magic(MAGIC_PUBLISHABLE_KEY, {
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

// Helper to check if Magic is initialized
export const isMagicInitialized = () => {
  try {
    return !!magic;
  } catch {
    return false;
  }
};
