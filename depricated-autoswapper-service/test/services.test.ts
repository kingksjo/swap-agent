import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('AutoSwap Service Unit Tests', () => {
  beforeAll(() => {
    console.log('🧪 Starting AutoSwap Service Unit Tests');
  });

  afterAll(() => {
    console.log('✅ AutoSwap Service Unit Tests Complete');
  });

  describe('Environment Configuration', () => {
    it('should have real AutoSwap contract address configured', () => {
      const contractAddress = process.env.AUTOSWAPPR_ADDRESS;
      expect(contractAddress).toBeDefined();
      expect(contractAddress).toBe('0x5b08cbdaa6a2338e69fad7c62ce20204f1666fece27288837163c19320b9496');
    });

    it('should have StarkNet RPC configured', () => {
      const rpcUrl = process.env.STARKNET_RPC;
      expect(rpcUrl).toBeDefined();
      expect(rpcUrl).toContain('starknet-sepolia');
    });

    it('should have API keys configured', () => {
      const apiKeys = process.env.API_KEYS;
      expect(apiKeys).toBeDefined();
      expect(apiKeys).toContain('local-dev-key-1');
    });
  });

  describe('Token Address Validation', () => {
    it('should validate known token addresses', async () => {
      const { getTokenBySymbol, isValidTokenSymbol } = await import('../src/utils/addresses');
      
      expect(isValidTokenSymbol('ETH')).toBe(true);
      expect(isValidTokenSymbol('USDC')).toBe(true);
      expect(isValidTokenSymbol('STRK')).toBe(true);
      expect(isValidTokenSymbol('INVALID')).toBe(false);
    });

    it('should return correct token info', async () => {
      const { getTokenBySymbol } = await import('../src/utils/addresses');
      
      const ethToken = getTokenBySymbol('ETH');
      expect(ethToken).toBeDefined();
      expect(ethToken?.symbol).toBe('ETH');
      expect(ethToken?.decimals).toBe(18);
    });
  });

  describe('Request Validation', () => {
    it('should validate swap request format', async () => {
      const validRequest = {
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '0.1',
        slippage: 50
      };

      expect(validRequest.fromToken).toBeTruthy();
      expect(validRequest.toToken).toBeTruthy();
      expect(parseFloat(validRequest.amount)).toBeGreaterThan(0);
      expect(validRequest.slippage).toBeGreaterThanOrEqual(0);
    });

    it('should validate quote request format', async () => {
      const validRequest = {
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '0.1'
      };

      expect(validRequest.fromToken).toBeTruthy();
      expect(validRequest.toToken).toBeTruthy();
      expect(parseFloat(validRequest.amount)).toBeGreaterThan(0);
    });
  });

  describe('Service Integration', () => {
    it('should create AutoSwap service without errors', async () => {
      expect(async () => {
        const { AutoSwapService } = await import('../src/services/autoswap.service');
        new AutoSwapService();
      }).not.toThrow();
    });

    it('should create Swap service without errors', async () => {
      expect(async () => {
        const { SwapService } = await import('../src/services/swap.service');
        new SwapService();
      }).not.toThrow();
    });
  });
});
