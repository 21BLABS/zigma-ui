import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, NotificationType } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();
  
  const [open, setOpen] = useState(false);
  
  // Handle dropdown open
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Fetch notifications when opening the dropdown
    if (isOpen) {
      fetchNotifications(10, 0, false);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };
  
  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TRADE_EXECUTED:
        return '💰';
      case NotificationType.TRADE_FILLED:
        return '✅';
      case NotificationType.TRADE_FAILED:
        return '❌';
      case NotificationType.POSITION_CLOSED:
        return '🔒';
      case NotificationType.PNL_UPDATE:
        return '📈';
      case NotificationType.STRATEGY_EXECUTED:
        return '🤖';
      case NotificationType.SYSTEM_ALERT:
        return '⚠️';
      default:
        return '📣';
    }
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start w-full">
                  <div className="mr-2 text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {notification.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center"
          onClick={() => {
            setOpen(false);
            window.location.href = '/notifications';
          }}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
