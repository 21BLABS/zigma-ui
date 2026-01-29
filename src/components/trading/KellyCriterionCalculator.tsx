import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface KellyCriterionCalculatorProps {
  probability: number;
  marketOdds: number;
  edge: number;
  bankroll?: number;
}

export const KellyCriterionCalculator: React.FC<KellyCriterionCalculatorProps> = ({
  probability,
  marketOdds,
  edge,
  bankroll = 1000
}) => {
  const [kellyFraction, setKellyFraction] = useState(1); // 1 = full Kelly, 0.5 = half Kelly
  const [recommendedBet, setRecommendedBet] = useState(0);
  const [kellyPercentage, setKellyPercentage] = useState(0);

  useEffect(() => {
    // Kelly Criterion formula: f* = (bp - q) / b
    // where:
    // b = odds received on the bet (decimal odds - 1)
    // p = probability of winning
    // q = probability of losing (1 - p)
    
    const p = probability / 100;
    const q = 1 - p;
    const decimalOdds = 1 / (marketOdds / 100);
    const b = decimalOdds - 1;

    // Calculate Kelly percentage
    const kellyPct = ((b * p - q) / b) * 100;
    
    // Apply Kelly fraction (for fractional Kelly)
    const adjustedKellyPct = Math.max(0, kellyPct * kellyFraction);
    
    setKellyPercentage(adjustedKellyPct);
    setRecommendedBet((adjustedKellyPct / 100) * bankroll);
  }, [probability, marketOdds, kellyFraction, bankroll]);

  const getKellyAdvice = (pct: number) => {
    if (pct <= 0) return { text: 'No Bet', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (pct < 2) return { text: 'Very Small', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (pct < 5) return { text: 'Small', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (pct < 10) return { text: 'Moderate', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (pct < 20) return { text: 'Large', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { text: 'Very Large (Risky)', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const advice = getKellyAdvice(kellyPercentage);

  return (
    <Card className="bg-black/40 border-green-500/20">
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          Kelly Criterion Calculator
        </div>

        {/* Kelly Fraction Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              Kelly Fraction
            </Label>
            <span className="text-sm font-bold text-green-400">
              {kellyFraction === 1 ? 'Full' : kellyFraction === 0.5 ? 'Half' : kellyFraction === 0.25 ? 'Quarter' : `${(kellyFraction * 100).toFixed(0)}%`}
            </span>
          </div>
          <Slider
            value={[kellyFraction * 100]}
            onValueChange={(value) => setKellyFraction(value[0] / 100)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Recommended Bet Display */}
        <div className={cn(
          "p-4 rounded-lg border-2 text-center",
          advice.bg,
          "border-current"
        )}>
          <div className="text-xs text-muted-foreground mb-2">Recommended Bet Size</div>
          <div className={cn("text-3xl font-bold mb-1", advice.color)}>
            ${recommendedBet.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {kellyPercentage.toFixed(2)}% of ${bankroll} bankroll
          </div>
          <div className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold", advice.color, advice.bg)}>
            {advice.text}
          </div>
        </div>

        {/* Visual Bankroll Allocation */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Bankroll Allocation</div>
          <div className="h-8 bg-gray-800 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 flex items-center justify-center text-xs font-semibold text-white"
              style={{ width: `${Math.min(kellyPercentage, 100)}%` }}
            >
              {kellyPercentage > 5 && `${kellyPercentage.toFixed(1)}%`}
            </div>
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              {100 - kellyPercentage > 5 && `${(100 - kellyPercentage).toFixed(1)}% Reserved`}
            </div>
          </div>
        </div>

        {/* Quick Fractions */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setKellyFraction(0.25)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              kellyFraction === 0.25
                ? "bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-green-400"
            )}
          >
            1/4 Kelly
          </button>
          <button
            onClick={() => setKellyFraction(0.5)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              kellyFraction === 0.5
                ? "bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-green-400"
            )}
          >
            1/2 Kelly
          </button>
          <button
            onClick={() => setKellyFraction(0.75)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              kellyFraction === 0.75
                ? "bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-green-400"
            )}
          >
            3/4 Kelly
          </button>
          <button
            onClick={() => setKellyFraction(1)}
            className={cn(
              "px-3 py-2 text-xs rounded transition-colors",
              kellyFraction === 1
                ? "bg-green-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-green-400"
            )}
          >
            Full Kelly
          </button>
        </div>

        {/* Warning */}
        <div className="text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
          ⚠️ Kelly Criterion assumes accurate probability estimates. Use fractional Kelly (1/4 or 1/2) to reduce variance and risk of ruin.
        </div>
      </CardContent>
    </Card>
  );
};
