import { useState, useEffect, useMemo } from "react";
import { useMagicAuth } from "@/contexts/MagicAuthContext";
import { db, type ChatAnalytics, type ChatSummary } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Star, 
  ThumbsUp,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  Users,
  Zap,
  Target,
  Activity
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const ChatAnalytics: React.FC = () => {
  const { user, isAuthenticated } = useMagicAuth();
  const [summary, setSummary] = useState<ChatSummary | null>(null);
  const [analytics, setAnalytics] = useState<ChatAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");

  // Load analytics data
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(now.getMonth() - 3);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        const [summaryData, analyticsData] = await Promise.all([
          db.getChatSummary(user.id),
          db.getChatAnalytics(user.id, startDate.toISOString(), now.toISOString())
        ]);

        setSummary(summaryData);
        setAnalytics(analyticsData);
        setError(null);
      } catch (err) {
        setError("Failed to load analytics");
        console.error("Error loading analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [isAuthenticated, user, dateRange]);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    if (!summary) return null;

    const avgMessagesPerDay = summary.active_days > 0 ? summary.total_messages / summary.active_days : 0;
    const responseRate = summary.total_queries > 0 ? (summary.total_responses / summary.total_queries) * 100 : 0;
    const helpfulRate = summary.helpful_messages > 0 ? (summary.helpful_messages / summary.rated_messages) * 100 : 0;

    return {
      avgMessagesPerDay,
      responseRate,
      helpfulRate,
      avgQueriesPerSession: summary.total_sessions > 0 ? summary.total_queries / summary.total_sessions : 0
    };
  }, [summary]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return analytics.map(day => ({
      date: new Date(day.chat_date).toLocaleDateString(),
      messages: day.total_messages,
      queries: day.total_queries,
      responses: day.total_responses,
      avgProcessingTime: day.avg_processing_time_ms || 0,
      rating: day.avg_user_rating || 0
    }));
  }, [analytics]);

  const formatNumber = (num: number | null | undefined, decimals = 1) => {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const formatDuration = (ms: number | null | undefined) => {
    if (!ms) return "0ms";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-400";
    if (rating >= 3.5) return "text-yellow-400";
    if (rating >= 2.5) return "text-orange-400";
    return "text-red-400";
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 1) return null;
    
    return (
      <span className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  const handleExportAnalytics = () => {
    if (!summary || analytics.length === 0) return;

    const exportData = {
      summary,
      analytics,
      derivedMetrics,
      exportedAt: new Date().toISOString(),
      dateRange
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Chat Analytics</h1>
            <p className="text-gray-400">Please sign in to view your chat analytics.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Chat Analytics</h1>
          <p className="text-gray-400">Insights into your conversations with Zigma</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 bg-gray-900 border-gray-700 rounded-lg"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <Button variant="outline" onClick={handleExportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export Analytics
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Activity className="w-8 h-8 animate-spin text-green-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <Badge variant="outline" className="text-xs">Total</Badge>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(summary.total_messages)}</div>
                    <p className="text-sm text-gray-400">Total Messages</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatNumber(summary.total_queries)} queries • {formatNumber(summary.total_responses)} responses
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-green-400" />
                      <Badge variant="outline" className="text-xs">Activity</Badge>
                    </div>
                    <div className="text-2xl font-bold">{summary.active_days}</div>
                    <p className="text-sm text-gray-400">Active Days</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatNumber(derivedMetrics?.avgMessagesPerDay)} msgs/day avg
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <Badge variant="outline" className="text-xs">Quality</Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getRatingColor(summary.avg_user_rating || 0)}`}>
                      {formatNumber(summary.avg_user_rating, 1)}
                    </div>
                    <p className="text-sm text-gray-400">Avg Rating</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatNumber(summary.rated_messages)} rated • {formatNumber(derivedMetrics?.helpfulRate, 0)}% helpful
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      <Badge variant="outline" className="text-xs">Speed</Badge>
                    </div>
                    <div className="text-2xl font-bold">{formatDuration(summary.avg_processing_time_ms)}</div>
                    <p className="text-sm text-gray-400">Avg Response Time</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatNumber(summary.total_sessions)} sessions total
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Query Types Breakdown */}
              {summary && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Query Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Market Analysis</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-800 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(summary.market_analysis_count / summary.total_queries) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono w-12 text-right">
                            {formatNumber((summary.market_analysis_count / summary.total_queries) * 100, 0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">User Profile</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-800 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(summary.user_profile_count / summary.total_queries) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono w-12 text-right">
                            {formatNumber((summary.user_profile_count / summary.total_queries) * 100, 0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Other Queries</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-800 rounded-full h-2">
                            <div 
                              className="bg-gray-500 h-2 rounded-full" 
                              style={{ width: `${((summary.total_queries - summary.market_analysis_count - summary.user_profile_count) / summary.total_queries) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono w-12 text-right">
                            {formatNumber(((summary.total_queries - summary.market_analysis_count - summary.user_profile_count) / summary.total_queries) * 100, 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Metrics */}
              {summary && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Response Rate</span>
                        <span className="text-sm font-mono">
                          {formatNumber(derivedMetrics?.responseRate, 1)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Helpful Rate</span>
                        <span className="text-sm font-mono text-green-400">
                          {formatNumber(derivedMetrics?.helpfulRate, 1)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Avg Queries/Session</span>
                        <span className="text-sm font-mono">
                          {formatNumber(derivedMetrics?.avgQueriesPerSession, 1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Unique Markets</span>
                        <span className="text-sm font-mono">
                          {formatNumber(summary.unique_markets_analyzed)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Daily Activity Chart */}
            {chartData.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chartData.slice(-7).map((day, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-400">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((day.messages / Math.max(...chartData.map(d => d.messages))) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono w-8 text-right">
                            {day.messages}
                          </span>
                        </div>
                        {day.rating > 0 && (
                          <div className={`text-sm font-mono w-12 text-right ${getRatingColor(day.rating)}`}>
                            {formatNumber(day.rating, 1)}★
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ChatAnalytics;
