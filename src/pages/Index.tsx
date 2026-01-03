import Hero from "@/components/Hero";
import AntiAIManifesto from "@/components/SignalPhilosophy";
import TokenUtility from "@/components/TokenUtility";
import Footer from "@/components/Footer";
import { useState, useEffect } from 'react';

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

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAt = Date.now();
        const [dataRes, statusRes, logsRes] = await Promise.all([
          fetch(API_BASE + '/data'),
          fetch(API_BASE + '/status'),
          fetch(API_BASE + '/logs')
        ]);
        const dataData = await dataRes.json();
        const statusData = await statusRes.json();
        const logsData = await logsRes.json();

        const logInsights = extractCycleInsights(logsData.logs);
        const cycleSummary = dataData.cycleSummary || {};

        const mergedStatus: SystemStatus = {
          status: statusData.status || 'operational',
          uptime: statusData.uptime ?? cycleSummary.uptime ?? liveStatus.uptime,
          lastRun: statusData.lastRun || cycleSummary.lastRun || logInsights.lastCycle || liveStatus.lastRun,
          marketsScanned: statusData.marketsScanned ?? cycleSummary.marketsFetched ?? logInsights.marketsScanned,
          marketsQualified: statusData.marketsQualified ?? cycleSummary.marketsEligible ?? logInsights.marketsQualified,
          marketsMonitored: statusData.marketsMonitored ?? cycleSummary.marketsEligible ?? logInsights.marketsAnalyzed,
          posts: statusData.posts ?? cycleSummary.signalsGenerated ?? liveStatus.posts,
          heartbeat: fetchedAt,
          dataTimestamp: fetchedAt,
        };

        setLiveStatus(mergedStatus);
        setLastUpdated(fetchedAt);
        setLiveLogs(logsData.logs);

        const apiVolumeSpikes = Array.isArray(dataData.volumeSpikes) && dataData.volumeSpikes.length
          ? normalizeVolumeSpikes(dataData.volumeSpikes)
          : logInsights.volumeSpikes;
        setVolumeSpikes(apiVolumeSpikes);
        const { summarySignals } = parseSignals(logsData.logs);
        setSummarySignals(summarySignals);

        const apiExecutables = normalizeApiSignals(dataData.liveSignals);
        const apiOutlook = normalizeApiSignals(dataData.marketOutlook);
        const apiRejected = normalizeApiSignals(dataData.rejectedSignals);

        if (apiExecutables.length) setLiveSignals(apiExecutables);
        if (apiOutlook.length) setMarketOutlook(apiOutlook);
        if (apiRejected.length) setRejectedSignals(apiRejected);
      } catch (e) {
        console.error('Failed to fetch data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

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
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
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
          <div className="text-center border-b border-green-400 pb-4">
            <h1 className="text-2xl font-bold">ORACLE CORE </h1>
          </div>
          <Hero />
          <AntiAIManifesto />
          <TokenUtility />
        </div>

        {/* Right Panel: Execution Snapshot (Live) */}
        <div className="space-y-8">
          <div className="text-center border-b border-green-400 pb-4">
            <h1 className="text-2xl font-bold">EXECUTION SNAPSHOT</h1>
          </div>

          {/* Cycle Summary */}
          <div className="bg-gray-900 border border-green-400 p-4">
            <h2 className="text-lg mb-2">SYSTEM STATUS: {liveStatus.status?.toUpperCase()}</h2>
            <p>Uptime: {formatUptime(liveStatus.uptime)}</p>
            <p>Last completed cycle: {formatUtcTimestamp(liveStatus.lastRun)}</p>
            <p>Agent Heartbeat: <span className="animate-pulse text-green-400">●</span> {formatHeartbeat(liveStatus.heartbeat)}</p>
          
            <p>Data feed age: {liveStatus.lastRun ? `${Math.floor((Date.now() - new Date(liveStatus.lastRun).getTime()) / 1000)}s ago` : '—'}</p>
            <p>Markets analyzed in latest completed cycle: {liveStatus.marketsScanned || 0} Scanned → {liveStatus.marketsQualified || 0} Qualified → {liveStatus.marketsMonitored || 0} Deep Analysis</p>
            <p>Executable opportunities found: {liveSignals.length}</p>
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

          {/* Executable Trades */}
          <div className="bg-gray-900 border border-green-400 p-4">
            <h2 className="text-lg mb-4">🔥 High-Conviction Signals</h2>
            {liveSignals.length === 0 ? (
              <p className="text-muted-foreground">No executable trades available.</p>
            ) : (
              <div className="space-y-4">
                {liveSignals.map((signal, index) => (
                  <div key={index} className={`border-l-4 ${signal.action === 'BUY YES' ? 'border-l-green-500' : 'border-l-red-500'} bg-gray-900 p-4 rounded-r-lg`}>
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-bold">{signal.market}</h3>
                      {signal.market.toLowerCase().includes('seattle seahawks') && signal.market.toLowerCase().includes('nfc west') && (
                        <span className="text-xs bg-blue-600 px-2 py-1 rounded ml-2">Informational signal—high market consensus</span>
                      )}
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
                          {'★'.repeat(Math.max(1, Math.floor(signal.confidence / 20)))} ({signal.confidence.toFixed(1)}%)
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

                    <div className="mt-4 flex justify-between items-center text-xs">
                      <a
                        href={signal.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-300 underline hover:text-blue-200"
                      >
                        View on Polymarket ↗
                      </a>
                      <span className="text-gray-500">
                        {signal.timestamp ? new Date(signal.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">*Signals indicate divergence from baseline expectations, not true mispricing.</p>
          <p className="text-xs text-muted-foreground mt-2">*Edge adjusted due to normalization, liquidity impact, or entropy change.</p>

          {/* Market Outlook */}
          {marketOutlook.length > 0 && (
            <div className="bg-gray-900 border border-yellow-400 p-4">
              <h2 className="text-lg mb-4">🧠 MARKET OUTLOOK (NON-EXECUTABLE)</h2>
              <p className="text-sm text-muted-foreground mb-4">High-confidence views. No position sizing. Not trades. Conviction ≠ tradable edge.</p>
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
                      Model Conviction: {'★'.repeat(Math.max(1, Math.floor(signal.confidence / 20)))} ({signal.confidence.toFixed(1)}%)
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

        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">Zigma v0.1 is currently scanning 500+ prediction markets every 60 seconds using deep LLM-consensus.</div>

      <Footer />
    </main>
  );
};

export default Index;
