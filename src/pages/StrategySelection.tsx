import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMagicAuth } from "@/contexts/MagicAuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Lock, Unlock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StrategyConfigModal } from "@/components/strategy/StrategyConfigModal";
import { TokenTierBadge } from "@/components/strategy/TokenTierBadge";
import { fetchStrategies, fetchUserTokenTier, Strategy, TokenTier } from "@/lib/api/strategies";

const StrategySelection = () => {
  const { isAuthenticated, user } = useMagicAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [userTier, setUserTier] = useState<TokenTier>(TokenTier.FREE);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  
  // Fetch strategies and user tier on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's token tier
        const tierResponse = await fetchUserTokenTier();
        if (tierResponse.success) {
          setUserTier(tierResponse.tier);
        }
        
        // Fetch available strategies
        const strategiesResponse = await fetchStrategies();
        if (strategiesResponse.success) {
          setStrategies(strategiesResponse.strategies);
        } else {
          toast({
            title: "Error",
            description: "Failed to load strategies",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading strategy data:", error);
        toast({
          title: "Error",
          description: "Failed to load strategy data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, toast]);
  
  // Filter strategies based on active tab
  const filteredStrategies = strategies.filter(strategy => {
    if (activeTab === "all") return true;
    return strategy.category.toLowerCase() === activeTab.toLowerCase();
  });
  
  // Group strategies by category
  const categories = [...new Set(strategies.map(s => s.category))];
  
  // Handle strategy selection
  const handleSelectStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setConfigModalOpen(true);
  };
  
  // Check if a strategy is available for the user's tier
  const isStrategyAvailable = (requiredTier: TokenTier) => {
    const tierValues = {
      [TokenTier.FREE]: 0,
      [TokenTier.BASIC]: 1,
      [TokenTier.PRO]: 2,
      [TokenTier.ELITE]: 3
    };
    
    return tierValues[userTier] >= tierValues[requiredTier];
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to access strategy selection.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/auth")}>Log In</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Strategy Selection</h1>
          <p className="text-muted-foreground mt-2">
            Select and configure trading strategies based on your token tier
          </p>
        </div>
        
        {/* User Tier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Token Tier</span>
              <TokenTierBadge tier={userTier} />
            </CardTitle>
            <CardDescription>
              Your access level is determined by your $ZIGMA token holdings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Tier Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {userTier !== TokenTier.ELITE ? `Next tier: ${getNextTier(userTier)}` : "Maximum tier reached"}
                  </span>
                </div>
                <Progress value={getTierProgressPercentage(userTier)} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Features</h3>
                  <ul className="space-y-2">
                    {getTierBenefits(userTier).map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {userTier !== TokenTier.ELITE && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Upgrade to Unlock</h3>
                    <ul className="space-y-2">
                      {getNextTierBenefits(userTier).map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <Lock className="h-4 w-4 mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="mt-4" onClick={() => window.open("https://app.uniswap.org/", "_blank")}>
                      Get $ZIGMA Tokens
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Strategy Selection Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Strategies</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category.toLowerCase()}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredStrategies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStrategies.map(strategy => {
                  const available = isStrategyAvailable(strategy.requiredTier);
                  
                  return (
                    <Card key={strategy.id} className={`overflow-hidden ${!available ? 'opacity-70' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{strategy.name}</CardTitle>
                          <TokenTierBadge tier={strategy.requiredTier} small />
                        </div>
                        <CardDescription>{strategy.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{strategy.description}</p>
                        
                        {!available && (
                          <Alert variant="destructive" className="mt-4 py-2">
                            <div className="flex items-center">
                              <Lock className="h-4 w-4 mr-2" />
                              <AlertTitle className="text-xs">Requires {strategy.requiredTier} Tier</AlertTitle>
                            </div>
                          </Alert>
                        )}
                      </CardContent>
                      <CardFooter>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <Button 
                                  className="w-full" 
                                  disabled={!available}
                                  onClick={() => handleSelectStrategy(strategy)}
                                >
                                  {available ? "Configure" : "Locked"}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            {!available && (
                              <TooltipContent>
                                <p>Upgrade to {strategy.requiredTier} tier to unlock this strategy</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No strategies found</AlertTitle>
                <AlertDescription>
                  No strategies match the selected filter.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Strategy Configuration Modal */}
      {selectedStrategy && (
        <StrategyConfigModal
          strategy={selectedStrategy}
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
        />
      )}
    </div>
  );
};

// Helper functions
const getNextTier = (currentTier: TokenTier): TokenTier => {
  switch (currentTier) {
    case TokenTier.FREE:
      return TokenTier.BASIC;
    case TokenTier.BASIC:
      return TokenTier.PRO;
    case TokenTier.PRO:
      return TokenTier.ELITE;
    default:
      return TokenTier.ELITE;
  }
};

const getTierProgressPercentage = (currentTier: TokenTier): number => {
  switch (currentTier) {
    case TokenTier.FREE:
      return 0;
    case TokenTier.BASIC:
      return 33;
    case TokenTier.PRO:
      return 66;
    case TokenTier.ELITE:
      return 100;
    default:
      return 0;
  }
};

const getTierBenefits = (tier: TokenTier): string[] => {
  switch (tier) {
    case TokenTier.FREE:
      return ["Access to Zigma Signals strategy"];
    case TokenTier.BASIC:
      return [
        "Access to Zigma Signals strategy",
        "Access to Copy Trading strategy",
        "Access to Sports Markets strategy",
        "Access to Crypto Markets strategy",
        "Access to Politics Markets strategy"
      ];
    case TokenTier.PRO:
      return [
        "Access to all BASIC tier strategies",
        "Access to Volume Trading strategy",
        "Access to Arbitrage strategy",
        "Increased position limits",
        "Priority execution"
      ];
    case TokenTier.ELITE:
      return [
        "Access to all PRO tier strategies",
        "Custom strategy development",
        "Reduced fees",
        "VIP support",
        "Early access to new features"
      ];
    default:
      return [];
  }
};

const getNextTierBenefits = (currentTier: TokenTier): string[] => {
  const nextTier = getNextTier(currentTier);
  const currentBenefits = new Set(getTierBenefits(currentTier));
  return getTierBenefits(nextTier).filter(benefit => !currentBenefits.has(benefit));
};

export default StrategySelection;
