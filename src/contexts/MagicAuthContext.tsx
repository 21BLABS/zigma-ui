import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { magic } from '@/lib/magic';
import { getZigmaBalance, calculateAvailableChats, canUseChat } from '@/lib/solana';

interface User {
  id: string;
  email: string;
  name: string;
  publicAddress: string;
  issuer: string;
  avatar?: string;
  wallet_address?: string;
  wallet_type?: string;
  auth_provider: 'email' | 'wallet';
}

interface ChatStatus {
  canChat: boolean;
  balance: number;
  availableChats: number;
  requiredZigma: number;
  freeChatsRemaining?: number;
  usingFreeTrial?: boolean;
}

interface MagicAuthContextType {
  user: User | null;
  walletAddress: string | null;
  chatStatus: ChatStatus | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshChatStatus: () => Promise<void>;
}

const MagicAuthContext = createContext<MagicAuthContextType | undefined>(undefined);

export const useMagicAuth = () => {
  const context = useContext(MagicAuthContext);
  if (context === undefined) {
    throw new Error('useMagicAuth must be used within a MagicAuthProvider');
  }
  return context;
};

interface MagicAuthProviderProps {
  children: ReactNode;
}

export const MagicAuthProvider: React.FC<MagicAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<ChatStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkUserSession();
  }, []);

  // Refresh chat status when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      refreshChatStatus();
    }
  }, [walletAddress]);

  const checkUserSession = async () => {
    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      console.log('🔍 checkUserSession - isLoggedIn:', isLoggedIn);
      
      if (isLoggedIn) {
        const metadata = await (magic.user as any).getInfo();
        console.log('📋 checkUserSession - metadata:', metadata);
        
        // Get Solana wallet address using Solana extension
        let publicAddress = '';
        try {
          console.log('🔑 Getting Solana wallet address...');
          // Use getPublicAddress() to get Solana address (not Ethereum)
          publicAddress = await (magic as any).solana.getPublicAddress();
          console.log('✅ Solana wallet address:', publicAddress);
        } catch (solanaError) {
          console.error('❌ Failed to get Solana wallet:', solanaError);
          console.error('Error details:', solanaError);
        }
        
        console.log('💼 Final Solana publicAddress:', publicAddress);
        
        setUser({
          id: metadata.issuer || '',
          email: metadata.email || '',
          name: metadata.email?.split('@')[0] || 'User',
          publicAddress: publicAddress,
          issuer: metadata.issuer || '',
          wallet_address: publicAddress,
          auth_provider: 'email',
        });
        setWalletAddress(publicAddress || null);
        console.log('✅ User state updated with Solana wallet:', publicAddress);
      }
    } catch (error) {
      console.error('❌ Error checking user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Starting Magic.link login for:', email);
      
      // Send magic link to email
      console.log('📧 Sending OTP to email...');
      await (magic.auth as any).loginWithEmailOTP({ email });
      console.log('✅ OTP sent successfully');
      
      // Get user metadata
      console.log('👤 Fetching user metadata...');
      const metadata = await (magic.user as any).getInfo();
      console.log('📋 User metadata:', metadata);
      
      // Get Solana wallet address using Solana extension
      let publicAddress = '';
      try {
        console.log('� Getting Solana wallet address...');
        // Use getPublicAddress() to get Solana address (not Ethereum)
        publicAddress = await (magic as any).solana.getPublicAddress();
        console.log('✅ Solana wallet address:', publicAddress);
      } catch (solanaError) {
        console.error('❌ Failed to get Solana wallet:', solanaError);
        console.error('Error details:', solanaError);
      }
      
      console.log('💼 Final Solana wallet address:', publicAddress);
      
      setUser({
        id: metadata.issuer || '',
        email: metadata.email || email,
        name: (metadata.email || email).split('@')[0] || 'User',
        publicAddress: publicAddress,
        issuer: metadata.issuer || '',
        wallet_address: publicAddress,
        auth_provider: 'email',
      });
      setWalletAddress(publicAddress || null);
      
      console.log('✅ Login successful with Solana wallet:', { email, publicAddress, issuer: metadata.issuer });
    } catch (error) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await magic.user.logout();
      setUser(null);
      setWalletAddress(null);
      setChatStatus(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshChatStatus = async () => {
    if (!walletAddress) {
      console.log('🔍 [CHAT STATUS] No wallet address, setting chatStatus to null');
      setChatStatus(null);
      return;
    }

    try {
      console.log('🔍 [CHAT STATUS] Checking chat access for:', { 
        walletAddress, 
        email: user?.email,
        hasEmail: !!user?.email 
      });
      const status = await canUseChat(walletAddress, user?.email);
      console.log('✅ [CHAT STATUS] Result:', status);
      setChatStatus(status);
    } catch (error) {
      console.error('❌ [CHAT STATUS] Error refreshing chat status:', error);
      setChatStatus(null);
    }
  };

  const value: MagicAuthContextType = {
    user,
    walletAddress,
    chatStatus,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshChatStatus,
  };

  return (
    <MagicAuthContext.Provider value={value}>
      {children}
    </MagicAuthContext.Provider>
  );
};

// Backward compatibility export
export const useAuth = useMagicAuth;
