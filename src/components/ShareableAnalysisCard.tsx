import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react';

interface ShareableAnalysisCardProps {
  marketQuestion: string;
  recommendation: string;
  confidence: number;
  edge: number;
  yesPrice: number;
  noPrice: number;
  liquidity: number;
  timestamp: string;
}

export const ShareableAnalysisCard = ({
  marketQuestion,
  recommendation,
  confidence,
  edge,
  yesPrice,
  noPrice,
  liquidity,
  timestamp,
}: ShareableAnalysisCardProps) => {
  return (
    <div 
      id="shareable-analysis-card"
      className="w-[600px] bg-gradient-to-br from-gray-950 via-gray-900 to-black border-2 border-green-500/40 rounded-2xl p-8 shadow-2xl"
      style={{ fontFamily: 'monospace' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">ZIGMA</h2>
            <p className="text-xs text-green-300/60">AI Market Oracle</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-300/60">Analysis</div>
          <div className="text-sm text-white">{new Date(timestamp).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Market Question */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-green-400/80 mb-2">Market Question</div>
        <h3 className="text-lg font-bold text-white leading-tight">{marketQuestion}</h3>
      </div>

      {/* Recommendation */}
      <div className="mb-6 bg-gradient-to-r from-green-500/20 to-transparent border-l-4 border-green-500 p-4 rounded-r-lg">
        <div className="flex items-center gap-2 mb-2">
          {recommendation.toUpperCase().includes('BUY') || recommendation.toUpperCase().includes('YES') ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : recommendation.toUpperCase().includes('SELL') || recommendation.toUpperCase().includes('NO') ? (
            <TrendingDown className="w-5 h-5 text-red-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          )}
          <span className="text-xs uppercase tracking-wider text-green-400/80">Recommendation</span>
        </div>
        <p className="text-xl font-bold text-white">{recommendation}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
          <div className="text-xs text-green-300/60 mb-1">Confidence</div>
          <div className="text-2xl font-bold text-green-400">{confidence.toFixed(1)}%</div>
        </div>
        <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
          <div className="text-xs text-green-300/60 mb-1">Edge</div>
          <div className={`text-2xl font-bold ${edge > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {edge > 0 ? '+' : ''}{edge.toFixed(1)}%
          </div>
        </div>
        <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
          <div className="text-xs text-green-300/60 mb-1">Yes Price</div>
          <div className="text-xl font-bold text-white">{(yesPrice * 100).toFixed(1)}¢</div>
        </div>
        <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
          <div className="text-xs text-green-300/60 mb-1">Liquidity</div>
          <div className="text-xl font-bold text-white">${(liquidity / 1000).toFixed(0)}K</div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-green-500/30 flex items-center justify-between">
        <div className="text-xs text-green-300/40">
          Powered by Zigma AI • zigma.pro
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Live Analysis</span>
        </div>
      </div>
    </div>
  );
};
