import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  wallet_address?: string;
  wallet_type?: 'phantom' | 'solflare' | 'backpack';
  avatar?: string;
  auth_provider: 'email' | 'wallet';
}

interface FallbackAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (walletType?: 'backpack') => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
}

const FallbackAuthContext = createContext<FallbackAuthContextType | undefined>(undefined);

export const useFallbackAuth = () => {
  const context = useContext(FallbackAuthContext);
  if (context === undefined) {
    throw new Error('useFallbackAuth must be used within a FallbackAuthProvider');
  }
  return context;
};

interface FallbackAuthProviderProps {
  children: ReactNode;
}

export const FallbackAuthProvider: React.FC<FallbackAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session on mount
    const savedUser = localStorage.getItem('zigma_fallback_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // For demo purposes, only allow specific demo accounts
      const demoAccounts = [
        { email: 'demo@zigma.ai', password: 'demo123' },
        { email: 'test@zigma.ai', password: 'test123' }
      ];

      const isValidDemo = demoAccounts.some(account => 
        account.email === email && account.password === password
      );

      if (!isValidDemo) {
        throw new Error('Invalid credentials. For demo, use demo@zigma.ai / demo123 or test@zigma.ai / test123');
      }

      const mockUser: User = {
        id: 'fallback_' + Date.now(),
        email,
        name: email.split('@')[0],
        auth_provider: 'email',
        wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
      };
      
      setUser(mockUser);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(mockUser));
    } catch (error: any) {
      console.error('Fallback login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (walletType: 'backpack' = 'backpack') => {
    setIsLoading(true);
    try {
      let walletAddress: string;
      const wallet = (window as any).backpack;

      if (!wallet) {
        throw new Error(`${walletType} wallet not installed`);
      }

      // Normal connection for Backpack
      try {
        await wallet.disconnect?.();
      } catch (e) {}
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await wallet.connect();
      walletAddress = response.publicKey.toString();

      const mockUser: User = {
        id: 'fallback_wallet_' + Date.now(),
        email: `${walletAddress.toLowerCase()}@wallet.sol`,
        name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} User`,
        wallet_address: walletAddress,
        wallet_type: walletType,
        auth_provider: 'wallet',
      };

      setUser(mockUser);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(mockUser));
    } catch (error: any) {
      console.error('Wallet login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // For demo purposes, only allow specific demo domains
      if (!email.endsWith('@zigma.ai')) {
        throw new Error('Signup is limited to @zigma.ai email addresses in demo mode.');
      }

      // Check if account already exists
      const savedUser = localStorage.getItem('zigma_fallback_user');
      if (savedUser) {
        const existingUser = JSON.parse(savedUser);
        if (existingUser.email === email) {
          throw new Error('This email is already registered. Please try logging in.');
        }
      }

      const mockUser: User = {
        id: 'fallback_' + Date.now(),
        email,
        name,
        auth_provider: 'email',
        wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
      };
      
      setUser(mockUser);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(mockUser));
    } catch (error: any) {
      console.error('Fallback signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    throw new Error('Password reset is not available in demo mode. Please contact support.');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zigma_fallback_user');
  };

  const value: FallbackAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithWallet,
    signup,
    resetPassword,
    logout,
  };

  return <FallbackAuthContext.Provider value={value}>{children}</FallbackAuthContext.Provider>;
};
