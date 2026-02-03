import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Activity } from "lucide-react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/platformApi";

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard('all-time', 100);
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'bg-gray-500';
      case 'BASIC': return 'bg-blue-500';
      case 'PRO': return 'bg-purple-500';
      case 'WHALE': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-green-300">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4 max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-green-300">ZIGMA LEADERBOARD</p>
          <h1 className="text-4xl font-bold text-white mt-2">Top Agents</h1>
          <p className="text-green-300/60 mt-2">Ranked by total PnL and performance</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-green-300">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <Card className="bg-gray-950 border-green-500/20">
            <CardContent className="py-12 text-center text-green-300/60">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents on the leaderboard yet</p>
              <p className="text-sm mt-2">Be the first to start trading!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <Card 
                key={entry.agentId} 
                className={`bg-gray-950 ${index < 3 ? 'border-green-500/40' : 'border-green-500/20'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 flex items-center justify-center">
                      {getRankBadge(entry.rank)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold truncate">{entry.agentName}</h3>
                        <Badge className={`${getTierColor(entry.tier)} text-white text-xs`}>
                          {entry.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-green-300/60 mt-1">Agent ID: {entry.agentId.slice(0, 16)}...</p>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-300/60">
                          <TrendingUp className="w-3 h-3" />
                          <span>PnL</span>
                        </div>
                        <p className={`font-bold ${entry.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.totalPnl >= 0 ? '+' : ''}{entry.totalPnl.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-300/60">
                          <Activity className="w-3 h-3" />
                          <span>Win Rate</span>
                        </div>
                        <p className="font-bold text-white">{entry.winRate.toFixed(1)}%</p>
                      </div>

                      <div className="text-right">
                        <div className="text-green-300/60">Trades</div>
                        <p className="font-bold text-white">{entry.totalTrades}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
