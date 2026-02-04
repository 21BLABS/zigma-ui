import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Lock, Check, Search, TrendingUp, Target, Brain, Sparkles } from "lucide-react";
import { getSkills, enableSkill, getOrCreateAgent, type Skill } from "@/lib/platformApi";

const Skills = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userTier, setUserTier] = useState<'FREE' | 'BASIC' | 'PRO' | 'WHALE'>('FREE');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

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

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))];

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = searchQuery === '' || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.requiredTier]) {
      acc[skill.requiredTier] = [];
    }
    acc[skill.requiredTier].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/50">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Trading Skills
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-6">
            Enable AI-powered strategies for your autonomous agent
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-[#141414] px-5 py-2.5 rounded-xl border border-gray-800">
              <span className="text-sm text-gray-400">Your Tier:</span>
              <Badge className={`${getTierColor(userTier)} text-white px-3 py-1`}>{userTier}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {skills.length} Skills Available
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-10 space-y-5">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 bg-[#141414] border-gray-800 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl transition-all"
            />
          </div>
          
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-[#141414] text-gray-400 hover:bg-[#1a1a1a] hover:text-white border border-gray-800 hover:border-green-500/30'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading skills...</p>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-24 bg-[#141414] rounded-2xl border border-gray-800">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-white text-xl font-semibold mb-2">No skills available</p>
            <p className="text-sm text-gray-400">Check browser console for errors</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-24 bg-[#141414] rounded-2xl border border-gray-800">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white text-xl font-semibold mb-2">No matches found</p>
            <p className="text-sm text-gray-400">Try different search terms</p>
          </div>
        ) : (
          <div className="space-y-16">
            {['FREE', 'BASIC', 'PRO', 'WHALE'].map(tier => {
              const tierSkills = groupedSkills[tier] || [];
              if (tierSkills.length === 0) return null;

              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <Badge className={`${getTierColor(tier)} text-white text-base px-5 py-2 rounded-xl font-bold shadow-lg`}>
                        {tier}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {tier === 'FREE' ? 'Free Access' : tier === 'BASIC' ? '1,000 $ZIGMA' : tier === 'PRO' ? '10,000 $ZIGMA' : 'Whale Tier'}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent ml-6" />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tierSkills.map((skill) => {
                      const canUse = canUseSkill(skill.requiredTier);

                      return (
                        <Card 
                          key={skill.id}
                          className={`group relative overflow-hidden transition-all duration-300 ${
                            canUse 
                              ? 'bg-gradient-to-br from-[#141414] to-[#0a0a0a] border-gray-800 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-1' 
                              : 'bg-[#141414] border-gray-800/50 opacity-70 hover:opacity-85'
                          }`}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start gap-3 mb-3">
                              {canUse ? (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                  <Zap className="w-5 h-5 text-white" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                                  <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-white text-lg mb-2 group-hover:text-green-400 transition-colors">
                                  {skill.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                                    {skill.category}
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(skill.difficulty)} border-current`}>
                                    {skill.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <p className="text-sm text-gray-400 leading-relaxed">{skill.description}</p>
                            
                            {canUse ? (
                              <Button 
                                onClick={() => handleEnableSkill(skill.id)}
                                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 rounded-xl"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Enable
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => navigate('/agent')}
                                variant="outline"
                                className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-green-500/50 hover:text-white py-3 font-semibold transition-all duration-300 rounded-xl"
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Requires {skill.requiredTier}
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
