import { SwapRequest, SwapResponse } from '../types/api';
import { 
  getTokenBySymbol, 
  calculateOutputAmount, 
  formatTokenAmount 
} from '../utils/addresses';
import {
  generateMockTransactionHash,
  generateMockRoute,
  calculateMockGasEstimate,
  generateMockDeadline,
  simulateNetworkDelay,
  MOCK_ERROR_MESSAGES
} from '../utils/mockHelpers';

export class SwapService {
  static async executeSwap(request: SwapRequest): Promise<SwapResponse> {
    // Simulate network delay
    await simulateNetworkDelay(200, 800);

    // Validate tokens exist
    const fromToken = getTokenBySymbol(request.fromToken);
    const toToken = getTokenBySymbol(request.toToken);

    if (!fromToken || !toToken) {
      throw new Error(MOCK_ERROR_MESSAGES.TOKEN_NOT_FOUND);
    }

    // Same token check
    if (request.fromToken.toUpperCase() === request.toToken.toUpperCase()) {
      throw new Error('Cannot swap token to itself');
    }

    // Calculate output amount
    const outputAmount = calculateOutputAmount(
      request.amount,
      request.fromToken,
      request.toToken,
      request.slippage
    );

    if (!outputAmount) {
      throw new Error(MOCK_ERROR_MESSAGES.INVALID_PAIR);
    }

    // Validate minimum output
    if (parseFloat(outputAmount) <= 0) {
      throw new Error(MOCK_ERROR_MESSAGES.INVALID_AMOUNT);
    }

    // Random failure simulation (5% chance)
    if (Math.random() < 0.05) {
      const errors = [
        MOCK_ERROR_MESSAGES.INSUFFICIENT_BALANCE,
        MOCK_ERROR_MESSAGES.SLIPPAGE_TOO_HIGH,
        MOCK_ERROR_MESSAGES.NETWORK_ERROR
      ];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }

    // Generate mock transaction data
    const transactionHash = generateMockTransactionHash();
    const route = generateMockRoute(request.fromToken, request.toToken);
    const estimatedGas = calculateMockGasEstimate(route.length > 2 ? 'complex' : 'simple');
    const deadline = generateMockDeadline(30);

    // Format amounts properly
    const formattedFromAmount = formatTokenAmount(request.amount, fromToken.decimals);
    const formattedToAmount = formatTokenAmount(outputAmount, toToken.decimals);

    return {
      status: 'success',
      message: 'Swap transaction submitted successfully',
      timestamp: new Date().toISOString(),
      data: {
        transactionHash,
        fromToken: request.fromToken.toUpperCase(),
        toToken: request.toToken.toUpperCase(),
        fromAmount: formattedFromAmount,
        toAmount: formattedToAmount,
        slippage: request.slippage || 1.0,
        estimatedGas,
        deadline,
        route
      }
    };
  }

  static async validateSwapRequest(request: SwapRequest): Promise<void> {
    // Validate amount is positive
    const amount = parseFloat(request.amount);
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Validate amount is not too large (prevent overflow)
    if (amount > 1e18) {
      throw new Error('Amount is too large');
    }

    // Validate slippage is reasonable
    if (request.slippage && (request.slippage < 0.1 || request.slippage > 50)) {
      throw new Error('Slippage must be between 0.1% and 50%');
    }

    // Validate user address format (basic Starknet address validation)
    if (!request.userAddress.startsWith('0x') || request.userAddress.length < 63) {
      throw new Error('Invalid user address format');
    }

    // Validate tokens are different
    if (request.fromToken.toLowerCase() === request.toToken.toLowerCase()) {
      throw new Error('From and to tokens must be different');
    }
  }

  static async estimateSwapGas(request: SwapRequest): Promise<string> {
    await simulateNetworkDelay(100, 300);
    
    const route = generateMockRoute(request.fromToken, request.toToken);
    return calculateMockGasEstimate(route.length > 2 ? 'complex' : 'simple');
  }
}
