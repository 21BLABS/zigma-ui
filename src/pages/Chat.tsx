import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetricTooltip } from "@/components/MetricTooltip";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

// ============================================================
// TYPES
// ============================================================
type Role = "user" | "assistant";

interface Recommendation {
  action: string;
  confidence: number | null;
  probability: number | null;
  marketOdds: number | null;
  effectiveEdge: number | null;
  entropy?: number;
  kellyFraction?: number;
  tier?: string;
  reasoning?: string;
  newsSources?: Array<{
    title: string;
    source: string;
    url?: string;
    date?: string;
    relevance?: string;
  }>;
  tradingStrategy?: {
    entry: number;
    target: number;
    stopLoss: number;
    timeHorizon: string;
    positionSize: string;
    riskReward: number;
  };
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
      winRate?: number;
      profitFactor?: number;
      sharpeRatio?: number;
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
    summary: string | { summary: string; improvements?: string[] };
    insights?: Array<{
      category: string;
      insight: string;
      positive: boolean;
    }>;
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
  type?: "market_analysis" | "user_profile";
  matchedMarket?: {
    id: string;
    question: string;
    similarity?: number;
    source?: string;
    url?: string;
    endDateIso?: string;
    liquidity?: number;
    volume24hr?: number;
    category?: string;
  };
  userProfile?: UserProfile;
  messages: ChatMessage[];
  recommendation?: Recommendation;
  analysis?: any;
  error?: string;
}

// ============================================================
// CONSTANTS
// ============================================================
const ACTION_VARIANTS: Record<string, { label: string; variant: string; icon: string }> = {
  "BUY YES": { label: "BUY YES", variant: "bg-green-600/30 text-green-300 border-green-500/50", icon: "📈" },
  "EXECUTE BUY YES": { label: "BUY YES", variant: "bg-green-600/30 text-green-300 border-green-500/50", icon: "📈" },
  "BUY NO": { label: "BUY NO", variant: "bg-red-600/30 text-red-300 border-red-500/50", icon: "📉" },
  "EXECUTE BUY NO": { label: "BUY NO", variant: "bg-red-600/30 text-red-300 border-red-500/50", icon: "📉" },
  "SELL YES": { label: "SELL YES", variant: "bg-orange-600/30 text-orange-300 border-orange-500/50", icon: "💹" },
  "SELL NO": { label: "SELL NO", variant: "bg-orange-600/30 text-orange-300 border-orange-500/50", icon: "💹" },
  HOLD: { label: "HOLD", variant: "bg-yellow-600/30 text-yellow-200 border-yellow-500/50", icon: "⏸️" },
  DEFAULT: { label: "NO SIGNAL", variant: "bg-gray-700/60 text-gray-200 border-gray-500/40", icon: "⏹️" },
};

const TIER_COLORS: Record<string, string> = {
  STRONG_TRADE: "bg-green-600/30 text-green-300 border-green-500/50",
  SMALL_TRADE: "bg-blue-600/30 text-blue-300 border-blue-500/50",
  PROBE: "bg-purple-600/30 text-purple-300 border-purple-500/50",
  SCOUT: "bg-cyan-600/30 text-cyan-300 border-cyan-500/50",
  NO_TRADE: "bg-gray-700/60 text-gray-200 border-gray-500/40",
};

const SUGGESTED_QUERIES = [
  { label: "🔥 High edge crypto markets", query: "Show me crypto markets with high edge" },
  { label: "🏆 Best presidential election bet", query: "What's the best presidential election market?" },
  { label: "⚖️ Compare BTC vs ETH", query: "Compare Bitcoin vs Ethereum markets" },
  { label: "🏈 Sports futures", query: "Show me sports futures with good odds" },
  { label: "📊 Analyze trader", query: "Analyze user 0xf1879bcf95ad31c43be1deea77a51572d5b301fe" },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// ============================================================
// UTILITY FUNCTIONS - Fixed number formatting with en-US locale
// ============================================================
const formatCurrency = (value?: number | null, decimals = 2): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatNumber = (value?: number | null, suffix = "%", decimals = 2): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}${suffix}`;
};

const formatPercent = (value?: number | null, decimals = 1): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}%`;
};

const safeNumber = (value: any, fallback: number = 0): number => {
  if (typeof value !== 'number') return fallback;
  if (!Number.isFinite(value)) return fallback;
  return value;
};

const safePercent = (value: any, decimals: number = 1): string => {
  const num = safeNumber(value, 0);
  if (num === Infinity || num === -Infinity) return '—';
  return `${num.toFixed(decimals)}%`;
};

const safeRatio = (value: any): string => {
  const num = safeNumber(value, 0);
  if (num === Infinity || num === -Infinity || num < 0) return '—';
  return `${num.toFixed(2)}:1`;
};

const formatLargeNumber = (value?: number | null): string => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
};

const getConfidenceLevel = (confidence: number): { label: string; color: string } => {
  if (confidence >= 80) return { label: "Very High", color: "text-green-400" };
  if (confidence >= 65) return { label: "High", color: "text-green-300" };
  if (confidence >= 50) return { label: "Moderate", color: "text-yellow-400" };
  if (confidence >= 35) return { label: "Low", color: "text-orange-400" };
  return { label: "Very Low", color: "text-red-400" };
};

