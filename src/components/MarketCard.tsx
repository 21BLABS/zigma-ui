import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, DollarSign, Zap } from "lucide-react";

interface MarketCardProps {
  market: {
    id: string;
    question: string;
    platform: 'Polymarket' | 'Kalshi' | 'Manifold';
    forecast: number;
    zigmaOdds?: number;
    edge?: number;
    confidence?: number;
    volume?: number;
    endsIn?: string;
    category?: string;
  };
  onTrade?: (marketId: string) => void;
}

const MarketCard = ({ market, onTrade }: MarketCardProps) => {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Polymarket': return 'bg-blue-500';
      case 'Kalshi': return 'bg-purple-500';
      case 'Manifold': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Crypto': return 'border-yellow-500/50 text-yellow-400';
      case 'Politics': return 'border-red-500/50 text-red-400';
      case 'Sports': return 'border-blue-500/50 text-blue-400';
      case 'Weather': return 'border-cyan-500/50 text-cyan-400';
      case 'Tech': return 'border-purple-500/50 text-purple-400';
      default: return 'border-green-500/50 text-green-400';
    }
  };

  const hasZigmaSignal = market.edge !== undefined && market.edge > 0;

  return (
    <Card className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all group">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <Badge className={`${getPlatformColor(market.platform)} text-white text-xs`}>
            {market.platform}
          </Badge>
          {market.category && (
            <Badge variant="outline" className={`text-xs ${getCategoryColor(market.category)}`}>
              {market.category}
            </Badge>
          )}
        </div>

        {/* Question */}
        <h4 className="text-white font-medium text-sm line-clamp-2 group-hover:text-green-300 transition-colors">
          {market.question}
        </h4>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/50 border border-green-500/20 rounded p-2">
            <p className="text-xs text-green-300/60 mb-1">Market</p>
            <p className="text-lg font-bold text-white">{market.forecast.toFixed(1)}%</p>
          </div>
          
          {hasZigmaSignal && market.zigmaOdds && (
            <div className="bg-black/50 border border-green-500/30 rounded p-2">
              <p className="text-xs text-green-400 mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Zigma
              </p>
              <p className="text-lg font-bold text-green-400">{market.zigmaOdds.toFixed(1)}%</p>
            </div>
          )}
        </div>

        {/* Zigma Analysis */}
        {hasZigmaSignal && (
          <div className="bg-green-500/10 border border-green-500/30 rounded p-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-300/80">Edge</span>
              <span className="text-green-400 font-semibold">
                {market.edge?.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-300/80">Confidence</span>
              <span className="text-green-400 font-semibold">
                {market.confidence?.toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-green-500/20">
          <div className="flex items-center gap-3 text-xs text-green-300/60">
            {market.endsIn && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {market.endsIn}
              </span>
            )}
            {market.volume && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${market.volume.toLocaleString()}
              </span>
            )}
          </div>
          
          {onTrade && (
            <Button
              size="sm"
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
              onClick={() => onTrade(market.id)}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Trade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketCard;
