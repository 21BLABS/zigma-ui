import React from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceIntervalProps {
  mean: number;
  lower: number;
  upper: number;
  label?: string;
}

export const ConfidenceInterval: React.FC<ConfidenceIntervalProps> = ({
  mean,
  lower,
  upper,
  label = 'Confidence Interval (95%)'
}) => {
  // Normalize to 0-100 scale
  const range = upper - lower;
  const meanPosition = ((mean - lower) / range) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
      
      <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden">
        {/* Confidence interval bar */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-gradient-to-r from-blue-500/30 via-blue-400/50 to-blue-500/30 rounded-full">
          {/* Mean indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-green-400 rounded-full"
            style={{ left: `${meanPosition}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-green-500/20 border border-green-500/30 px-2 py-1 rounded text-xs text-green-400 font-semibold">
                {mean.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Lower bound */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 px-2">
          <div className="text-xs text-blue-400 font-semibold">
            {lower.toFixed(1)}%
          </div>
        </div>
        
        {/* Upper bound */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 px-2">
          <div className="text-xs text-blue-400 font-semibold">
            {upper.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        Range: {(upper - lower).toFixed(1)}% spread
      </div>
    </div>
  );
};
