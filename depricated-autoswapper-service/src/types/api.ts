// API Request/Response Types
export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  userAddress?: string;
  slippage?: number;
}

export interface SwapResponse {
  status: 'success' | 'failed';
  transactionHash?: string;
  fromToken: string;
  toToken: string;
  inputAmount: string;
  outputAmount?: string;
  gasUsed?: string;
  error?: string;
  timestamp: string;
}

export interface QuoteRequest {
  fromToken: string;
  toToken: string;
  amount: string;
}

export interface QuoteResponse {
  fromToken: string;
  toToken: string;
  inputAmount: string;
  estimatedOutput: string;
  priceImpact: string;
  route: string[];
  gasEstimate: string;
  slippage: string;
}

export interface StatusRequest {
  transactionHash: string;
}

export interface StatusResponse {
  transactionHash: string;
  status: 'pending' | 'success' | 'failed';
  confirmations?: number;
  blockNumber?: string;
  gasUsed?: string;
  timestamp?: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
}

// Validation functions for backward compatibility
export function validateSwapRequest(data: any): SwapRequest {
  // Simple validation - in production, use zod or similar
  if (!data.fromToken || !data.toToken || !data.amount) {
    throw new Error('Missing required fields: fromToken, toToken, amount');
  }
  return data as SwapRequest;
}

export function validateStatusRequest(data: any): StatusRequest {
  if (!data.transactionHash) {
    throw new Error('Missing required field: transactionHash');
  }
  return data as StatusRequest;
}

export function validateQuoteRequest(data: any): QuoteRequest {
  if (!data.fromToken || !data.toToken || !data.amount) {
    throw new Error('Missing required fields: fromToken, toToken, amount');
  }
  return data as QuoteRequest;
}
