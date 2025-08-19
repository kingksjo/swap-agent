// Helper functions for data normalization and formatting

export const formatAmount = (amount: string | number, decimals: number = 18): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(Math.min(decimals, 8));
};

export const parseAmount = (amount: string): number => {
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid amount format');
  }
  return parsed;
};

export const generateTransactionHash = (): string => {
  return '0x' + Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

export const calculateSlippage = (inputAmount: number, outputAmount: number): string => {
  const slippage = ((inputAmount - outputAmount) / inputAmount) * 100;
  return `${slippage.toFixed(2)}%`;
};

export const estimateGas = (fromToken: string, toToken: string): string => {
  // Mock gas estimation - replace with real calculation
  const baseGas = 0.001;
  const complexity = fromToken === 'ETH' || toToken === 'ETH' ? 1 : 1.2;
  return `${(baseGas * complexity).toFixed(6)} ETH`;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40,64}$/.test(address);
};
