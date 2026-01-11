import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { MetricTooltip } from "@/components/MetricTooltip";
import { exportToCSV, exportToJSON } from "@/utils/export";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  var95: number;
  cvar95: number;
  calmarRatio: number;
  dataPoints: number;
  lastUpdated: string;
  message?: string;
}

interface PerformanceData {
  timestamp: string;
  marketsFetched: number;
  signalsGenerated: number;
  watchlist: number;
  outlook: number;
  rejected: number;
}

interface PortfolioRisk {
  portfolioValue: number;
  positionCount: number;
  sectorCount: number;
  maxPositionSize: number;
  sectorDiversification: number;
  sectorExposure: Record<string, number>;
  concentration: Array<{
    id: string;
    size: number;
    concentration: number;
  }>;
}

interface AccuracyMetrics {
  totalSignals: number;
  resolvedSignals: number;
  correctSignals: number;
  incorrectSignals: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  message?: string;
}

interface WinLossMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  winLossRatio: number;
  avgWin: number;
  avgLoss: number;
  totalProfit: number;
  totalLoss: number;
  profitFactor: number;
}

interface CalibrationMetrics {
  totalSignals: number;
  resolvedSignals: number;
  avgPredictedConfidence: number;
  avgActualAccuracy: number;
  calibrationError: number;
  reliabilityDiagram: Array<{
    confidenceRange: string;
    predictedAccuracy: number;
    actualAccuracy: number;
    sampleSize: number;
    calibrationError: number;
  }>;
  message?: string;
}

interface CategoryPerformance {
  categories: Record<string, {
    totalSignals: number;
    resolvedSignals: number;
    correctSignals: number;
    accuracy: number;
    avgEdge: number;
    avgConfidence: number;
  }>;
  bestCategory: { category: string; accuracy: number } | null;
  worstCategory: { category: string; accuracy: number } | null;
}

