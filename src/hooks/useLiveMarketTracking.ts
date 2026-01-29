import { useEffect, useState, useRef } from 'react';

interface MarketUpdate {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  fiveMinChange: number;
  isSignificantChange: boolean;
  isPriceUp: boolean;
  timestamp: number;
  spread?: number;
  volume?: number;
  liquidity?: number;
}

interface PriceAlert {
  message: string;
  currentPrice: number;
  priceChangePercent: number;
  timestamp: number;
}

interface UseLiveMarketTrackingProps {
  marketId?: string;
  onUpdate?: (update: MarketUpdate) => void;
  onAlert?: (alert: PriceAlert) => void;
  onSignificantChange?: (update: MarketUpdate) => void;
}

export const useLiveMarketTracking = ({
  marketId,
  onUpdate,
  onAlert,
  onSignificantChange
}: UseLiveMarketTrackingProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<MarketUpdate | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!marketId) return;

    const connect = () => {
      try {
        const wsUrl = `ws://localhost:3001/ws/market-tracking`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[LIVE TRACKING] Connected to WebSocket');
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttempts.current = 0;

          // Subscribe to market
          ws.send(JSON.stringify({
            type: 'subscribe',
            marketId
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            switch (message.type) {
              case 'connected':
                console.log('[LIVE TRACKING] Connection confirmed:', message.clientId);
                break;

              case 'initial_data':
                console.log('[LIVE TRACKING] Initial data received:', message.data);
                setLatestUpdate(message.data);
                break;

              case 'market_update':
                console.log('[LIVE TRACKING] Market update:', message.data);
                setLatestUpdate(message.data);
                
                if (onUpdate) {
                  onUpdate(message.data);
                }

                // Trigger auto-refresh on significant changes
                if (message.data.isSignificantChange && onSignificantChange) {
                  onSignificantChange(message.data);
                }
                break;

              case 'price_alert':
                console.log('[LIVE TRACKING] Price alert:', message.data);
                if (onAlert) {
                  onAlert(message.data);
                }
                break;

              case 'pong':
                // Heartbeat response
                break;

              default:
                console.warn('[LIVE TRACKING] Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('[LIVE TRACKING] Error parsing message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[LIVE TRACKING] WebSocket error:', error);
          setConnectionError('Connection error');
        };

        ws.onclose = () => {
          console.log('[LIVE TRACKING] WebSocket closed');
          setIsConnected(false);
          wsRef.current = null;

          // Attempt reconnection with exponential backoff
          if (reconnectAttempts.current < 5) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`[LIVE TRACKING] Reconnecting in ${delay}ms...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            setConnectionError('Failed to connect after multiple attempts');
          }
        };

        // Heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Every 30 seconds

        return () => {
          clearInterval(heartbeatInterval);
        };

      } catch (error) {
        console.error('[LIVE TRACKING] Error creating WebSocket:', error);
        setConnectionError('Failed to create connection');
      }
    };

    connect();

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        // Unsubscribe before closing
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'unsubscribe',
            marketId
          }));
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [marketId, onUpdate, onAlert, onSignificantChange]);

  return {
    isConnected,
    latestUpdate,
    connectionError
  };
};
