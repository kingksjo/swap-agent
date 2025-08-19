import { z } from 'zod';

// Base response structure
export const BaseResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  message: z.string(),
  timestamp: z.string(),
});

// Health check response
export const HealthResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    uptime: z.number(),
    environment: z.string(),
  }),
});

// Swap request/response types
export const SwapRequestSchema = z.object({
  fromToken: z.string().min(1, 'From token is required'),
  toToken: z.string().min(1, 'To token is required'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Amount must be a valid number'),
  userAddress: z.string().min(1, 'User address is required'),
  slippage: z.number().min(0.1).max(50).optional().default(1.0), // 0.1% to 50%
});

export const SwapResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    transactionHash: z.string(),
    fromToken: z.string(),
    toToken: z.string(),
    fromAmount: z.string(),
    toAmount: z.string(),
    slippage: z.number(),
    estimatedGas: z.string(),
    deadline: z.string(),
    route: z.array(z.string()),
  }),
});

// Quote request/response types
export const QuoteRequestSchema = z.object({
  fromToken: z.string().min(1, 'From token is required'),
  toToken: z.string().min(1, 'To token is required'),
  amount: z.string().regex(/^\d+(\.\d+)?$/, 'Amount must be a valid number'),
});

export const QuoteResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    fromToken: z.string(),
    toToken: z.string(),
    fromAmount: z.string(),
    toAmount: z.string(),
    exchangeRate: z.string(),
    priceImpact: z.string(),
    estimatedGas: z.string(),
    route: z.array(z.string()),
    validUntil: z.string(),
  }),
});

// Transaction status types
export const StatusRequestSchema = z.object({
  transactionHash: z.string()
    .startsWith('0x', 'Transaction hash must start with 0x')
    .length(66, 'Transaction hash must be 66 characters long')
    .regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid transaction hash format'),
});

export const StatusResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    transactionHash: z.string(),
    status: z.enum(['pending', 'completed', 'failed', 'not_found']),
    blockNumber: z.number().optional(),
    confirmations: z.number().optional(),
    gasUsed: z.string().optional(),
    effectiveGasPrice: z.string().optional(),
    error: z.string().optional(),
  }),
});

// Error response type
export const ErrorResponseSchema = BaseResponseSchema.extend({
  code: z.string(),
  details: z.any().optional(),
});

// Type exports
export type SwapRequest = z.infer<typeof SwapRequestSchema>;
export type SwapResponse = z.infer<typeof SwapResponseSchema>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;
export type StatusRequest = z.infer<typeof StatusRequestSchema>;
export type StatusResponse = z.infer<typeof StatusResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Token info type
export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
}

// Validation schemas for middleware
export const validateSwapRequest = (data: unknown): SwapRequest => {
  return SwapRequestSchema.parse(data);
};

export const validateQuoteRequest = (data: unknown): QuoteRequest => {
  return QuoteRequestSchema.parse(data);
};

export const validateStatusRequest = (data: unknown): StatusRequest => {
  return StatusRequestSchema.parse(data);
};
