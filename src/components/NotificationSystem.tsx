import { useState, useEffect, createContext, useContext } from "react";

interface Notification {
  id: string;
  type: 'edge-change' | 'signal-new' | 'signal-resolved' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface AlertConfig {
  minEdgeForAlert: number;
  minConfidenceForAlert: number;
  enableEdgeAlerts: boolean;
  enableNewSignalAlerts: boolean;
  enableResolvedAlerts: boolean;
  enableSystemAlerts: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
  alertConfig: AlertConfig;
  updateAlertConfig: (config: Partial<AlertConfig>) => void;
  shouldAlert: (edge: number, confidence: number) => boolean;
}

const defaultAlertConfig: AlertConfig = {
  minEdgeForAlert: 5,
  minConfidenceForAlert: 60,
  enableEdgeAlerts: true,
  enableNewSignalAlerts: true,
  enableResolvedAlerts: true,
  enableSystemAlerts: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(defaultAlertConfig);

  useEffect(() => {
    const saved = localStorage.getItem('zigma-notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    }
    
    const savedAlertConfig = localStorage.getItem('zigma-alert-config');
    if (savedAlertConfig) {
      setAlertConfig(JSON.parse(savedAlertConfig));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zigma-notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('zigma-alert-config', JSON.stringify(alertConfig));
  }, [alertConfig]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateAlertConfig = (config: Partial<AlertConfig>) => {
    setAlertConfig(prev => ({ ...prev, ...config }));
  };

  const shouldAlert = (edge: number, confidence: number): boolean => {
    return edge >= alertConfig.minEdgeForAlert && confidence >= alertConfig.minConfidenceForAlert;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearNotifications, unreadCount, alertConfig, updateAlertConfig, shouldAlert }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'edge-change': return '📈';
      case 'signal-new': return '🟢';
      case 'signal-resolved': return '✅';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getColorForType = (type: Notification['type']) => {
    switch (type) {
      case 'edge-change': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'signal-new': return 'border-green-500/50 bg-green-500/10';
      case 'signal-resolved': return 'border-blue-500/50 bg-blue-500/10';
      case 'system': return 'border-gray-500/50 bg-gray-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-green-500/30 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-green-500/20 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-green-400">Notifications</h3>
              <button
                onClick={clearNotifications}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
            <div className="overflow-y-auto max-h-72">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 border-b border-green-500/10 cursor-pointer hover:bg-green-500/5 transition ${!notification.read ? 'bg-green-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getIconForType(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-medium ${!notification.read ? 'text-white' : 'text-gray-400'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
