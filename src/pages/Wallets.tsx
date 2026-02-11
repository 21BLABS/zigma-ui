import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import { getWallets, createWallet, registerBYOW, fundWallet, Wallet } from '@/lib/platformApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Wallet as WalletIcon, RefreshCw, Copy, ExternalLink } from 'lucide-react';

const WalletsPage: React.FC = () => {
  const { platform } = useMagicAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isFunding, setIsFunding] = useState<Record<string, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [fundAmount, setFundAmount] = useState(100);
  const [newWallet, setNewWallet] = useState({
    network: 'POLYGON' as Wallet['network'],
    type: 'PLATFORM_MANAGED' as 'PLATFORM_MANAGED' | 'BYOW',
    address: '',
    signature: ''
  });

  // Fetch wallets on mount and when platform agent changes
  useEffect(() => {
    fetchWallets();
  }, [platform.agent]);

  const fetchWallets = async () => {
    if (!platform.agent) return;
    
    setIsLoading(true);
    try {
      const data = await getWallets(platform.agent.id);
      setWallets(data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!platform.agent) return;
    
    setIsCreating(true);
    try {
      if (newWallet.type === 'PLATFORM_MANAGED') {
        const created = await createWallet(
          platform.agent.id,
          newWallet.network
        );
        
        if (created) {
          toast({
            title: 'Success',
            description: 'Wallet created successfully',
          });
          setCreateDialogOpen(false);
          setNewWallet({
            network: 'POLYGON',
            type: 'PLATFORM_MANAGED',
            address: '',
            signature: ''
          });
          await fetchWallets();
        }
      } else {
        // BYOW flow
        if (!newWallet.address || !newWallet.signature) {
          toast({
            title: 'Error',
            description: 'Address and signature are required for BYOW',
            variant: 'destructive',
          });
          setIsCreating(false);
          return;
        }
        
        const registered = await registerBYOW(
          platform.agent.id,
          newWallet.address,
          newWallet.network,
          newWallet.signature
        );
        
        if (registered) {
          toast({
            title: 'Success',
            description: 'Wallet registered successfully',
          });
          setCreateDialogOpen(false);
          setNewWallet({
            network: 'POLYGON',
            type: 'PLATFORM_MANAGED',
            address: '',
            signature: ''
          });
          await fetchWallets();
        }
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to create wallet',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFundWallet = async () => {
    if (!selectedWallet) return;
    
    setIsFunding({ ...isFunding, [selectedWallet.id]: true });
    
    try {
      const success = await fundWallet(selectedWallet.id, fundAmount);
      
      if (success) {
        toast({
          title: 'Success',
          description: `Wallet funded with ${fundAmount} USDC`,
        });
        setFundDialogOpen(false);
        setSelectedWallet(null);
        setFundAmount(100);
        await fetchWallets();
      }
    } catch (error) {
      console.error('Failed to fund wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to fund wallet',
        variant: 'destructive',
      });
    } finally {
      setIsFunding({ ...isFunding, [selectedWallet.id]: false });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard',
    });
  };

  const openBlockExplorer = (address: string, network: Wallet['network']) => {
    let url = '';
    
    switch (network) {
      case 'POLYGON':
        url = `https://polygonscan.com/address/${address}`;
        break;
      case 'ETHEREUM':
        url = `https://etherscan.io/address/${address}`;
        break;
      case 'SOLANA':
        url = `https://solscan.io/account/${address}`;
        break;
      default:
        url = `https://polygonscan.com/address/${address}`;
    }
    
    window.open(url, '_blank');
  };

  if (!platform.agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h2 className="text-2xl font-bold mb-4">Connect to Platform</h2>
        <p className="text-gray-500 mb-6">You need to connect to the platform to manage wallets</p>
        <Button onClick={() => navigate('/auth')}>Connect Now</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Trading Wallets</h1>
          <p className="text-gray-500">Manage and fund your trading wallets</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchWallets} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Wallet</DialogTitle>
                <DialogDescription>
                  Create a new trading wallet or connect an existing one
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Tabs defaultValue="platform" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="platform"
                      onClick={() => setNewWallet({...newWallet, type: 'PLATFORM_MANAGED'})}
                    >
                      Platform Managed
                    </TabsTrigger>
                    <TabsTrigger 
                      value="byow"
                      onClick={() => setNewWallet({...newWallet, type: 'BYOW'})}
                    >
                      Bring Your Own Wallet
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="platform">
                    <div className="space-y-4 mt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="network">Network</Label>
                        <Select
                          value={newWallet.network}
                          onValueChange={(value: Wallet['network']) => 
                            setNewWallet({ ...newWallet, network: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POLYGON">Polygon</SelectItem>
                            <SelectItem value="ETHEREUM">Ethereum</SelectItem>
                            <SelectItem value="SOLANA">Solana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>A new wallet will be created for you on the selected network.</p>
                        <p className="mt-2">Platform-managed wallets are fully controlled by the platform and can be used for automated trading.</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="byow">
                    <div className="space-y-4 mt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="network">Network</Label>
                        <Select
                          value={newWallet.network}
                          onValueChange={(value: Wallet['network']) => 
                            setNewWallet({ ...newWallet, network: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POLYGON">Polygon</SelectItem>
                            <SelectItem value="ETHEREUM">Ethereum</SelectItem>
                            <SelectItem value="SOLANA">Solana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address">Wallet Address</Label>
                        <Input
                          id="address"
                          value={newWallet.address}
                          onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                          placeholder="0x..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="signature">Signature</Label>
                        <Input
                          id="signature"
                          value={newWallet.signature}
                          onChange={(e) => setNewWallet({ ...newWallet, signature: e.target.value })}
                          placeholder="Signature to verify wallet ownership"
                        />
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Connect your existing wallet to the platform.</p>
                        <p className="mt-2">You'll need to sign a message to verify ownership.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWallet} disabled={isCreating}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Wallet
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
      ) : wallets.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-medium mb-2">No wallets found</p>
            <p className="text-gray-500 mb-6">Create your first wallet to start trading</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <WalletIcon className="h-5 w-5 mr-2" />
                    <CardTitle className="text-xl">
                      {wallet.network} Wallet
                    </CardTitle>
                  </div>
                  <Badge variant={wallet.type === 'PLATFORM_MANAGED' ? "default" : "outline"}>
                    {wallet.type === 'PLATFORM_MANAGED' ? 'Managed' : 'BYOW'}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  <div className="flex items-center">
                    <span className="truncate">{wallet.address}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 ml-1"
                      onClick={() => copyToClipboard(wallet.address)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Balance:</span>
                    <span className="font-medium">
                      ${wallet.balance.toFixed(2)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {new Date(wallet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openBlockExplorer(wallet.address, wallet.network)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> Explorer
                </Button>
                <Dialog open={fundDialogOpen && selectedWallet?.id === wallet.id} onOpenChange={(open) => {
                  setFundDialogOpen(open);
                  if (open) setSelectedWallet(wallet);
                  else setSelectedWallet(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm"
                      disabled={wallet.type !== 'PLATFORM_MANAGED'}
                    >
                      Fund Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Fund Wallet</DialogTitle>
                      <DialogDescription>
                        Add funds to your trading wallet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (USDC)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(Number(e.target.value))}
                        />
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Funds will be added to your wallet immediately.</p>
                        <p className="mt-2 text-amber-500">This is for development purposes only. In production, you would connect to a real payment provider.</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setFundDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleFundWallet} 
                        disabled={isFunding[wallet.id]}
                      >
                        {isFunding[wallet.id] ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Fund Wallet
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletsPage;
