import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';

// Magic.link configuration
const MAGIC_PUBLISHABLE_KEY = 'pk_live_4E27B0BCC0309E9F';

// Initialize Magic instance with Solana extension
export const magic = new Magic(MAGIC_PUBLISHABLE_KEY, {
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
