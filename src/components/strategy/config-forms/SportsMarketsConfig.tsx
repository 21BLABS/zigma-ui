import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SportsMarketsConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const SportsMarketsConfig = ({ config, setConfig }: SportsMarketsConfigProps) => {
  // Initialize local state with config values or defaults
  const [minEdge, setMinEdge] = useState(config.minEdge?.toString() || "0.05");
  const [minLiquidity, setMinLiquidity] = useState(config.minLiquidity?.toString() || "10000");
  const [autoExecute, setAutoExecute] = useState(config.autoExecute !== false);
  const [sportTypes, setSportTypes] = useState<string[]>(
    config.sportTypes || ["FOOTBALL", "BASKETBALL", "BASEBALL", "TENNIS", "SOCCER"]
  );
  const [marketType, setMarketType] = useState(config.marketType || "ALL");
  const [timeHorizon, setTimeHorizon] = useState(config.timeHorizon?.toString() || "7");
  
  // Update parent config when local state changes
  useEffect(() => {
    setConfig({
      ...config,
      minEdge: parseFloat(minEdge),
      minLiquidity: parseInt(minLiquidity),
      autoExecute,
      sportTypes,
      marketType,
      timeHorizon: parseInt(timeHorizon)
    });
  }, [minEdge, minLiquidity, autoExecute, sportTypes, marketType, timeHorizon]);
  
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
      value = 10000;
    }
    setMinLiquidity(value.toString());
  };
  
  const handleTimeHorizonBlur = () => {
    let value = parseInt(timeHorizon);
    if (isNaN(value) || value < 1) {
      value = 7;
    }
    setTimeHorizon(value.toString());
  };
  
  // Handle sport type toggle
  const handleSportTypeToggle = (sportType: string) => {
    if (sportTypes.includes(sportType)) {
      setSportTypes(sportTypes.filter(s => s !== sportType));
    } else {
      setSportTypes([...sportTypes, sportType]);
    }
  };
  
  // Available sport types
  const availableSportTypes = [
    { id: "FOOTBALL", label: "Football" },
    { id: "BASKETBALL", label: "Basketball" },
    { id: "BASEBALL", label: "Baseball" },
    { id: "TENNIS", label: "Tennis" },
    { id: "SOCCER", label: "Soccer" },
    { id: "HOCKEY", label: "Hockey" },
    { id: "GOLF", label: "Golf" },
    { id: "MMA", label: "MMA/UFC" },
    { id: "BOXING", label: "Boxing" },
    { id: "ESPORTS", label: "Esports" }
  ];
  
  // Available market types
  const marketTypes = [
    { id: "ALL", label: "All Markets" },
    { id: "MONEYLINE", label: "Moneyline/Winner" },
    { id: "SPREAD", label: "Point Spread" },
    { id: "TOTALS", label: "Over/Under" },
    { id: "PROPS", label: "Player Props" },
    { id: "FUTURES", label: "Futures" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Market Filters</h3>
        <p className="text-sm text-muted-foreground">
          Configure which sports markets to trade
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
            value={[parseFloat(minEdge) || 0.05]}
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
            value={[parseInt(minLiquidity) || 10000]}
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
            max={30}
            step={1}
            value={[parseInt(timeHorizon) || 7]}
            onValueChange={handleTimeHorizonChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets resolving within this many days
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Sport Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sport Types</h3>
        <p className="text-sm text-muted-foreground">
          Select which sports to include
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {availableSportTypes.map(sport => (
            <div key={sport.id} className="flex items-center space-x-2">
              <Checkbox
                id={`sport-${sport.id}`}
                checked={sportTypes.includes(sport.id)}
                onCheckedChange={() => handleSportTypeToggle(sport.id)}
              />
              <Label htmlFor={`sport-${sport.id}`}>{sport.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Market Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Market Type</h3>
        <p className="text-sm text-muted-foreground">
          Select which type of markets to trade
        </p>
        
        <Select value={marketType} onValueChange={setMarketType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select market type" />
          </SelectTrigger>
          <SelectContent>
            {marketTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              This strategy will trade {marketType === "ALL" ? "all types of" : marketType.toLowerCase()} markets 
              in {sportTypes.length} sport{sportTypes.length !== 1 ? 's' : ''} with 
              an edge greater than <strong>{parseFloat(minEdge).toFixed(2)}</strong>, 
              liquidity above <strong>${parseInt(minLiquidity).toLocaleString()}</strong>, and 
              resolving within <strong>{parseInt(timeHorizon)} days</strong>.
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
