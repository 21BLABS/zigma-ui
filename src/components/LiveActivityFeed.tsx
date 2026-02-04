import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface TradeActivity {
  id: string;
  agent: string;
  action: 'bought' | 'sold';
  side: 'YES' | 'NO';
  amount: number;
  market: string;
  skill?: string;
  timestamp: string;
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<TradeActivity[]>([]);

  useEffect(() => {
    // Fetch initial activities
    fetchActivities();

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let pollInterval: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const PLATFORM_API_URL = import.meta.env.VITE_PLATFORM_API_URL || 'https://platform.zigma.pro';
        const wsUrl = PLATFORM_API_URL.replace('http', 'ws') + '/ws/activity';
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('[LiveFeed] WebSocket connected');
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'initial') {
            setActivities(data.activities || []);
          } else {
            const newActivity = data as TradeActivity;
            setActivities(prev => [newActivity, ...prev].slice(0, 50));
          }
        };

        ws.onerror = (error) => {
          console.error('[LiveFeed] WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('[LiveFeed] WebSocket closed, reconnecting...');
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('[LiveFeed] Failed to connect WebSocket, using polling');
        pollInterval = setInterval(fetchActivities, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const PLATFORM_API_URL = import.meta.env.VITE_PLATFORM_API_URL || 'https://platform.zigma.pro';
      const response = await fetch(`${PLATFORM_API_URL}/api/activity/recent?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('[LiveFeed] Failed to fetch activities:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="bg-gray-950 border-green-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-300 flex items-center gap-2">
          <Activity className="w-5 h-5 animate-pulse text-red-500" />
          <span className="text-sm uppercase tracking-wider">Live Activity</span>
          <Badge variant="outline" className="ml-auto border-red-500/50 text-red-400">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-green-300/60 text-sm text-center py-8">
            Waiting for activity...
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-black/50 border border-green-500/20 p-3 rounded-lg hover:border-green-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-400 font-semibold text-sm">
                      @{activity.agent}
                    </span>
                    <span className="text-green-300/60 text-xs">
                      {activity.action}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        activity.side === 'YES' 
                          ? 'border-green-500/50 text-green-400' 
                          : 'border-red-500/50 text-red-400'
                      }`}
                    >
                      {activity.side}
                    </Badge>
                    <span className="text-white font-semibold text-sm">
                      ${activity.amount}
                    </span>
                  </div>
                  
                  <p className="text-green-300/80 text-xs truncate">
                    {activity.market}
                  </p>
                  
                  {activity.skill && (
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-xs border-purple-500/50 text-purple-400"
                    >
                      {activity.skill}
                    </Badge>
                  )}
                </div>
                
                <span className="text-green-300/40 text-xs whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;
