import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PositionCalculatorProps {
  probability: number;
  marketOdds: number;
  edge: number;
  action: string;
}

export const PositionCalculator: React.FC<PositionCalculatorProps> = ({
  probability,
  marketOdds,
  edge,
  action
}) => {
  const [investment, setInvestment] = useState(100);
  const [shares, setShares] = useState(0);
  const [potentialReturn, setPotentialReturn] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [roi, setRoi] = useState(0);

  useEffect(() => {
    // Calculate shares based on investment and market odds
    const price = marketOdds / 100;
    const calculatedShares = investment / price;
    setShares(calculatedShares);

    // Calculate potential return (if bet wins, you get $1 per share)
    const winReturn = calculatedShares * 1; // Each share pays $1 if wins
    setPotentialReturn(winReturn);

    // Calculate profit
    const profit = winReturn - investment;
    setPotentialProfit(profit);

    // Calculate ROI
    const calculatedRoi = (profit / investment) * 100;
    setRoi(calculatedRoi);
  }, [investment, marketOdds]);

  const expectedValue = (probability / 100) * potentialReturn - ((100 - probability) / 100) * investment;
  const expectedRoi = (expectedValue / investment) * 100;

  return (
    <Card className="bg-black/40 border-green-500/20">
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          Position Calculator
        </div>

        {/* Investment Input */}
        <div className="space-y-2">
          <Label htmlFor="investment" className="text-xs text-muted-foreground">
            Investment Amount ($)
          </Label>
          <Input
            id="investment"
            type="number"
            value={investment}
            onChange={(e) => setInvestment(parseFloat(e.target.value) || 0)}
            className="bg-gray-800 border-green-500/30 text-green-100"
            min="1"
            step="10"
          />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Shares</div>
            <div className="text-lg font-bold text-green-400">
              {shares.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
            <div className="text-lg font-bold text-blue-400">
              ${(marketOdds / 100).toFixed(3)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">If Wins</div>
            <div className="text-lg font-bold text-green-400">
              ${potentialReturn.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Profit/Loss</div>
            <div className={cn(
              "text-lg font-bold",
              potentialProfit >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {potentialProfit >= 0 ? '+' : ''}${potentialProfit.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">ROI (If Wins)</div>
            <div className={cn(
              "text-lg font-bold",
              roi >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
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
        </div>

        {/* Expected ROI Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Expected ROI</span>
            <span className={cn(
              "font-bold",
              expectedRoi >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {expectedRoi >= 0 ? '+' : ''}{expectedRoi.toFixed(2)}%
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                expectedRoi >= 0 ? "bg-green-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(Math.abs(expectedRoi), 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="flex gap-2">
          <button
            onClick={() => setInvestment(50)}
            className="flex-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $50
          </button>
          <button
            onClick={() => setInvestment(100)}
            className="flex-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $100
          </button>
          <button
            onClick={() => setInvestment(250)}
            className="flex-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $250
          </button>
          <button
            onClick={() => setInvestment(500)}
            className="flex-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $500
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
