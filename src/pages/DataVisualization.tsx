import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { exportToJSON } from "@/utils/export";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface PriceHistory {
  timestamp: string;
  price: number;
}

interface EdgeDistribution {
  range: string;
  count: number;
}

interface ConfidenceData {
  low: number;
  medium: number;
  high: number;
}

interface RiskMetrics {
  overallRisk: number;
  volatility: number;
  concentration: number;
  liquidity: number;
}

const COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7'
};

const DataVisualization = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

  const { data: priceHistory, isLoading: priceLoading } = useQuery<PriceHistory[]>({
    queryKey: ["price-history"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/visualization/price-history`);
      if (!res.ok) throw new Error("Failed to fetch price history");
      return res.json();
    },
    refetchInterval: 30000,
    enabled: !!apiBaseUrl,
  });

  const { data: edgeDistribution, isLoading: edgeLoading } = useQuery<EdgeDistribution[]>({
    queryKey: ["edge-distribution"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/visualization/edge-distribution`);
      if (!res.ok) throw new Error("Failed to fetch edge distribution");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: confidenceData, isLoading: confLoading } = useQuery<ConfidenceData>({
    queryKey: ["confidence-data"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/visualization/confidence`);
      if (!res.ok) throw new Error("Failed to fetch confidence data");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { data: riskMetrics, isLoading: riskLoading } = useQuery<RiskMetrics>({
    queryKey: ["risk-metrics"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/visualization/risk-metrics`);
      if (!res.ok) throw new Error("Failed to fetch risk metrics");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const confidencePieData = confidenceData ? [
    { name: 'Low (0-50%)', value: confidenceData.low, color: COLORS.red },
    { name: 'Medium (50-75%)', value: confidenceData.medium, color: COLORS.yellow },
    { name: 'High (75-100%)', value: confidenceData.high, color: COLORS.green }
  ] : [];

  const getRiskColor = (risk: number) => {
    if (risk < 30) return COLORS.green;
    if (risk < 60) return COLORS.yellow;
    return COLORS.red;
  };

  const getRiskLabel = (risk: number) => {
    if (risk < 30) return 'LOW';
    if (risk < 60) return 'MEDIUM';
    return 'HIGH';
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold tracking-tight mb-2">DATA VISUALIZATION</h1>
            {(priceHistory || edgeDistribution || confidenceData || riskMetrics) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const exportData = {
                    priceHistory,
                    edgeDistribution,
                    confidenceData,
                    riskMetrics,
                    exportedAt: new Date().toISOString()
                  };
                  exportToJSON(exportData, `zigma-visualization-${new Date().toISOString().split('T')[0]}`);
                }}
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Export Data
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">Real-time charts and visual analytics</p>
        </div>

        {/* Real-time Price Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Signal Price History
          </h2>
          
          <Card className="border-green-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-sm text-green-400">Market Odds Over Time</CardTitle>
              <CardDescription>Historical price movement for recent signals</CardDescription>
            </CardHeader>
            <CardContent>
              {priceLoading ? (
                <Skeleton className="h-64 bg-green-500/10" />
              ) : priceHistory && priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22c55e20" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#22c55e60"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="#22c55e60" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', border: '1px solid #22c55e30' }}
                      labelStyle={{ color: '#22c55e' }}
                      formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    />
                    <Area type="monotone" dataKey="price" stroke={COLORS.green} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No price history available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edge Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Edge Distribution
          </h2>
          
          <Card className="border-green-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-sm text-green-400">Signal Edge Distribution</CardTitle>
              <CardDescription>Frequency of signal edge ranges</CardDescription>
            </CardHeader>
            <CardContent>
              {edgeLoading ? (
                <Skeleton className="h-64 bg-green-500/10" />
              ) : edgeDistribution && edgeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={edgeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22c55e20" />
                    <XAxis dataKey="range" stroke="#22c55e60" />
                    <YAxis stroke="#22c55e60" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', border: '1px solid #22c55e30' }}
                      labelStyle={{ color: '#22c55e' }}
                    />
                    <Bar dataKey="count" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No edge distribution data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Confidence Gauge & Risk Meter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Confidence Gauge */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Confidence Distribution
            </h2>
            
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Signal Confidence Levels</CardTitle>
                <CardDescription>Breakdown by confidence range</CardDescription>
              </CardHeader>
              <CardContent>
                {confLoading ? (
                  <Skeleton className="h-64 bg-green-500/10" />
                ) : confidencePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={confidencePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {confidencePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000000', border: '1px solid #22c55e30' }}
                        labelStyle={{ color: '#22c55e' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No confidence data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Meter */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Risk Meter
            </h2>
            
            <Card className="border-green-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Overall Risk Assessment</CardTitle>
                <CardDescription>Current risk level based on multiple factors</CardDescription>
              </CardHeader>
              <CardContent>
                {riskLoading ? (
                  <Skeleton className="h-64 bg-green-500/10" />
                ) : riskMetrics ? (
                  <div className="space-y-6">
                    {/* Overall Risk Gauge */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#22c55e20"
                            strokeWidth="10"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={getRiskColor(riskMetrics.overallRisk)}
                            strokeWidth="10"
                            strokeDasharray={`${(riskMetrics.overallRisk / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold" style={{ color: getRiskColor(riskMetrics.overallRisk) }}>
                            {riskMetrics.overallRisk.toFixed(0)}
                          </span>
                          <span className="text-sm text-muted-foreground">Risk Score</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span 
                          className="px-4 py-2 rounded-full text-sm font-bold"
                          style={{ 
                            backgroundColor: `${getRiskColor(riskMetrics.overallRisk)}20`,
                            color: getRiskColor(riskMetrics.overallRisk)
                          }}
                        >
                          {getRiskLabel(riskMetrics.overallRisk)} RISK
                        </span>
                      </div>
                    </div>

                    {/* Risk Components */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Volatility</span>
                          <span>{riskMetrics.volatility.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${riskMetrics.volatility}%`,
                              backgroundColor: getRiskColor(riskMetrics.volatility)
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Concentration</span>
                          <span>{riskMetrics.concentration.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${riskMetrics.concentration}%`,
                              backgroundColor: getRiskColor(riskMetrics.concentration)
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Liquidity Risk</span>
                          <span>{riskMetrics.liquidity.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${riskMetrics.liquidity}%`,
                              backgroundColor: getRiskColor(riskMetrics.liquidity)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No risk metrics available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DataVisualization;
