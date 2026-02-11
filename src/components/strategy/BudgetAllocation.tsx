import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Strategy } from "@/lib/api/strategies";

interface BudgetAllocationProps {
  budget: {
    maxAmount: number;
    maxAmountPerTrade: number;
    maxPositions: number;
  };
  setBudget: (budget: {
    maxAmount: number;
    maxAmountPerTrade: number;
    maxPositions: number;
  }) => void;
  strategy: Strategy;
}

export const BudgetAllocation = ({ budget, setBudget, strategy }: BudgetAllocationProps) => {
  // Local state for input values
  const [maxAmount, setMaxAmount] = useState(budget.maxAmount.toString());
  const [maxAmountPerTrade, setMaxAmountPerTrade] = useState(budget.maxAmountPerTrade.toString());
  const [maxPositions, setMaxPositions] = useState(budget.maxPositions.toString());
  
  // Handle slider changes
  const handleMaxAmountChange = (value: number[]) => {
    const newValue = value[0];
    setMaxAmount(newValue.toString());
    setBudget({
      ...budget,
      maxAmount: newValue,
      // Ensure maxAmountPerTrade doesn't exceed maxAmount
      maxAmountPerTrade: Math.min(budget.maxAmountPerTrade, newValue)
    });
  };
  
  const handleMaxAmountPerTradeChange = (value: number[]) => {
    const newValue = value[0];
    setMaxAmountPerTrade(newValue.toString());
    setBudget({
      ...budget,
      maxAmountPerTrade: newValue
    });
  };
  
  const handleMaxPositionsChange = (value: number[]) => {
    const newValue = value[0];
    setMaxPositions(newValue.toString());
    setBudget({
      ...budget,
      maxPositions: newValue
    });
  };
  
  // Handle input changes
  const handleMaxAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setMaxAmount(e.target.value);
      setBudget({
        ...budget,
        maxAmount: value,
        // Ensure maxAmountPerTrade doesn't exceed maxAmount
        maxAmountPerTrade: Math.min(budget.maxAmountPerTrade, value)
      });
    } else {
      setMaxAmount(e.target.value);
    }
  };
  
  const handleMaxAmountPerTradeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= budget.maxAmount) {
      setMaxAmountPerTrade(e.target.value);
      setBudget({
        ...budget,
        maxAmountPerTrade: value
      });
    } else {
      setMaxAmountPerTrade(e.target.value);
    }
  };
  
  const handleMaxPositionsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setMaxPositions(e.target.value);
      setBudget({
        ...budget,
        maxPositions: value
      });
    } else {
      setMaxPositions(e.target.value);
    }
  };
  
  // Handle input blur (validate and format)
  const handleMaxAmountBlur = () => {
    let value = parseFloat(maxAmount);
    if (isNaN(value) || value < 0) {
      value = 0;
    }
    setMaxAmount(value.toString());
    setBudget({
      ...budget,
      maxAmount: value,
      maxAmountPerTrade: Math.min(budget.maxAmountPerTrade, value)
    });
  };
  
  const handleMaxAmountPerTradeBlur = () => {
    let value = parseFloat(maxAmountPerTrade);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > budget.maxAmount) {
      value = budget.maxAmount;
    }
    setMaxAmountPerTrade(value.toString());
    setBudget({
      ...budget,
      maxAmountPerTrade: value
    });
  };
  
  const handleMaxPositionsBlur = () => {
    let value = parseInt(maxPositions);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    setMaxPositions(value.toString());
    setBudget({
      ...budget,
      maxPositions: value
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation</CardTitle>
          <CardDescription>
            Configure your trading budget and position limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Maximum Total Budget */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxAmount">Maximum Total Budget ($)</Label>
              <div className="w-20">
                <Input
                  id="maxAmount"
                  type="text"
                  value={maxAmount}
                  onChange={handleMaxAmountInput}
                  onBlur={handleMaxAmountBlur}
                  className="text-right"
                />
              </div>
            </div>
            <Slider
              id="maxAmount-slider"
              min={10}
              max={1000}
              step={10}
              value={[parseFloat(maxAmount) || 0]}
              onValueChange={handleMaxAmountChange}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">
              The maximum amount of funds allocated to this strategy
            </p>
          </div>
          
          {/* Maximum Amount Per Trade */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxAmountPerTrade">Maximum Amount Per Trade ($)</Label>
              <div className="w-20">
                <Input
                  id="maxAmountPerTrade"
                  type="text"
                  value={maxAmountPerTrade}
                  onChange={handleMaxAmountPerTradeInput}
                  onBlur={handleMaxAmountPerTradeBlur}
                  className="text-right"
                />
              </div>
            </div>
            <Slider
              id="maxAmountPerTrade-slider"
              min={1}
              max={Math.max(100, parseFloat(maxAmount) || 0)}
              step={1}
              value={[parseFloat(maxAmountPerTrade) || 0]}
              onValueChange={handleMaxAmountPerTradeChange}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">
              The maximum amount to risk on a single trade
            </p>
          </div>
          
          {/* Maximum Positions */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxPositions">Maximum Open Positions</Label>
              <div className="w-20">
                <Input
                  id="maxPositions"
                  type="text"
                  value={maxPositions}
                  onChange={handleMaxPositionsInput}
                  onBlur={handleMaxPositionsBlur}
                  className="text-right"
                />
              </div>
            </div>
            <Slider
              id="maxPositions-slider"
              min={1}
              max={20}
              step={1}
              value={[parseInt(maxPositions) || 1]}
              onValueChange={handleMaxPositionsChange}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">
              The maximum number of positions to hold simultaneously
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Risk Management</CardTitle>
          <CardDescription>
            Estimated risk metrics based on your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Maximum Exposure:</span>
              <span className="font-medium">${Math.min(parseFloat(maxAmount), parseFloat(maxAmountPerTrade) * parseInt(maxPositions))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Average Position Size:</span>
              <span className="font-medium">${(parseFloat(maxAmountPerTrade) * 0.7).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Risk Level:</span>
              <span className="font-medium">{getRiskLevel(parseFloat(maxAmount), parseFloat(maxAmountPerTrade), parseInt(maxPositions))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to determine risk level
function getRiskLevel(maxAmount: number, maxAmountPerTrade: number, maxPositions: number): string {
  // Calculate risk ratio (average position size relative to total budget)
  const maxExposure = Math.min(maxAmount, maxAmountPerTrade * maxPositions);
  const riskRatio = maxExposure / maxAmount;
  
  if (riskRatio < 0.3) {
    return "Conservative";
  } else if (riskRatio < 0.6) {
    return "Moderate";
  } else if (riskRatio < 0.9) {
    return "Aggressive";
  } else {
    return "Very Aggressive";
  }
}
