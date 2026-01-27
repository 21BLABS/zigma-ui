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
  loginWithWallet: (walletType?: 'phantom' | 'solflare' | 'backpack') => Promise<void>;
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

  const loginWithWallet = async (walletType: 'phantom' | 'solflare' | 'backpack' = 'phantom') => {
    setIsLoading(true);
    try {
      let walletAddress: string;
      
      if (walletType === 'phantom') {
        // Phantom Wallet (Solana) - Desktop and Mobile
        if (typeof window !== 'undefined') {
          console.log('Attempting Phantom connection...');
          
          // Try desktop Phantom first
          if ((window as any).phantom?.solana) {
            try {
              console.log('Found Phantom desktop, connecting...');
              const response = await (window as any).phantom.solana.connect();
              walletAddress = response.publicKey.toString();
              console.log('Phantom desktop connected successfully:', walletAddress);
            } catch (err: any) {
              console.error('Phantom desktop connection failed:', err);
              // Try mobile Phantom deep link
              if ((window as any).solana?.isPhantom) {
                try {
                  console.log('Trying Phantom mobile...');
                  const response = await (window as any).solana.connect();
                  walletAddress = response.publicKey.toString();
                  console.log('Phantom mobile connected successfully:', walletAddress);
                } catch (mobileErr: any) {
                  console.error('Phantom mobile also failed:', mobileErr);
                  // For fallback, create a mock wallet address
                  walletAddress = 'mock_phantom_' + Date.now();
                  console.log('Using mock Phantom address for fallback:', walletAddress);
                }
              } else {
                // For fallback, create a mock wallet address
                walletAddress = 'mock_phantom_' + Date.now();
                console.log('Phantom not available, using mock address for fallback:', walletAddress);
              }
            }
          } else if ((window as any).solana?.isPhantom) {
            // Mobile Phantom
            try {
              console.log('Found Phantom mobile, connecting...');
              const response = await (window as any).solana.connect();
              walletAddress = response.publicKey.toString();
              console.log('Phantom mobile connected successfully:', walletAddress);
            } catch (err: any) {
              console.error('Phantom mobile connection failed:', err);
              // For fallback, create a mock wallet address
              walletAddress = 'mock_phantom_' + Date.now();
              console.log('Phantom mobile failed, using mock address for fallback:', walletAddress);
            }
          } else {
            console.log('Phantom not detected. Available wallets:', {
              phantom: !!(window as any).phantom,
              phantomSolana: !!(window as any).phantom?.solana,
              solana: !!(window as any).solana,
              isPhantom: !!(window as any).solana?.isPhantom
            });
            // For fallback, create a mock wallet address
            walletAddress = 'mock_phantom_' + Date.now();
            console.log('Phantom not available, using mock address for fallback:', walletAddress);
          }
        } else {
          // For fallback, create a mock wallet address
          walletAddress = 'mock_phantom_' + Date.now();
          console.log('Window not available, using mock address for fallback:', walletAddress);
        }
      } else if (walletType === 'solflare') {
        // Solflare Wallet (Solana)
        if (typeof window !== 'undefined' && (window as any).solflare) {
          try {
            const response = await (window as any).solflare.connect();
            walletAddress = response.publicKey.toString();
          } catch (err: any) {
            console.error('Solflare connection failed:', err);
            // For fallback, create a mock wallet address
            walletAddress = 'mock_solflare_' + Date.now();
            console.log('Solflare failed, using mock address for fallback:', walletAddress);
          }
        } else {
          // For fallback, create a mock wallet address
          walletAddress = 'mock_solflare_' + Date.now();
          console.log('Solflare not available, using mock address for fallback:', walletAddress);
        }
      } else if (walletType === 'backpack') {
        // Backpack Wallet (Solana)
        if (typeof window !== 'undefined' && (window as any).backpack) {
          try {
            const response = await (window as any).backpack.connect();
            walletAddress = response.publicKey.toString();
          } catch (err: any) {
            console.error('Backpack connection failed:', err);
            // For fallback, create a mock wallet address
            walletAddress = 'mock_backpack_' + Date.now();
            console.log('Backpack failed, using mock address for fallback:', walletAddress);
          }
        } else {
          // For fallback, create a mock wallet address
          walletAddress = 'mock_backpack_' + Date.now();
          console.log('Backpack not available, using mock address for fallback:', walletAddress);
        }
      } else {
        throw new Error('Unsupported wallet type');
      }
      
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
      console.error('Fallback wallet login failed:', error);
      
      // In fallback mode, we should always succeed with a mock wallet
      // This ensures the demo experience works even without real wallets
      const mockWalletAddress = `mock_${walletType}_${Date.now()}`;
      console.log('Creating fallback mock wallet:', mockWalletAddress);
      
      const mockUser: User = {
        id: 'fallback_wallet_' + Date.now(),
        email: `${mockWalletAddress.toLowerCase()}@wallet.sol`,
        name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} User (Demo)`,
        wallet_address: mockWalletAddress,
        wallet_type: walletType,
        auth_provider: 'wallet',
      };
      
      setUser(mockUser);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(mockUser));
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
