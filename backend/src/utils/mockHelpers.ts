// Mock data generation utilities

export const generateMockTransactionHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const generateMockRoute = (fromToken: string, toToken: string): string[] => {
  // Simple mock: direct route or through a common token
  const commonTokens = ['ETH', 'USDC'];
  
  if (fromToken === toToken) {
    return [fromToken];
  }
  
  // Direct route 70% of the time
  if (Math.random() < 0.7) {
    return [fromToken, toToken];
  }
  
  // Route through a common token
  const intermediateToken = commonTokens.find(token => 
    token !== fromToken && token !== toToken
  ) || 'ETH';
  
  return [fromToken, intermediateToken, toToken];
};

export const calculateMockGasEstimate = (complexity: 'simple' | 'complex' = 'simple'): string => {
  const baseGas = complexity === 'simple' ? 21000 : 150000;
  const variation = Math.random() * 0.2 - 0.1; // ±10% variation
  const gasEstimate = Math.floor(baseGas * (1 + variation));
  return gasEstimate.toString();
};

export const calculateMockPriceImpact = (amount: string): string => {
  const numAmount = parseFloat(amount);
  
  // Larger amounts have higher price impact
  let impact: number;
  if (numAmount < 1000) {
    impact = Math.random() * 0.1; // 0-0.1%
  } else if (numAmount < 10000) {
    impact = 0.1 + Math.random() * 0.4; // 0.1-0.5%
  } else {
    impact = 0.5 + Math.random() * 1.5; // 0.5-2%
  }
  
  return impact.toFixed(2);
};

export const generateMockDeadline = (minutesFromNow: number = 30): string => {
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + minutesFromNow);
  return deadline.toISOString();
};

export const generateMockValidUntil = (minutesFromNow: number = 5): string => {
  return generateMockDeadline(minutesFromNow);
};

export const getRandomTransactionStatus = (): 'pending' | 'completed' | 'failed' => {
  const statuses = ['pending', 'completed', 'failed'] as const;
  const weights = [0.2, 0.7, 0.1]; // 20% pending, 70% completed, 10% failed
  
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < statuses.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return statuses[i];
    }
  }
  
  return 'completed';
};

export const generateMockBlockNumber = (): number => {
  // Mock block number (realistic for Starknet)
  return Math.floor(Math.random() * 1000000) + 500000;
};

export const generateMockConfirmations = (): number => {
  return Math.floor(Math.random() * 50) + 1;
};

export const generateMockGasUsed = (): string => {
  const gasUsed = Math.floor(Math.random() * 100000) + 20000;
  return gasUsed.toString();
};

export const generateMockGasPrice = (): string => {
  // Mock gas price in wei (realistic range)
  const gasPrice = Math.floor(Math.random() * 50000000000) + 10000000000;
  return gasPrice.toString();
};

export const simulateNetworkDelay = async (minMs: number = 100, maxMs: number = 500): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock error messages
export const MOCK_ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient balance for swap',
  INVALID_PAIR: 'Trading pair not supported',
  SLIPPAGE_TOO_HIGH: 'Price changed too much, increase slippage tolerance',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_AMOUNT: 'Invalid amount specified',
  TOKEN_NOT_FOUND: 'Token not found or not supported',
} as const;

export const getRandomErrorMessage = (): string => {
  const messages = Object.values(MOCK_ERROR_MESSAGES);
  return messages[Math.floor(Math.random() * messages.length)];
};
