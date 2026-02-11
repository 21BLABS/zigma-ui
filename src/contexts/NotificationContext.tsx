import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useApiClient } from '@/lib/api-client';
import { useMagicAuth } from '@/contexts/MagicAuthContext';

// Notification types
export enum NotificationType {
  TRADE_EXECUTED = 'TRADE_EXECUTED',
  TRADE_FILLED = 'TRADE_FILLED',
  TRADE_FAILED = 'TRADE_FAILED',
  POSITION_CLOSED = 'POSITION_CLOSED',
  PNL_UPDATE = 'PNL_UPDATE',
  STRATEGY_EXECUTED = 'STRATEGY_EXECUTED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// Notification channel types
export enum NotificationChannel {
  TELEGRAM = 'TELEGRAM',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP'
}

// Notification interface
export interface Notification {
  id: string;
  agentId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  read: boolean;
  sentAt?: Record<NotificationChannel, string>;
  createdAt: string;
}

// Notification preferences interface
export interface NotificationPreferences {
  telegramChatId?: string;
  telegramEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  tradeNotifications: boolean;
  pnlNotifications: boolean;
  systemNotifications: boolean;
}

// Service status interface
export interface ServiceStatus {
  telegram: boolean;
  email: boolean;
  inApp: boolean;
}

// Context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  serviceStatus: ServiceStatus | null;
  loading: boolean;
  error: string | null;
  fetchNotifications: (limit?: number, offset?: number, unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
  sendTestNotification: (channel: NotificationChannel) => Promise<boolean>;
  connected: boolean;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const apiClient = useApiClient();
  const { isAuthenticated, user } = useMagicAuth();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  
  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }
    
    // Get API URL from environment
    const apiUrl = import.meta.env.VITE_PLATFORM_API_URL || 'http://localhost:3002';
    
    // Create socket connection
    const newSocket = io(`${apiUrl}`, {
      path: '/socket/notifications',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
    
    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected');
      
      // Authenticate with token
      const token = localStorage.getItem('magic_token');
      if (token) {
        newSocket.emit('authenticate', { token });
      }
    });
    
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });
    
    newSocket.on('authenticated', () => {
      console.log('Socket authenticated');
      setConnected(true);
      
      // Get unread count
      newSocket.emit('get_notifications', { unreadOnly: true });
    });
    
    newSocket.on('auth_error', (data) => {
      console.error('Socket authentication error:', data.message);
      setError(`Authentication error: ${data.message}`);
      setConnected(false);
    });
    
    newSocket.on('unread_count', (data) => {
      setUnreadCount(data.count);
    });
    
    newSocket.on('notification', (notification) => {
      // Add new notification to the list
      setNotifications((prev) => [notification, ...prev]);
      
      // Update unread count
      setUnreadCount((prev) => prev + 1);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png'
        });
      }
    });
    
    newSocket.on('notifications', (data) => {
      setNotifications(data.notifications);
    });
    
    newSocket.on('error', (data) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    });
    
    // Save socket instance
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);
  
  // Fetch notifications
  const fetchNotifications = async (
    limit: number = 50,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/notifications', {
        params: { limit, offset, unreadOnly }
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch unread count
  const fetchUnreadCount = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Update unread count
        fetchUnreadCount();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const response = await apiClient.post('/notifications/read-all');
      
      if (response.data.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
        
        // Update unread count
        setUnreadCount(0);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };
  
  // Fetch notification preferences
  const fetchPreferences = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/notifications/preferences');
      
      if (response.data.success) {
        setPreferences(response.data.preferences);
        setServiceStatus(response.data.serviceStatus);
      } else {
        setError('Failed to fetch notification preferences');
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      setError('Error fetching notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  // Update notification preferences
  const updatePreferences = async (
    newPreferences: Partial<NotificationPreferences>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await apiClient.post('/notifications/preferences', newPreferences);
      
      if (response.data.success) {
        // Update local state
        setPreferences((prev) => (prev ? { ...prev, ...newPreferences } : null));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Send test notification
  const sendTestNotification = async (channel: NotificationChannel): Promise<boolean> => {
    try {
      const response = await apiClient.post('/notifications/test', { channel });
      
      return response.data.success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };
  
  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      fetchPreferences();
    }
  }, [isAuthenticated]);
  
  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const value = {
    notifications,
    unreadCount,
    preferences,
    serviceStatus,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchPreferences,
    updatePreferences,
    sendTestNotification,
    connected
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
