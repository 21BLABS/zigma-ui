import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CryptoMarketsConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const CryptoMarketsConfig = ({ config, setConfig }: CryptoMarketsConfigProps) => {
  // Initialize local state with config values or defaults
  const [minEdge, setMinEdge] = useState(config.minEdge?.toString() || "0.04");
  const [minLiquidity, setMinLiquidity] = useState(config.minLiquidity?.toString() || "5000");
  const [autoExecute, setAutoExecute] = useState(config.autoExecute !== false);
  const [includedAssets, setIncludedAssets] = useState<string[]>(
    config.includedAssets || ["BTC", "ETH", "SOL", "AVAX", "BNB"]
  );
  const [excludedAssets, setExcludedAssets] = useState<string[]>(
    config.excludedAssets || []
  );
  const [newAsset, setNewAsset] = useState("");
  const [timeHorizon, setTimeHorizon] = useState(config.timeHorizon?.toString() || "14");
  
  // Update parent config when local state changes
  useEffect(() => {
    setConfig({
      ...config,
      minEdge: parseFloat(minEdge),
      minLiquidity: parseInt(minLiquidity),
      autoExecute,
      includedAssets,
      excludedAssets,
      timeHorizon: parseInt(timeHorizon)
    });
  }, [minEdge, minLiquidity, autoExecute, includedAssets, excludedAssets, timeHorizon]);
  
  // Handle edge slider change
  const handleEdgeChange = (value: number[]) => {
    setMinEdge(value[0].toString());
  };
  
  // Handle liquidity slider change
  const handleLiquidityChange = (value: number[]) => {
    setMinLiquidity(value[0].toString());
  };
  
  // Handle time horizon slider change
  const handleTimeHorizonChange = (value: number[]) => {
    setTimeHorizon(value[0].toString());
  };
  
  // Handle input changes
  const handleEdgeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setMinEdge(e.target.value);
    } else {
      setMinEdge(e.target.value);
    }
  };
  
  const handleLiquidityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setMinLiquidity(e.target.value);
    } else {
      setMinLiquidity(e.target.value);
    }
  };
  
  const handleTimeHorizonInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setTimeHorizon(e.target.value);
    } else {
      setTimeHorizon(e.target.value);
    }
  };
  
  // Handle input blur (validate and format)
  const handleEdgeBlur = () => {
    let value = parseFloat(minEdge);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 1) {
      value = 1;
    }
    setMinEdge(value.toString());
  };
  
  const handleLiquidityBlur = () => {
    let value = parseInt(minLiquidity);
    if (isNaN(value) || value < 0) {
      value = 5000;
    }
    setMinLiquidity(value.toString());
  };
  
  const handleTimeHorizonBlur = () => {
    let value = parseInt(timeHorizon);
    if (isNaN(value) || value < 1) {
      value = 14;
    }
    setTimeHorizon(value.toString());
  };
  
  // Handle asset management
  const addAsset = () => {
    if (!newAsset.trim()) return;
    
    const asset = newAsset.trim().toUpperCase();
    
    if (!includedAssets.includes(asset)) {
      setIncludedAssets([...includedAssets, asset]);
    }
    
    setNewAsset("");
  };
  
  const removeIncludedAsset = (asset: string) => {
    setIncludedAssets(includedAssets.filter(a => a !== asset));
  };
  
  const addExcludedAsset = (asset: string) => {
    if (!excludedAssets.includes(asset)) {
      setExcludedAssets([...excludedAssets, asset]);
    }
    
    // Remove from included assets if present
    if (includedAssets.includes(asset)) {
      setIncludedAssets(includedAssets.filter(a => a !== asset));
    }
  };
  
  const removeExcludedAsset = (asset: string) => {
    setExcludedAssets(excludedAssets.filter(a => a !== asset));
  };
  
  // Popular crypto assets
  const popularAssets = [
    "BTC", "ETH", "SOL", "AVAX", "BNB", "XRP", "ADA", "DOGE", "MATIC", "DOT", 
    "LINK", "UNI", "SHIB", "LTC", "ATOM", "XLM", "NEAR", "ALGO", "FIL", "APE"
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Market Filters</h3>
        <p className="text-sm text-muted-foreground">
          Configure which crypto markets to trade
        </p>
        
        {/* Minimum Edge */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minEdge">Minimum Edge</Label>
            <div className="w-16">
              <Input
                id="minEdge"
                type="text"
                value={minEdge}
                onChange={handleEdgeInput}
                onBlur={handleEdgeBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minEdge-slider"
            min={0.01}
            max={0.2}
            step={0.01}
            value={[parseFloat(minEdge) || 0.04]}
            onValueChange={handleEdgeChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets with an edge greater than this value
          </p>
        </div>
        
        {/* Minimum Liquidity */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minLiquidity">Minimum Liquidity ($)</Label>
            <div className="w-16">
              <Input
                id="minLiquidity"
                type="text"
                value={minLiquidity}
                onChange={handleLiquidityInput}
                onBlur={handleLiquidityBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minLiquidity-slider"
            min={1000}
            max={50000}
            step={1000}
            value={[parseInt(minLiquidity) || 5000]}
            onValueChange={handleLiquidityChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets with liquidity above this amount
          </p>
        </div>
        
        {/* Time Horizon */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="timeHorizon">Maximum Time Horizon (days)</Label>
            <div className="w-16">
              <Input
                id="timeHorizon"
                type="text"
                value={timeHorizon}
                onChange={handleTimeHorizonInput}
                onBlur={handleTimeHorizonBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="timeHorizon-slider"
            min={1}
            max={60}
            step={1}
            value={[parseInt(timeHorizon) || 14]}
            onValueChange={handleTimeHorizonChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets resolving within this many days
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Included Assets */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Included Assets</h3>
        <p className="text-sm text-muted-foreground">
          Select which crypto assets to include
        </p>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Add asset (e.g., BTC, ETH)"
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAsset()}
            />
          </div>
          <Button onClick={addAsset} type="button" variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        
        {/* Popular assets */}
        <div className="flex flex-wrap gap-2">
          {popularAssets.map(asset => (
            <Badge
              key={asset}
              variant={includedAssets.includes(asset) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (includedAssets.includes(asset)) {
                  removeIncludedAsset(asset);
                } else {
                  if (excludedAssets.includes(asset)) {
                    removeExcludedAsset(asset);
                  }
                  setIncludedAssets([...includedAssets, asset]);
                }
              }}
            >
              {asset}
            </Badge>
          ))}
        </div>
        
        {/* Selected assets */}
        {includedAssets.length > 0 && (
          <div className="mt-4">
            <Label>Selected Assets</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {includedAssets.map(asset => (
                <Badge key={asset} className="flex items-center gap-1">
                  {asset}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeIncludedAsset(asset)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Excluded Assets */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Excluded Assets</h3>
        <p className="text-sm text-muted-foreground">
          Select which crypto assets to exclude
        </p>
        
        {/* Selected excluded assets */}
        {excludedAssets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {excludedAssets.map(asset => (
              <Badge key={asset} variant="destructive" className="flex items-center gap-1">
                {asset}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeExcludedAsset(asset)}
                />
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No excluded assets</p>
        )}
        
        {/* Add excluded assets from included */}
        {includedAssets.length > 0 && (
          <div className="mt-4">
            <Label>Add to Excluded</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {includedAssets.map(asset => (
                <Badge 
                  key={`exclude-${asset}`} 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => addExcludedAsset(asset)}
                >
                  {asset}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Auto-Execute */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Execution Settings</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoExecute">Auto-Execute Trades</Label>
            <p className="text-sm text-muted-foreground">
              Automatically execute trades when signals are received
            </p>
          </div>
          <Switch
            id="autoExecute"
            checked={autoExecute}
            onCheckedChange={setAutoExecute}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm">
            <div className="font-medium mb-2">Strategy Summary</div>
            <p>
              This strategy will trade crypto markets for {includedAssets.length} asset{includedAssets.length !== 1 ? 's' : ''} with 
              an edge greater than <strong>{parseFloat(minEdge).toFixed(2)}</strong>, 
              liquidity above <strong>${parseInt(minLiquidity).toLocaleString()}</strong>, and 
              resolving within <strong>{parseInt(timeHorizon)} days</strong>.
            </p>
            {excludedAssets.length > 0 && (
              <p className="mt-1">
                Excluded assets: <strong>{excludedAssets.join(", ")}</strong>
              </p>
            )}
            <p className="mt-2">
              Trades will be {autoExecute ? "automatically executed" : "pending manual approval"}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
