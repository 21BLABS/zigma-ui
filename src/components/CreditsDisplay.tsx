import React from 'react';
import { Coins, TrendingUp, Clock } from 'lucide-react';

interface CreditsDisplayProps {
  currentCredits: number;
  totalCreditsEarned: number;
  creditsPerChat: number;
  lastChatAt?: string;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({
  currentCredits,
  totalCreditsEarned,
  creditsPerChat,
  lastChatAt
}) => {
  const isLowCredits = currentCredits < 5;
  const isOutOfCredits = currentCredits === 0;

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className={`rounded-lg border p-4 ${
      isOutOfCredits 
        ? 'bg-red-900/20 border-red-500/30' 
        : isLowCredits 
          ? 'bg-yellow-900/20 border-yellow-500/30' 
          : 'bg-green-900/20 border-green-500/30'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className={`w-5 h-5 ${
            isOutOfCredits ? 'text-red-400' : isLowCredits ? 'text-yellow-400' : 'text-green-400'
          }`} />
          <h3 className={`font-semibold ${
            isOutOfCredits ? 'text-red-400' : isLowCredits ? 'text-yellow-400' : 'text-green-400'
          }`}>
            Chat Credits
          </h3>
        </div>
        <div className={`text-2xl font-bold ${
          isOutOfCredits ? 'text-red-400' : isLowCredits ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {currentCredits}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Credits per chat:</span>
          <span className="text-white font-medium">-{creditsPerChat}</span>
        </div>
        
        {totalCreditsEarned > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Total earned:
            </span>
            <span className="text-white font-medium">{totalCreditsEarned}</span>
          </div>
        )}
        
        {lastChatAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last chat:
            </span>
            <span className="text-gray-300">{formatTimeAgo(lastChatAt)}</span>
          </div>
        )}
      </div>

      {/* Status Message */}
      {isOutOfCredits && (
        <div className="mt-3 pt-3 border-t border-red-500/30">
          <p className="text-red-400 text-sm font-medium">
            ⚠️ Out of credits! Purchase more to continue chatting.
          </p>
        </div>
      )}
      
      {isLowCredits && !isOutOfCredits && (
        <div className="mt-3 pt-3 border-t border-yellow-500/30">
          <p className="text-yellow-400 text-sm">
            ⚡ Low on credits! Consider topping up soon.
          </p>
        </div>
      )}
    </div>
  );
};
