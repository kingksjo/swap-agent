import type { TokenInfo } from '../types/api';

// Known StarkNet token addresses (Sepolia testnet)
export const KNOWN_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  },
  STRK: {
    address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    symbol: 'STRK',
    name: 'StarkNet Token',
    decimals: 18,
  },
  USDC: {
    address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  USDT: {
    address: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
};

// Helper functions
export const getTokenBySymbol = (symbol: string): TokenInfo | undefined => {
  return KNOWN_TOKENS[symbol.toUpperCase()];
};

export const getTokenByAddress = (address: string): TokenInfo | undefined => {
  return Object.values(KNOWN_TOKENS).find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
};

export const isValidTokenSymbol = (symbol: string): boolean => {
  return symbol.toUpperCase() in KNOWN_TOKENS;
};

export const getAllTokens = (): TokenInfo[] => {
  return Object.values(KNOWN_TOKENS);
};

// Additional utility functions for backward compatibility
export const getSupportedTokens = (): TokenInfo[] => {
  return getAllTokens();
};
