import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PnLDataPoint {
  date: string;
  value: number;
  cumulative: number;
}

interface PnLTrendChartProps {
  data?: PnLDataPoint[];
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
}

export const PnLTrendChart: React.FC<PnLTrendChartProps> = ({
  data = [],
  totalPnl,
  realizedPnl,
  unrealizedPnl
}) => {
  // Generate mock data if not provided (for now)
  const chartData = data.length > 0 ? data : generateMockPnLData(totalPnl);
  
  const maxValue = Math.max(...chartData.map(d => Math.abs(d.cumulative)));
  const minValue = Math.min(...chartData.map(d => d.cumulative));
  const range = maxValue - minValue || 1;

  const getYPosition = (value: number) => {
    return ((maxValue - value) / range) * 100;
  };

  const pathPoints = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const y = getYPosition(point.cumulative);
    return `${x},${y}`;
  }).join(' ');

  const isPositive = totalPnl >= 0;

  return (
    <Card className="bg-gray-900/80 border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            Profit & Loss Trend
          </span>
          <span className={cn(
            "text-2xl font-bold",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {isPositive ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative h-48 bg-black/40 rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Zero line */}
              <line
                x1="0"
                y1={getYPosition(0)}
                x2="100"
                y2={getYPosition(0)}
                stroke="#4B5563"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              
              {/* Area fill */}
              <polygon
                points={`0,${getYPosition(0)} ${pathPoints} 100,${getYPosition(0)}`}
                fill={isPositive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
              />
              
              {/* Line */}
              <polyline
                points={pathPoints}
                fill="none"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = getYPosition(point.cumulative);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="0.8"
                    fill={point.cumulative >= 0 ? "#22c55e" : "#ef4444"}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>${maxValue.toFixed(0)}</span>
              <span>$0</span>
              <span>${minValue.toFixed(0)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Realized</div>
              <div className={cn(
                "text-lg font-bold",
                realizedPnl >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
              </div>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Unrealized</div>
              <div className={cn(
                "text-lg font-bold",
                unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toFixed(2)}
              </div>
            </div>
            <div className="bg-black/40 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total</div>
              <div className={cn(
                "text-lg font-bold",
                totalPnl >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-black/40 rounded-lg p-3 text-sm">
            <div className="text-gray-400">
              {totalPnl < 0 ? (
                <>
                  Your portfolio has declined by <span className="font-bold text-red-400">${Math.abs(totalPnl).toFixed(2)}</span>.
                  {Math.abs(unrealizedPnl) > Math.abs(realizedPnl) * 2 && (
                    <> Most losses are unrealized - consider cutting losing positions before they worsen.</>
                  )}
                </>
              ) : (
                <>
                  Your portfolio has grown by <span className="font-bold text-green-400">${totalPnl.toFixed(2)}</span>.
                  {unrealizedPnl < 0 && Math.abs(unrealizedPnl) > realizedPnl * 0.5 && (
                    <> Watch unrealized losses - they could erode your gains.</>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function generateMockPnLData(totalPnl: number): PnLDataPoint[] {
  const points = 30;
  const data: PnLDataPoint[] = [];
  let cumulative = 0;
  
  for (let i = 0; i < points; i++) {
    const dailyChange = (totalPnl / points) + (Math.random() - 0.5) * (Math.abs(totalPnl) / 10);
    cumulative += dailyChange;
    
    const date = new Date();
    date.setDate(date.getDate() - (points - i));
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: dailyChange,
      cumulative: cumulative
    });
  }
  
  return data;
}
