import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useNotifications } from "@/components/NotificationSystem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportToJSON } from "@/utils/export";
import { Pagination, usePagination } from "@/components/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WatchlistItem {
  id: string;
  marketId: string;
  question: string;
  category: string;
  addedAt: string;
  currentOdds?: number;
  lastSignal?: {
    edge: number;
    confidenceScore: number;
    timestamp: string;
  };
}

interface RiskConfig {
  maxConcentration: number;
  maxSectorExposure: number;
  maxSlippage: number;
  maxSpread: number;
  minLiquidity: number;
  minEdge: number;
  minConfidence: number;
  maxPositionSize: number;
  kellyFraction: number;
  positionSizingMode: 'kelly' | 'fixed' | 'risk-parity';
}

const defaultRiskConfig: RiskConfig = {
  maxConcentration: 10,
  maxSectorExposure: 30,
  maxSlippage: 5,
  maxSpread: 2,
  minLiquidity: 10000,
  minEdge: 5,
  minConfidence: 60,
  maxPositionSize: 5000,
  kellyFraction: 0.25,
  positionSizingMode: 'kelly'
};

const Settings = () => {
  const [config, setConfig] = useState<RiskConfig>(defaultRiskConfig);
  const [saved, setSaved] = useState(false);
  const { alertConfig, updateAlertConfig: updateNotificationAlertConfig } = useNotifications();
  
  // Watchlist states
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [newMarketId, setNewMarketId] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const [importSuccess, setImportSuccess] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedConfig = localStorage.getItem('zigma-risk-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

  const handleSave = () => {
    localStorage.setItem('zigma-risk-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setConfig(defaultRiskConfig);
    localStorage.removeItem('zigma-risk-config');
  };

  // Watchlist functionality
  const { data: watchlist, isLoading: loading, error } = useQuery<WatchlistItem[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetch(`${apiBaseUrl}/api/watchlist`);
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      return res.json();
    },
    refetchInterval: 60000,
    enabled: !!apiBaseUrl,
  });

  const { currentPage, totalPages, startIndex, endIndex, goToPage, resetPage } = usePagination({
    totalItems: watchlist?.length || 0,
    itemsPerPage: 10
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (marketId: string) => {
      const res = await fetch(`${apiBaseUrl}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId }),
      });
      if (!res.ok) throw new Error("Failed to add to watchlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      setNewMarketId("");
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (marketId: string) => {
      const res = await fetch(`${apiBaseUrl}/api/watchlist/${marketId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Failed to remove from watchlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const handleAddToWatchlist = () => {
    if (newMarketId.trim()) {
      addToWatchlistMutation.mutate(newMarketId.trim());
    }
  };

  const handleRemoveFromWatchlist = (marketId: string) => {
    removeFromWatchlistMutation.mutate(marketId);
  };

  const bulkImportMutation = useMutation({
    mutationFn: async (marketIds: string[]) => {
      const res = await fetch(`${apiBaseUrl}/api/watchlist/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketIds }),
      });
      if (!res.ok) throw new Error("Failed to bulk import");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      setImportSuccess(`Successfully imported ${data.imported} markets`);
      setImportError("");
      setTimeout(() => setImportSuccess(""), 3000);
    },
    onError: (err: Error) => {
      setImportError(err.message);
      setImportSuccess("");
    },
  });

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        let marketIds: string[] = [];
        if (Array.isArray(data)) {
          marketIds = data.map((item: any) => item.marketId || item.id).filter(Boolean);
        } else if (data.marketIds && Array.isArray(data.marketIds)) {
          marketIds = data.marketIds;
        }
        
        if (marketIds.length === 0) {
          setImportError("No valid market IDs found in file");
          return;
        }
        
        bulkImportMutation.mutate(marketIds);
      } catch (err) {
        setImportError("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      <SiteHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">PROFILE & SETTINGS</h1>
              <p className="text-muted-foreground">Manage your preferences and watchlist</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-gray-700 text-gray-200 hover:bg-gray-900"
              >
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                {saved ? '✓ Saved' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-green-500/30">
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Settings</TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">

        {/* Risk Parameters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            Risk Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Concentration</CardTitle>
                <CardDescription>Max % of portfolio per position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxConcentration}
                    onChange={(e) => setConfig({ ...config, maxConcentration: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="1"
                    max="100"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Prevents overexposure to single market
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Sector Exposure</CardTitle>
                <CardDescription>Max % of portfolio per sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxSectorExposure}
                    onChange={(e) => setConfig({ ...config, maxSectorExposure: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="1"
                    max="100"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Limits exposure to correlated markets
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Slippage</CardTitle>
                <CardDescription>Max acceptable slippage %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxSlippage}
                    onChange={(e) => setConfig({ ...config, maxSlippage: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="0.1"
                    max="50"
                    step="0.1"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Rejects trades with high price impact
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Spread</CardTitle>
                <CardDescription>Max bid-ask spread %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.maxSpread}
                    onChange={(e) => setConfig({ ...config, maxSpread: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="0.1"
                    max="20"
                    step="0.1"
                  />
                  <span className="text-red-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Avoids illiquid markets
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-red-400">Max Position Size</CardTitle>
                <CardDescription>Maximum position in USD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">$</span>
                  <Input
                    type="number"
                    value={config.maxPositionSize}
                    onChange={(e) => setConfig({ ...config, maxPositionSize: Number(e.target.value) })}
                    className="bg-black/50 border-red-500/30"
                    min="100"
                    max="100000"
                    step="100"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Hard cap on position size
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Signal Filters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Signal Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-yellow-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">Min Liquidity</CardTitle>
                <CardDescription>Minimum market liquidity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">$</span>
                  <Input
                    type="number"
                    value={config.minLiquidity}
                    onChange={(e) => setConfig({ ...config, minLiquidity: Number(e.target.value) })}
                    className="bg-black/50 border-yellow-500/30"
                    min="1000"
                    max="1000000"
                    step="1000"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only signals with sufficient liquidity
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">Min Edge</CardTitle>
                <CardDescription>Minimum effective edge %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.minEdge}
                    onChange={(e) => setConfig({ ...config, minEdge: Number(e.target.value) })}
                    className="bg-black/50 border-yellow-500/30"
                    min="0"
                    max="50"
                    step="0.5"
                  />
                  <span className="text-yellow-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Filters low-edge signals
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-400">Min Confidence</CardTitle>
                <CardDescription>Minimum model confidence %</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.minConfidence}
                    onChange={(e) => setConfig({ ...config, minConfidence: Number(e.target.value) })}
                    className="bg-black/50 border-yellow-500/30"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="text-yellow-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only high-confidence signals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            Alert Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-purple-400">Min Edge for Alert</CardTitle>
                <CardDescription>Minimum edge to trigger notification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={alertConfig.minEdgeForAlert}
                    onChange={(e) => updateNotificationAlertConfig({ minEdgeForAlert: Number(e.target.value) })}
                    className="bg-black/50 border-purple-500/30"
                    min="0"
                    max="50"
                    step="0.5"
                  />
                  <span className="text-purple-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only notify when edge exceeds threshold
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-purple-400">Min Confidence for Alert</CardTitle>
                <CardDescription>Minimum confidence to trigger notification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={alertConfig.minConfidenceForAlert}
                    onChange={(e) => updateNotificationAlertConfig({ minConfidenceForAlert: Number(e.target.value) })}
                    className="bg-black/50 border-purple-500/30"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span className="text-purple-400">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only notify when confidence exceeds threshold
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-sm text-purple-400">Alert Types</CardTitle>
                <CardDescription>Toggle notification types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableEdgeAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableEdgeAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">Edge Changes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableNewSignalAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableNewSignalAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">New Signals</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableResolvedAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableResolvedAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">Resolved Signals</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.enableSystemAlerts}
                      onChange={(e) => updateNotificationAlertConfig({ enableSystemAlerts: e.target.checked })}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-sm text-white">System Alerts</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Position Sizing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Position Sizing
          </h2>
          
          <Card className="border-blue-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-sm text-blue-400">Position Sizing Mode</CardTitle>
              <CardDescription>How positions are sized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setConfig({ ...config, positionSizingMode: 'kelly' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    config.positionSizingMode === 'kelly'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-1">Kelly Criterion</h3>
                  <p className="text-xs text-muted-foreground">
                    Optimal sizing based on edge and odds
                  </p>
                </button>

                <button
                  onClick={() => setConfig({ ...config, positionSizingMode: 'fixed' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    config.positionSizingMode === 'fixed'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-1">Fixed Size</h3>
                  <p className="text-xs text-muted-foreground">
                    Same position size for all trades
                  </p>
                </button>

                <button
                  onClick={() => setConfig({ ...config, positionSizingMode: 'risk-parity' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    config.positionSizingMode === 'risk-parity'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-1">Risk Parity</h3>
                  <p className="text-xs text-muted-foreground">
                    Equal risk allocation across positions
                  </p>
                </button>
              </div>

              {config.positionSizingMode === 'kelly' && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Label htmlFor="kellyFraction">Kelly Fraction</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="kellyFraction"
                      type="number"
                      value={config.kellyFraction}
                      onChange={(e) => setConfig({ ...config, kellyFraction: Number(e.target.value) })}
                      className="bg-black/50 border-blue-500/30"
                      min="0.01"
                      max="1"
                      step="0.01"
                    />
                    <span className="text-blue-400">
                      {config.kellyFraction === 0.25 ? 'Quarter-Kelly (conservative)' :
                       config.kellyFraction === 0.5 ? 'Half-Kelly (moderate)' :
                       config.kellyFraction === 1 ? 'Full-Kelly (aggressive)' : 'Custom'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Fraction of full Kelly to use. Lower = more conservative.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">WATCHLIST</h2>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={bulkImportMutation.isPending}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    {bulkImportMutation.isPending ? "Importing..." : "Import Watchlist"}
                  </Button>
                  {watchlist && watchlist.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        exportToJSON(watchlist, `zigma-watchlist-${new Date().toISOString().split('T')[0]}`);
                      }}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      Export Watchlist
                    </Button>
                  )}
                </div>
              </div>
              {importError && (
                <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                  {importError}
                </div>
              )}
              {importSuccess && (
                <div className="mb-4 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
                  {importSuccess}
                </div>
              )}
            </div>

            {/* Add to Watchlist */}
            <div className="mb-6">
              <Card className="border-green-500/30 bg-black/40">
                <CardHeader>
                  <CardTitle className="text-sm text-green-400">Add to Watchlist</CardTitle>
                  <CardDescription>Add a market by its ID</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter market ID (e.g., will-bitcoin-hit-150k-by-2026)"
                      value={newMarketId}
                      onChange={(e) => setNewMarketId(e.target.value)}
                      className="flex-1 bg-black/50 border-green-500/30"
                    />
                    <Button 
                      onClick={handleAddToWatchlist}
                      disabled={addToWatchlistMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 text-black"
                    >
                      {addToWatchlistMutation.isPending ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Watchlist Items */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Your Watchlist
                {watchlist && <Badge variant="outline" className="border-green-500 text-green-400 ml-2">{watchlist.length}</Badge>}
              </h3>

              {/* Search Input */}
              {watchlist && watchlist.length > 0 && (
                <div className="mb-4">
                  <Input
                    placeholder="Search markets by question or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/50 border-green-500/30 text-green-100 placeholder:text-green-200/40"
                  />
                </div>
              )}
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-green-500/30 bg-black/40">
                      <CardContent className="pt-6">
                        <Skeleton className="h-20 bg-green-500/10" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card className="border-red-500/30 bg-black/40">
                  <CardContent className="pt-6">
                    <p className="text-red-400">Failed to load watchlist</p>
                  </CardContent>
                </Card>
              ) : watchlist && watchlist.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {watchlist
                      .filter(item => 
                        searchQuery === '' || 
                        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(startIndex, endIndex)
                      .map((item) => (
                      <Card key={item.id} className="border-green-500/30 bg-black/40">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-400 mb-2">
                                {item.question}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  {item.category}
                                </Badge>
                                <span>Added: {new Date(item.addedAt).toLocaleDateString()}</span>
                              </div>
                              {item.currentOdds && (
                                <div className="text-xs text-muted-foreground">
                                  Current Odds: {item.currentOdds.toFixed(2)}%
                                </div>
                              )}
                              {item.lastSignal && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Last Signal: Edge {item.lastSignal.edge.toFixed(2)}% | Conf {item.lastSignal.confidenceScore?.toFixed(0) ?? '—'}%
                                </div>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveFromWatchlist(item.marketId)}
                              disabled={removeFromWatchlistMutation.isPending}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="mt-6">
                    <Pagination
                      totalItems={watchlist.length}
                      itemsPerPage={10}
                      currentPage={currentPage}
                      onPageChange={goToPage}
                    />
                  </div>
                </>
              ) : (
                <Card className="border-green-500/30 bg-black/40">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center py-8">
                      Your watchlist is empty. Add markets above to track them.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tips */}
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-sm text-blue-400">Watchlist Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-400/80 space-y-2">
                  <li>• Add markets you want to track for signals</li>
                  <li>• Watchlist items will appear in your dashboard</li>
                  <li>• Get notified when new signals are generated for watchlist items</li>
                  <li>• Market IDs can be found on Polymarket URLs</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
