import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Zap, Shield, Wallet, Settings } from "lucide-react";
import { getOrCreateAgent, getAgentStats, getEnabledSkills, type EnabledSkill as PlatformEnabledSkill } from "@/lib/platformApi";
import { ActivityFeed } from "@/components/ActivityFeed";

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
  enabledAt?: string;
  lastExecuted?: string;
  config?: Record<string, any>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        // Get or create agent (auto-register on first login)
        const agent = await getOrCreateAgent();
        
        if (agent) {
          // Fetch agent stats
          const agentStats = await getAgentStats(agent.id);
          
          // Fetch enabled skills
          const skills = await getEnabledSkills(agent.id);
          setEnabledSkills(skills.map(skill => ({
            id: skill.id,
            name: skill.name,
            status: skill.status,
            tradesExecuted: skill.tradesExecuted,
            pnl: skill.pnl,
            enabledAt: skill.enabledAt,
            lastExecuted: skill.lastExecuted,
            config: skill.config,
          })));
          
          setStats({
            tier: agent.tier,
            zigmaBalance: agent.zigmaBalance,
            signalsUsed: 0, // TODO: Track usage from backend
            signalsLimit: agent.tier === 'FREE' ? 10 : agent.tier === 'BASIC' ? 50 : 200,
            tradesExecuted: agentStats?.totalTrades || 0,
            tradesLimit: agent.tier === 'FREE' ? 5 : agent.tier === 'BASIC' ? 20 : 100,
            skillsEnabled: skills.length,
            skillsLimit: agent.tier === 'FREE' ? 3 : agent.tier === 'BASIC' ? 6 : 10,
            totalPnL: agentStats?.totalPnl || 0,
            winRate: agentStats?.winRate || 0,
          });
        } else {
          // No agent yet - show FREE tier defaults
          setStats({
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
        }
      } catch (error) {
        console.error('Failed to fetch agent data:', error);
        // Show FREE tier defaults on error
        setStats({
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
      } finally {
        setLoading(false);
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
      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {loading && (
          <div className="text-center py-8 text-green-300">
            <p>Loading agent data...</p>
          </div>
        )}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
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

          <Card className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
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

          <Card className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
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

          <Card className="bg-gray-950 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
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
        <Card className="bg-gray-950 border-green-500/20 hover:border-green-500/30 transition-colors">
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
        <Card className="bg-gray-950 border-green-500/20 hover:border-green-500/30 transition-colors">
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

        {/* Real-time Activity Feed */}
        <ActivityFeed />
      </main>
      <Footer />
    </div>
  );
};

export default AgentDashboard;
