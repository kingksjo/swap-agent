import { QuoteRequest, QuoteResponse, ApiResponse } from '../types/api';
import { 
  getTokenBySymbol, 
  getExchangeRate, 
  calculateOutputAmount,
  formatTokenAmount 
} from '../utils/addresses';
import {
  generateMockRoute,
  calculateMockGasEstimate,
  calculateMockPriceImpact,
  generateMockValidUntil,
  simulateNetworkDelay,
  MOCK_ERROR_MESSAGES
} from '../utils/mockHelpers';

export class QuoteService {
  static async getQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse>> {
    // Simulate network delay for price fetching
    await simulateNetworkDelay(150, 400);

    // Validate tokens exist
    const fromToken = getTokenBySymbol(request.fromToken);
    const toToken = getTokenBySymbol(request.toToken);

    if (!fromToken || !toToken) {
      throw new Error(MOCK_ERROR_MESSAGES.TOKEN_NOT_FOUND);
    }

    // Same token check
    if (request.fromToken.toUpperCase() === request.toToken.toUpperCase()) {
      throw new Error('Cannot quote same token');
    }

    // Get exchange rate
    const exchangeRate = getExchangeRate(request.fromToken, request.toToken);
    
    if (!exchangeRate) {
      throw new Error(MOCK_ERROR_MESSAGES.INVALID_PAIR);
    }

    // Calculate output amount (without slippage for quote)
    const outputAmount = calculateOutputAmount(
      parseFloat(request.amount),
      request.fromToken,
      request.toToken,
    );

    if (!outputAmount) {
      throw new Error(MOCK_ERROR_MESSAGES.INVALID_AMOUNT);
    }

    // Generate quote data
    const route = generateMockRoute(request.fromToken, request.toToken);
    const estimatedGas = calculateMockGasEstimate(route.length > 2 ? 'complex' : 'simple');
    const priceImpact = calculateMockPriceImpact(request.amount);
    const validUntil = generateMockValidUntil(5); // 5 minutes validity

    // Format amounts
    const formattedFromAmount = formatTokenAmount(request.amount, fromToken.decimals);
    const formattedToAmount = formatTokenAmount(outputAmount, toToken.decimals);

    return {
      status: 'success',
      message: 'Quote retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        fromToken: request.fromToken.toUpperCase(),
        toToken: request.toToken.toUpperCase(),
        inputAmount: formattedFromAmount,
        estimatedOutput: formattedToAmount,
        priceImpact: `${priceImpact}%`,
        gasEstimate: estimatedGas,
        route,
        slippage: '0.50%'
      }
    };
  }

  static async validateQuoteRequest(request: QuoteRequest): Promise<void> {
    // Validate amount is positive
    const amount = parseFloat(request.amount);
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Validate amount is not too large
    if (amount > 1e18) {
      throw new Error('Amount is too large');
    }

    // Validate tokens are different
    if (request.fromToken.toLowerCase() === request.toToken.toLowerCase()) {
      throw new Error('From and to tokens must be different');
    }
  }

  static async getBestRoute(fromToken: string, toToken: string): Promise<string[]> {
    await simulateNetworkDelay(100, 200);
    
    return generateMockRoute(fromToken, toToken);
  }

  static async getCurrentPrice(fromToken: string, toToken: string): Promise<number | null> {
    await simulateNetworkDelay(50, 150);
    
    return getExchangeRate(fromToken, toToken);
  }

  static async getPriceHistory(
    fromToken: string, 
    toToken: string, 
    hours: number = 24
  ): Promise<Array<{ timestamp: string; price: number }>> {
    await simulateNetworkDelay(200, 500);
    
    const basePrice = getExchangeRate(fromToken, toToken);
    if (!basePrice) return [];

    const history: Array<{ timestamp: string; price: number }> = [];
    const now = new Date();
    
    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      // Add some realistic price variation (±2%)
      const variation = (Math.random() - 0.5) * 0.04;
      const price = basePrice * (1 + variation);
      
      history.push({
        timestamp: timestamp.toISOString(),
        price: parseFloat(price.toFixed(8))
      });
    }
    
    return history.reverse();
  }
}
