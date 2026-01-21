import { useState, useMemo } from "react";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

// ============================================================
// ENHANCED USER PROFILE DASHBOARD
// Premium $30/month features
// ============================================================

interface Position {
  title: string;
  outcome: string;
  size: number;
  avgPrice: number;
  curPrice: number;
  cashPnl: number;
  percentPnl: number;
  currentValue: number;
  endDate?: string;
  conditionId?: string;
}

interface UserMetrics {
  totalPositions: number;
  totalTrades: number;
  uniqueMarkets: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalVolume: number;
  winRate: number;
  balance?: number;
}

interface TradingPatterns {
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  avgHoldTime: number;
  tradeFrequency: number;
  scalpingTendency: number;
  swingTendency: number;
  hodlTendency: number;
}

interface CategoryPerformance {
  category: string;
  pnl: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
  winRate: number;
  trades: number;
  uniqueMarkets: number;
}

interface RiskMetrics {
  diversificationScore: number;
  topPositionExposure: number;
  top3PositionExposure: number;
  concentrationScore: number;
  maxDrawdownRisk: number;
  categoryConcentration: Record<string, number>;
}

interface PortfolioHealth {
  score: number;
  grade: string;
  factors: Array<{ name: string; impact: number; value: number }>;
}

interface Recommendation {
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  type: string;
}

interface UserProfileDashboardProps {
  maker: string;
  balance?: number;
  metrics: UserMetrics;
  positions: Position[];
  analysis: {
    patterns: TradingPatterns;
    categoryPerformance: CategoryPerformance[];
    risk: RiskMetrics;
    health: PortfolioHealth;
    recommendations: Recommendation[];
    summary?: { summary: string; improvements: string[] };
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatCurrency = (value: number, decimals = 2): string => {
  if (!Number.isFinite(value)) return "—";
  const isNegative = value < 0;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
  return isNegative ? `-${formatted}` : `+${formatted}`;
};

const formatPercent = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

const getGradeColor = (grade: string): string => {
  if (grade.startsWith("A")) return "text-green-400";
  if (grade.startsWith("B")) return "text-blue-400";
  if (grade.startsWith("C")) return "text-yellow-400";
  if (grade.startsWith("D")) return "text-orange-400";
  return "text-red-400";
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "critical": return "bg-red-600/30 text-red-300 border-red-500/50";
    case "high": return "bg-orange-600/20 text-orange-300 border-orange-500/40";
    case "medium": return "bg-yellow-600/20 text-yellow-300 border-yellow-500/40";
    default: return "bg-blue-600/20 text-blue-300 border-blue-500/40";
  }
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export function UserProfileDashboard({
  maker,
  balance = 0,
  metrics,
  positions,
  analysis
}: UserProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "analysis">("overview");

  const totalPnl = (metrics.realizedPnl || 0) + (metrics.unrealizedPnl || 0);
  const positionsValue = positions.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const portfolioValue = positionsValue + balance;
  const roi = portfolioValue > 0 ? (totalPnl / portfolioValue) * 100 : 0;

  // Calculate position distribution for pie chart
  const categoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    positions.forEach(pos => {
      const category = pos.title?.includes("Iran") ? "WAR_OUTCOMES" :
                       pos.title?.includes("Elon") || pos.title?.includes("Musk") ? "TECH" :
                       "OTHER";
      dist[category] = (dist[category] || 0) + (pos.currentValue || 0);
    });
    return Object.entries(dist).map(([category, value]) => ({
      category,
      value,
      percentage: portfolioValue > 0 ? (value / portfolioValue) * 100 : 0
    }));
  }, [positions, portfolioValue]);

