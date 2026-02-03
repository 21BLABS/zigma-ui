/**
 * WebSocket Activity Feed Hook
 * Real-time updates for agent activity
 */

import { useEffect, useState, useCallback } from 'react';

export interface ActivityEvent {
  id: string;
  type: 'trade' | 'skill_execution' | 'pnl_update' | 'tier_change';
  agentId: string;
  agentName: string;
  timestamp: string;
  data: {
    skillId?: string;
    marketId?: string;
    side?: 'YES' | 'NO';
    amount?: number;
    pnl?: number;
    tier?: string;
    message?: string;
  };
}

export function useActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    const PLATFORM_API_URL = import.meta.env.VITE_PLATFORM_API_URL || 'http://localhost:3002';
    const wsUrl = PLATFORM_API_URL.replace('http', 'ws') + '/ws/activity';
    
    console.log('[Activity Feed] Connecting to:', wsUrl);
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('[Activity Feed] Connected');
      setConnected(true);
    };
    
    websocket.onmessage = (event) => {
      try {
        const activity = JSON.parse(event.data) as ActivityEvent;
        setActivities(prev => [activity, ...prev].slice(0, 50)); // Keep last 50
      } catch (error) {
        console.error('[Activity Feed] Parse error:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('[Activity Feed] WebSocket error:', error);
      setConnected(false);
    };
    
    websocket.onclose = () => {
      console.log('[Activity Feed] Disconnected');
      setConnected(false);
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        console.log('[Activity Feed] Reconnecting...');
        connect();
      }, 5000);
    };
    
    setWs(websocket);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  return { activities, connected };
}
