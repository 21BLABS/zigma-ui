import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { exportToJSON } from "@/utils/export";
import { Pagination, usePagination } from "@/components/Pagination";

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

const Watchlist = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [newMarketId, setNewMarketId] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const [importSuccess, setImportSuccess] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://api.zigma.pro");
  }, []);

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
            <h1 className="text-4xl font-bold tracking-tight mb-2">WATCHLIST</h1>
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
          <p className="text-muted-foreground">Track markets you're interested in</p>
          {importError && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {importError}
            </div>
          )}
          {importSuccess && (
            <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
              {importSuccess}
            </div>
          )}
        </div>

        {/* Add to Watchlist */}
        <div className="mb-8">
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Your Watchlist
            {watchlist && <Badge variant="outline" className="border-green-500 text-green-400 ml-2">{watchlist.length}</Badge>}
          </h2>

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
            <CardTitle className="text-sm text-blue-400">Tips</CardTitle>
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
      </main>

      <Footer />
    </div>
  );
};

export default Watchlist;
