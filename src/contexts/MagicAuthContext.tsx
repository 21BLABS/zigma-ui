import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { magic, getMagic, isMagicInitialized } from '@/lib/magic';
import { getZigmaBalance, calculateAvailableChats, canUseChat } from '@/lib/solana';
import { getOrCreateAgent, Agent } from '@/lib/platformApi';

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

interface PlatformAuth {
  agent: Agent | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
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
  getIdToken: () => Promise<string | null>;
  platform: PlatformAuth;
  connectToPlatform: () => Promise<Agent | null>;
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
  const [platform, setPlatform] = useState<PlatformAuth>({
    agent: null,
    isConnected: false,
    isLoading: false,
    error: null
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    checkUserSession();
  }, []);
  
  // Auto-connect to platform when user is authenticated
  useEffect(() => {
    if (user && !platform.isConnected && !platform.isLoading) {
      console.log('🔄 Auto-connecting to platform for user:', user.email);
      connectToPlatform();
    }
  }, [user, platform.isConnected, platform.isLoading]);
  
  // Force connect on component mount if user exists
  useEffect(() => {
    if (user && !platform.isConnected) {
      console.log('🔄 Forcing platform connection on mount');
      connectToPlatform();
    }
  }, []);

  // Refresh chat status when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      refreshChatStatus();
    }
  }, [walletAddress]);

  const checkUserSession = async () => {
    try {
      // Get Magic instance safely
      const magicInstance = getMagic();
      if (!magicInstance) {
        console.error('❌ Magic not initialized in checkUserSession');
        setIsLoading(false);
        return;
      }
      
      const isLoggedIn = await magicInstance.user.isLoggedIn();
      console.log('🔍 checkUserSession - isLoggedIn:', isLoggedIn);
      
      if (isLoggedIn) {
        const metadata = await magicInstance.user.getInfo();
        console.log('📋 checkUserSession - metadata:', metadata);
        
        // Get Solana wallet address using Solana extension
        let publicAddress = '';
        try {
          console.log('🔑 Getting Solana wallet address...');
          // Use getPublicAddress() to get Solana address (not Ethereum)
          publicAddress = await magicInstance.solana.getPublicAddress();
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
      
      // Get Magic instance safely
      const magicInstance = getMagic();
      if (!magicInstance) {
        console.error('❌ Magic not initialized in login');
        throw new Error('Magic not initialized');
      }
      
      // Send magic link to email
      console.log('📧 Sending OTP to email...');
      await magicInstance.auth.loginWithEmailOTP({ email });
      console.log('✅ OTP sent successfully');
      
      // Get user metadata
      console.log('👤 Fetching user metadata...');
      const metadata = await magicInstance.user.getInfo();
      console.log('📋 User metadata:', metadata);
      
      // Get Solana wallet address using Solana extension
      let publicAddress = '';
      try {
        console.log('🔑 Getting Solana wallet address...');
        // Use getPublicAddress() to get Solana address (not Ethereum)
        publicAddress = await magicInstance.solana.getPublicAddress();
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
      console.log('🔒 Logging out...');
      
      // Get Magic instance safely
      const magicInstance = getMagic();
      if (magicInstance) {
        // Logout from Magic
        await magicInstance.user.logout();
        console.log('✅ Logged out from Magic');
      } else {
        console.warn('⚠️ Magic not initialized during logout');
      }
      
      // Clear user state
      setUser(null);
      setWalletAddress(null);
      setChatStatus(null);
      setPlatform({
        agent: null,
        isConnected: false,
        isLoading: false,
        error: null
      });
      
      console.log('✅ User state cleared');
    } catch (error) {
      console.error('❌ Error logging out:', error);
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

  const getIdToken = async (): Promise<string | null> => {
    try {
      if (!user) return null;
      
      // Get Magic instance safely
      const magicInstance = getMagic();
      if (!magicInstance) {
        console.error('❌ Magic not initialized in getIdToken');
        return null;
      }
      
      return await magicInstance.user.getIdToken();
    } catch (error) {
      console.error('❌ Error getting ID token:', error);
      return null;
    }
  };
  
  /**
   * Connect to platform backend and get/create agent
   */
  const connectToPlatform = async (): Promise<Agent | null> => {
    try {
      setPlatform(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔌 [Platform] Connecting to platform backend...');
      const agent = await getOrCreateAgent();
      
      if (agent) {
        console.log('✅ [Platform] Connected successfully, agent:', agent.id);
        setPlatform({
          agent,
          isConnected: true,
          isLoading: false,
          error: null
        });
        return agent;
      } else {
        console.error('❌ [Platform] Failed to connect to platform');
        setPlatform(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to connect to platform'
        }));
        return null;
      }
    } catch (error) {
      console.error('❌ [Platform] Connection error:', error);
      setPlatform(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return null;
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
    getIdToken,
    platform,
    connectToPlatform,
  };

  return (
    <MagicAuthContext.Provider value={value}>
      {children}
    </MagicAuthContext.Provider>
  );
};

// Backward compatibility export
export const useAuth = useMagicAuth;
