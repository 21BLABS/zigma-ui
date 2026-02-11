/**
 * Type declarations for strategy configuration components
 */

import { FC } from 'react';

interface ConfigProps {
  strategyId: string;
  initialConfig?: any;
  onChange: (config: any) => void;
}

declare module './CopyTradingConfig' {
  export const CopyTradingConfig: FC<ConfigProps>;
}

declare module './SportsMarketsConfig' {
  export const SportsMarketsConfig: FC<ConfigProps>;
}

declare module './CryptoMarketsConfig' {
  export const CryptoMarketsConfig: FC<ConfigProps>;
}

declare module './PoliticsMarketsConfig' {
  export const PoliticsMarketsConfig: FC<ConfigProps>;
}

declare module './VolumeMarketsConfig' {
  export const VolumeMarketsConfig: FC<ConfigProps>;
}

declare module './ArbitrageConfig' {
  export const ArbitrageConfig: FC<ConfigProps>;
}

declare module './ZigmaSignalsConfig' {
  export const ZigmaSignalsConfig: FC<ConfigProps>;
}

declare module '../BudgetAllocation' {
  interface BudgetAllocationProps {
    strategyId: string;
    initialBudget?: number;
    maxBudget?: number;
    onChange: (budget: number) => void;
  }
  export const BudgetAllocation: FC<BudgetAllocationProps>;
}
