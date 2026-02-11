import React, { useState, useEffect } from 'react';
import { useNotifications, NotificationType } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Search, CheckCircle, RefreshCw, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Notifications: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>([]);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  
  // Load notifications
  useEffect(() => {
    const offset = (page - 1) * limit;
    fetchNotifications(limit, offset, unreadOnly);
  }, [fetchNotifications, page, limit, unreadOnly]);
  
  // Refresh notifications
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const offset = (page - 1) * limit;
    await fetchNotifications(limit, offset, unreadOnly);
    setIsRefreshing(false);
  };
  
  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };
  
  // Mark selected notifications as read
  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  // Handle notification selection
  const handleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(notificationId => notificationId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };
  
  // Handle select all notifications
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(notification => notification.id));
    }
  };
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by notification type
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(notification.type);
    
    return matchesSearch && matchesType;
  });
  
  // Get notification type badge
  const getNotificationTypeBadge = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TRADE_EXECUTED:
        return <Badge variant="outline" className="bg-blue-500 text-white">Trade Executed</Badge>;
      case NotificationType.TRADE_FILLED:
        return <Badge variant="outline" className="bg-green-500 text-white">Trade Filled</Badge>;
      case NotificationType.TRADE_FAILED:
        return <Badge variant="destructive">Trade Failed</Badge>;
      case NotificationType.POSITION_CLOSED:
        return <Badge variant="outline" className="bg-purple-500 text-white">Position Closed</Badge>;
      case NotificationType.PNL_UPDATE:
        return <Badge variant="outline" className="bg-yellow-500 text-white">PnL Update</Badge>;
      case NotificationType.STRATEGY_EXECUTED:
        return <Badge variant="outline" className="bg-indigo-500 text-white">Strategy Executed</Badge>;
      case NotificationType.SYSTEM_ALERT:
        return <Badge variant="outline" className="bg-orange-500 text-white">System Alert</Badge>;
      default:
        return <Badge variant="outline">Notification</Badge>;
    }
  };
  
  // Get notification icon
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
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredNotifications.length / limit);
  
  if (loading && notifications.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && notifications.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load notifications. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              View and manage your notifications
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <div className="animate-spin h-4 w-4 border-2 border-b-transparent rounded-full"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                  <span className="ml-2">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unread-only"
                      checked={unreadOnly}
                      onCheckedChange={(checked) => setUnreadOnly(!!checked)}
                    />
                    <Label htmlFor="unread-only">Unread only</Label>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Notification Types</DropdownMenuLabel>
                <div className="p-2 space-y-2">
                  {Object.values(NotificationType).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(selectedTypes.filter(t => t !== type));
                          }
                        }}
                      />
                      <Label htmlFor={`type-${type}`}>{type.replace(/_/g, ' ')}</Label>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedNotifications.length > 0 && selectedNotifications.length === filteredNotifications.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all">Select All</Label>
          </div>
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkSelectedAsRead}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Selected as Read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            </div>
          ) : (
            filteredNotifications
              .slice((page - 1) * limit, page * limit)
              .map((notification) => (
                <Card
                  key={notification.id}
                  className={`overflow-hidden ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start p-4">
                      <div className="mr-4 pt-1">
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => handleSelectNotification(notification.id)}
                        />
                      </div>
                      <div className="mr-4 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="text-sm mt-1">{notification.message}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            {getNotificationTypeBadge(notification.type)}
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                        {notification.data && Object.keys(notification.data).length > 0 && (
                          <div className="mt-2">
                            <Separator className="my-2" />
                            <div className="text-xs text-muted-foreground">
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(notification.data).map(([key, value]) => {
                                  // Skip complex objects
                                  if (typeof value === 'object' && value !== null) return null;
                                  
                                  // Format key
                                  const formattedKey = key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, str => str.toUpperCase());
                                  
                                  return (
                                    <div key={key}>
                                      <span className="font-medium">{formattedKey}:</span>{' '}
                                      <span>{String(value)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
        
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="cursor-pointer"
                >
                  <span className="sr-only">Go to previous page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                  >
                    <path
                      d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Button>
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNumber: number;
                
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (page <= 3) {
                  pageNumber = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = page - 2 + i;
                }
                
                if (pageNumber > totalPages) return null;
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === page}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {totalPages > 5 && page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="cursor-pointer"
                >
                  <span className="sr-only">Go to next page</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                  >
                    <path
                      d="M6.1584 3.13514C6.35986 2.94628 6.67627 2.95648 6.86514 3.15794L10.6151 7.15794C10.7954 7.35027 10.7954 7.64955 10.6151 7.84188L6.86514 11.8419C6.67627 12.0433 6.35986 12.0535 6.1584 11.8647C5.95694 11.6758 5.94673 11.3594 6.1356 11.1579L9.565 7.49991L6.1356 3.84188C5.94673 3.64042 5.95694 3.32401 6.1584 3.13514Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default Notifications;
