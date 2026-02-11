import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ZigmaSignalsConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

export const ZigmaSignalsConfig = ({ config, setConfig }: ZigmaSignalsConfigProps) => {
  // Initialize local state with config values or defaults
  const [minEdge, setMinEdge] = useState(config.minEdge?.toString() || "0.03");
  const [minConfidence, setMinConfidence] = useState(config.minConfidence?.toString() || "70");
  const [enabledCategories, setEnabledCategories] = useState<string[]>(
    config.enabledCategories || ["SPORTS", "POLITICS", "CRYPTO", "ENTERTAINMENT"]
  );
  const [autoExecute, setAutoExecute] = useState(config.autoExecute !== false);
  
  // Update parent config when local state changes
  useEffect(() => {
    setConfig({
      ...config,
      minEdge: parseFloat(minEdge),
      minConfidence: parseInt(minConfidence),
      enabledCategories,
      autoExecute
    });
  }, [minEdge, minConfidence, enabledCategories, autoExecute]);
  
  // Handle edge slider change
  const handleEdgeChange = (value: number[]) => {
    setMinEdge(value[0].toString());
  };
  
  // Handle confidence slider change
  const handleConfidenceChange = (value: number[]) => {
    setMinConfidence(value[0].toString());
  };
  
  // Handle edge input change
  const handleEdgeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setMinEdge(e.target.value);
    } else {
      setMinEdge(e.target.value);
    }
  };
  
  // Handle confidence input change
  const handleConfidenceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setMinConfidence(e.target.value);
    } else {
      setMinConfidence(e.target.value);
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
  
  const handleConfidenceBlur = () => {
    let value = parseInt(minConfidence);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    }
    setMinConfidence(value.toString());
  };
  
  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    if (enabledCategories.includes(category)) {
      setEnabledCategories(enabledCategories.filter(c => c !== category));
    } else {
      setEnabledCategories([...enabledCategories, category]);
    }
  };
  
  // Available market categories
  const categories = [
    { id: "SPORTS", label: "Sports" },
    { id: "POLITICS", label: "Politics" },
    { id: "CRYPTO", label: "Crypto" },
    { id: "ENTERTAINMENT", label: "Entertainment" },
    { id: "SCIENCE", label: "Science & Technology" },
    { id: "ECONOMICS", label: "Economics" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Signal Filtering</h3>
        <p className="text-sm text-muted-foreground">
          Configure which Zigma signals to execute based on edge and confidence
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
            value={[parseFloat(minEdge) || 0.03]}
            onValueChange={handleEdgeChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only execute trades with an edge greater than this value
          </p>
        </div>
        
        {/* Minimum Confidence */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minConfidence">Minimum Confidence (%)</Label>
            <div className="w-16">
              <Input
                id="minConfidence"
                type="text"
                value={minConfidence}
                onChange={handleConfidenceInput}
                onBlur={handleConfidenceBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minConfidence-slider"
            min={50}
            max={95}
            step={1}
            value={[parseInt(minConfidence) || 70]}
            onValueChange={handleConfidenceChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only execute trades with confidence greater than this percentage
          </p>
        </div>
      </div>
      
      <Separator />
      
      {/* Market Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Market Categories</h3>
        <p className="text-sm text-muted-foreground">
          Select which market categories to include
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={enabledCategories.includes(category.id)}
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
              This strategy will execute trades on Zigma signals with 
              an edge greater than <strong>{parseFloat(minEdge).toFixed(2)}</strong> and 
              confidence above <strong>{parseInt(minConfidence)}%</strong> in the 
              following categories: <strong>{enabledCategories.join(", ")}</strong>.
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
