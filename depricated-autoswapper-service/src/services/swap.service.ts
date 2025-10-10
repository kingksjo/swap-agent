import type { SwapRequest, SwapResponse, QuoteRequest, QuoteResponse } from '../types/api';
import { generateTransactionHash, delay, formatAmount, estimateGas } from '../utils/normalize';
import { getTokenBySymbol } from '../utils/addresses';

export class SwapService {
  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    // Simulate network delay
    await delay(500);

    const fromToken = getTokenBySymbol(params.fromToken);
    const toToken = getTokenBySymbol(params.toToken);

    if (!fromToken || !toToken) {
      throw new Error(`Unsupported token pair: ${params.fromToken}/${params.toToken}`);
    }

    const inputAmount = parseFloat(params.amount);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      throw new Error('Invalid input amount');
    }

    // Mock exchange rate calculation
    const mockRates: Record<string, number> = {
      'ETH/USDC': 2500,
      'ETH/USDT': 2498,
      'ETH/STRK': 1250,
      'USDC/ETH': 0.0004,
      'USDT/ETH': 0.0004,
      'STRK/ETH': 0.0008,
      'USDC/USDT': 0.999,
      'USDT/USDC': 1.001,
    };

    const pairKey = `${params.fromToken}/${params.toToken}`;
    const reversePairKey = `${params.toToken}/${params.fromToken}`;
    
    let rate = mockRates[pairKey];
    if (!rate && mockRates[reversePairKey]) {
      rate = 1 / mockRates[reversePairKey];
    }
    if (!rate) {
      rate = 1; // Default 1:1 rate
    }

    // Apply mock slippage (0.1-0.3%)
    const slippagePercent = 0.1 + Math.random() * 0.2;
    const estimatedOutput = inputAmount * rate * (1 - slippagePercent / 100);

    return {
      fromToken: params.fromToken,
      toToken: params.toToken,
      inputAmount: formatAmount(inputAmount, fromToken.decimals),
      estimatedOutput: formatAmount(estimatedOutput, toToken.decimals),
      priceImpact: `${slippagePercent.toFixed(2)}%`,
      route: [params.fromToken, params.toToken],
      gasEstimate: estimateGas(params.fromToken, params.toToken),
      slippage: `${slippagePercent.toFixed(2)}%`
    };
  }

  async executeSwap(params: SwapRequest): Promise<SwapResponse> {
    // Simulate transaction processing time
    await delay(2000);

    const fromToken = getTokenBySymbol(params.fromToken);
    const toToken = getTokenBySymbol(params.toToken);

    if (!fromToken || !toToken) {
      throw new Error(`Unsupported token pair: ${params.fromToken}/${params.toToken}`);
    }

    const inputAmount = parseFloat(params.amount);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      throw new Error('Invalid input amount');
    }

    // Get quote for output calculation
    const quote = await this.getQuote({
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount
    });

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        status: 'failed',
        fromToken: params.fromToken,
        toToken: params.toToken,
        inputAmount: formatAmount(inputAmount, fromToken.decimals),
        error: 'Transaction failed: Insufficient liquidity',
        timestamp: new Date().toISOString()
      };
    }

    // Success case
    return {
      status: 'success',
      transactionHash: generateTransactionHash(),
      fromToken: params.fromToken,
      toToken: params.toToken,
      inputAmount: formatAmount(inputAmount, fromToken.decimals),
      outputAmount: quote.estimatedOutput,
      gasUsed: quote.gasEstimate,
      timestamp: new Date().toISOString()
    };
  }

  // Static methods for backward compatibility with existing route code
  static async validateSwapRequest(params: SwapRequest): Promise<void> {
    const fromToken = getTokenBySymbol(params.fromToken);
    const toToken = getTokenBySymbol(params.toToken);
    
    if (!fromToken || !toToken) {
      throw new Error(`Unsupported token pair: ${params.fromToken}/${params.toToken}`);
    }
    
    const amount = parseFloat(params.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }
  }

  static async executeSwap(params: SwapRequest): Promise<SwapResponse> {
    const service = new SwapService();
    return await service.executeSwap(params);
  }

  static async estimateSwapGas(params: SwapRequest): Promise<{ gasEstimate: string }> {
    const fromToken = getTokenBySymbol(params.fromToken);
    const toToken = getTokenBySymbol(params.toToken);
    
    if (!fromToken || !toToken) {
      throw new Error(`Unsupported token pair: ${params.fromToken}/${params.toToken}`);
    }
    
    const gasEstimate = estimateGas(params.fromToken, params.toToken);
    return { gasEstimate };
  }
}
