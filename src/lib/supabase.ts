import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  wallet_address?: string;
  avatar_url?: string;
  auth_provider: 'email' | 'wallet' | 'web3auth';
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

// Helper functions for database operations
export const db = {
  // User operations
  async createUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
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

  async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
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
      .insert(item)
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

  async createUserSignal(signal: Partial<UserSignal>) {
    const { data, error } = await supabase
      .from('user_signals')
      .insert(signal)
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
      .upsert({ ...preferences, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
