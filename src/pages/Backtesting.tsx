import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { exportToJSON } from "@/utils/export";

interface BacktestResult {
  positionSize: number;
  initialCapital: number;
  totalSignals: number;
  settledSignals: number;
  pendingSignals: number;
  totalPnL: number;
  totalPnLPercent: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxWin: number;
  maxLoss: number;
  sharpeRatio: number;
  finalCapital: number;
  roi: number;
  rollingMetrics?: {
    '30d': { roi: number; winRate: number; sharpe: number };
    '60d': { roi: number; winRate: number; sharpe: number };
    '90d': { roi: number; winRate: number; sharpe: number };
  };
  benchmark?: {
    buyAndHold: number;
    zigmaAlpha: number;
    alphaPercent: number;
  };
  trades?: {
    market: string;
    action: string;
    entryPrice: number;
    exitPrice: number;
    pnl: number;
    roi: number;
    edge: number;
    confidence: number;
    timestamp: string;
    outcome: 'WIN' | 'LOSS' | 'PENDING';
  }[];
}

const Backtesting = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [positionSize, setPositionSize] = useState<number>(100);
  const [initialCapital, setInitialCapital] = useState<number>(1000);
  const [timeRange, setTimeRange] = useState<string>("30");
  const [minEdge, setMinEdge] = useState<number>(5);
  const [runBacktest, setRunBacktest] = useState<boolean>(false);

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

  const { data: backtestResult, isLoading: loading, error, refetch } = useQuery<BacktestResult>({
    queryKey: ["backtest", positionSize, initialCapital, timeRange, minEdge],
    queryFn: async () => {
      const res = await fetch(
        `${apiBaseUrl}/api/pnl/aggregate?positionSize=${positionSize}&initialCapital=${initialCapital}&timeRange=${timeRange}&minEdge=${minEdge}`
      );
      if (!res.ok) throw new Error("Failed to run backtest");
      const data = await res.json();
      return {
        ...data,
        initialCapital,
        finalCapital: initialCapital + data.totalPnL,
        roi: ((initialCapital + data.totalPnL - initialCapital) / initialCapital) * 100
      };
    },
    enabled: runBacktest,
  });

  const handleRunBacktest = () => {
    setRunBacktest(true);
    refetch();
  };

  const handleReset = () => {
    setRunBacktest(false);
    setPositionSize(100);
    setInitialCapital(1000);
    setTimeRange("30");
    setMinEdge(5);
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">BACKTESTING</h1>
              <p className="text-muted-foreground">Test signal strategies with hypothetical positions</p>
            </div>
            {backtestResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportToJSON(backtestResult, `zigma-backtest-${new Date().toISOString().split('T')[0]}`);
                }}
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Export Results
              </Button>
            )}
          </div>
        </div>

        {/* Backtest Configuration */}
        <div className="mb-8">
          <Card className="border-green-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-sm text-green-400">Backtest Configuration</CardTitle>
              <CardDescription>Configure your backtest parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="positionSize">Position Size ($)</Label>
                  <Input
                    id="positionSize"
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(Number(e.target.value))}
                    className="mt-1 bg-black/50 border-green-500/30"
                    min="10"
                    max="10000"
                    step="10"
                  />
                </div>
                <div>
                  <Label htmlFor="initialCapital">Initial Capital ($)</Label>
                  <Input
                    id="initialCapital"
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    className="mt-1 bg-black/50 border-green-500/30"
                    min="100"
                    max="1000000"
                    step="100"
                  />
                </div>
                <div>
                  <Label htmlFor="timeRange">Time Range</Label>
                  <select
                    id="timeRange"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="mt-1 w-full bg-black/50 border-green-500/30 text-green-100 rounded-md px-3 py-2"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="60">Last 60 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="minEdge">Min Edge (%)</Label>
                  <Input
                    id="minEdge"
                    type="number"
                    value={minEdge}
                    onChange={(e) => setMinEdge(Number(e.target.value))}
                    className="mt-1 bg-black/50 border-green-500/30"
                    min="0"
                    max="50"
                    step="1"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                <p className="text-xs text-yellow-400 font-semibold mb-1">Results Preview</p>
                <p className="text-xs text-muted-foreground">
                  Testing {positionSize === 100 ? '$100' : `$${positionSize}`} per signal over {timeRange === 'all' ? 'all available data' : `the last ${timeRange} days`} with minimum {minEdge}% edge threshold.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleRunBacktest}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-black flex-1"
                >
                  {loading ? "Running..." : "Run Backtest"}
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  className="border-gray-700 text-gray-200 hover:bg-gray-900"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backtest Results */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
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
        )}

        {error && (
          <Card className="border-red-500/30 bg-black/40">
            <CardContent className="pt-6">
              <p className="text-red-400">Failed to run backtest</p>
            </CardContent>
          </Card>
        )}

        {backtestResult && !loading && (
          <>
            {/* Summary Metrics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Backtest Results
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Final Capital</CardTitle>
                    <CardDescription>Ending portfolio value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${backtestResult.finalCapital > initialCapital ? 'text-green-400' : 'text-red-400'}`}>
                      ${backtestResult.finalCapital.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">ROI</CardTitle>
                    <CardDescription>Return on investment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${backtestResult.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {backtestResult.roi.toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Total P&L</CardTitle>
                    <CardDescription>Hypothetical profit/loss</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${backtestResult.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${backtestResult.totalPnL.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Win Rate</CardTitle>
                    <CardDescription>Winning percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${backtestResult.winRate > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                      {(backtestResult.winRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {backtestResult.winningSignals}W / {backtestResult.losingSignals}L
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Risk Metrics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Sharpe Ratio</CardTitle>
                    <CardDescription>Risk-adjusted return</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${backtestResult.sharpeRatio > 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {backtestResult.sharpeRatio.toFixed(3)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Profit Factor</CardTitle>
                    <CardDescription>Gross profit / gross loss</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${backtestResult.profitFactor > 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {backtestResult.profitFactor.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Max Win</CardTitle>
                    <CardDescription>Best single trade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      ${backtestResult.maxWin.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Max Loss</CardTitle>
                    <CardDescription>Worst single trade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-400">
                      ${backtestResult.maxLoss.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Rolling Metrics */}
            {backtestResult.rollingMetrics && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Rolling Performance
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-blue-500/30 bg-black/40">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-400">30-Day Window</CardTitle>
                      <CardDescription>Recent performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROI</span>
                          <span className={`text-sm font-semibold ${backtestResult.rollingMetrics['30d'].roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {backtestResult.rollingMetrics['30d'].roi.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Win Rate</span>
                          <span className="text-sm font-semibold text-green-400">
                            {(backtestResult.rollingMetrics['30d'].winRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Sharpe</span>
                          <span className={`text-sm font-semibold ${backtestResult.rollingMetrics['30d'].sharpe > 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {backtestResult.rollingMetrics['30d'].sharpe.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-500/30 bg-black/40">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-400">60-Day Window</CardTitle>
                      <CardDescription>Mid-term performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROI</span>
                          <span className={`text-sm font-semibold ${backtestResult.rollingMetrics['60d'].roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {backtestResult.rollingMetrics['60d'].roi.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Win Rate</span>
                          <span className="text-sm font-semibold text-green-400">
                            {(backtestResult.rollingMetrics['60d'].winRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Sharpe</span>
                          <span className={`text-sm font-semibold ${backtestResult.rollingMetrics['60d'].sharpe > 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {backtestResult.rollingMetrics['60d'].sharpe.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-500/30 bg-black/40">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-400">90-Day Window</CardTitle>
                      <CardDescription>Long-term performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROI</span>
                          <span className={`text-sm font-semibold ${backtestResult.rollingMetrics['90d'].roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {backtestResult.rollingMetrics['90d'].roi.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Win Rate</span>
                          <span className="text-sm font-semibold text-green-400">
                            {(backtestResult.rollingMetrics['90d'].winRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Sharpe</span>
                          <span className={`text-sm font-semibold ${backtestResult.rollingMetrics['90d'].sharpe > 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {backtestResult.rollingMetrics['90d'].sharpe.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Benchmark Comparison */}
            {backtestResult.benchmark && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  Benchmark Comparison
                </h2>
                
                <Card className="border-purple-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-purple-400">Zigma vs Buy-and-Hold</CardTitle>
                    <CardDescription>Comparison against passive strategy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Buy-and-Hold ROI</p>
                        <p className={`text-2xl font-bold ${backtestResult.benchmark.buyAndHold > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtestResult.benchmark.buyAndHold.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Zigma Alpha</p>
                        <p className={`text-2xl font-bold ${backtestResult.benchmark.zigmaAlpha > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtestResult.benchmark.zigmaAlpha.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Alpha vs Benchmark</p>
                        <p className={`text-2xl font-bold ${backtestResult.benchmark.alphaPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtestResult.benchmark.alphaPercent > 0 ? '+' : ''}{backtestResult.benchmark.alphaPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    {backtestResult.benchmark.zigmaAlpha > backtestResult.benchmark.buyAndHold && (
                      <p className="text-xs text-green-400 mt-4 text-center">
                        ✓ Zigma outperformed buy-and-hold by {((backtestResult.benchmark.zigmaAlpha - backtestResult.benchmark.buyAndHold) / Math.abs(backtestResult.benchmark.buyAndHold) * 100).toFixed(1)}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Trade Statistics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Trade Statistics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Total Signals</CardTitle>
                    <CardDescription>All signals in period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {backtestResult.totalSignals}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {backtestResult.pendingSignals} pending
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Settled Trades</CardTitle>
                    <CardDescription>Completed trades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {backtestResult.settledSignals}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Avg Win</CardTitle>
                    <CardDescription>Average winning trade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      ${backtestResult.avgWin.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-green-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400">Avg Loss</CardTitle>
                    <CardDescription>Average losing trade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-400">
                      ${backtestResult.avgLoss.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Trade Breakdown */}
            {backtestResult.trades && backtestResult.trades.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  Trade Breakdown
                </h2>
                
                <Card className="border-orange-500/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="text-sm text-orange-400">Individual Trades</CardTitle>
                    <CardDescription>Signal attribution and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-500/20">
                            <th className="text-left py-2 px-3 text-muted-foreground">Market</th>
                            <th className="text-left py-2 px-3 text-muted-foreground">Action</th>
                            <th className="text-right py-2 px-3 text-muted-foreground">Entry</th>
                            <th className="text-right py-2 px-3 text-muted-foreground">Exit</th>
                            <th className="text-right py-2 px-3 text-muted-foreground">P&L</th>
                            <th className="text-right py-2 px-3 text-muted-foreground">ROI</th>
                            <th className="text-right py-2 px-3 text-muted-foreground">Edge</th>
                            <th className="text-right py-2 px-3 text-muted-foreground">Conf</th>
                            <th className="text-center py-2 px-3 text-muted-foreground">Outcome</th>
                          </tr>
                        </thead>
                        <tbody>
                          {backtestResult.trades.slice(0, 20).map((trade, idx) => (
                            <tr key={idx} className="border-b border-green-500/10 hover:bg-green-500/5">
                              <td className="py-2 px-3 max-w-xs truncate text-white" title={trade.market}>
                                {trade.market.slice(0, 40)}...
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  trade.action.includes('YES') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                                }`}>
                                  {trade.action}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono">{(trade.entryPrice * 100).toFixed(1)}%</td>
                              <td className="py-2 px-3 text-right font-mono">{(trade.exitPrice * 100).toFixed(1)}%</td>
                              <td className={`py-2 px-3 text-right font-mono font-semibold ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${trade.pnl.toFixed(2)}
                              </td>
                              <td className={`py-2 px-3 text-right font-mono ${trade.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.roi > 0 ? '+' : ''}{trade.roi.toFixed(1)}%
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-yellow-400">{trade.edge.toFixed(1)}%</td>
                              <td className="py-2 px-3 text-right font-mono">{trade.confidence.toFixed(0)}%</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  trade.outcome === 'WIN' ? 'bg-green-600 text-white' :
                                  trade.outcome === 'LOSS' ? 'bg-red-600 text-white' :
                                  'bg-gray-600 text-gray-300'
                                }`}>
                                  {trade.outcome}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {backtestResult.trades.length > 20 && (
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                          Showing 20 of {backtestResult.trades.length} trades
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Disclaimer */}
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-400/80">
                  This backtest is hypothetical and based on historical signal performance. Past performance does not guarantee future results. 
                  Actual trading results may differ significantly due to slippage, execution delays, and market conditions. 
                  This is not financial advice.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Backtesting;
