import { useState, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ExternalLink } from "lucide-react";

interface Market {
  id: string;
  question: string;
  platform: string;
  outcomes: Array<{
    name: string;
    probability: number;
  }>;
  volume: number;
  endsIn: string;
  category: string;
  link?: string;
}

const MarketsPage = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quickFilter, setQuickFilter] = useState('');

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarkets = async () => {
    try {
      const ZIGMA_API = import.meta.env.VITE_ZIGMA_API_URL || 'http://localhost:3001';
      console.log('[Markets] Fetching from Zigmav2...');
      const response = await fetch(`${ZIGMA_API}/api/signals/recent?limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        // Backend returns array directly, not wrapped in {signals: [...]}
        const signalsArray = Array.isArray(data) ? data : (data.signals || []);
        
        console.log('[Markets] Received signals:', signalsArray.length);
        if (signalsArray.length > 0) {
          console.log('[Markets] First signal sample:', signalsArray[0]);
        }
        
        // Deduplicate by marketId - keep only the latest signal for each market
        const marketMap = new Map();
        signalsArray.forEach((signal: any) => {
          const marketId = signal.marketId;
          const timestamp = new Date(signal.timestamp || Date.now()).getTime();
          
          if (!marketMap.has(marketId) || marketMap.get(marketId).timestamp < timestamp) {
            marketMap.set(marketId, { ...signal, timestamp });
          }
        });
        
        const uniqueSignals = Array.from(marketMap.values());
        console.log('[Markets] Deduplicated:', signalsArray.length, '→', uniqueSignals.length);
        
        const transformed = uniqueSignals.map((signal: any) => {
          // Use actual API field names from Zigmav2
          const predictedProb = signal.predictedProbability || 0.5;
          const marketPrice = signal.price || signal.marketOdds || 0.5;
          const zigmaProb = signal.zigmaOdds ? signal.zigmaOdds / 100 : predictedProb;
          
          // Determine action from signal.action field
          const action = signal.action || '';
          const isBuyYes = action.includes('YES');
          
          return {
            id: `${signal.marketId}-${signal.timestamp}`,
            marketId: signal.marketId,
            question: signal.question || signal.marketQuestion,
            platform: 'Polymarket',
            outcomes: [
              {
                name: isBuyYes ? 'YES' : 'NO',
                probability: zigmaProb * 100,
              },
              {
                name: isBuyYes ? 'NO' : 'YES',
                probability: (1 - zigmaProb) * 100,
              },
            ],
            volume: signal.volume || 0,
            endsIn: calculateTimeRemaining(signal.endDate),
            category: signal.category || 'Other',
            link: signal.link || `https://polymarket.com/event/${signal.marketId}`,
          };
        });
        
        console.log('[Markets] Transformed markets:', transformed.length);
        setMarkets(transformed);
      }
    } catch (error) {
      console.error('[Markets] Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (endDate: string) => {
    if (!endDate) return '';
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    return '0d';
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol}`;
  };

  const categories = ['All', 'Crypto', 'Politics', 'Sports', 'Weather', 'Tech', 'Business', 'Culture'];
  const quickFilters = ['Trending', 'New', 'Ending Soon'];

  const filteredMarkets = markets.filter(m => {
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
    if (searchQuery && !m.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search 734 markets... ⌘K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white text-lg h-12"
          />
        </div>

        {/* Quick Filters */}
        <div className="mb-4 flex gap-2">
          <span className="text-gray-400 text-sm">Quick:</span>
          {quickFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setQuickFilter(filter)}
              className={`text-sm px-3 py-1 rounded ${
                quickFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-6 flex gap-2">
          <span className="text-gray-400 text-sm">Categories:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-sm px-3 py-1 rounded ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Platform Filter */}
        <div className="mb-6">
          <span className="text-gray-400 text-sm mr-3">Polymarket</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading markets..." />
        ) : (
          <>
            {/* Markets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkets.map((market) => (
                <Card
                  key={market.id}
                  className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer p-4"
                  onClick={() => window.open(market.link, '_blank')}
                >
                  {/* Platform Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-600 text-white text-xs">
                      {market.platform}
                    </Badge>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </div>

                  {/* Question */}
                  <h3 className="text-white font-medium text-sm mb-3 line-clamp-2 min-h-[40px]">
                    {market.question}
                  </h3>

                  {/* Outcomes */}
                  <div className="space-y-2 mb-3">
                    {market.outcomes.slice(0, 2).map((outcome, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">{outcome.name}</span>
                        <span className="text-white font-semibold">
                          {outcome.probability.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                    {market.outcomes.length > 2 && (
                      <div className="text-gray-500 text-xs">
                        +{market.outcomes.length - 2} more outcomes
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-800">
                    <span>{formatVolume(market.volume)} vol</span>
                    <span>{market.endsIn}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {filteredMarkets.length > 0 && (
              <div className="text-center mt-8">
                <button className="text-gray-400 hover:text-white text-sm">
                  Load More Markets &gt;
                </button>
              </div>
            )}

            {filteredMarkets.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No markets found
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-600 text-sm">
        © 2026 ZIGMA // SEASON 1
      </div>
    </div>
  );
};

export default MarketsPage;
