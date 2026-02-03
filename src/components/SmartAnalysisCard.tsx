import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink, TrendingUp, TrendingDown, AlertCircle, Clock, DollarSign, Users, Bookmark, Bell, Share2, RefreshCw, Activity, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveMarketTracking } from '@/hooks/useLiveMarketTracking';
import { ProbabilityGauge } from '@/components/visualizations/ProbabilityGauge';
import { EdgeMeter } from '@/components/visualizations/EdgeMeter';
import { RiskRadarChart } from '@/components/visualizations/RiskRadarChart';
import { ConfidenceInterval } from '@/components/visualizations/ConfidenceInterval';
import { NewsSentimentTimeline } from '@/components/visualizations/NewsSentimentTimeline';
import { FactorContributionChart } from '@/components/visualizations/FactorContributionChart';
import { SmartRecommendationPanel } from '@/components/trading/SmartRecommendationPanel';
import { MultiOutcomeMarketGrid } from '@/components/MultiOutcomeMarketGrid';

interface AnalysisSection {
  title: string;
  icon: React.ReactNode;
  content: string;
  defaultOpen?: boolean;
}

interface SmartAnalysisCardProps {
  content: string;
  recommendation?: {
    action?: string;
    confidence?: number;
    probability?: number;
    marketOdds?: number;
    effectiveEdge?: number;
  };
  market?: {
    id?: string;
    question?: string;
    url?: string;
  };
  allMarkets?: Array<{
    id?: string;
    question?: string;
    yesPrice?: number;
    noPrice?: number;
    liquidity?: number;
    volume24hr?: number;
    url?: string;
  }>;
  isMultiOutcome?: boolean;
  onSave?: () => void;
  onTrack?: () => void;
  onAlert?: () => void;
  onShare?: () => void;
  onRefresh?: () => void;
  onMarketSelect?: (market: any) => void;
}

