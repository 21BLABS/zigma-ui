import React from 'react';
import { cn } from '@/lib/utils';

interface NewsItem {
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  source?: string;
}

interface NewsSentimentTimelineProps {
  news: NewsItem[];
  maxItems?: number;
}

export const NewsSentimentTimeline: React.FC<NewsSentimentTimelineProps> = ({
  news,
  maxItems = 5
}) => {
  const displayNews = news.slice(0, maxItems);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500 border-green-400 text-green-400';
      case 'negative':
        return 'bg-red-500 border-red-400 text-red-400';
      default:
        return 'bg-gray-500 border-gray-400 text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      default:
        return '📊';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Calculate sentiment distribution
  const sentimentCounts = displayNews.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = displayNews.length;
  const positivePercent = ((sentimentCounts.positive || 0) / total) * 100;
  const negativePercent = ((sentimentCounts.negative || 0) / total) * 100;
  const neutralPercent = ((sentimentCounts.neutral || 0) / total) * 100;

  return (
    <div className="space-y-4">
      {/* Sentiment distribution bar */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          News Sentiment Distribution
        </div>
        <div className="flex h-4 rounded-full overflow-hidden bg-gray-800">
          {positivePercent > 0 && (
            <div
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${positivePercent}%` }}
              title={`${positivePercent.toFixed(0)}% Positive`}
            />
          )}
          {neutralPercent > 0 && (
            <div
              className="bg-gray-500 transition-all duration-500"
              style={{ width: `${neutralPercent}%` }}
              title={`${neutralPercent.toFixed(0)}% Neutral`}
            />
          )}
          {negativePercent > 0 && (
            <div
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${negativePercent}%` }}
              title={`${negativePercent.toFixed(0)}% Negative`}
            />
          )}
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-400">📈 {sentimentCounts.positive || 0} Positive</span>
          <span className="text-gray-400">📊 {sentimentCounts.neutral || 0} Neutral</span>
          <span className="text-red-400">📉 {sentimentCounts.negative || 0} Negative</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {displayNews.map((item, index) => (
          <div key={index} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm',
                getSentimentColor(item.sentiment)
              )}>
                {getSentimentIcon(item.sentiment)}
              </div>
              {index < displayNews.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-700 my-1"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-3">
              <div className="text-sm text-green-100 leading-relaxed">
                {item.title}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {item.source && <span>{item.source}</span>}
                <span>•</span>
                <span>{formatTimestamp(item.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
