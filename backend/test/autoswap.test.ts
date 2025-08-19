import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('AutoSwap Integration Tests', () => {
  const API_KEY = 'local-dev-key-1';
  const baseURL = '/api';

  beforeAll(async () => {
    // Setup test environment
    console.log('🧪 Starting AutoSwap Integration Tests');
  });

  afterAll(async () => {
    console.log('✅ AutoSwap Integration Tests Complete');
  });

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app)
        .get(`${baseURL}/connection-test`)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('MISSING_API_KEY');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .get(`${baseURL}/connection-test`)
        .set('x-api-key', 'invalid-key')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('INVALID_API_KEY');
    });
  });

  describe('StarkNet Connection', () => {
    it('should test StarkNet connection', async () => {
      const response = await request(app)
        .get(`${baseURL}/connection-test`)
        .set('x-api-key', API_KEY)
        .expect(200);

      expect(response.body).toHaveProperty('connected');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('AutoSwap Quote Tests', () => {
    it('should get quote for ETH to USDC', async () => {
      const response = await request(app)
        .get(`${baseURL}/quote-real`)
        .query({
          fromToken: 'ETH',
          toToken: 'USDC',
          amount: '0.1'
        })
        .set('x-api-key', API_KEY)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('estimatedOutput');
      expect(response.body.data).toHaveProperty('priceImpact');
      expect(response.body.data.fromToken).toBe('ETH');
      expect(response.body.data.toToken).toBe('USDC');
    });

    it('should validate quote request parameters', async () => {
      const response = await request(app)
        .get(`${baseURL}/quote-real`)
        .query({
          fromToken: 'ETH',
          // Missing toToken and amount
        })
        .set('x-api-key', API_KEY)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('MISSING_PARAMETERS');
    });

    it('should reject invalid token pairs', async () => {
      const response = await request(app)
        .get(`${baseURL}/quote-real`)
        .query({
          fromToken: 'ETH',
          toToken: 'ETH', // Same token
          amount: '0.1'
        })
        .set('x-api-key', API_KEY)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('INVALID_TOKEN_PAIR');
    });

    it('should reject invalid amounts', async () => {
      const response = await request(app)
        .get(`${baseURL}/quote-real`)
        .query({
          fromToken: 'ETH',
          toToken: 'USDC',
          amount: '0' // Invalid amount
        })
        .set('x-api-key', API_KEY)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('INVALID_AMOUNT');
    });
  });

  describe('AutoSwap Execution Tests', () => {
    it('should handle swap execution with real contract', async () => {
      const response = await request(app)
        .post(`${baseURL}/swap-real`)
        .send({
          fromToken: 'ETH',
          toToken: 'USDC',
          amount: '0.01',
          slippage: 50
        })
        .set('x-api-key', API_KEY)
        .set('Content-Type', 'application/json');

      // Should get either success or informative error about wallet setup
      expect(response.status).toBeOneOf([200, 500]);
      
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data).toHaveProperty('fromToken', 'ETH');
        expect(response.body.data).toHaveProperty('toToken', 'USDC');
      } else {
        // Should get informative error about wallet configuration
        expect(response.body.message).toContain('SERVER_ACCOUNT_ADDRESS');
      }
    });

    it('should validate swap request payload', async () => {
      const response = await request(app)
        .post(`${baseURL}/swap-real`)
        .send({
          fromToken: 'ETH',
          // Missing required fields
        })
        .set('x-api-key', API_KEY)
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('MISSING_FIELDS');
    });
  });

  describe('Contract Address Detection', () => {
    it('should detect real AutoSwap contract address', async () => {
      const response = await request(app)
        .get(`${baseURL}/quote-real`)
        .query({
          fromToken: 'ETH',
          toToken: 'USDC',
          amount: '0.1'
        })
        .set('x-api-key', API_KEY);

      // Should not get mock address error
      expect(response.body.message).not.toContain('mock address');
    });
  });

  describe('Mock vs Real Service Comparison', () => {
    it('should compare mock and real service responses', async () => {
      // Test mock service
      const mockResponse = await request(app)
        .get(`${baseURL}/quote`)
        .query({
          fromToken: 'ETH',
          toToken: 'USDC',
          amount: '0.1'
        })
        .set('x-api-key', API_KEY)
        .expect(200);

      // Test real service
      const realResponse = await request(app)
        .get(`${baseURL}/quote-real`)
        .query({
          fromToken: 'ETH',
          toToken: 'USDC',
          amount: '0.1'
        })
        .set('x-api-key', API_KEY)
        .expect(200);

      // Both should have required fields
      expect(mockResponse.body.data).toHaveProperty('estimatedOutput');
      expect(realResponse.body.data).toHaveProperty('estimatedOutput');
      
      // Real service should have more realistic values
      expect(parseFloat(realResponse.body.data.estimatedOutput)).toBeGreaterThan(0);
    });
  });
});