export const SmartAnalysisCard: React.FC<SmartAnalysisCardProps> = ({
  content,
  recommendation,
  market,
  allMarkets,
  isMultiOutcome,
  onSave,
  onTrack,
  onAlert,
  onShare,
  onRefresh,
  onMarketSelect
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['market', 'recommendation']));
  
  // Debug logging for multi-outcome
  React.useEffect(() => {
    if (isMultiOutcome || allMarkets) {
      console.log('📊 SmartAnalysisCard multi-outcome props:', {
        isMultiOutcome,
        allMarketsCount: allMarkets?.length || 0,
        marketQuestion: market?.question
      });
    }
  }, [isMultiOutcome, allMarkets, market]);
  const [copiedToast, setCopiedToast] = useState(false);
  const [actionToast, setActionToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<{percent: number, direction: 'up' | 'down'} | null>(null);
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);
  const [showVisualizations, setShowVisualizations] = useState(false);
  const [showTradingTools, setShowTradingTools] = useState(false);

  // Live market tracking
  const { isConnected, latestUpdate, connectionError } = useLiveMarketTracking({
    marketId: market?.id,
    onUpdate: (update) => {
      setLivePrice(update.currentPrice * 100); // Convert to percentage
      if (update.fiveMinChange !== 0) {
        setPriceChange({
          percent: update.fiveMinChange,
          direction: update.isPriceUp ? 'up' : 'down'
        });
      }
      setShowLiveIndicator(true);
      setTimeout(() => setShowLiveIndicator(false), 1000);
    },
    onAlert: (alert) => {
      showToast(`🚨 ${alert.message}`, 'success');
    },
    onSignificantChange: (update) => {
      // Auto-refresh analysis on >5% move
      if (onRefresh && Math.abs(update.priceChangePercent) >= 5) {
        showToast(`🔄 Price moved ${update.priceChangePercent.toFixed(2)}% - Auto-refreshing analysis...`, 'success');
        setTimeout(() => onRefresh(), 2000);
      }
    }
  });

  // Parse the analysis content into sections
  const parseAnalysis = (text: string): AnalysisSection[] => {
    const sections: AnalysisSection[] = [];
    const lines = text.split('\n');
    let currentSection: AnalysisSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
          currentContent = [];
        }
        continue;
      }

      if (line.includes('📊 MARKET ANALYSIS')) {
        currentSection = { title: 'Market Analysis', icon: <TrendingUp className="w-4 h-4" />, content: '', defaultOpen: true };
      } else if (line.includes('🔍 FACTOR BREAKDOWN')) {
        currentSection = { title: 'Factor Breakdown', icon: <AlertCircle className="w-4 h-4" />, content: '' };
      } else if (line.includes('⚠️ RISK ASSESSMENT')) {
        currentSection = { title: 'Risk Assessment', icon: <AlertCircle className="w-4 h-4" />, content: '' };
      } else if (line.includes('📈 Market Stats')) {
        currentSection = { title: 'Market Stats', icon: <DollarSign className="w-4 h-4" />, content: '' };
      } else if (line.includes('🎲 ZIGMA RECOMMENDATION')) {
        currentSection = { title: 'Recommendation', icon: <TrendingUp className="w-4 h-4" />, content: '', defaultOpen: true };
      } else if (line.includes('💼 TRADING STRATEGY')) {
        currentSection = { title: 'Trading Strategy', icon: <DollarSign className="w-4 h-4" />, content: '' };
      } else if (line.includes('📰 NEWS SOURCES')) {
        currentSection = { title: 'News Sources', icon: <ExternalLink className="w-4 h-4" />, content: '' };
      } else if (line.includes('📜 HISTORICAL CONTEXT')) {
        currentSection = { title: 'Historical Context', icon: <Clock className="w-4 h-4" />, content: '' };
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection && currentContent.length > 0) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseAnalysis(content);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setActionToast({ message, type });
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleSaveAnalysis = async () => {
    if (onSave) {
      onSave();
      return;
    }

    setIsLoading(prev => ({ ...prev, save: true }));
    try {
      const response = await fetch('/api/chat/actions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).magic?.user?.getIdToken()}`
        },
        body: JSON.stringify({
          marketId: market?.id,
          marketQuestion: market?.question,
          analysis: recommendation,
          recommendation,
          content
        })
      });

      if (!response.ok) throw new Error('Failed to save analysis');
      
      const data = await response.json();
      showToast('✅ Analysis saved to watchlist!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showToast('❌ Failed to save analysis', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleTrackMarket = async () => {
    if (onTrack) {
      onTrack();
      return;
    }

    setIsLoading(prev => ({ ...prev, track: true }));
    try {
      const response = await fetch('/api/chat/actions/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).magic?.user?.getIdToken()}`
        },
        body: JSON.stringify({
          marketId: market?.id,
          marketQuestion: market?.question,
          initialOdds: recommendation?.marketOdds,
          targetOdds: recommendation?.probability,
          notes: `Edge: ${recommendation?.effectiveEdge?.toFixed(2)}%`
        })
      });

      if (!response.ok) throw new Error('Failed to track market');
      
      showToast('📊 Market added to tracker!', 'success');
    } catch (error) {
      console.error('Track error:', error);
      showToast('❌ Failed to track market', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, track: false }));
    }
  };

  const handleSetAlert = async () => {
    if (onAlert) {
      onAlert();
      return;
    }

    setIsLoading(prev => ({ ...prev, alert: true }));
    try {
      const targetOdds = recommendation?.probability || 0;
      const response = await fetch('/api/chat/actions/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).magic?.user?.getIdToken()}`
        },
        body: JSON.stringify({
          marketId: market?.id,
          marketQuestion: market?.question,
          alertType: 'price_above',
          threshold: targetOdds,
          message: `Alert when odds reach ${targetOdds.toFixed(1)}%`
        })
      });

      if (!response.ok) throw new Error('Failed to create alert');
      
      showToast('🔔 Alert created successfully!', 'success');
    } catch (error) {
      console.error('Alert error:', error);
      showToast('❌ Failed to create alert', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, alert: false }));
    }
  };

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    setIsLoading(prev => ({ ...prev, share: true }));
    try {
      const response = await fetch('/api/chat/actions/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).magic?.user?.getIdToken()}`
        },
        body: JSON.stringify({
          content,
          recommendation,
          market
        })
      });

      if (!response.ok) throw new Error('Failed to generate share link');
      
      const data = await response.json();
      await navigator.clipboard.writeText(data.shareUrl);
      showToast('📤 Share link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Share error:', error);
      showToast('❌ Failed to generate share link', 'error');
    } finally {
      setIsLoading(prev => ({ ...prev, share: false }));
    }
  };

  // Extract key metrics from recommendation
  const action = recommendation?.action || 'HOLD';
  const confidence = recommendation?.confidence || 0;
  const probability = recommendation?.probability || 0;
  const marketOdds = livePrice !== null ? livePrice : (recommendation?.marketOdds || 0);
  const edge = livePrice !== null ? probability - livePrice : (recommendation?.effectiveEdge || 0);

  // Determine action color
  const getActionColor = (action: string) => {
    if (action.includes('BUY YES')) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (action.includes('BUY NO')) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  };

  // Determine confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-green-400';
    if (conf >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Determine risk level from content
  const getRiskLevel = () => {
    const riskText = content.toLowerCase();
    if (riskText.includes('high') && riskText.includes('risk')) return { level: 'HIGH', color: 'text-red-400 bg-red-500/10' };
    if (riskText.includes('low') && riskText.includes('risk')) return { level: 'LOW', color: 'text-green-400 bg-green-500/10' };
    return { level: 'MODERATE', color: 'text-yellow-400 bg-yellow-500/10' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="space-y-4">
      {/* Multi-Outcome Market Grid - Show all outcomes if this is a multi-outcome event */}
      {isMultiOutcome && allMarkets && allMarkets.length > 0 && (
        <MultiOutcomeMarketGrid
          markets={allMarkets}
          onSelectMarket={(selectedMarket) => {
            console.log('[MULTI-OUTCOME] Selected market for analysis:', selectedMarket.question);
            // Update the main market and analysis to show the selected outcome
            if (onMarketSelect) {
              onMarketSelect(selectedMarket);
            }
          }}
        />
      )}

      {/* Header with Key Metrics */}
      <Card className="bg-gradient-to-br from-green-900/20 to-black border-green-500/30 relative">
        <CardContent className="p-6">
          {/* Live Indicator */}
          {isConnected && (
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                showLiveIndicator ? "bg-green-500/20 animate-pulse" : "bg-green-500/10"
              )}>
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-semibold">LIVE</span>
              </div>
              {priceChange && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                  priceChange.direction === 'up' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  {priceChange.direction === 'up' ? '↑' : '↓'} {Math.abs(priceChange.percent).toFixed(2)}% (5m)
                </div>
              )}
            </div>
          )}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {market?.question || 'Market Analysis'}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={cn('px-3 py-1 text-sm font-bold', getActionColor(action))}>
                  {action}
                </Badge>
                <Badge className={cn('px-3 py-1 text-sm', riskLevel.color)}>
                  {riskLevel.level} RISK
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className={cn('text-3xl font-bold', getConfidenceColor(confidence))}>
                {confidence.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
          </div>

          {/* Visual Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {/* Probability Gauge */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">Zigma Odds</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{ width: `${probability}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-green-400">{probability.toFixed(1)}%</span>
              </div>
            </div>

            {/* Market Odds */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">Market Odds</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${marketOdds}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-blue-400">{marketOdds.toFixed(1)}%</span>
              </div>
            </div>

            {/* Edge Meter */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">Effective Edge</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all duration-500',
                      edge >= 5 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      edge >= 2 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    )}
                    style={{ width: `${Math.min(Math.abs(edge) * 10, 100)}%` }}
                  />
                </div>
                <span className={cn(
                  'text-sm font-semibold',
                  edge >= 5 ? 'text-green-400' :
                  edge >= 2 ? 'text-yellow-400' :
                  'text-red-400'
                )}>
                  {edge >= 0 ? '+' : ''}{edge.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          onClick={() => setShowVisualizations(!showVisualizations)}
          variant="outline"
          size="sm"
          className="border-purple-500/30 hover:bg-purple-500/10 text-purple-400"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {showVisualizations ? 'Hide' : 'Show'} Visualizations
        </Button>
        <Button
          onClick={() => setShowTradingTools(!showTradingTools)}
          variant="outline"
          size="sm"
          className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
        >
          <Activity className="w-4 h-4 mr-2" />
          {showTradingTools ? 'Hide' : 'Show'} Trading Tools
        </Button>
      </div>

      {/* Advanced Visualizations */}
      {showVisualizations && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-black/40 border border-green-500/20 rounded-lg">
          {/* Probability Gauges */}
          <div className="flex justify-around">
            <ProbabilityGauge
              probability={probability}
              label="Zigma Probability"
              size="md"
            />
            <ProbabilityGauge
              probability={marketOdds}
              label="Market Odds"
              size="md"
            />
          </div>

          {/* Edge Meter */}
          <div>
            <EdgeMeter edge={edge} />
          </div>

          {/* Confidence Interval */}
          <div>
            <ConfidenceInterval
              mean={probability}
              lower={Math.max(0, probability - 10)}
              upper={Math.min(100, probability + 10)}
            />
          </div>

          {/* Risk Radar Chart */}
          <div>
            <RiskRadarChart
              dimensions={[
                { name: 'Liquidity', value: 75 },
                { name: 'Volatility', value: 60 },
                { name: 'News Impact', value: 80 },
                { name: 'Time Decay', value: 45 },
                { name: 'Market Depth', value: 70 }
              ]}
              size={180}
            />
          </div>

          {/* Factor Contribution */}
          <div className="md:col-span-2">
            <FactorContributionChart
              factors={[
                { name: 'News Sentiment', contribution: 35, description: 'Recent positive news coverage' },
                { name: 'Market Momentum', contribution: 25, description: 'Strong buying pressure' },
                { name: 'Historical Trends', contribution: 15, description: 'Consistent upward pattern' },
                { name: 'Expert Analysis', contribution: -10, description: 'Some skepticism from analysts' },
                { name: 'Social Signals', contribution: 20, description: 'High engagement on social media' }
              ]}
              type="bar"
            />
          </div>

          {/* News Sentiment Timeline */}
          <div className="md:col-span-2">
            <NewsSentimentTimeline
              news={[
                { title: 'Major development announced', sentiment: 'positive', timestamp: new Date(Date.now() - 3600000).toISOString(), source: 'Reuters' },
                { title: 'Market analysis shows strong indicators', sentiment: 'positive', timestamp: new Date(Date.now() - 7200000).toISOString(), source: 'Bloomberg' },
                { title: 'Expert raises concerns about volatility', sentiment: 'negative', timestamp: new Date(Date.now() - 10800000).toISOString(), source: 'WSJ' },
                { title: 'Trading volume reaches new high', sentiment: 'neutral', timestamp: new Date(Date.now() - 14400000).toISOString(), source: 'CNBC' }
              ]}
              maxItems={4}
            />
          </div>
        </div>
      )}

      {/* Trading Tools */}
      {showTradingTools && (
        <div className="p-6 bg-black/40 border border-blue-500/20 rounded-lg">
          <SmartRecommendationPanel
            probability={probability}
            marketOdds={marketOdds}
            edge={edge}
            action={action}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        <Button 
          onClick={handleSaveAnalysis}
          variant="outline" 
          size="sm"
          disabled={isLoading.save}
          className="border-green-500/30 hover:bg-green-500/10 text-green-400 disabled:opacity-50"
        >
          <Bookmark className="w-4 h-4 mr-2" />
          {isLoading.save ? 'Saving...' : 'Save Analysis'}
        </Button>
        <Button 
          onClick={handleTrackMarket}
          variant="outline" 
          size="sm"
          disabled={isLoading.track}
          className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400 disabled:opacity-50"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {isLoading.track ? 'Tracking...' : 'Track Market'}
        </Button>
        <Button 
          onClick={handleSetAlert}
          variant="outline" 
          size="sm"
          disabled={isLoading.alert}
          className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400 disabled:opacity-50"
        >
          <Bell className="w-4 h-4 mr-2" />
          {isLoading.alert ? 'Creating...' : 'Set Alert'}
        </Button>
        <Button 
          onClick={handleShare}
          variant="outline" 
          size="sm"
          disabled={isLoading.share}
          className="border-purple-500/30 hover:bg-purple-500/10 text-purple-400 disabled:opacity-50"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {isLoading.share ? 'Sharing...' : 'Share'}
        </Button>
        <Button 
          onClick={onRefresh}
          variant="outline" 
          size="sm"
          className="border-gray-500/30 hover:bg-gray-500/10 text-gray-400"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button 
          onClick={handleCopy}
          variant="outline" 
          size="sm"
          className="border-gray-500/30 hover:bg-gray-500/10 text-gray-400"
        >
          📋 Copy
        </Button>
      </div>

      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
          ✅ Copied to clipboard
        </div>
      )}

      {actionToast && (
        <div className={cn(
          "fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 z-50",
          actionToast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        )}>
          {actionToast.message}
        </div>
      )}

      {/* Collapsible Sections */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const isExpanded = expandedSections.has(section.title);
          
          return (
            <Card 
              key={idx}
              className="bg-black/40 border-green-500/20 hover:border-green-500/40 transition-colors"
            >
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-green-500/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="text-green-400">
                    {section.icon}
                  </div>
                  <span className="font-semibold text-green-100">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-green-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-green-400" />
                )}
              </button>
              
              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="text-sm text-green-100/80 whitespace-pre-wrap leading-relaxed border-t border-green-500/10 pt-3">
                    {section.content}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Market Links */}
      <div className="flex flex-wrap gap-3">
        {market?.url && (
          <a
            href={market.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on Polymarket
          </a>
        )}
        {market?.url && recommendation?.action && (
          <a
            href={`${market.url}?action=${recommendation.action.includes('YES') ? 'buy_yes' : 'buy_no'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors font-semibold"
          >
            🎯 Execute Trade on Polymarket
          </a>
        )}
      </div>
    </div>
  );
};
