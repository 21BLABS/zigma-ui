import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface VolumeMarketsConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const VolumeMarketsConfig = ({ config, setConfig }: VolumeMarketsConfigProps) => {
  // Initialize local state with config values or defaults
  const [minVolume, setMinVolume] = useState(config.minVolume?.toString() || "50000");
  const [minLiquidity, setMinLiquidity] = useState(config.minLiquidity?.toString() || "20000");
  const [minEdge, setMinEdge] = useState(config.minEdge?.toString() || "0.03");
  const [autoExecute, setAutoExecute] = useState(config.autoExecute !== false);
  const [volumeTimeframe, setVolumeTimeframe] = useState(config.volumeTimeframe || "24H");
  const [categories, setCategories] = useState<string[]>(
    config.categories || ["SPORTS", "POLITICS", "CRYPTO", "ENTERTAINMENT"]
  );
  const [volatilityThreshold, setVolatilityThreshold] = useState(config.volatilityThreshold?.toString() || "5");
  
  // Update parent config when local state changes
  useEffect(() => {
    setConfig({
      ...config,
      minVolume: parseInt(minVolume),
      minLiquidity: parseInt(minLiquidity),
      minEdge: parseFloat(minEdge),
      autoExecute,
      volumeTimeframe,
      categories,
      volatilityThreshold: parseInt(volatilityThreshold)
    });
  }, [minVolume, minLiquidity, minEdge, autoExecute, volumeTimeframe, categories, volatilityThreshold]);
  
  // Handle volume slider change
  const handleVolumeChange = (value: number[]) => {
    setMinVolume(value[0].toString());
  };
  
  // Handle liquidity slider change
  const handleLiquidityChange = (value: number[]) => {
    setMinLiquidity(value[0].toString());
  };
  
  // Handle edge slider change
  const handleEdgeChange = (value: number[]) => {
    setMinEdge(value[0].toString());
  };
  
  // Handle volatility slider change
  const handleVolatilityChange = (value: number[]) => {
    setVolatilityThreshold(value[0].toString());
  };
  
  // Handle input changes
  const handleVolumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setMinVolume(e.target.value);
    } else {
      setMinVolume(e.target.value);
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
  
  const handleEdgeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setMinEdge(e.target.value);
    } else {
      setMinEdge(e.target.value);
    }
  };
  
  const handleVolatilityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setVolatilityThreshold(e.target.value);
    } else {
      setVolatilityThreshold(e.target.value);
    }
  };
  
  // Handle input blur (validate and format)
  const handleVolumeBlur = () => {
    let value = parseInt(minVolume);
    if (isNaN(value) || value < 0) {
      value = 50000;
    }
    setMinVolume(value.toString());
  };
  
  const handleLiquidityBlur = () => {
    let value = parseInt(minLiquidity);
    if (isNaN(value) || value < 0) {
      value = 20000;
    }
    setMinLiquidity(value.toString());
  };
  
  const handleEdgeBlur = () => {
    let value = parseFloat(minEdge);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 1) {
      value = 1;
    }
    setMinEdge(value.toString());
  };
  
  const handleVolatilityBlur = () => {
    let value = parseInt(volatilityThreshold);
    if (isNaN(value) || value < 0) {
      value = 5;
    }
    setVolatilityThreshold(value.toString());
  };
  
  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };
  
  // Available categories
  const availableCategories = [
    { id: "SPORTS", label: "Sports" },
    { id: "POLITICS", label: "Politics" },
    { id: "CRYPTO", label: "Crypto" },
    { id: "ENTERTAINMENT", label: "Entertainment" },
    { id: "SCIENCE", label: "Science & Technology" },
    { id: "ECONOMICS", label: "Economics" }
  ];
  
  // Available timeframes
  const timeframes = [
    { id: "1H", label: "1 Hour" },
    { id: "6H", label: "6 Hours" },
    { id: "12H", label: "12 Hours" },
    { id: "24H", label: "24 Hours" },
    { id: "7D", label: "7 Days" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Volume Filters</h3>
        <p className="text-sm text-muted-foreground">
          Configure which high-volume markets to trade
        </p>
        
        {/* Minimum Volume */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minVolume">Minimum Volume ($)</Label>
            <div className="w-16">
              <Input
                id="minVolume"
                type="text"
                value={minVolume}
                onChange={handleVolumeInput}
                onBlur={handleVolumeBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minVolume-slider"
            min={10000}
            max={200000}
            step={5000}
            value={[parseInt(minVolume) || 50000]}
            onValueChange={handleVolumeChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets with volume above this amount
          </p>
        </div>
        
        {/* Volume Timeframe */}
        <div className="space-y-2">
          <Label htmlFor="volumeTimeframe">Volume Timeframe</Label>
          <Select value={volumeTimeframe} onValueChange={setVolumeTimeframe}>
            <SelectTrigger id="volumeTimeframe" className="w-full">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map(timeframe => (
                <SelectItem key={timeframe.id} value={timeframe.id}>
                  {timeframe.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Time period for measuring market volume
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
            min={5000}
            max={100000}
            step={5000}
            value={[parseInt(minLiquidity) || 20000]}
            onValueChange={handleLiquidityChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets with liquidity above this amount
          </p>
        </div>
        
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
            max={0.1}
            step={0.01}
            value={[parseFloat(minEdge) || 0.03]}
            onValueChange={handleEdgeChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets with an edge greater than this value
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Volatility Threshold */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Volatility Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how to handle market volatility
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="volatilityThreshold">Volatility Threshold (%)</Label>
            <div className="w-16">
              <Input
                id="volatilityThreshold"
                type="text"
                value={volatilityThreshold}
                onChange={handleVolatilityInput}
                onBlur={handleVolatilityBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="volatilityThreshold-slider"
            min={1}
            max={20}
            step={1}
            value={[parseInt(volatilityThreshold) || 5]}
            onValueChange={handleVolatilityChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets with price changes below this percentage in the selected timeframe
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Market Categories</h3>
        <p className="text-sm text-muted-foreground">
          Select which market categories to include
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {availableCategories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={categories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label htmlFor={`category-${category.id}`}>{category.label}</Label>
            </div>
          ))}
        </div>
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
              This strategy will trade markets with {volumeTimeframe} volume above <strong>${parseInt(minVolume).toLocaleString()}</strong>, 
              liquidity above <strong>${parseInt(minLiquidity).toLocaleString()}</strong>, and 
              edge greater than <strong>{parseFloat(minEdge).toFixed(2)}</strong>.
            </p>
            <p className="mt-1">
              Markets must have price volatility below <strong>{parseInt(volatilityThreshold)}%</strong> and 
              be in the following categories: <strong>{categories.join(", ")}</strong>.
            </p>
            <p className="mt-2">
              Trades will be {autoExecute ? "automatically executed" : "pending manual approval"}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
