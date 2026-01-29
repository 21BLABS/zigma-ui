import React from 'react';
import { cn } from '@/lib/utils';

interface EdgeMeterProps {
  edge: number;
  label?: string;
  showValue?: boolean;
}

export const EdgeMeter: React.FC<EdgeMeterProps> = ({
  edge,
  label = 'Effective Edge',
  showValue = true
}) => {
  // Normalize edge to 0-100 scale (assuming edge range is -20 to +20)
  const normalizedEdge = Math.max(0, Math.min(100, ((edge + 20) / 40) * 100));
  
  // Determine zone and color
  const getZoneInfo = (edgeValue: number) => {
    if (edgeValue >= 10) return { zone: 'Excellent', color: 'bg-green-500', textColor: 'text-green-400' };
    if (edgeValue >= 5) return { zone: 'Strong', color: 'bg-green-400', textColor: 'text-green-400' };
    if (edgeValue >= 2) return { zone: 'Good', color: 'bg-yellow-400', textColor: 'text-yellow-400' };
    if (edgeValue >= 0) return { zone: 'Neutral', color: 'bg-gray-400', textColor: 'text-gray-400' };
    if (edgeValue >= -2) return { zone: 'Weak', color: 'bg-orange-400', textColor: 'text-orange-400' };
    return { zone: 'Poor', color: 'bg-red-500', textColor: 'text-red-400' };
  };

  const zoneInfo = getZoneInfo(edge);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
          {showValue && (
            <span className={cn('text-sm font-bold', zoneInfo.textColor)}>
              {edge >= 0 ? '+' : ''}{edge.toFixed(2)}%
            </span>
          )}
        </div>
      )}
      
      {/* Meter bar */}
      <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
        {/* Zone markers */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-gray-700" title="Poor (-20 to -2%)"></div>
          <div className="flex-1 border-r border-gray-700" title="Weak (-2 to 0%)"></div>
          <div className="flex-1 border-r border-gray-700" title="Neutral (0 to 2%)"></div>
          <div className="flex-1 border-r border-gray-700" title="Good (2 to 5%)"></div>
          <div className="flex-1 border-r border-gray-700" title="Strong (5 to 10%)"></div>
          <div className="flex-1" title="Excellent (10%+)"></div>
        </div>
        
        {/* Progress fill */}
        <div
          className={cn(
            'absolute top-0 left-0 h-full transition-all duration-1000 ease-out',
            zoneInfo.color
          )}
          style={{ width: `${normalizedEdge}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
        </div>
        
        {/* Center line (neutral point) */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/30"></div>
      </div>
      
      {/* Zone labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Poor</span>
        <span>Neutral</span>
        <span>Excellent</span>
      </div>
      
      {/* Current zone badge */}
      <div className="text-center">
        <span className={cn('inline-block px-3 py-1 rounded-full text-xs font-semibold', zoneInfo.textColor, zoneInfo.color.replace('bg-', 'bg-') + '/20')}>
          {zoneInfo.zone} Edge
        </span>
      </div>
    </div>
  );
};
