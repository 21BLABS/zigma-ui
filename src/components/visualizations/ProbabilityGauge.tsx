import React from 'react';
import { cn } from '@/lib/utils';

interface ProbabilityGaugeProps {
  probability: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({
  probability,
  label = 'Probability',
  size = 'md',
  showPercentage = true
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  // Calculate stroke dash array for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  // Determine color based on probability
  const getColor = (prob: number) => {
    if (prob >= 70) return 'text-green-400 stroke-green-400';
    if (prob >= 50) return 'text-yellow-400 stroke-yellow-400';
    return 'text-red-400 stroke-red-400';
  };

  const color = getColor(probability);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn('transition-all duration-1000 ease-out', color)}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {showPercentage && (
              <div className={cn('font-bold', textSizeClasses[size], color)}>
                {probability.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </div>
      {label && (
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
    </div>
  );
};
