import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryData {
  category: string;
  pnl: number;
  trades: number;
  winRate: number;
  volume: number;
}

interface CategoryPerformanceChartProps {
  categories?: CategoryData[];
}

export const CategoryPerformanceChart: React.FC<CategoryPerformanceChartProps> = ({
  categories = []
}) => {
  // Generate mock data if not provided
  const data = categories.length > 0 ? categories : generateMockCategoryData();
  
  const totalVolume = data.reduce((sum, cat) => sum + cat.volume, 0);
  const sortedByPnl = [...data].sort((a, b) => b.pnl - a.pnl);
  
  const colors = [
    { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
    { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' },
    { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
    { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
    { bg: 'bg-pink-500', text: 'text-pink-400', border: 'border-pink-500' },
    { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
  ];

  return (
    <Card className="bg-gray-900/80 border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-green-400" />
          Category Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual bars */}
          <div className="space-y-3">
            {sortedByPnl.map((category, index) => {
              const volumePercent = (category.volume / totalVolume) * 100;
              const color = colors[index % colors.length];
              const isProfitable = category.pnl >= 0;
              
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", color.bg)} />
                      <span className="font-medium text-white">{category.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.trades} trades
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{category.winRate.toFixed(1)}% WR</span>
                      <span className={cn(
                        "font-bold",
                        isProfitable ? "text-green-400" : "text-red-400"
                      )}>
                        {isProfitable ? '+' : ''}${category.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Volume bar */}
                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", color.bg)}
                      style={{ width: `${volumePercent}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>${category.volume.toFixed(0)} volume</span>
                    <span>{volumePercent.toFixed(1)}% of total</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary insights */}
          <div className="pt-4 border-t border-green-500/20 space-y-3">
            <div className="text-sm font-semibold text-white">📊 Category Insights</div>
            
            {sortedByPnl[0] && sortedByPnl[0].pnl > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-300">
                  <span className="font-semibold text-green-400">{sortedByPnl[0].category}</span> is your strongest category with 
                  <span className="font-semibold"> +${sortedByPnl[0].pnl.toFixed(2)}</span> profit and 
                  <span className="font-semibold"> {sortedByPnl[0].winRate.toFixed(1)}%</span> win rate.
                </div>
              </div>
            )}
            
            {sortedByPnl[sortedByPnl.length - 1] && sortedByPnl[sortedByPnl.length - 1].pnl < 0 && (
              <div className="flex items-start gap-2 text-sm">
                <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-300">
                  <span className="font-semibold text-red-400">{sortedByPnl[sortedByPnl.length - 1].category}</span> is underperforming with 
                  <span className="font-semibold"> ${sortedByPnl[sortedByPnl.length - 1].pnl.toFixed(2)}</span> loss.
                  {sortedByPnl[sortedByPnl.length - 1].winRate < 40 && (
                    <> Consider avoiding this category until you improve your strategy.</>
                  )}
                </div>
              </div>
            )}

            {data.length > 1 && (
              <div className="bg-black/40 rounded-lg p-3 text-xs text-gray-400">
                💡 <span className="font-semibold text-white">Recommendation:</span> Focus your capital on 
                <span className="font-semibold text-green-400"> {sortedByPnl[0]?.category}</span> where you have proven success, 
                and reduce exposure to underperforming categories.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function generateMockCategoryData(): CategoryData[] {
  return [
    { category: 'Sports', pnl: -2450.50, trades: 450, winRate: 38.2, volume: 85000 },
    { category: 'Politics', pnl: 125.75, trades: 85, winRate: 52.9, volume: 25000 },
    { category: 'Crypto', pnl: -180.25, trades: 120, winRate: 45.8, volume: 35000 },
    { category: 'Tech', pnl: 83.25, trades: 45, winRate: 66.7, volume: 12000 },
    { category: 'Entertainment', pnl: -45.80, trades: 95, winRate: 42.1, volume: 18000 },
  ];
}
