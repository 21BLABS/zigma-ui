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
  marketQuestion?: string;
  category: string;
  predictedProbability: number;
  confidenceScore: number;
  confidence?: number;
  edge: number;
  timestamp: string;
  outcome?: 'YES' | 'NO';
  settledAt?: string;
  zigmaOdds?: number;
  marketOdds?: number;
  action?: string;
  price?: number;
  link?: string;
  source?: string;
  status?: string;
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
  const [sortBy, setSortBy] = useState<string>("edge");
  const [viewMode, setViewMode] = useState<string>("grid");

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
      const data = await res.json();
      
      const seen = new Set<string>();
      const filtered = data.filter((signal: Signal) => {
        if (signal.price === 0 || !signal.price) return false;
        if (seen.has(signal.marketId)) return false;
        seen.add(signal.marketId);
        return true;
      });
      
      return filtered;
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

  const categories = ["All", "Crypto", "Politics", "Sports", "Tech", "Business", "Event"];

  // Filter and sort signals
  const filteredAndSortedSignals = recentSignals
    ?.filter(signal => {
      const matchesSearch = searchQuery === '' || 
        signal.marketQuestion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.question?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        signal.category?.toUpperCase() === categoryFilter ||
        signal.category?.toUpperCase().includes(categoryFilter);
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'edge':
          return (b.edge || 0) - (a.edge || 0);
        case 'confidence':
          return (b.confidence || b.confidenceScore || 0) - (a.confidence || a.confidenceScore || 0);
        case 'recent':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'volume':
          return ((b.price || 0) * 1000) - ((a.price || 0) * 1000);
        default:
          return 0;
      }
    }) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <SiteHeader />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Explore {filteredAndSortedSignals?.length || 0} Live Signals
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">🤖 AI-powered prediction market opportunities • Real-time analysis</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs sm:text-sm"
              >
                {viewMode === 'grid' ? '📋' : '▦'} <span className="hidden sm:inline">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs sm:text-sm"
              >
                🔄 <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Input
              type="text"
              placeholder="🔍 Search markets by question, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full bg-[#0a0a0a] border-gray-800 text-white placeholder:text-gray-500 h-14 pl-5 pr-12 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="hover:text-white transition-colors">✕</button>
              ) : (
                <span>⌘K</span>
              )}
            </div>
          </div>

          {/* Category Filters & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
              {categories.map((cat) => {
                const isActive = (cat === "All" && categoryFilter === "all") || categoryFilter === cat.toUpperCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat === "All" ? "all" : cat.toUpperCase())}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap relative overflow-hidden group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
                        : "bg-[#141414] text-gray-400 hover:bg-[#1a1a1a] hover:text-white border border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse"></div>
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#141414] border border-gray-800 text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer w-full sm:w-auto"
              >
                <option value="edge">🔥 Highest Edge</option>
                <option value="confidence">💎 Confidence</option>
                <option value="recent">⏰ Most Recent</option>
                <option value="volume">💰 Volume</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="group relative bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 sm:p-5 border border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/20 group-hover:to-red-500/20 rounded-xl transition-all duration-300"></div>
            <div className="relative">
              <div className="text-orange-400 text-xs font-semibold mb-1 sm:mb-2 flex items-center gap-1">
                <span className="text-base sm:text-lg">🔥</span> <span className="text-[10px] sm:text-xs">HIGH EDGE</span>
              </div>
              <div className="text-white text-2xl sm:text-3xl font-bold">{filteredAndSortedSignals?.filter(s => (s.edge || 0) > 0.05).length || 0}</div>
              <div className="text-orange-300/60 text-[10px] sm:text-xs mt-1">Signals &gt;5% edge</div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 sm:p-5 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 rounded-xl transition-all duration-300"></div>
            <div className="relative">
              <div className="text-blue-400 text-xs font-semibold mb-1 sm:mb-2 flex items-center gap-1">
                <span className="text-base sm:text-lg">⏰</span> <span className="text-[10px] sm:text-xs">RECENT</span>
              </div>
              <div className="text-white text-2xl sm:text-3xl font-bold">{filteredAndSortedSignals?.filter(s => new Date(s.timestamp).getTime() > Date.now() - 3600000).length || 0}</div>
              <div className="text-blue-300/60 text-[10px] sm:text-xs mt-1">Last hour</div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 sm:p-5 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 rounded-xl transition-all duration-300"></div>
            <div className="relative">
              <div className="text-purple-400 text-xs font-semibold mb-1 sm:mb-2 flex items-center gap-1">
                <span className="text-base sm:text-lg">💎</span> <span className="text-[10px] sm:text-xs">PREMIUM</span>
              </div>
              <div className="text-white text-2xl sm:text-3xl font-bold">{filteredAndSortedSignals?.filter(s => (s.edge || 0) > 0.08).length || 0}</div>
              <div className="text-purple-300/60 text-[10px] sm:text-xs mt-1">Signals &gt;8% edge</div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 sm:p-5 border border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/20 group-hover:to-emerald-500/20 rounded-xl transition-all duration-300"></div>
            <div className="relative">
              <div className="text-green-400 text-xs font-semibold mb-1 sm:mb-2 flex items-center gap-1">
                <span className="text-base sm:text-lg">📊</span> <span className="text-[10px] sm:text-xs">TOTAL</span>
              </div>
              <div className="text-white text-2xl sm:text-3xl font-bold">{filteredAndSortedSignals?.length || 0}</div>
              <div className="text-green-300/60 text-[10px] sm:text-xs mt-1">Active signals</div>
            </div>
          </div>
        </div>


        {/* Signals Grid - Premium Zigma Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-lg opacity-50 animate-pulse"></div>
                <h2 className="relative text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                  Live Market Signals
                </h2>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/50 animate-pulse">
                REAL-TIME
              </Badge>
            </div>
            <div className="text-sm text-gray-400">
              Showing <span className="text-white font-semibold">{filteredAndSortedSignals?.length || 0}</span> signals
            </div>
          </div>
          
          {signalsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-xl p-4 sm:p-5 border border-gray-800 animate-pulse">
                  <div className="h-5 bg-gray-800 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (!filteredAndSortedSignals || filteredAndSortedSignals.length === 0) ? (
            <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-xl border border-gray-800">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
              <div className="text-gray-400 text-base sm:text-lg mb-2">No signals found</div>
              <p className="text-gray-600 text-xs sm:text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredAndSortedSignals.map((signal, index) => {
                const edgePercent = (signal.edge || 0) * 100;
                const isHighEdge = edgePercent > 5;
                const isPremium = edgePercent > 8;
                const yesPrice = (signal.price || 0) * 100;
                const noPrice = 100 - yesPrice;
                
                return (
                  <a
                    key={signal.id}
                    href={signal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-xl p-5 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
                    
                    {/* Premium badge for high edge signals */}
                    {isPremium && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 blur-md opacity-75 animate-pulse"></div>
                          <Badge className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs font-bold shadow-lg">
                            ⭐ PREMIUM
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative z-10">
                      {/* Category Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                          {signal.category}
                        </Badge>
                        {isHighEdge && (
                          <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
                            🔥 {edgePercent.toFixed(1)}%
                          </Badge>
                        )}
                      </div>

                      {/* Market Question */}
                      <h3 className="text-white font-semibold text-sm mb-4 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors duration-300">
                        {signal.marketQuestion || signal.question}
                      </h3>

                      {/* Outcomes Row */}
                      <div className="bg-black/40 rounded-lg p-3 mb-3 border border-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-xs text-green-400 font-semibold mb-1">YES</div>
                              <div className="text-lg font-bold text-white">
                                {yesPrice.toFixed(1)}¢
                              </div>
                            </div>
                            <div className="w-px h-8 bg-gray-700"></div>
                            <div className="text-center">
                              <div className="text-xs text-red-400 font-semibold mb-1">NO</div>
                              <div className="text-lg font-bold text-white">
                                {noPrice.toFixed(1)}¢
                              </div>
                            </div>
                          </div>
                          
                          {/* Confidence indicator */}
                          <div className="text-right">
                            <div className="text-xs text-gray-400 mb-1">Confidence</div>
                            <div className="text-sm font-bold text-purple-400">
                              {(signal.confidence || signal.confidenceScore || 0).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action & Stats Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            signal.action?.includes('YES') ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                          }`}></div>
                          <span className={`text-xs font-semibold ${
                            signal.action?.includes('YES') ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {signal.action || 'BUY YES'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>💰 ${((signal.price || 0) * 1000).toFixed(0)}</span>
                        </div>
                      </div>
                      
                      {/* Hover effect indicator */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl"></div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Executable Trades */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 blur-lg opacity-50"></div>
              <h2 className="relative text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></span>
                Executable Trades
              </h2>
            </div>
                      </div>
          
          {historicalLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-xl p-5 border border-gray-800 animate-pulse">
                  <div className="h-5 bg-gray-800 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (!historicalSignals || historicalSignals.length === 0) ? (
            <div className="text-center py-12 bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-xl border border-gray-800">
              <div className="text-5xl mb-3">📊</div>
              <div className="text-gray-400 text-base mb-1">No executable trades yet</div>
              <p className="text-gray-600 text-sm">Trades will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historicalSignals
                .filter(signal => 
                  searchQuery === '' || 
                  signal.marketQuestion.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 100)
                .map((signal, index) => (
                  <a
                    key={`historical-${index}`}
                    href={signal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-xl p-5 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-500 rounded-xl"></div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                                                    {signal.tradeTier && (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                              {signal.tradeTier.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(signal.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <h3 className="text-white font-semibold text-sm mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {signal.marketQuestion}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-black/40 rounded-lg p-2 border border-gray-800/50">
                          <div className="text-gray-400 mb-1">Action</div>
                          <div className={`font-semibold ${signal.action.includes('YES') ? 'text-green-400' : 'text-red-400'}`}>
                            {signal.action}
                          </div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-2 border border-gray-800/50">
                          <div className="text-gray-400 mb-1">Edge</div>
                          <div className="font-bold text-orange-400">{signal.edge.toFixed(2)}%</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-2 border border-gray-800/50">
                          <div className="text-gray-400 mb-1">Price</div>
                          <div className="font-semibold text-white">{(signal.price * 100).toFixed(1)}¢</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-2 border border-gray-800/50">
                          <div className="text-gray-400 mb-1">Confidence</div>
                          <div className="font-semibold text-purple-400">{signal.confidence?.toFixed(0) ?? '—'}%</div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
            </div>
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
