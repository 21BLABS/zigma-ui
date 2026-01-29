import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface StopLossCalculatorProps {
  investment: number;
  marketOdds: number;
  probability: number;
}

export const StopLossCalculator: React.FC<StopLossCalculatorProps> = ({
  investment,
  marketOdds,
  probability
}) => {
  const [stopLossPercent, setStopLossPercent] = useState(20);
  const [stopLossPrice, setStopLossPrice] = useState(0);
  const [maxLoss, setMaxLoss] = useState(0);
  const [exitShares, setExitShares] = useState(0);

  useEffect(() => {
    const entryPrice = marketOdds / 100;
    const shares = investment / entryPrice;
    
    // Calculate stop-loss price (percentage below entry)
    const stopPrice = entryPrice * (1 - stopLossPercent / 100);
    setStopLossPrice(stopPrice);

    // Calculate max loss
    const exitValue = shares * stopPrice;
    const loss = investment - exitValue;
    setMaxLoss(loss);
    setExitShares(shares);
  }, [investment, marketOdds, stopLossPercent]);

  const riskPercent = (maxLoss / investment) * 100;

  return (
    <Card className="bg-black/40 border-green-500/20">
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          Stop-Loss Calculator
        </div>

        {/* Stop-Loss Percentage Input */}
        <div className="space-y-2">
          <Label htmlFor="stopLoss" className="text-xs text-muted-foreground">
            Stop-Loss Threshold (%)
          </Label>
          <Input
            id="stopLoss"
            type="number"
            value={stopLossPercent}
            onChange={(e) => setStopLossPercent(parseFloat(e.target.value) || 0)}
            className="bg-gray-800 border-green-500/30 text-green-100"
            min="1"
            max="50"
            step="1"
          />
        </div>

        {/* Visual Stop-Loss Indicator */}
        <div className="relative h-24 bg-gray-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            {/* Entry Price Line */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-green-400">Entry Price</div>
              <div className="text-sm font-bold text-green-400">
                ${(marketOdds / 100).toFixed(3)}
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex items-center justify-center">
              <div className="text-2xl text-red-400">↓ {stopLossPercent}%</div>
            </div>

            {/* Stop-Loss Line */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-red-400">Stop-Loss Price</div>
              <div className="text-sm font-bold text-red-400">
                ${stopLossPrice.toFixed(3)}
              </div>
            </div>
          </div>

          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-yellow-500/10 to-red-500/20 pointer-events-none"></div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Max Loss</div>
            <div className="text-lg font-bold text-red-400">
              -${maxLoss.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Risk %</div>
            <div className="text-lg font-bold text-red-400">
              -{riskPercent.toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Exit Value</div>
            <div className="text-lg font-bold text-yellow-400">
              ${(investment - maxLoss).toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Shares</div>
            <div className="text-lg font-bold text-blue-400">
              {exitShares.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Quick Stop-Loss Presets */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setStopLossPercent(10)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              stopLossPercent === 10
                ? "bg-red-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-red-400"
            )}
          >
            10%
          </button>
          <button
            onClick={() => setStopLossPercent(20)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              stopLossPercent === 20
                ? "bg-red-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-red-400"
            )}
          >
            20%
          </button>
          <button
            onClick={() => setStopLossPercent(30)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              stopLossPercent === 30
                ? "bg-red-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-red-400"
            )}
          >
            30%
          </button>
          <button
            onClick={() => setStopLossPercent(50)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              stopLossPercent === 50
                ? "bg-red-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-red-400"
            )}
          >
            50%
          </button>
        </div>

        {/* Recommendation */}
        <div className={cn(
          "p-3 rounded-lg border",
          riskPercent <= 10 ? "bg-green-500/10 border-green-500/30" :
          riskPercent <= 25 ? "bg-yellow-500/10 border-yellow-500/30" :
          "bg-red-500/10 border-red-500/30"
        )}>
          <div className="text-xs font-semibold mb-1">
            {riskPercent <= 10 ? '✓ Conservative Risk' :
             riskPercent <= 25 ? '⚠️ Moderate Risk' :
             '⚠️ High Risk'}
          </div>
          <div className="text-xs text-muted-foreground">
            {riskPercent <= 10
              ? 'Stop-loss protects most of your capital'
              : riskPercent <= 25
              ? 'Acceptable risk for most traders'
              : 'Consider tightening stop-loss to reduce risk'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
