import type { StatusRequest, StatusResponse } from '../types/api';
import { delay } from '../utils/normalize';

export class StatusService {
  private transactions: Map<string, StatusResponse> = new Map();

  constructor() {
    // Populate with some mock transaction data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockTxs = [
      {
        transactionHash: '0xabc123def456789012345678901234567890123456789012345678901234567890',
        status: 'success' as const,
        confirmations: 12,
        blockNumber: '0x123456',
        gasUsed: '0.0012 ETH',
        timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      },
      {
        transactionHash: '0xdef456abc789012345678901234567890123456789012345678901234567890123',
        status: 'pending' as const,
        confirmations: 2,
        timestamp: new Date(Date.now() - 60000).toISOString() // 1 minute ago
      }
    ];

    mockTxs.forEach(tx => {
      this.transactions.set(tx.transactionHash, tx);
    });
  }

  async getTransactionStatus(params: StatusRequest): Promise<StatusResponse> {
    await delay(300); // Simulate network call

    // Check if we have this transaction in our mock data
    const existingTx = this.transactions.get(params.transactionHash);
    if (existingTx) {
      return existingTx;
    }

    // For unknown transactions, simulate checking the blockchain
    if (!params.transactionHash.startsWith('0x') || params.transactionHash.length < 60) {
      throw new Error('Invalid transaction hash format');
    }

    // Mock blockchain query result
    const mockStatus = this.generateMockStatus(params.transactionHash);
    this.transactions.set(params.transactionHash, mockStatus);
    
    return mockStatus;
  }

  private generateMockStatus(txHash: string): StatusResponse {
    // Simulate different transaction states
    const randomState = Math.random();
    
    if (randomState < 0.1) {
      // 10% failed
      return {
        transactionHash: txHash,
        status: 'failed',
        confirmations: 0,
        timestamp: new Date().toISOString()
      };
    } else if (randomState < 0.3) {
      // 20% pending
      return {
        transactionHash: txHash,
        status: 'pending',
        confirmations: Math.floor(Math.random() * 5),
        timestamp: new Date().toISOString()
      };
    } else {
      // 70% success
      return {
        transactionHash: txHash,
        status: 'success',
        confirmations: 12 + Math.floor(Math.random() * 100),
        blockNumber: '0x' + Math.floor(Math.random() * 1000000).toString(16),
        gasUsed: `${(0.001 + Math.random() * 0.01).toFixed(6)} ETH`,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString() // Random time in last hour
      };
    }
  }

  // Helper method to add transactions (for testing)
  addTransaction(tx: StatusResponse) {
    this.transactions.set(tx.transactionHash, tx);
  }

  // Static methods for backward compatibility
  static async validateStatusRequest(params: StatusRequest): Promise<void> {
    if (!params.transactionHash || params.transactionHash.length < 10) {
      throw new Error('Invalid transaction hash');
    }
  }

  static async getTransactionStatus(params: StatusRequest): Promise<StatusResponse> {
    const service = new StatusService();
    return await service.getTransactionStatus(params);
  }
}
