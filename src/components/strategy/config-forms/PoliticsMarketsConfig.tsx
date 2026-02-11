import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PoliticsMarketsConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const PoliticsMarketsConfig = ({ config, setConfig }: PoliticsMarketsConfigProps) => {
  // Initialize local state with config values or defaults
  const [minEdge, setMinEdge] = useState(config.minEdge?.toString() || "0.04");
  const [minLiquidity, setMinLiquidity] = useState(config.minLiquidity?.toString() || "10000");
  const [autoExecute, setAutoExecute] = useState(config.autoExecute !== false);
  const [regions, setRegions] = useState<string[]>(
    config.regions || ["US", "GLOBAL", "EU", "UK"]
  );
  const [eventTypes, setEventTypes] = useState<string[]>(
    config.eventTypes || ["ELECTIONS", "LEGISLATION", "APPOINTMENTS", "GEOPOLITICAL"]
  );
  const [riskLevel, setRiskLevel] = useState(config.riskLevel || "MEDIUM");
  
  // Update parent config when local state changes
  useEffect(() => {
    setConfig({
      ...config,
      minEdge: parseFloat(minEdge),
      minLiquidity: parseInt(minLiquidity),
      autoExecute,
      regions,
      eventTypes,
      riskLevel
    });
  }, [minEdge, minLiquidity, autoExecute, regions, eventTypes, riskLevel]);
  
  // Handle edge slider change
  const handleEdgeChange = (value: number[]) => {
    setMinEdge(value[0].toString());
  };
  
  // Handle liquidity slider change
  const handleLiquidityChange = (value: number[]) => {
    setMinLiquidity(value[0].toString());
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
  
  // Handle region toggle
  const handleRegionToggle = (region: string) => {
    if (regions.includes(region)) {
      setRegions(regions.filter(r => r !== region));
    } else {
      setRegions([...regions, region]);
    }
  };
  
  // Handle event type toggle
  const handleEventTypeToggle = (eventType: string) => {
    if (eventTypes.includes(eventType)) {
      setEventTypes(eventTypes.filter(e => e !== eventType));
    } else {
      setEventTypes([...eventTypes, eventType]);
    }
  };
  
  // Available regions
  const availableRegions = [
    { id: "US", label: "United States" },
    { id: "EU", label: "European Union" },
    { id: "UK", label: "United Kingdom" },
    { id: "ASIA", label: "Asia" },
    { id: "LATAM", label: "Latin America" },
    { id: "GLOBAL", label: "Global" }
  ];
  
  // Available event types
  const availableEventTypes = [
    { id: "ELECTIONS", label: "Elections" },
    { id: "LEGISLATION", label: "Legislation" },
    { id: "APPOINTMENTS", label: "Appointments" },
    { id: "GEOPOLITICAL", label: "Geopolitical Events" },
    { id: "POLICY", label: "Policy Decisions" },
    { id: "SCANDALS", label: "Political Scandals" }
  ];
  
  // Risk levels
  const riskLevels = [
    { id: "LOW", label: "Low Risk", description: "Only trade high-confidence markets with strong consensus" },
    { id: "MEDIUM", label: "Medium Risk", description: "Balance between risk and potential returns" },
    { id: "HIGH", label: "High Risk", description: "Trade more speculative markets with higher potential returns" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Market Filters</h3>
        <p className="text-sm text-muted-foreground">
          Configure which politics markets to trade
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
            value={[parseInt(minLiquidity) || 10000]}
            onValueChange={handleLiquidityChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only trade markets with liquidity above this amount
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Regions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Regions</h3>
        <p className="text-sm text-muted-foreground">
          Select which regions to include
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {availableRegions.map(region => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${region.id}`}
                checked={regions.includes(region.id)}
                onCheckedChange={() => handleRegionToggle(region.id)}
              />
              <Label htmlFor={`region-${region.id}`}>{region.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Event Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Event Types</h3>
        <p className="text-sm text-muted-foreground">
          Select which types of political events to include
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {availableEventTypes.map(eventType => (
            <div key={eventType.id} className="flex items-center space-x-2">
              <Checkbox
                id={`eventType-${eventType.id}`}
                checked={eventTypes.includes(eventType.id)}
                onCheckedChange={() => handleEventTypeToggle(eventType.id)}
              />
              <Label htmlFor={`eventType-${eventType.id}`}>{eventType.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Risk Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Risk Level</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred risk level for political markets
        </p>
        
        <RadioGroup value={riskLevel} onValueChange={setRiskLevel}>
          {riskLevels.map(level => (
            <div key={level.id} className="flex items-start space-x-2 py-2">
              <RadioGroupItem value={level.id} id={`risk-${level.id}`} />
              <div className="grid gap-1.5">
                <Label htmlFor={`risk-${level.id}`} className="font-medium">
                  {level.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {level.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
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
              This strategy will trade politics markets in {regions.length} region{regions.length !== 1 ? 's' : ''} with 
              an edge greater than <strong>{parseFloat(minEdge).toFixed(2)}</strong> and 
              liquidity above <strong>${parseInt(minLiquidity).toLocaleString()}</strong>.
            </p>
            <p className="mt-1">
              Event types: <strong>{eventTypes.map(e => availableEventTypes.find(t => t.id === e)?.label).join(", ")}</strong>
            </p>
            <p className="mt-1">
              Risk level: <strong>{riskLevels.find(l => l.id === riskLevel)?.label}</strong>
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
