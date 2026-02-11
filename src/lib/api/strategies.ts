/**
 * Strategies API Client
 * Handles API calls for strategy management
 */

import { apiRequest } from "../api-client";

// Token tier enum
export enum TokenTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PRO = "PRO",
  ELITE = "ELITE"
}

// Strategy interface
export interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredTier: TokenTier;
  defaultConfig: Record<string, any>;
  enabled?: boolean;
}

// Fetch available strategies
export async function fetchStrategies(): Promise<{
  success: boolean;
  strategies: Strategy[];
  message?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      strategies: Strategy[];
    }>("/api/token/strategies", {
      method: "GET",
    });

    return response;
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return {
      success: false,
      strategies: [],
      message: "Failed to fetch strategies"
    };
  }
}

// Fetch user's token tier
export async function fetchUserTokenTier(): Promise<{
  success: boolean;
  tier: TokenTier;
  walletAddress?: string;
  strategies?: Strategy[];
  message?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      tier: TokenTier;
      walletAddress: string;
      strategies: Strategy[];
    }>("/api/token/tier", {
      method: "GET",
    });

    return response;
  } catch (error) {
    console.error("Error fetching user token tier:", error);
    return {
      success: false,
      tier: TokenTier.FREE,
      message: "Failed to fetch token tier"
    };
  }
}

// Configure a strategy
export async function configureStrategy(
  strategyId: string,
  config: Record<string, any>
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      message?: string;
    }>(`/api/strategies/${strategyId}/configure`, {
      method: "POST",
      body: JSON.stringify({ config }),
    });

    return response;
  } catch (error) {
    console.error("Error configuring strategy:", error);
    return {
      success: false,
      message: "Failed to configure strategy"
    };
  }
}

// Enable or disable a strategy
export async function toggleStrategy(
  strategyId: string,
  enabled: boolean
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      message?: string;
    }>(`/api/strategies/${strategyId}/toggle`, {
      method: "POST",
      body: JSON.stringify({ enabled }),
    });

    return response;
  } catch (error) {
    console.error("Error toggling strategy:", error);
    return {
      success: false,
      message: "Failed to toggle strategy"
    };
  }
}

// Get strategy configuration
export async function getStrategyConfig(
  strategyId: string
): Promise<{
  success: boolean;
  config?: Record<string, any>;
  message?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      config: Record<string, any>;
    }>(`/api/strategies/${strategyId}/config`, {
      method: "GET",
    });

    return response;
  } catch (error) {
    console.error("Error fetching strategy config:", error);
    return {
      success: false,
      message: "Failed to fetch strategy configuration"
    };
  }
}

// Get all token tiers and requirements
export async function fetchTokenTiers(): Promise<{
  success: boolean;
  tiers?: TokenTier[];
  requirements?: Record<TokenTier, number>;
  benefits?: Record<TokenTier, string[]>;
  categoryRequirements?: Record<string, TokenTier>;
  message?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      tiers: TokenTier[];
      requirements: Record<TokenTier, number>;
      benefits: Record<TokenTier, string[]>;
      categoryRequirements: Record<string, TokenTier>;
    }>("/api/token/tiers", {
      method: "GET",
    });

    return response;
  } catch (error) {
    console.error("Error fetching token tiers:", error);
    return {
      success: false,
      message: "Failed to fetch token tiers"
    };
  }
}

// Refresh user's token tier from blockchain
export async function refreshTokenTier(): Promise<{
  success: boolean;
  tier?: TokenTier;
  walletAddress?: string;
  strategies?: Strategy[];
  message?: string;
}> {
  try {
    const response = await apiRequest<{
      success: boolean;
      tier: TokenTier;
      walletAddress: string;
      strategies: Strategy[];
    }>("/api/token/refresh", {
      method: "POST",
    });

    return response;
  } catch (error) {
    console.error("Error refreshing token tier:", error);
    return {
      success: false,
      message: "Failed to refresh token tier"
    };
  }
}
