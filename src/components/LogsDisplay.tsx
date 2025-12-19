import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Signal {
  market: string;
  action: string;
  confidence: string;
  exposure: string;
  timestamp: string;
  effectiveEdge: string;
  entropy: string;
  conviction: string;
}

interface MarketData {
  marketId: string;
  market: string;
  yesPrice: number;
  winProb: number;
  action: string;
  liquidity: number;
  edge: number;
}

export function LogsDisplay() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      // Mock logs data since no API available
      const mockLogs = `
--- Agent Zigma Cycle: 2025-12-19T15:55:33.894Z ---
[LLM] Analyzing: weed-rescheduled-in-2025 - Weed rescheduled in 2025?
📊 SIGNAL: NO_TRADE (80%) | Exposure: 0.00%
DEBUG: Market Weed rescheduled in ..., yesPrice 0.019, action NO_TRADE, winProb 0.01, betPrice 0.5, liquidity 657865.61075
Effective Edge: 0.6% (raw 1.0%, conf 0.7, entropy 0.1, liqFactor 1)
[LLM] Analyzing: khamenei-out-as-supreme-leader-of-iran-in-2025 - Khamenei out as Supreme Leader of Iran in 2025?
📊 SIGNAL: BUY YES (80%) | Exposure: 0.00%
DEBUG: Market Khamenei out as Supr..., yesPrice 0.013, action BUY YES, winProb 0.07500000000000004, betPrice 0.5, liquidity 56503.25636
Effective Edge: 2.9% (raw 6.1%, conf 0.7, entropy 0.1, liqFactor 0.7533767514666666)
[LLM] Analyzing: russia-x-ukraine-ceasefire-in-2025 - Russia x Ukraine ceasefire in 2025?
📊 SIGNAL: BUY YES (80%) | Exposure: 0.00%
DEBUG: Market Russia x Ukraine cea..., yesPrice 0.032, action BUY YES, winProb 0.24999999999999997, betPrice 0.5, liquidity 946087.24707
Effective Edge: 2.3% (raw 6.5%, conf 0.7, entropy 0.5, liqFactor 1)
[LLM] Analyzing: will-spacex-have-between-160-179-launches-in-2025 - Will SpaceX have between 160-179 launches in 2025?
📊 SIGNAL: BUY NO (80%) | Exposure: 0.00%
DEBUG: Market Will SpaceX have bet..., yesPrice 0.983, action BUY NO, winProb 0.01, betPrice 0.5, liquidity 9503.79544
Effective Edge: 6.5% (raw 90.9%, conf 0.7, entropy 0.1, liqFactor 0.08465119999999999)
[LLM] Analyzing: will-nvidia-be-the-largest-company-in-the-world-by-market-cap-on-december-31-2025 - Will NVIDIA be the largest company in the world by market cap on December 31?
📊 SIGNAL: NO_TRADE (80%) | Exposure: 3.00%
DEBUG: Market Will NVIDIA be the l..., yesPrice 0.935, action NO_TRADE, winProb 0.9249999999999999, betPrice 0.06499999999999995, liquidity 104330.6642
Effective Edge: 54.2% (raw 86.0%, conf 0.7, entropy 0.1, liqFactor 1)
`;
      return { logs: mockLogs };
    },
    refetchInterval: false, // No auto-refresh since mock
  });

  const parseLogs = (logs: string) => {
    const lines = logs.split('\n');
    const signals: Signal[] = [];
    const markets: MarketData[] = [];
    let lastCycleTime = '';
    let currentMarketId = '';
    let currentMarket = '';
    let lastSignal: Signal | null = null;

    for (const line of lines) {
      // Extract cycle start time
      if (line.includes('Agent Zigma Cycle:')) {
        const match = line.match(/Agent Zigma Cycle: ([^|]+)/);
        if (match) {
          lastCycleTime = match[1].replace(' ---', '').trim();
        }
      }

      // Track current market being analyzed
      if (line.includes('[LLM] Analyzing:')) {
        const match = line.match(/\[LLM\] Analyzing: (.+)/);
        if (match) {
          const fullStr = match[1].trim();
          const parts = fullStr.split(' - ');
          if (parts.length >= 2) {
            currentMarketId = parts[0].trim();
            currentMarket = parts.slice(1).join(' - ').trim();
          } else {
            currentMarket = fullStr;
            currentMarketId = '';
          }
        }
      }

      // Extract signals
      if (line.includes('📊 SIGNAL:')) {
        const match = line.match(/📊 SIGNAL: ([^(]+) \((\d+)%\) \| Exposure: ([\d.]+)%/);
        if (match) {
          const signal: Signal = {
            market: currentMarket || 'Unknown Market',
            action: match[1].trim(),
            confidence: match[2],
            exposure: match[3],
            timestamp: lastCycleTime,
            effectiveEdge: 'N/A',
            entropy: 'N/A',
            conviction: 'N/A'
          };
          signals.push(signal);
          lastSignal = signal;
        }
      }

      // Extract effective edge data
      if (line.includes('Effective Edge:') && lastSignal) {
        const match = line.match(/Effective Edge: ([\d.]+)% \(raw [\d.]+%, conf ([\d.]+), entropy ([\d.]+), liqFactor [\d.]+\)/);
        if (match) {
          lastSignal.effectiveEdge = match[1] + '%';
          lastSignal.entropy = match[3];
          lastSignal.conviction = (parseFloat(match[2]) * 100).toFixed(0) + '%';
        }
      }

      // Extract market analysis
      if (line.includes('DEBUG: Market') && line.includes('yesPrice')) {
        const marketMatch = line.match(/DEBUG: Market (.+?), yesPrice ([\d.]+), action (.+?), winProb ([\d.]+), betPrice [\d.]+, liquidity ([\d.]+)/);
        if (marketMatch) {
          const marketName = marketMatch[1].trim();
          const yesPrice = parseFloat(marketMatch[2]);
          const winProb = parseFloat(marketMatch[4]);
          const action = marketMatch[3].trim();
          const liquidity = parseFloat(marketMatch[5]);
          const edge = Math.abs(winProb - yesPrice) * 100;

          markets.push({
            marketId: currentMarketId,
            market: marketName,
            yesPrice,
            winProb,
            action,
            liquidity,
            edge
          });
        }
      }
    }

    return { signals: signals.slice(-10), markets: markets.slice(-5), lastCycleTime };
  };

  if (isLoading) return <div className="text-center py-8">Loading trading intelligence...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading data: {error.message}</div>;

  const { signals, markets, lastCycleTime } = parseLogs(data?.logs || '');

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-muted-foreground mb-4">
        Recent system cycles (informational, not advice)
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agent Zigma Intelligence</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Cycle Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last analysis: {lastCycleTime || 'No recent cycle'}
          </p>
          <p className="text-sm">
            Markets analyzed: {markets.length} | Signals generated: {signals.length}
          </p>
        </CardContent>
      </Card>

      {/* Recent Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Trading Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {signals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Model Stability</TableHead>
                  <TableHead>Exposure</TableHead>
                  <TableHead>Effective Edge</TableHead>
                  <TableHead>Entropy</TableHead>
                  <TableHead>Conviction</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {signal.market}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        signal.action.includes('BUY') ? 'default' :
                        signal.action === 'NO_TRADE' ? 'secondary' : 'destructive'
                      }>
                        {signal.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{signal.confidence}%</TableCell>
                    <TableCell>{signal.exposure}%</TableCell>
                    <TableCell>{signal.effectiveEdge}</TableCell>
                    <TableCell>{signal.entropy}</TableCell>
                    <TableCell>{signal.conviction}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No recent signals</p>
          )}
        </CardContent>
      </Card>

      {/* Market Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {markets.length > 0 ? (
            <div className="space-y-4">
              {markets.map((market, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    {market.marketId ? (
                      <a
                        href={`https://polymarket.com/market/${market.marketId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:underline text-blue-600"
                      >
                        {market.market}
                      </a>
                    ) : (
                      <h3 className="font-medium text-sm">{market.market}</h3>
                    )}
                    <Badge variant="outline">{market.action}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Market Odds</p>
                      <p className="font-medium">{(market.yesPrice * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Agent Odds</p>
                      <p className="font-medium">{(market.winProb * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Edge</p>
                      <div className="flex items-center">
                        <p className="font-medium">{market.edge.toFixed(1)}%</p>
                        {market.edge > 5 ? (
                          market.winProb > market.yesPrice ? <TrendingUp className="w-4 h-4 text-green-500 ml-1" /> : <TrendingDown className="w-4 h-4 text-red-500 ml-1" />
                        ) : <Minus className="w-4 h-4 text-gray-500 ml-1" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Liquidity</p>
                      <p className="font-medium">${market.liquidity.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No market data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
