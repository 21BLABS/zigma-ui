/**
 * Type declarations for UI components
 */

import { ReactNode } from 'react';

// Strategy Config Forms
declare module '@/components/strategy/config-forms/CopyTradingConfig' {
  export interface CopyTradingConfigProps {
    strategyId: string;
    initialConfig?: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
  }
  export const CopyTradingConfig: React.FC<CopyTradingConfigProps>;
}

declare module '@/components/strategy/config-forms/SportsMarketsConfig' {
  export interface SportsMarketsConfigProps {
    strategyId: string;
    initialConfig?: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
  }
  export const SportsMarketsConfig: React.FC<SportsMarketsConfigProps>;
}

declare module '@/components/strategy/config-forms/CryptoMarketsConfig' {
  export interface CryptoMarketsConfigProps {
    strategyId: string;
    initialConfig?: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
  }
  export const CryptoMarketsConfig: React.FC<CryptoMarketsConfigProps>;
}

declare module '@/components/strategy/config-forms/PoliticsMarketsConfig' {
  export interface PoliticsMarketsConfigProps {
    strategyId: string;
    initialConfig?: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
  }
  export const PoliticsMarketsConfig: React.FC<PoliticsMarketsConfigProps>;
}

declare module '@/components/strategy/config-forms/VolumeMarketsConfig' {
  export interface VolumeMarketsConfigProps {
    strategyId: string;
    initialConfig?: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
  }
  export const VolumeMarketsConfig: React.FC<VolumeMarketsConfigProps>;
}

declare module '@/components/strategy/config-forms/ArbitrageConfig' {
  export interface ArbitrageConfigProps {
    strategyId: string;
    initialConfig?: Record<string, any>;
    onChange: (config: Record<string, any>) => void;
  }
  export const ArbitrageConfig: React.FC<ArbitrageConfigProps>;
}

declare module '@/components/strategy/BudgetAllocation' {
  export interface BudgetAllocationProps {
    strategyId: string;
    initialBudget?: number;
    maxBudget?: number;
    onChange: (budget: number) => void;
  }
  export const BudgetAllocation: React.FC<BudgetAllocationProps>;
}

// TokenTierBadge component already exists in the codebase

// API Client
declare module '@/lib/api/api-client' {
  import { AxiosInstance } from 'axios';
  const apiClient: AxiosInstance;
  export default apiClient;
}
