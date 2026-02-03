/**
 * Platform API Client
 * Connects to platform.zigma.pro (or localhost:3002)
 */

const PLATFORM_API_URL = import.meta.env.VITE_PLATFORM_API_URL || 'http://localhost:3002';

console.log('[Platform API] Using API URL:', PLATFORM_API_URL);

export interface Agent {
  id: string;
  name: string;
  apiKey: string;
  walletAddress?: string;
  tier: 'FREE' | 'BASIC' | 'PRO' | 'WHALE';
  zigmaBalance: number;
  createdAt: string;
  isClaimed: boolean;
}

export interface AgentStats {
  agentId: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  sharpeRatio: number;
  reputationScore: number;
  rank?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  requiredTier: 'FREE' | 'BASIC' | 'PRO' | 'WHALE';
}

export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  tier: string;
}

export interface EnabledSkill {
  id: string;
  name: string;
  status: 'active' | 'paused';
  enabledAt: string;
  lastExecuted?: string;
  tradesExecuted: number;
  pnl: number;
  config?: Record<string, any>;
}

/**
 * Get authentication token (Magic.link DID token)
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Get Magic instance from window
    const magic = (window as any).magic;
    if (!magic) {
      console.warn('[Platform API] Magic not initialized');
      return null;
    }
    
    const didToken = await magic.user.getIdToken();
    return didToken;
  } catch (error) {
    console.error('[Platform API] Failed to get auth token:', error);
    return null;
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${PLATFORM_API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Platform API] Request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed',
    };
  }
}

/**
 * Get current user's agent
 */
export async function getMyAgent(): Promise<Agent | null> {
  const result = await apiRequest<Agent>('/api/agents/me');
  return result.success && result.data ? result.data : null;
}

/**
 * Get or create agent (auto-register on first login)
 */
export async function getOrCreateAgent(): Promise<Agent | null> {
  try {
    // Try to get existing agent
    let agent = await getMyAgent();
    
    if (!agent) {
      // No agent exists, auto-register
      const magic = (window as any).magic;
      if (!magic) {
        console.warn('[Platform API] Magic not initialized, cannot auto-register');
        return null;
      }
      
      const userInfo = await magic.user.getInfo();
      const agentName = userInfo.email?.split('@')[0] || 'Agent';
      
      console.log('[Platform API] Auto-registering agent:', agentName);
      agent = await registerAgent(agentName);
      
      if (agent) {
        console.log('[Platform API] Agent registered successfully:', agent.id);
      }
    }
    
    return agent;
  } catch (error) {
    console.error('[Platform API] Failed to get or create agent:', error);
    return null;
  }
}

/**
 * Get agent statistics
 */
export async function getAgentStats(agentId: string): Promise<AgentStats | null> {
  const result = await apiRequest<AgentStats>(`/api/agents/${agentId}/stats`);
  return result.success && result.data ? result.data : null;
}

/**
 * Get all available skills
 */
export async function getSkills(): Promise<Skill[]> {
  const result = await apiRequest<Skill[]>('/api/skills');
  return result.success && result.data ? result.data : [];
}

/**
 * Enable a skill for the agent
 */
export async function enableSkill(
  skillId: string,
  config?: Record<string, any>
): Promise<boolean> {
  const result = await apiRequest('/api/skills/enable', {
    method: 'POST',
    body: JSON.stringify({ skillId, config }),
  });
  return result.success;
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const result = await apiRequest<LeaderboardEntry[]>(
    `/api/leaderboard?period=${period}&limit=${limit}`
  );
  return result.success && result.data ? result.data : [];
}

/**
 * Get agent's enabled skills
 */
export async function getEnabledSkills(agentId: string): Promise<EnabledSkill[]> {
  const result = await apiRequest<EnabledSkill[]>(`/api/agents/${agentId}/skills`);
  return result.success && result.data ? result.data : [];
}

/**
 * Disable a skill
 */
export async function disableSkill(skillId: string): Promise<boolean> {
  const result = await apiRequest(`/api/skills/${skillId}/disable`, {
    method: 'POST',
  });
  return result.success;
}

/**
 * Configure a skill
 */
export async function configureSkill(
  skillId: string,
  config: Record<string, any>
): Promise<boolean> {
  const result = await apiRequest(`/api/skills/${skillId}/configure`, {
    method: 'POST',
    body: JSON.stringify({ params: config }),
  });
  return result.success;
}

/**
 * Register a new agent (for testing)
 */
export async function registerAgent(name: string): Promise<Agent | null> {
  const result = await apiRequest<Agent>('/api/agents/register', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return result.success && result.data ? result.data : null;
}
