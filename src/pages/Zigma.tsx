import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, DollarSign, Zap, Shield, Users, Clock, ArrowUpRight, Wallet, ExternalLink } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

interface TokenStats {
  price: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  holders: number;
  volume24h: number;
  priceChange24h: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  tokensRequired: number;
}

const Zigma = () => {
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    price: 0.01,
    marketCap: 5000000,
    totalSupply: 1000000000,
    circulatingSupply: 800000000,
    holders: 0,
    volume24h: 0,
    priceChange24h: 0
  });

  const [userBalance, setUserBalance] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLaunchingSoon] = useState(true);

  const plans: Plan[] = [
    {
      id: 'pro',
      name: 'Pro',
      price: 25,
      duration: 'per month',
      tokensRequired: 25,
      popular: true,
      features: [
        'Real-time signals',
        'Full market coverage (50,000+ markets)',
        'Email support',
        'Basic analytics',
        'API access (1,000 calls/month)',
        'Historical data access (30 days)'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 60,
      duration: 'per month',
      tokensRequired: 60,
      features: [
        'Everything in Pro',
        'Advanced analytics & predictions',
        'Real-time market alerts',
        'Priority support',
        'API access (10,000 calls/month)',
        'Historical data access (1 year)',
        'Custom signal filters'
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handlePurchase = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // TODO: Implement token purchase logic
    console.log('Purchasing plan:', plan);
    setSelectedPlan(planId);
  };

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-400">
                <a href="/zigmatoken" className="hover:text-green-300 transition-colors">$ZIGMA</a> AI Oracle
              </h1>
              <p className="text-gray-400 mt-2">AI-powered prediction market intelligence that detects structural edges and executes profitable trades automatically</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
              href="https://cyreneai.com/preview-page/zigma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-green-500 text-green-400 hover:bg-green-900/20 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
                <ExternalLink className="w-4 h-4" />
                Buy ZIGMA
              </a>
            </div>
          </div>

          {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Market Cap</p>
                  <p className="text-xl font-mono">TBA</p>
                  <p className="text-sm text-blue-300">Initial: $5M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Supply</p>
                  <p className="text-xl font-mono">{formatNumber(tokenStats.totalSupply)}</p>
                  <p className="text-sm text-purple-300">90% Public</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Signal Accuracy</p>
                  <p className="text-xl font-mono">68%-72%</p>
                  <p className="text-sm text-yellow-300">Beta Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Launch Date</p>
                  <p className="text-xl font-mono">Jan 27</p>
                  <p className="text-sm text-green-300">Fair Launch</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert */}
        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-300 font-medium">Token Launch: January 27, 2026</p>
                <p className="text-green-200/70 text-sm">Fair launch on Solana. No presale, No VC, No Bundles, No rugs.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview">How It Works</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="plans">Pricing</TabsTrigger>
            <TabsTrigger value="basket">Auto Trading</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* How ZIGMA Works */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">How ZIGMA Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h4 className="font-medium text-green-300">🔍 Market Analysis</h4>
                      <p className="text-sm text-gray-300 mt-1">AI scans 50,000+ prediction markets across 5 platforms</p>
                    </div>
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="font-medium text-blue-300">🎯 Edge Detection</h4>
                      <p className="text-sm text-gray-300 mt-1">Identifies structural inefficiencies and pricing gaps</p>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h4 className="font-medium text-purple-300">⚡ Signal Generation</h4>
                      <p className="text-sm text-gray-300 mt-1">Only generates signals with 68%+ confidence</p>
                    </div>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <h4 className="font-medium text-yellow-300">🤖 Auto Execution</h4>
                      <p className="text-sm text-gray-300 mt-1">Basket contract executes trades automatically</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300">The Silent Oracle Principle</p>
                    <p className="text-xs text-blue-200/70 mt-1">We speak only when structural edge exists. Silence is our default state.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Value Proposition */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Why Traders Use ZIGMA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Eliminate Information Asymmetry</h4>
                        <p className="text-sm text-gray-400">Access institutional-grade analysis without manual research</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Systematic Risk Management</h4>
                        <p className="text-sm text-gray-400">Kelly Criterion sizing, liquidity vetting, position limits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Multi-Platform Coverage</h4>
                        <p className="text-sm text-gray-400">Unified analysis across all prediction markets</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Full Transparency</h4>
                        <p className="text-sm text-gray-400">Complete audit trails and signal rationale</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Performance */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Live Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h4 className="font-medium text-green-300">Signal Accuracy</h4>
                      <p className="text-2xl font-bold text-green-400 mt-2">68%-72%</p>
                      <p className="text-sm text-green-200/70">Beta performance meeting threshold</p>
                    </div>
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="font-medium text-blue-300">Markets Monitored</h4>
                      <p className="text-2xl font-bold text-blue-400 mt-2">50,000+</p>
                      <p className="text-sm text-blue-200/70">Across 5 major prediction platforms (Polymarket live now)</p>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h4 className="font-medium text-purple-300">Processing Speed</h4>
                      <p className="text-2xl font-bold text-purple-400 mt-2">22 sec</p>
                      <p className="text-sm text-purple-200/70">Average analysis cycle time</p>
                    </div>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <h4 className="font-medium text-yellow-300">Confidence Threshold</h4>
                      <p className="text-2xl font-bold text-yellow-400 mt-2">≥68%</p>
                      <p className="text-sm text-yellow-200/70">Minimum confidence for signal generation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Management */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Risk Management Framework</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h4 className="font-medium text-red-300">Minimum Edge Required</h4>
                      <p className="text-xl font-bold text-red-400 mt-2">≥5%</p>
                      <p className="text-sm text-red-200/70">Effective edge after execution costs</p>
                    </div>
                    <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <h4 className="font-medium text-orange-300">Position Sizing</h4>
                      <p className="text-xl font-bold text-orange-400 mt-2">≤5%</p>
                      <p className="text-sm text-orange-200/70">Maximum exposure per trade</p>
                    </div>
                    <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                      <h4 className="font-medium text-cyan-300">Liquidity Requirement</h4>
                      <p className="text-xl font-bold text-cyan-400 mt-2">≥$10K</p>
                      <p className="text-sm text-cyan-200/70">Minimum market liquidity for execution</p>
                    </div>
                    <div className="p-3 bg-pink-900/20 border border-pink-500/30 rounded-lg">
                      <h4 className="font-medium text-pink-300">Drawdown Control</h4>
                      <p className="text-xl font-bold text-pink-400 mt-2">15%</p>
                      <p className="text-sm text-pink-200/70">Maximum portfolio drawdown trigger</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300">Institutional-Grade Controls</p>
                    <p className="text-xs text-green-200/70 mt-1">Kelly Criterion sizing, correlation limits, volatility filters</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="basket" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fund Utilization */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Fund Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Basket Contract</span>
                        <span className="font-mono text-green-400">50%</span>
                      </div>
                      <Progress value={50} className="h-2 bg-gray-700" />
                      <p className="text-xs text-gray-400">Funds autonomous trading contract</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Development</span>
                        <span className="font-mono text-blue-400">30%</span>
                      </div>
                      <Progress value={30} className="h-2 bg-gray-700" />
                      <p className="text-xs text-gray-400">Platform development & maintenance</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Marketing & Listings</span>
                        <span className="font-mono text-purple-400">20%</span>
                      </div>
                      <Progress value={20} className="h-2 bg-gray-700" />
                      <p className="text-xs text-gray-400">Marketing, exchange listings, operations</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300">Creator Fees Source</p>
                    <p className="text-xs text-green-200/70 mt-1">Funds raised from Cyrene launchpad creator fees</p>
                  </div>
                </CardContent>
              </Card>

              {/* Basket Contract Operations */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Basket Contract Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="font-medium text-blue-300">Automated Trading</h4>
                      <p className="text-sm text-gray-300 mt-1">Executes trades based on AI agent suggestions</p>
                      <p className="text-xs text-blue-200/70 mt-2">Autonomous execution of profitable signals</p>
                    </div>
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h4 className="font-medium text-green-300">Profit Distribution</h4>
                      <p className="text-sm text-gray-300 mt-1">50% to $ZIGMA holders (perpetual)</p>
                      <p className="text-xs text-green-200/70 mt-2">Holders receive profits as long as they hold tokens</p>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h4 className="font-medium text-purple-300">Reinvestment</h4>
                      <p className="text-sm text-gray-300 mt-1">30% reinvested into basket contract</p>
                      <p className="text-xs text-purple-200/70 mt-2">Compounds trading capital for growth</p>
                    </div>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <h4 className="font-medium text-yellow-300">Treasury</h4>
                      <p className="text-sm text-gray-300 mt-1">20% to treasury for operations</p>
                      <p className="text-xs text-yellow-200/70 mt-2">Platform growth and sustainability</p>
                    </div>
                  </div>
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-300">Launch Timeline</p>
                    <p className="text-xs text-red-200/70 mt-1">Basket contract deployment: February 7, 2026</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-green-400">Choose Your Plan</h2>
              <p className="text-gray-400 mt-2">Unlock premium features with $ZIGMA tokens</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`bg-gray-900 border-gray-700 relative ${
                    plan.popular ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-green-400">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-gray-400">
                        {plan.duration}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <ArrowUpRight className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => handlePurchase(plan.id)}
                    >
                      {userBalance >= plan.tokensRequired ? 'Subscribe Now' : 'Buy Tokens First'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="utility" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Utilities */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Current Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h4 className="font-medium text-green-300">Signal Accuracy</h4>
                      <p className="text-2xl font-bold text-green-400 mt-2">68%-72%</p>
                      <p className="text-sm text-green-200/70">Beta performance meeting threshold</p>
                    </div>
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="font-medium text-blue-300">Markets Monitored</h4>
                      <p className="text-2xl font-bold text-blue-400 mt-2">50,000+</p>
                      <p className="text-sm text-blue-200/70">Across 5 major prediction platforms (Polymarket live now)</p>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h4 className="font-medium text-purple-300">Processing Speed</h4>
                      <p className="text-2xl font-bold text-purple-400 mt-2">22 sec</p>
                      <p className="text-sm text-purple-200/70">Average analysis cycle time</p>
                    </div>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <h4 className="font-medium text-yellow-300">Confidence Threshold</h4>
                      <p className="text-2xl font-bold text-yellow-400 mt-2">≥68%</p>
                      <p className="text-sm text-yellow-200/70">Minimum confidence for signal generation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Future Utilities */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-green-400">Platform Roadmap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h4 className="font-medium text-green-300">Polymarket</h4>
                      <p className="text-sm text-gray-400 mt-1">Real-time market data via Gamma API + CLOB</p>
                      <div className="mt-2">
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Live Now</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <h4 className="font-medium text-blue-300">Kalshi</h4>
                      <p className="text-sm text-gray-400 mt-1">US regulatory compliant event markets</p>
                      <div className="mt-2">
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Coming Soon</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <h4 className="font-medium text-purple-300">Option Market Protocol</h4>
                      <p className="text-sm text-gray-400 mt-1">DeFi options markets integration</p>
                      <div className="mt-2">
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Coming Soon</span>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <h4 className="font-medium text-yellow-300">Jupiter & Raydium</h4>
                      <p className="text-sm text-gray-400 mt-1">Solana DEX pool monitoring</p>
                      <div className="mt-2">
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Coming Soon</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h4 className="font-medium text-red-300">Cross-Platform Arbitrage</h4>
                      <p className="text-sm text-gray-400 mt-1">Automated arbitrage detection</p>
                      <div className="mt-2">
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Zigma;
