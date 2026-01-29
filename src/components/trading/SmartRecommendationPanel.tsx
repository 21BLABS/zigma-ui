import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Target, Shield, PieChart, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PositionCalculator } from './PositionCalculator';
import { RiskRewardVisualizer } from './RiskRewardVisualizer';
import { KellyCriterionCalculator } from './KellyCriterionCalculator';
import { StopLossCalculator } from './StopLossCalculator';
import { PortfolioImpactSimulator } from './PortfolioImpactSimulator';

interface SmartRecommendationPanelProps {
  probability: number;
  marketOdds: number;
  edge: number;
  action: string;
}

export const SmartRecommendationPanel: React.FC<SmartRecommendationPanelProps> = ({
  probability,
  marketOdds,
  edge,
  action
}) => {
  const [activeTab, setActiveTab] = useState<'position' | 'risk' | 'kelly' | 'stoploss' | 'portfolio'>('position');
  const [investment, setInvestment] = useState(100);

  const tabs = [
    { id: 'position', label: 'Position', icon: Calculator },
    { id: 'risk', label: 'Risk/Reward', icon: TrendingUp },
    { id: 'kelly', label: 'Kelly', icon: Percent },
    { id: 'stoploss', label: 'Stop-Loss', icon: Shield },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart }
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center gap-2 whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-green-500/20 border-green-500/50 text-green-400"
                  : "border-green-500/20 text-green-400/60 hover:text-green-400 hover:bg-green-500/10"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'position' && (
          <PositionCalculator
            probability={probability}
            marketOdds={marketOdds}
            edge={edge}
            action={action}
          />
        )}

        {activeTab === 'risk' && (
          <RiskRewardVisualizer
            investment={investment}
            probability={probability}
            marketOdds={marketOdds}
            edge={edge}
          />
        )}

        {activeTab === 'kelly' && (
          <KellyCriterionCalculator
            probability={probability}
            marketOdds={marketOdds}
            edge={edge}
            bankroll={1000}
          />
        )}

        {activeTab === 'stoploss' && (
          <StopLossCalculator
            investment={investment}
            marketOdds={marketOdds}
            probability={probability}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioImpactSimulator
            investment={investment}
            probability={probability}
            marketOdds={marketOdds}
            edge={edge}
          />
        )}
      </div>

      {/* Shared Investment Control (for tabs that need it) */}
      {(activeTab === 'risk' || activeTab === 'stoploss' || activeTab === 'portfolio') && (
        <div className="flex items-center gap-3 p-3 bg-black/40 border border-green-500/20 rounded-lg">
          <div className="text-xs text-muted-foreground">Investment:</div>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(parseFloat(e.target.value) || 0)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-green-500/30 rounded text-green-100 text-sm"
            min="1"
            step="10"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setInvestment(100)}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded"
            >
              $100
            </button>
            <button
              onClick={() => setInvestment(250)}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded"
            >
              $250
            </button>
            <button
              onClick={() => setInvestment(500)}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-green-400 rounded"
            >
              $500
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
