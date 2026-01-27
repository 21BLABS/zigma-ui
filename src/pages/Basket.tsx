import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Target, Shield } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

interface Basket {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  performance: number;
  positions: Position[];
  riskLevel: 'Low' | 'Medium' | 'High';
  category: string;
  autoRebalance: boolean;
  lastUpdated: string;
}

interface Position {
  id: string;
  market: string;
  outcome: 'YES' | 'NO';
  amount: number;
  odds: number;
  potentialReturn: number;
  status: 'active' | 'settled' | 'pending';
}

const Basket = () => {
  const [baskets, setBaskets] = useState<Basket[]>([
    {
      id: 'macro-elections',
      name: 'US Elections 2024',
      description: 'Diversified portfolio across key election markets',
      totalValue: 10000,
      performance: 15.4,
      riskLevel: 'Medium',
      category: 'Politics',
      autoRebalance: true,
      lastUpdated: '2024-01-27T10:30:00Z',
      positions: [
        {
          id: '1',
          market: 'Presidential Election Winner',
          outcome: 'YES',
          amount: 3000,
          odds: 65,
          potentialReturn: 4615,
          status: 'active'
        },
        {
          id: '2',
          market: 'Senate Control GOP',
          outcome: 'YES',
          amount: 2500,
          odds: 58,
          potentialReturn: 4310,
          status: 'active'
        },
        {
          id: '3',
          market: 'House Control GOP',
          outcome: 'NO',
          amount: 2000,
          odds: 42,
          potentialReturn: 4762,
          status: 'active'
        },
        {
          id: '4',
          market: 'Popular Vote Margin > 5%',
          outcome: 'YES',
          amount: 2500,
          odds: 72,
          potentialReturn: 3472,
          status: 'pending'
        }
      ]
    },
    {
      id: 'tech-growth',
      name: 'Tech Giants Q4',
      description: 'Focused on major tech company earnings and performance',
      totalValue: 7500,
      performance: -2.3,
      riskLevel: 'High',
      category: 'Technology',
      autoRebalance: false,
      lastUpdated: '2024-01-27T09:15:00Z',
      positions: [
        {
          id: '5',
          market: 'Apple Q4 Revenue Beat',
          outcome: 'YES',
          amount: 4000,
          odds: 45,
          potentialReturn: 8889,
          status: 'active'
        },
        {
          id: '6',
          market: 'Tesla Q4 Deliveries > 400K',
          outcome: 'NO',
          amount: 3500,
          odds: 38,
          potentialReturn: 9211,
          status: 'settled'
        }
      ]
    }
  ]);

  const [selectedBasket, setSelectedBasket] = useState<Basket | null>(baskets[0]);
  const [activeTab, setActiveTab] = useState('overview');

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'High': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'settled': return 'bg-blue-500/20 text-blue-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Basket Trading</h1>
            <p className="text-gray-400 mt-2">Automated portfolio management across prediction markets</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Target className="w-4 h-4 mr-2" />
            Create New Basket
          </Button>
        </div>

        {/* Alert */}
        <Card className="bg-yellow-900/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-300 font-medium">Basket Contract Launch: February 1, 2026</p>
                <p className="text-yellow-200/70 text-sm">First profit distribution scheduled for February 7, 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basket List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-green-400">Active Baskets</h2>
            {baskets.map((basket) => (
              <Card 
                key={basket.id}
                className={`cursor-pointer transition-all ${
                  selectedBasket?.id === basket.id 
                    ? 'bg-green-900/30 border-green-500' 
                    : 'bg-gray-900 border-gray-700 hover:border-green-500/50'
                }`}
                onClick={() => setSelectedBasket(basket)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{basket.name}</CardTitle>
                    <Badge className={getRiskColor(basket.riskLevel)}>
                      {basket.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{basket.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Value</span>
                      <span className="font-mono">{formatCurrency(basket.totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Performance</span>
                      <span className={`font-mono ${basket.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(basket.performance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Positions</span>
                      <span>{basket.positions.length}</span>
                    </div>
                    {basket.autoRebalance && (
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Auto-rebalance
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Basket Details */}
          <div className="lg:col-span-2">
            {selectedBasket && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedBasket.name}</CardTitle>
                      <p className="text-gray-400 mt-1">{selectedBasket.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRiskColor(selectedBasket.riskLevel)}>
                        {selectedBasket.riskLevel} Risk
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-300">
                        {selectedBasket.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-800 border-gray-700">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="positions">Positions</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gray-800 border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-5 h-5 text-green-400" />
                              <div>
                                <p className="text-sm text-gray-400">Total Value</p>
                                <p className="text-xl font-mono">{formatCurrency(selectedBasket.totalValue)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-800 border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {selectedBasket.performance >= 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-400" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                              )}
                              <div>
                                <p className="text-sm text-gray-400">Performance</p>
                                <p className={`text-xl font-mono ${selectedBasket.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatPercent(selectedBasket.performance)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-800 border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Target className="w-5 h-5 text-blue-400" />
                              <div>
                                <p className="text-sm text-gray-400">Active Positions</p>
                                <p className="text-xl font-mono">{selectedBasket.positions.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Allocation Chart */}
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg">Portfolio Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedBasket.positions.map((position, index) => (
                              <div key={position.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">{position.market}</span>
                                  <span className="font-mono">{formatCurrency(position.amount)}</span>
                                </div>
                                <Progress 
                                  value={(position.amount / selectedBasket.totalValue) * 100} 
                                  className="h-2 bg-gray-700"
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="positions" className="space-y-4">
                      <div className="space-y-3">
                        {selectedBasket.positions.map((position) => (
                          <Card key={position.id} className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-white">{position.market}</h4>
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="text-gray-400">Outcome:</span>
                                    <Badge className={position.outcome === 'YES' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                                      {position.outcome}
                                    </Badge>
                                    <span className="text-gray-400">Odds:</span>
                                    <span className="font-mono">{position.odds}%</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="space-y-1">
                                    <p className="text-sm text-gray-400">Amount</p>
                                    <p className="font-mono">{formatCurrency(position.amount)}</p>
                                    <p className="text-sm text-gray-400">Potential Return</p>
                                    <p className="font-mono text-green-400">{formatCurrency(position.potentialReturn)}</p>
                                  </div>
                                  <Badge className={getStatusColor(position.status)}>
                                    {position.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Return</span>
                              <span className={`font-mono ${selectedBasket.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(selectedBasket.totalValue * (selectedBasket.performance / 100))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Win Rate</span>
                              <span className="font-mono">67%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Average Odds</span>
                              <span className="font-mono">54%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Last Updated</span>
                              <span className="font-mono">
                                {new Date(selectedBasket.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Basket;
