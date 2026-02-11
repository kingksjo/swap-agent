/**
 * Security allowlists for transaction validation
 * These lists prevent malicious contracts and addresses from being processed
 */

// Verified token addresses on Base mainnet
export const ALLOWED_TOKENS_BASE: Record<string, string> = {
  'ETH': '0x0000000000000000000000000000000000000000',
  'WETH': '0x4200000000000000000000000000000000000006',
  'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'DAI': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
};

// Verified token addresses on Base Sepolia testnet
export const ALLOWED_TOKENS_BASE_SEPOLIA: Record<string, string> = {
  'ETH': '0x0000000000000000000000000000000000000000',
  'WETH': '0x4200000000000000000000000000000000000006',
  'USDC': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
};

// Verified router/DEX contract addresses on Base mainnet
export const ALLOWED_ROUTERS_BASE: string[] = [
  '0x2626664c2603336E57B271c5C0b26F421741e481', // Uniswap V3 SwapRouter on Base
];

// Verified router/DEX contract addresses on Base Sepolia
export const ALLOWED_ROUTERS_BASE_SEPOLIA: string[] = [
  '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4', // Uniswap V3 SwapRouter on Base Sepolia
];

// Supported chains
export const ALLOWED_CHAINS = ['base', 'base_sepolia'];

/**
 * Check if a token address is in the allowlist
 */
export function isAllowedToken(address: string, chain: string = 'base'): boolean {
  const normalizedAddress = address.toLowerCase();
  
  if (chain === 'base_sepolia') {
    return Object.values(ALLOWED_TOKENS_BASE_SEPOLIA)
      .map(addr => addr.toLowerCase())
      .includes(normalizedAddress);
  }
  
  if (chain === 'base') {
    return Object.values(ALLOWED_TOKENS_BASE)
      .map(addr => addr.toLowerCase())
      .includes(normalizedAddress);
  }
  
  return false;
}

/**
 * Check if a router address is in the allowlist
 */
export function isAllowedRouter(address: string, chain: string = 'base'): boolean {
  const normalizedAddress = address.toLowerCase();
  
  if (chain === 'base_sepolia') {
    return ALLOWED_ROUTERS_BASE_SEPOLIA
      .map(addr => addr.toLowerCase())
      .includes(normalizedAddress);
  }
  
  if (chain === 'base') {
    return ALLOWED_ROUTERS_BASE
      .map(addr => addr.toLowerCase())
      .includes(normalizedAddress);
  }
  
  return false;
}

/**
 * Check if a chain is supported
 */
export function isAllowedChain(chain: string): boolean {
  return ALLOWED_CHAINS.includes(chain.toLowerCase());
}
