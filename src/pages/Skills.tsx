import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Lock, Check } from "lucide-react";
import { getSkills, enableSkill, getOrCreateAgent, type Skill } from "@/lib/platformApi";

const Skills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userTier, setUserTier] = useState<'FREE' | 'BASIC' | 'PRO' | 'WHALE'>('FREE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[Skills Page] Fetching skills and agent...');
        const [skillsData, agent] = await Promise.all([
          getSkills(),
          getOrCreateAgent()
        ]);
        
        console.log('[Skills Page] Skills received:', skillsData);
        console.log('[Skills Page] Agent received:', agent);
        
        setSkills(skillsData);
        setUserTier(agent?.tier || 'FREE');
        
        if (skillsData.length === 0) {
          console.warn('[Skills Page] No skills returned from API!');
        }
      } catch (error) {
        console.error('[Skills Page] Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const canUseSkill = (skillTier: string) => {
    const tierOrder = ['FREE', 'BASIC', 'PRO', 'WHALE'];
    return tierOrder.indexOf(userTier) >= tierOrder.indexOf(skillTier);
  };

  const handleEnableSkill = async (skillId: string) => {
    const success = await enableSkill(skillId);
    if (success) {
      alert(`Skill ${skillId} enabled successfully!`);
    } else {
      alert('Failed to enable skill. Please try again.');
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.requiredTier]) {
      acc[skill.requiredTier] = [];
    }
    acc[skill.requiredTier].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/20 via-blue-900/20 to-purple-900/20 border border-green-500/30 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.1),transparent_50%)] pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-green-300 mb-2">ZIGMA SKILLS</p>
              <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">Trading Skills</h1>
              <p className="text-green-300/80 text-lg">Enable AI-powered trading strategies for your agent</p>
            </div>
            <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-xl border border-green-500/30">
              <span className="text-sm text-green-300">Your Tier:</span>
              <Badge className={`${getTierColor(userTier)} text-white text-lg px-4 py-1`}>{userTier}</Badge>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-green-300">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-yellow-400 mb-4">No skills available</p>
            <p className="text-sm text-gray-400">Check browser console for errors</p>
            <p className="text-xs text-gray-500 mt-2">Platform backend: http://localhost:3002</p>
          </div>
        ) : (
          <div className="space-y-8">
            {['FREE', 'BASIC', 'PRO', 'WHALE'].map(tier => {
              const tierSkills = groupedSkills[tier] || [];
              if (tierSkills.length === 0) return null;

              return (
                <div key={tier}>
                  <div className="flex items-center gap-4 mb-6">
                    <Badge className={`${getTierColor(tier)} text-white text-base px-4 py-2 shadow-lg`}>{tier} TIER</Badge>
                    <span className="text-sm text-green-300/80 font-semibold">
                      {tier === 'FREE' ? '🆓 Free Access' : tier === 'BASIC' ? '💎 1,000 $ZIGMA' : tier === 'PRO' ? '⭐ 10,000 $ZIGMA' : '🐋 Whale Tier'}
                    </span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tierSkills.map(skill => {
                      const canUse = canUseSkill(skill.requiredTier);

                      return (
                        <Card key={skill.id} className={`relative overflow-hidden transition-all duration-300 ${
                          canUse 
                            ? 'bg-gradient-to-br from-gray-950 to-gray-900 border-green-500/30 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/20 hover:scale-[1.02]' 
                            : 'bg-gray-950 border-gray-700/20 opacity-60 hover:opacity-70'
                        }`}>
                          {canUse && <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl" />}
                          <CardHeader className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <CardTitle className="text-white text-xl flex items-center gap-2 mb-2">
                                  {canUse ? <Zap className="w-5 h-5 text-green-400 animate-pulse" /> : <Lock className="w-5 h-5 text-gray-500" />}
                                  {skill.name}
                                </CardTitle>
                                <CardDescription className="text-green-300/70 text-sm font-medium">
                                  {skill.category}
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className={`${getDifficultyColor(skill.difficulty)} border-current px-3 py-1 font-semibold`}>
                                {skill.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 relative z-10">
                            <p className="text-sm text-green-300/90 leading-relaxed">{skill.description}</p>
                            
                            {canUse ? (
                              <Button 
                                onClick={() => handleEnableSkill(skill.id)}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-bold py-6 shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
                              >
                                <Check className="w-5 h-5 mr-2" />
                                Enable Skill
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => navigate('/agent')}
                                variant="outline"
                                className="w-full border-green-500/40 text-green-400 hover:bg-green-500/20 hover:border-green-500/60 py-6 font-semibold transition-all duration-300"
                              >
                                <Lock className="w-5 h-5 mr-2" />
                                Upgrade to {skill.requiredTier}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Skills;
