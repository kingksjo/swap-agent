import { describe, it, expect } from 'vitest';
import { validateQuoteRequest, validateSwapRequest, validateStatusRequest } from '../types/api';

describe('API Validation', () => {
  describe('Quote Request Validation', () => {
    it('should validate a correct quote request', () => {
      const validRequest = {
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '1.0'
      };
      
      expect(() => validateQuoteRequest(validRequest)).not.toThrow();
    });

    it('should reject invalid amount', () => {
      const invalidRequest = {
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: 'invalid'
      };
      
      expect(() => validateQuoteRequest(invalidRequest)).toThrow();
    });
  });

  describe('Swap Request Validation', () => {
    it('should validate a correct swap request', () => {
      const validRequest = {
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '1.0',
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        slippage: 1.0
      };
      
      expect(() => validateSwapRequest(validRequest)).not.toThrow();
    });

    it('should use default slippage', () => {
      const request = {
        fromToken: 'ETH',
        toToken: 'USDC',
        amount: '1.0',
        userAddress: '0x1234567890abcdef1234567890abcdef12345678'
      };
      
      const result = validateSwapRequest(request);
      expect(result.slippage).toBe(1.0);
    });
  });

  describe('Status Request Validation', () => {
    it('should validate a correct transaction hash', () => {
      const validRequest = {
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
      };
      
      expect(() => validateStatusRequest(validRequest)).not.toThrow();
    });

    it('should reject hash without 0x prefix', () => {
      const invalidRequest = {
        transactionHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd'
      };
      
      expect(() => validateStatusRequest(invalidRequest)).toThrow();
    });

    it('should reject hash with wrong length', () => {
      const invalidRequest = {
        transactionHash: '0xabcdef'
      };
      
      expect(() => validateStatusRequest(invalidRequest)).toThrow();
    });

    it('should reject hash with invalid characters', () => {
      const invalidRequest = {
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcg'
      };
      
      expect(() => validateStatusRequest(invalidRequest)).toThrow();
    });
  });
});
