import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { exportToCSV, exportToJSON } from "@/utils/export";

interface Signal {
  id: string;
  marketId: string;
  question: string;
  category: string;
  predictedProbability: number;
  confidenceScore: number;
  edge: number;
  timestamp: string;
  outcome?: 'YES' | 'NO';
  settledAt?: string;
  zigmaOdds?: number;
  marketOdds?: number;
}

interface SignalPerformance {
  totalSignals: number;
  resolvedSignals: number;
  correctSignals: number;
  incorrectSignals: number;
  pendingSignals: number;
  accuracy: number;
  avgConfidence: number;
  avgEdge: number;
  bestSignals: Signal[];
  worstSignals: Signal[];
}

interface AggregatePnL {
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
}

interface CategoryPnL {
  [category: string]: {
    totalSignals: number;
    settledSignals: number;
    totalPnL: number;
    winRate: number;
    avgEdge: number;
  };
}

const SignalPerformance = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [edgeFilter, setEdgeFilter] = useState<number>(0);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

  const { data: signalPerf, isLoading: perfLoading, error: perfError } = useQuery<SignalPerformance>({
    queryKey: ["signal-performance"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/signals/performance`);
      if (!res.ok) throw new Error("Failed to fetch signal performance");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: recentSignals, isLoading: signalsLoading, error: signalsError } = useQuery<Signal[]>({
    queryKey: ["recent-signals", categoryFilter, edgeFilter, timeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (edgeFilter > 0) params.append("minEdge", edgeFilter.toString());
      if (timeFilter !== "all") params.append("timeRange", timeFilter);
      
      const res = await fetch(`${apiBaseUrl}/api/signals/recent?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch recent signals");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: aggregatePnL, isLoading: pnlLoading, error: pnlError } = useQuery<AggregatePnL>({
    queryKey: ["aggregate-pnl"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/pnl/aggregate?positionSize=100`);
      if (!res.ok) throw new Error("Failed to fetch aggregate P&L");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: categoryPnL, isLoading: catPnLLoading, error: catPnLError } = useQuery<CategoryPnL>({
    queryKey: ["category-pnl"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/pnl/by-category?positionSize=100`);
      if (!res.ok) throw new Error("Failed to fetch category P&L");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const getOutcomeBadge = (signal: Signal) => {
    if (!signal.outcome) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-400">PENDING</Badge>;
    }
    const predictedYes = signal.predictedProbability > 0.5;
    const actualYes = signal.outcome === 'YES';
    const correct = predictedYes === actualYes;
    
    return correct 
      ? <Badge className="bg-green-500 hover:bg-green-600">CORRECT</Badge>
      : <Badge variant="destructive">INCORRECT</Badge>;
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">SIGNAL PERFORMANCE</h1>
              <p className="text-muted-foreground">Track how Zigma signals have performed historically</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const exportData = {
                  signalPerf,
                  recentSignals,
                  aggregatePnL,
                  categoryPnL,
                  exportedAt: new Date().toISOString()
                };
                exportToJSON(exportData, `zigma-signals-${new Date().toISOString().split('T')[0]}`);
              }}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              Export Data
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-green-500/30 bg-black/40 mb-6">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="mt-1 w-full bg-black/50 border-green-500/30 text-green-100 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="POLITICS">Politics</option>
                    <option value="CRYPTO">Crypto</option>
                    <option value="SPORTS">Sports</option>
                    <option value="ENTERTAINMENT">Entertainment</option>
                    <option value="TECH">Technology</option>
                    <option value="WAR_OUTCOMES">War Outcomes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Min Edge (%)</label>
                  <Input
                    type="number"
                    value={edgeFilter}
                    onChange={(e) => setEdgeFilter(Number(e.target.value))}
                    className="mt-1 bg-black/50 border-green-500/30"
                    min="0"
                    max="50"
                    step="1"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Time Range</label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="mt-1 w-full bg-black/50 border-green-500/30 text-green-100 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Search</label>
                  <Input
                    type="text"
                    placeholder="Search signals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1 bg-black/50 border-green-500/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Performance Overview
          </h2>
          
          {perfLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
          ) : (!signalPerf || signalPerf.totalSignals === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No signals generated yet.</p>
                <p className="text-xs text-muted-foreground">Signal performance metrics will appear once Zigma starts generating signals. Check back after the next cycle.</p>
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
                    {signalPerf?.totalSignals || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {signalPerf?.pendingSignals || 0} pending
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Accuracy</CardTitle>
                  <CardDescription>Correct predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(signalPerf?.accuracy || 0) > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {((signalPerf?.accuracy || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {signalPerf?.correctSignals || 0} / {signalPerf?.resolvedSignals || 0}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Avg Confidence</CardTitle>
                  <CardDescription>Model confidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {signalPerf?.avgConfidence?.toFixed(1) || 0}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Avg Edge</CardTitle>
                  <CardDescription>Average edge</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {(signalPerf?.avgEdge || 0).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Recent Signals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Recent Signals
          </h2>
          
          {signalsLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-64 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : (!recentSignals || recentSignals.length === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No recent signals available.</p>
                <p className="text-xs text-muted-foreground">Recent signals will appear here as Zigma analyzes markets. Signals are generated every ~15 minutes.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Latest Signals</CardTitle>
                <CardDescription>Most recent signal predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSignals && recentSignals.length > 0 ? (
                    recentSignals
                      .filter(signal => 
                        searchQuery === '' || 
                        signal.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        signal.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((signal) => (
                      <div key={signal.id} className="border-b border-green-500/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-400 mb-1">
                              {signal.question}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="px-2 py-0.5 bg-green-500/10 rounded">{signal.category}</span>
                              <span>{new Date(signal.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {getOutcomeBadge(signal)}
                            <div className="text-sm mt-1">
                              <span className="text-muted-foreground">Edge:</span>{' '}
                              <span className="text-green-400">{signal.edge.toFixed(2)}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Conf:</span>{' '}
                              <span className="text-green-400">{signal.confidenceScore?.toFixed(0) ?? '—'}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No signals available yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Best & Worst Signals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Top Performances
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Best Signals</CardTitle>
                <CardDescription>Highest edge signals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {signalPerf?.bestSignals && signalPerf.bestSignals.length > 0 ? (
                    signalPerf.bestSignals.slice(0, 5).map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between text-sm p-2 bg-green-500/5 rounded">
                        <span className="text-muted-foreground truncate flex-1 mr-2">
                          {signal.question.substring(0, 50)}...
                        </span>
                        <span className="text-green-400 font-mono">{signal.edge.toFixed(2)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Lowest Edge</CardTitle>
                <CardDescription>Signals with lowest edge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {signalPerf?.worstSignals && signalPerf.worstSignals.length > 0 ? (
                    signalPerf.worstSignals.slice(0, 5).map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between text-sm p-2 bg-red-500/5 rounded">
                        <span className="text-muted-foreground truncate flex-1 mr-2">
                          {signal.question.substring(0, 50)}...
                        </span>
                        <span className="text-red-400 font-mono">{signal.edge.toFixed(2)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hypothetical P&L */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Hypothetical P&L
            <span className="text-xs text-muted-foreground font-normal">(Based on $100 per signal)</span>
          </h2>
          
          {pnlLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
          ) : (!aggregatePnL || aggregatePnL.totalPnL === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No settled trades for P&L calculation.</p>
                <p className="text-xs text-muted-foreground">Hypothetical P&L will populate as markets resolve. This is based on $100 per signal position size.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Total P&L</CardTitle>
                  <CardDescription>Hypothetical profit/loss</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(aggregatePnL?.totalPnL || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(aggregatePnL?.totalPnL || 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {aggregatePnL?.settledSignals || 0} settled trades
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Win Rate</CardTitle>
                  <CardDescription>Winning percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(aggregatePnL?.winRate || 0) > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {((aggregatePnL?.winRate || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {aggregatePnL?.winningSignals || 0}W / {aggregatePnL?.losingSignals || 0}L
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Profit Factor</CardTitle>
                  <CardDescription>Gross profit / gross loss</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(aggregatePnL?.profitFactor || 0) > 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {(aggregatePnL?.profitFactor || 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Sharpe Ratio</CardTitle>
                  <CardDescription>Risk-adjusted return</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(aggregatePnL?.sharpeRatio || 0) > 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {(aggregatePnL?.sharpeRatio || 0).toFixed(3)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Category P&L */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            P&L by Category
          </h2>
          
          {catPnLLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-32 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : (!categoryPnL || Object.keys(categoryPnL).length === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No category P&L data available.</p>
                <p className="text-xs text-muted-foreground">Category breakdown will appear once you have settled trades across different market types.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Category Performance</CardTitle>
                <CardDescription>Hypothetical P&L by market category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryPnL && Object.keys(categoryPnL).length > 0 ? (
                    Object.entries(categoryPnL).map(([category, stats]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-green-500/5 rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-green-400">{category}</span>
                            <span className="text-xs text-muted-foreground">
                              {stats.settledSignals} settled
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Win Rate: {(stats.winRate * 100).toFixed(1)}% | Avg Edge: {stats.avgEdge.toFixed(2)}%
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${stats.totalPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${stats.totalPnL.toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignalPerformance;
