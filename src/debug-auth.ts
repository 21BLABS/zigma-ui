// Debug script to check authentication status
export const debugAuth = () => {
  console.log('=== Authentication Debug ===');
  console.log('Environment:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });
  
  // Check localStorage
  const fallbackUser = localStorage.getItem('zigma_fallback_user');
  console.log('Fallback user in localStorage:', fallbackUser ? 'Yes' : 'No');
  
  // Check Solana wallets
  if (typeof window !== 'undefined') {
    console.log('Phantom available:', !!(window as any).phantom?.solana);
    console.log('Solflare available:', !!(window as any).solflare);
    console.log('Backpack available:', !!(window as any).backpack);
  }
};

// Run debug on load
if (typeof window !== 'undefined') {
  debugAuth();
}
