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

interface HistoricalTrade {
  timestamp: string;
  marketQuestion: string;
  action: string;
  price: number;
  edge: number;
  confidence: number;
  tradeTier?: string;
  link?: string;
}

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
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "http://localhost:3001");
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

  const { data: historicalSignals, isLoading: historicalLoading, error: historicalError } = useQuery<HistoricalTrade[]>({
    queryKey: ["historical-signals"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/signals/historical`);
      if (!res.ok) throw new Error("Failed to fetch historical signals");
      return res.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    enabled: !!apiBaseUrl,
  });

  const { data: currentMarkets, isLoading: currentLoading, error: currentError } = useQuery<any[]>({
    queryKey: ["current-markets"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/data`);
      if (!res.ok) throw new Error("Failed to fetch current markets");
      const data = await res.json();
      return data.marketOutlook || [];
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
      
      {/* Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 mx-auto max-w-5xl mt-4">
        <div className="text-center">
          <p className="text-yellow-400 font-semibold text-sm">⚠️ DISCLAIMER: NOT FINANCIAL ADVICE</p>
          <p className="text-yellow-300 text-xs mt-1">This is pure experimental AI analysis and market mathematics. Not investment advice. Markets are highly unpredictable. Trade at your own risk.</p>
        </div>
      </div>
      
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
                  currentBondingMarkets: currentMarkets?.map((signal, index) => ({
                    id: `current-${index}`,
                    marketQuestion: signal.marketQuestion || signal.market,
                    action: "BUY YES",
                    edge: signal.effectiveEdge || 0,
                    confidence: signal.confidence || signal.confidenceScore || 0,
                    timestamp: signal.timestamp || new Date().toISOString(),
                    probZigma: signal.probZigma || 0,
                    probMarket: signal.probMarket || 0,
                    link: signal.link,
                    type: "BONDING_MARKET"
                  })) || [],
                  historicalExecutableTrades: historicalSignals?.map((trade, index) => ({
                    id: `historical-${index}`,
                    marketQuestion: trade.marketQuestion,
                    action: trade.action,
                    price: trade.price,
                    edge: trade.edge,
                    confidence: trade.confidence,
                    tradeTier: trade.tradeTier,
                    timestamp: trade.timestamp,
                    link: trade.link,
                    type: "HISTORICAL_EXECUTABLE"
                  })) || [],
                  exportedAt: new Date().toISOString(),
                  disclaimer: "NOT FINANCIAL ADVICE - This is pure experimental AI analysis and market mathematics. Not investment advice. Markets are highly unpredictable. Trade at your own risk."
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

        {/* Historical Trades */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Current Bonding Markets
          </h2>
          
          {currentLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-64 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : (!currentMarkets || currentMarkets.length === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No current bonding markets available.</p>
                <p className="text-xs text-muted-foreground">Current bonding markets will appear here once available.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Live Bonding Markets</CardTitle>
                <CardDescription>Current high-probability markets (95%+) from latest analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMarkets && currentMarkets.length > 0 ? (
                    currentMarkets
                      .filter(signal => 
                        searchQuery === '' || 
                        signal.marketQuestion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        signal.market?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((signal, index) => (
                      <div key={`current-${index}`} className="border-b border-green-500/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-400 mb-1">
                              {signal.marketQuestion || signal.market}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="px-2 py-0.5 bg-yellow-500/10 rounded text-yellow-400">BONDING</span>
                              <span>{new Date(signal.timestamp || Date.now()).toLocaleString()}</span>
                              {signal.marketQuestion?.includes('2026') && (
                                <span className="px-2 py-0.5 bg-blue-500/10 rounded text-blue-400">LONG-TERM</span>
                              )}
                            </div>
                            {signal.link && (
                              <a 
                                href={signal.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                              >
                                View on Polymarket →
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 mb-1">BONDING</Badge>
                            <div className="text-sm mt-1">
                              <span className="text-muted-foreground">Action:</span>{' '}
                              <span className="text-green-400">BUY YES</span>
                            </div>
                            <div className="text-sm mt-1">
                              <span className="text-muted-foreground">Edge:</span>{' '}
                              <span className="text-green-400">{(signal.effectiveEdge || 0).toFixed(2)}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Conf:</span>{' '}
                              <span className="text-green-400">{(signal.confidence || signal.confidenceScore || 0).toFixed(0)}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">AI:</span>{' '}
                              <span className="text-green-400">{(signal.probZigma || 0).toFixed(1)}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Market:</span>{' '}
                              <span className="text-green-400">{(signal.probMarket || 0).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No current bonding markets available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Historical Trades */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Historical Executable Trades
          </h2>
          
          {historicalLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <Skeleton className="h-64 bg-green-500/10" />
              </CardContent>
            </Card>
          ) : (!historicalSignals || historicalSignals.length === 0) ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No historical trades available.</p>
                <p className="text-xs text-muted-foreground">Historical executable trades will appear here once available.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Past Executable Trades</CardTitle>
                <CardDescription>All historical executable trades with positive edge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalSignals && historicalSignals.length > 0 ? (
                    historicalSignals
                      .filter(signal => 
                        searchQuery === '' || 
                        signal.marketQuestion.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((signal, index) => (
                      <div key={`historical-${index}`} className="border-b border-green-500/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-400 mb-1">
                              {signal.marketQuestion}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="px-2 py-0.5 bg-blue-500/10 rounded text-blue-400">MANUAL</span>
                              <span>{new Date(signal.timestamp).toLocaleString()}</span>
                              {signal.tradeTier && (
                                <span className="px-2 py-0.5 bg-green-500/10 rounded text-green-400">
                                  {signal.tradeTier.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            {signal.link && (
                              <a 
                                href={signal.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                              >
                                View on Polymarket →
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-500 hover:bg-blue-600 mb-1">EXECUTED</Badge>
                            <div className="text-sm mt-1">
                              <span className="text-muted-foreground">Action:</span>{' '}
                              <span className="text-green-400">{signal.action}</span>
                            </div>
                            <div className="text-sm mt-1">
                              <span className="text-muted-foreground">Edge:</span>{' '}
                              <span className="text-green-400">{signal.edge.toFixed(2)}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Conf:</span>{' '}
                              <span className="text-green-400">{signal.confidence?.toFixed(0) ?? '—'}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Price:</span>{' '}
                              <span className="text-green-400">{(signal.price * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No historical trades available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        </main>

      {/* Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 mx-auto max-w-5xl mt-8 mb-4">
        <div className="text-center">
          <p className="text-yellow-400 font-semibold text-sm">⚠️ DISCLAIMER: NOT FINANCIAL ADVICE</p>
          <p className="text-yellow-300 text-xs mt-1">This is pure experimental AI analysis and market mathematics. Not investment advice. Markets are highly unpredictable. Trade at your own risk.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignalPerformance;
