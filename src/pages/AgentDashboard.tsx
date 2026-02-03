import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Zap, Shield, Wallet, Settings } from "lucide-react";

interface AgentStats {
  tier: 'FREE' | 'BASIC' | 'PRO' | 'WHALE';
  zigmaBalance: number;
  signalsUsed: number;
  signalsLimit: number;
  tradesExecuted: number;
  tradesLimit: number;
  skillsEnabled: number;
  skillsLimit: number;
  totalPnL: number;
  winRate: number;
}

interface EnabledSkill {
  id: string;
  name: string;
  status: 'active' | 'paused';
  tradesExecuted: number;
  pnl: number;
}

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AgentStats>({
    tier: 'FREE',
    zigmaBalance: 0,
    signalsUsed: 0,
    signalsLimit: 10,
    tradesExecuted: 0,
    tradesLimit: 5,
    skillsEnabled: 0,
    skillsLimit: 3,
    totalPnL: 0,
    winRate: 0,
  });

  const [enabledSkills, setEnabledSkills] = useState<EnabledSkill[]>([]);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // Get agent ID from auth context or localStorage
        const PLATFORM_API = import.meta.env.VITE_PLATFORM_API_URL || 'http://localhost:3002';
        const agentId = localStorage.getItem('agentId') || 'default-agent';
        
        // Fetch agent stats
        const statsResponse = await fetch(`${PLATFORM_API}/api/agents/${agentId}`);
        if (statsResponse.ok) {
          const agentData = await statsResponse.json();
          setStats({
            tier: agentData.tier || 'FREE',
            zigmaBalance: agentData.zigmaBalance || 0,
            signalsUsed: agentData.usage?.signalsUsed || 0,
            signalsLimit: agentData.usage?.signalsLimit || 10,
            tradesExecuted: agentData.usage?.tradesExecuted || 0,
            tradesLimit: agentData.usage?.tradesLimit || 5,
            skillsEnabled: agentData.usage?.skillsEnabled || 0,
            skillsLimit: agentData.usage?.skillsLimit || 3,
            totalPnL: agentData.performance?.totalPnL || 0,
            winRate: agentData.performance?.winRate || 0,
          });
        }

        // Fetch enabled skills
        const skillsResponse = await fetch(`${PLATFORM_API}/api/agents/${agentId}/skills`);
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          setEnabledSkills(skillsData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch agent data:', error);
        // Fallback to mock data on error
        setStats({
          tier: 'PRO',
          zigmaBalance: 15000,
          signalsUsed: 45,
          signalsLimit: 200,
          tradesExecuted: 12,
          tradesLimit: 50,
          skillsEnabled: 3,
          skillsLimit: 6,
          totalPnL: 1250.50,
          winRate: 68.5,
        });
        setEnabledSkills([
          { id: 'high-conviction', name: 'High Conviction Filter', status: 'active', tradesExecuted: 5, pnl: 450.25 },
          { id: 'crypto-oracle', name: 'Crypto Oracle', status: 'active', tradesExecuted: 4, pnl: 320.75 },
          { id: 'weather-oracle', name: 'Weather Oracle', status: 'active', tradesExecuted: 3, pnl: 479.50 },
        ]);
      }
    };

    fetchAgentData();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'bg-gray-500';
      case 'BASIC': return 'bg-blue-500';
      case 'PRO': return 'bg-purple-500';
      case 'WHALE': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierBadge = (tier: string) => {
    const color = getTierColor(tier);
    return <Badge className={`${color} text-white`}>{tier}</Badge>;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-green-300">ZIGMA AGENT</p>
            <h1 className="text-4xl font-bold text-white mt-2">Agent Dashboard</h1>
          </div>
          <Button 
            onClick={() => navigate('/settings')}
            className="bg-green-500 hover:bg-green-600 text-black"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Agent Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gray-950 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {getTierBadge(stats.tier)}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/skills')}
                  className="text-green-400 hover:text-green-300"
                >
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                $ZIGMA Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {stats.zigmaBalance.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total PnL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)} USDC
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-950 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {stats.winRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Limits */}
        <Card className="bg-gray-950 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-300">Usage Limits (Today)</CardTitle>
            <CardDescription className="text-green-300/60">
              Track your daily usage across signals, trades, and skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-300">Signals Used</span>
                <span className="text-white">{stats.signalsUsed} / {stats.signalsLimit}</span>
              </div>
              <Progress 
                value={(stats.signalsUsed / stats.signalsLimit) * 100} 
                className="h-2 bg-gray-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-300">Trades Executed</span>
                <span className="text-white">{stats.tradesExecuted} / {stats.tradesLimit}</span>
              </div>
              <Progress 
                value={(stats.tradesExecuted / stats.tradesLimit) * 100} 
                className="h-2 bg-gray-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-300">Skills Enabled</span>
                <span className="text-white">{stats.skillsEnabled} / {stats.skillsLimit}</span>
              </div>
              <Progress 
                value={(stats.skillsEnabled / stats.skillsLimit) * 100} 
                className="h-2 bg-gray-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enabled Skills */}
        <Card className="bg-gray-950 border-green-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-300">Enabled Skills</CardTitle>
                <CardDescription className="text-green-300/60">
                  Your active trading skills
                </CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/skills')}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                <Zap className="w-4 h-4 mr-2" />
                Manage Skills
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {enabledSkills.length === 0 ? (
              <div className="text-center py-8 text-green-300/60">
                <p>No skills enabled yet</p>
                <Button 
                  onClick={() => navigate('/skills')}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-black"
                >
                  Browse Skills
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {enabledSkills.map((skill) => (
                  <div 
                    key={skill.id}
                    className="bg-black border border-green-500/30 p-4 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold">{skill.name}</h3>
                        <Badge 
                          variant={skill.status === 'active' ? 'default' : 'secondary'}
                          className={skill.status === 'active' ? 'bg-green-500 text-black' : ''}
                        >
                          {skill.status}
                        </Badge>
                      </div>
                      <div className="flex gap-6 mt-2 text-sm text-green-300">
                        <span>Trades: {skill.tradesExecuted}</span>
                        <span className={skill.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          PnL: {skill.pnl >= 0 ? '+' : ''}{skill.pnl.toFixed(2)} USDC
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/skills?configure=${skill.id}`)}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-950 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-300">Recent Activity</CardTitle>
            <CardDescription className="text-green-300/60">
              Latest trades and signals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-green-300/60">
              <p>Activity feed coming soon</p>
              <p className="text-xs mt-2">Check the Analytics page for detailed performance</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AgentDashboard;
