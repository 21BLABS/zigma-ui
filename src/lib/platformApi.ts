/**
 * Platform API Client
 * Connects to platform.zigma.pro (or localhost:3002)
 * Provides access to autonomous trading features
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

export interface Strategy {
  id: string;
  agentId: string;
  strategyType: 'SIGNALS' | 'COPY_TRADING' | 'SPORTS' | 'CRYPTO' | 'POLITICS' | 'VOLUME' | 'ARBITRAGE';
  name: string;
  description?: string;
  config: Record<string, any>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  agentId: string;
  marketId: string;
  marketQuestion: string;
  action: string;
  side: 'BUY' | 'SELL';
  shares: number;
  price: number;
  cost: number;
  fee: number;
  status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELED' | 'FILLED';
  pnl?: number;
  strategyId?: string;
  timestamp: string;
}

export interface Wallet {
  id: string;
  agentId: string;
  address: string;
  network: 'POLYGON' | 'SOLANA' | 'ETHEREUM';
  type: 'PLATFORM_MANAGED' | 'BYOW';
  balance: number;
  createdAt: string;
}

export interface ExecutionResult {
  success: boolean;
  trade?: Trade;
  error?: string;
  message?: string;
}

/**
 * Get authentication token (Magic.link DID token)
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Import getMagic function to get the Magic instance safely
    const { getMagic } = await import('./magic');
    const magic = getMagic();
    
    if (!magic) {
      console.warn('[Platform API] Magic not initialized, attempting to initialize');
      // Try one more time with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const magicRetry = getMagic();
      if (!magicRetry) {
        console.error('[Platform API] Failed to initialize Magic after retry');
        return null;
      }
      
      const didToken = await magicRetry.user.getIdToken();
      return didToken;
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
    } else {
      console.warn('[Platform API] No auth token available, request may fail');
    }
    
    console.log(`[Platform API] Requesting ${PLATFORM_API_URL}${endpoint}`);
    
    const response = await fetch(`${PLATFORM_API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      console.error(`[Platform API] HTTP error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
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

/**
 * Get all strategies for an agent
 */
export async function getStrategies(agentId: string): Promise<Strategy[]> {
  const result = await apiRequest<Strategy[]>(`/api/execution/strategies?agentId=${agentId}`);
  return result.success && result.data ? result.data : [];
}

/**
 * Create a new strategy
 */