const MetricCard = ({ title, value, description, format = "number", goodThreshold }: {
  title: string;
  value: number;
  description: string;
  format?: "number" | "percent";
  goodThreshold?: number;
}) => {
  const formatted = format === "percent" ? `${value.toFixed(2)}%` : value.toFixed(3);
  const isGood = goodThreshold ? value >= goodThreshold : value > 0;
  
  return (
    <Card className="border-green-500/30 bg-black/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-green-400">{title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${isGood ? "text-green-400" : "text-red-400"}`}>
          {formatted}
        </div>
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

  const { data: riskMetrics, isLoading: riskLoading, error: riskError } = useQuery<RiskMetrics>({
    queryKey: ["risk-metrics"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/risk-metrics`);
      if (!res.ok) throw new Error("Failed to fetch risk metrics");
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: !!apiBaseUrl,
  });

  const { data: performanceHistory, isLoading: perfLoading, error: perfError } = useQuery<{
    data: PerformanceData[];
    totalCycles: number;
  }>({
    queryKey: ["performance-history"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/performance-history`);
      if (!res.ok) throw new Error("Failed to fetch performance history");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: portfolioRisk, isLoading: portfolioRiskLoading, error: portfolioRiskError } = useQuery<PortfolioRisk>({
    queryKey: ["portfolio-risk"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/risk-management/portfolio`);
      if (!res.ok) throw new Error("Failed to fetch portfolio risk");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: accuracyMetrics, isLoading: accuracyLoading, error: accuracyError } = useQuery<AccuracyMetrics>({
    queryKey: ["accuracy-metrics"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/analytics/accuracy`);
      if (!res.ok) throw new Error("Failed to fetch accuracy metrics");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: winLossMetrics, isLoading: winLossLoading, error: winLossError } = useQuery<WinLossMetrics>({
    queryKey: ["win-loss-metrics"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/analytics/win-loss`);
      if (!res.ok) throw new Error("Failed to fetch win/loss metrics");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: calibrationMetrics, isLoading: calibrationLoading, error: calibrationError } = useQuery<CalibrationMetrics>({
    queryKey: ["calibration-metrics"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/analytics/calibration`);
      if (!res.ok) throw new Error("Failed to fetch calibration metrics");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: categoryPerf, isLoading: categoryLoading, error: categoryError } = useQuery<CategoryPerformance>({
    queryKey: ["category-performance"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/analytics/category-performance`);
      if (!res.ok) throw new Error("Failed to fetch category performance");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold tracking-tight">ANALYTICS DASHBOARD</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const exportData = {
                  riskMetrics,
                  portfolioRisk,
                  accuracyMetrics,
                  winLossMetrics,
                  calibrationMetrics,
                  categoryPerf,
                  performanceHistory,
                  exportedAt: new Date().toISOString()
                };
                exportToJSON(exportData, `zigma-analytics-${new Date().toISOString().split('T')[0]}`);
              }}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              Export Data
            </Button>
          </div>
          <p className="text-muted-foreground">Advanced risk metrics and performance analysis</p>
        </div>

        {/* Risk Metrics Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Risk Metrics
          </h2>
          
          {riskLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <Skeleton className="h-4 w-24 bg-green-500/20" />
                    <Skeleton className="h-3 w-32 bg-green-500/10" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 bg-green-500/20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : riskError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load risk metrics</p>
              </CardContent>
            </Card>
          ) : riskMetrics?.message ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400">{riskMetrics.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Run more cycles to generate risk metrics
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricTooltip content="Sharpe Ratio measures risk-adjusted return. Higher is better. Values above 1.0 are considered good, above 2.0 are excellent. Calculated as (Return - Risk-Free Rate) / Standard Deviation.">
                <MetricCard
                  title="Sharpe Ratio"
                  value={riskMetrics?.sharpeRatio || 0}
                  description="Risk-adjusted return (annualized)"
                  goodThreshold={1}
                />
              </MetricTooltip>
              <MetricTooltip content="Sortino Ratio is similar to Sharpe but only considers downside risk. Better for strategies with asymmetric returns. Focuses on negative volatility only.">
                <MetricCard
                  title="Sortino Ratio"
                  value={riskMetrics?.sortinoRatio || 0}
                  description="Downside risk-adjusted return"
                  goodThreshold={1}
                />
              </MetricTooltip>
              <MetricTooltip content="Max Drawdown is the largest peak-to-trough decline in value. Lower is better. Measures the worst-case loss from a historical peak.">
                <MetricCard
                  title="Max Drawdown"
                  value={riskMetrics?.maxDrawdown || 0}
                  description="Largest peak-to-trough decline"
                  format="percent"
                  goodThreshold={-100}
                />
              </MetricTooltip>
              <MetricTooltip content="VaR (Value at Risk) estimates the maximum expected loss at a 95% confidence level. Important for capital allocation and risk management.">
                <MetricCard
                  title="VaR (95%)"
                  value={riskMetrics?.var95 || 0}
                  description="Value at Risk at 95% confidence"
                  format="percent"
                  goodThreshold={-100}
                />
              </MetricTooltip>
              <MetricTooltip content="CVaR (Conditional VaR) is the expected loss beyond VaR. Also called Expected Shortfall, it measures average loss in worst 5% of cases.">
                <MetricCard
                  title="CVaR (95%)"
                  value={riskMetrics?.cvar95 || 0}
                  description="Expected shortfall beyond VaR"
                  format="percent"
                  goodThreshold={-100}
                />
              </MetricTooltip>
              <MetricTooltip content="Calmar Ratio measures return per unit of maximum drawdown risk. Higher is better. Calculated as Annual Return / Max Drawdown.">
                <MetricCard
                  title="Calmar Ratio"
                  value={riskMetrics?.calmarRatio || 0}
                  description="Return / Max Drawdown"
                  goodThreshold={1}
                />
              </MetricTooltip>
            </div>
          )}
          
          {riskMetrics && !riskMetrics.message && (
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Data Points: {riskMetrics.dataPoints}</span>
              <span>Last Updated: {new Date(riskMetrics.lastUpdated).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Portfolio Risk Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Portfolio Risk Management
          </h2>
          
          {portfolioRiskLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-32 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : portfolioRiskError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load portfolio risk data</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Position Count</CardTitle>
                  <CardDescription>Active positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {portfolioRisk?.positionCount || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Max Position Size</CardTitle>
                  <CardDescription>Largest position %</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(portfolioRisk?.maxPositionSize || 0) > 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {portfolioRisk?.maxPositionSize?.toFixed(2) || 0}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Sector Count</CardTitle>
                  <CardDescription>Diversification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {portfolioRisk?.sectorCount || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Sector Diversification</CardTitle>
                  <CardDescription>0-100 score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(portfolioRisk?.sectorDiversification || 0) > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {portfolioRisk?.sectorDiversification?.toFixed(0) || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {portfolioRisk && (
            <div className="mt-4">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Sector Exposure</CardTitle>
                  <CardDescription>Current exposure by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(portfolioRisk.sectorExposure || {}).map(([sector, exposure]) => (
                      <div key={sector} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{sector}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${exposure > 30 ? 'bg-red-400' : exposure > 20 ? 'bg-yellow-400' : 'bg-green-400'}`}
                              style={{ width: `${Math.min(100, exposure)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-mono w-12 text-right ${exposure > 30 ? 'text-red-400' : exposure > 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {exposure.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Performance History */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Accuracy Metrics
          </h2>
          
          {accuracyLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-32 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : accuracyError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load accuracy metrics</p>
              </CardContent>
            </Card>
          ) : (!accuracyMetrics || accuracyMetrics.totalSignals === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No resolved signals yet.</p>
                <p className="text-xs text-muted-foreground">Accuracy metrics will appear once signals start resolving. This typically takes 1-7 days depending on market timelines.</p>
              </CardContent>
            </Card>
          ) : accuracyMetrics?.message ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400">{accuracyMetrics.message}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Total Signals</CardTitle>
                  <CardDescription>All signals generated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {accuracyMetrics?.totalSignals || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accuracyMetrics?.resolvedSignals || 0} resolved
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Accuracy</CardTitle>
                  <CardDescription>Overall prediction accuracy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(accuracyMetrics?.accuracy || 0) > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {((accuracyMetrics?.accuracy || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accuracyMetrics?.correctSignals || 0} / {accuracyMetrics?.resolvedSignals || 0}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Precision</CardTitle>
                  <CardDescription>YES prediction accuracy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {((accuracyMetrics?.precision || 0) * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">F1 Score</CardTitle>
                  <CardDescription>Balance of precision & recall</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {(accuracyMetrics?.f1Score || 0).toFixed(3)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Win/Loss Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Win/Loss Metrics
          </h2>
          
          {winLossLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-32 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : winLossError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load win/loss metrics</p>
              </CardContent>
            </Card>
          ) : (!winLossMetrics || winLossMetrics.winRate === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No settled trades yet.</p>
                <p className="text-xs text-muted-foreground">Win/loss metrics will populate as markets resolve. Track your performance over time here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricTooltip content="Win Rate is the percentage of winning trades. Above 50% is breakeven, above 60% is considered good for prediction markets.">
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Win Rate</CardTitle>
                    <CardDescription>Percentage of winning trades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${(winLossMetrics?.winRate || 0) > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                      {((winLossMetrics?.winRate || 0) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {winLossMetrics?.winningTrades || 0}W / {winLossMetrics?.losingTrades || 0}L
                    </p>
                  </CardContent>
                </Card>
              </MetricTooltip>
              <MetricTooltip content="Win/Loss Ratio shows how much you win per dollar lost. Above 1.0 means profits exceed losses.">
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Win/Loss Ratio</CardTitle>
                    <CardDescription>Wins per loss</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${(winLossMetrics?.winLossRatio || 0) > 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {(winLossMetrics?.winLossRatio || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </MetricTooltip>
              <MetricTooltip content="Profit Factor is gross profit divided by gross loss. Above 2.0 is excellent, indicating strong profitability.">
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Profit Factor</CardTitle>
                    <CardDescription>Gross profit / gross loss</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${(winLossMetrics?.profitFactor || 0) > 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {(winLossMetrics?.profitFactor || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </MetricTooltip>
              <MetricTooltip content="Avg Win is the average profit from winning trades. Higher is better.">
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Avg Win</CardTitle>
                    <CardDescription>Average winning trade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      ${(winLossMetrics?.avgWin || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </MetricTooltip>
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Category Performance
          </h2>
          
          {categoryLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-32 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : categoryError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load category performance</p>
              </CardContent>
            </Card>
          ) : (!categoryPerf || Object.keys(categoryPerf).length === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No category data available.</p>
                <p className="text-xs text-muted-foreground">Category breakdown will appear once you have resolved signals across different market types.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Best Category</CardTitle>
                  <CardDescription>Highest accuracy category</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryPerf?.bestCategory ? (
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {categoryPerf.bestCategory.category}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Accuracy: {(categoryPerf.bestCategory.accuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Worst Category</CardTitle>
                  <CardDescription>Lowest accuracy category</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryPerf?.worstCategory ? (
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        {categoryPerf.worstCategory.category}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Accuracy: {(categoryPerf.worstCategory.accuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">All Categories</CardTitle>
                  <CardDescription>Performance by market category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(categoryPerf?.categories || {}).map(([category, stats]) => (
                      <div key={category} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{category}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-green-400">{(stats.accuracy * 100).toFixed(1)}%</span>
                          <span className="text-muted-foreground">({stats.resolvedSignals} resolved)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Confidence Calibration */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Confidence Calibration
          </h2>
          
          {calibrationLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-32 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : calibrationError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load calibration metrics</p>
              </CardContent>
            </Card>
          ) : calibrationMetrics?.message ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400">{calibrationMetrics.message}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Avg Predicted Confidence</CardTitle>
                  <CardDescription>Model's average confidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {calibrationMetrics?.avgPredictedConfidence?.toFixed(1) || 0}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Avg Actual Accuracy</CardTitle>
                  <CardDescription>Realized accuracy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {((calibrationMetrics?.avgActualAccuracy || 0) * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Calibration Error</CardTitle>
                  <CardDescription>Lower is better</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(calibrationMetrics?.calibrationError || 0) < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {(calibrationMetrics?.calibrationError || 0).toFixed(3)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Performance History */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Performance Charts
          </h2>
          
          {perfLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-64 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : perfError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load performance data</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Signals Over Time Chart */}
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Signals Generated Over Time</CardTitle>
                  <CardDescription>Signal generation trend per cycle</CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceHistory?.data && performanceHistory.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={performanceHistory.data.slice(-20)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#22c55e33" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          stroke="#22c55e"
                        />
                        <YAxis stroke="#22c55e" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #22c55e33' }}
                          labelStyle={{ color: '#22c55e' }}
                          itemStyle={{ color: '#22c55e' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="signalsGenerated" 
                          stroke="#22c55e" 
                          fill="#22c55e" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Markets vs Signals Chart */}
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Markets vs Signals</CardTitle>
                  <CardDescription>Markets analyzed vs signals generated</CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceHistory?.data && performanceHistory.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={performanceHistory.data.slice(-20)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#22c55e33" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          stroke="#22c55e"
                        />
                        <YAxis stroke="#22c55e" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #22c55e33' }}
                          labelStyle={{ color: '#22c55e' }}
                          itemStyle={{ color: '#22c55e' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="marketsFetched" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          name="Markets"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="signalsGenerated" 
                          stroke="#eab308" 
                          strokeWidth={2}
                          name="Signals"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Signal Distribution Chart */}
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Signal Distribution</CardTitle>
                  <CardDescription>Watchlist vs Outlook vs Rejected</CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceHistory?.data && performanceHistory.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={performanceHistory.data.slice(-10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#22c55e33" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          stroke="#22c55e"
                        />
                        <YAxis stroke="#22c55e" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #22c55e33' }}
                          labelStyle={{ color: '#22c55e' }}
                          itemStyle={{ color: '#22c55e' }}
                        />
                        <Legend />
                        <Bar dataKey="watchlist" fill="#22c55e" name="Watchlist" />
                        <Bar dataKey="outlook" fill="#3b82f6" name="Outlook" />
                        <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Risk Metrics Gauge */}
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Risk Metrics Summary</CardTitle>
                  <CardDescription>Current risk-adjusted performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {riskMetrics && !riskMetrics.message ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-400 transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, (riskMetrics.sharpeRatio / 3) * 100))}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-green-400 w-12 text-right">
                            {riskMetrics.sharpeRatio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sortino Ratio</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-400 transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, (riskMetrics.sortinoRatio / 3) * 100))}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-blue-400 w-12 text-right">
                            {riskMetrics.sortinoRatio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max Drawdown</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-400 transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, riskMetrics.maxDrawdown))}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-red-400 w-12 text-right">
                            {riskMetrics.maxDrawdown.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Calmar Ratio</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, (riskMetrics.calmarRatio / 3) * 100))}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-yellow-400 w-12 text-right">
                            {riskMetrics.calmarRatio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Run more cycles to generate risk metrics
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Performance History Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Performance History
          </h2>
          
          {perfLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-32 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : perfError ? (
            <Card className="border-red-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-red-400">Failed to load performance history</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-green-400">Cycle Performance</CardTitle>
                <CardDescription>
                  Total Cycles: {performanceHistory?.totalCycles || 0}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceHistory?.data && performanceHistory.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-500/20">
                            <th className="text-left py-2 px-4 text-green-400">Timestamp</th>
                            <th className="text-right py-2 px-4 text-green-400">Markets</th>
                            <th className="text-right py-2 px-4 text-green-400">Signals</th>
                            <th className="text-right py-2 px-4 text-green-400">Watchlist</th>
                            <th className="text-right py-2 px-4 text-green-400">Outlook</th>
                            <th className="text-right py-2 px-4 text-green-400">Rejected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performanceHistory.data.slice(0, 10).map((cycle, idx) => (
                            <tr key={idx} className="border-b border-green-500/10 hover:bg-green-500/5">
                              <td className="py-2 px-4">
                                {new Date(cycle.timestamp).toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-4">{cycle.marketsFetched}</td>
                              <td className="text-right py-2 px-4 text-green-400">{cycle.signalsGenerated}</td>
                              <td className="text-right py-2 px-4">{cycle.watchlist}</td>
                              <td className="text-right py-2 px-4">{cycle.outlook}</td>
                              <td className="text-right py-2 px-4 text-red-400">{cycle.rejected}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {performanceHistory.data.length > 10 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Showing last 10 cycles of {performanceHistory.data.length} total
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No performance data available yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Metrics Explanation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Metrics Explained</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Sharpe Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Measures risk-adjusted return. Higher is better. Values above 1.0 are considered good, 
                  above 2.0 are excellent. Calculated as (Return - Risk-Free Rate) / Standard Deviation.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Sortino Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Similar to Sharpe but only considers downside risk. Better for strategies with asymmetric returns. 
                  Focuses on negative volatility only.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Largest peak-to-trough decline in value. Lower is better. Measures the worst-case loss 
                  from a historical peak. Critical for understanding risk tolerance.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Value at Risk (VaR)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Maximum expected loss at a given confidence level (95% here). Estimates the worst loss 
                  in 95% of cases. Important for capital allocation and risk management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
