import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolvedSignals, resolvedSignalsStats } from "@/data/resolvedSignals";
import { CheckCircle, ExternalLink, Trophy } from "lucide-react";

const ResolvedSignals = () => {
  const formatPrice = (price: number) => `${(price * 100).toFixed(1)}¢`;
  const formatPnL = (pnl: number) => `+$${pnl.toFixed(2)}`;
  const formatEdge = (edge: number) => `${(edge * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-400 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Resolved Signals - Track Record
              </CardTitle>
              <CardDescription className="text-green-300/60 mt-2">
                Verified executable performance from manually tracked trades
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">
                {resolvedSignalsStats.winRate}%
              </div>
              <div className="text-sm text-green-300/60">Win Rate</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-black/40 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {resolvedSignalsStats.totalSignals}
              </div>
              <div className="text-xs text-green-300/60 mt-1">Total Signals</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                +${resolvedSignalsStats.totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-green-300/60 mt-1">Total PnL</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg">
              <div className="text-2xl font-bold text-white">
                ${resolvedSignalsStats.averagePnL.toFixed(2)}
              </div>
              <div className="text-xs text-green-300/60 mt-1">Avg PnL/Trade</div>
            </div>
            <div className="text-center p-4 bg-black/40 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {resolvedSignalsStats.averageEdge.toFixed(1)}%
              </div>
              <div className="text-xs text-green-300/60 mt-1">Avg Edge</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resolvedSignals.map((signal) => (
          <Card 
            key={signal.id} 
            className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm text-white leading-tight flex-1">
                  {signal.marketQuestion}
                </CardTitle>
                <Badge className="bg-green-500 text-black shrink-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  WIN
                </Badge>
              </div>
              <CardDescription className="text-green-300/60 text-xs mt-1">
                {signal.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Trade Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-green-300/60">Entry</div>
                  <div className="text-white font-semibold">{formatPrice(signal.entryPrice)}</div>
                </div>
                <div>
                  <div className="text-green-300/60">Exit</div>
                  <div className="text-white font-semibold">{formatPrice(signal.exitPrice)}</div>
                </div>
                <div>
                  <div className="text-green-300/60">PnL</div>
                  <div className="text-green-400 font-bold">{formatPnL(signal.pnl)}</div>
                </div>
                <div>
                  <div className="text-green-300/60">Edge</div>
                  <div className="text-white font-semibold">{formatEdge(signal.edge)}</div>
                </div>
              </div>

              {/* Outcome Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-green-500/20">
                <Badge variant="outline" className="text-green-400 border-green-400/60">
                  {signal.outcome}
                </Badge>
                <a
                  href={signal.marketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                >
                  View Market
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Date */}
              <div className="text-xs text-green-300/40">
                {new Date(signal.entryTime).toLocaleDateString()} → {new Date(signal.exitTime).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResolvedSignals;
