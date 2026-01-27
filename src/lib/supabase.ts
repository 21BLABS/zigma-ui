import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

// Create client with relaxed typing
export const supabase = supabaseInstance || createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
}) as any;

if (!supabaseInstance) {
  supabaseInstance = supabase;
}

// Database types
export interface ChatUsage {
  id: string;
  user_id: string;
  wallet_address: string;
  usage_count: number;
  last_used_at: string;
  reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  wallet_address?: string;
  avatar_url?: string;
  auth_provider: 'email' | 'wallet';
  auth_provider_id?: string;
  email_verified: boolean;
  wallet_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  market_id: string;
  platform: 'polymarket' | 'kalshi' | 'other';
  question: string;
  category?: string;
  description?: string;
  current_odds?: number;
  current_price?: number;
  liquidity?: number;
  volume_24h?: number;
  ends_at?: string;
  image_url?: string;
  status: 'active' | 'resolved' | 'expired' | 'cancelled';
  resolution?: 'YES' | 'NO' | 'CANCELLED';
  added_at: string;
  updated_at: string;
}

export interface UserSignal {
  id: string;
  user_id: string;
  watchlist_item_id?: string;
  signal_id: string;
  market_id: string;
  platform: string;
  direction: 'YES' | 'NO';
  probability: number;
  edge: number;
  confidence: number;
  position_size?: number;
  rationale?: string;
  risk_factors?: Record<string, any>[];
  technical_indicators?: Record<string, any>;
  sentiment_data?: Record<string, any>;
  generated_at: string;
  expires_at?: string;
  status: 'active' | 'expired' | 'executed' | 'cancelled';
  outcome?: 'CORRECT' | 'INCORRECT' | 'PENDING';
  profit_loss?: number;
  entry_price?: number;
  exit_price?: number;
  executed_at?: string;
  resolved_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  signal_notifications: boolean;
  price_alerts: boolean;
  resolution_notifications: boolean;
  min_confidence_threshold: number;
  min_edge_threshold: number;
  max_position_size: number;
  risk_tolerance: 'conservative' | 'medium' | 'aggressive';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: string;
  profile_public: boolean;
  share_analytics: boolean;
  data_retention_days: number;
  api_key_enabled: boolean;
  api_rate_limit: number;
  custom_alerts: Record<string, any>[];
  dashboard_layout: Record<string, any>;
  filter_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserChatHistory {
  id: string;
  user_id: string;
  session_id: string;
  message_type: 'user_query' | 'zigma_response' | 'system_message' | 'error_message';
  content: string;
  query_type?: 'market_analysis' | 'user_profile' | 'general_query' | 'multi_market_comparison' | 'signal_request';
  market_id?: string;
  market_question?: string;
  polymarket_user?: string;
  response_type?: 'recommendation' | 'analysis' | 'user_profile_data' | 'comparison' | 'error';
  recommendation_data?: Record<string, any>;
  analysis_data?: Record<string, any>;
  user_profile_data?: Record<string, any>;
  comparison_data?: Record<string, any>;
  processing_time_ms?: number;
  context_used?: boolean;
  context_id?: string;
  user_rating?: number;
  user_feedback?: string;
  was_helpful?: boolean;
  follow_up_queries?: string[];
  metadata?: Record<string, any>;
  api_version?: string;
  client_info?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  session_id: string;
  last_message_at: string;
  message_count: number;
  last_message_preview: string;
}

export interface ChatAnalytics {
  chat_date: string;
  total_messages: number;
  total_queries: number;
  total_responses: number;
  market_analysis_queries: number;
  user_profile_queries: number;
  recommendation_responses: number;
  avg_processing_time_ms: number;
  rated_messages: number;
  avg_user_rating: number;
  helpful_messages: number;
  unique_sessions: number;
  unique_markets_analyzed: number;
}

export interface ChatSummary {
  total_messages: number;
  total_queries: number;
  total_responses: number;
  total_sessions: number;
  active_days: number;
  first_chat_at: string;
  last_chat_at: string;
  avg_processing_time_ms: number;
  rated_messages: number;
  avg_user_rating: number;
  helpful_messages: number;
  unique_markets_analyzed: number;
  market_analysis_count: number;
  user_profile_count: number;
}

// Helper functions for database operations
export const db = {
  // User operations
  async createUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUser(userId: string, userData: Partial<User>) {
    // @ts-ignore
    const { data, error } = await supabase
      .from('users')
      .update(userData as any)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Watchlist operations
  async getWatchlist(userId: string) {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addToWatchlist(item: Partial<WatchlistItem>) {
    const { data, error } = await supabase
      .from('watchlist')
      .insert(item as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(userId: string, marketId: string, platform: string) {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('market_id', marketId)
      .eq('platform', platform);
    
    if (error) throw error;
  },

  // Signal operations
  async getUserSignals(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('user_signals')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async saveUserSignal(signal: Partial<UserSignal>) {
    const { data, error } = await supabase
      .from('user_signals')
      .insert(signal as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Preferences operations
  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(preferences as any, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Chat history operations
  async saveChatMessage(message: Partial<UserChatHistory>) {
    const { data, error } = await supabase
      .from('user_chat_history')
      .insert(message as any)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getChatSession(userId: string, sessionId: string, limit = 100) {
    // @ts-ignore
    const { data, error } = await supabase
      .rpc('get_user_chat_history', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_limit: limit
      });
    
    if (error) throw error;
    return data || [];
  },

  async getRecentChatSessions(userId: string, limit = 10) {
    // @ts-ignore
    const { data, error } = await supabase
      .rpc('get_user_chat_sessions', {
        p_user_id: userId,
        p_limit: limit
      });
    
    if (error) throw error;
    return data || [];
  },

  async searchChatHistory(userId: string, searchQuery: string, limit = 50) {
    // @ts-ignore
    const { data, error } = await supabase
      .rpc('search_user_chat_history', {
        p_user_id: userId,
        p_search_query: searchQuery,
        p_limit: limit
      });
    
    if (error) throw error;
    return data || [];
  },

  async getChatAnalytics(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('user_chat_analytics')
      .select('*')
      .eq('user_id', userId);
    
    if (startDate) {
      query = query.gte('chat_date', startDate);
    }
    if (endDate) {
      query = query.lte('chat_date', endDate);
    }
    
    const { data, error } = await query.order('chat_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getChatSummary(userId: string) {
    const { data, error } = await supabase
      .from('user_chat_summary')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateChatMessageRating(messageId: string, rating: number, feedback?: string, wasHelpful?: boolean) {
    // @ts-ignore
    const { data, error } = await supabase
      .from('user_chat_history')
      .update({
        user_rating: rating,
        user_feedback: feedback,
        was_helpful: wasHelpful,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteChatMessage(messageId: string) {
    const { error } = await supabase
      .from('user_chat_history')
      .delete()
      .eq('id', messageId);
    
    if (error) throw error;
  },

  async deleteChatSession(userId: string, sessionId: string) {
    const { error } = await supabase
      .from('user_chat_history')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId);
    
    if (error) throw error;
  },

  async getChatMessagesByDateRange(userId: string, startDate: string, endDate: string, limit = 100) {
    const { data, error } = await supabase
      .from('user_chat_history')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getChatMessagesByType(userId: string, messageType: string, limit = 50) {
    const { data, error } = await supabase
      .from('user_chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('message_type', messageType)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getMarketAnalysisHistory(userId: string, marketId?: string, limit = 50) {
    let query = supabase
      .from('user_chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('query_type', 'market_analysis');
    
    if (marketId) {
      query = query.eq('market_id', marketId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getUserProfileAnalysisHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('user_chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('query_type', 'user_profile')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Chat usage tracking functions
  async getChatUsage(userId: string, walletAddress?: string) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // @ts-ignore
    const { data, error } = await supabase
      .from('chat_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('wallet_address', walletAddress || '')
      .gte('last_used_at', twentyFourHoursAgo.toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async incrementChatUsage(userId: string, walletAddress?: string) {
    const now = new Date();
    const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // First try to get existing usage
    const existingUsage = await this.getChatUsage(userId, walletAddress);
    
    if (existingUsage) {
      // Update existing usage
      // @ts-ignore
      const { data, error } = await supabase
        .from('chat_usage')
        .update({
          usage_count: existingUsage.usage_count + 1,
          last_used_at: now.toISOString(),
          updated_at: now.toISOString()
        } as any)
        .eq('id', existingUsage.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new usage record
      // @ts-ignore
      const { data, error } = await supabase
        .from('chat_usage')
        .insert({
          user_id: userId,
          wallet_address: walletAddress || '',
          usage_count: 1,
          last_used_at: now.toISOString(),
          reset_at: resetAt.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  async canUseChat(userId: string, walletAddress?: string) {
    const usage = await this.getChatUsage(userId, walletAddress);
    
    if (!usage) {
      return { canUse: true, remainingUses: 5, resetAt: null };
    }
    
    const remainingUses = Math.max(0, 5 - usage.usage_count);
    const canUse = remainingUses > 0;
    
    return {
      canUse,
      remainingUses,
      resetAt: usage.reset_at
    };
  },
};
