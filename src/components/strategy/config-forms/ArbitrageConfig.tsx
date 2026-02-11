import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ArbitrageConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const ArbitrageConfig = ({ config, setConfig }: ArbitrageConfigProps) => {
  // Initialize local state with config values or defaults
  const [minSpread, setMinSpread] = useState(config.minSpread?.toString() || "0.01");
  const [minProfit, setMinProfit] = useState(config.minProfit?.toString() || "1");
  const [autoExecute, setAutoExecute] = useState(config.autoExecute !== false);
  const [arbitrageType, setArbitrageType] = useState(config.arbitrageType || "CROSS_MARKET");
  const [categories, setCategories] = useState<string[]>(
    config.categories || ["SPORTS", "POLITICS", "CRYPTO", "ENTERTAINMENT"]
  );
  const [executionSpeed, setExecutionSpeed] = useState(config.executionSpeed || "BALANCED");
  
  // Update parent config when local state changes
  useEffect(() => {
    setConfig({
      ...config,
      minSpread: parseFloat(minSpread),
      minProfit: parseFloat(minProfit),
      autoExecute,
      arbitrageType,
      categories,
      executionSpeed
    });
  }, [minSpread, minProfit, autoExecute, arbitrageType, categories, executionSpeed]);
  
  // Handle spread slider change
  const handleSpreadChange = (value: number[]) => {
    setMinSpread(value[0].toString());
  };
  
  // Handle profit slider change
  const handleProfitChange = (value: number[]) => {
    setMinProfit(value[0].toString());
  };
  
  // Handle input changes
  const handleSpreadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setMinSpread(e.target.value);
    } else {
      setMinSpread(e.target.value);
    }
  };
  
  const handleProfitInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setMinProfit(e.target.value);
    } else {
      setMinProfit(e.target.value);
    }
  };
  
  // Handle input blur (validate and format)
  const handleSpreadBlur = () => {
    let value = parseFloat(minSpread);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 1) {
      value = 1;
    }
    setMinSpread(value.toString());
  };
  
  const handleProfitBlur = () => {
    let value = parseFloat(minProfit);
    if (isNaN(value) || value < 0) {
      value = 1;
    }
    setMinProfit(value.toString());
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
  
  // Available arbitrage types
  const arbitrageTypes = [
    { id: "CROSS_MARKET", label: "Cross-Market Arbitrage", description: "Exploit price differences between different markets" },
    { id: "OUTCOME_BUNDLE", label: "Outcome Bundle Arbitrage", description: "Exploit mispricing across all outcomes in a market" },
    { id: "TEMPORAL", label: "Temporal Arbitrage", description: "Exploit price changes over time" }
  ];
  
  // Execution speed options
  const executionSpeeds = [
    { id: "FAST", label: "Fast", description: "Prioritize execution speed over price improvement" },
    { id: "BALANCED", label: "Balanced", description: "Balance between speed and price improvement" },
    { id: "CAREFUL", label: "Careful", description: "Prioritize price improvement over speed" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Arbitrage Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure arbitrage opportunity detection and execution
        </p>
        
        {/* Minimum Spread */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minSpread">Minimum Spread</Label>
            <div className="w-16">
              <Input
                id="minSpread"
                type="text"
                value={minSpread}
                onChange={handleSpreadInput}
                onBlur={handleSpreadBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minSpread-slider"
            min={0.005}
            max={0.1}
            step={0.005}
            value={[parseFloat(minSpread) || 0.01]}
            onValueChange={handleSpreadChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only execute arbitrage with a spread greater than this value
          </p>
        </div>
        
        {/* Minimum Profit */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minProfit">Minimum Profit ($)</Label>
            <div className="w-16">
              <Input
                id="minProfit"
                type="text"
                value={minProfit}
                onChange={handleProfitInput}
                onBlur={handleProfitBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minProfit-slider"
            min={0.5}
            max={10}
            step={0.5}
            value={[parseFloat(minProfit) || 1]}
            onValueChange={handleProfitChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only execute arbitrage with expected profit above this amount
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Arbitrage Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Arbitrage Type</h3>
        <p className="text-sm text-muted-foreground">
          Select which type of arbitrage to execute
        </p>
        
        <RadioGroup value={arbitrageType} onValueChange={setArbitrageType}>
          {arbitrageTypes.map(type => (
            <div key={type.id} className="flex items-start space-x-2 py-2">
              <RadioGroupItem value={type.id} id={`type-${type.id}`} />
              <div className="grid gap-1.5">
                <Label htmlFor={`type-${type.id}`} className="font-medium">
                  {type.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
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
      
      {/* Execution Speed */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Execution Speed</h3>
        <p className="text-sm text-muted-foreground">
          Select the execution speed for arbitrage opportunities
        </p>
        
        <Select value={executionSpeed} onValueChange={setExecutionSpeed}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select execution speed" />
          </SelectTrigger>
          <SelectContent>
            {executionSpeeds.map(speed => (
              <SelectItem key={speed.id} value={speed.id}>
                {speed.label} - {speed.description}
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
              Automatically execute arbitrage when opportunities are detected
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
              This strategy will execute {arbitrageType === "CROSS_MARKET" ? "cross-market" : 
                arbitrageType === "OUTCOME_BUNDLE" ? "outcome bundle" : "temporal"} arbitrage 
              with a spread greater than <strong>{parseFloat(minSpread).toFixed(3)}</strong> and 
              minimum profit of <strong>${parseFloat(minProfit).toFixed(2)}</strong>.
            </p>
            <p className="mt-1">
              Markets categories: <strong>{categories.join(", ")}</strong>
            </p>
            <p className="mt-1">
              Execution speed: <strong>{executionSpeeds.find(s => s.id === executionSpeed)?.label}</strong>
            </p>
            <p className="mt-2">
              Arbitrage will be {autoExecute ? "automatically executed" : "pending manual approval"}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