const getEdgeQuality = (edge: number): { label: string; color: string } => {
  const absEdge = Math.abs(edge);
  if (absEdge >= 10) return { label: "Excellent", color: "text-green-400" };
  if (absEdge >= 5) return { label: "Good", color: "text-green-300" };
  if (absEdge >= 2) return { label: "Moderate", color: "text-yellow-400" };
  if (absEdge >= 0.5) return { label: "Weak", color: "text-orange-400" };
  return { label: "None", color: "text-gray-400" };
};

const getDaysRemaining = (endDate?: string): number | null => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

const getTimeUrgency = (days: number | null): { label: string; color: string } => {
  if (days === null) return { label: "Unknown", color: "text-gray-400" };
  if (days <= 1) return { label: "Urgent", color: "text-red-400" };
  if (days <= 7) return { label: "Soon", color: "text-orange-400" };
  if (days <= 30) return { label: "Near-term", color: "text-yellow-400" };
  if (days <= 90) return { label: "Medium-term", color: "text-blue-400" };
  return { label: "Long-term", color: "text-gray-400" };
};

// ============================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================
const CollapsibleSection = ({
  title,
  icon,
  defaultOpen = false,
  children,
  badge,
}: {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-green-500/20 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-black/40 hover:bg-black/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span className="text-xs uppercase tracking-wide text-green-400/80">{title}</span>
          {badge}
        </div>
        <svg
          className={cn("w-4 h-4 text-green-400/60 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-3 border-t border-green-500/10">{children}</div>}
    </div>
  );
};

// ============================================================
// CONFIDENCE METER COMPONENT
// ============================================================
const ConfidenceMeter = ({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) => {
  const { label, color } = getConfidenceLevel(value);
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  const getBarColor = () => {
    if (value >= 80) return "bg-gradient-to-r from-green-500 to-emerald-400";
    if (value >= 65) return "bg-gradient-to-r from-green-400 to-lime-400";
    if (value >= 50) return "bg-gradient-to-r from-yellow-500 to-amber-400";
    if (value >= 35) return "bg-gradient-to-r from-orange-500 to-amber-500";
    return "bg-gradient-to-r from-red-500 to-orange-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence</span>
        <span className={cn("text-xs font-mono", color)}>
          {value.toFixed(1)}% ({label})
        </span>
      </div>
      <div className={cn("w-full bg-gray-800 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn("rounded-full transition-all duration-700 ease-out", heights[size], getBarColor())}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================
// EDGE VISUALIZER COMPONENT
// ============================================================
const EdgeVisualizer = ({
  marketOdds,
  zigmaOdds,
  action,
}: {
  marketOdds: number;
  zigmaOdds: number;
  action: string;
}) => {
  const edge = zigmaOdds - marketOdds;
  const { label: edgeLabel, color: edgeColor } = getEdgeQuality(edge);
  const isPositive = edge > 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Edge Visualization</span>
        <span className={edgeColor}>
          {edge > 0 ? "+" : ""}
          {edge.toFixed(2)}% Edge ({edgeLabel})
        </span>
      </div>
      <div className="relative h-12 bg-gray-900 rounded-lg overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 flex justify-between px-2 text-[9px] text-gray-600">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div key={tick} className="flex flex-col items-center">
              <div className="h-full w-px bg-gray-700/50" />
              <span className="mt-1">{tick}%</span>
            </div>
          ))}
        </div>

        {/* Market odds marker */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center justify-center z-10"
          style={{ left: `${marketOdds}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-1 h-8 bg-yellow-500 rounded-full" />
          <span className="text-[9px] text-yellow-400 mt-1 whitespace-nowrap">Market</span>
        </div>

        {/* Zigma odds marker */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center justify-center z-10"
          style={{ left: `${zigmaOdds}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-1 h-8 bg-green-500 rounded-full" />
          <span className="text-[9px] text-green-400 mt-1 whitespace-nowrap">Zigma</span>
        </div>

        {/* Edge zone highlight */}
        {Math.abs(edge) > 0.5 && (
          <div
            className={cn(
              "absolute top-1 bottom-5 rounded opacity-30",
              isPositive ? "bg-green-500" : "bg-red-500"
            )}
            style={{
              left: `${Math.min(marketOdds, zigmaOdds)}%`,
              width: `${Math.abs(edge)}%`,
            }}
          />
        )}
      </div>
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-yellow-400">Market: {marketOdds.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-green-400">Zigma: {zigmaOdds.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// QUICK ACTIONS COMPONENT
// ============================================================
const QuickActions = ({
  marketId,
  marketQuestion,
  marketUrl,
  onTrack,
  onCompare,
  onSimulate,
  onShare,
}: {
  marketId: string;
  marketQuestion: string;
  marketUrl?: string;
  onTrack: () => void;
  onCompare: () => void;
  onSimulate: () => void;
  onShare: () => void;
}) => {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      <button
        onClick={onTrack}
        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 rounded-lg transition"
      >
        📌 Track
      </button>
      <button
        onClick={onCompare}
        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition"
      >
        ⚖️ Compare
      </button>
      <button
        onClick={onSimulate}
        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg transition"
      >
        🎮 Simulate
      </button>
      <button
        onClick={onShare}
        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border border-gray-500/30 rounded-lg transition"
      >
        📤 Share
      </button>
      {marketUrl && (
        <a
          href={marketUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30 rounded-lg transition"
        >
          🔗 Polymarket ↗
        </a>
      )}
    </div>
  );
};

// ============================================================
// SMART FOLLOW-UPS COMPONENT
// ============================================================
const SmartFollowUps = ({
  recommendation,
  matchedMarket,
  onSelectFollowUp,
}: {
  recommendation?: Recommendation;
  matchedMarket?: ChatResponse["matchedMarket"];
  onSelectFollowUp: (query: string) => void;
}) => {
  const followUps = useMemo(() => {
    const suggestions: string[] = [];

    if (recommendation) {
      if (recommendation.entropy && recommendation.entropy > 0.5) {
        suggestions.push("Why is there high uncertainty in this market?");
      }
      if (recommendation.effectiveEdge && Math.abs(recommendation.effectiveEdge) > 5) {
        suggestions.push(
          recommendation.effectiveEdge > 0
            ? "What's driving the undervaluation?"
            : "Why might the market be overvaluing this?"
        );
      }
      if (recommendation.confidence && recommendation.confidence < 50) {
        suggestions.push("What would increase your confidence in this prediction?");
      }
      if (recommendation.action?.includes("BUY")) {
        suggestions.push("What are the main risks to this position?");
        suggestions.push("When should I exit this trade?");
      }
    }

    if (matchedMarket) {
      suggestions.push(`Compare this with similar ${matchedMarket.category || "markets"}`);
      suggestions.push("What news could move this market?");
    }

    return suggestions.slice(0, 4);
  }, [recommendation, matchedMarket]);

  if (followUps.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-green-500/10">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
        💡 Follow-up Questions
      </p>
      <div className="flex flex-wrap gap-2">
        {followUps.map((followUp, idx) => (
          <button
            key={idx}
            onClick={() => onSelectFollowUp(followUp)}
            className="text-xs px-3 py-1.5 bg-green-900/20 hover:bg-green-900/40 text-green-300/80 hover:text-green-300 border border-green-500/20 hover:border-green-500/40 rounded-lg transition"
          >
            {followUp}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// SCENARIO SIMULATOR MODAL
// ============================================================
const ScenarioSimulator = ({
  isOpen,
  onClose,
  recommendation,
  matchedMarket,
}: {
  isOpen: boolean;
  onClose: () => void;
  recommendation?: Recommendation;
  matchedMarket?: ChatResponse["matchedMarket"];
}) => {
  const [positionSize, setPositionSize] = useState(100);
  const [targetOdds, setTargetOdds] = useState(recommendation?.probability || 50);

  if (!isOpen || !recommendation || !matchedMarket) return null;

  const currentOdds = recommendation.marketOdds || 50;
  const isYes = recommendation.action?.includes("YES");
  const entryPrice = isYes ? currentOdds / 100 : (100 - currentOdds) / 100;

  // P&L calculation
  const shares = positionSize / entryPrice;
  const payoutIfWin = shares * 1;
  const costBasis = positionSize;
  const profitIfWin = payoutIfWin - costBasis;
  const lossIfLose = -costBasis;

  // Expected value
  const winProb = targetOdds / 100;
  const expectedValue = profitIfWin * winProb + lossIfLose * (1 - winProb);
  const roi = (expectedValue / positionSize) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-950 border border-green-500/30 rounded-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">🎮 Scenario Simulator</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Position Size ($)</label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={positionSize}
              onChange={(e) => setPositionSize(Number(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-sm text-green-400">
              <span>${positionSize}</span>
              <span>{((positionSize / 1000) * 100).toFixed(0)}% of $1K bankroll</span>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Target Odds (%)</label>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={targetOdds}
              onChange={(e) => setTargetOdds(Number(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-sm text-green-400">
              <span>{targetOdds}%</span>
              <span>Zigma: {(recommendation.probability || 50).toFixed(1)}%</span>
            </div>
          </div>

          <Separator className="bg-green-500/20" />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-green-400/60">If Correct</p>
              <p className="text-xl font-mono text-green-400">+{formatCurrency(profitIfWin)}</p>
              <p className="text-xs text-green-400/80">ROI: +{((profitIfWin / costBasis) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-red-400/60">If Wrong</p>
              <p className="text-xl font-mono text-red-400">{formatCurrency(lossIfLose)}</p>
              <p className="text-xs text-red-400/80">Loss: 100%</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Expected Value</p>
            <p className={cn("text-lg font-mono", expectedValue >= 0 ? "text-green-400" : "text-red-400")}>
              {expectedValue >= 0 ? "+" : ""}
              {formatCurrency(expectedValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              ROI: {roi >= 0 ? "+" : ""}
              {roi.toFixed(1)}% at {targetOdds}% win probability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN CHAT COMPONENT
// ============================================================
const Chat = () => {
  // State
  const [input, setInput] = useState("");
  const [marketId, setMarketId] = useState("");
  const [polymarketUser, setPolymarketUser] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;
  const [matchedMarket, setMatchedMarket] = useState<ChatResponse["matchedMarket"] | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [queryHistory, setQueryHistory] = useState<{ query: string; timestamp: string; contextId?: string }[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showSimulator, setShowSimulator] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Computed values
  const isFavorite = matchedMarket ? favorites.includes(matchedMarket.id) : false;
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  // Load saved data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("zigma-chat-history");
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch {}
    }
    const savedFavorites = localStorage.getItem("zigma-favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {}
    }

    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowHistory(false);
        setShowSuggestions(false);
        setEditingMessageIndex(null);
        setEditingContent("");
        setShowSimulator(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        setShowHistory((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handlers
  const handleSaveToHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      const newEntry = { query: query.trim(), timestamp: new Date().toISOString(), contextId: contextId || undefined };
      const updatedHistory = [newEntry, ...queryHistory].slice(0, 50);
      setQueryHistory(updatedHistory);
      localStorage.setItem("zigma-chat-history", JSON.stringify(updatedHistory));
    },
    [contextId, queryHistory]
  );

  const handleToggleFavorite = useCallback(
    (id: string) => {
      const updated = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
      setFavorites(updated);
      localStorage.setItem("zigma-favorites", JSON.stringify(updated));
    },
    [favorites]
  );

  const handleCopyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleEditMessage = useCallback(
    (index: number) => {
      setEditingMessageIndex(index);
      setEditingContent(messages[index]?.content || "");
    },
    [messages]
  );

  const handleSaveEdit = useCallback(() => {
    if (editingMessageIndex !== null) {
      const updated = [...messages];
      updated[editingMessageIndex] = { ...updated[editingMessageIndex], content: editingContent };
      setMessages(updated);
      setEditingMessageIndex(null);
      setEditingContent("");
    }
  }, [editingMessageIndex, editingContent, messages]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageIndex(null);
    setEditingContent("");
  }, []);

  const handleDeleteMessage = useCallback(
    (index: number) => {
      setMessages(messages.filter((_, i) => i !== index));
    },
    [messages]
  );

  const handleLoadFromHistory = useCallback((entry: { query: string; contextId?: string }) => {
    setInput(entry.query);
    if (entry.contextId) setContextId(entry.contextId);
    setShowHistory(false);
    inputRef.current?.focus();
  }, []);

  const handleSuggestedQuery = useCallback((query: string) => {
    setInput(query);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const handleLoadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handleReset = useCallback(() => {
    setMessages([]);
    setContextId(null);
    setMatchedMarket(null);
    setUserProfile(null);
    setCurrentAnalysis(null);
    setInput("");
    setMarketId("");
    setPolymarketUser("");
    setError(null);
    setShowAdvanced(false);
  }, []);

  const handleRetryQuery = useCallback(() => {
    if (input.trim()) {
      mutation.mutate();
    }
  }, [input]);

  const filteredHistory = useMemo(
    () => queryHistory.filter((entry) => entry.query.toLowerCase().includes(historySearchQuery.toLowerCase())),
    [queryHistory, historySearchQuery]
  );

  // API Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        query: input.trim() || undefined,
        marketId: marketId.trim() || undefined,
        polymarketUser: polymarketUser.trim() || undefined,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
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
      setMatchedMarket(data.matchedMarket || null);
      setUserProfile(data.userProfile || null);
      setCurrentAnalysis(data.analysis || null);
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

  const canSubmit = Boolean(
    (input.trim() || marketId.trim() || polymarketUser.trim()) && mutation.status !== "pending"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate();
  };

  // ============================================================
  // RENDER RECOMMENDATION
  // ============================================================
  const renderRecommendation = (rec?: Recommendation) => {
    if (!rec) return null;

    const actionInfo = ACTION_VARIANTS[rec.action] || ACTION_VARIANTS.DEFAULT;
    const tierColor = rec.tier ? TIER_COLORS[rec.tier] || TIER_COLORS.NO_TRADE : null;
    const marketOdds = rec.marketOdds ?? 0;
    const zigmaOdds = rec.probability ?? 0;
    const edge = rec.effectiveEdge ?? 0;
    const confidence = rec.confidence ?? 0;

    return (
      <div className="mt-4 space-y-4">
        {/* Header with Action & Tier */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={cn("text-sm px-3 py-1", actionInfo.variant)}>
            {actionInfo.icon} {actionInfo.label}
          </Badge>
          {rec.tier && (
            <Badge className={cn("text-xs", tierColor)}>
              {rec.tier.replace("_", " ")}
            </Badge>
          )}
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricTooltip content="Zigma's calculated probability for YES outcome.">
            <div className="bg-black/40 border border-green-500/20 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Zigma Odds</p>
              <p className="font-mono text-lg text-green-400">{formatPercent(zigmaOdds)}</p>
            </div>
          </MetricTooltip>

          <MetricTooltip content="Current Polymarket price for YES.">
            <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Market Odds</p>
              <p className="font-mono text-lg text-yellow-400">{formatPercent(marketOdds)}</p>
            </div>
          </MetricTooltip>

          <MetricTooltip content="How certain Zigma is about this prediction.">
            <div className="bg-black/40 border border-blue-500/20 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence</p>
              <p className={cn("font-mono text-lg", getConfidenceLevel(confidence).color)}>
                {formatPercent(confidence)}
              </p>
            </div>
          </MetricTooltip>

          <MetricTooltip content="Difference between Zigma and market odds.">
            <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Edge</p>
              <p className={cn("font-mono text-lg", edge > 0 ? "text-green-400" : edge < 0 ? "text-red-400" : "text-gray-400")}>
                {edge > 0 ? "+" : ""}{formatPercent(edge)}
              </p>
            </div>
          </MetricTooltip>
        </div>

        {/* Confidence Meter */}
        <ConfidenceMeter value={confidence} size="lg" />

        {/* Edge Visualizer */}
        {marketOdds > 0 && zigmaOdds > 0 && (
          <EdgeVisualizer marketOdds={marketOdds} zigmaOdds={zigmaOdds} action={rec.action} />
        )}

        {/* High Entropy Warning */}
        {rec.entropy !== undefined && rec.entropy > 0.5 && (
          <div className="p-3 bg-yellow-600/20 border border-yellow-500/40 rounded-lg">
            <p className="text-[10px] uppercase tracking-wide text-yellow-300 mb-1">⚠️ High Uncertainty</p>
            <p className="text-xs text-yellow-100">
              This market has {formatPercent(rec.entropy * 100)} entropy. Consider reducing position size.
            </p>
          </div>
        )}

        {/* Kelly Fraction */}
        {rec.kellyFraction !== undefined && rec.kellyFraction > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Suggested Position:</span>
            <span className="font-mono text-green-400">{formatPercent(rec.kellyFraction * 100)} of bankroll</span>
            <span className="text-muted-foreground">(Kelly Criterion)</span>
          </div>
        )}

        {/* Collapsible Sections */}
        {rec.reasoning && (
          <CollapsibleSection title="Analysis & Reasoning" icon="💡" defaultOpen={true}>
            <p className="text-sm text-green-100/90 whitespace-pre-wrap">{rec.reasoning}</p>
          </CollapsibleSection>
        )}

        {rec.tradingStrategy && (
          <CollapsibleSection title="Trading Strategy" icon="📊">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-mono text-white ml-2">
                  {safePercent(rec.tradingStrategy.entry * 100)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Target:</span>
                <span className="font-mono text-green-400 ml-2">
                  {safePercent(rec.tradingStrategy.target * 100)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Stop Loss:</span>
                <span className="font-mono text-red-400 ml-2">
                  {safePercent(rec.tradingStrategy.stopLoss * 100)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Risk/Reward:</span>
                <span className={cn(
                  "font-mono ml-2",
                  rec.tradingStrategy.riskReward >= 1 ? "text-green-400" : "text-yellow-400"
                )}>
                  {safeRatio(rec.tradingStrategy.riskReward)}
                  {rec.tradingStrategy.riskReward < 1 && " ⚠️"}
                </span>
              </div>
            </div>
            {rec.tradingStrategy.riskReward < 1 && (
              <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
                ⚠️ Risk/Reward below 1:1. Consider smaller position or skipping.
              </div>
            )}
          </CollapsibleSection>
        )}

        {rec.newsSources && rec.newsSources.length > 0 && (
          <CollapsibleSection
            title="News Sources"
            icon="📰"
            badge={<Badge className="ml-2 text-[9px] bg-gray-700/50">{rec.newsSources.length}</Badge>}
          >
            <div className="space-y-2">
              {rec.newsSources.map((source, idx) => (
                <div key={idx} className="text-xs border-l-2 border-green-500/30 pl-3">
                  <p className="text-white font-medium">{source.title}</p>
                  <p className="text-muted-foreground">
                    {source.source} {source.date && `• ${source.date}`}
                  </p>
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 underline">
                      Read more ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER USER PROFILE
  // ============================================================
  const renderUserProfile = (profile?: UserProfile) => {
    if (!profile) return null;
    const { metrics, maker, positions, analysis } = profile;

    const safeMetrics = {
      totalPositions: metrics?.totalPositions ?? 0,
      realizedPnl: metrics?.realizedPnl ?? 0,
      unrealizedPnl: metrics?.unrealizedPnl ?? 0,
      totalVolume: metrics?.totalVolume ?? 0,
      winRate: metrics?.winRate ?? 0,
    };

    const totalPnl = safeMetrics.realizedPnl + safeMetrics.unrealizedPnl;

    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/40">USER PROFILE</Badge>
          <span className="font-mono text-xs text-muted-foreground">{maker.slice(0, 8)}...{maker.slice(-6)}</span>
        </div>

        {/* Portfolio Health Card */}
        {analysis?.health && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-950 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Portfolio Health</p>
                <p className="text-2xl font-bold text-white">{analysis.health.grade || "N/A"}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-mono text-green-400">{(analysis.health.score ?? 0).toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className={cn("h-3 rounded-full transition-all duration-700",
                  (analysis.health.score ?? 0) >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                  (analysis.health.score ?? 0) >= 60 ? "bg-gradient-to-r from-yellow-500 to-amber-400" :
                  "bg-gradient-to-r from-red-500 to-orange-500"
                )}
                style={{ width: `${analysis.health.score ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/40 border border-green-500/20 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total P&L</p>
            <p className={cn("font-mono text-lg", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
              {formatCurrency(totalPnl)}
            </p>
          </div>
          <div className="bg-black/40 border border-green-500/20 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Win Rate</p>
            <p className="font-mono text-lg text-white">{formatPercent(safeMetrics.winRate)}</p>
          </div>
          <div className="bg-black/40 border border-green-500/20 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Volume</p>
            <p className="font-mono text-lg text-white">{formatCurrency(safeMetrics.totalVolume, 0)}</p>
          </div>
        </div>

        {/* Trading Patterns */}
        {analysis?.patterns && (
          <CollapsibleSection title="Trading Patterns" icon="📈" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded p-2">
                <p className="text-[9px] text-muted-foreground">Avg Hold Time</p>
                <p className="font-mono text-white">
                  {(analysis.patterns.avgHoldTime ?? 0) > 0 ? `${(analysis.patterns.avgHoldTime ?? 0).toFixed(1)}h` : "N/A"}
                </p>
              </div>
              <div className="bg-black/30 rounded p-2">
                <p className="text-[9px] text-muted-foreground">Trade Frequency</p>
                <p className="font-mono text-white">{(analysis.patterns.tradeFrequency ?? 0).toFixed(1)}/day</p>
              </div>
              <div className="bg-black/30 rounded p-2">
                <p className="text-[9px] text-muted-foreground">Profit Factor</p>
                <p className="font-mono text-white">{(analysis.patterns.profitFactor ?? 0).toFixed(2)}</p>
              </div>
              <div className="bg-black/30 rounded p-2">
                <p className="text-[9px] text-muted-foreground">Sharpe Ratio</p>
                <p className="font-mono text-white">{(analysis.patterns.sharpeRatio ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Risk Analysis */}
        {analysis?.risk && (
          <CollapsibleSection title="Risk Analysis" icon="⚠️">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded p-2">
                <p className="text-[9px] text-muted-foreground">Diversification</p>
                <p className={cn("font-mono", (analysis.risk.diversificationScore ?? 0) > 70 ? "text-green-400" : "text-yellow-400")}>
                  {(analysis.risk.diversificationScore ?? 0).toFixed(0)}%
                </p>
              </div>
              <div className="bg-black/30 rounded p-2">
                <p className="text-[9px] text-muted-foreground">Top Position</p>
                <p className={cn("font-mono", (analysis.risk.topPositionExposure ?? 0) < 25 ? "text-green-400" : "text-yellow-400")}>
                  {(analysis.risk.topPositionExposure ?? 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Recommendations */}
        {analysis?.recommendations && analysis.recommendations.length > 0 && (
          <CollapsibleSection title="Recommendations" icon="🎯" badge={<Badge className="ml-2 text-[9px] bg-gray-700/50">{analysis.recommendations.length}</Badge>}>
            <div className="space-y-2">
              {analysis.recommendations.slice(0, 5).map((rec, i) => (
                <div key={i} className={cn("p-2 rounded border text-xs",
                  rec.priority === "high" ? "border-red-500/30 bg-red-500/10" :
                  rec.priority === "medium" ? "border-yellow-500/30 bg-yellow-500/10" :
                  "border-blue-500/30 bg-blue-500/10"
                )}>
                  <div className="flex items-start gap-2">
                    <Badge className={cn("text-[9px]",
                      rec.priority === "high" ? "bg-red-600/20 text-red-300" :
                      rec.priority === "medium" ? "bg-yellow-600/20 text-yellow-300" :
                      "bg-blue-600/20 text-blue-300"
                    )}>
                      {(rec.priority || "low").toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium text-white">{rec.title || "N/A"}</p>
                      <p className="text-muted-foreground mt-1">{rec.description || ""}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Active Positions */}
        {positions && positions.length > 0 && (
          <CollapsibleSection 
            title="Active Positions" 
            icon="💼" 
            badge={<Badge className="ml-2 text-[9px] bg-gray-700/50">{positions.length}</Badge>}
          >
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-black/90">
                  <tr className="text-muted-foreground border-b border-green-500/20">
                    <th className="p-2 text-left">Market</th>
                    <th className="p-2 text-center">Side</th>
                    <th className="p-2 text-right">Size</th>
                    <th className="p-2 text-right">Avg Price</th>
                    <th className="p-2 text-right">Cur Price</th>
                    <th className="p-2 text-right">P&L</th>
                    <th className="p-2 text-right">P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.slice(0, 15).map((pos, i) => {
                    // Use cashPnl directly from API instead of recalculating
                    const pnl = pos.cashPnl ?? 0;
                    const pnlPercent = pos.percentPnl ?? 0;
                    const isProfit = pnl >= 0;
                    
                    return (
                      <tr 
                        key={i} 
                        className={cn(
                          "border-t border-green-500/10 hover:bg-green-500/5 transition-colors",
                          Math.abs(pnlPercent) > 20 && !isProfit && "bg-red-900/10"
                        )}
                      >
                        {/* Show market title, not outcome */}
                        <td className="p-2 text-white">
                          <div className="flex flex-col">
                            <span className="truncate max-w-[180px] font-medium">
                              {pos.title || "Unknown Market"}
                            </span>
                            <span className="text-[8px] text-muted-foreground">
                              {pos.outcome || "Yes"}
                            </span>
                          </div>
                        </td>
                        
                        {/* Position side badge */}
                        <td className="p-2 text-center">
                          <Badge 
                            className={cn(
                              "text-[8px] px-1.5 py-0.5",
                              pos.outcome === "Yes" 
                                ? "bg-green-600/20 text-green-300 border-green-500/30"
                                : "bg-red-600/20 text-red-300 border-red-500/30"
                            )}
                          >
                            {pos.outcome || "YES"}
                          </Badge>
                        </td>
                        
                        <td className="p-2 text-right font-mono text-white">
                          {(pos.size ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        
                        <td className="p-2 text-right font-mono text-muted-foreground">
                          {((pos.avgPrice ?? 0) * 100).toFixed(1)}¢
                        </td>
                        
                        <td className="p-2 text-right font-mono text-white">
                          {((pos.curPrice ?? 0) * 100).toFixed(1)}¢
                        </td>
                        
                        <td className={cn(
                          "p-2 text-right font-mono font-semibold",
                          isProfit ? "text-green-400" : "text-red-400"
                        )}>
                          {isProfit ? "+" : ""}{formatCurrency(pnl)}
                        </td>
                        
                        <td className={cn(
                          "p-2 text-right font-mono text-xs",
                          isProfit ? "text-green-400" : "text-red-400"
                        )}>
                          {isProfit ? "+" : ""}{pnlPercent.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                
                {/* Total row */}
                <tfoot className="border-t-2 border-green-500/30 bg-black/60">
                  <tr>
                    <td colSpan={5} className="p-2 text-right text-xs text-muted-foreground font-semibold">
                      Total Unrealized P&L:
                    </td>
                    <td className={cn(
                      "p-2 text-right font-mono font-bold",
                      (metrics?.unrealizedPnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {formatCurrency(metrics?.unrealizedPnl ?? positions.reduce((sum, p) => sum + (p.cashPnl || 0), 0))}
                    </td>
                    <td className="p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {positions.length > 15 && (
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Showing 15 of {positions.length} positions
              </p>
            )}
          </CollapsibleSection>
        )}
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-black text-green-100">
      <SiteHeader />
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <header className="space-y-4 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-green-500">ZIGMA TERMINAL / LIVE INTERROGATION</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-white">Ask Zigma about any Polymarket bet</h1>
          <p className="text-base text-muted-foreground max-w-3xl">
            Paste a market link, user wallet, or natural-language question. Press ⌘K to focus input.
          </p>
        </header>

        <section className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-8">
          {/* Left Panel - Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-950/80 border border-green-500/20 p-6 rounded-xl">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Ask Zigma</label>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (canSubmit) mutation.mutate();
                  }
                }}
                placeholder="Paste a Polymarket URL or ask a question..."
                className="mt-2 h-24 bg-black/60 border-green-500/30 text-green-100 placeholder:text-green-200/40"
              />
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-green-400/80 hover:text-green-400 flex items-center gap-1">
              <svg className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-90")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="grid gap-4 pt-2 border-t border-green-500/20">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Market ID</label>
                  <Input value={marketId} onChange={(e) => setMarketId(e.target.value)} placeholder="Polymarket UUID" className="mt-2 bg-black/60 border-green-500/30" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">User Wallet</label>
                  <Input value={polymarketUser} onChange={(e) => setPolymarketUser(e.target.value)} placeholder="0x..." className="mt-2 bg-black/60 border-green-500/30" />
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/40 rounded-md p-3">
                {error}
                <button type="button" onClick={handleRetryQuery} className="ml-2 underline">Retry</button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button type="button" variant="outline" onClick={() => setShowSuggestions(!showSuggestions)} className="border-gray-700 text-gray-200 hover:bg-gray-900">
                💡 Samples
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowHistory(!showHistory)} className="border-gray-700 text-gray-200 hover:bg-gray-900 relative">
                📜 History
                {queryHistory.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-black text-[10px] rounded-full flex items-center justify-center">{queryHistory.length}</span>}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="border-gray-700 text-gray-200 hover:bg-gray-900">🗑️ Clear</Button>
              <Button type="submit" disabled={!canSubmit} className="bg-green-600 hover:bg-green-500 text-black font-semibold col-span-2 md:col-span-3">
                {mutation.status === "pending" ? "Analyzing…" : "Ask Zigma"}
              </Button>
            </div>

            {showSuggestions && (
              <div className="border border-green-500/20 rounded-lg bg-black/40 p-3">
                <p className="text-xs text-muted-foreground mb-2">Suggested Queries</p>
                {SUGGESTED_QUERIES.map((item, idx) => (
                  <button key={idx} type="button" onClick={() => handleSuggestedQuery(item.query)} className="w-full text-left text-xs text-green-200 hover:bg-green-900/20 px-3 py-2 rounded">
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {showHistory && queryHistory.length > 0 && (
              <div className="border border-green-500/20 rounded-lg bg-black/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Recent Queries</p>
                  <input type="text" placeholder="Search..." value={historySearchQuery} onChange={(e) => setHistorySearchQuery(e.target.value)} className="text-xs bg-black/60 border border-gray-700 text-gray-200 px-2 py-1 rounded w-24" />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredHistory.slice(0, 10).map((entry, idx) => (
                    <button key={idx} type="button" onClick={() => handleLoadFromHistory(entry)} className="w-full text-left text-sm text-green-300 hover:bg-green-500/10 p-2 rounded">
                      <div className="truncate">{entry.query}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(entry.timestamp).toLocaleString("en-US")}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Right Panel - Feed */}
          <div className="bg-gray-950/80 border border-green-500/20 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-green-500/10 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-green-400/80">Conversation Feed</p>

              {userProfile ? (
                <div className="space-y-2">
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/40 text-[10px]">{userProfile.maker.slice(0, 8)}...{userProfile.maker.slice(-6)}</Badge>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><p className="text-muted-foreground">Positions</p><p className="font-mono text-white">{userProfile.metrics.totalPositions}</p></div>
                    <div><p className="text-muted-foreground">Win Rate</p><p className="font-mono text-white">{formatPercent(userProfile.metrics.winRate)}</p></div>
                    <div><p className="text-muted-foreground">P&L</p><p className={cn("font-mono", (userProfile.metrics.realizedPnl + userProfile.metrics.unrealizedPnl) >= 0 ? "text-green-400" : "text-red-400")}>{formatCurrency(userProfile.metrics.realizedPnl + userProfile.metrics.unrealizedPnl)}</p></div>
                  </div>
                </div>
              ) : matchedMarket ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">Market</p>
                    <button type="button" onClick={() => handleToggleFavorite(matchedMarket.id)} className={cn("text-lg transition", isFavorite ? "text-red-400" : "text-gray-400 hover:text-red-400")}>
                      {isFavorite ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <p className="text-lg font-semibold text-white">{matchedMarket.question}</p>
                  <QuickActions
                    marketId={matchedMarket.id}
                    marketQuestion={matchedMarket.question}
                    marketUrl={matchedMarket.url}
                    onTrack={() => handleToggleFavorite(matchedMarket.id)}
                    onCompare={() => setInput(`Compare ${matchedMarket.question}`)}
                    onSimulate={() => setShowSimulator(true)}
                    onShare={() => handleCopyToClipboard(matchedMarket.url || matchedMarket.question)}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ask a question to start.</p>
              )}
            </div>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-6">
              {messages.length === 0 && mutation.status !== "pending" && (
                <div className="text-center text-muted-foreground text-sm py-12">
                  <p className="text-4xl mb-4">🤖</p>
                  <p>Awaiting your first question.</p>
                </div>
              )}

              {[...messages].reverse().map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div key={`${message.role}-${index}`} className={cn("rounded-lg p-4 border space-y-2", isUser ? "bg-green-600/10 border-green-500/20 ml-auto max-w-xl" : "bg-black/40 border-green-500/10 mr-auto max-w-2xl")}>
                    <div className="text-xs uppercase tracking-[0.2em] text-green-400/80">{isUser ? "You" : "Agent Zigma"}</div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {editingMessageIndex === index ? (
                        <div className="space-y-2">
                          <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="bg-black/60 border-green-500/30 text-green-100" rows={4} />
                          <div className="flex gap-2">
                            <button type="button" onClick={handleSaveEdit} className="text-xs bg-green-600 text-black px-3 py-1 rounded">Save</button>
                            <button type="button" onClick={handleCancelEdit} className="text-xs bg-gray-700 text-white px-3 py-1 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : message.content}
                    </div>
                    {!isUser && message.recommendation && renderRecommendation(message.recommendation)}
                    {!isUser && message.userProfile && renderUserProfile(message.userProfile)}
                    {!isUser && <SmartFollowUps recommendation={message.recommendation} matchedMarket={matchedMarket} onSelectFollowUp={setInput} />}
                    {!isUser && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-green-500/10">
                        <button type="button" onClick={() => handleCopyToClipboard(message.content)} className="text-xs text-green-400/80 hover:text-green-400">📋 Copy</button>
                        <button type="button" onClick={() => handleEditMessage(index)} className="text-xs text-green-400/80 hover:text-green-400">✏️ Edit</button>
                        <button type="button" onClick={() => handleDeleteMessage(index)} className="text-xs text-red-400/80 hover:text-red-400">🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}

              {currentPage < totalPages && (
                <button type="button" onClick={handleLoadMore} className="w-full text-center text-xs text-green-400/80 py-2 border border-green-500/20 rounded hover:bg-green-900/10">
                  Load more ({totalPages - currentPage} remaining)
                </button>
              )}

              {mutation.status === "pending" && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                  <span>Zigma is analyzing...</span>
                </div>
              )}
            </div>

            <Separator className="bg-green-500/10" />
          </div>
        </section>
      </main>

      <ScenarioSimulator isOpen={showSimulator} onClose={() => setShowSimulator(false)} recommendation={messages.find((m) => m.recommendation)?.recommendation} matchedMarket={matchedMarket} />
      <Footer />
    </div>
  );
};

export default Chat;