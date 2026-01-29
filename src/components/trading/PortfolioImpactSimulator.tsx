import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PortfolioImpactSimulatorProps {
  investment: number;
  probability: number;
  marketOdds: number;
  edge: number;
}

export const PortfolioImpactSimulator: React.FC<PortfolioImpactSimulatorProps> = ({
  investment,
  probability,
  marketOdds,
  edge
}) => {
  const [portfolioSize, setPortfolioSize] = useState(10000);
  const [currentAllocation, setCurrentAllocation] = useState(0);
  const [newAllocation, setNewAllocation] = useState(0);
  const [portfolioRisk, setPortfolioRisk] = useState(0);
  const [expectedPortfolioReturn, setExpectedPortfolioReturn] = useState(0);

  useEffect(() => {
    // Calculate allocations
    const current = (investment / portfolioSize) * 100;
    setCurrentAllocation(current);

    const price = marketOdds / 100;
    const shares = investment / price;
    const winReturn = shares * 1;
    const profit = winReturn - investment;

    // Calculate expected value
    const expectedValue = (probability / 100) * profit + ((100 - probability) / 100) * (-investment);
    
    // Portfolio impact
    const newPortfolioValue = portfolioSize + expectedValue;
    const newAllocPct = (investment / newPortfolioValue) * 100;
    setNewAllocation(newAllocPct);

    // Portfolio risk (max loss as % of portfolio)
    const maxLoss = investment;
    const risk = (maxLoss / portfolioSize) * 100;
    setPortfolioRisk(risk);

    // Expected portfolio return
    const portfolioReturn = (expectedValue / portfolioSize) * 100;
    setExpectedPortfolioReturn(portfolioReturn);
  }, [investment, probability, marketOdds, portfolioSize]);

  const getRiskLevel = (risk: number) => {
    if (risk <= 2) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (risk <= 5) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (risk <= 10) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { level: 'Very High', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const riskLevel = getRiskLevel(portfolioRisk);

  return (
    <Card className="bg-black/40 border-green-500/20">
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          Portfolio Impact Simulator
        </div>

        {/* Portfolio Size Input */}
        <div className="space-y-2">
          <Label htmlFor="portfolio" className="text-xs text-muted-foreground">
            Total Portfolio Size ($)
          </Label>
          <Input
            id="portfolio"
            type="number"
            value={portfolioSize}
            onChange={(e) => setPortfolioSize(parseFloat(e.target.value) || 0)}
            className="bg-gray-800 border-green-500/30 text-green-100"
            min="100"
            step="1000"
          />
        </div>

        {/* Portfolio Allocation Visualization */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Portfolio Allocation</div>
          <div className="h-12 bg-gray-800 rounded-lg overflow-hidden flex">
            <div
              className="bg-green-500 flex items-center justify-center text-xs font-semibold text-white transition-all duration-500"
              style={{ width: `${Math.min(currentAllocation, 100)}%` }}
            >
              {currentAllocation > 5 && `${currentAllocation.toFixed(1)}%`}
            </div>
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              {100 - currentAllocation > 5 && `${(100 - currentAllocation).toFixed(1)}% Other Assets`}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Position Size</div>
            <div className="text-lg font-bold text-green-400">
              ${investment.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentAllocation.toFixed(2)}% of portfolio
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Portfolio Risk</div>
            <div className={cn("text-lg font-bold", riskLevel.color)}>
              {portfolioRisk.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Max loss exposure
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Expected Return</div>
            <div className={cn(
              "text-lg font-bold",
              expectedPortfolioReturn >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {expectedPortfolioReturn >= 0 ? '+' : ''}{expectedPortfolioReturn.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Portfolio impact
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
            <div className={cn("text-lg font-bold", riskLevel.color)}>
              {riskLevel.level}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on allocation
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Scenario Analysis
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Win Scenario */}
            <div className="bg-green-500/10 border border-green-500/30 p-2 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">Win ({probability.toFixed(0)}%)</div>
              <div className="text-sm font-bold text-green-400">
                ${(portfolioSize + (investment * ((1 / (marketOdds / 100)) - 1))).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">
                +{(((investment * ((1 / (marketOdds / 100)) - 1)) / portfolioSize) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Loss Scenario */}
            <div className="bg-red-500/10 border border-red-500/30 p-2 rounded">
              <div className="text-xs text-red-400 font-semibold mb-1">Loss ({(100 - probability).toFixed(0)}%)</div>
              <div className="text-sm font-bold text-red-400">
                ${(portfolioSize - investment).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">
                -{((investment / portfolioSize) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Expected Scenario */}
            <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">Expected</div>
              <div className="text-sm font-bold text-blue-400">
                ${(portfolioSize + (expectedPortfolioReturn / 100) * portfolioSize).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">
                {expectedPortfolioReturn >= 0 ? '+' : ''}{expectedPortfolioReturn.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Quick Portfolio Sizes */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setPortfolioSize(5000)}
            className="px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $5K
          </button>
          <button
            onClick={() => setPortfolioSize(10000)}
            className="px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $10K
          </button>
          <button
            onClick={() => setPortfolioSize(25000)}
            className="px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $25K
          </button>
          <button
            onClick={() => setPortfolioSize(50000)}
            className="px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded transition-colors"
          >
            $50K
          </button>
        </div>

        {/* Recommendation */}
        <div className={cn("p-3 rounded-lg border", riskLevel.bg, "border-current")}>
          <div className={cn("text-xs font-semibold mb-1", riskLevel.color)}>
            {riskLevel.level} Portfolio Risk
          </div>
          <div className="text-xs text-muted-foreground">
            {portfolioRisk <= 2
              ? 'Position size is well-diversified and conservative'
              : portfolioRisk <= 5
              ? 'Moderate concentration - acceptable for most portfolios'
              : portfolioRisk <= 10
              ? 'High concentration - consider reducing position size'
              : 'Very high concentration - significant portfolio risk'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
