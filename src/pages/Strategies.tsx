import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import { 
  getStrategies, 
  createStrategy, 
  updateStrategy, 
  deleteStrategy, 
  executeStrategy,
  Strategy
} from '@/lib/platformApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Play, Settings, Trash2, RefreshCw, ArrowRight } from 'lucide-react';

const StrategyPage: React.FC = () => {
  const { platform } = useMagicAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState<Record<string, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    strategyType: 'SIGNALS' as Strategy['strategyType'],
    description: '',
    config: {
      minEdge: 0.03,
      minConfidence: 70,
      maxAmount: 100,
      maxAmountPerTrade: 20,
      maxPositions: 5,
      autoExecute: false,
      enabledCategories: ['SPORTS', 'POLITICS', 'CRYPTO']
    }
  });

  // Fetch strategies on mount and when platform agent changes
  useEffect(() => {
    fetchStrategies();
  }, [platform.agent]);

  const fetchStrategies = async () => {
    if (!platform.agent) return;
    
    setIsLoading(true);
    try {
      const data = await getStrategies(platform.agent.id);
      setStrategies(data);
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load strategies',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStrategy = async () => {
    if (!platform.agent) return;
    
    setIsCreating(true);
    try {
      const created = await createStrategy(
        platform.agent.id,
        newStrategy.strategyType,
        newStrategy.name,
        {
          ...newStrategy.config,
          description: newStrategy.description
        }
      );
      
      if (created) {
        toast({
          title: 'Success',
          description: 'Strategy created successfully',
        });
        setCreateDialogOpen(false);
        setNewStrategy({
          name: '',
          strategyType: 'SIGNALS',
          description: '',
          config: {
            minEdge: 0.03,
            minConfidence: 70,
            maxAmount: 100,
            maxAmountPerTrade: 20,
            maxPositions: 5,
            autoExecute: false,
            enabledCategories: ['SPORTS', 'POLITICS', 'CRYPTO']
          }
        });
        await fetchStrategies();
      }
    } catch (error) {
      console.error('Failed to create strategy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create strategy',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStrategy = async (strategy: Strategy) => {
    try {
      const updated = await updateStrategy(strategy.id, {
        enabled: !strategy.enabled
      });
      
      if (updated) {
        setStrategies(strategies.map(s => 
          s.id === strategy.id ? { ...s, enabled: !s.enabled } : s
        ));
        
        toast({
          title: 'Success',
          description: `Strategy ${!strategy.enabled ? 'enabled' : 'disabled'} successfully`,
        });
      }
    } catch (error) {
      console.error('Failed to update strategy:', error);
      toast({
        title: 'Error',
        description: 'Failed to update strategy',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    
    try {
      const success = await deleteStrategy(strategyId);
      
      if (success) {
        setStrategies(strategies.filter(s => s.id !== strategyId));
        toast({
          title: 'Success',
          description: 'Strategy deleted successfully',
        });
      }
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete strategy',
        variant: 'destructive',
      });
    }
  };

  const handleExecuteStrategy = async (strategyId: string) => {
    setIsExecuting(prev => ({ ...prev, [strategyId]: true }));
    
    try {
      const results = await executeStrategy(strategyId);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      toast({
        title: 'Execution Complete',
        description: `${successCount} successful, ${failCount} failed`,
        variant: successCount > 0 ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Failed to execute strategy:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute strategy',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(prev => ({ ...prev, [strategyId]: false }));
    }
  };

  const handleEditStrategy = (strategy: Strategy) => {
    navigate(`/strategies/${strategy.id}`);
  };

  if (platform.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Connecting to Platform</h2>
          <p className="text-muted-foreground">Please wait while we establish a connection...</p>
        </div>
      </div>
    );
  }
  
  if (!platform.agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h2 className="text-2xl font-bold mb-4">Connect to Platform</h2>
        <p className="text-gray-500 mb-2">You need to connect to the platform to manage strategies</p>
        {platform.error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 max-w-md">
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">{platform.error}</p>
            <p className="text-sm mt-2">Make sure the platform backend is running at {import.meta.env.VITE_PLATFORM_API_URL || 'http://localhost:3002'}</p>
          </div>
        )}
        <Button onClick={() => navigate('/auth')}>Connect Now</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Trading Strategies</h1>
          <p className="text-gray-500">Configure and manage your autonomous trading strategies</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStrategies} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Strategy</DialogTitle>
                <DialogDescription>
                  Configure your trading strategy settings
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Strategy Name</Label>
                  <Input
                    id="name"
                    value={newStrategy.name}
                    onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                    placeholder="My Trading Strategy"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Strategy Type</Label>
                  <Select
                    value={newStrategy.strategyType}
                    onValueChange={(value: Strategy['strategyType']) => 
                      setNewStrategy({ ...newStrategy, strategyType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select strategy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIGNALS">Zigma Signals</SelectItem>
                      <SelectItem value="COPY_TRADING">Copy Trading</SelectItem>
                      <SelectItem value="SPORTS">Sports Markets</SelectItem>
                      <SelectItem value="POLITICS">Politics Markets</SelectItem>
                      <SelectItem value="CRYPTO">Crypto Markets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                    placeholder="Description of your strategy"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minEdge">Minimum Edge (%)</Label>
                  <Input
                    id="minEdge"
                    type="number"
                    value={newStrategy.config.minEdge * 100}
                    onChange={(e) => setNewStrategy({
                      ...newStrategy,
                      config: {
                        ...newStrategy.config,
                        minEdge: Number(e.target.value) / 100
                      }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxAmount">Maximum Amount (USDC)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    value={newStrategy.config.maxAmount}
                    onChange={(e) => setNewStrategy({
                      ...newStrategy,
                      config: {
                        ...newStrategy.config,
                        maxAmount: Number(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoExecute"
                    checked={newStrategy.config.autoExecute}
                    onCheckedChange={(checked) => setNewStrategy({
                      ...newStrategy,
                      config: {
                        ...newStrategy.config,
                        autoExecute: checked
                      }
                    })}
                  />
                  <Label htmlFor="autoExecute">Auto-Execute Trades</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStrategy} disabled={isCreating}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Strategy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : strategies.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-medium mb-2">No strategies found</p>
            <p className="text-gray-500 mb-6">Create your first trading strategy to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Strategy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className={`overflow-hidden ${!strategy.enabled ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{strategy.name}</CardTitle>
                    <CardDescription>{strategy.description || 'No description'}</CardDescription>
                  </div>
                  <Badge variant={strategy.enabled ? "default" : "outline"}>
                    {strategy.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{strategy.strategyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auto-Execute:</span>
                    <span className="font-medium">
                      {strategy.config?.autoExecute ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Amount:</span>
                    <span className="font-medium">
                      ${strategy.config?.maxAmount || 0} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {new Date(strategy.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleStrategy(strategy)}
                  >
                    {strategy.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteStrategy(strategy.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditStrategy(strategy)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleExecuteStrategy(strategy.id)}
                    disabled={isExecuting[strategy.id] || !strategy.enabled}
                  >
                    {isExecuting[strategy.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isExecuting[strategy.id] ? 'Running' : 'Execute'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrategyPage;
