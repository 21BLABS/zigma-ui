import { useState, useEffect } from 'react';

const LatestSignal = () => {
  const [latestSignal, setLatestSignal] = useState<any>(null);

  useEffect(() => {
    const fetchLatestSignal = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.zigma.pro';
        const res = await fetch(`${API_BASE}/logs`);
        const data = await res.json();
        const parsed = parseLogs(data.logs);
        if (parsed.signals.length > 0) {
          setLatestSignal(parsed.signals[parsed.signals.length - 1]);
        }
      } catch (e) {
        console.error('Failed to fetch latest signal');
      }
    };

    fetchLatestSignal();
    const interval = setInterval(fetchLatestSignal, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const parseLogs = (logs: string) => {
    const lines = logs.split('\n');
    const signals: any[] = [];
    let currentMarket = '';
    let lastSignal: any = null;

    for (const line of lines) {
      if (line.includes('[LLM] Analyzing:')) {
        const match = line.match(/\[LLM\] Analyzing: (.+) - (.+)/);
        if (match) {
          currentMarket = match[2].trim();
        }
      }

      if (line.includes('DEBUG: Market') && line.includes('yesPrice')) {
        const marketMatch = line.match(/DEBUG: Market (.+?), yesPrice ([\d.]+), action (.+?), winProb ([\d.]+), betPrice [\d.]+, liquidity ([\d.]+)/);
        if (marketMatch && lastSignal) {
          lastSignal.marketOdds = (parseFloat(marketMatch[2]) * 100).toFixed(1) + '%';
          lastSignal.zigmaOdds = (parseFloat(marketMatch[4]) * 100).toFixed(1) + '%';
          lastSignal.liquidity = parseFloat(marketMatch[5]).toLocaleString();
        }
      }

      if (line.includes('📊 SIGNAL:')) {
        const match = line.match(/📊 SIGNAL: ([^(]+) \((\d+)%\) \| Exposure: ([\d.]+)%/);
        if (match) {
          lastSignal = {
            market: currentMarket,
            action: match[1].trim(),
            confidence: match[2],
            exposure: match[3],
            effectiveEdge: 'N/A',
            entropy: 'N/A',
            conviction: 'N/A',
            marketOdds: 'N/A',
            zigmaOdds: 'N/A',
            liquidity: 'N/A'
          };
          signals.push(lastSignal);
        }
      }

      if (line.includes('Effective Edge:') && lastSignal) {
        const match = line.match(/Effective Edge: ([\d.]+)% \(raw [\d.]+%, conf ([\d.]+), entropy ([\d.]+), liqFactor [\d.]+\)/);
        if (match) {
          lastSignal.effectiveEdge = match[1] + '%';
          lastSignal.entropy = match[3];
          lastSignal.conviction = (parseFloat(match[2]) * 100).toFixed(0) + '%';
        }
      }
    }

    return { signals: signals.slice(-1) }; // Last one
  };

  if (!latestSignal) {
    return (
      <section className="border border-green-400 p-4">
        <p className="text-sm text-green-400 mb-4">Loading latest signal...</p>
      </section>
    );
  }

  return (
    <section className="border border-green-400 p-4">
      <p className="text-sm text-green-400 mb-4">
        Below is a qualifying signal from a recent cycle.
      </p>
      <div className="text-green-400 mb-4">[ LATEST SIGNAL OUTPUT ]</div>

      <div className="font-mono text-sm space-y-3">
        {latestSignal.action === 'NO_TRADE' ? (
          <>
            <div className="border-t border-green-400 pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">ACTION: </span>
                <span className="text-green-400 font-bold">{latestSignal.action}</span>
              </div>
              <div>
                <span className="text-muted-foreground">PRIMARY REASON: </span>
                <span className="text-muted-foreground">Entropy & execution risk exceeded tolerance</span>
              </div>
              <div>
                <span className="text-muted-foreground">Secondary: </span>
                <span className="text-muted-foreground">Market odds divergence observed but rejected</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">MARKET: </span>
              <span>{latestSignal.market}</span>
            </div>
            <div className="border-t border-green-400 pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">MARKET ODDS: </span>
                <span>{latestSignal.marketOdds}</span>
              </div>
              <div>
                <span className="text-green-400">Zigma Odds: </span>
                <span className="text-yellow-400">{latestSignal.zigmaOdds}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-muted-foreground">MARKET: </span>
              <span>{latestSignal.market}</span>
            </div>

            <div className="border-t border-green-400 pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">MARKET ODDS: </span>
                <span>{latestSignal.marketOdds}</span>
              </div>
              <div>
                <span className="text-green-400">Zigma Odds: </span>
                <span className="text-yellow-400">{latestSignal.zigmaOdds}</span>
              </div>
            </div>

            <div className="border-t border-green-400 pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">EFFECTIVE EDGE: </span>
                <span className="text-green-400">+{latestSignal.effectiveEdge === 'N/A' ? '—' : (parseFloat(latestSignal.effectiveEdge).toFixed(2) + '%')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ENTROPY PENALTY: </span>
                <span className="text-red-400">-{latestSignal.entropy === 'N/A' ? '—' : latestSignal.entropy}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">LIQUIDITY: </span>
                <span className="text-green-400">PASS ({latestSignal.liquidity})</span>
              </div>
            </div>

            <div className="border-t border-green-400 pt-3 space-y-1">
              <div>
                <span className="text-muted-foreground">CONVICTION: </span>
                <span className="text-yellow-400">{latestSignal.conviction === 'N/A' ? '—' : latestSignal.conviction}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ACTION: </span>
                <span className="text-green-400 font-bold">{latestSignal.action}</span>
              </div>
              {latestSignal.action === 'NO_TRADE' && (
                <div>
                  <span className="text-muted-foreground">Reason: </span>
                  <span className="text-muted-foreground">Edge rejected after entropy and execution risk checks.</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Metric not applicable for NO_TRADE outcomes.
      </p>
    </section>
  );
};

export default LatestSignal;
