import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Award, 
  Target, 
  Activity,
  PieChart,
  BarChart3,
  Download,
  Share2,
  ExternalLink,
  DollarSign,
  Percent,
  Clock,
  Users,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CriticalRiskAlert } from './CriticalRiskAlert';
import { PnLTrendChart } from './PnLTrendChart';
import { CategoryPerformanceChart } from './CategoryPerformanceChart';
import { PositionTable } from './PositionTable';

interface UserProfileCardProps {
  userProfile: {
    maker: string;
    profile?: any;
    metrics: {
      totalPositions: number;
      totalTrades: number;
      realizedPnl: number;
      unrealizedPnl: number;
      totalVolume: number;
      winRate: number;
      balance: number;
      averagePositionSize: number;
      topMarkets?: Array<{ title: string; pnl: number }>;
      recentActivity?: Array<{ side: string; size: number; price: number; title: string }>;
    };
    positions?: any[];
    activity?: any[];
  };
  content: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ userProfile, content }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { maker, metrics, positions = [], activity = [] } = userProfile;

  // Debug logging
  console.log('[UserProfileCard] Received data:', {
    maker,
    metricsKeys: Object.keys(metrics || {}),
    winRate: metrics?.winRate,
    totalTrades: metrics?.totalTrades,
    positionsCount: positions?.length,
    activityCount: activity?.length
  });

  // Safety check for metrics
  if (!metrics) {
    return (
      <Card className="bg-gray-900/80 border-red-500/20">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            Error: No metrics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract risk data from content (backend provides this in raw analysis)
  const extractRiskData = () => {
    const diversificationMatch = content.match(/Diversification:\s*(\d+\.?\d*)%/);
    const exposureMatch = content.match(/Top Position Exposure:\s*(\d+\.?\d*)%/);
    const drawdownMatch = content.match(/Drawdown.*?(\d+\.?\d*)%/);
    
    return {
      diversificationScore: diversificationMatch ? parseFloat(diversificationMatch[1]) : 50,
      topPositionExposure: exposureMatch ? parseFloat(exposureMatch[1]) : 0,
      maxDrawdownRisk: drawdownMatch ? parseFloat(drawdownMatch[1]) : undefined
    };
  };

  const riskData = extractRiskData();

  // Calculate derived metrics
  const totalPnl = metrics.realizedPnl + metrics.unrealizedPnl;
  const roi = metrics.totalVolume > 0 ? (totalPnl / metrics.totalVolume) * 100 : 0;
  const isProfitable = totalPnl > 0;
  
  // Portfolio health score (0-100)
  const healthScore = Math.max(0, Math.min(100, 
    (metrics.winRate * 0.4) + // 40% weight on win rate
    (isProfitable ? 30 : 0) + // 30% for profitability
    (Math.min(metrics.totalTrades / 100, 1) * 20) + // 20% for experience
    (Math.min(metrics.totalVolume / 100000, 1) * 10) // 10% for volume
  ));

  const getHealthGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 50) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const health = getHealthGrade(healthScore);

  // Risk assessment
  const getRiskLevel = () => {
    if (metrics.averagePositionSize > 1000) return { level: 'High', color: 'text-red-400', icon: '🔴' };
    if (metrics.averagePositionSize > 500) return { level: 'Moderate', color: 'text-yellow-400', icon: '🟡' };
    return { level: 'Low', color: 'text-green-400', icon: '🟢' };
  };

  const risk = getRiskLevel();

  // Trader classification
  const getTraderType = () => {
    if (isProfitable && metrics.winRate >= 55) return { type: '🌟 Elite Trader', desc: 'Consistently profitable with strong win rate' };
    if (isProfitable && metrics.winRate >= 45) return { type: '📈 Profitable Trader', desc: 'Positive returns with room for improvement' };
    if (!isProfitable && metrics.winRate >= 50) return { type: '🎯 Skilled but Risky', desc: 'Good win rate but needs better position sizing' };
    if (metrics.totalTrades < 50) return { type: '🌱 Beginner', desc: 'Building experience and learning' };
    return { type: '📉 Needs Improvement', desc: 'Focus on risk management and strategy' };
  };

  const traderType = getTraderType();

  const handleExport = () => {
    // Generate text report
    const report = `
ZIGMA USER PROFILE ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

Wallet: ${maker}
Balance: $${metrics.balance.toFixed(2)}
Health Grade: ${health.grade}

PERFORMANCE METRICS
Total Positions: ${metrics.totalPositions}
Total Trades: ${metrics.totalTrades}
Win Rate: ${metrics.winRate.toFixed(1)}%
Total Volume: $${metrics.totalVolume.toFixed(2)}
Realized P&L: $${metrics.realizedPnl.toFixed(2)}
Unrealized P&L: $${metrics.unrealizedPnl.toFixed(2)}
Total P&L: $${totalPnl.toFixed(2)}
ROI: ${roi.toFixed(2)}%

RISK ASSESSMENT
Diversification: ${riskData.diversificationScore.toFixed(0)}%
Top Position Exposure: ${riskData.topPositionExposure.toFixed(1)}%
Risk Level: ${risk.level}

${content}
    `.trim();

    // Create download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zigma-profile-${maker.slice(0, 8)}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const shareText = `Check out my Polymarket trading profile analyzed by Zigma AI!\n\nBalance: $${(metrics.balance / 1000).toFixed(1)}k\nWin Rate: ${metrics.winRate.toFixed(1)}%\nTotal Trades: ${metrics.totalTrades}\nGrade: ${health.grade}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Zigma Profile Analysis',
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Profile summary copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Risk Alert */}
      <CriticalRiskAlert
        topPositionExposure={riskData.topPositionExposure}
        diversificationScore={riskData.diversificationScore}
        maxDrawdownRisk={riskData.maxDrawdownRisk}
      />

      {/* Header Section */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/20 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">User Profile Analysis</h2>
                  <p className="text-sm text-gray-400 font-mono">{maker.slice(0, 6)}...{maker.slice(-4)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Badge className={cn("text-lg px-4 py-2", health.bg, health.color)}>
                  {health.grade} Grade
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {traderType.type}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-green-500/30" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="border-green-500/30" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400 uppercase">Balance</span>
              </div>
              <div className="text-2xl font-bold text-white">${(metrics.balance / 1000).toFixed(1)}k</div>
              <div className={cn("text-xs mt-1", isProfitable ? "text-green-400" : "text-red-400")}>
                {isProfitable ? '↗' : '↘'} ${Math.abs(totalPnl / 1000).toFixed(1)}k P&L
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 uppercase">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">{(metrics.winRate || 0).toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mt-1">
                {metrics.totalTrades} total trades
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase">Volume</span>
              </div>
              <div className="text-2xl font-bold text-white">${(metrics.totalVolume / 1000).toFixed(0)}k</div>
              <div className="text-xs text-gray-400 mt-1">
                {metrics.totalPositions} positions
              </div>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className={cn("w-4 h-4", risk.color)} />
                <span className="text-xs text-gray-400 uppercase">Risk Level</span>
              </div>
              <div className={cn("text-2xl font-bold", risk.color)}>{risk.level}</div>
              <div className="text-xs text-gray-400 mt-1">
                ${metrics.averagePositionSize.toFixed(0)} avg
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-green-500/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-gray-900/80 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Portfolio Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Overall Score</span>
                    <span className={cn("text-2xl font-bold", health.color)}>{healthScore.toFixed(0)}/100</span>
                  </div>
                  <Progress value={healthScore} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-500/20">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Win Rate Impact</div>
                    <Progress value={metrics.winRate} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{metrics.winRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Experience Level</div>
                    <Progress value={Math.min((metrics.totalTrades / 100) * 100, 100)} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{metrics.totalTrades} trades</div>
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{traderType.type.split(' ')[0]}</div>
                    <div>
                      <div className="font-semibold text-white">{traderType.type.split(' ').slice(1).join(' ')}</div>
                      <div className="text-sm text-gray-400 mt-1">{traderType.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Top Performing Markets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topMarkets?.slice(0, 5).map((market, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        idx === 1 ? "bg-gray-500/20 text-gray-400" :
                        idx === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-gray-700/20 text-gray-500"
                      )}>
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{market.title}</div>
                      </div>
                    </div>
                    <div className={cn(
                      "text-sm font-semibold",
                      market.pnl >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {market.pnl >= 0 ? '+' : ''}${market.pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <PnLTrendChart
            totalPnl={totalPnl}
            realizedPnl={metrics.realizedPnl}
            unrealizedPnl={metrics.unrealizedPnl}
          />
          
          <CategoryPerformanceChart />
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-4">
          <PositionTable positions={positions} />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="bg-gray-900/80 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.winRate < 50 && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-300">Improve Win Rate</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Your win rate of {(metrics.winRate || 0).toFixed(1)}% is below the 50% target. Focus on better market selection and entry timing.
                      </div>
                    </div>
                  </div>
                )}

                {!isProfitable && (
                  <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-300">Reduce Losses</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Total P&L is negative (${totalPnl.toFixed(2)}). Consider reducing position sizes and implementing stricter stop-losses.
                      </div>
                    </div>
                  </div>
                )}

                {metrics.averagePositionSize > 500 && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-yellow-300">High Position Sizes</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Average position of ${metrics.averagePositionSize.toFixed(0)} is high. Consider better risk management and position sizing.
                      </div>
                    </div>
                  </div>
                )}

                {isProfitable && metrics.winRate >= 50 && (
                  <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Award className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-300">Strong Performance</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Excellent work! You're profitable with a solid win rate. Continue your current strategy and consider scaling up gradually.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-sm">Raw Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-green-100 whitespace-pre-wrap font-mono leading-relaxed bg-black/40 p-4 rounded-lg">
                {content}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
