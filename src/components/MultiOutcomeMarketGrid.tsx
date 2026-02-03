import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Market {
  id?: string;
  question?: string;
  yesPrice?: number;
  noPrice?: number;
  liquidity?: number;
  volume24hr?: number;
  url?: string;
}

interface MultiOutcomeMarketGridProps {
  markets: Market[];
  onSelectMarket?: (market: Market) => void;
}

export const MultiOutcomeMarketGrid: React.FC<MultiOutcomeMarketGridProps> = ({
  markets,
  onSelectMarket
}) => {
  const formatPrice = (price: number) => {
    return (price * 100).toFixed(1);
  };

  const formatLiquidity = (liquidity: number | undefined | null) => {
    const value = Number(liquidity) || 0;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getPriceColor = (price: number) => {
    if (price >= 0.5) return 'text-green-400';
    if (price >= 0.2) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-green-400">All Market Outcomes</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {markets.length} outcomes available • Click any outcome for detailed analysis
          </p>
        </div>
        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
          Multi-Outcome Event
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((market) => {
          const yesPrice = market.yesPrice;
          const edge = yesPrice >= 0.5 ? 'High Probability' : yesPrice >= 0.2 ? 'Medium Probability' : 'Low Probability';
          
          return (
            <Card 
              key={market.id}
              className={cn(
                "border transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                yesPrice >= 0.5 ? "border-green-500/30 bg-green-900/10" :
                yesPrice >= 0.2 ? "border-yellow-500/30 bg-yellow-900/10" :
                "border-blue-500/30 bg-blue-900/10"
              )}
              onClick={() => onSelectMarket?.(market)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {market.question}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs shrink-0",
                      yesPrice >= 0.5 ? "border-green-500/50 text-green-400" :
                      yesPrice >= 0.2 ? "border-yellow-500/50 text-yellow-400" :
                      "border-blue-500/50 text-blue-400"
                    )}
                  >
                    {edge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Price Display */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={cn("w-4 h-4", getPriceColor(yesPrice))} />
                    <span className="text-xs text-muted-foreground">YES Price</span>
                  </div>
                  <span className={cn("text-lg font-bold", getPriceColor(yesPrice))}>
                    {formatPrice(yesPrice)}%
                  </span>
                </div>

                {/* NO Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-muted-foreground">NO Price</span>
                  </div>
                  <span className="text-sm font-semibold text-red-400">
                    {formatPrice(market.noPrice)}%
                  </span>
                </div>

                {/* Market Stats */}
                <div className="pt-2 border-t border-gray-700/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Liquidity
                    </span>
                    <span className="text-green-400 font-medium">
                      {formatLiquidity(market.liquidity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="text-blue-400 font-medium">
                      {formatLiquidity(market.volume24hr)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-green-500/30 hover:bg-green-500/10 text-green-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(market.url, '_blank');
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View on Polymarket
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-xs text-muted-foreground pt-2">
        💡 Tip: Click any outcome card to get Zigma's detailed analysis for that specific price range
      </div>
    </div>
  );
};
