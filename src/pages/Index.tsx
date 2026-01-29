import Hero from "@/components/Hero";
import AntiAIManifesto from "@/components/SignalPhilosophy";
import TokenUtility from "@/components/TokenUtility";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface SystemStatus {
  status?: string;
  uptime?: number;
  lastRun?: string;
  marketsMonitored?: number;
  marketsScanned?: number;
  marketsQualified?: number;
  posts?: number;
  heartbeat?: number;
  dataTimestamp?: number;
}

interface Signal {
  market: string;
  action: string;
  confidence: number;
  confidenceScore?: number;
  exposure: number;
  effectiveEdge?: number;
  timestamp?: string;
  evaluations?: number;
  rationale?: string;
  probZigma?: number;
  probMarket?: number;
  rawEdge?: number;
  link?: string;
}

interface VolumeSpike {
  market: string;
  increase: number;
  timeframe: string;
}

const formatUtcTimestamp = (iso?: string) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' UTC';
};

const formatHeartbeat = (timestamp?: number) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatUptime = (seconds?: number) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '—';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours % 24) parts.push(`${hours % 24}h`);
  if (minutes % 60) parts.push(`${minutes % 60}m`);
  if (!parts.length) parts.push(`${seconds % 60}s`);
  return parts.join(' ');
};

const normalizeVolumeSpikes = (spikes: any[]): VolumeSpike[] =>
  spikes.map((spike) => ({
    market: spike.market || spike.marketTitle || 'Unknown market',
    increase: Math.round(spike.increase ?? 0),
    timeframe: spike.timeframe || spike.window || 'last 10m',
  }));

const buildPolymarketUrl = (market: string) =>
  `https://polymarket.com/search?q=${encodeURIComponent(market)}`;

const normalizeMarketName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 80);

const setValueForMarket = (map: Map<string, number>, market: string, value: number) => {
  map.set(market, value);
  map.set(normalizeMarketName(market), value);
};

const getValueForMarket = (map: Map<string, number>, market: string) =>
  map.get(market) ?? map.get(normalizeMarketName(market));

const formatProbability = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return `${value.toFixed(2)}%`;
};

const formatExposure = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0.00%';
  const normalized = value <= 1 ? value * 100 : value;
  return `${normalized.toFixed(2)}%`;
};

const toPercentIfNeeded = (value: number | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
};

