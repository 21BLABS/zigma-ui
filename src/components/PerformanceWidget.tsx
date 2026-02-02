import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, DollarSign, Award, AlertCircle } from "lucide-react";

interface PerformanceMetrics {
  total_signals: number;
  resolved_signals: number;
  winning_signals: number;
  losing_signals: number;
  win_rate: number;
  total_pnl: number;
  total_roi: number;
  avg_edge: number;
  avg_confidence: number;
  sharpe_ratio: number;
  profit_factor: number;
  avg_win: number;
  avg_loss: number;
  max_win: number;
  max_loss: number;
}

export default function PerformanceWidget() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

  useEffect(() => {
    if (!apiBaseUrl) return;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/performance/metrics?period=all_time`);
        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch performance metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Loading Performance...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!metrics || metrics.resolved_signals === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Building Track Record
          </CardTitle>
          <CardDescription className="text-gray-400">
            No resolved signals yet. Check back soon as markets resolve!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400">
            <p className="mb-2">📊 <strong>{metrics?.total_signals || 0}</strong> active signals</p>
            <p>⏰ Waiting for first resolutions to calculate performance metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const winRate = (metrics.win_rate * 100).toFixed(1);
  const isProfitable = metrics.total_pnl > 0;
  const roiPercent = (metrics.total_roi * 100).toFixed(1);

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Track Record (All Time)
        </CardTitle>
        <CardDescription className="text-gray-400">
          Real performance from {metrics.resolved_signals} resolved signals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Win Rate */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Target className="w-3 h-3" />
              Win Rate
            </div>
            <div className="text-2xl font-bold text-white">
              {winRate}%
            </div>
            <div className="text-xs text-gray-500">
              {metrics.winning_signals}W / {metrics.losing_signals}L
            </div>
          </div>

          {/* Total P&L */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <DollarSign className="w-3 h-3" />
              Total P&L
            </div>
            <div className={`text-2xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitable ? '+' : ''}${metrics.total_pnl.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {isProfitable ? '+' : ''}{roiPercent}% ROI
            </div>
          </div>

          {/* Sharpe Ratio */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <TrendingUp className="w-3 h-3" />
              Sharpe Ratio
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.sharpe_ratio.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Risk-adjusted
            </div>
          </div>

          {/* Profit Factor */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Award className="w-3 h-3" />
              Profit Factor
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics.profit_factor.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Win/Loss ratio
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Avg Edge:</span>
            <span className="ml-2 text-white font-medium">
              {(metrics.avg_edge * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-400">Avg Confidence:</span>
            <span className="ml-2 text-white font-medium">
              {(metrics.avg_confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-gray-400">Avg Win:</span>
            <span className="ml-2 text-green-500 font-medium">
              +${metrics.avg_win.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Avg Loss:</span>
            <span className="ml-2 text-red-500 font-medium">
              ${metrics.avg_loss.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Max Win:</span>
            <span className="ml-2 text-green-500 font-medium">
              +${metrics.max_win.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Max Loss:</span>
            <span className="ml-2 text-red-500 font-medium">
              ${metrics.max_loss.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Edge Accuracy */}
        {metrics.resolved_signals >= 10 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-xs text-blue-400 mb-1">Edge Accuracy</div>
            <div className="text-sm text-white">
              {(metrics.avg_confidence * 100).toFixed(0)}% confidence signals won at{' '}
              <strong>{winRate}%</strong>
              {' '}
              {Math.abs(parseFloat(winRate) - metrics.avg_confidence * 100) < 5 ? (
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                  Well-Calibrated
                </Badge>
              ) : (
                <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Adjusting
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