export async function createStrategy(
  agentId: string,
  strategyType: Strategy['strategyType'],
  name: string,
  config: Record<string, any>
): Promise<Strategy | null> {
  const result = await apiRequest<Strategy>('/api/execution/strategies', {
    method: 'POST',
    body: JSON.stringify({ agentId, strategyType, name, config }),
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Update a strategy
 */
export async function updateStrategy(
  strategyId: string,
  updates: Partial<Pick<Strategy, 'name' | 'config' | 'enabled'>>
): Promise<Strategy | null> {
  const result = await apiRequest<Strategy>(`/api/execution/strategies/${strategyId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Delete a strategy
 */
export async function deleteStrategy(strategyId: string): Promise<boolean> {
  const result = await apiRequest(`/api/execution/strategies/${strategyId}`, {
    method: 'DELETE',
  });
  return result.success;
}

/**
 * Execute strategies for an agent
 */
export async function executeStrategies(agentId: string): Promise<Record<string, ExecutionResult[]>> {
  const result = await apiRequest<Record<string, ExecutionResult[]>>('/api/execution/execute', {
    method: 'POST',
  });
  return result.success && result.data ? result.data : {};
}

/**
 * Execute a specific strategy
 */
export async function executeStrategy(strategyId: string): Promise<ExecutionResult[]> {
  const result = await apiRequest<ExecutionResult[]>(`/api/execution/execute/${strategyId}`, {
    method: 'POST',
  });
  return result.success && result.data ? result.data : [];
}

/**
 * Get agent's trades
 */
export async function getTrades(
  agentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Trade[]> {
  const result = await apiRequest<Trade[]>(
    `/api/execution/trades?agentId=${agentId}&limit=${limit}&offset=${offset}`
  );
  return result.success && result.data ? result.data : [];
}

/**
 * Get agent's wallets
 */
export async function getWallets(agentId: string): Promise<Wallet[]> {
  const result = await apiRequest<Wallet[]>(`/api/wallets?agentId=${agentId}`);
  return result.success && result.data ? result.data : [];
}

/**
 * Create a new platform-managed wallet
 */
export async function createWallet(
  agentId: string,
  network: Wallet['network']
): Promise<Wallet | null> {
  const result = await apiRequest<Wallet>('/api/wallets', {
    method: 'POST',
    body: JSON.stringify({ agentId, network }),
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Register a BYOW (Bring Your Own Wallet)
 */
export async function registerBYOW(
  agentId: string,
  address: string,
  network: Wallet['network'],
  signature: string
): Promise<Wallet | null> {
  const result = await apiRequest<Wallet>('/api/wallets/byow', {
    method: 'POST',
    body: JSON.stringify({ agentId, address, network, signature }),
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Fund a wallet with test tokens (development only)
 */
export async function fundWallet(
  walletId: string,
  amount: number
): Promise<boolean> {
  const result = await apiRequest(`/api/wallets/${walletId}/fund`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return result.success;
}

// ============================================================================
// DEPOSIT & WITHDRAWAL
// ============================================================================

export interface TradingBalance {
  tradingBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  walletAddress: string;
  polymarketAddress: string;
  onChainUsdc: number;
}

export interface DepositResult {
  depositId: string;
  amount: number;
  txHash: string;
  status: string;
}

export interface WithdrawalResult {
  withdrawalId: string;
  amount: number;
  toAddress: string;
  status: string;
  remainingBalance: number;
}

/**
 * Get agent's trading balance
 */
export async function getTradingBalance(): Promise<TradingBalance | null> {
  const result = await apiRequest<TradingBalance>('/api/wallets/trading-balance');
  return result.success && result.data ? result.data : null;
}

/**
 * Record a deposit (after user sends USDC on-chain)
 */
export async function recordDeposit(
  txHash: string,
  amount: number,
  fromAddress: string
): Promise<DepositResult | null> {
  const result = await apiRequest<DepositResult>('/api/wallets/deposit', {
    method: 'POST',
    body: JSON.stringify({ txHash, amount, fromAddress }),
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Request a withdrawal
 */
export async function requestWithdrawal(
  amount: number,
  toAddress: string
): Promise<WithdrawalResult | null> {
  const result = await apiRequest<WithdrawalResult>('/api/wallets/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, toAddress }),
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Get deposit history
 */
export async function getDeposits(): Promise<any[]> {
  const result = await apiRequest<any[]>('/api/wallets/deposits');
  return result.success && result.data ? result.data : [];
}

/**
 * Get withdrawal history
 */
export async function getWithdrawals(): Promise<any[]> {
  const result = await apiRequest<any[]>('/api/wallets/withdrawals');
  return result.success && result.data ? result.data : [];
}

// ============================================================================
// REAL TRADING API (Polymarket CLOB)
// ============================================================================

export interface TradingStatus {
  wallet: {
    address: string | null;
    type: string | null;
    polymarketAddress: string | null;
  };
  balance: {
    trading: number;
    onChainUsdc: number;
    totalDeposited: number;
    totalWithdrawn: number;
  };
  autoTrade: {
    enabled: boolean;
    maxTradeSize: number;
  };
  stats: {
    totalPnl: number;
    winRate: number;
    totalTrades: number;
  };
  trades: Trade[];
}

/**
 * Setup wallet — auto-creates a platform-managed Polygon wallet
 */
export async function setupTradingWallet(): Promise<{ walletAddress: string; alreadyExists: boolean } | null> {
  const result = await apiRequest<{ walletAddress: string; alreadyExists: boolean }>('/api/trading/setup-wallet', {
    method: 'POST',
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Get full trading status: wallet, balance, positions, trades, auto-trade config
 */
export async function getTradingStatus(): Promise<TradingStatus | null> {
  const result = await apiRequest<TradingStatus>('/api/trading/status');
  return result.success && result.data ? result.data : null;
}

/**
 * Enable/disable auto-trading
 */
export async function setAutoTrade(enabled: boolean, maxTradeSize?: number): Promise<boolean> {
  const result = await apiRequest('/api/trading/auto-trade', {
    method: 'POST',
    body: JSON.stringify({ enabled, maxTradeSize: maxTradeSize || 5 }),
  });
  return result.success;
}

/**
 * Execute a single trade on Polymarket
 */
export async function executeSingleTrade(params: {
  marketId: string;
  side: 'YES' | 'NO';
  amount: number;
  price: number;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const result = await apiRequest<{ success: boolean; orderId?: string; error?: string }>('/api/trading/execute', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return result.data || { success: false, error: result.error };
}

/**
 * Auto-execute: fetch Zigma signals and execute eligible trades
 */
export async function autoExecuteTrades(): Promise<{
  executed: number;
  total: number;
  signalsScanned: number;
  signalsQualified: number;
  totalSpent: number;
  results: any[];
  remainingBalance: number;
} | null> {
  const result = await apiRequest<{
    executed: number;
    total: number;
    signalsScanned: number;
    signalsQualified: number;
    totalSpent: number;
    results: any[];
    remainingBalance: number;
  }>('/api/trading/auto-execute', {
    method: 'POST',
  });
  return result.success && result.data ? result.data : null;
}

/**
 * Fund trading balance (for testing / manual credit)
 */
export async function fundTradingBalance(amount: number): Promise<{ credited: number; newBalance: number } | null> {
  const result = await apiRequest<{ credited: number; newBalance: number }>('/api/trading/fund', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return result.success && result.data ? result.data : null;
}
