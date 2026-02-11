import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Strategy } from "@/lib/api/strategies";
import { configureStrategy } from "@/lib/api/strategies";
import {
  ZigmaSignalsConfig,
  CopyTradingConfig,
  SportsMarketsConfig,
  CryptoMarketsConfig,
  PoliticsMarketsConfig,
  VolumeMarketsConfig,
  ArbitrageConfig
} from "./config-forms";
import { BudgetAllocation } from "@/components/strategy/BudgetAllocation";

interface StrategyConfigModalProps {
  strategy: Strategy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StrategyConfigModal = ({ strategy, open, onOpenChange }: StrategyConfigModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("settings");
  const [config, setConfig] = useState<Record<string, any>>(strategy.defaultConfig || {});
  const [budget, setBudget] = useState({
    maxAmount: 50,
    maxAmountPerTrade: 10,
    maxPositions: 5
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Combine config and budget settings
      const fullConfig = {
        ...config,
        maxAmount: budget.maxAmount,
        maxAmountPerTrade: budget.maxAmountPerTrade,
        maxPositions: budget.maxPositions
      };
      
      const response = await configureStrategy(strategy.id, fullConfig);
      
      if (response.success) {
        toast({
          title: "Strategy Configured",
          description: `${strategy.name} has been configured successfully.`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Configuration Failed",
          description: response.message || "Failed to configure strategy.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error configuring strategy:", error);
      toast({
        title: "Configuration Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render the appropriate config form based on strategy category
  const renderConfigForm = () => {
    switch (strategy.category) {
      case "SIGNALS":
        return <ZigmaSignalsConfig config={config} setConfig={setConfig} />;
      case "COPY":
        return <CopyTradingConfig config={config} setConfig={setConfig} />;
      case "SPORTS":
        return <SportsMarketsConfig config={config} setConfig={setConfig} />;
      case "CRYPTO":
        return <CryptoMarketsConfig config={config} setConfig={setConfig} />;
      case "POLITICS":
        return <PoliticsMarketsConfig config={config} setConfig={setConfig} />;
      case "VOLUME":
        return <VolumeMarketsConfig config={config} setConfig={setConfig} />;
      case "ARBITRAGE":
        return <ArbitrageConfig config={config} setConfig={setConfig} />;
      default:
        return (
          <div className="py-4">
            <p className="text-muted-foreground">No specific configuration options available for this strategy.</p>
          </div>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {strategy.name}</DialogTitle>
          <DialogDescription>
            Customize this strategy to match your trading preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Strategy Settings</TabsTrigger>
            <TabsTrigger value="budget">Budget Allocation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4 py-4">
            {renderConfigForm()}
          </TabsContent>
          
          <TabsContent value="budget" className="space-y-4 py-4">
            <BudgetAllocation 
              budget={budget}
              setBudget={setBudget}
              strategy={strategy}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