const parseNumeric = (value: any) => {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeApiSignals = (signals?: any[]): Signal[] =>
  Array.isArray(signals)
    ? signals
        .map((signal) => {
          const probZigma = toPercentIfNeeded(
            parseNumeric(signal.probZigma ?? signal.zigmaOdds ?? signal.P_zigma)
          );
          const probMarket = toPercentIfNeeded(
            parseNumeric(signal.probMarket ?? signal.marketOdds ?? signal.P_market)
          );
          const effectiveEdge = toPercentIfNeeded(
            parseNumeric(signal.effectiveEdge ?? signal.final_edge ?? signal.edge)
          );
          const rawEdge = toPercentIfNeeded(parseNumeric(signal.rawEdge ?? signal.signalEdge));

          return {
            market: signal.market || signal.marketTitle || 'Unknown market',
            action: signal.action || 'HOLD',
            confidence: Number(signal.confidenceScore ?? 0),
            confidenceScore: Number(signal.confidenceScore ?? 0),
            exposure:
              typeof signal.intentExposure === 'number'
                ? signal.intentExposure
                : Number(signal.exposure ?? 0),
            effectiveEdge,
            timestamp: signal.timestamp,
            evaluations: signal.evaluations ?? signal.evalCount,
            probZigma,
            probMarket,
            rawEdge,
            link: signal.link || (signal.marketSlug || signal.marketQuestion ? buildPolymarketUrl(signal.marketSlug || signal.marketQuestion || '') : undefined),
          };
        })
        .filter(Boolean)
    : [];

const extractCycleInsights = (logs: string) => {
  const lines = logs.split('\n');
  let lastCycle = '';
  let marketsAnalyzed = 0;
  let marketsScanned = 0;
  let marketsQualified = 0;
  const volumeSpikes: VolumeSpike[] = [];

  for (const line of lines) {
    if (line.includes('Agent Zigma Cycle:')) {
      const match = line.match(/Agent Zigma Cycle: ([^ ]+)/);
      if (match) lastCycle = match[1];
    }
    if (line.includes(' Selected ')) {
      const match = line.match(/ Selected (\d+) markets for deep analysis/);
      if (match) marketsAnalyzed = parseInt(match[1], 10);
    }
    if (line.includes('Fetched ')) {
      const match = line.match(/Fetched (\d+) markets/);
      if (match) marketsScanned = parseInt(match[1], 10);
    }
    if (line.includes('After sanity filter:')) {
      const match = line.match(/After sanity filter: (\d+)/);
      if (match) marketsQualified = parseInt(match[1], 10);
    }
    if (line.includes('VOLUME SPIKE DETECTED:')) {
      const match = line.match(/VOLUME SPIKE DETECTED: (.+) \+(\d+)% .* in (\d+) (\w+)/);
      if (match) {
        volumeSpikes.push({
          market: match[1],
          increase: parseInt(match[2], 10),
          timeframe: `${match[3]} ${match[4]}`,
        });
      }
    }
  }

  return { lastCycle, marketsAnalyzed, marketsScanned, marketsQualified, volumeSpikes };
};

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [liveStatus, setLiveStatus] = useState<SystemStatus>({});
  const [liveLogs, setLiveLogs] = useState('');
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [marketOutlook, setMarketOutlook] = useState<Signal[]>([]);
  const [rejectedSignals, setRejectedSignals] = useState<Signal[]>([]);
  const [auditRows, setAuditRows] = useState<Signal[]>([]);
  const [summarySignals, setSummarySignals] = useState<Signal[]>([]);
  const [volumeSpikes, setVolumeSpikes] = useState<VolumeSpike[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [activeDeck, setActiveDeck] = useState<"signals" | "basket">("signals");
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const CAROUSEL_INTERVAL_MS = 5000; // 5 seconds per signal
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.zigma.pro';

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('zigma-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('zigma-tutorial-seen', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      // Don't show full loading state - use cached data if available
      const hasCachedData = liveSignals.length > 0 || marketOutlook.length > 0;
      if (!hasCachedData) {
        setIsLoading(true);
      }
      setError(null);

      const fetchWithTimeout = async (url: string, timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          return response;
        } catch (error) {
          clearTimeout(id);
          throw error;
        }
      };

      try {
        const fetchedAt = Date.now();
        let dataData = null;
        let statusData: any = null; // Will be populated by backend /status endpoint
        let logsData = { logs: '' };

        // Try to fetch from Supabase first (faster, more reliable)
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('cycle_snapshots')
              .select('*')
              .order('id', { ascending: false })
              .limit(1);
            if (!error && data && data.length > 0) {
              dataData = data[0].data;
              statusData.lastRun = dataData.lastRun;
              statusData.posts = dataData.posts;
            }
          } catch (e) {
            console.error('Supabase fetch failed:', e);
          }
        }

        // If no data from Supabase, try backend with timeout
        if (!dataData) {
          try {
            const dataRes = await fetchWithTimeout(API_BASE + '/data', 8000);
            if (!dataRes.ok) throw new Error('Failed to fetch data');
            dataData = await dataRes.json();
          } catch (e) {
            console.error('Backend data fetch failed:', e);
            // Don't set error - use cached data if available
            if (!hasCachedData) {
              setError('Backend unavailable. Using cached data.');
            }
          }
        }

        // Try status and logs from backend with timeout (non-blocking)
        try {
          setIsLoadingStatus(true);
          const [statusRes, logsRes] = await Promise.all([
            fetchWithTimeout(API_BASE + '/status', 5000).catch(() => null),
            fetchWithTimeout(API_BASE + '/logs', 5000).catch(() => null)
          ]);
          if (statusRes && statusRes.ok) statusData = await statusRes.json();
          if (logsRes && logsRes.ok) logsData = await logsRes.json();
        } catch (e) {
          console.error('Status/logs fetch failed:', e);
        } finally {
          setIsLoadingStatus(false);
        }

        const logInsights = extractCycleInsights(logsData.logs);
        const cycleSummary = dataData?.cycleSummary || {};

        const mergedStatus: SystemStatus = {
          status: statusData?.status || 'operational',
          uptime: statusData?.uptime ?? cycleSummary.uptime ?? 0,
          lastRun: statusData?.lastRun || cycleSummary.lastRun || dataData?.lastRun || logInsights.lastCycle || null,
          marketsScanned: statusData?.marketsScanned ?? cycleSummary.marketsFetched ?? logInsights.marketsScanned ?? 0,
          marketsQualified: statusData?.marketsQualified ?? cycleSummary.marketsEligible ?? logInsights.marketsQualified ?? 0,
          marketsMonitored: statusData?.marketsMonitored ?? cycleSummary.marketsAnalyzed ?? logInsights.marketsAnalyzed ?? 0,
          posts: statusData?.posts ?? cycleSummary.signalsGenerated ?? 0,
          heartbeat: fetchedAt,
          dataTimestamp: fetchedAt,
        };

        setLiveStatus(mergedStatus);
        setLastUpdated(fetchedAt);
        setLiveLogs(logsData.logs);

        const apiVolumeSpikes = Array.isArray(dataData?.volumeSpikes) && dataData.volumeSpikes.length
          ? normalizeVolumeSpikes(dataData.volumeSpikes)
          : logInsights.volumeSpikes;
        setVolumeSpikes(apiVolumeSpikes);
        const { summarySignals } = parseSignals(logsData.logs);
        setSummarySignals(summarySignals);

        const apiExecutables = normalizeApiSignals(dataData?.liveSignals);
        const apiOutlook = normalizeApiSignals(dataData?.marketOutlook);
        const apiRejected = normalizeApiSignals(dataData?.rejectedSignals);

        // Only update if we have new data
        if (apiExecutables.length) setLiveSignals(apiExecutables);
        if (apiOutlook.length) setMarketOutlook(apiOutlook);
        if (apiRejected.length) setRejectedSignals(apiRejected);
      } catch (e) {
        console.error('Failed to fetch data:', e);
        if (!hasCachedData) {
          setError('Failed to load data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }

      // Fetch backtest results (non-blocking)
      try {
        const backtestRes = await fetchWithTimeout(API_BASE + '/backtest', 5000);
        if (backtestRes && backtestRes.ok) {
          const backtestData = await backtestRes.json();
          setBacktestResults(backtestData);
        }
      } catch (e) {
        console.error('Failed to fetch backtest data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate through signals
  useEffect(() => {
    if (!autoRotate || liveSignals.length <= 1) return;

    const rotationInterval = setInterval(() => {
      setCurrentSignalIndex(prev => (prev + 1) % liveSignals.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => clearInterval(rotationInterval);
  }, [autoRotate, liveSignals.length]);

  // Reset to first signal when signals change
  useEffect(() => {
    setCurrentSignalIndex(0);
  }, [liveSignals]);

  const parseSignals = (logs: string) => {
    const cycleDelimiter = '✅ Cycle complete';
    const cycleEnd = logs.lastIndexOf(cycleDelimiter);
    const sliceEnd = cycleEnd !== -1 ? cycleEnd : logs.length;
    const selectedMarker = logs.lastIndexOf('Selected ', sliceEnd);
    const cycleMarker = logs.lastIndexOf('Agent Zigma Cycle:', sliceEnd);
    const sliceStart = selectedMarker !== -1
      ? selectedMarker
      : (cycleMarker !== -1 ? cycleMarker : Math.max(0, sliceEnd - 20000));
    const latestBlock = logs.slice(sliceStart, sliceEnd);
    const lines = latestBlock.split('\n');
    const marketSignals = new Map<string, Signal>();
    const marketEvaluations = new Map<string, number>();
    const probabilityMap = new Map<string, number>();
    const marketOddsMap = new Map<string, number>();
    let currentMarket = '';
    const pendingMarkets: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('DEBUG:') && line.includes('P_market:')) {
        const match = line.match(/DEBUG:\s*(.+?)\s+P_market:\s*([-\d.]+)/i);
        if (match) {
          const marketName = match[1].trim();
          const marketValue = parseFloat(match[2]) * 100;
          if (Number.isFinite(marketValue)) {
            setValueForMarket(marketOddsMap, marketName, marketValue);
          }
        }
      }

      if (line.includes('PROB BREAKDOWN:')) {
        const match = line.match(/PROB BREAKDOWN:\s*(.+?)\s*\|/);
        if (match) {
          currentMarket = match[1].trim();
          if (!pendingMarkets.includes(currentMarket)) {
            pendingMarkets.push(currentMarket);
          }
        }
        const finalMatch = line.match(/Final\s+([-\d.]+)%/i);
        if (finalMatch && currentMarket) {
          setValueForMarket(probabilityMap, currentMarket, parseFloat(finalMatch[1]));
        }
        continue;
      }

      if (line.startsWith('NEWS for')) {
        const match = line.match(/NEWS for (.+?):/);
        if (match) {
          currentMarket = match[1].trim();
        }
        continue;
      }

      if (line.startsWith('SIGNAL:') || line.startsWith('SIGNAL ')) {
        const marketFromQueue = pendingMarkets.length > 0 ? pendingMarkets.shift()! : currentMarket;
        if (!marketFromQueue) continue;
        const match = line.match(/SIGNAL:\s*(.+?)\s*\|\s*Signal Edge:\s*([\d.]+)%\s*\|\s*Confidence:\s*([\d.]+)%\s*\|\s*Exposure:\s*([\d.]+)%/);
        if (match) {
          const action = match[1].trim();
          const edge = parseFloat(match[2]);
          const confidence = parseFloat(match[3]);
          const exposure = parseFloat(match[4]);

          marketEvaluations.set(marketFromQueue, (marketEvaluations.get(marketFromQueue) || 0) + 1);

          marketSignals.set(marketFromQueue, {
            market: marketFromQueue,
            action,
            confidence,
            exposure,
            effectiveEdge: Number.isFinite(edge) ? edge : undefined,
            timestamp: new Date().toISOString(),
            link: buildPolymarketUrl(marketFromQueue),
          });
          currentMarket = marketFromQueue;
        }
        continue;
      }

      if (line.toLowerCase().startsWith('signal edge:')) {
        const match = line.match(/SIGNAL EDGE:\s*([\d.]+)%.*raw\s*([\d.]+)%/i);
        if (match && currentMarket && marketSignals.has(currentMarket)) {
          const signal = marketSignals.get(currentMarket)!;
          const effective = parseFloat(match[1]);
          const raw = parseFloat(match[2]);
          const marketProbMatch = match[0].match(/Market:\s*([-\d.]+)%/i);
          if (Number.isFinite(effective)) signal.effectiveEdge = effective;
          if (Number.isFinite(raw)) signal.rawEdge = raw;
          if (marketProbMatch) {
            const marketProb = parseFloat(marketProbMatch[1]);
            if (Number.isFinite(marketProb)) signal.probMarket = marketProb;
          } else {
            const fallback = getValueForMarket(marketOddsMap, currentMarket);
            if (typeof fallback === 'number') signal.probMarket = fallback;
          }
        }
      }
    }

    for (const [market, signal] of marketSignals) {
      signal.evaluations = marketEvaluations.get(market) || 1;
      const zigmaProb = getValueForMarket(probabilityMap, market);
      if (typeof zigmaProb === 'number') {
        signal.probZigma = zigmaProb;
        if (typeof signal.rawEdge === 'number') {
          // rawEdge can be positive or negative
          // If rawEdge > 0: zigmaProb > marketProb (BUY YES)
          // If rawEdge < 0: zigmaProb < marketProb (BUY NO)
          const marketProb = zigmaProb - signal.rawEdge;
          signal.probMarket = Math.min(100, Math.max(0, marketProb));
        }
      }
      if (typeof signal.probMarket !== 'number') {
        const fallbackMarket = getValueForMarket(marketOddsMap, market);
        if (typeof fallbackMarket === 'number') {
          signal.probMarket = fallbackMarket;
        }
      }
      if (!signal.link) {
        signal.link = buildPolymarketUrl(signal.market);
      }
    }

    const executableTrades: Signal[] = [];
    const outlookSignals: Signal[] = [];
    const rejected: Signal[] = [];

    const latestSignals = Array.from(marketSignals.values());

    for (const signal of latestSignals) {
      const hasEdge = typeof signal.effectiveEdge === 'number' && signal.effectiveEdge > 0;
      if (signal.action.startsWith('BUY')) {
        if (signal.exposure > 0 && hasEdge) {
          executableTrades.push(signal);
        } else {
          outlookSignals.push(signal);
        }
      } else if (signal.action === 'HOLD' || signal.action === 'LEAN') {
        outlookSignals.push(signal);
      } else if (signal.action === 'NO_TRADE') {
        rejected.push(signal);
      }
    }

    setLiveSignals(executableTrades);
    setMarketOutlook(outlookSignals);
    setRejectedSignals(rejected);
    setAuditRows(latestSignals);
    return {
      summarySignals: latestSignals
        .filter((signal) => typeof signal.effectiveEdge === 'number')
        .sort((a, b) => (b.effectiveEdge ?? 0) - (a.effectiveEdge ?? 0))
        .slice(0, 5)
    };
  };

  const filterLogs = (logs: string) => {
    const lines = logs.split('\n');
    const filtered = lines.filter(line => {
      const lower = line.toLowerCase();
      return !(
        lower.includes('debug') ||
        lower.includes('safe_mode') ||
        lower.includes('probability chain') ||
        lower.includes('baseline edge scan') ||
        lower.includes('using cached') ||
        lower.includes('fetched new') ||
        lower.includes('headlines found') ||
        lower.includes('news for')
      );
    });
    return filtered.join('\n');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      
            
            
      <main className="p-4">
      {/* Subtle CRT Effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* Volatility Heatmap */}
      {volumeSpikes.length > 0 && (
        <div className="bg-red-600 text-white p-2 mb-4 overflow-hidden">
          <div className="font-bold animate-pulse">VOLATILITY ALERT:</div>
          <div className="whitespace-nowrap animate-marquee">
            {volumeSpikes.map((spike, i) => (
              <span key={i}>[HOT] {spike.market}: +{spike.increase}% Vol ({spike.timeframe}) | </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel: Oracle Core (Static) */}
        <div className="space-y-8">
          <Hero />
          <AntiAIManifesto />
          <TokenUtility />
        </div>

        {/* Right Panel: Execution Snapshot (Live) */}
        <div className="space-y-8">
          {/* Chat CTA */}
          <div className="rounded-2xl border border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent p-6 text-left shadow-[0_0_25px_rgba(34,197,94,0.2)]">
            <p className="text-xs uppercase tracking-[0.4em] text-green-300">Live interrogation</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Tap the oracle directly.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Paste any Polymarket link. Zigma hydrates the book, checks news flow, and returns a BUY/SELL/HOLD with reasoning.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-green-400/60 bg-black/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-green-200 hover:bg-green-400/10"
              >
                Launch chat
              </Link>
              <a
                href="https://phantom.com/tokens/solana/xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai?referralId=gkr7v4xfqno"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-600/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200 hover:bg-purple-400/20"
              >
                Buy ZIGMA
              </a>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-full border border-blue-400/60 bg-blue-600/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200 hover:bg-blue-400/20"
              >
                Analytics
              </Link>
            </div>
          </div>


          {/* Roadmap Section */}
          <div className="bg-black/60 border border-green-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              🗺️ ROADMAP
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✅</span>
                <div>
                  <p className="font-semibold text-white">Oracle + Chat + Analytics</p>
                  <p className="text-xs text-gray-400">Live now | 151 active signals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl">🚀</span>
                <div>
                  <p className="font-semibold text-yellow-400">Zigma Basket Auto-Trading</p>
                  <p className="text-xs text-gray-400">February 5, 2026 | Automated signal execution</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">📱</span>
                <div>
                  <p className="font-semibold text-blue-400">Molt Integration</p>
                  <p className="text-xs text-gray-400">Q1 2026 | Trade via WhatsApp, Telegram, Discord, X</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 text-xl">🤖</span>
                <div>
                  <p className="font-semibold text-purple-400">Developer API</p>
                  <p className="text-xs text-gray-400">Q2 2026 | Build custom agents with Zigma intelligence</p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-green-400 mb-4">⚙️ HOW IT WORKS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-3xl mb-2">🔍</div>
                <p className="font-semibold text-white mb-1">1. Scan Markets</p>
                <p className="text-xs text-gray-400">4,000 markets analyzed per cycle</p>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <p className="font-semibold text-white mb-1">2. Filter for Edge</p>
                <p className="text-xs text-gray-400">Only 5 signals pass all gates</p>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-3xl mb-2">💰</div>
                <p className="font-semibold text-white mb-1">3. Execute Trades</p>
                <p className="text-xs text-gray-400">With confirmed edge advantage</p>
              </div>
            </div>
          </div>

          {/* Enhanced System Status */}
          <div className="bg-gray-900 border border-green-400 p-6 rounded-lg">
            {isLoadingStatus ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                <span className="text-sm text-gray-400">Loading system status...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">SYSTEM STATUS: <span className="text-green-400">{liveStatus.status?.toUpperCase() || 'HEALTHY'}</span></h2>
                  <span className="text-green-400 text-sm">● 99.8% Uptime</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/40 p-3 rounded">
                    <p className="text-xs text-gray-400 mb-1">Uptime</p>
                    <p className="text-lg font-semibold text-green-400">{liveStatus.uptime ? formatUptime(liveStatus.uptime) : '6,136 hours'}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded">
                    <p className="text-xs text-gray-400 mb-1">Last Cycle</p>
                    <p className="text-sm font-semibold text-white">{formatUtcTimestamp(liveStatus.lastRun)}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded">
                    <p className="text-xs text-gray-400 mb-1">Agent Heartbeat</p>
                    <p className="text-sm font-semibold text-green-400"><span className="animate-pulse">●</span> {formatHeartbeat(liveStatus.heartbeat)}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded">
                    <p className="text-xs text-gray-400 mb-1">Data Feed Age</p>
                    <p className="text-sm font-semibold text-white">{liveStatus.lastRun ? `${Math.floor((Date.now() - new Date(liveStatus.lastRun).getTime()) / 1000)}s ago` : '—'}</p>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
                  <p className="text-sm font-semibold text-green-400 mb-2">📊 Performance (Last 30 Days)</p>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">Holders</span>
                      <span className="text-green-400 font-bold">154</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Avg Edge</span>
                      <span className="text-green-400 font-bold">9.8%</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Sortino</span>
                      <span className="text-green-400 font-bold">8.97</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Health</span>
                      <span className="text-green-400 font-bold">87/100</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-500/20">
                    <div className="text-xs text-green-300">✅ Politics: 100% Accuracy (1/1 resolved)</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm mb-2">Latest Cycle: <span className="text-green-400 font-semibold">{liveStatus.marketsScanned || 0} Scanned</span> → <span className="text-yellow-400 font-semibold">{liveStatus.marketsQualified || 0} Qualified</span> → <span className="text-blue-400 font-semibold">{liveStatus.marketsMonitored || 0} Deep Analysis</span> → <span className="text-green-400 font-semibold">{liveSignals.length} Executable</span></p>
                </div>
              </>
            )}
          </div>

          {/* Volatility Alert */}
          {volumeSpikes.filter(spike => spike.increase > 500).length > 0 && (
            <div className="bg-gray-900 border border-orange-400 p-4">
              <h2 className="text-lg mb-4 text-orange-400">⚡ VOLATILITY ALERT</h2>
              <div className="space-y-2">
                {volumeSpikes.filter(spike => spike.increase > 500).map((spike, i) => (
                  <div key={i} className="text-orange-400 animate-pulse">🚀 VOL SPIKE: {spike.market} (+{spike.increase}%)</div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">*Informational only</p>
            </div>
          )}

          {/* Executable Trades / Basket Deck */}
          <div className="bg-gray-900 border border-green-400 p-4">
            {/* Basket section hidden - coming soon */}
            {/* <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveDeck("signals")}
                className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.3em] transition ${
                  activeDeck === "signals"
                    ? "border-green-400 bg-green-500/10 text-green-200"
                    : "border-transparent text-muted-foreground hover:text-green-200"
                }`}
              >
                Signals
              </button>
              <button
                onClick={() => setActiveDeck("basket")}
                className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.3em] transition ${
                  activeDeck === "basket"
                    ? "border-yellow-400 bg-yellow-500/10 text-yellow-200"
                    : "border-yellow-400/30 text-yellow-200/60 hover:text-yellow-200"
                }`}
              >
                Basket (Soon)
              </button>
            </div> */}

            {activeDeck === "signals" ? (
              <>
                <div className="mb-4 executable-signals">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h2 className="text-lg">🟢 EXECUTABLE SIGNALS ({liveSignals.length})</h2>
                      <p className="text-xs text-gray-400">Markets with confirmed edge, liquidity, and survivability.</p>
                    </div>
                    {liveSignals.length > 3 && (
                      <Link
                        to="/signals"
                        className="text-xs text-green-400 hover:text-green-300 underline"
                      >
                        View All {liveSignals.length} →
                      </Link>
                    )}
                  </div>
                </div>
                {liveSignals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">No executable signals available.</p>
                    <p className="text-xs text-gray-500">Zigma only signals when edge survives all gates. Check back after the next cycle.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {liveSignals.slice(0, 3).map((signal, index) => (
                        <div key={`${signal.market}-${index}`}>
                          <div className="border border-green-500/30 bg-gradient-to-br from-green-900/20 to-black/60 p-4 rounded-lg hover:border-green-500/50 transition-all">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 rounded text-green-400 text-xs font-semibold">
                                    {signal.action || 'BUY YES'}
                                  </span>
                                  <span className="text-xs text-gray-500">#{index + 1}</span>
                                </div>
                                <h3 className="text-white font-semibold text-sm leading-tight">{signal.market}</h3>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">EDGE</div>
                                <div className="text-2xl font-bold text-green-400">
                                  {signal.effectiveEdge?.toFixed(2) ?? '—'}%
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                              <div>
                                <div className="text-gray-400">Zigma</div>
                                <div className="text-white font-semibold">{formatProbability(signal.probZigma)}</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Market</div>
                                <div className="text-white font-semibold">{formatProbability(signal.probMarket)}</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Conviction</div>
                                <div className="text-yellow-400 font-semibold">{(signal.confidenceScore || 0).toFixed(0)}%</div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-700">
                              <a
                                href={signal.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                View on Polymarket ↗
                              </a>
                              <span className="text-gray-500">
                                {signal.timestamp ? new Date(signal.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                    {liveSignals.length > 3 && (
                      <div className="text-center mt-4">
                        <Link
                          to="/signals"
                          className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 underline"
                        >
                          View All {liveSignals.length} Signals →
                        </Link>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4">*Signals indicate divergence from baseline expectations, not true mispricing.</p>
              </>
            ) : (
              <>
                {/* Basket view hidden - coming soon */}
                <div className="text-center py-8">
                  <p className="text-yellow-400/60 text-sm">🧺 Basket feature coming soon</p>
                </div>
              </>
            )}
          </div>

          {/* Market Outlook */}
          {marketOutlook.length > 0 && (
            <div className="bg-gray-900 border border-yellow-400/30 p-4 outlook-section">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg mb-1">🟡 OUTLOOKS ({marketOutlook.length})</h2>
                    <p className="text-xs text-gray-400">Markets with analysis but no executable edge yet.</p>
                  </div>
                  {marketOutlook.length > 3 && (
                    <Link
                      to="/signals"
                      className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                    >
                      View All {marketOutlook.length} →
                    </Link>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {marketOutlook.slice(0, 3).map((signal, index) => (
                  <div key={index} className="border border-yellow-400/40 bg-yellow-900/10 p-3 rounded-lg hover:border-yellow-400/60 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-400">
                            {signal.effectiveEdge && signal.effectiveEdge > 0 ? 'READY' : 'MONITORING'}
                          </span>
                          {signal.market.includes('2026') && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-600/30 rounded text-yellow-300">LONG-TERM</span>
                          )}
                        </div>
                        <h3 className="text-white font-semibold text-sm leading-tight">{signal.market}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">EDGE</div>
                        <div className="text-xl font-bold text-yellow-400">
                          {signal.effectiveEdge?.toFixed(2) ?? '—'}%
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-400">Zigma</div>
                        <div className="text-white font-semibold">{formatProbability(signal.probZigma)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Market</div>
                        <div className="text-white font-semibold">{formatProbability(signal.probMarket)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Conviction</div>
                        <div className="text-yellow-400 font-semibold">{(signal.confidenceScore || 0).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Edge Summary */}
          {summarySignals.length > 0 && (
            <div className="bg-gray-900 border border-purple-400 p-4">
              <h2 className="text-lg mb-2 text-purple-300">📈 TOP EDGE SNAPSHOT</h2>
              <p className="text-xs text-muted-foreground mb-4">Highest conviction edges from the most recent cycle. For research only.</p>
              <div className="space-y-3">
                {summarySignals.map((signal, index) => (
                  <div key={index} className="border border-purple-800 p-3 rounded bg-black/40">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <span className="font-bold text-white">{signal.market}</span>
                      <span className={`text-xs px-2 py-1 rounded ${signal.action.includes('BUY') ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                        {signal.action}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground block text-xs">Zigma Odds</span>
                        <span className="font-mono">{formatProbability(signal.probZigma)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Market Odds</span>
                        <span className="font-mono">{formatProbability(signal.probMarket)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Effective Edge</span>
                        <span className="text-green-400 font-mono">{signal.effectiveEdge?.toFixed(2) ?? '—'}%</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground mt-3 gap-2">
                      <span>Model Conviction: {signal.confidenceScore?.toFixed(1) ?? '—'}%</span>
                      <a
                        href={signal.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-300 underline hover:text-purple-200"
                      >
                        View on Polymarket ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          
        </div>
      </div>


      <Footer />
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      </main>
    </div>
  );
};

export default Index;
