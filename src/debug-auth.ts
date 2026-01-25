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
  
  // Check MetaMask
  if (typeof window !== 'undefined') {
    console.log('MetaMask available:', !!(window as any).ethereum);
    console.log('MetaMask unlocked:', (window as any).ethereum?._state?.isUnlocked);
  }
};

// Run debug on load
if (typeof window !== 'undefined') {
  debugAuth();
}
