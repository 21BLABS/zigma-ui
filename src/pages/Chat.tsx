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
import { magic } from '../lib/magic';
import { SmartAnalysisCard } from '@/components/SmartAnalysisCard';
import { UserProfileCard } from '@/components/UserProfileCard';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { ShareableAnalysisCard } from '@/components/ShareableAnalysisCard';
import html2canvas from 'html2canvas';

interface Recommendation {
  action?: string;
  confidence?: number;
  probability?: number;
  marketOdds?: number;
  effectiveEdge?: number;
  summary?: string;
}

interface Market {
  id?: string;
  question?: string;
  url?: string;
  yesPrice?: number;
  noPrice?: number;
  liquidity?: number;
  volume24hr?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendation?: Recommendation;
  market?: Market;
  analysis?: any;
  userProfile?: any;
  allMarkets?: Market[];
  isMultiOutcome?: boolean;
}

interface ChatResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  recommendation?: Recommendation;
  userProfile?: any;
  market?: Market;
  analysis?: any;
  allMarkets?: Market[];
  isMultiOutcome?: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [marketId, setMarketId] = useState("");
  const [polymarketUser, setPolymarketUser] = useState("");
  const [chatUsage, setChatUsage] = useState<{ canUse: boolean; remainingUses: number; resetAt: string | null; freeChatsRemaining?: number }>({ canUse: true, remainingUses: 15, resetAt: null });
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [trackedMarkets, setTrackedMarkets] = useState<string[]>([]);
  const [isAnalyzingMultiOutcome, setIsAnalyzingMultiOutcome] = useState(false);
  const [isAnalyzingUser, setIsAnalyzingUser] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hooks
  const { user, isAuthenticated, chatStatus, refreshChatStatus } = useMagicAuth();
  const chatPersistence = useChatPersistence({
    autoSave: false, // Disabled due to Magic DID format incompatibility with UUID
    enableAnalytics: false
  });

  // Debug logging for chat status
  useEffect(() => {
    console.log('💬 Chat Status:', chatStatus);
    console.log('👤 User:', user);
    console.log('🔐 Is Authenticated:', isAuthenticated);
  }, [chatStatus, user, isAuthenticated]);

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
        // Use wallet_address if available, otherwise fall back to user.id
        const userIdentifier = user.wallet_address || user.id;
        const usage = await db.getCreditBalance(userIdentifier);
        setChatUsage(usage);
      } catch (error) {
        console.error('Failed to check credit balance:', error);
        // Default to allowing usage if check fails
        setChatUsage({ canUse: true, remainingUses: 0, resetAt: null, freeChatsRemaining: 0 });
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

  // Allow submission if either main input OR advanced options are filled
  const canSubmit = (input.trim().length > 0 || polymarketUser.trim().length > 0 || marketId.trim().length > 0) && !isLoading;
  
  // Debug logging for button state
  useEffect(() => {
    console.log('🔍 [BUTTON STATE]', {
      canSubmit,
      inputLength: input.trim().length,
      isLoading,
      chatStatus,
      buttonDisabled: !canSubmit || (chatStatus && !chatStatus.canChat)
    });
  }, [canSubmit, input, isLoading, chatStatus]);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Use polymarketUser as message if main input is empty (for user analysis)
    const messageContent = input.trim() || (polymarketUser.trim() ? `Analyze user: ${polymarketUser.trim()}` : `Analyze market: ${marketId.trim()}`);
    const isUserQuery = messageContent.toLowerCase().includes('analyze user') || polymarketUser.trim().length > 0;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsAnalyzingMultiOutcome(false);
    setIsAnalyzingUser(isUserQuery);
    setError(null);

    // Add to query history
    const newHistoryEntry = {
      query: messageContent,
      timestamp: new Date().toISOString()
    };
    setQueryHistory(prev => [newHistoryEntry, ...prev.slice(0, 49)]); // Keep last 50

    try {
      // Get Magic DID token for authentication
      console.log('🔐 Getting Magic DID token...');
      console.log('Magic instance available:', !!magic);
      
      const didToken = await magic.user.getIdToken();
      console.log('🎫 DID Token retrieved:', didToken ? 'YES (length: ' + didToken.length + ')' : 'NO - Token is null/undefined');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      if (didToken) {
        headers['Authorization'] = `Bearer ${didToken}`;
        console.log('✅ Authorization header added');
      } else {
        console.warn('⚠️ No DID token - request will fail with 401');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.zigma.pro'}/api/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: messageContent,
          userId: user?.id,
          walletAddress: user?.wallet_address,
          // Include advanced options for user analysis and market lookup
          polymarketUser: polymarketUser.trim() || undefined,
          marketId: marketId.trim() || undefined
        })
      });

      console.log('📡 Chat API Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Chat API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data: ChatResponse = await response.json();
      console.log('✅ Chat API Success:', data);
      console.log('🔍 Multi-outcome check:', {
        isMultiOutcome: data.isMultiOutcome,
        allMarketsCount: data.allMarkets?.length || 0,
        allMarketsPreview: data.allMarkets?.slice(0, 3).map(m => m.question)
      });
      
      // Set multi-outcome flag for loader
      if (data.isMultiOutcome) {
        setIsAnalyzingMultiOutcome(true);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
        recommendation: data.recommendation,
        market: data.market,
        analysis: data.analysis,
        userProfile: data.userProfile,
        allMarkets: data.allMarkets,
        isMultiOutcome: data.isMultiOutcome
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

  const handleExportConversation = () => {
    const conversationText = messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      const role = msg.role === 'user' ? 'You' : 'Agent Zigma';
      return `[${time}] ${role}:\n${msg.content}\n`;
    }).join('\n---\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zigma-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show brief success toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = '✓ Copied to clipboard';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh chat status after successful payment
    // chatStatus will auto-refresh when wallet balance changes
  };

  // Save analysis to localStorage
  const handleSaveAnalysis = (message: ChatMessage) => {
    const savedData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      question: message.content,
      recommendation: message.recommendation,
      market: message.market,
      analysis: message.analysis,
    };
    
    const existing = JSON.parse(localStorage.getItem('zigma_saved_analyses') || '[]');
    existing.push(savedData);
    localStorage.setItem('zigma_saved_analyses', JSON.stringify(existing));
    setSavedAnalyses(existing);
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-black px-6 py-3 rounded-lg shadow-lg z-50 font-semibold';
    toast.textContent = '✓ Analysis saved successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Track market (add to watchlist)
  const handleTrackMarket = (market: any) => {
    const marketId = market?.id || market?.question;
    if (!marketId) return;
    
    const existing = JSON.parse(localStorage.getItem('zigma_tracked_markets') || '[]');
    if (!existing.includes(marketId)) {
      existing.push(marketId);
      localStorage.setItem('zigma_tracked_markets', JSON.stringify(existing));
      setTrackedMarkets(existing);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold';
      toast.textContent = '📊 Market added to watchlist!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  // Set alert
  const handleSetAlert = (market: any) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg z-50 font-semibold';
    toast.textContent = '🔔 Alert feature coming soon!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Share analysis - generate and download branded card
  const handleShareAnalysis = async (message: ChatMessage) => {
    try {
      // Create temporary container for shareable card
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Render ShareableAnalysisCard
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(container);
      
      await new Promise<void>((resolve) => {
        root.render(
          <ShareableAnalysisCard
            marketQuestion={message.market?.question || 'Market Analysis'}
            recommendation={message.recommendation?.summary || message.content.substring(0, 100)}
            confidence={message.recommendation?.confidence || 0}
            edge={message.recommendation?.effectiveEdge || 0}
            yesPrice={message.market?.yesPrice || 0.5}
            noPrice={message.market?.noPrice || 0.5}
            liquidity={message.market?.liquidity || 0}
            timestamp={message.timestamp}
          />
        );
        setTimeout(resolve, 500); // Wait for render
      });

      // Capture as image
      const card = container.querySelector('#shareable-analysis-card') as HTMLElement;
      if (card) {
        const canvas = await html2canvas(card, {
          backgroundColor: '#000000',
          scale: 2,
        });
        
        // Download image
        const link = document.createElement('a');
        link.download = `zigma-analysis-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-black px-6 py-3 rounded-lg shadow-lg z-50 font-semibold';
        toast.textContent = '📸 Analysis card downloaded!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    } catch (error) {
      console.error('Failed to generate shareable card:', error);
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold';
      toast.textContent = '❌ Failed to generate card';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  // Render helpers
  const renderRecommendation = (recommendation: any) => {
    if (!recommendation) return null;
    return (
      <Card className="mb-6 border-green-500/30 bg-gradient-to-br from-gray-950 to-gray-900 shadow-xl">
        <CardContent>
          <p className="text-xs text-green-200">{recommendation.summary || "Analysis complete"}</p>
        </CardContent>
      </Card>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <div className="container mx-auto px-6 sm:px-8 py-8 max-w-7xl">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/20 via-blue-900/20 to-purple-900/20 border border-green-500/30 p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.1),transparent_50%)] pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.4em] text-green-300 mb-2">ZIGMA CHAT</p>
            <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">Live Interrogation</h1>
            <p className="text-green-300/80 text-lg">Ask Zigma anything about prediction markets</p>
          </div>
        </div>

        {/* Credit Access Restriction */}
        {isAuthenticated && chatStatus && !chatStatus.canChat && !chatStatus.usingFreeTrial && (
          <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-300 mb-2">
                  {chatStatus.freeChatsRemaining === 0 ? 'Free Trial Complete' : 'ZIGMA Tokens Required'}
                </h3>
                <p className="text-red-200 mb-4">
                  {chatStatus.freeChatsRemaining === 0 
                    ? "Your free trial is over. You need ZIGMA tokens to continue chatting."
                    : `You need 10,000 ZIGMA tokens in your wallet to access chat. Current balance: ${chatStatus.balance.toLocaleString()} ZIGMA`
                  }
                </p>
                <div className="space-y-3">
                  <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">📥 How to Add ZIGMA:</h4>
                    <ol className="text-sm text-yellow-200 space-y-1 list-decimal list-inside">
                      <li>Click your profile icon (top right) and copy your Solana wallet address</li>
                      <li>Buy ZIGMA on Phantom or Jupiter</li>
                      <li>Send 10,000 ZIGMA to your wallet address</li>
                      <li>Click "Refresh Balance" below</li>
                    </ol>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button 
                    onClick={() => refreshChatStatus()}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    🔄 Refresh Balance
                  </button>
                  <a
                    href="https://phantom.com/tokens/solana/xT4tzTkuyXyDqCWeZyahrhnknPd8KBuuNjPngvqcyai?referralId=gkr7v4xfqno"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Buy ZIGMA on Phantom
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Required */}
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

        <section className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-6">
          {/* Left Panel - Form */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-gray-950/60 border border-green-500/20 p-6 rounded-xl backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-[0.2em] text-green-400/80 font-semibold">Your Question</label>
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
                onChange={(e) => {
                  console.log('📝 [INPUT CHANGE]', { value: e.target.value, length: e.target.value.length });
                  setInput(e.target.value);
                }}
                onPaste={(e) => {
                  console.log('📋 [PASTE EVENT]', { clipboardData: e.clipboardData.getData('text') });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (canSubmit) handleSubmit(e);
                  }
                }}
                placeholder="Paste a Polymarket URL or ask a question..."
                className="mt-2 h-28 bg-black/80 border-green-500/30 text-white placeholder:text-gray-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
              />
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-gray-400 hover:text-green-400 flex items-center gap-2 transition-colors">
              <svg className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-90")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="grid gap-4 pt-2 border-t border-green-500/20">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Market ID</label>
                  <Input value={marketId} onChange={(e) => setMarketId(e.target.value)} placeholder="Polymarket UUID" className="mt-2 bg-black/60 border border-gray-700 text-gray-200 px-2 py-1 rounded" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">User Wallet</label>
                  <Input value={polymarketUser} onChange={(e) => setPolymarketUser(e.target.value)} placeholder="0x..." className="mt-2 bg-black/60 border border-gray-700 text-gray-200 px-2 py-1 rounded" />
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/40 rounded-md p-3">
                {error}
                <button type="button" onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => setShowSuggestions(!showSuggestions)} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-green-500/40 transition-all text-xs" disabled={chatStatus && !chatStatus.canChat} aria-label="Show suggested queries">
                💡 Examples
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-red-500/40 transition-all text-xs" disabled={chatStatus && !chatStatus.canChat} aria-label="Clear conversation">🗑️ Clear</Button>
              <Button type="submit" disabled={!canSubmit || (chatStatus && !chatStatus.canChat)} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-bold shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105" aria-label="Submit query to Zigma">
                {isLoading ? "Analyzing…" : (chatStatus && chatStatus.canChat) ? "Ask Zigma" : "ZIGMA Tokens Required"}
              </Button>
            </div>

            {showSuggestions && (
              <div className="border border-green-500/20 rounded-lg bg-black/40 p-3">
                <p className="text-xs text-muted-foreground mb-2">Suggested Queries</p>
                <div className="space-y-2">
                  {SUGGESTED_QUERIES.map((item, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuery(item.query)}
                      className="w-full text-left justify-start h-auto py-3 px-4 border-green-500/40 hover:bg-green-500/20 hover:border-green-500/60 transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
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
          <div className="bg-gray-950/60 border border-green-500/20 rounded-xl overflow-hidden flex flex-col backdrop-blur-sm">
            <div className="p-5 border-b border-green-500/10 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-green-400/80 font-semibold">Conversation</p>
              <p className="text-xs text-gray-500">Real-time market analysis</p>
            </div>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-6" role="log" aria-live="polite" aria-label="Chat conversation">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-16 space-y-6">
                  <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                    <p className="text-3xl animate-pulse">🤖</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-white">Ready to analyze</p>
                    <p className="text-sm text-gray-500">Paste a market link or ask a question to begin</p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div key={`${message.role}-${index}`} className={cn(isUser ? "ml-auto max-w-xl" : "mr-auto max-w-full")}>
                    {isUser ? (
                      <div className="rounded-xl p-4 bg-green-600/10 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-green-400 font-semibold">You</div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-sm text-white">{message.content}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs uppercase tracking-[0.2em] text-green-400/80">Agent Zigma</div>
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] text-green-400/60">
                              {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button
                              onClick={() => handleCopyToClipboard(message.content)}
                              className="text-green-400/60 hover:text-green-400 transition-colors"
                              aria-label="Copy message"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {message.userProfile ? (
                          // Premium User Profile Display
                          <UserProfileCard 
                            userProfile={message.userProfile}
                            content={message.content}
                          />
                        ) : (
                          // Market Analysis Display
                          <SmartAnalysisCard
                            content={message.content}
                            recommendation={message.recommendation}
                            market={message.market}
                            allMarkets={message.allMarkets}
                            isMultiOutcome={message.isMultiOutcome}
                            onSave={() => handleSaveAnalysis(message)}
                            onTrack={() => handleTrackMarket(message.market)}
                            onAlert={() => handleSetAlert(message.market)}
                            onShare={() => handleShareAnalysis(message)}
                            onRefresh={() => {
                              // Re-submit the original query
                              const userMessageIndex = index - 1;
                              if (userMessageIndex >= 0 && messages[userMessageIndex]?.role === 'user') {
                                setInput(messages[userMessageIndex].content);
                              }
                            }}
                            onMarketSelect={async (selectedMarket) => {
                              // Re-analyze the selected multi-outcome market
                              console.log('[CHAT] Re-analyzing selected market:', selectedMarket.question);
                              setInput(selectedMarket.url || selectedMarket.question);
                              // Trigger analysis by submitting the market URL/question
                              handleSubmit(new Event('submit') as any);
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="space-y-4">
                  <AnalysisLoader 
                    isVisible={isLoading} 
                    isMultiOutcome={isAnalyzingMultiOutcome}
                    isUserAnalysis={isAnalyzingUser}
                  />
                </div>
              )}
            </div>

            <Separator className="bg-green-500/10" />
          </div>
        </section>
      </div>

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
