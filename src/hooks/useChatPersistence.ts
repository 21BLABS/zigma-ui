import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, UserChatHistory } from '@/lib/supabase';

interface UseChatPersistenceOptions {
  autoSave?: boolean;
  enableAnalytics?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendation?: any;
  userProfile?: any;
  matchedMarket?: any;
  analysis?: any;
}

interface ChatPersistenceState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveCount: number;
}

export const useChatPersistence = (options: UseChatPersistenceOptions = {}) => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<ChatPersistenceState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    saveCount: 0
  });

  const {
    autoSave = true,
    enableAnalytics = true
  } = options;

  // Generate or get session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('zigma_chat_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('zigma_chat_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Get client info for analytics
  const getClientInfo = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Determine query type from content
  const getQueryType = useCallback((content: string, marketId?: string, polymarketUser?: string) => {
    if (polymarketUser) return 'user_profile';
    if (marketId) return 'market_analysis';
    if (content.toLowerCase().includes('compare') && content.toLowerCase().includes('market')) return 'multi_market_comparison';
    if (content.toLowerCase().includes('signal') || content.toLowerCase().includes('recommendation')) return 'signal_request';
    return 'general_query';
  }, []);

  // Determine response type
  const getResponseType = useCallback((message: ChatMessage) => {
    if (message.recommendation) return 'recommendation';
    if (message.userProfile) return 'user_profile_data';
    if (message.analysis) return 'analysis';
    return 'analysis';
  }, []);

  // Save user query to database
  const saveUserQuery = useCallback(async (
    content: string,
    metadata: {
      marketId?: string;
      marketQuestion?: string;
      polymarketUser?: string;
      contextId?: string;
      processingTime?: number;
    } = {}
  ) => {
    if (!isAuthenticated || !user || !autoSave) return null;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const sessionId = getSessionId();
      const queryType = getQueryType(content, metadata.marketId, metadata.polymarketUser);

      const chatMessage: Partial<UserChatHistory> = {
        user_id: user.id,
        session_id: sessionId,
        message_type: 'user_query',
        content,
        query_type: queryType as any,
        market_id: metadata.marketId,
        market_question: metadata.marketQuestion,
        polymarket_user: metadata.polymarketUser,
        context_id: metadata.contextId,
        processing_time_ms: metadata.processingTime,
        metadata: enableAnalytics ? getClientInfo() : undefined,
        api_version: 'v1'
      };

      const saved = await db.saveChatMessage(chatMessage);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        saveCount: prev.saveCount + 1
      }));

      return saved;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save query';
      setState(prev => ({ ...prev, isSaving: false, error: errorMessage }));
      console.error('Failed to save user query:', error);
      return null;
    }
  }, [isAuthenticated, user, autoSave, getSessionId, getQueryType, enableAnalytics, getClientInfo]);

  // Save Zigma response to database
  const saveZigmaResponse = useCallback(async (
    message: ChatMessage,
    metadata: {
      contextId?: string;
      processingTime?: number;
      matchedMarket?: any;
      userQuery?: string;
    } = {}
  ) => {
    if (!isAuthenticated || !user || !autoSave) return null;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const sessionId = getSessionId();
      const responseType = getResponseType(message);

      const chatMessage: Partial<UserChatHistory> = {
        user_id: user.id,
        session_id: sessionId,
        message_type: 'zigma_response',
        content: message.content,
        response_type: responseType as any,
        recommendation_data: message.recommendation || undefined,
        analysis_data: message.analysis || undefined,
        user_profile_data: message.userProfile || undefined,
        comparison_data: (message as any).comparisonData || undefined,
        market_id: metadata.matchedMarket?.id,
        market_question: metadata.matchedMarket?.question,
        context_id: metadata.contextId,
        context_used: !!metadata.contextId,
        processing_time_ms: metadata.processingTime,
        metadata: enableAnalytics ? {
          ...getClientInfo(),
          userQuery: metadata.userQuery,
          matchedMarketId: metadata.matchedMarket?.id,
          responseLength: message.content.length
        } : undefined,
        api_version: 'v1'
      };

      const saved = await db.saveChatMessage(chatMessage);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        saveCount: prev.saveCount + 1
      }));

      return saved;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save response';
      setState(prev => ({ ...prev, isSaving: false, error: errorMessage }));
      console.error('Failed to save Zigma response:', error);
      return null;
    }
  }, [isAuthenticated, user, autoSave, getSessionId, getResponseType, enableAnalytics, getClientInfo]);

  // Save error message
  const saveErrorMessage = useCallback(async (
    error: string,
    metadata: {
      contextId?: string;
      userQuery?: string;
      processingTime?: number;
    } = {}
  ) => {
    if (!isAuthenticated || !user || !autoSave) return null;

    try {
      const sessionId = getSessionId();

      const chatMessage: Partial<UserChatHistory> = {
        user_id: user.id,
        session_id: sessionId,
        message_type: 'error_message',
        content: error,
        response_type: 'error',
        context_id: metadata.contextId,
        processing_time_ms: metadata.processingTime,
        metadata: enableAnalytics ? {
          ...getClientInfo(),
          userQuery: metadata.userQuery,
          errorType: 'api_error'
        } : undefined,
        api_version: 'v1'
      };

      return await db.saveChatMessage(chatMessage);
    } catch (saveError) {
      console.error('Failed to save error message:', saveError);
      return null;
    }
  }, [isAuthenticated, user, autoSave, getSessionId, enableAnalytics, getClientInfo]);

  // Save complete chat exchange (user query + response)
  const saveChatExchange = useCallback(async (
    userQuery: string,
    response: ChatMessage,
    metadata: {
      marketId?: string;
      marketQuestion?: string;
      polymarketUser?: string;
      contextId?: string;
      processingTime?: number;
      matchedMarket?: any;
    } = {}
  ) => {
    if (!isAuthenticated || !user) return { userMessage: null, responseMessage: null };

    try {
      const startTime = Date.now();

      // Save user query
      const userMessage = await saveUserQuery(userQuery, {
        marketId: metadata.marketId,
        marketQuestion: metadata.marketQuestion,
        polymarketUser: metadata.polymarketUser,
        contextId: metadata.contextId,
        processingTime: metadata.processingTime
      });

      // Save response
      const responseMessage = await saveZigmaResponse(response, {
        contextId: metadata.contextId,
        processingTime: metadata.processingTime,
        matchedMarket: metadata.matchedMarket,
        userQuery
      });

      return { userMessage, responseMessage };
    } catch (error) {
      console.error('Failed to save chat exchange:', error);
      return { userMessage: null, responseMessage: null };
    }
  }, [isAuthenticated, user, saveUserQuery, saveZigmaResponse]);

  // Rate a chat message
  const rateMessage = useCallback(async (
    messageId: string,
    rating: number,
    feedback?: string,
    wasHelpful?: boolean
  ) => {
    if (!isAuthenticated || !user) return null;

    try {
      return await db.updateChatMessageRating(messageId, rating, feedback, wasHelpful);
    } catch (error) {
      console.error('Failed to rate message:', error);
      return null;
    }
  }, [isAuthenticated, user]);

  // Get chat history for current session
  const getCurrentSessionHistory = useCallback(async () => {
    if (!isAuthenticated || !user) return [];

    try {
      const sessionId = getSessionId();
      return await db.getChatSession(user.id, sessionId);
    } catch (error) {
      console.error('Failed to get session history:', error);
      return [];
    }
  }, [isAuthenticated, user, getSessionId]);

  // Get recent chat sessions
  const getRecentSessions = useCallback(async (limit = 10) => {
    if (!isAuthenticated || !user) return [];

    try {
      return await db.getRecentChatSessions(user.id, limit);
    } catch (error) {
      console.error('Failed to get recent sessions:', error);
      return [];
    }
  }, [isAuthenticated, user]);

  // Search chat history
  const searchHistory = useCallback(async (query: string, limit = 50) => {
    if (!isAuthenticated || !user) return [];

    try {
      return await db.searchChatHistory(user.id, query, limit);
    } catch (error) {
      console.error('Failed to search history:', error);
      return [];
    }
  }, [isAuthenticated, user]);

  // Get chat analytics
  const getAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    if (!isAuthenticated || !user) return null;

    try {
      return await db.getChatAnalytics(user.id, startDate, endDate);
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }, [isAuthenticated, user]);

  // Get chat summary
  const getSummary = useCallback(async () => {
    if (!isAuthenticated || !user) return null;

    try {
      return await db.getChatSummary(user.id);
    } catch (error) {
      console.error('Failed to get summary:', error);
      return null;
    }
  }, [isAuthenticated, user]);

  // Clear current session
  const clearCurrentSession = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const sessionId = getSessionId();
      await db.deleteChatSession(user.id, sessionId);
      sessionStorage.removeItem('zigma_chat_session_id');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, [isAuthenticated, user, getSessionId]);

  return {
    // State
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
    error: state.error,
    saveCount: state.saveCount,

    // Actions
    saveUserQuery,
    saveZigmaResponse,
    saveErrorMessage,
    saveChatExchange,
    rateMessage,

    // Retrieval
    getCurrentSessionHistory,
    getRecentSessions,
    searchHistory,
    getAnalytics,
    getSummary,

    // Utilities
    clearCurrentSession,
    getSessionId
  };
};
