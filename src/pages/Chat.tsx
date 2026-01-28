import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { PaymentModal } from '@/components/PaymentModal';
import { useMagicAuth } from '@/contexts/MagicAuthContext';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { db } from '@/lib/supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendation?: any;
}

interface ChatResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  recommendation?: any;
  userProfile?: any;
}

const SUGGESTED_QUERIES = [
  { label: "What are the top trending markets today?", query: "What are the top trending markets today?" },
  { label: "Analyze Trump's 2024 election chances", query: "What are Trump's chances of winning the 2024 election?" },
  { label: "Best crypto prediction markets", query: "Which cryptocurrency markets have the best opportunities?" },
  { label: "Economic indicators to watch", query: "What economic indicators should I watch for prediction markets?" }
];

const Chat = () => {
  // State
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [queryHistory, setQueryHistory] = useState<{ query: string; timestamp: string }[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [marketId, setMarketId] = useState("");
  const [polymarketUser, setPolymarketUser] = useState("");
  const [chatUsage, setChatUsage] = useState<{ canUse: boolean; remainingUses: number; resetAt: string | null }>({ canUse: true, remainingUses: 15, resetAt: null });
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hooks
  const { user, isAuthenticated, chatStatus } = useMagicAuth();
  const chatPersistence = useChatPersistence({
    autoSave: true,
    enableAnalytics: true
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("zigma-chat-history");
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse chat history:", error);
      }
    }
  }, []);

  // Fetch payment configuration
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const response = await fetch('/api/payments/config');
        const data = await response.json();
        setPaymentConfig(data);
      } catch (error) {
        console.error('Failed to fetch payment config:', error);
        // Set default config if API fails
        setPaymentConfig({
          paymentWalletAddress: 'A6qvQHnQimYWfSy3nyUtQy1euPwVamNHauuvFuATpvmQ',
          requiredAmount: 25,
          creditsPerPayment: 25,
          pricePerCredit: 1
        });
      }
    };

    fetchPaymentConfig();
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem("zigma-chat-history", JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  // Check chat usage (now uses credit balance)
  useEffect(() => {
    const checkUsage = async () => {
      if (!isAuthenticated || !user) return;
      
      setIsLoadingUsage(true);
      try {
        // Use email as fallback for wallet_address if it's null (for email users)
        const userIdentifier = user.wallet_address || user.email;
        const usage = await db.getCreditBalance(user.id);
        setChatUsage(usage);
      } catch (error) {
        console.error('Failed to check credit balance:', error);
        // Default to allowing usage if check fails
        setChatUsage({ canUse: true, remainingUses: 0, resetAt: null });
      } finally {
        setIsLoadingUsage(false);
      }
    };

    checkUsage();
  }, [isAuthenticated, user]);

  // Computed values
  const filteredHistory = queryHistory.filter(entry =>
    entry.query.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  const canSubmit = input.trim().length > 0 && !isLoading;

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Add to query history
    const newHistoryEntry = {
      query: input.trim(),
      timestamp: new Date().toISOString()
    };
    setQueryHistory(prev => [newHistoryEntry, ...prev.slice(0, 49)]); // Keep last 50

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim(),
          userId: user?.id,
          walletAddress: user?.wallet_address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
        recommendation: data.recommendation
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to persistence
      if (chatPersistence.saveUserQuery) {
        await chatPersistence.saveUserQuery(input.trim(), {
          contextId: `chat_${Date.now()}`
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to get response. Please try again.');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleLoadFromHistory = (entry: { query: string; timestamp: string }) => {
    setInput(entry.query);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setError(null);
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const handleEditMessage = (index: number) => {
    setEditingMessageIndex(index);
    setEditingContent(messages[index].content);
  };

  const handleSaveEdit = () => {
    if (editingMessageIndex !== null) {
      setMessages(prev => prev.map((msg, idx) => 
        idx === editingMessageIndex ? { ...msg, content: editingContent } : msg
      ));
      setEditingMessageIndex(null);
      setEditingContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageIndex(null);
    setEditingContent("");
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePaymentSuccess = () => {
    // Refresh chat status after successful payment
    // chatStatus will auto-refresh when wallet balance changes
  };

  // Render helpers
  const renderRecommendation = (recommendation: any) => {
    if (!recommendation) return null;
    
    return (
      <Card className="mt-3 bg-blue-900/20 border-blue-500/30">
        <CardContent className="p-3">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Recommendation</h4>
          <p className="text-xs text-blue-200">{recommendation.summary || "Analysis complete"}</p>
        </CardContent>
      </Card>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-black text-green-100">
      <SiteHeader />
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <header className="space-y-4 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-green-500">ZIGMA TERMINAL / LIVE INTERROGATION</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-white">Ask Zigma about any Polymarket bet</h1>
          <p className="text-base text-muted-foreground max-w-3xl">
            Paste a market link, user wallet, or natural-language question. Press ⌘K to focus input.
          </p>
        </header>

        {/* Credit Access Restriction */}
        {isAuthenticated && chatStatus && !chatStatus.canChat && (
          <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-300 mb-2">Credits Required</h3>
                <p className="text-red-200 mb-4">
                  You need chat credits to access the AI predictions. Purchase credits to continue.
                </p>
                <div className="space-y-3">
                  <div className="bg-black/40 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">Credit Information</h4>
                    <ul className="text-sm text-red-300 space-y-1">
                      <li>✓ 1 credit per chat message</li>
                      <li>✓ Credits persist until used</li>
                      <li>✓ No daily limit</li>
                      <li>✓ Full access to AI predictions</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Purchase Credits
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mb-8 bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">Authentication Required</h3>
                <p className="text-yellow-200 mb-4">
                  Please sign in or connect your wallet to access ZIGMA AI. You'll also need a subscription for full access.
                </p>
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="bg-yellow-600 hover:bg-yellow-700 text-black"
                >
                  Sign In / Connect Wallet
                </Button>
              </div>
            </div>
          </div>
        )}

        <section className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-8">
          {/* Left Panel - Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-950/80 border border-green-500/20 p-6 rounded-xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Ask Zigma</label>
                {isAuthenticated && user && user.auth_provider === 'wallet' && (
                  <div className="flex items-center gap-2">
                    {isLoadingUsage ? (
                      <div className="text-xs text-gray-400">Loading credits...</div>
                    ) : (
                      <div className={`text-xs px-2 py-1 rounded ${
                        chatUsage.canUse 
                          ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
                          : 'bg-red-900/30 text-red-300 border border-red-500/30'
                      }`}>
                        {chatUsage.remainingUses} credits
                        {!chatUsage.canUse && (
                          <span className="block text-[10px] mt-1">
                            Purchase credits to continue
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (canSubmit) handleSubmit(e);
                  }
                }}
                placeholder="Paste a Polymarket URL or ask a question..."
                className="mt-2 h-24 bg-black/60 border-green-500/30 text-green-100 placeholder:text-green-200/40"
              />
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-green-400/80 hover:text-green-400 flex items-center gap-1">
              <svg className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-90")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="grid gap-4 pt-2 border-t border-green-500/20">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Market ID</label>
                  <Input value={marketId} onChange={(e) => setMarketId(e.target.value)} placeholder="Polymarket UUID" className="mt-2 bg-black/60 border-green-500/30" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">User Wallet</label>
                  <Input value={polymarketUser} onChange={(e) => setPolymarketUser(e.target.value)} placeholder="0x..." className="mt-2 bg-black/60 border-green-500/30" />
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/40 rounded-md p-3">
                {error}
                <button type="button" onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button type="button" variant="outline" onClick={() => setShowSuggestions(!showSuggestions)} className="border-gray-700 text-gray-200 hover:bg-gray-900" disabled={chatStatus && !chatStatus.canChat}>
                💡 Samples
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowHistory(!showHistory)} className="border-gray-700 text-gray-200 hover:bg-gray-900 relative" disabled={chatStatus && !chatStatus.canChat}>
                📜 History
                {queryHistory.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-black text-[10px] rounded-full flex items-center justify-center">{queryHistory.length}</span>}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="border-gray-700 text-gray-200 hover:bg-gray-900" disabled={chatStatus && !chatStatus.canChat}>🗑️ Clear</Button>
              <Button type="submit" disabled={!canSubmit || (chatStatus && !chatStatus.canChat)} className="bg-green-600 hover:bg-green-500 text-black font-semibold col-span-2 md:col-span-3">
                {isLoading ? "Analyzing…" : (chatStatus && chatStatus.canChat) ? "Ask Zigma" : "ZIGMA Tokens Required"}
              </Button>
            </div>

            {showSuggestions && (
              <div className="border border-green-500/20 rounded-lg bg-black/40 p-3">
                <p className="text-xs text-muted-foreground mb-2">Suggested Queries</p>
                {SUGGESTED_QUERIES.map((item, idx) => (
                  <button key={idx} type="button" onClick={() => handleSuggestedQuery(item.query)} className="w-full text-left text-xs text-green-200 hover:bg-green-900/20 px-3 py-2 rounded">
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {showHistory && queryHistory.length > 0 && (
              <div className="border border-green-500/20 rounded-lg bg-black/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Recent Queries</p>
                  <input type="text" placeholder="Search..." value={historySearchQuery} onChange={(e) => setHistorySearchQuery(e.target.value)} className="text-xs bg-black/60 border border-gray-700 text-gray-200 px-2 py-1 rounded w-24" />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredHistory.slice(0, 10).map((entry, idx) => (
                    <button key={idx} type="button" onClick={() => handleLoadFromHistory(entry)} className="w-full text-left text-sm text-green-300 hover:bg-green-500/10 p-2 rounded">
                      <div className="truncate">{entry.query}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(entry.timestamp).toLocaleString("en-US")}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Right Panel - Feed */}
          <div className="bg-gray-950/80 border border-green-500/20 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-green-500/10 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-green-400/80">Conversation Feed</p>
              <p className="text-sm text-muted-foreground">Ask a question to start.</p>
            </div>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-6">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground text-sm py-12">
                  <p className="text-4xl mb-4">🤖</p>
                  <p>Awaiting your first question.</p>
                </div>
              )}

              {[...messages].reverse().map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div key={`${message.role}-${index}`} className={cn("rounded-lg p-4 border space-y-2", isUser ? "bg-green-600/10 border-green-500/20 ml-auto max-w-xl" : "bg-black/40 border-green-500/10 mr-auto max-w-2xl")}>
                    <div className="text-xs uppercase tracking-[0.2em] text-green-400/80">{isUser ? "You" : "Agent Zigma"}</div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {editingMessageIndex === index ? (
                        <div className="space-y-2">
                          <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="bg-black/60 border-green-500/30 text-green-100" rows={4} />
                          <div className="flex gap-2">
                            <button type="button" onClick={handleSaveEdit} className="text-xs bg-green-600 text-black px-3 py-1 rounded">Save</button>
                            <button type="button" onClick={handleCancelEdit} className="text-xs bg-gray-700 text-white px-3 py-1 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : message.content}
                    </div>
                    {!isUser && renderRecommendation(message.recommendation)}
                    {!isUser && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-green-500/10">
                        <button type="button" onClick={() => handleCopyToClipboard(message.content)} className="text-xs text-green-400/80 hover:text-green-400">📋 Copy</button>
                        <button type="button" onClick={() => handleEditMessage(index)} className="text-xs text-green-400/80 hover:text-green-400">✏️ Edit</button>
                        <button type="button" onClick={() => handleDeleteMessage(index)} className="text-xs text-red-400/80 hover:text-red-400">🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                  <span>Zigma is analyzing...</span>
                </div>
              )}
            </div>

            <Separator className="bg-green-500/10" />
          </div>
        </section>
      </main>

      <Footer />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        walletAddress={user?.publicAddress || ''}
        requiredAmount={1.41}
        creditsPerPayment={3}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Chat;
