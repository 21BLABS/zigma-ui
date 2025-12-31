import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from "lucide-react";

interface Signal {
  market: string;
  action: string;
  confidence: string;
  exposure: string;
  timestamp: string;
  effectiveEdge: string;
  entropy: string;
  conviction: string;
  reason?: string;
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

export function LogsDisplay({ logs }: { logs?: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      if (logs) return { logs };
      // No mock data in prod
      return { logs: "" };
    },
    refetchInterval: false,
  });

  const [expandedMarkets, setExpandedMarkets] = useState<Set<string>>(new Set());
  const [expandedAudits, setExpandedAudits] = useState<Set<string>>(new Set());

  const toggleExpand = (market: string) => {
    setExpandedMarkets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(market)) newSet.delete(market);
      else newSet.add(market);
      return newSet;
    });
  };

  const toggleAudit = (market: string) => {
    setExpandedAudits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(market)) newSet.delete(market);
      else newSet.add(market);
      return newSet;
    });
  };

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
      if (line.includes(' SIGNAL:')) {
        const match = line.match(/ SIGNAL: ([^(]+) \((\d+)%\) \| Exposure: ([\d.]+)%/);
        if (match) {
          const signal: Signal = {
            market: currentMarket, // Set to currentMarket from LLM Analyzing
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

      // Extract market name for the last signal
      if (line.trim().startsWith('Market:')) {
        const trimmed = line.trim();
        const match = trimmed.match(/Market: (.+)/);
        if (match && lastSignal) {
          lastSignal.market = match[1].trim();
          console.log('Parsed market:', match[1].trim());
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

  // Group signals by market
  const groupedSignals = signals.reduce((acc, signal) => {
    if (!acc[signal.market]) acc[signal.market] = [];
    acc[signal.market].push(signal);
    return acc;
  }, {} as Record<string, Signal[]>);

  // Create final signals per market
  const finalSignals: Signal[] = Object.entries(groupedSignals).map(([market, sigs]) => {
    const validSigs = sigs.filter(s => s.action !== 'NO_TRADE' && s.effectiveEdge !== '—' && s.entropy !== '—');
    if (validSigs.length > 0) {
      const best = validSigs.reduce((prev, curr) => 
        (parseFloat(curr.effectiveEdge) || 0) > (parseFloat(prev.effectiveEdge) || 0) ? curr : prev
      );
      const edge = parseFloat(best.effectiveEdge);
      let strength = 'VERY_LOW';
      if (edge >= 1.5) strength = 'HIGH';
      else if (edge >= 0.5) strength = 'MEDIUM';
      else if (edge >= 0.2) strength = 'LOW';
      return {
        ...best,
        conviction: strength,
        market,
        timestamp: sigs[0].timestamp
      };
    } else {
      return {
        market,
        action: 'NO_TRADE',
        confidence: '70%',
        exposure: '0.00%',
        effectiveEdge: '—',
        entropy: '—',
        conviction: '—',
        timestamp: sigs[0].timestamp,
        reason: 'Insufficient resolved edge'
      };
    }
  });

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
            Markets deeply evaluated this cycle: {finalSignals.length} | Signals generated: {finalSignals.filter(s => s.action !== 'NO_TRADE').length}
          </p>
        </CardContent>
      </Card>

      {/* Final Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {finalSignals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Effective Edge</TableHead>
                  <TableHead>Entropy</TableHead>
                  <TableHead>Signal Strength</TableHead>
                  <TableHead>Suggested Max Exposure</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalSignals.map((signal, index) => (
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
                    <TableCell>{parseFloat(signal.effectiveEdge).toFixed(2)}%</TableCell>
                    <TableCell title="Entropy is bounded and capped by design.">{signal.entropy}</TableCell>
                    <TableCell title="Signal Strength reflects post-entropy adjusted edge">{signal.conviction}</TableCell>
                    <TableCell>{signal.exposure}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div> // Close the overflow-x-auto div here
          ) : (
            <p className="text-muted-foreground">No final signals</p>
          )}
        </CardContent>
      </Card>

// ...
      {/* Recent Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Evaluation Attempts (Audit)</CardTitle>
        </CardHeader>
        <CardContent>
          {signals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Signal Confidence</TableHead>
                  <TableHead>Suggested Max Exposure</TableHead>
                  <TableHead>Effective Edge</TableHead>
                  <TableHead>Entropy</TableHead>
                  <TableHead>Signal Strength</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedSignals).map(([market, sigs]) => (
                  <React.Fragment key={market}>
                    <TableRow>
                      <TableCell colSpan={7} className="font-bold bg-gray-800 text-center cursor-pointer" onClick={() => toggleAudit(market)}>
                        <div className="flex items-center justify-center">
                          {expandedAudits.has(market) ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                          {market} → {sigs.length} evaluations (click to expand audit)
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedAudits.has(market) && sigs.map((signal, index) => (
                      <TableRow key={index}>
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
                        <TableCell>{signal.effectiveEdge === 'N/A' ? '—' : parseFloat(signal.effectiveEdge).toFixed(2) + '%'}</TableCell>
                        <TableCell>{signal.entropy === 'N/A' ? '—' : signal.entropy}</TableCell>
                        <TableCell>—</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(signal.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            </div> // Close the overflow-x-auto div here
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
                      <p className="text-muted-foreground">Zigma Odds</p>
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
