import { useState, useEffect, useMemo } from "react";
import { useMagicAuth } from "@/contexts/MagicAuthContext";
import { db, ChatSession, UserChatHistory } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  User,
  Filter,
  Trash2,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

interface ChatHistoryProps {
  onSessionSelect?: (sessionId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onSessionSelect }) => {
  const { user, isAuthenticated } = useMagicAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<UserChatHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "market_analysis" | "user_profile" | "general">("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");

  // Load recent sessions
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const recentSessions = await db.getRecentChatSessions(user.id, 20);
        setSessions(recentSessions);
        setError(null);
      } catch (err) {
        setError("Failed to load chat sessions");
        console.error("Error loading sessions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [isAuthenticated, user]);

  // Load session messages when session is selected
  useEffect(() => {
    if (!selectedSession || !isAuthenticated || !user) return;

    const loadSessionMessages = async () => {
      try {
        setIsLoading(true);
        const messages = await db.getChatSession(user.id, selectedSession, 100);
        setSessionMessages(messages);
        setError(null);
      } catch (err) {
        setError("Failed to load session messages");
        console.error("Error loading session messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionMessages();
  }, [selectedSession, isAuthenticated, user]);

  // Filter sessions based on search and filters
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(session =>
        session.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (dateRange === "today") {
      filtered = filtered.filter(session => new Date(session.last_message_at) >= todayStart);
    } else if (dateRange === "week") {
      filtered = filtered.filter(session => new Date(session.last_message_at) >= weekStart);
    } else if (dateRange === "month") {
      filtered = filtered.filter(session => new Date(session.last_message_at) >= monthStart);
    }

    return filtered;
  }, [sessions, searchQuery, dateRange]);

  // Filter messages based on type
  const filteredMessages = useMemo(() => {
    if (filterType === "all") return sessionMessages;
    return sessionMessages.filter(msg => msg.query_type === filterType);
  }, [sessionMessages, filterType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case "user_query": return <User className="w-4 h-4" />;
      case "zigma_response": return <MessageSquare className="w-4 h-4" />;
      case "error_message": return <div className="w-4 h-4 text-red-500">⚠️</div>;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getQueryTypeBadge = (queryType?: string) => {
    if (!queryType) return null;
    
    const variants = {
      market_analysis: { label: "Market", variant: "bg-blue-100 text-blue-800" },
      user_profile: { label: "Profile", variant: "bg-green-100 text-green-800" },
      general_query: { label: "General", variant: "bg-gray-100 text-gray-800" },
      multi_market_comparison: { label: "Compare", variant: "bg-purple-100 text-purple-800" },
      signal_request: { label: "Signal", variant: "bg-orange-100 text-orange-800" }
    };

    const config = variants[queryType as keyof typeof variants] || variants.general_query;
    return (
      <Badge className={`text-xs ${config.variant}`}>
        {config.label}
      </Badge>
    );
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSession(sessionId);
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user || !confirm("Are you sure you want to delete this chat session?")) return;

    try {
      await db.deleteChatSession(user.id, sessionId);
      setSessions(sessions.filter(s => s.session_id !== sessionId));
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setSessionMessages([]);
      }
    } catch (err) {
      setError("Failed to delete session");
      console.error("Error deleting session:", err);
    }
  };

  const handleExportSession = async () => {
    if (!selectedSession || sessionMessages.length === 0) return;

    const exportData = {
      sessionId: selectedSession,
      exportedAt: new Date().toISOString(),
      messages: sessionMessages.map(msg => ({
        type: msg.message_type,
        content: msg.content,
        timestamp: msg.created_at,
        queryType: msg.query_type,
        responseType: msg.response_type
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-session-${selectedSession}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRateMessage = async (messageId: string, rating: number, wasHelpful: boolean) => {
    if (!user) return;

    try {
      await db.updateChatMessageRating(messageId, rating, undefined, wasHelpful);
      setSessionMessages(sessionMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, user_rating: rating, was_helpful: wasHelpful }
          : msg
      ));
    } catch (err) {
      setError("Failed to rate message");
      console.error("Error rating message:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Chat History</h1>
            <p className="text-gray-400">Please sign in to view your chat history.</p>
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
          <h1 className="text-3xl font-bold mb-2">Chat History</h1>
          <p className="text-gray-400">View and manage your conversation history with Zigma</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Recent Sessions
                  </span>
                  <Badge variant="outline">{filteredSessions.length}</Badge>
                </CardTitle>
                
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                    />
                  </div>

                  {/* Date Filter */}
                  <div className="flex gap-2">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as any)}
                      className="flex-1 px-3 py-2 bg-gray-800 border-gray-700 rounded text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-400">
                      <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" />
                      Loading sessions...
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                      No sessions found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredSessions.map((session) => (
                        <div
                          key={session.session_id}
                          className={`p-3 cursor-pointer hover:bg-gray-800 transition-colors border-l-2 ${
                            selectedSession === session.session_id
                              ? 'bg-gray-800 border-green-500'
                              : 'border-transparent'
                          }`}
                          onClick={() => handleSessionClick(session.session_id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {session.last_message_preview}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {formatDate(session.last_message_at)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {session.message_count} msgs
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.session_id);
                              }}
                              className="opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Session Messages
                    </CardTitle>
                    <div className="flex gap-2">
                      {/* Message Type Filter */}
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-3 py-1 bg-gray-800 border-gray-700 rounded text-sm"
                      >
                        <option value="all">All Messages</option>
                        <option value="market_analysis">Market Analysis</option>
                        <option value="user_profile">User Profile</option>
                        <option value="general">General</option>
                      </select>
                      
                      <Button variant="outline" size="sm" onClick={handleExportSession}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg ${
                          message.message_type === 'user_query'
                            ? 'bg-blue-900/20 border-blue-500/30'
                            : message.message_type === 'zigma_response'
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-red-900/20 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMessageIcon(message.message_type)}
                            <span className="font-medium capitalize">
                              {message.message_type.replace('_', ' ')}
                            </span>
                            {getQueryTypeBadge(message.query_type)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {formatDate(message.created_at)}
                            </span>
                            {message.processing_time_ms && (
                              <Badge variant="outline" className="text-xs">
                                {message.processing_time_ms}ms
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm mb-3 whitespace-pre-wrap">
                          {message.content}
                        </div>

                        {/* Rating buttons for Zigma responses */}
                        {message.message_type === 'zigma_response' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                            <span className="text-xs text-gray-400">Was this helpful?</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRateMessage(message.id, 5, true)}
                              className={`p-1 ${message.was_helpful === true ? 'text-green-400' : 'text-gray-400'}`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRateMessage(message.id, 1, false)}
                              className={`p-1 ${message.was_helpful === false ? 'text-red-400' : 'text-gray-400'}`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                            {message.user_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-yellow-400">
                                  {message.user_rating}/5
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-semibold mb-2">Select a Session</h3>
                  <p className="text-gray-400">
                    Choose a session from the left to view your conversation history.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatHistory;
