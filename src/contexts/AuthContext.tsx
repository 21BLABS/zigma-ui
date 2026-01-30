import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useFallbackAuth } from './FallbackAuth';

interface User {
  id: string;
  email: string;
  name: string;
  wallet_address?: string;
  wallet_type?: 'phantom' | 'solflare' | 'backpack';
  avatar?: string;
  auth_provider: 'email' | 'wallet';
  has_zigma_tokens?: boolean;
  zigma_balance?: number;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasTokenAccess: boolean;
  tokenStatus: {
    hasTokens: boolean;
    balance: number;
    requiresToken: boolean;
    lastChecked?: string;
  };
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (walletType?: 'backpack') => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkTokenStatus: () => Promise<void>;
  verifyWalletTokens: (walletAddress: string) => Promise<{ hasTokens: boolean; balance: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false); // Enable Supabase
  const [hasTokenAccess, setHasTokenAccess] = useState(false);
  const [tokenStatus, setTokenStatus] = useState({
    hasTokens: false,
    balance: 0,
    requiresToken: true,
    lastChecked: undefined as string | undefined
  });
  const fallbackAuth = useFallbackAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Test Supabase connection first
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('users').select('count').single();
        
        if (error) {
          console.warn('Supabase not available, using fallback auth:', error.message);
          setUseFallback(true);
          setIsLoading(false);
          return;
        }

