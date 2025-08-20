import { z } from 'zod';
import { getTokenBySymbol } from '../utils/addresses';
import { env } from '../config/env';

// Define the structure of an approval request using Zod for validation
export const ApproveRequestSchema = z.object({
  token: z.string().min(1, 'Token symbol is required'),
  spender: z.string().min(1, 'Spender address is required').default(env.AUTOSWAPPR_ADDRESS),
  amountWei: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
});

export type ApproveRequest = z.infer<typeof ApproveRequestSchema>;

export class ApproveService {
  /**
   * Validates that the tokens involved in the approval are supported.
   */
  static validateApproveRequest(request: ApproveRequest): void {
    const tokenInfo = getTokenBySymbol(request.token);
    if (!tokenInfo) {
      throw new Error(`Token not supported: ${request.token}`);
    }
  }

  /**
   * Mocks the process of sending an 'approve' transaction.
   * In a real implementation, this would interact with the StarkNet blockchain.
   * @returns A mock response indicating the transaction has been submitted.
   */
  static async approveSpender(request: ApproveRequest) {
    // First, validate the request data
    this.validateApproveRequest(request);

    console.log(`[Mock Approve] Approving spender ${request.spender} to spend ${request.amountWei} wei of ${request.token}`);

    // Simulate a transaction hash being generated
    const mockTxHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // In a real implementation, you would wait for the transaction receipt here.
    // For the mock, we just return a success response immediately.
    return {
      transactionHash: mockTxHash,
      status: 'PENDING',
      message: `Approval for ${request.token} submitted successfully.`
    };
  }
}
