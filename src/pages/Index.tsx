import Hero from "@/components/Hero";
import Manifesto from "@/components/OracleLogic";
import AntiAIManifesto from "@/components/SignalPhilosophy";
import TokenUtility from "@/components/TokenUtility";
import Footer from "@/components/Footer";
import { LogsDisplay } from "@/components/LogsDisplay";
import { useState, useEffect } from 'react';

interface SystemStatus {
  status?: string;
  uptime?: number;
  lastRun?: string;
  marketsMonitored?: number;
  posts?: number;
}

interface Signal {
  market: string;
  action: string;
  confidence: string;
  exposure: string;
  effectiveEdge?: string;
  marketOdds?: string;
  zigmaOdds?: string;
  timestamp?: string;
  evaluations?: number;
}

const Index = () => {
  const [showRejected, setShowRejected] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [liveStatus, setLiveStatus] = useState<SystemStatus>({});
  const [liveLogs, setLiveLogs] = useState('');
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [marketOutlook, setMarketOutlook] = useState<Signal[]>([]);
  const [rejectedSignals, setRejectedSignals] = useState<Signal[]>([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, logsRes] = await Promise.all([
          fetch(API_BASE + '/status'),
          fetch(API_BASE + '/logs')
        ]);
        const statusData = await statusRes.json();
        const logsData = await logsRes.json();

        // Parse header data from logs for consistency
        let lastCycle = '';
        let marketsAnalyzed = 0;
        for (const line of logsData.logs.split('\n')) {
          if (line.includes('Agent Zigma Cycle:')) {
            const match = line.match(/Agent Zigma Cycle: ([^ ]+)/);
            if (match) lastCycle = match[1];
          }
          if (line.includes('Markets deeply evaluated this cycle:')) {
            const match = line.match(/Markets deeply evaluated this cycle: (\d+)/);
            if (match) marketsAnalyzed = parseInt(match[1]);
          }
        }

        setLiveStatus({ ...statusData, lastRun: lastCycle || statusData.lastRun, marketsMonitored: marketsAnalyzed || statusData.marketsMonitored });
        setLiveLogs(logsData.logs);
        parseSignals(logsData.logs);
      } catch (e) {
        console.error('Failed to fetch data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const parseSignals = (logs: string) => {
    const lines = logs.split('\n');
    const marketSignals = new Map<string, Signal>(); // market -> latest signal
    const marketEvaluations = new Map<string, number>(); // market -> count
    let currentMarket = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('[LLM] Analyzing:')) {
        const match = line.match(/\[LLM\] Analyzing: .+ - (.+)/);
        if (match) {
          currentMarket = match[1].trim();
        }
      }

      if (line.includes(' SIGNAL:')) {
        const match = line.match(/ SIGNAL: ([^(]+) \((\d+)%\) \| Exposure: ([\d.]+)%/);
        if (match && currentMarket) {
          // Count evaluations
          marketEvaluations.set(currentMarket, (marketEvaluations.get(currentMarket) || 0) + 1);

          const signal: Signal = {
            market: currentMarket,
            action: match[1].trim(),
            confidence: match[2],
            exposure: match[3],
            timestamp: new Date().toISOString()
          };

          // Look ahead for Effective Edge
          for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
            if (lines[j].includes('Effective Edge:')) {
              const edgeMatch = lines[j].match(/Effective Edge: ([\d.]+)%/);
              if (edgeMatch) {
                signal.effectiveEdge = edgeMatch[1];
                break;
              }
            }
          }

          // Update latest signal for this market
          marketSignals.set(currentMarket, signal);
        }
      }
    }

    // Add evaluations to signals
    for (const [market, signal] of marketSignals) {
      signal.evaluations = marketEvaluations.get(market) || 1;
    }

    // Separate live, outlook, and rejected
    const executableTrades: Signal[] = [];
    const marketOutlook: Signal[] = [];
    const rejectedSignals: Signal[] = [];

    for (const signal of marketSignals.values()) {
      if (signal.action === 'BUY YES' || signal.action === 'BUY NO') {
        const exposure = parseFloat(signal.exposure);
        const hasEdge = signal.effectiveEdge && signal.effectiveEdge !== 'N/A';
        if (exposure > 0 && hasEdge) {
          executableTrades.push(signal);
        } else {
          // Force exposure to 0 for outlook signals
          signal.exposure = '0.00';
          marketOutlook.push(signal);
        }
      } else if (signal.action === 'NO_TRADE') {
        rejectedSignals.push(signal);
      }
    }

    setLiveSignals(executableTrades);
    setMarketOutlook(marketOutlook);
    setRejectedSignals(rejectedSignals);
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
        lower.includes('news for') ||
        lower.includes(' signal:')
      );
    });
    return filtered.join('\n');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Subtle CRT Effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel: Oracle Core (Static) */}
        <div className="space-y-8">
          <div className="text-center border-b border-green-400 pb-4">
            <h1 className="text-2xl font-bold">ORACLE CORE </h1>
          </div>
          <Hero />
          <Manifesto />
          <div className="text-center space-y-2">
            <p>MANIFESTO: /manifesto</p>
            <p>EXECUTION LOG: /signals</p>
          </div>
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
            <p>Uptime: {liveStatus.uptime === 0 ? '<current session>' : `${liveStatus.uptime}s`}</p>
            <p>Last completed cycle: {liveStatus.lastRun ? new Date(liveStatus.lastRun).toLocaleDateString() + ' · ' + new Date(liveStatus.lastRun).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' UTC' : '—'}</p>
            <p>Markets analyzed in latest completed cycle: {liveStatus.marketsMonitored}</p>
            <p>Executable opportunities found: {liveSignals.length}</p>
            <p>Market outlook signals: {marketOutlook.length}</p>
          </div>

          {/* Executable Trades */}
          <div className="bg-gray-900 border border-green-400 p-4">
            <h2 className="text-lg mb-4">🔥 EXECUTABLE TRADES</h2>
            {liveSignals.length === 0 ? (
              <p className="text-muted-foreground">No executable trades available.</p>
            ) : (
              <div className="space-y-4">
                {liveSignals.map((signal, index) => (
                  <div key={index} className="border border-green-400 p-3">
                    <div className="font-bold text-green-400">{signal.market}</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div><span className="text-muted-foreground">Action:</span> <span className="text-green-400">{signal.action}</span></div>
                      <div><span className="text-muted-foreground">Confidence:</span> {signal.confidence}%</div>
                      <div><span className="text-muted-foreground">Suggested Max Exposure:</span> {signal.exposure}%</div>
                      <div><span className="text-muted-foreground">Final Effective Edge (post-normalization):</span> {signal.effectiveEdge ? `${signal.effectiveEdge}%` : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">*Edge adjusted due to normalization, liquidity impact, or entropy change.</p>

          {/* Market Outlook */}
          <div className="bg-gray-900 border border-yellow-400 p-4">
            <h2 className="text-lg mb-4">🧠 MARKET OUTLOOK (NON-EXECUTABLE)</h2>
            <p className="text-sm text-muted-foreground mb-4">High-confidence views. No position sizing. Not trades. Conviction ≠ tradable edge.</p>
            {marketOutlook.length === 0 ? (
              <p className="text-muted-foreground">No market outlook signals.</p>
            ) : (
              <div className="space-y-4">
                {marketOutlook.map((signal, index) => (
                  <div key={index} className="border border-yellow-400 p-3">
                    <div className="font-bold text-yellow-400">{signal.market} {signal.market.includes('2026') ? <span className="text-xs bg-yellow-600 px-2 py-1 rounded">LONG-HORIZON VIEW (Illiquid)</span> : ''}</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div><span className="text-muted-foreground">Action:</span> <span className="text-yellow-400">{signal.action.replace('BUY', 'MODEL LEANS')}</span></div>
                      <div><span className="text-muted-foreground">Model Conviction:</span> {signal.confidence}%</div>
                      <div><span className="text-muted-foreground">Suggested Max Exposure:</span> {signal.exposure}%</div>
                      <div><span className="text-muted-foreground">Final Effective Edge (post-normalization):</span> {signal.effectiveEdge ? `${signal.effectiveEdge}%` : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rejected Signals (Collapsible) */}
          <div className="bg-gray-900 border border-green-400 p-4">
            <button
              onClick={() => setShowRejected(!showRejected)}
              className="w-full text-left text-lg mb-2 flex justify-between items-center"
            >
              <span>🚫 REJECTED SIGNALS (NO EXECUTION)</span>
              <span>{showRejected ? '▼' : '▶'}</span>
            </button>
            {showRejected && (
              <div className="space-y-4 mt-4">
                {rejectedSignals.length === 0 ? (
                  <p className="text-muted-foreground">No rejected signals.</p>
                ) : (
                  rejectedSignals.map((signal, index) => (
                    <div key={index} className="border border-red-400 p-3">
                      <div className="font-bold text-red-400">{signal.market}</div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Status:</span> {signal.action}</div>
                        <div><span className="text-muted-foreground">Reason:</span> No measurable edge</div>
                        <div><span className="text-muted-foreground">Evaluations:</span> {signal.evaluations}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Operational Logs (Collapsible) */}
          <div className="bg-gray-900 border border-green-400 p-4">
            <button
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className="w-full text-left text-lg mb-2 flex justify-between items-center"
            >
              <span>🧾 OPERATIONAL LOGS (AUDIT ONLY)</span>
              <span>{showAuditLogs ? '▼' : '▶'}</span>
            </button>
            {showAuditLogs && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-4">*Informational · Not Trading Signals</p>
                <LogsDisplay logs={liveLogs} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
