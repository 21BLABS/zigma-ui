import Hero from "@/components/Hero";
import AntiAIManifesto from "@/components/SignalPhilosophy";
import TokenUtility from "@/components/TokenUtility";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { OnboardingTour } from "@/components/OnboardingTour";
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
  if (value <= 1 && value >= 0) return value * 100;
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
            confidence: Number(signal.confidence ?? signal.confidenceScore ?? 0),
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
            link: signal.link || (signal.market ? buildPolymarketUrl(signal.market) : undefined),
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
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedAt = Date.now();
        let dataData = null;
        let statusData = { status: 'operational', lastRun: null, uptime: 0, posts: 0, marketsScanned: 0, marketsQualified: 0, marketsMonitored: 0 };
        let logsData = { logs: 'Using persisted data from Supabase.' };

        // Try to fetch from Supabase
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

        // If no data from Supabase, try backend
        if (!dataData) {
          try {
            const dataRes = await fetch(API_BASE + '/data');
            if (!dataRes.ok) throw new Error('Failed to fetch data');
            dataData = await dataRes.json();
          } catch (e) {
            console.error('Backend data fetch failed:', e);
            setError('Failed to load market data');
          }
        }

        // Try status and logs from backend
        try {
          setIsLoadingStatus(true);
          const [statusRes, logsRes] = await Promise.all([
            fetch(API_BASE + '/status'),
            fetch(API_BASE + '/logs')
          ]);
          if (statusRes.ok) statusData = await statusRes.json();
          if (logsRes.ok) logsData = await logsRes.json();
        } catch (e) {
          console.error('Status/logs fetch failed:', e);
        } finally {
          setIsLoadingStatus(false);
        }

        const logInsights = extractCycleInsights(logsData.logs);
        const cycleSummary = dataData?.cycleSummary || {};

        const mergedStatus: SystemStatus = {
          status: statusData.status || 'operational',
          uptime: statusData.uptime ?? cycleSummary.uptime ?? 0,
          lastRun: statusData.lastRun || cycleSummary.lastRun || logInsights.lastCycle || null,
          marketsScanned: statusData.marketsScanned ?? cycleSummary.marketsFetched ?? logInsights.marketsScanned,
          marketsQualified: statusData.marketsQualified ?? cycleSummary.marketsEligible ?? logInsights.marketsQualified,
          marketsMonitored: statusData.marketsMonitored ?? cycleSummary.marketsEligible ?? logInsights.marketsAnalyzed,
          posts: statusData.posts ?? cycleSummary.signalsGenerated ?? 0,
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

        if (apiExecutables.length) setLiveSignals(apiExecutables);
        if (apiOutlook.length) setMarketOutlook(apiOutlook);
        if (apiRejected.length) setRejectedSignals(apiRejected);
      } catch (e) {
        console.error('Failed to fetch data:', e);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }

      // Fetch backtest results
      try {
        const backtestRes = await fetch(API_BASE + '/backtest');
        if (backtestRes.ok) {
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
          const marketProb = signal.action === 'BUY YES'
            ? zigmaProb - signal.rawEdge
            : zigmaProb + signal.rawEdge;
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
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-green-400 text-lg">Loading Zigma...</p>
            <p className="text-gray-500 text-sm mt-2">Fetching market data and analysis</p>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-900/90 border border-red-500 text-white px-6 py-4 rounded-lg z-50 max-w-md">
          <p className="font-bold mb-2">⚠️ Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}
      
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
                href="https://polymarket.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-green-200"
              >
                View markets ↗
              </a>
            </div>
          </div>

          {/* Cycle Summary */}
          <div className="bg-gray-900 border border-green-400 p-4">
            {isLoadingStatus ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                <span className="text-sm text-gray-400">Loading system status...</span>
              </div>
            ) : (
              <>
                <h2 className="text-lg mb-2">SYSTEM STATUS: {liveStatus.status?.toUpperCase()}</h2>
                <p>Uptime: {formatUptime(liveStatus.uptime)}</p>
                <p>Last completed cycle: {formatUtcTimestamp(liveStatus.lastRun)}</p>
                <p>Agent Heartbeat: <span className="animate-pulse text-green-400">●</span> {formatHeartbeat(liveStatus.heartbeat)}</p>
                
                <p>Data feed age: {liveStatus.lastRun ? `${Math.floor((Date.now() - new Date(liveStatus.lastRun).getTime()) / 1000)}s ago` : '—'}</p>
                <p>Markets analyzed in latest completed cycle: {liveStatus.marketsScanned || 0} Scanned → {liveStatus.marketsQualified || 0} Qualified → {liveStatus.marketsMonitored || 0} Deep Analysis</p>
                <p>Executable opportunities found: {liveSignals.length}</p>
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
            <div className="mb-4 flex flex-wrap items-center gap-3">
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
            </div>

            {activeDeck === "signals" ? (
              <>
                <div className="mb-4 executable-signals">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h2 className="text-lg">🟢 EXECUTABLE SIGNALS</h2>
                      <p className="text-xs text-gray-400">Markets with confirmed edge, liquidity, and survivability. Ready to trade.</p>
                    </div>
                    {liveSignals.length > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAutoRotate(!autoRotate)}
                          className={`text-xs px-2 py-1 rounded ${autoRotate ? 'bg-green-900 text-green-200' : 'bg-gray-800 text-gray-400'}`}
                          title={autoRotate ? 'Auto-rotate enabled' : 'Auto-rotate disabled'}
                        >
                          {autoRotate ? '🔄 Auto' : '⏸️ Auto'}
                        </button>
                        <span className="text-xs text-gray-500">
                          {currentSignalIndex + 1} / {liveSignals.length}
                        </span>
                      </div>
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
                    <div className="relative">
                      <div className="overflow-hidden">
                        <div 
                          className="transition-opacity duration-500 ease-in-out"
                          style={{ opacity: 1 }}
                        >
                          {liveSignals.map((signal, index) => (
                            <div 
                              key={`${signal.market}-${index}`} 
                              className={`transition-all duration-500 ease-in-out ${index === currentSignalIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute top-0 left-0 right-0 pointer-events-none'}`}
                            >
                              <div className={`border-l-4 ${signal.action === 'BUY YES' ? 'border-l-green-500' : 'border-l-red-500'} bg-gray-900 p-4 rounded-r-lg`}>
                                <div className="flex justify-between items-start">
                                  <h3 className="text-white font-bold">{signal.market}</h3>
                                  <span className={`px-2 py-1 text-xs rounded ${signal.action === 'BUY YES' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                    {signal.action}
                                  </span>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                  <div className="flex justify-between text-gray-400">
                                    <span title="Zigma Odds represent baseline-adjusted model belief, not forecast probability." className="cursor-help">Zigma Odds</span>
                                    <span>{formatProbability(signal.probZigma)}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-400">
                                    <span>Market Odds</span>
                                    <span>{formatProbability(signal.probMarket)}</span>
                                  </div>
                                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-purple-500 h-2"
                                      style={{ width: `${Math.min(100, Math.max(0, signal.probZigma || 0))}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="mt-4 flex justify-between items-center border-t border-gray-800 pt-2">
                                  <div>
                                    <span className="text-gray-500 text-xs">MODEL CONVICTION</span>
                                    <div className="text-yellow-400">
                                      {'★'.repeat(Math.max(1, Math.floor((signal.confidenceScore || signal.confidence * 100) / 20)))} ({(signal.confidenceScore || signal.confidence * 100).toFixed(1)}%)
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-gray-500 text-xs">EFFECTIVE EDGE</span>
                                    <div className="text-green-400 font-mono font-bold">
                                      {signal.effectiveEdge?.toFixed(2) ?? '—'}%
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 flex justify-between text-xs text-gray-400">
                                  <span>Relative Rank</span>
                                  <span>#{index + 1} of {liveSignals.length}</span>
                                </div>

                                <div className="mt-4 flex justify-between items-center text-xs gap-2">
                                  <div className="flex gap-2">
                                    <a
                                      href={signal.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-300 underline hover:text-blue-200"
                                    >
                                      View on Polymarket ↗
                                    </a>
                                    <button
                                      onClick={() => {
                                        const marketId = signal.link?.match(/event\/([^?]+)/)?.[1];
                                        if (marketId) {
                                          fetch(`${API_BASE}/api/watchlist`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ marketId })
                                          }).then(() => alert('Added to watchlist!'));
                                        }
                                      }}
                                      className="text-yellow-400 hover:text-yellow-300"
                                      title="Add to Watchlist"
                                    >
                                      📋 Watch
                                    </button>
                                  </div>
                                  <span className="text-gray-500">
                                    {signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString() : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Dots */}
                      {liveSignals.length > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                          {liveSignals.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentSignalIndex(i)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i === currentSignalIndex
                                  ? 'bg-green-400 w-6'
                                  : 'bg-gray-600 hover:bg-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Arrow Navigation */}
                      {liveSignals.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentSignalIndex(prev => prev === 0 ? liveSignals.length - 1 : prev - 1)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-green-400 opacity-0 hover:opacity-100 transition-opacity"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => setCurrentSignalIndex(prev => (prev + 1) % liveSignals.length)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-green-400 opacity-0 hover:opacity-100 transition-opacity"
                          >
                            →
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-4">*Signals indicate divergence from baseline expectations, not true mispricing.</p>
                <p className="text-xs text-muted-foreground mt-1">*Edge adjusted due to normalization, liquidity impact, or entropy change.</p>
                {autoRotate && liveSignals.length > 1 && (
                  <p className="text-xs text-green-400/60 mt-1">🔄 Auto-rotating every 5 seconds</p>
                )}
              </>
            ) : (
              <div className="space-y-4 text-sm text-muted-foreground">
                <h2 className="text-lg text-yellow-300">🧺 Basket Engine (Coming Soon)</h2>
                <p>
                  Curated market baskets with auto-sizing and capital allocation heuristics are in active development.
                  Track multiple exposures with one click once the module unlocks.
                </p>
                <ul className="list-disc space-y-2 pl-5 text-yellow-200/80">
                  <li>Macro baskets (rates, ETF approvals)</li>
                  <li>Election slates (swing states, nomination ladders)</li>
                  <li>Event clusters (award shows, sports playoffs)</li>
                </ul>
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">ETA: Post CyreneAI drop</p>
              </div>
            )}
          </div>

          {/* Market Outlook */}
          {marketOutlook.length > 0 && (
            <div className="bg-gray-900 border border-yellow-400/30 p-4 watchlist-section">
              <div className="mb-4">
                <h2 className="text-lg mb-2">🟡 WATCHLIST</h2>
                <p className="text-xs text-gray-400">High-confidence views for monitoring. Not yet executable due to liquidity, time decay, or volatility.</p>
              </div>
              <div className="space-y-4">
                {marketOutlook.map((signal, index) => (
                  <div key={index} className="border border-yellow-400 p-3">
                    <div className="text-sm text-yellow-400 mb-1">
                      {signal.effectiveEdge && signal.effectiveEdge > 0 ? '✅ SIGNAL READY' : '🟢 ANALYZING'}
                    </div>
                    <div className="font-bold text-yellow-400 mb-2 flex flex-wrap gap-2 items-center">
                      <span>{signal.market}</span>
                      {signal.market.includes('2026') && (
                        <span className="text-xs bg-yellow-600 px-2 py-1 rounded">LONG-HORIZON VIEW (Illiquid)</span>
                      )}
                    </div>
                    <div className="text-sm mb-2">
                      Model Conviction: {'★'.repeat(Math.max(1, Math.floor((signal.confidenceScore || signal.confidence * 100) / 20)))} ({(signal.confidenceScore || signal.confidence * 100).toFixed(1)}%)
                    </div>
                    {(typeof signal.probZigma === 'number' || typeof signal.probMarket === 'number') && (
                      <div className="text-sm mb-2">
                        Probability Split: AI {formatProbability(signal.probZigma)} vs Market {formatProbability(signal.probMarket)}
                      </div>
                    )}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, signal.probZigma || 0))}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Effective Edge</span>
                        <span className="text-green-400 font-mono">{signal.effectiveEdge?.toFixed(2) ?? '—'}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Horizon</span>
                        <span className="text-yellow-400 font-mono">{signal.market.includes('2026') ? 'Long-term' : 'Short-term'}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Action:</span>{' '}
                      <span className="text-yellow-400">No Signal / Watch</span>
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
                      <span>Model Conviction: {signal.confidence?.toFixed(1) ?? '—'}%</span>
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

          {/* Backtest Stats */}
          {backtestResults && !backtestResults.error && (
            <div className="bg-gray-900 border border-cyan-400 p-4">
              <h2 className="text-lg mb-2 text-cyan-300">📊 BACKTEST PERFORMANCE</h2>
              <p className="text-xs text-muted-foreground mb-4">Historical edge validation on resolved markets. Lower Brier = better calibration.</p>
              <pre className="text-xs text-cyan-400 whitespace-pre-wrap font-mono">
                {backtestResults.summary}
              </pre>
              {backtestResults.results && backtestResults.results.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Recent Results ({backtestResults.fullResults} total):</p>
                  <div className="text-xs font-mono text-cyan-200 space-y-1 max-h-32 overflow-y-auto">
                    {backtestResults.results.map((line: string, idx: number) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>


      <Footer />
      <OnboardingTour />
      </main>
    </div>
  );
};

export default Index;
