import { useState, useMemo, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

type Role = "user" | "assistant";

interface Recommendation {
  action: string;
  confidence: number | null;
  probability: number | null;
  marketOdds: number | null;
  effectiveEdge: number | null;
  entropy?: number;
}

interface UserProfile {
  maker: string;
  profile?: any;
  metrics: {
    totalPositions: number;
    totalTrades: number;
    uniqueMarkets: number;
    realizedPnl: number;
    unrealizedPnl: number;
    totalVolume: number;
    winRate: number;
    averagePositionSize: number;
    topMarkets: Array<{ marketId: string; title: string; pnl: number }>;
    recentActivity: Array<{
      side: string;
      size: number;
      price: number;
      timestamp: number;
      title: string;
      outcome: string;
    }>;
  };
  analysis?: {
    patterns: {
      avgHoldTime: number;
      tradeFrequency: number;
      buySellRatio: number;
      avgPositionSize: number;
      scalpingTendency: number;
      swingTendency: number;
      hodlTendency: number;
      preferredTimeframes: number[];
    };
    categoryPerformance: Array<{
      category: string;
      trades: number;
      volume: number;
      pnl: number;
      winRate: number;
      uniqueMarkets: number;
    }>;
    risk: {
      concentrationScore: number;
      topPositionExposure: number;
      categoryConcentration: Record<string, number>;
      maxDrawdownRisk: number;
      leverageRisk: number;
      diversificationScore: number;
    };
    timing: {
      bestHour: number | null;
      worstHour: number | null;
      bestDayOfWeek: number | null;
      worstDayOfWeek: number | null;
      hourlyPnl: Record<string, number>;
      dailyPnl: Record<string, number>;
      avgEntryTiming: number;
    };
    recommendations: Array<{
      type: string;
      priority: string;
      title: string;
      description: string;
    }>;
    health: {
      score: number;
      grade: string;
      factors: Array<{
        name: string;
        impact: number;
        value: number;
      }>;
    };
    summary: string;
  };
  positions: Array<{
    conditionId: string;
    title: string;
    slug: string;
    outcome: string;
    size: number;
    avgPrice: number;
    curPrice: number;
    cashPnl: number;
    percentPnl: number;
    initialValue: number;
    currentValue: number;
    endDate: string;
    redeemable: boolean;
  }>;
  trades: Array<{
    side: string;
    size: number;
    price: number;
    timestamp: number;
    title: string;
    slug: string;
    outcome: string;
    outcomeIndex: number;
    transactionHash: string;
  }>;
  activity?: Array<{
    side: string;
    size: number;
    price: number;
    timestamp: number;
    title: string;
    outcome: string;
    type: string;
  }>;
  balance?: number;
  positionsCount: number;
  tradesCount: number;
}

interface ChatMessage {
  role: Role;
  content: string;
  recommendation?: Recommendation;
  userProfile?: UserProfile;
}

interface ChatResponse {
  contextId: string;
  type?: 'market_analysis' | 'user_profile';
  matchedMarket?: {
    id: string;
    question: string;
    similarity?: number;
    source?: string;
    url?: string;
  };
  userProfile?: UserProfile;
  messages: ChatMessage[];
  recommendation?: Recommendation;
  error?: string;
}

const ACTION_VARIANTS: Record<string, { label: string; variant: string }> = {
  "BUY YES": { label: "BUY YES", variant: "bg-green-600/20 text-green-300 border-green-500/40" },
  "BUY NO": { label: "BUY NO", variant: "bg-green-600/20 text-green-300 border-green-500/40" },
  "SELL YES": { label: "SELL YES", variant: "bg-red-600/20 text-red-300 border-red-500/40" },
  "SELL NO": { label: "SELL NO", variant: "bg-red-600/20 text-red-300 border-red-500/40" },
  HOLD: { label: "HOLD", variant: "bg-yellow-600/20 text-yellow-200 border-yellow-500/40" },
  DEFAULT: { label: "NO SIGNAL", variant: "bg-gray-700/60 text-gray-200 border-gray-500/40" },
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const formatNumber = (value?: number | null, suffix = "%") => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)}${suffix}`;
};

const Chat = () => {
  const [input, setInput] = useState("");
  const [marketId, setMarketId] = useState("");
  const [polymarketUser, setPolymarketUser] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [matchedMarket, setMatchedMarket] = useState<ChatResponse["matchedMarket"]>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [queryHistory, setQueryHistory] = useState<{ query: string; timestamp: string; contextId?: string }[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('zigma-chat-history');
    if (savedHistory) {
      setQueryHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSaveToHistory = (query: string) => {
    if (!query.trim()) return;
    const newEntry = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
      contextId: contextId || undefined
    };
    const updatedHistory = [newEntry, ...queryHistory].slice(0, 50);
    setQueryHistory(updatedHistory);
    localStorage.setItem('zigma-chat-history', JSON.stringify(updatedHistory));
  };

  const handleLoadFromHistory = (entry: { query: string; contextId?: string }) => {
    setInput(entry.query);
    if (entry.contextId) {
      setContextId(entry.contextId);
    }
    setShowHistory(false);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        query: input.trim() || undefined,
        marketId: marketId.trim() || undefined,
        polymarketUser: polymarketUser.trim() || undefined,
        history: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        contextId: contextId || undefined,
      };

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const details = await res.json().catch(() => ({}));
        throw new Error(details.error || "Chat request failed");
      }

      return (await res.json()) as ChatResponse;
    },
    onSuccess: (data) => {
      setContextId(data.contextId);
      setMatchedMarket(data.matchedMarket);
      setUserProfile(data.userProfile || null);
      setMessages(data.messages);
      setError(null);
      handleSaveToHistory(input);
      setInput("");
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, mutation.status]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        (input.trim() || marketId.trim() || polymarketUser.trim()) &&
          mutation.status !== "pending"
      ),
    [input, marketId, polymarketUser, mutation.status]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate();
  };

  const handleReset = () => {
    setMessages([]);
    setContextId(null);
    setMatchedMarket(null);
    setUserProfile(null);
    setInput("");
    setMarketId("");
    setPolymarketUser("");
    setError(null);
    setShowAdvanced(false);
  };

  const renderRecommendation = (rec?: Recommendation) => {
    if (!rec) return null;
    return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge className={ACTION_VARIANTS[rec.action]?.variant || ACTION_VARIANTS.DEFAULT.variant}>
          {ACTION_VARIANTS[rec.action]?.label || rec.action}
        </Badge>
        {rec.confidence !== null && (
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-wide">Confidence</p>
            <p className="font-mono text-sm text-white">{formatNumber(rec.confidence, "%")}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] uppercase tracking-wide">Zigma Prob</p>
          <p className="font-mono text-sm text-white">{formatNumber(rec.probability)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide">Market Odds</p>
          <p className="font-mono text-sm text-white">{formatNumber(rec.marketOdds)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide">Effective Edge</p>
          <p className="font-mono text-sm text-white">
            {rec.effectiveEdge === null || rec.effectiveEdge === undefined
              ? "—"
              : `${rec.effectiveEdge.toFixed(2)}%`}
          </p>
        </div>
      </div>
      
      {/* Confidence Level Visual Indicator */}
      {rec.confidence !== null && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence Level</p>
            <span className={`text-[10px] font-mono ${
              rec.confidence >= 80 ? 'text-green-400' :
              rec.confidence >= 60 ? 'text-yellow-400' :
              rec.confidence >= 40 ? 'text-orange-400' :
              'text-red-400'
            }`}>
              {rec.confidence >= 80 ? 'HIGH' :
               rec.confidence >= 60 ? 'MODERATE' :
               rec.confidence >= 40 ? 'LOW' :
               'VERY LOW'}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                rec.confidence >= 80 ? 'bg-green-500' :
                rec.confidence >= 60 ? 'bg-yellow-500' :
                rec.confidence >= 40 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${rec.confidence}%` }}
            />
          </div>
        </div>
      )}
      
      {rec.entropy !== undefined && rec.entropy > 0.5 && (
        <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-500/40 rounded-md">
          <p className="text-[10px] uppercase tracking-wide text-yellow-300 mb-1">⚠️ High Uncertainty Warning</p>
          <p className="text-xs text-yellow-100">
            This market has high entropy ({(rec.entropy * 100).toFixed(1)}%), indicating significant uncertainty in the outcome. Consider reducing position size.
          </p>
        </div>
      )}
    </div>
  );
  };

  const renderUserProfile = (profile?: UserProfile) => {
    if (!profile) return null;
    const { metrics, maker, positions, trades, analysis } = profile;

    const safeMetrics = {
      totalPositions: metrics?.totalPositions ?? 0,
      totalTrades: metrics?.totalTrades ?? 0,
      uniqueMarkets: metrics?.uniqueMarkets ?? 0,
      realizedPnl: metrics?.realizedPnl ?? 0,
      unrealizedPnl: metrics?.unrealizedPnl ?? 0,
      totalVolume: metrics?.totalVolume ?? 0,
      winRate: metrics?.winRate ?? 0,
    };

    return (
      <div className="mt-3 space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/40">USER PROFILE</Badge>
          <span className="font-mono text-xs text-muted-foreground">{maker.slice(0, 8)}...{maker.slice(-6)}</span>
        </div>

        {/* Portfolio Health Score */}
        {analysis && analysis.health && (
          <div className="border border-green-500/20 rounded-md bg-black/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Portfolio Health</p>
              <Badge className={cn(
                "font-mono",
                analysis.health.score >= 80 ? "bg-green-600/20 text-green-300 border-green-500/40" :
                analysis.health.score >= 60 ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/40" :
                "bg-red-600/20 text-red-300 border-red-500/40"
              )}>
                Grade: {analysis.health.grade || 'N/A'}
              </Badge>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  analysis.health.score >= 80 ? "bg-green-500" :
                  analysis.health.score >= 60 ? "bg-yellow-500" :
                  "bg-red-500"
                )}
                style={{ width: `${analysis.health.score || 0}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{analysis.summary || 'No summary available'}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <div>
            <p className="text-[10px] uppercase tracking-wide">Positions</p>
            <p className="font-mono text-sm text-white">{safeMetrics.totalPositions}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide">Predictions</p>
            <p className="font-mono text-sm text-white">{safeMetrics.uniqueMarkets}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide">Realized P&L</p>
            <p className={`font-mono text-sm ${safeMetrics.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${safeMetrics.realizedPnl.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide">Unrealized P&L</p>
            <p className={`font-mono text-sm ${safeMetrics.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${safeMetrics.unrealizedPnl.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide">Total Volume</p>
            <p className="font-mono text-sm text-white">${safeMetrics.totalVolume.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide">Win Rate</p>
            <p className="font-mono text-sm text-white">{safeMetrics.winRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Trading Patterns */}
        {analysis && analysis.patterns && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Trading Patterns</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Avg Hold Time</p>
                <p className="font-mono text-white">{(analysis.patterns.avgHoldTime ?? 0) > 0 ? `${(analysis.patterns.avgHoldTime ?? 0).toFixed(1)}h` : 'N/A'}</p>
              </div>
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Trade Freq</p>
                <p className="font-mono text-white">{(analysis.patterns.tradeFrequency ?? 0).toFixed(1)}/day</p>
              </div>
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Buy/Sell Ratio</p>
                <p className="font-mono text-white">{(analysis.patterns.buySellRatio ?? 0).toFixed(2)}</p>
              </div>
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Avg Position</p>
                <p className="font-mono text-white">${(analysis.patterns.avgPositionSize ?? 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              {(analysis.patterns.scalpingTendency ?? 0) > 0.3 && (
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/40">Scalper</Badge>
              )}
              {(analysis.patterns.swingTendency ?? 0) > 0.3 && (
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/40">Swing</Badge>
              )}
              {(analysis.patterns.hodlTendency ?? 0) > 0.3 && (
                <Badge className="bg-orange-600/20 text-orange-300 border-orange-500/40">HODL</Badge>
              )}
            </div>
          </div>
        )}

        {/* Category Performance */}
        {analysis && analysis.categoryPerformance && analysis.categoryPerformance.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Category Performance</p>
            <div className="space-y-1">
              {analysis.categoryPerformance.slice(0, 4).map((cat, i) => (
                <div key={i} className="flex justify-between items-center border border-green-500/10 rounded bg-black/30 p-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-700/50 text-gray-300 border-gray-600/40 text-[9px]">{cat.category || 'N/A'}</Badge>
                    <span className="text-[9px] text-muted-foreground">{cat.trades ?? 0} trades</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-xs ${(cat.pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${(cat.pnl ?? 0).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{(cat.winRate ?? 0).toFixed(0)}% win</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Analysis */}
        {analysis && analysis.risk && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Risk Assessment</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Diversification</p>
                <p className={`font-mono text-xs ${(analysis.risk.diversificationScore ?? 0) > 70 ? 'text-green-400' : (analysis.risk.diversificationScore ?? 0) > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {(analysis.risk.diversificationScore ?? 0).toFixed(0)}%
                </p>
              </div>
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Top Position</p>
                <p className={`font-mono text-xs ${(analysis.risk.topPositionExposure ?? 0) < 30 ? 'text-green-400' : (analysis.risk.topPositionExposure ?? 0) < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {(analysis.risk.topPositionExposure ?? 0).toFixed(1)}%
                </p>
              </div>
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Drawdown Risk</p>
                <p className={`font-mono text-xs ${(analysis.risk.maxDrawdownRisk ?? 0) < 20 ? 'text-green-400' : (analysis.risk.maxDrawdownRisk ?? 0) < 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {(analysis.risk.maxDrawdownRisk ?? 0).toFixed(1)}%
                </p>
              </div>
              <div className="border border-green-500/10 rounded bg-black/30 p-2">
                <p className="text-[9px] text-muted-foreground">Concentration</p>
                <p className={`font-mono text-xs ${(analysis.risk.concentrationScore ?? 0) < 30 ? 'text-green-400' : (analysis.risk.concentrationScore ?? 0) < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {(analysis.risk.concentrationScore ?? 0).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis && analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Recommendations</p>
            <div className="space-y-2">
              {analysis.recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className={cn(
                  "border rounded p-2",
                  rec.priority === 'high' ? "border-red-500/30 bg-red-500/5" :
                  rec.priority === 'medium' ? "border-yellow-500/30 bg-yellow-500/5" :
                  "border-blue-500/30 bg-blue-500/5"
                )}>
                  <div className="flex items-start gap-2">
                    <Badge className={cn(
                      "text-[9px]",
                      rec.priority === 'high' ? "bg-red-600/20 text-red-300 border-red-500/40" :
                      rec.priority === 'medium' ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/40" :
                      "bg-blue-600/20 text-blue-300 border-blue-500/40"
                    )}>
                      {(rec.priority || 'low').toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium text-white mb-1">{rec.title || 'N/A'}</p>
                      <p className="text-[9px] text-muted-foreground">{rec.description || ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {positions && positions.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
              Active Positions ({positions.length})
            </p>
            <div className="max-h-48 overflow-y-auto border border-green-500/20 rounded-md bg-black/40">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-black/80">
                  <tr className="text-muted-foreground">
                    <th className="p-2 text-left">Market</th>
                    <th className="p-2 text-right">Size</th>
                    <th className="p-2 text-right">Avg Price</th>
                    <th className="p-2 text-right">Cur Price</th>
                    <th className="p-2 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, i) => {
                    // Calculate P&L correctly: (currentPrice - avgPrice) * size
                    const calculatedPnl = ((pos.curPrice ?? 0) - (pos.avgPrice ?? 0)) * (pos.size ?? 0);
                    return (
                      <tr key={i} className="border-t border-green-500/10 hover:bg-green-500/5">
                        <td className="p-2 text-white truncate max-w-[200px]" title={pos.title}>
                          {pos.outcome || 'N/A'}
                        </td>
                        <td className="p-2 text-right font-mono">{(pos.size ?? 0).toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">{((pos.avgPrice ?? 0) * 100).toFixed(1)}%</td>
                        <td className="p-2 text-right font-mono">{((pos.curPrice ?? 0) * 100).toFixed(1)}%</td>
                        <td className={`p-2 text-right font-mono ${calculatedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${calculatedPnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {trades && trades.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
              Trade History ({trades.length}) - Scroll for more
            </p>
            <div className="max-h-72 overflow-y-auto border border-green-500/20 rounded-md bg-black/40">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-black/80">
                  <tr className="text-muted-foreground">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Side</th>
                    <th className="p-2 text-left">Market</th>
                    <th className="p-2 text-right">Size</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, i) => (
                    <tr key={i} className="border-t border-green-500/10 hover:bg-green-500/5">
                      <td className="p-2 text-muted-foreground whitespace-nowrap">
                        {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          trade.side === 'BUY'
                            ? 'bg-green-600/20 text-green-300'
                            : 'bg-red-600/20 text-red-300'
                        }`}>
                          {trade.side || 'N/A'}
                        </span>
                      </td>
                      <td className="p-2 text-white truncate max-w-[180px]" title={trade.title}>
                        {trade.outcome || 'N/A'}
                      </td>
                      <td className="p-2 text-right font-mono">{(trade.size ?? 0).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">{((trade.price ?? 0) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {metrics && metrics.topMarkets && metrics.topMarkets.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Top Markets by P&L</p>
            <div className="space-y-1">
              {metrics.topMarkets.slice(0, 5).map((m, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-white truncate max-w-[200px]" title={m.title}>{m.title || 'N/A'}</span>
                  <span className={`font-mono ${(m.pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(m.pnl ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-green-100">
      <SiteHeader />
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <header className="space-y-4 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-green-500">
            ZIGMA TERMINAL / LIVE INTERROGATION
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-white">
            Ask Zigma about any Polymarket bet
          </h1>
          <p className="text-base text-muted-foreground max-w-3xl">
            Paste a market link, user handle, or natural-language question. Zigma will fetch the closest market,
            run a fresh edge analysis, and respond with a decisive action (BUY/SELL/HOLD) plus reasoning.
          </p>
        </header>

        <section className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-8">
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-950/80 border border-green-500/20 p-6 rounded-xl">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Ask Zigma
              </label>
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Paste a Polymarket URL or ask a question (e.g., 'Will ETH flip BTC by 2026?')"
                className="mt-2 h-24 bg-black/60 border-green-500/30 text-green-100 placeholder:text-green-200/40"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-green-400/80 hover:text-green-400 flex items-center gap-1 transition"
            >
              {showAdvanced ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced Options
                </>
              )}
            </button>

            {showAdvanced && (
              <div className="grid gap-4 pt-2 border-t border-green-500/20">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Market ID
                  </label>
                  <Input
                    value={marketId}
                    onChange={(event) => setMarketId(event.target.value)}
                    placeholder="Polymarket market UUID or conditionId"
                    className="mt-2 bg-black/60 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Use for precise market matching</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    User Wallet Address
                  </label>
                  <Input
                    value={polymarketUser}
                    onChange={(event) => setPolymarketUser(event.target.value)}
                    placeholder="0x... (Polymarket wallet address)"
                    className="mt-2 bg-black/60 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Analyze a trader's profile and positions</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/40 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="border-gray-700 text-gray-200 hover:bg-gray-900 relative"
              >
                📜 History
                {queryHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-black text-[10px] rounded-full flex items-center justify-center">
                    {queryHistory.length}
                  </span>
                )}
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="bg-green-600 hover:bg-green-500 text-black font-semibold flex-1"
              >
                {mutation.status === "pending" ? "Analyzing…" : "Ask Zigma"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="border-gray-700 text-gray-200 hover:bg-gray-900"
              >
                Reset
              </Button>
            </div>

            {showHistory && queryHistory.length > 0 && (
              <div className="mt-4 border border-green-500/20 rounded-md bg-black/40 p-3">
                <p className="text-xs text-muted-foreground mb-2">Recent Queries</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {queryHistory.slice(0, 10).map((entry, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadFromHistory(entry)}
                      className="w-full text-left text-left text-sm text-green-300 hover:text-green-200 hover:bg-green-500/10 p-2 rounded transition"
                    >
                      <div className="truncate">{entry.query}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground leading-relaxed">
              <p>• Zigma keeps the last 20 turns per thread.</p>
              <p>• Provide the exact market link for deterministic matching.</p>
              <p>• Actions are informational, not financial advice.</p>
            </div>
          </form>

          <div className="bg-gray-950/80 border border-green-500/20 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-green-500/10 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-green-400/80">
                Conversation Feed
              </p>
              {userProfile ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">User Profile</p>
                    <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/40 text-[10px]">
                      {userProfile.maker.slice(0, 8)}...{userProfile.maker.slice(-6)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Positions</p>
                      <p className="font-mono text-white">{userProfile.metrics.totalPositions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Predictions</p>
                      <p className="font-mono text-white">{userProfile.metrics.uniqueMarkets}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Win Rate</p>
                      <p className="font-mono text-white">{userProfile.metrics.winRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ) : matchedMarket ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Market</p>
                    {matchedMarket.similarity !== undefined && (
                      <span className="text-xs text-green-300">
                        Match {(matchedMarket.similarity * 100).toFixed(1)}% via {matchedMarket.source}
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-white">{matchedMarket.question}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-green-300 mt-2">
                    <span>ID: {matchedMarket.id}</span>
                    {matchedMarket.url && (
                      <a
                        href={matchedMarket.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-green-200"
                      >
                        View on Polymarket ↗
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No market or user selected yet. Ask a question to start the feed.
                </p>
              )}
            </div>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-6">
              {messages.length === 0 && mutation.status !== "pending" && (
                <div className="text-center text-muted-foreground text-sm">
                  Awaiting your first question.
                </div>
              )}
              {[...messages].reverse().map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
                    className={cn(
                      "rounded-lg p-4 border space-y-2",
                      isUser
                        ? "bg-green-600/10 border-green-500/20 ml-auto max-w-xl text-green-50"
                        : "bg-black/40 border-green-500/10 mr-auto max-w-2xl text-green-100"
                    )}
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-green-400/80">
                      {isUser ? "You" : "Agent Zigma"}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {!isUser && message.recommendation && (
                      <div>{renderRecommendation(message.recommendation)}</div>
                    )}
                  </div>
                );
              })}
              {mutation.status === "pending" && (
                <div className="text-sm text-muted-foreground italic">Zigma is thinking…</div>
              )}
            </div>

            <Separator className="bg-green-500/10" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
