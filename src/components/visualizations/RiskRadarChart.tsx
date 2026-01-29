import React from 'react';
import { cn } from '@/lib/utils';

interface RiskDimension {
  name: string;
  value: number; // 0-100
  color?: string;
}

interface RiskRadarChartProps {
  dimensions: RiskDimension[];
  size?: number;
}

export const RiskRadarChart: React.FC<RiskRadarChartProps> = ({
  dimensions,
  size = 200
}) => {
  const center = size / 2;
  const radius = size / 2 - 30;
  const numDimensions = dimensions.length;

  // Calculate points for the radar chart
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numDimensions - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  // Create polygon path for the data
  const dataPoints = dimensions.map((dim, i) => getPoint(i, dim.value));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Create background grid circles
  const gridCircles = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grid circles */}
        {gridCircles.map((percent, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={(percent / 100) * radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-700"
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {dimensions.map((dim, i) => {
          const endPoint = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-600"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          className="text-green-400 fill-green-400/20"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="currentColor"
            className="text-green-400"
          />
        ))}

        {/* Labels */}
        {dimensions.map((dim, i) => {
          const labelPoint = getPoint(i, 115);
          const angle = (Math.PI * 2 * i) / numDimensions - Math.PI / 2;
          
          // Adjust text anchor based on position
          let textAnchor = 'middle';
          if (Math.cos(angle) > 0.5) textAnchor = 'start';
          if (Math.cos(angle) < -0.5) textAnchor = 'end';

          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={textAnchor}
              className="text-xs fill-green-100 font-semibold"
              dominantBaseline="middle"
            >
              {dim.name}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {dimensions.map((dim, i) => (
          <div key={i} className="flex items-center justify-between gap-2 px-2 py-1 bg-black/40 rounded">
            <span className="text-muted-foreground">{dim.name}</span>
            <span className="text-green-400 font-semibold">{dim.value.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
