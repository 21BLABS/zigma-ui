import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  wallet_address?: string;
  wallet_type?: 'phantom' | 'solflare' | 'backpack' | 'metamask';
  avatar?: string;
  auth_provider: 'email' | 'wallet' | 'web3auth';
}

interface FallbackAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (walletType?: 'phantom' | 'solflare' | 'backpack' | 'metamask') => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
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
      // Simple mock authentication
      const mockUser: User = {
        id: 'fallback_' + Date.now(),
        email,
        name: email.split('@')[0],
        auth_provider: 'email',
        wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
      };
      
      setUser(mockUser);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Fallback login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async (walletType: 'phantom' | 'solflare' | 'backpack' | 'metamask' = 'phantom') => {
    setIsLoading(true);
    try {
      let walletAddress: string;
      
      if (walletType === 'phantom') {
        if (typeof window !== 'undefined' && (window as any).phantom?.solana) {
          const response = await (window as any).phantom.solana.connect();
          walletAddress = response.publicKey.toString();
        } else {
          throw new Error('Phantom wallet not installed');
        }
      } else if (walletType === 'solflare') {
        if (typeof window !== 'undefined' && (window as any).solflare) {
          const response = await (window as any).solflare.connect();
          walletAddress = response.publicKey.toString();
        } else {
          throw new Error('Solflare wallet not installed');
        }
      } else if (walletType === 'backpack') {
        if (typeof window !== 'undefined' && (window as any).backpack) {
          const response = await (window as any).backpack.connect();
          walletAddress = response.publicKey.toString();
        } else {
          throw new Error('Backpack wallet not installed');
        }
      } else {
        // MetaMask (Ethereum) - fallback
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          walletAddress = accounts[0];
        } else {
          throw new Error('MetaMask not installed');
        }
      }
      
      const domain = walletType === 'metamask' ? 'eth' : 'sol';
      const mockUser: User = {
        id: 'fallback_wallet_' + Date.now(),
        email: `${walletAddress.toLowerCase()}@wallet.${domain}`,
        name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} User`,
        wallet_address: walletAddress,
        wallet_type: walletType,
        auth_provider: 'wallet',
      };
      
      setUser(mockUser);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(mockUser));
    } catch (error: any) {
      console.error('Fallback wallet login failed:', error);
      
      if (error.code === 4001) {
        throw new Error('User rejected the request. Please try again.');
      } else if (error.code === -32002) {
        throw new Error('Request already pending. Please complete the previous request first.');
      } else {
        throw new Error(`Wallet connection failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const mockUser: User = {
        id: 'fallback_' + Date.now(),
        email,
        name,
        auth_provider: 'email',
        wallet_address: '0x' + Math.random().toString(16).substr(2, 40),
      };
      
      setUser(mockUser);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Fallback signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
    logout,
  };

  return <FallbackAuthContext.Provider value={value}>{children}</FallbackAuthContext.Provider>;
};
