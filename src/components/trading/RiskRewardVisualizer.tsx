import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RiskRewardVisualizerProps {
  investment: number;
  probability: number;
  marketOdds: number;
  edge: number;
}

export const RiskRewardVisualizer: React.FC<RiskRewardVisualizerProps> = ({
  investment,
  probability,
  marketOdds,
  edge
}) => {
  // Calculate potential outcomes
  const price = marketOdds / 100;
  const shares = investment / price;
  const winReturn = shares * 1;
  const profit = winReturn - investment;
  const loss = -investment;

  // Calculate risk/reward ratio
  const riskRewardRatio = Math.abs(profit / loss);

  // Calculate expected value
  const expectedValue = (probability / 100) * profit + ((100 - probability) / 100) * loss;

  // Determine if bet is favorable
  const isFavorable = expectedValue > 0;

  return (
    <Card className="bg-black/40 border-green-500/20">
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          Risk/Reward Analysis
        </div>

        {/* Visual Bar */}
        <div className="relative h-32 bg-gray-800 rounded-lg overflow-hidden">
          {/* Center line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600 z-10"></div>

          {/* Loss side (left) */}
          <div className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-end pr-2">
            <div className="text-right">
              <div className="text-xs text-red-400 mb-1">Risk (Loss)</div>
              <div className="text-2xl font-bold text-red-400">
                ${Math.abs(loss).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(100 - probability).toFixed(1)}% chance
              </div>
            </div>
          </div>

          {/* Win side (right) */}
          <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-start pl-2">
            <div className="text-left">
              <div className="text-xs text-green-400 mb-1">Reward (Profit)</div>
              <div className="text-2xl font-bold text-green-400">
                ${profit.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {probability.toFixed(1)}% chance
              </div>
            </div>
          </div>

          {/* Probability bars */}
          <div className="absolute bottom-0 left-0 right-0 h-8 flex">
            <div
              className="bg-red-500/30 border-r-2 border-gray-600"
              style={{ width: `${100 - probability}%` }}
            ></div>
            <div
              className="bg-green-500/30"
              style={{ width: `${probability}%` }}
            ></div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Risk/Reward Ratio</div>
            <div className={cn(
              "text-lg font-bold",
              riskRewardRatio >= 2 ? "text-green-400" :
              riskRewardRatio >= 1 ? "text-yellow-400" :
              "text-red-400"
            )}>
              1:{riskRewardRatio.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Expected Value</div>
            <div className={cn(
              "text-lg font-bold",
              expectedValue >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {expectedValue >= 0 ? '+' : ''}${expectedValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Win Probability</div>
            <div className="text-lg font-bold text-blue-400">
              {probability.toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Edge</div>
            <div className={cn(
              "text-lg font-bold",
              edge >= 5 ? "text-green-400" :
              edge >= 2 ? "text-yellow-400" :
              "text-red-400"
            )}>
              {edge >= 0 ? '+' : ''}{edge.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={cn(
          "p-3 rounded-lg border-2",
          isFavorable
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-2xl",
              isFavorable ? "text-green-400" : "text-red-400"
            )}>
              {isFavorable ? '✓' : '✗'}
            </div>
            <div>
              <div className={cn(
                "font-semibold",
                isFavorable ? "text-green-400" : "text-red-400"
              )}>
                {isFavorable ? 'Favorable Bet' : 'Unfavorable Bet'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isFavorable
                  ? `Expected to gain $${expectedValue.toFixed(2)} per bet on average`
                  : `Expected to lose $${Math.abs(expectedValue).toFixed(2)} per bet on average`
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
