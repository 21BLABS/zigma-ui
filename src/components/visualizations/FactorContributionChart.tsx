import React from 'react';
import { cn } from '@/lib/utils';

interface Factor {
  name: string;
  contribution: number; // -100 to +100
  description?: string;
}

interface FactorContributionChartProps {
  factors: Factor[];
  type?: 'pie' | 'bar';
}

export const FactorContributionChart: React.FC<FactorContributionChartProps> = ({
  factors,
  type = 'bar'
}) => {
  // Calculate total absolute contribution for pie chart
  const totalAbsContribution = factors.reduce((sum, f) => sum + Math.abs(f.contribution), 0);

  // Pie chart implementation
  if (type === 'pie') {
    const size = 200;
    const center = size / 2;
    const radius = size / 2 - 10;
    
    let currentAngle = -90; // Start at top

    const slices = factors.map((factor, i) => {
      const percentage = (Math.abs(factor.contribution) / totalAbsContribution) * 100;
      const sliceAngle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      currentAngle = endAngle;

      // Calculate path
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      
      const largeArc = sliceAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      const colors = [
        'fill-green-500',
        'fill-blue-500',
        'fill-yellow-500',
        'fill-purple-500',
        'fill-pink-500',
        'fill-orange-500'
      ];

      return {
        path: pathData,
        color: colors[i % colors.length],
        factor,
        percentage
      };
    });

    return (
      <div className="flex flex-col items-center gap-4">
        <svg width={size} height={size}>
          {slices.map((slice, i) => (
            <g key={i}>
              <title>{`${slice.factor.name}: ${slice.percentage.toFixed(1)}%`}</title>
              <path
                d={slice.path}
                className={cn(slice.color, 'stroke-black stroke-2 opacity-80 hover:opacity-100 transition-opacity')}
              />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={cn('w-3 h-3 rounded-full', slice.color)}></div>
              <span className="text-green-100">{slice.factor.name}</span>
              <span className="text-muted-foreground ml-auto">
                {slice.factor.contribution >= 0 ? '+' : ''}{slice.factor.contribution.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bar chart implementation
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">
        Factor Contributions
      </div>
      
      {factors.map((factor, i) => {
        const isPositive = factor.contribution >= 0;
        const absContribution = Math.abs(factor.contribution);
        const barWidth = (absContribution / 100) * 100; // Normalize to 0-100

        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-100 font-semibold">{factor.name}</span>
              <span className={cn(
                'font-bold',
                isPositive ? 'text-green-400' : 'text-red-400'
              )}>
                {isPositive ? '+' : ''}{factor.contribution.toFixed(1)}%
              </span>
            </div>
            
            {/* Bar */}
            <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
              {/* Center line */}
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600"></div>
              
              {/* Contribution bar */}
              <div
                className={cn(
                  'absolute top-0 h-full transition-all duration-500',
                  isPositive
                    ? 'bg-gradient-to-r from-green-500/50 to-green-400 left-1/2'
                    : 'bg-gradient-to-l from-red-500/50 to-red-400 right-1/2'
                )}
                style={{ width: `${barWidth / 2}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10"></div>
              </div>
            </div>
            
            {factor.description && (
              <div className="text-xs text-muted-foreground pl-2">
                {factor.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
