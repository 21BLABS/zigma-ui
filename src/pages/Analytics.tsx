import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ResolvedSignals from "@/components/ResolvedSignals";
import { TrendingUp, Activity, Target, Zap } from "lucide-react";

const Analytics = () => {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      
      <main className="container mx-auto px-6 sm:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">ANALYTICS DASHBOARD</h1>
              <p className="text-green-300/60">
                Real-time prediction market intelligence
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-300/60 mb-1">Last updated</div>
              <div className="text-sm text-white">{lastRefresh.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="bg-gradient-to-br from-green-900/20 to-transparent border-green-500/30 hover:border-green-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Total Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">14</div>
              <p className="text-xs text-green-300/60 mt-1">Resolved trades</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-transparent border-green-500/30 hover:border-green-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">100%</div>
              <p className="text-xs text-green-300/60 mt-1">14/14 wins</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-transparent border-green-500/30 hover:border-green-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total PnL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">+$657.20</div>
              <p className="text-xs text-green-300/60 mt-1">$46.94 avg/trade</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-transparent border-green-500/30 hover:border-green-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Avg Edge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">47.3%</div>
              <p className="text-xs text-green-300/60 mt-1">Average advantage</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="bg-gray-950 border-green-500/20 mb-12">
          <CardHeader>
            <CardTitle className="text-green-400">Performance Summary</CardTitle>
            <CardDescription className="text-green-300/60">
              Track record from manually verified trades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-sm text-green-300/60 mb-2">Best Trade</div>
                <div className="text-2xl font-bold text-green-400">+$80.50</div>
                <div className="text-xs text-green-300/40 mt-1">Russia enters Ternuvate</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-sm text-green-300/60 mb-2">Highest Edge</div>
                <div className="text-2xl font-bold text-white">80.5%</div>
                <div className="text-xs text-green-300/40 mt-1">Russia enters Ternuvate</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-sm text-green-300/60 mb-2">Date Range</div>
                <div className="text-lg font-bold text-white">Jan 14 - Feb 28</div>
                <div className="text-xs text-green-300/40 mt-1">2025</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-gray-950 border-green-500/20 mb-12">
          <CardHeader>
            <CardTitle className="text-green-400">Category Performance</CardTitle>
            <CardDescription className="text-green-300/60">
              Performance by market category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                <div>
                  <div className="text-white font-semibold">Entertainment</div>
                  <div className="text-xs text-green-300/60">6 trades</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">100%</div>
                  <div className="text-xs text-green-300/60">Win rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                <div>
                  <div className="text-white font-semibold">Geopolitics</div>
                  <div className="text-xs text-green-300/60">4 trades</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">100%</div>
                  <div className="text-xs text-green-300/60">Win rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                <div>
                  <div className="text-white font-semibold">Other</div>
                  <div className="text-xs text-green-300/60">4 trades</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">100%</div>
                  <div className="text-xs text-green-300/60">Win rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolved Signals Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-2">Historical Performance - Track Record</h2>
          <p className="text-green-300/60 mb-8">Verified wins from manually tracked trades</p>
          <ResolvedSignals />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
