import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, DollarSign, Zap, Shield, Users, Clock, ArrowUpRight, Wallet, ExternalLink, Coins } from 'lucide-react';
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

const Zigma = () => {
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    price: 0.000028,
    marketCap: 28000,
    totalSupply: 1000000000,
    circulatingSupply: 900000000,
    holders: 154,
    volume24h: 96000,
    priceChange24h: 0
  });


  // Fetch real-time token data from DexScreener API
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // DexScreener API for ZIGMA token
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai');
        const data = await response.json();
        
        console.log('DexScreener token data:', data);
        
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          const price = parseFloat(pair.priceUsd) || 0;
          const liquidity = pair.liquidity?.usd || 0;
          const volume24h = pair.volume?.h24 || 0;
          const fdv = pair.fdv || 0;
          
          setTokenStats({
            price: price,
            marketCap: fdv,
            totalSupply: 1000000000,
            circulatingSupply: 900000000,
            holders: 154,
            volume24h: volume24h,
            priceChange24h: pair.priceChange?.h24 || 0
          });
          
          console.log('✅ Real token data from DexScreener:', {
            price,
            marketCap: fdv,
            volume24h,
            priceChange24h: pair.priceChange?.h24
          });
        } else {
          console.log('❌ No pair data found');
        }
      } catch (error) {
        console.error('❌ Failed to fetch token data from DexScreener:', error);
        // Fallback to hardcoded data if API fails
        setTokenStats({
          price: 0.000028,
          marketCap: 28000,
          totalSupply: 1000000000,
          circulatingSupply: 900000000,
          holders: 154,
          volume24h: 96000,
          priceChange24h: 0
        });
      }
    };

    // Initial fetch
    fetchTokenData();
    
    // Update every 30 seconds for live data
    const interval = setInterval(fetchTokenData, 30000);
    
    return () => clearInterval(interval);
  }, []);


  const [userBalance, setUserBalance] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLaunchingSoon] = useState(true);



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
              href="https://cyreneai.com/trade/zigma" 
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
                  <p className="text-xl font-mono">
                    {tokenStats.marketCap > 0 ? formatCurrency(tokenStats.marketCap) : 'Loading...'}
                  </p>
                  <p className="text-sm text-blue-300">Live Data</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Holders</p>
                  <p className="text-xl font-mono">
                    {tokenStats.holders > 0 ? tokenStats.holders.toLocaleString() : 'Loading...'}
                  </p>
                  <p className="text-sm text-purple-300">Unique Addresses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Supply</p>
                  <p className="text-xl font-mono">{formatNumber(tokenStats.totalSupply)}</p>
                  <p className="text-sm text-orange-300">90% Public</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400">Volume (24h)</p>
                  <p className="text-xl font-mono">
                    {tokenStats.volume24h > 0 ? formatCurrency(tokenStats.volume24h) : 'Loading...'}
                  </p>
                  <p className="text-sm text-cyan-300">Trading Volume</p>
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
            <TabsTrigger value="plans">Token Utility</TabsTrigger>
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
              <h2 className="text-2xl font-bold text-green-400">ZIGMA Token Utility</h2>
              <p className="text-gray-400 mt-2">Hold ZIGMA tokens to access AI chat predictions</p>
            </div>

            {/* Token Requirements */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Coins className="w-8 h-8 text-green-400" />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">Chat Access Requirements</h3>
                    <p className="text-sm text-gray-400 mt-1">Hold ZIGMA tokens in your wallet to unlock chat</p>
                  </div>
                </div>
                <div className="bg-black/40 border border-green-500/20 rounded-lg p-4 mt-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">10,000 ZIGMA</p>
                    <p className="text-sm text-gray-400 mt-1">≈ $1.41 USD</p>
                    <p className="text-lg text-white mt-2">= 3 Chat Conversations</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>✓ Automatic balance checking</li>
                      <li>✓ No subscription required</li>
                      <li>✓ Pay only for what you use</li>
                      <li>✓ Full access to AI predictions</li>
                    </ul>
                  </div>
                </div>

                {/* How to Deposit ZIGMA */}
                <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    📥 How to Deposit ZIGMA for Chat Access
                  </h4>
                  <ol className="text-sm text-yellow-100 space-y-3 list-decimal list-inside">
                    <li className="leading-relaxed">
                      <strong>Login to ZIGMA</strong> - Sign in with your email to get your Solana wallet address
                    </li>
                    <li className="leading-relaxed">
                      <strong>Copy Your Wallet Address</strong> - Click your profile icon (top right) and copy your Solana wallet address
                    </li>
                    <li className="leading-relaxed">
                      <strong>Buy ZIGMA Tokens</strong> - Purchase ZIGMA on Phantom, Jupiter, or any Solana DEX
                    </li>
                    <li className="leading-relaxed">
                      <strong>Send to Your ZIGMA Wallet</strong> - Transfer at least 10,000 ZIGMA tokens to the wallet address you copied
                    </li>
                    <li className="leading-relaxed">
                      <strong>Start Chatting</strong> - Your balance updates automatically. Go to Chat page and start using AI predictions!
                    </li>
                  </ol>
                  <div className="mt-4 pt-3 border-t border-yellow-500/20">
                    <p className="text-xs text-yellow-200/80">
                      💡 <strong>Tip:</strong> Your ZIGMA wallet is created automatically when you sign up. No need to connect external wallets!
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <a
                    href="https://phantom.com/tokens/solana/xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai?referralId=gkr7v4xfqno"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    Buy ZIGMA on Phantom
                  </a>
                </div>
              </CardContent>
            </Card>
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
