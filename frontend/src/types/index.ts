// Core types for the AI DEX Swap Assistant
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  verified: boolean;
  riskScore?: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidityUSD?: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasEstimate: string;
  route: SwapRoute[];
  slippage: number;
  estimatedGasUSD: number;
}

export interface SwapRoute {
  dex: string;
  percentage: number;
  gasEstimate: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    quote?: SwapQuote;
    transaction?: {
      hash: string;
      status: 'pending' | 'success' | 'failed';
    };
    educationalContent?: {
      title: string;
      explanation: string;
    };
  };
}

export interface UserPreferences {
  favoriteTokens: Token[];
  defaultSlippage: number;
  preferredNetworks: number[];
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
}

export interface Network {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  logoURI: string;
}