import React, { useState, useEffect } from 'react';
import { useNotifications, NotificationChannel } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const NotificationSettings: React.FC = () => {
  const {
    preferences,
    serviceStatus,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    sendTestNotification,
  } = useNotifications();
  
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(false);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [inAppEnabled, setInAppEnabled] = useState<boolean>(true);
  const [tradeNotifications, setTradeNotifications] = useState<boolean>(true);
  const [pnlNotifications, setPnlNotifications] = useState<boolean>(true);
  const [systemNotifications, setSystemNotifications] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});
  
  // Load preferences
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);
  
  // Update local state when preferences change
  useEffect(() => {
    if (preferences) {
      setTelegramChatId(preferences.telegramChatId || '');
      setTelegramEnabled(preferences.telegramEnabled);
      setEmailEnabled(preferences.emailEnabled);
      setInAppEnabled(preferences.inAppEnabled);
      setTradeNotifications(preferences.tradeNotifications);
      setPnlNotifications(preferences.pnlNotifications);
      setSystemNotifications(preferences.systemNotifications);
    }
  }, [preferences]);
  
  // Save preferences
  const handleSave = async () => {
    setIsSaving(true);
    
    const success = await updatePreferences({
      telegramChatId,
      telegramEnabled,
      emailEnabled,
      inAppEnabled,
      tradeNotifications,
      pnlNotifications,
      systemNotifications,
    });
    
    setIsSaving(false);
    
    if (success) {
      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive',
      });
    }
  };
  
  // Send test notification
  const handleTestNotification = async (channel: NotificationChannel) => {
    setIsTesting({ ...isTesting, [channel]: true });
    
    const success = await sendTestNotification(channel);
    
    setIsTesting({ ...isTesting, [channel]: false });
    
    if (success) {
      toast({
        title: 'Test notification sent',
        description: `A test notification has been sent to ${channel}.`,
      });
    } else {
      toast({
        title: 'Error',
        description: `Failed to send test notification to ${channel}.`,
        variant: 'destructive',
      });
    }
  };
  
  // Get service status badge
  const getServiceStatusBadge = (isActive: boolean | undefined) => {
    if (isActive === undefined) return <Badge variant="outline">Unknown</Badge>;
    return isActive ? (
      <Badge variant="outline" className="bg-green-500 text-white">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };
  
  if (loading && !preferences) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading notification settings...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !preferences) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load notification settings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">
            Configure how and when you receive notifications about your trading activities.
          </p>
        </div>
        
        <Tabs defaultValue="channels">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="types">Notification Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="space-y-6 mt-6">
            {/* In-App Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>In-App Notifications</CardTitle>
                    <CardDescription>
                      Notifications displayed within the application
                    </CardDescription>
                  </div>
                  {getServiceStatusBadge(serviceStatus?.inApp)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-enabled">Enable in-app notifications</Label>
                  <Switch
                    id="in-app-enabled"
                    checked={inAppEnabled}
                    onCheckedChange={setInAppEnabled}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleTestNotification(NotificationChannel.IN_APP)}
                  disabled={!inAppEnabled || isTesting[NotificationChannel.IN_APP]}
                >
                  {isTesting[NotificationChannel.IN_APP] ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Notification
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                      Notifications sent to your email address
                    </CardDescription>
                  </div>
                  {getServiceStatusBadge(serviceStatus?.email)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Enable email notifications</Label>
                  <Switch
                    id="email-enabled"
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleTestNotification(NotificationChannel.EMAIL)}
                  disabled={!emailEnabled || isTesting[NotificationChannel.EMAIL]}
                >
                  {isTesting[NotificationChannel.EMAIL] ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Telegram Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Telegram Notifications</CardTitle>
                    <CardDescription>
                      Notifications sent to your Telegram account
                    </CardDescription>
                  </div>
                  {getServiceStatusBadge(serviceStatus?.telegram)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="telegram-enabled">Enable Telegram notifications</Label>
                  <Switch
                    id="telegram-enabled"
                    checked={telegramEnabled}
                    onCheckedChange={setTelegramEnabled}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="telegram-chat-id">Telegram Chat ID</Label>
                  <Input
                    id="telegram-chat-id"
                    placeholder="Enter your Telegram Chat ID"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    To get your Chat ID, start a conversation with{' '}
                    <a
                      href="https://t.me/ZigmaTradingBot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      @ZigmaTradingBot
                    </a>{' '}
                    on Telegram and send the /start command.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleTestNotification(NotificationChannel.TELEGRAM)}
                  disabled={!telegramEnabled || !telegramChatId || isTesting[NotificationChannel.TELEGRAM]}
                >
                  {isTesting[NotificationChannel.TELEGRAM] ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Message
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="types" className="space-y-6 mt-6">
            {/* Trade Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Trade Notifications</CardTitle>
                <CardDescription>
                  Notifications about your trade executions and fills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="trade-notifications">Enable trade notifications</Label>
                  <Switch
                    id="trade-notifications"
                    checked={tradeNotifications}
                    onCheckedChange={setTradeNotifications}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* PnL Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>PnL Notifications</CardTitle>
                <CardDescription>
                  Notifications about your profit and loss updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pnl-notifications">Enable PnL notifications</Label>
                  <Switch
                    id="pnl-notifications"
                    checked={pnlNotifications}
                    onCheckedChange={setPnlNotifications}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* System Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>
                  Notifications about system events and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-notifications">Enable system notifications</Label>
                  <Switch
                    id="system-notifications"
                    checked={systemNotifications}
                    onCheckedChange={setSystemNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
