import { useState, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  RefreshCw, 
  Download, 
  ExternalLink,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface Signal {
  id: string;
  marketId: string;
  question: string;
  marketPrice: number;
  revisedPrior: number;
  rawEdge: number;
  netEdge: number;
  confidence: number;
  direction: 'BUY_YES' | 'BUY_NO';
  reasoning?: string;
  category: string;
  endDate: string;
  timestamp: string;
  link?: string;
}

const SignalsPage = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [minEdge, setMinEdge] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSignals = async () => {
    try {
      const ZIGMA_API = import.meta.env.VITE_ZIGMA_API_URL || 'http://localhost:3001';
      setLoading(true);
      const response = await fetch(`${ZIGMA_API}/api/signals/recent?limit=100`);
      if (response.ok) {
        const data = await response.json();
        // Backend returns array directly
        const signalsArray = Array.isArray(data) ? data : (data.signals || []);
        setSignals(signalsArray);
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All Categories', 'Crypto', 'Politics', 'Sports', 'Weather', 'Tech', 'Business', 'Event'];

  const filteredSignals = signals.filter(signal => {
    if (selectedCategory !== 'All Categories' && signal.category !== selectedCategory) return false;
    if (Math.abs(signal.netEdge * 100) < minEdge) return false;
    if (searchQuery && !signal.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const executableSignals = filteredSignals.filter(s => Math.abs(s.netEdge) >= 0.02);
  const outlookSignals = filteredSignals.filter(s => Math.abs(s.netEdge) < 0.02);

  const stats = {
    activeSignals: signals.length,
    outlooks: outlookSignals.length,
    executable: executableSignals.length,
    avgEdge: signals.length > 0 
      ? (signals.reduce((sum, s) => sum + Math.abs(s.netEdge), 0) / signals.length * 100).toFixed(1)
      : '0',
    avgConfidence: signals.length > 0
      ? (signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length).toFixed(0)
      : '0',
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">LIVE SIGNALS</h1>
              <p className="text-green-300/60">
                REAL-TIME • AI-powered prediction market opportunities updated every cycle
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchSignals}
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gray-950 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-green-300/60 mb-1">Active Signals</p>
                <p className="text-2xl font-bold text-white">{stats.activeSignals}</p>
                <p className="text-xs text-green-300/40">{stats.outlooks} Outlooks + {stats.executable} Executable</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-950 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-green-300/60 mb-1">Avg Edge</p>
                <p className="text-2xl font-bold text-green-400">{stats.avgEdge}%</p>
                <p className="text-xs text-green-300/40">Across all signals</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-950 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-green-300/60 mb-1">Historical Trades</p>
                <p className="text-2xl font-bold text-white">14</p>
                <p className="text-xs text-green-300/40">Executed opportunities</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-950 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-green-300/60 mb-1">Avg Confidence</p>
                <p className="text-2xl font-bold text-purple-400">{stats.avgConfidence}%</p>
                <p className="text-xs text-green-300/40">Model certainty</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-950 border-green-500/20">
              <CardContent className="p-4">
                <p className="text-xs text-green-300/60 mb-1">Time Range</p>
                <p className="text-lg font-bold text-white">All Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-green-300/60 mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black border border-green-500/30 text-white p-2 rounded"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-green-300/60 mb-2 block">Min Edge (%)</label>
              <Input
                type="number"
                value={minEdge}
                onChange={(e) => setMinEdge(parseFloat(e.target.value) || 0)}
                className="bg-black border-green-500/30 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-green-300/60 mb-2 block">Search</label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black border-green-500/30 text-white"
                placeholder="Search signals..."
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
            <p className="text-green-300/60 mt-4">Loading signals...</p>
          </div>
        ) : (
          <>
            {/* Market Outlooks */}
            {outlookSignals.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">Market Outlooks</h2>
                <p className="text-green-300/60 mb-6">Current markets with analysis but no executable edge</p>
                <div className="grid gap-4">
                  {outlookSignals.map((signal) => (
                    <Card key={signal.id} className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-3">{signal.question}</h3>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                                OUTLOOK
                              </Badge>
                              <span className="text-green-300/60">
                                {new Date(signal.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                            onClick={() => window.open(signal.link || `https://polymarket.com/event/${signal.marketId}`, '_blank')}
                          >
                            View on Polymarket →
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-green-500/10">
                          <div>
                            <p className="text-xs text-green-300/60">Action</p>
                            <p className="text-sm font-semibold text-white">{signal.direction.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-300/60">Edge</p>
                            <p className="text-sm font-semibold text-green-400">{(Math.abs(signal.netEdge) * 100).toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-300/60">Conf</p>
                            <p className="text-sm font-semibold text-purple-400">{signal.confidence}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-300/60">AI / Market</p>
                            <p className="text-sm font-semibold text-white">
                              {(signal.revisedPrior * 100).toFixed(1)}% / {(signal.marketPrice * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Executable Trades */}
            {executableSignals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Current Executable Trades</h2>
                <p className="text-green-300/60 mb-6">Live Executable Trades • Current executable trades with confirmed edge and liquidity</p>
                <div className="grid gap-4">
                  {executableSignals.map((signal) => {
                    const isHighEdge = Math.abs(signal.netEdge) > 0.05;
                    return (
                      <Card key={signal.id} className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-green-500 text-black text-xs font-semibold">
                                  EXECUTABLE
                                </Badge>
                                <Badge className="bg-purple-500 text-white text-xs">
                                  {signal.category}
                                </Badge>
                                {isHighEdge && (
                                  <Badge className="bg-yellow-500 text-black text-xs font-semibold">
                                    ⭐ HIGH EDGE
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-white font-semibold text-lg mb-2">{signal.question}</h3>
                              <p className="text-xs text-green-300/60">
                                📅 {new Date(signal.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                              onClick={() => window.open(signal.link || `https://polymarket.com/event/${signal.marketId}`, '_blank')}
                            >
                              View on Polymarket →
                            </Button>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4 p-4 bg-black/30 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-green-300/60 mb-1">EDGE</p>
                              <p className="text-2xl font-bold text-green-400">
                                {(Math.abs(signal.netEdge) * 100).toFixed(2)}%
                              </p>
                              <p className="text-xs text-green-300/40">Expected advantage</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-green-300/60 mb-1">Action</p>
                              <div className="flex items-center justify-center gap-1">
                                {signal.direction === 'BUY_YES' ? (
                                  <><TrendingUp className="w-4 h-4 text-green-400" /><span className="text-lg font-bold text-white">BUY YES</span></>
                                ) : (
                                  <><TrendingDown className="w-4 h-4 text-red-400" /><span className="text-lg font-bold text-white">BUY NO</span></>
                                )}
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-green-300/60 mb-1">Confidence</p>
                              <p className="text-2xl font-bold text-purple-400">{signal.confidence}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-green-300/60 mb-1">Price</p>
                              <p className="text-2xl font-bold text-white">{(signal.marketPrice * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredSignals.length === 0 && (
              <Card className="bg-gray-950 border-green-500/20">
                <CardContent className="p-12 text-center">
                  <p className="text-green-300/60">No signals match your filters</p>
                  <p className="text-xs text-green-300/40 mt-2">Try adjusting your criteria</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-red-400 text-sm">⚠️ DISCLAIMER: NOT FINANCIAL ADVICE</p>
        </div>
      </div>
    </div>
  );
};

export default SignalsPage;
