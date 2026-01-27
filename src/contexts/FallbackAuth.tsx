import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Helper function to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Clear old data with non-UUID IDs
        if (parsedUser.id && (parsedUser.id.startsWith('fallback_') || parsedUser.id.startsWith('fallback_wallet_'))) {
          console.log('Clearing old fallback user data with invalid ID format');
          localStorage.removeItem('zigma_fallback_user');
          setUser(null);
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('zigma_fallback_user');
        setUser(null);
      }
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

      // Validate password
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      // Check if user exists in localStorage
      const usersKey = 'zigma_users';
      const storedUsers = localStorage.getItem(usersKey);
      const users = storedUsers ? JSON.parse(storedUsers) : {};
      
      const normalizedEmail = email.toLowerCase();
      
      if (!users[normalizedEmail]) {
        throw new Error('No account found with this email. Please sign up first.');
      }

      const storedUser = users[normalizedEmail];
      
      // Simple password verification (in production, use proper hashing)
      if (storedUser.password !== password) {
        throw new Error('Invalid email or password.');
      }

      // Create user object without password
      const user: User = {
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
        wallet_address: storedUser.wallet_address,
        wallet_type: storedUser.wallet_type,
        auth_provider: storedUser.auth_provider,
        avatar: storedUser.avatar
      };
      
      setUser(user);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(user));
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

      // Disconnect first to clear stale state
      try {
        await wallet.disconnect?.();
      } catch (e) {}
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await wallet.connect();
      walletAddress = response.publicKey.toString();

      // Check if wallet user already exists
      const usersKey = 'zigma_users';
      const storedUsers = localStorage.getItem(usersKey);
      const users = storedUsers ? JSON.parse(storedUsers) : {};
      
      const walletEmail = `${walletAddress.toLowerCase()}@wallet.sol`;
      
      let user: User;
      
      if (users[walletEmail]) {
        // Existing wallet user
        const storedUser = users[walletEmail];
        user = {
          id: storedUser.id,
          email: storedUser.email,
          name: storedUser.name,
          wallet_address: walletAddress,
          wallet_type: walletType,
          auth_provider: storedUser.auth_provider,
          avatar: storedUser.avatar
        };
      } else {
        // New wallet user - create account
        const newUser = {
          id: generateUUID(),
          email: walletEmail,
          name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} User`,
          auth_provider: 'wallet' as const,
          wallet_address: walletAddress,
          wallet_type: walletType,
          created_at: new Date().toISOString()
        };
        
        users[walletEmail] = newUser;
        localStorage.setItem(usersKey, JSON.stringify(users));
        
        user = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          wallet_address: newUser.wallet_address,
          wallet_type: newUser.wallet_type,
          auth_provider: newUser.auth_provider
        };
      }

      setUser(user);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(user));
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

      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Validate name
      if (!name || name.trim().length < 2) {
        throw new Error('Please enter a valid name.');
      }

      const normalizedEmail = email.toLowerCase();

      // Check if account already exists
      const usersKey = 'zigma_users';
      const storedUsers = localStorage.getItem(usersKey);
      const users = storedUsers ? JSON.parse(storedUsers) : {};
      
      if (users[normalizedEmail]) {
        throw new Error('This email is already registered. Please try logging in.');
      }

      // Create new user
      const newUser = {
        id: generateUUID(),
        email: normalizedEmail,
        name: name.trim(),
        password: password, // In production, hash this!
        auth_provider: 'email' as const,
        wallet_address: null,
        wallet_type: null,
        created_at: new Date().toISOString()
      };

      // Store user
      users[normalizedEmail] = newUser;
      localStorage.setItem(usersKey, JSON.stringify(users));

      // Create user object without password
      const user: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        auth_provider: newUser.auth_provider
      };
      
      setUser(user);
      localStorage.setItem('zigma_fallback_user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Fallback signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    const normalizedEmail = email.toLowerCase();
    const usersKey = 'zigma_users';
    const storedUsers = localStorage.getItem(usersKey);
    
    if (!storedUsers) {
      throw new Error('No account found with this email.');
    }

    const users = JSON.parse(storedUsers);
    
    if (!users[normalizedEmail]) {
      throw new Error('No account found with this email.');
    }

    // In a real app, send password reset email
    // For fallback mode, just reset to a temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10);
    users[normalizedEmail].password = tempPassword;
    localStorage.setItem(usersKey, JSON.stringify(users));
    
    throw new Error(`Password reset! Your temporary password is: ${tempPassword}. Please log in and change it immediately.`);
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
