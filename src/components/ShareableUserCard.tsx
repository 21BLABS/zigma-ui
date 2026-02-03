import { TrendingUp, TrendingDown, Award, Target, Zap } from 'lucide-react';

interface ShareableUserCardProps {
  walletAddress: string;
  balance: number;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  totalVolume: number;
  grade: string;
  topMarkets: Array<{ title: string; pnl: number }>;
  timestamp: string;
}

export const ShareableUserCard = ({
  walletAddress,
  balance,
  totalPnl,
  winRate,
  totalTrades,
  totalVolume,
  grade,
  topMarkets,
  timestamp,
}: ShareableUserCardProps) => {
  const isProfitable = totalPnl > 0;
  const gradeColor = 
    grade === 'A' ? 'text-green-400' :
    grade === 'B' ? 'text-blue-400' :
    grade === 'C' ? 'text-yellow-400' :
    grade === 'D' ? 'text-orange-400' :
    'text-red-400';

  return (
    <div 
      id="shareable-user-card"
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
            <p className="text-xs text-green-300/60">Trader Analysis</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${gradeColor}`}>{grade}</div>
          <div className="text-xs text-green-300/60">Grade</div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-green-400/80 mb-2">Trader Wallet</div>
        <div className="text-lg font-mono text-white bg-black/40 px-4 py-2 rounded-lg border border-green-500/20">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      </div>

      {/* P&L Banner */}
      <div className={`mb-6 bg-gradient-to-r ${isProfitable ? 'from-green-500/20 to-transparent border-l-4 border-green-500' : 'from-red-500/20 to-transparent border-l-4 border-red-500'} p-4 rounded-r-lg`}>
        <div className="flex items-center gap-2 mb-2">
          {isProfitable ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <span className="text-xs uppercase tracking-wider text-green-400/80">Total P&L</span>
        </div>
        <p className={`text-3xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
          {isProfitable ? '+' : ''}${totalPnl.toFixed(2)}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
          <div className="text-xs text-green-300/60 mb-1">Balance</div>
          <div className="text-xl font-bold text-white">${(balance / 1000).toFixed(1)}K</div>
        </div>
        <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
          <div className="text-xs text-green-300/60 mb-1">Win Rate</div>
          <div className={`text-xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
            {winRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
          <div className="text-xs text-green-300/60 mb-1">Trades</div>
          <div className="text-xl font-bold text-white">{totalTrades}</div>
        </div>
      </div>

      {/* Top Markets */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-yellow-400" />
          <div className="text-xs uppercase tracking-wider text-green-400/80">Top 3 Markets</div>
        </div>
        <div className="space-y-2">
          {topMarkets.slice(0, 3).map((market, idx) => (
            <div key={idx} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-green-500/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-300/60">#{idx + 1}</span>
                <span className="text-sm text-white truncate max-w-[300px]">{market.title}</span>
              </div>
              <span className={`text-sm font-bold ${market.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {market.pnl > 0 ? '+' : ''}${market.pnl.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-green-500/30 flex items-center justify-between">
        <div className="text-xs text-green-300/40">
          Powered by Zigma AI • zigma.pro
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">Trader Profile</span>
        </div>
      </div>
    </div>
  );
};