        console.log('Supabase connection successful!');

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.warn('No Supabase session, using fallback auth');
          setUseFallback(true);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserProfile(session.user);
        }
        
        setIsLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              setSupabaseUser(session.user);
              await fetchUserProfile(session.user);
            } else {
              setSupabaseUser(null);
              setUser(null);
            }
            setIsLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.warn('Supabase initialization failed, using fallback auth:', error);
        setUseFallback(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check token status when user authenticates
  useEffect(() => {
    if (user && user.id) {
      checkTokenStatus();
    }
  }, [user]);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Try to get user profile from our users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profile) {
        setUser(profile);
      } else {
        // Create user profile if it doesn't exist
        const newUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          auth_provider: 'email' as const,
          email_verified: !!supabaseUser.email_confirmed_at
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newUser as any)
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          setUser(createdProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    // Always use Supabase for email authentication - no fallback
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        
        // Handle specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before logging in. Check your inbox for the confirmation link.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        } else {
          throw new Error(`Login failed: ${error.message}`);
        }
      }

      // User is logged in successfully - fetch user profile
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; // Re-throw the error to be handled by the UI
    }
  };

  const loginWithWallet = async (walletType: 'backpack' = 'backpack') => {
    if (useFallback) {
      return fallbackAuth.loginWithWallet(walletType);
    }

    try {
      let walletAddress: string;
      const wallet = (window as any).backpack;

      if (!wallet) {
        throw new Error(`${walletType} wallet not installed`);
      }

      // Disconnect first to clear stale state
      try {
        await wallet.disconnect?.();
      } catch (e) {}
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 500));

      // Connect
      const response = await wallet.connect();
      walletAddress = response.publicKey.toString();
      
      if (walletAddress) {
        await handleWalletAuth(walletAddress, walletType);
      }
    } catch (error: any) {
      console.error('Wallet login failed:', error);
      
      // Handle specific wallet errors
      if (error.code === 4001) {
        throw new Error('User rejected the request. Please try again.');
      } else if (error.code === -32002) {
        throw new Error('Request already pending. Please refresh the page and try again.');
      } else if (error.message && error.message.includes('not installed')) {
        throw error; // Pass through installation messages
      } else {
        throw new Error(`Wallet connection failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleWalletAuth = async (walletAddress: string, walletType: 'backpack' = 'backpack') => {
    try {
      // Create a wallet-based authentication with proper domain
      const walletEmail = `${walletAddress.toLowerCase()}@wallet.sol`;
      const walletPassword = `wallet_${walletAddress.toLowerCase()}`;
      
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletPassword,
      });

      if (signInError) {
        // If sign in fails, try to sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email: walletEmail,
          password: walletPassword,
          options: {
            data: {
              name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} User`,
              wallet_address: walletAddress,
              wallet_type: walletType,
              auth_provider: 'wallet'
            }
          }
        });

        if (signUpError) {
          console.error('Wallet signup error:', signUpError);
          throw new Error('Failed to create wallet account');
        } else {
          // Auto-login after signup
          await supabase.auth.signInWithPassword({
            email: walletEmail,
            password: walletPassword,
          });
        }
      }
    } catch (error) {
      console.error('Wallet auth error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    // Always use Supabase for email signup - no fallback
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            auth_provider: 'email'
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        
        // Handle specific error messages
        if (error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        } else {
          throw new Error(`Signup failed: ${error.message}`);
        }
      }

      // Check if user needs email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        throw new Error('Account created! Please check your email to confirm your account before logging in.');
      }

      // User is signed up and confirmed - fetch user profile
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error; // Re-throw the error to be handled by the UI
    }
  };

  const resetPassword = async (email: string) => {
    // Always use Supabase for password reset
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Supabase password reset error:', error);
        throw new Error(`Password reset failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (useFallback) {
      fallbackAuth.logout();
      return;
    }

    await supabase.auth.signOut();
  };

  const checkTokenStatus = async () => {
    if (!user) {
      console.log('checkTokenStatus: No user found');
      return;
    }

    // Use wallet_address if available, otherwise fall back to user.id
    const userIdentifier = user.wallet_address || user.id;
    
    if (!userIdentifier) {
      console.log('checkTokenStatus: No user identifier found');
      return;
    }

    console.log(`checkTokenStatus: Checking credits for user: ${userIdentifier}`);
    
    try {
      // Use the new credit API to check user's credit balance
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/credits/balance?userId=${encodeURIComponent(userIdentifier)}`);
      
      if (!response.ok) {
        console.error('Failed to fetch credit balance:', response.statusText);
        return;
      }

      const data = await response.json();
      
      console.log(`Credit check result: currentCredits=${data.currentCredits}, freeChats=${data.freeChatsRemaining}, totalEarned=${data.totalCreditsEarned}`);
      
      setTokenStatus({
        hasTokens: data.currentCredits > 0 || data.freeChatsRemaining > 0,
        balance: data.currentCredits,
        requiresToken: true,
        lastChecked: new Date().toISOString()
      });
      
      setHasTokenAccess(data.currentCredits > 0 || data.freeChatsRemaining > 0);
    } catch (error) {
      console.error('Error checking credit status:', error);
      setTokenStatus({
        hasTokens: false,
        balance: 0,
        requiresToken: true,
        lastChecked: new Date().toISOString()
      });
      setHasTokenAccess(false);
    }
  };

  const verifyWalletTokens = async (walletAddress: string) => {
    try {
      // Use the new credit API to check wallet credits
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/credits/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify wallet credits');
      }

      const data = await response.json();
      return {
        hasTokens: data.currentCredits > 0,
        balance: data.currentCredits
      };
    } catch (error) {
      console.error('Error verifying wallet credits:', error);
      return {
        hasTokens: false,
        balance: 0
      };
    }
  };
  const currentUser = useFallback ? fallbackAuth.user : user;
  const currentIsLoading = useFallback ? fallbackAuth.isLoading : isLoading;
  const currentIsAuthenticated = useFallback ? fallbackAuth.isAuthenticated : !!user;

  const value: AuthContextType = {
    user: currentUser,
    supabaseUser,
    isLoading: currentIsLoading,
    isAuthenticated: currentIsAuthenticated,
    hasTokenAccess,
    tokenStatus,
    login,
    loginWithWallet,
    signup,
    resetPassword,
    logout,
    checkTokenStatus,
    verifyWalletTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
