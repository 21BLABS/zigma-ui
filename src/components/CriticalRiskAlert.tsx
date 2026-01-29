import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CriticalRiskAlertProps {
  topPositionExposure: number;
  diversificationScore: number;
  maxDrawdownRisk?: number;
}

export const CriticalRiskAlert: React.FC<CriticalRiskAlertProps> = ({
  topPositionExposure,
  diversificationScore,
  maxDrawdownRisk
}) => {
  const hasCriticalRisk = topPositionExposure > 50 || diversificationScore < 20 || (maxDrawdownRisk && maxDrawdownRisk > 40);
  const hasHighRisk = topPositionExposure > 30 || diversificationScore < 40 || (maxDrawdownRisk && maxDrawdownRisk > 25);

  if (!hasCriticalRisk && !hasHighRisk) return null;

  const severity = hasCriticalRisk ? 'critical' : 'high';

  return (
    <Card className={cn(
      "border-2 animate-pulse",
      severity === 'critical' ? "bg-red-950/50 border-red-500" : "bg-orange-950/50 border-orange-500"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-full",
            severity === 'critical' ? "bg-red-500/20" : "bg-orange-500/20"
          )}>
            {severity === 'critical' ? (
              <XCircle className="w-8 h-8 text-red-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={cn(
                "text-xl font-bold",
                severity === 'critical' ? "text-red-300" : "text-orange-300"
              )}>
                {severity === 'critical' ? '🚨 CRITICAL RISK DETECTED' : '⚠️ HIGH RISK WARNING'}
              </h3>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase",
                severity === 'critical' ? "bg-red-500 text-white" : "bg-orange-500 text-white"
              )}>
                IMMEDIATE ACTION REQUIRED
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {topPositionExposure > 50 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">
                      Extreme Position Concentration: {topPositionExposure.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-300">
                      {topPositionExposure > 80 ? (
                        <>You have <span className="font-bold text-red-400">{topPositionExposure.toFixed(1)}%</span> of your portfolio in a single position. This is extremely dangerous. Recommended maximum: 25%.</>
                      ) : (
                        <>Your largest position represents <span className="font-bold text-red-400">{topPositionExposure.toFixed(1)}%</span> of your portfolio. Reduce to under 25% immediately.</>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {topPositionExposure > 30 && topPositionExposure <= 50 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">
                      High Position Concentration: {topPositionExposure.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-300">
                      Your largest position is {topPositionExposure.toFixed(1)}% of your portfolio. Consider reducing to under 25%.
                    </div>
                  </div>
                </div>
              )}

              {diversificationScore < 20 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">
                      Poor Diversification: {diversificationScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-300">
                      Your portfolio is severely under-diversified. Spread your capital across at least 10-15 different markets.
                    </div>
                  </div>
                </div>
              )}

              {diversificationScore >= 20 && diversificationScore < 40 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">
                      Low Diversification: {diversificationScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-300">
                      Improve diversification by spreading capital across more markets. Target: 60%+
                    </div>
                  </div>
                </div>
              )}

              {maxDrawdownRisk && maxDrawdownRisk > 40 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">
                      Extreme Drawdown Risk: {maxDrawdownRisk.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-300">
                      You could lose up to {maxDrawdownRisk.toFixed(1)}% of your portfolio. Cut losing positions immediately.
                    </div>
                  </div>
                </div>
              )}

              {maxDrawdownRisk && maxDrawdownRisk > 25 && maxDrawdownRisk <= 40 && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">
                      High Drawdown Risk: {maxDrawdownRisk.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-300">
                      Potential loss exposure is high. Review and reduce losing positions.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={cn(
              "p-4 rounded-lg border-l-4",
              severity === 'critical' ? "bg-red-900/30 border-red-500" : "bg-orange-900/30 border-orange-500"
            )}>
              <div className="font-semibold text-white mb-2">📋 Recommended Actions:</div>
              <ol className="space-y-2 text-sm text-gray-300">
                {topPositionExposure > 50 && (
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Immediately reduce your largest position to maximum 25% of portfolio value</span>
                  </li>
                )}
                {diversificationScore < 40 && (
                  <li className="flex gap-2">
                    <span className="font-bold">{topPositionExposure > 50 ? '2' : '1'}.</span>
                    <span>Diversify across at least 10-15 different markets in different categories</span>
                  </li>
                )}
                <li className="flex gap-2">
                  <span className="font-bold">{topPositionExposure > 50 && diversificationScore < 40 ? '3' : topPositionExposure > 50 || diversificationScore < 40 ? '2' : '1'}.</span>
                  <span>Set stop-loss orders on all positions to limit downside risk</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">{topPositionExposure > 50 && diversificationScore < 40 ? '4' : topPositionExposure > 50 || diversificationScore < 40 ? '3' : '2'}.</span>
                  <span>Review your position sizing strategy - never risk more than 2-5% per trade</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
