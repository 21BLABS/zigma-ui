/**
 * Real-time Activity Feed Component
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Zap, Award } from "lucide-react";
import { useActivityFeed } from "@/hooks/useActivityFeed";

export function ActivityFeed() {
  const { activities, connected } = useActivityFeed();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4" />;
      case 'skill_execution': return <Zap className="w-4 h-4" />;
      case 'tier_change': return <Award className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'trade': return 'text-blue-400';
      case 'skill_execution': return 'text-green-400';
      case 'tier_change': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-gray-950 border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-300 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Activity
          </CardTitle>
          <Badge variant={connected ? "default" : "secondary"} className={connected ? "bg-green-500 text-black" : ""}>
            {connected ? "● LIVE" : "○ Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-green-300/60">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Waiting for activity...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="bg-black border border-green-500/30 p-3 rounded-lg hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`${getActivityColor(activity.type)} mt-1`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold truncate">{activity.agentName}</span>
                      <span className="text-xs text-green-300/60">{formatTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-green-300/80">
                      {activity.data.message || `${activity.type.replace('_', ' ')}`}
                    </p>
                    {activity.data.pnl !== undefined && (
                      <p className={`text-xs mt-1 ${activity.data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {activity.data.pnl >= 0 ? '+' : ''}{activity.data.pnl.toFixed(2)} USDC
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
