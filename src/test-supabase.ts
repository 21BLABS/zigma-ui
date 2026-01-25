import { supabase } from './lib/supabase';

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      console.error('Supabase test error:', error);
      return { success: false, error };
    }
    
    console.log('Supabase connection successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return { success: false, error: err };
  }
};
