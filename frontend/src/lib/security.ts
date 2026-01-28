/**
 * Security allowlists for transaction validation
 * These lists prevent malicious contracts and addresses from being processed
 */

// Verified token addresses on Base network
export const ALLOWED_TOKENS_BASE: Record<string, string> = {
  'ETH': '0x0000000000000000000000000000000000000000',
  'WETH': '0x4200000000000000000000000000000000000006',
  'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'DAI': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
};

// Verified router/DEX contract addresses on Base network
export const ALLOWED_ROUTERS_BASE: string[] = [
  '0x2626664c2603336E57B271c5C0b26F421741e481', // Uniswap V3 SwapRouter on Base
];

// Supported chains
export const ALLOWED_CHAINS = ['base'];

/**
 * Check if a token address is in the allowlist
 */
export function isAllowedToken(address: string, chain: string = 'base'): boolean {
  if (chain !== 'base') return false;
  
  const normalizedAddress = address.toLowerCase();
  const allowedAddresses = Object.values(ALLOWED_TOKENS_BASE).map(addr => addr.toLowerCase());
  
  return allowedAddresses.includes(normalizedAddress);
}

/**
 * Check if a router address is in the allowlist
 */
export function isAllowedRouter(address: string, chain: string = 'base'): boolean {
  if (chain !== 'base') return false;
  
  const normalizedAddress = address.toLowerCase();
  const allowedRouters = ALLOWED_ROUTERS_BASE.map(addr => addr.toLowerCase());
  
  return allowedRouters.includes(normalizedAddress);
}

/**
 * Check if a chain is supported
 */
export function isAllowedChain(chain: string): boolean {
  return ALLOWED_CHAINS.includes(chain.toLowerCase());
}
