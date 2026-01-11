import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

interface PaperPosition {
  id: string;
  marketId: string;
  market: string;
  action: 'BUY YES' | 'BUY NO';
  entryPrice: number;
  currentPrice: number;
  size: number;
  entryValue: number;
  currentValue: number;
  pnl: number;
  roi: number;
  timestamp: string;
  status: 'OPEN' | 'CLOSED';
  exitPrice?: number;
  exitTimestamp?: string;
}

interface PaperPortfolio {
  initialCapital: number;
  currentCapital: number;
  totalPnl: number;
  totalRoi: number;
  openPositions: number;
  closedPositions: number;
  winRate: number;
  positions: PaperPosition[];
}

const PaperTrading = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [marketId, setMarketId] = useState<string>("");
  const [action, setAction] = useState<'BUY YES' | 'BUY NO'>('BUY YES');
  const [size, setSize] = useState<number>(100);
  const queryClient = useQueryClient();

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
    
    const savedCapital = localStorage.getItem('zigma-paper-capital');
    if (savedCapital) {
      setInitialCapital(Number(savedCapital));
    }
  }, []);

  const { data: portfolio, isLoading, refetch } = useQuery<PaperPortfolio>({
    queryKey: ["paper-portfolio"],
    queryFn: async () => {
      const saved = localStorage.getItem('zigma-paper-portfolio');
      if (saved) {
        return JSON.parse(saved);
      }
      return {
        initialCapital,
        currentCapital: initialCapital,
        totalPnl: 0,
        totalRoi: 0,
        openPositions: 0,
        closedPositions: 0,
        winRate: 0,
        positions: []
      };
    },
    enabled: !!apiBaseUrl,
  });

  const openPositionMutation = useMutation({
    mutationFn: async (position: Omit<PaperPosition, 'id' | 'timestamp' | 'currentPrice' | 'currentValue' | 'pnl' | 'roi' | 'status'>) => {
      const newPosition: PaperPosition = {
        ...position,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        currentPrice: position.entryPrice,
        currentValue: position.entryValue,
        pnl: 0,
        roi: 0,
        status: 'OPEN'
      };
      
      const saved = localStorage.getItem('zigma-paper-portfolio');
      let currentPortfolio: PaperPortfolio;
      
      if (saved) {
        currentPortfolio = JSON.parse(saved);
      } else {
        currentPortfolio = {
          initialCapital,
          currentCapital: initialCapital,
          totalPnl: 0,
          totalRoi: 0,
          openPositions: 0,
          closedPositions: 0,
          winRate: 0,
          positions: []
        };
      }
      
      currentPortfolio.positions.push(newPosition);
      currentPortfolio.openPositions++;
      
      localStorage.setItem('zigma-paper-portfolio', JSON.stringify(currentPortfolio));
      return currentPortfolio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper-portfolio"] });
      setMarketId("");
      setSize(100);
    },
  });

  const closePositionMutation = useMutation({
    mutationFn: async (positionId: string) => {
      const saved = localStorage.getItem('zigma-paper-portfolio');
      if (!saved) throw new Error("No portfolio found");
      
      const portfolio: PaperPortfolio = JSON.parse(saved);
      const position = portfolio.positions.find(p => p.id === positionId);
      
      if (!position) throw new Error("Position not found");
      
      position.status = 'CLOSED';
      position.exitPrice = position.currentPrice;
      position.exitTimestamp = new Date().toISOString();
      position.currentValue = position.size * position.exitPrice;
      position.pnl = position.currentValue - position.entryValue;
      position.roi = (position.pnl / position.entryValue) * 100;
      
      portfolio.openPositions--;
      portfolio.closedPositions++;
      portfolio.totalPnl += position.pnl;
      portfolio.currentCapital = portfolio.initialCapital + portfolio.totalPnl;
      portfolio.totalRoi = (portfolio.totalPnl / portfolio.initialCapital) * 100;
      
      const closedPositions = portfolio.positions.filter(p => p.status === 'CLOSED');
      const winningPositions = closedPositions.filter(p => p.pnl > 0);
      portfolio.winRate = closedPositions.length > 0 ? winningPositions.length / closedPositions.length : 0;
      
      localStorage.setItem('zigma-paper-portfolio', JSON.stringify(portfolio));
      return portfolio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper-portfolio"] });
    },
  });

  const resetPortfolioMutation = useMutation({
    mutationFn: async () => {
      const newPortfolio: PaperPortfolio = {
        initialCapital,
        currentCapital: initialCapital,
        totalPnl: 0,
        totalRoi: 0,
        openPositions: 0,
        closedPositions: 0,
        winRate: 0,
        positions: []
      };
      localStorage.setItem('zigma-paper-portfolio', JSON.stringify(newPortfolio));
      localStorage.setItem('zigma-paper-capital', initialCapital.toString());
      return newPortfolio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper-portfolio"] });
    },
  });

  const handleOpenPosition = () => {
    if (!marketId.trim() || size <= 0) return;
    
    openPositionMutation.mutate({
      marketId: marketId.trim(),
      market: `Market ${marketId.trim().slice(0, 20)}...`,
      action,
      entryPrice: 0.5,
      size,
      entryValue: size
    });
  };

  const handleClosePosition = (positionId: string) => {
    closePositionMutation.mutate(positionId);
  };

  const handleReset = () => {
    resetPortfolioMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">PAPER TRADING</h1>
              <p className="text-muted-foreground">Test signals without real money</p>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Reset Portfolio
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {portfolio && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Current Capital</CardTitle>
                  <CardDescription>Portfolio value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${portfolio.currentCapital > portfolio.initialCapital ? 'text-green-400' : 'text-red-400'}`}>
                    ${portfolio.currentCapital.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Initial: ${portfolio.initialCapital.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Total P&L</CardTitle>
                  <CardDescription>All-time profit/loss</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${portfolio.totalPnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolio.totalPnl > 0 ? '+' : ''}${portfolio.totalPnl.toFixed(2)}
                  </div>
                  <p className={`text-xs mt-1 ${portfolio.totalRoi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolio.totalRoi > 0 ? '+' : ''}{portfolio.totalRoi.toFixed(2)}% ROI
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Win Rate</CardTitle>
                  <CardDescription>Winning percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${portfolio.winRate > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {(portfolio.winRate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {portfolio.closedPositions} closed trades
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Open Positions</CardTitle>
                  <CardDescription>Active trades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {portfolio.openPositions}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {portfolio.positions.length} total trades
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Open Position Form */}
        <div className="mb-8">
          <Card className="border-blue-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-sm text-blue-400">Open Paper Trade</CardTitle>
              <CardDescription>Simulate a trade without real money</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="marketId">Market ID</Label>
                  <Input
                    id="marketId"
                    placeholder="e.g., will-bitcoin-hit-150k"
                    value={marketId}
                    onChange={(e) => setMarketId(e.target.value)}
                    className="mt-1 bg-black/50 border-blue-500/30"
                  />
                </div>
                <div>
                  <Label htmlFor="action">Action</Label>
                  <select
                    id="action"
                    value={action}
                    onChange={(e) => setAction(e.target.value as 'BUY YES' | 'BUY NO')}
                    className="mt-1 w-full bg-black/50 border-blue-500/30 text-green-100 rounded-md px-3 py-2"
                  >
                    <option value="BUY YES">BUY YES</option>
                    <option value="BUY NO">BUY NO</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="size">Position Size ($)</Label>
                  <Input
                    id="size"
                    type="number"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="mt-1 bg-black/50 border-blue-500/30"
                    min="10"
                    step="10"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleOpenPosition}
                    disabled={openPositionMutation.isPending}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-black"
                  >
                    {openPositionMutation.isPending ? "Opening..." : "Open Position"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
            Positions
          </h2>

          {isLoading ? (
            <Card className="border-green-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : portfolio && portfolio.positions.length === 0 ? (
            <Card className="border-yellow-500/30 bg-black/40">
              <CardContent className="pt-6">
                <p className="text-yellow-400 mb-2">No positions yet.</p>
                <p className="text-xs text-muted-foreground">Open your first paper trade to start tracking performance.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {portfolio?.positions.map((position) => (
                <Card key={position.id} className={`border ${position.status === 'OPEN' ? 'border-blue-500/30' : 'border-gray-500/30'} bg-black/40`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            position.action === 'BUY YES' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                          }`}>
                            {position.action}
                          </span>
                          <Badge variant={position.status === 'OPEN' ? 'default' : 'secondary'}>
                            {position.status}
                          </Badge>
                        </div>
                        <h3 className="text-white font-semibold">{position.market}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Opened: {new Date(position.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${position.pnl > 0 ? 'text-green-400' : position.pnl < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {position.pnl > 0 ? '+' : ''}${position.pnl.toFixed(2)}
                        </div>
                        <p className={`text-sm ${position.roi > 0 ? 'text-green-400' : position.roi < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {position.roi > 0 ? '+' : ''}{position.roi.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Entry Price</p>
                        <p className="font-mono">{(position.entryPrice * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Price</p>
                        <p className="font-mono">{(position.currentPrice * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Position Size</p>
                        <p className="font-mono">${position.size.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="font-mono">${position.currentValue.toFixed(2)}</p>
                      </div>
                    </div>

                    {position.status === 'OPEN' && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => handleClosePosition(position.id)}
                          disabled={closePositionMutation.isPending}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          {closePositionMutation.isPending ? "Closing..." : "Close Position"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-400">Paper Trading Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-400/80">
              Paper trading uses simulated data and does not reflect real market conditions. Slippage, liquidity constraints, and execution delays are not accurately modeled.
              This is for educational purposes only and should not be used as the sole basis for trading decisions.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaperTrading;
