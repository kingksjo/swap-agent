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

// Transaction Proposal Types (matching backend models)
export interface SwapProposal {
  action: 'swap';
  tokenIn: string;
  tokenInAddress: string;
  tokenOut: string;
  tokenOutAddress: string;
  amount: string;
  estimatedOutput: string;
  maxSlippage: string;
  chain: string;
  routerAddress: string;
}

export interface SendProposal {
  action: 'send';
  token: string;
  tokenAddress: string;
  toAddress: string;
  amount: string;
  chain: string;
}

export type TransactionProposal = SwapProposal | SendProposal;

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
    proposal?: TransactionProposal;
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