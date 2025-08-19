import { StatusRequest, StatusResponse } from '../types/api';
import {
  getRandomTransactionStatus,
  generateMockBlockNumber,
  generateMockConfirmations,
  generateMockGasUsed,
  generateMockGasPrice,
  simulateNetworkDelay,
  getRandomErrorMessage
} from '../utils/mockHelpers';

// In-memory storage for mock transaction statuses
// In a real app, this would be a database or external service
const transactionStore = new Map<string, {
  status: 'pending' | 'completed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
  error?: string;
  createdAt: Date;
}>();

export class StatusService {
  static async getTransactionStatus(request: StatusRequest): Promise<StatusResponse> {
    // Simulate network delay for blockchain query
    await simulateNetworkDelay(300, 800);

    const { transactionHash } = request;

    // Check if we have this transaction in our store
    let txData = transactionStore.get(transactionHash);

    if (!txData) {
      // For unknown transactions, randomly decide if it exists or not
      if (Math.random() < 0.2) { // 20% chance of not found
        return {
          status: 'success',
          message: 'Transaction status retrieved',
          timestamp: new Date().toISOString(),
          data: {
            transactionHash,
            status: 'not_found'
          }
        };
      }

      // Create new transaction entry
      txData = {
        status: getRandomTransactionStatus(),
        createdAt: new Date()
      };

      // Add details based on status
      if (txData.status === 'completed') {
        txData.blockNumber = generateMockBlockNumber();
        txData.confirmations = generateMockConfirmations();
        txData.gasUsed = generateMockGasUsed();
        txData.effectiveGasPrice = generateMockGasPrice();
      } else if (txData.status === 'failed') {
        txData.error = getRandomErrorMessage();
        txData.blockNumber = generateMockBlockNumber();
        txData.gasUsed = generateMockGasUsed();
        txData.effectiveGasPrice = generateMockGasPrice();
      }

      transactionStore.set(transactionHash, txData);
    } else {
      // Update pending transactions (simulate progression)
      if (txData.status === 'pending') {
        const timeSinceCreation = Date.now() - txData.createdAt.getTime();
        
        // After 2 minutes, 70% chance to complete, 10% to fail
        if (timeSinceCreation > 2 * 60 * 1000) {
          const random = Math.random();
          if (random < 0.7) {
            txData.status = 'completed';
            txData.blockNumber = generateMockBlockNumber();
            txData.confirmations = generateMockConfirmations();
            txData.gasUsed = generateMockGasUsed();
            txData.effectiveGasPrice = generateMockGasPrice();
          } else if (random < 0.8) {
            txData.status = 'failed';
            txData.error = getRandomErrorMessage();
            txData.blockNumber = generateMockBlockNumber();
            txData.gasUsed = generateMockGasUsed();
            txData.effectiveGasPrice = generateMockGasPrice();
          }
          // 20% chance to remain pending
        }
      }

      // Update confirmations for completed transactions
      if (txData.status === 'completed' && txData.confirmations) {
        txData.confirmations = Math.min(txData.confirmations + 1, 64);
      }
    }

    // Build response data
    const responseData: StatusResponse['data'] = {
      transactionHash,
      status: txData.status
    };

    if (txData.blockNumber) responseData.blockNumber = txData.blockNumber;
    if (txData.confirmations) responseData.confirmations = txData.confirmations;
    if (txData.gasUsed) responseData.gasUsed = txData.gasUsed;
    if (txData.effectiveGasPrice) responseData.effectiveGasPrice = txData.effectiveGasPrice;
    if (txData.error) responseData.error = txData.error;

    return {
      status: 'success',
      message: 'Transaction status retrieved successfully',
      timestamp: new Date().toISOString(),
      data: responseData
    };
  }

  static async validateStatusRequest(request: StatusRequest): Promise<void> {
    // Validation is now handled by Zod schema in types/api.ts
    // This method is kept for any additional business logic validation if needed
    // Currently, no additional validation is required
  }

  // Utility method to simulate creating a transaction in the store
  static createMockTransaction(transactionHash: string): void {
    transactionStore.set(transactionHash, {
      status: 'pending',
      createdAt: new Date()
    });
  }

  // Utility method to get all transactions (for debugging)
  static getAllTransactions(): Array<{ hash: string; data: any }> {
    return Array.from(transactionStore.entries()).map(([hash, data]) => ({
      hash,
      data
    }));
  }

  // Utility method to clear old transactions (cleanup)
  static cleanupOldTransactions(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [hash, data] of transactionStore.entries()) {
      if (now - data.createdAt.getTime() > maxAge) {
        transactionStore.delete(hash);
      }
    }
  }

  static async waitForTransaction(
    transactionHash: string, 
    maxWaitTime: number = 300000 // 5 minutes
  ): Promise<StatusResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getTransactionStatus({ transactionHash });
      
      if (status.data.status !== 'pending') {
        return status;
      }
      
      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Transaction confirmation timeout');
  }
}
