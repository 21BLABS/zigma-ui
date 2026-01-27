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
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (walletType?: 'phantom' | 'solflare' | 'backpack') => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
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
          .insert(newUser)
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
    if (useFallback) {
      return fallbackAuth.login(email, password);
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        // Fall back to localStorage auth on Supabase error
        setUseFallback(true);
        return fallbackAuth.login(email, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      setUseFallback(true);
      return fallbackAuth.login(email, password);
    }
  };

  const loginWithWallet = async (walletType: 'phantom' | 'solflare' | 'backpack' = 'phantom') => {
    if (useFallback) {
      return fallbackAuth.loginWithWallet(walletType);
    }

    try {
      let walletAddress: string;
      
      if (walletType === 'phantom') {
        // Phantom Wallet (Solana) - Desktop and Mobile
        if (typeof window !== 'undefined') {
          // Try desktop Phantom first
          if ((window as any).phantom?.solana) {
            try {
              const response = await (window as any).phantom.solana.connect();
              walletAddress = response.publicKey.toString();
            } catch (err: any) {
              console.error('Phantom desktop connection failed:', err);
              // Try mobile Phantom deep link
              if ((window as any).solana?.isPhantom) {
                const response = await (window as any).solana.connect();
                walletAddress = response.publicKey.toString();
              } else {
                throw new Error('Phantom wallet connection failed. Please ensure Phantom is installed and unlocked.');
              }
            }
          } else if ((window as any).solana?.isPhantom) {
            // Mobile Phantom
            const response = await (window as any).solana.connect();
            walletAddress = response.publicKey.toString();
          } else {
            throw new Error('Phantom wallet not installed. Please install Phantom from phantom.app');
          }
        } else {
          throw new Error('Window not available');
        }
      } else if (walletType === 'solflare') {
        // Solflare Wallet (Solana)
        if (typeof window !== 'undefined' && (window as any).solflare) {
          try {
            const response = await (window as any).solflare.connect();
            walletAddress = response.publicKey.toString();
          } catch (err: any) {
            throw new Error('Solflare wallet connection failed. Please ensure Solflare is installed and unlocked.');
          }
        } else {
          throw new Error('Solflare wallet not installed. Please install Solflare from solflare.com');
        }
      } else if (walletType === 'backpack') {
        // Backpack Wallet (Solana)
        if (typeof window !== 'undefined' && (window as any).backpack) {
          try {
            const response = await (window as any).backpack.connect();
            walletAddress = response.publicKey.toString();
          } catch (err: any) {
            throw new Error('Backpack wallet connection failed. Please ensure Backpack is installed and unlocked.');
          }
        } else {
          throw new Error('Backpack wallet not installed. Please install Backpack from backpack.app');
        }
      } else {
        throw new Error('Unsupported wallet type');
      }
      
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

  const handleWalletAuth = async (walletAddress: string, walletType: 'phantom' | 'solflare' | 'backpack' = 'phantom') => {
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
    if (useFallback) {
      return fallbackAuth.signup(email, password, name);
    }

    try {
      const { error } = await supabase.auth.signUp({
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
        // Fall back to localStorage auth on Supabase error
        setUseFallback(true);
        return fallbackAuth.signup(email, password, name);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setUseFallback(true);
      return fallbackAuth.signup(email, password, name);
    }
  };

  const resetPassword = async (email: string) => {
    if (useFallback) {
      // Fallback doesn't support password reset, show message
      throw new Error('Password reset is not available in demo mode. Please contact support.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw new Error('Failed to send password reset email');
      }
    } catch (error) {
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
  const currentUser = useFallback ? fallbackAuth.user : user;
  const currentIsLoading = useFallback ? fallbackAuth.isLoading : isLoading;
  const currentIsAuthenticated = useFallback ? fallbackAuth.isAuthenticated : !!user;

  const value: AuthContextType = {
    user: currentUser,
    supabaseUser,
    isLoading: currentIsLoading,
    isAuthenticated: currentIsAuthenticated,
    login,
    loginWithWallet,
    signup,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