  return (
    <div className="space-y-6">
      {/* Header with wallet info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {maker.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-mono text-sm text-muted-foreground">
              {maker.slice(0, 6)}...{maker.slice(-4)}
            </p>
            <p className="text-xs text-green-400">
              {metrics.totalPositions} active positions
            </p>
          </div>
        </div>
        <Badge className={cn("text-lg px-4 py-1", getGradeColor(analysis.health.grade))}>
          Grade: {analysis.health.grade}
        </Badge>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          label="Portfolio Value"
          value={formatCurrency(portfolioValue, 0)}
          subtext={`Cash: ${formatCurrency(balance, 0)}`}
          variant="neutral"
        />
        <MetricCard
          label="Total P&L"
          value={formatCurrency(totalPnl)}
          subtext={`ROI: ${roi.toFixed(1)}%`}
          variant={totalPnl >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          label="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          subtext={`${analysis.patterns.profitFactor.toFixed(2)}x profit factor`}
          variant={metrics.winRate >= 55 ? "positive" : metrics.winRate >= 45 ? "neutral" : "negative"}
        />
        <MetricCard
          label="Volume"
          value={formatCurrency(metrics.totalVolume, 0)}
          subtext={`${metrics.totalTrades} trades`}
          variant="neutral"
        />
        <MetricCard
          label="Health Score"
          value={analysis.health.score.toFixed(0)}
          subtext="/100"
          variant={analysis.health.score >= 70 ? "positive" : analysis.health.score >= 50 ? "neutral" : "negative"}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-green-500/20 pb-2">
        {(["overview", "positions", "analysis"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm rounded-t-lg transition-colors",
              activeTab === tab
                ? "bg-green-500/20 text-green-400 border-b-2 border-green-500"
                : "text-muted-foreground hover:text-white"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          analysis={analysis}
          categoryDistribution={categoryDistribution}
          portfolioValue={portfolioValue}
        />
      )}

      {activeTab === "positions" && (
        <PositionsTab
          positions={positions}
          totalUnrealized={metrics.unrealizedPnl}
        />
      )}

      {activeTab === "analysis" && (
        <AnalysisTab analysis={analysis} />
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function MetricCard({
  label,
  value,
  subtext,
  variant = "neutral"
}: {
  label: string;
  value: string;
  subtext?: string;
  variant?: "positive" | "negative" | "neutral";
}) {
  const colors = {
    positive: "border-green-500/30 text-green-400",
    negative: "border-red-500/30 text-red-400",
    neutral: "border-green-500/20 text-white"
  };

  return (
    <div className={cn(
      "bg-black/40 border rounded-lg p-3",
      colors[variant].split(" ")[0]
    )}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-xl font-bold", colors[variant].split(" ")[1])}>
        {value}
      </p>
      {subtext && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{subtext}</p>
      )}
    </div>
  );
}

function OverviewTab({
  analysis,
  categoryDistribution,
  portfolioValue
}: {
  analysis: UserProfileDashboardProps["analysis"];
  categoryDistribution: Array<{ category: string; value: number; percentage: number }>;
  portfolioValue: number;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Portfolio Allocation */}
      <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Portfolio Allocation</h3>
        <div className="space-y-3">
          {categoryDistribution.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white">{item.category}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(item.value, 0)} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === 0 ? "bg-green-500" :
                    i === 1 ? "bg-blue-500" :
                    i === 2 ? "bg-purple-500" : "bg-gray-500"
                  )}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Risk Indicator */}
        {analysis.risk.topPositionExposure > 25 && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-300">
              ⚠️ Top position is {analysis.risk.topPositionExposure.toFixed(1)}% of portfolio
            </p>
          </div>
        )}
      </div>

      {/* Category Performance */}
      <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Category Performance</h3>
        <div className="space-y-2">
          {analysis.categoryPerformance.slice(0, 5).map((cat, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between p-2 rounded",
                cat.pnl >= 0 ? "bg-green-900/10" : "bg-red-900/10"
              )}
            >
              <div>
                <span className="text-sm text-white font-medium">{cat.category}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {cat.uniqueMarkets} market{cat.uniqueMarkets !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-mono text-sm font-semibold",
                  cat.pnl >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatCurrency(cat.pnl)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {cat.winRate.toFixed(0)}% win rate
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="md:col-span-2 bg-gray-900/50 border border-green-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">
          🎯 AI Recommendations
          <Badge className="ml-2 text-[9px]">{analysis.recommendations.length}</Badge>
        </h3>
        <div className="space-y-2">
          {analysis.recommendations.slice(0, 3).map((rec, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border",
                getPriorityColor(rec.priority)
              )}
            >
              <div className="flex items-start gap-2">
                <Badge className={cn("text-[9px] shrink-0", getPriorityColor(rec.priority))}>
                  {rec.priority.toUpperCase()}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-white">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PositionsTab({
  positions,
  totalUnrealized
}: {
  positions: Position[];
  totalUnrealized: number;
}) {
  const sortedPositions = [...positions].sort((a, b) => Math.abs(b.cashPnl) - Math.abs(a.cashPnl));

  return (
    <div className="bg-gray-900/50 border border-green-500/20 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black/60">
            <tr className="text-muted-foreground text-xs">
              <th className="p-3 text-left">Market</th>
              <th className="p-3 text-center">Side</th>
              <th className="p-3 text-right">Size</th>
              <th className="p-3 text-right">Entry</th>
              <th className="p-3 text-right">Current</th>
              <th className="p-3 text-right">P&L</th>
              <th className="p-3 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions.map((pos, i) => {
              const isProfit = pos.cashPnl >= 0;
              return (
                <tr
                  key={i}
                  className={cn(
                    "border-t border-green-500/10 hover:bg-green-500/5 transition-colors",
                    pos.percentPnl < -15 && "bg-red-900/10"
                  )}
                >
                  <td className="p-3">
                    <div className="max-w-[200px]">
                      <p className="text-white font-medium truncate">
                        {pos.title || "Unknown Market"}
                      </p>
                      {pos.endDate && (
                        <p className="text-[10px] text-muted-foreground">
                          Ends: {new Date(pos.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      className={cn(
                        "text-[10px]",
                        pos.outcome === "Yes"
                          ? "bg-green-600/20 text-green-300"
                          : "bg-red-600/20 text-red-300"
                      )}
                    >
                      {pos.outcome || "YES"}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-mono text-white">
                    {pos.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="p-3 text-right font-mono text-muted-foreground">
                    {(pos.avgPrice * 100).toFixed(1)}¢
                  </td>
                  <td className="p-3 text-right font-mono text-white">
                    {(pos.curPrice * 100).toFixed(1)}¢
                  </td>
                  <td className={cn(
                    "p-3 text-right font-mono font-semibold",
                    isProfit ? "text-green-400" : "text-red-400"
                  )}>
                    {formatCurrency(pos.cashPnl)}
                  </td>
                  <td className={cn(
                    "p-3 text-right font-mono",
                    isProfit ? "text-green-400" : "text-red-400"
                  )}>
                    {formatPercent(pos.percentPnl)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-black/60 border-t-2 border-green-500/30">
            <tr>
              <td colSpan={5} className="p-3 text-right font-semibold text-white">
                Total Unrealized:
              </td>
              <td className={cn(
                "p-3 text-right font-mono font-bold text-lg",
                totalUnrealized >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatCurrency(totalUnrealized)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function AnalysisTab({
  analysis
}: {
  analysis: UserProfileDashboardProps["analysis"];
}) {
  const { patterns, risk, health } = analysis;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Trading Style */}
      <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">📈 Trading Style</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Win Rate" value={`${patterns.winRate.toFixed(1)}%`} target="55%+" />
          <StatBox label="Profit Factor" value={patterns.profitFactor.toFixed(2)} target="2.0+" />
          <StatBox label="Sharpe Ratio" value={patterns.sharpeRatio.toFixed(2)} target="1.5+" />
          <StatBox label="Trade Frequency" value={`${patterns.tradeFrequency.toFixed(1)}/day`} />
        </div>

        <Separator className="my-4 bg-green-500/20" />

        <p className="text-xs text-muted-foreground mb-2">Style Breakdown</p>
        <div className="flex gap-2 flex-wrap">
          {patterns.scalpingTendency > 0.2 && (
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
              Scalper {(patterns.scalpingTendency * 100).toFixed(0)}%
            </Badge>
          )}
          {patterns.swingTendency > 0.2 && (
            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
              Swing {(patterns.swingTendency * 100).toFixed(0)}%
            </Badge>
          )}
          {patterns.hodlTendency > 0.2 && (
            <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
              Position {(patterns.hodlTendency * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">⚠️ Risk Assessment</h3>
        <div className="space-y-4">
          <RiskBar
            label="Diversification"
            value={risk.diversificationScore}
            max={100}
            thresholds={{ good: 60, warning: 40 }}
          />
          <RiskBar
            label="Top Position Exposure"
            value={risk.topPositionExposure}
            max={100}
            thresholds={{ good: 25, warning: 40 }}
            inverse
          />
          <RiskBar
            label="Concentration Risk"
            value={risk.concentrationScore}
            max={100}
            thresholds={{ good: 30, warning: 50 }}
            inverse
          />
          <RiskBar
            label="Drawdown Risk"
            value={risk.maxDrawdownRisk}
            max={50}
            thresholds={{ good: 15, warning: 25 }}
            inverse
          />
        </div>
      </div>

      {/* Health Factors */}
      <div className="md:col-span-2 bg-gray-900/50 border border-green-500/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">
          💚 Health Score Breakdown
          <span className={cn("ml-2 text-2xl", getGradeColor(health.grade))}>
            {health.score.toFixed(0)}/100
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {health.factors.map((factor, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border",
                factor.impact >= 0
                  ? "bg-green-900/10 border-green-500/30"
                  : "bg-red-900/10 border-red-500/30"
              )}
            >
              <p className="text-xs text-muted-foreground">{factor.name}</p>
              <p className={cn(
                "font-mono text-lg",
                factor.impact >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {factor.impact >= 0 ? "+" : ""}{factor.impact.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Current: {factor.value.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  target
}: {
  label: string;
  value: string;
  target?: string;
}) {
  return (
    <div className="bg-black/30 rounded p-2">
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="font-mono text-white text-lg">{value}</p>
      {target && (
        <p className="text-[9px] text-muted-foreground">Target: {target}</p>
      )}
    </div>
  );
}

function RiskBar({
  label,
  value,
  max,
  thresholds,
  inverse = false
}: {
  label: string;
  value: number;
  max: number;
  thresholds: { good: number; warning: number };
  inverse?: boolean;
}) {
  const isGood = inverse
    ? value <= thresholds.good
    : value >= thresholds.good;
  const isWarning = inverse
    ? value > thresholds.good && value <= thresholds.warning
    : value >= thresholds.warning && value < thresholds.good;

  const color = isGood
    ? "bg-green-500"
    : isWarning
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white">{label}</span>
        <span className={cn(
          isGood ? "text-green-400" : isWarning ? "text-yellow-400" : "text-red-400"
        )}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all", color)}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default UserProfileDashboard;
