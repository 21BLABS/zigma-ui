import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CopyTradingConfigProps {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
}

interface Trader {
  id: string;
  name: string;
  winRate: number;
  pnl: number;
}

export const CopyTradingConfig = ({ config, setConfig }: CopyTradingConfigProps) => {
  // Initialize local state with config values or defaults
  const [traders, setTraders] = useState<Trader[]>(config.traders || []);
  const [copyDelay, setCopyDelay] = useState(config.copyDelay?.toString() || "60");
  const [minWinRate, setMinWinRate] = useState(config.minWinRate?.toString() || "60");
  const [minPnl, setMinPnl] = useState(config.minPnl?.toString() || "1000");
  const [autoExecute, setAutoExecute] = useState(config.autoExecute !== false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Update parent config when local state changes
  useEffect(() => {
    setConfig({
      ...config,
      traders,
      copyDelay: parseInt(copyDelay),
      minWinRate: parseInt(minWinRate),
      minPnl: parseInt(minPnl),
      autoExecute
    });
  }, [traders, copyDelay, minWinRate, minPnl, autoExecute]);
  
  // Handle delay slider change
  const handleDelayChange = (value: number[]) => {
    setCopyDelay(value[0].toString());
  };
  
  // Handle win rate slider change
  const handleWinRateChange = (value: number[]) => {
    setMinWinRate(value[0].toString());
  };
  
  // Handle PnL slider change
  const handlePnlChange = (value: number[]) => {
    setMinPnl(value[0].toString());
  };
  
  // Handle input changes
  const handleDelayInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCopyDelay(e.target.value);
    } else {
      setCopyDelay(e.target.value);
    }
  };
  
  const handleWinRateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setMinWinRate(e.target.value);
    } else {
      setMinWinRate(e.target.value);
    }
  };
  
  const handlePnlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setMinPnl(e.target.value);
    } else {
      setMinPnl(e.target.value);
    }
  };
  
  // Handle input blur (validate and format)
  const handleDelayBlur = () => {
    let value = parseInt(copyDelay);
    if (isNaN(value) || value < 0) {
      value = 60;
    }
    setCopyDelay(value.toString());
  };
  
  const handleWinRateBlur = () => {
    let value = parseInt(minWinRate);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    }
    setMinWinRate(value.toString());
  };
  
  const handlePnlBlur = () => {
    let value = parseInt(minPnl);
    if (isNaN(value)) {
      value = 1000;
    }
    setMinPnl(value.toString());
  };
  
  // Handle trader removal
  const removeTrader = (traderId: string) => {
    setTraders(traders.filter(trader => trader.id !== traderId));
  };
  
  // Mock trader search (in a real app, this would call an API)
  const searchTraders = () => {
    if (!searchQuery.trim()) return;
    
    // Mock data - in a real app this would come from an API
    const mockTraders: Trader[] = [
      { id: "trader1", name: searchQuery, winRate: 65, pnl: 2500 },
      { id: "trader2", name: `${searchQuery}_pro`, winRate: 72, pnl: 5200 },
      { id: "trader3", name: `top_${searchQuery}`, winRate: 58, pnl: 1800 }
    ];
    
    // Add the first mock trader if not already in the list
    const trader = mockTraders[0];
    if (!traders.some(t => t.id === trader.id)) {
      setTraders([...traders, trader]);
    }
    
    setSearchQuery("");
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Traders to Copy</h3>
        <p className="text-sm text-muted-foreground">
          Add traders whose trades you want to copy
        </p>
        
        {/* Trader search */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Search for traders by address or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchTraders()}
            />
          </div>
          <Button onClick={searchTraders} type="button">
            <Search className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        
        {/* Selected traders */}
        {traders.length > 0 ? (
          <ScrollArea className="h-[120px] border rounded-md p-2">
            <div className="space-y-2">
              {traders.map(trader => (
                <div key={trader.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                  <div className="flex flex-col">
                    <span className="font-medium">{trader.name}</span>
                    <div className="flex space-x-2 text-xs text-muted-foreground">
                      <span>Win Rate: {trader.winRate}%</span>
                      <span>PnL: ${trader.pnl}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeTrader(trader.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Plus className="h-8 w-8 mb-2" />
            <p>No traders added yet</p>
            <p className="text-xs">Search and add traders to copy their trades</p>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Copy Delay */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="copyDelay">Copy Delay (seconds)</Label>
          <div className="w-16">
            <Input
              id="copyDelay"
              type="text"
              value={copyDelay}
              onChange={handleDelayInput}
              onBlur={handleDelayBlur}
              className="text-right"
            />
          </div>
        </div>
        <Slider
          id="copyDelay-slider"
          min={0}
          max={300}
          step={10}
          value={[parseInt(copyDelay) || 60]}
          onValueChange={handleDelayChange}
          className="py-4"
        />
        <p className="text-xs text-muted-foreground">
          Delay in seconds before copying a trader's position (0 for immediate)
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Trader Filters</h3>
        <p className="text-sm text-muted-foreground">
          Only copy traders who meet these criteria
        </p>
        
        {/* Minimum Win Rate */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minWinRate">Minimum Win Rate (%)</Label>
            <div className="w-16">
              <Input
                id="minWinRate"
                type="text"
                value={minWinRate}
                onChange={handleWinRateInput}
                onBlur={handleWinRateBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minWinRate-slider"
            min={0}
            max={100}
            step={5}
            value={[parseInt(minWinRate) || 60]}
            onValueChange={handleWinRateChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only copy traders with a win rate above this percentage
          </p>
        </div>
        
        {/* Minimum PnL */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="minPnl">Minimum PnL ($)</Label>
            <div className="w-16">
              <Input
                id="minPnl"
                type="text"
                value={minPnl}
                onChange={handlePnlInput}
                onBlur={handlePnlBlur}
                className="text-right"
              />
            </div>
          </div>
          <Slider
            id="minPnl-slider"
            min={0}
            max={10000}
            step={500}
            value={[parseInt(minPnl) || 1000]}
            onValueChange={handlePnlChange}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            Only copy traders with PnL above this amount
          </p>
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
              Automatically copy trades without manual approval
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
              This strategy will copy trades from {traders.length} trader{traders.length !== 1 ? 's' : ''} with 
              a win rate above <strong>{parseInt(minWinRate)}%</strong> and 
              PnL above <strong>${parseInt(minPnl)}</strong>.
            </p>
            <p className="mt-2">
              Trades will be copied after a <strong>{parseInt(copyDelay)} second</strong> delay and 
              will be {autoExecute ? "automatically executed" : "pending manual approval"}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
