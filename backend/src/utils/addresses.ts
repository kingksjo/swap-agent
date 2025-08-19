import { TokenInfo } from '../types/api';

// Starknet Mainnet Token Addresses
export const STARKNET_TOKENS: Record<string, TokenInfo> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    decimals: 18,
    logoUrl: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    decimals: 6,
    logoUrl: 'https://centre.io/images/usdc/usdc-icon-86074d9d49.png'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    decimals: 6,
    logoUrl: 'https://tether.to/images/logomark.png'
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3',
    decimals: 18,
    logoUrl: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
    decimals: 8,
    logoUrl: 'https://wrapped.com/assets/images/wbtc.png'
  },
  STRK: {
    symbol: 'STRK',
    name: 'Starknet Token',
    address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    decimals: 18,
    logoUrl: 'https://starknet.io/wp-content/uploads/2021/01/StarkNet-Icon.png'
  }
};

// Mock exchange rates (in production, these would come from price feeds)
export const MOCK_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  ETH: {
    USDC: 3200.50,
    USDT: 3198.75,
    DAI: 3201.25,
    WBTC: 0.053,
    STRK: 1850.0
  },
  USDC: {
    ETH: 0.0003125,
    USDT: 0.999,
    DAI: 1.001,
    WBTC: 0.0000165,
    STRK: 0.578
  },
  USDT: {
    ETH: 0.0003127,
    USDC: 1.001,
    DAI: 1.002,
    WBTC: 0.0000166,
    STRK: 0.579
  },
  DAI: {
    ETH: 0.0003123,
    USDC: 0.999,
    USDT: 0.998,
    WBTC: 0.0000164,
    STRK: 0.577
  },
  WBTC: {
    ETH: 18.87,
    USDC: 60420.30,
    USDT: 60380.15,
    DAI: 60450.75,
    STRK: 34890.0
  },
  STRK: {
    ETH: 0.00054,
    USDC: 1.73,
    USDT: 1.727,
    DAI: 1.733,
    WBTC: 0.0000287
  }
};

// Helper functions
export const getTokenBySymbol = (symbol: string): TokenInfo | undefined => {
  return STARKNET_TOKENS[symbol.toUpperCase()];
};

export const getTokenByAddress = (address: string): TokenInfo | undefined => {
  return Object.values(STARKNET_TOKENS).find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
};

export const getSupportedTokens = (): TokenInfo[] => {
  return Object.values(STARKNET_TOKENS);
};

export const isValidTokenSymbol = (symbol: string): boolean => {
  return symbol.toUpperCase() in STARKNET_TOKENS;
};

export const isValidTokenAddress = (address: string): boolean => {
  return Object.values(STARKNET_TOKENS).some(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
};

export const getExchangeRate = (fromToken: string, toToken: string): number | null => {
  const fromSymbol = fromToken.toUpperCase();
  const toSymbol = toToken.toUpperCase();
  
  if (fromSymbol === toSymbol) return 1;
  
  return MOCK_EXCHANGE_RATES[fromSymbol]?.[toSymbol] || null;
};

export const formatTokenAmount = (amount: string, decimals: number): string => {
  const num = parseFloat(amount);
  return num.toFixed(Math.min(decimals, 8));
};

export const calculateOutputAmount = (
  inputAmount: string,
  fromToken: string,
  toToken: string,
  slippage: number = 1.0
): string | null => {
  const rate = getExchangeRate(fromToken, toToken);
  if (!rate) return null;
  
  const input = parseFloat(inputAmount);
  const output = input * rate;
  
  // Apply slippage (reduce output by slippage percentage)
  const outputWithSlippage = output * (1 - slippage / 100);
  
  return outputWithSlippage.toString();
};
