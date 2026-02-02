import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, ExternalLink } from "lucide-react";

interface UpcomingSignal {
  id: string;
  market_id: string;
  market_question: string;
  market_slug: string;
  action: string;
  price: number;
  edge: number;
  confidence: number;
  category: string;
  resolution_date: string;
  status: string;
}

export default function UpcomingResolutions() {
  const [signals, setSignals] = useState<UpcomingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

  useEffect(() => {
    if (!apiBaseUrl) return;

    const fetchUpcoming = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/performance/upcoming?days=7`);
        if (!response.ok) throw new Error("Failed to fetch upcoming resolutions");
        const data = await response.json();
        setSignals(data);
      } catch (error) {
        console.error("Failed to fetch upcoming resolutions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
    const interval = setInterval(fetchUpcoming, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  if (loading) {
    return null;
  }

  if (signals.length === 0) {
    return null;
  }

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  };

  const getUrgencyColor = (dateStr: string) => {
    if (!dateStr) return "gray";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) return "red";
    if (hours < 72) return "yellow";
    return "blue";
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border-yellow-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Resolving Soon
        </CardTitle>
        <CardDescription className="text-gray-300">
          {signals.length} signal{signals.length !== 1 ? 's' : ''} resolving in the next 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signals.slice(0, 5).map((signal) => {
            const daysUntil = getDaysUntil(signal.resolution_date);
            const urgencyColor = getUrgencyColor(signal.resolution_date);
            
            return (
              <div
                key={signal.id}
                className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-yellow-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={`
                          ${urgencyColor === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                          ${urgencyColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                          ${urgencyColor === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                        `}
                      >
                        {daysUntil}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {signal.category}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-white line-clamp-2 mb-2">
                      {signal.market_question}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {(signal.edge * 100).toFixed(1)}% edge
                      </span>
                      <span>
                        {signal.confidence}% conf
                      </span>
                      <span className="font-medium text-white">
                        {signal.action}
                      </span>
                    </div>
                  </div>
                  {signal.market_slug && (
                    <a
                      href={`https://polymarket.com/event/${signal.market_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {signals.length > 5 && (
          <div className="mt-3 text-center text-sm text-gray-400">
            +{signals.length - 5} more resolving soon
          </div>
        )}
        
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-400">
            💡 <strong>Track Record Building:</strong> Check back after these resolve to see Zigma's real performance!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
