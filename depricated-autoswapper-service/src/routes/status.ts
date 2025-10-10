import { Router, Request, Response, NextFunction } from 'express';
import { StatusService } from '../services/status.service';
import { validateStatusRequest } from '../types/api';
import { z } from 'zod';

const router = Router();

// GET /api/status/:transactionHash - Get transaction status
router.get('/status/:transactionHash', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionHash } = req.params;
    
    if (!transactionHash) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction hash is required',
        timestamp: new Date().toISOString(),
        code: 'MISSING_TRANSACTION_HASH'
      });
    }
    
    // Create request object for validation
    const statusRequest = { transactionHash };
    
    // Validate request data
    const validatedRequest = validateStatusRequest(statusRequest);
    
    // Additional service-level validation
    await StatusService.validateStatusRequest(validatedRequest);
    
    // Get transaction status
    const statusResponse = await StatusService.getTransactionStatus(validatedRequest);
    
    res.status(200).json(statusResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        code: 'VALIDATION_ERROR',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
});

// POST /api/status - Get transaction status (alternative POST endpoint for complex queries)
router.post('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const statusRequest = validateStatusRequest(req.body);
    
    // Additional service-level validation
    await StatusService.validateStatusRequest(statusRequest);
    
    // Get transaction status
    const statusResponse = await StatusService.getTransactionStatus(statusRequest);
    
    res.status(200).json(statusResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        code: 'VALIDATION_ERROR',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
});

// GET /api/status/:transactionHash/wait - Wait for transaction completion
router.get('/status/:transactionHash/wait', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionHash } = req.params;
    const { timeout = '300' } = req.query; // Default 5 minutes
    
    if (!transactionHash) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction hash is required',
        timestamp: new Date().toISOString(),
        code: 'MISSING_TRANSACTION_HASH'
      });
    }
    
    const timeoutMs = parseInt(timeout as string, 10) * 1000;
    if (isNaN(timeoutMs) || timeoutMs < 1000 || timeoutMs > 600000) { // 1s to 10 minutes
      return res.status(400).json({
        status: 'error',
        message: 'Timeout must be between 1 and 600 seconds',
        timestamp: new Date().toISOString(),
        code: 'INVALID_TIMEOUT'
      });
    }
    
    // Validate transaction hash format
    const statusRequest = { transactionHash };
    const validatedRequest = validateStatusRequest(statusRequest);
    await StatusService.validateStatusRequest(validatedRequest);
    
    // Wait for transaction completion
    const statusResponse = await StatusService.waitForTransaction(transactionHash, timeoutMs);
    
    res.status(200).json(statusResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        code: 'VALIDATION_ERROR',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    if ((error as Error).message === 'Transaction confirmation timeout') {
      return res.status(408).json({
        status: 'error',
        message: 'Transaction confirmation timeout',
        timestamp: new Date().toISOString(),
        code: 'TIMEOUT'
      });
    }
    
    next(error);
  }
});

// GET /api/status/transactions/all - Get all tracked transactions (debug endpoint)
router.get('/transactions/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This endpoint is primarily for debugging and monitoring
    const transactions = StatusService.getAllTransactions();
    
    res.status(200).json({
      status: 'success',
      message: 'All transactions retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        transactions,
        count: transactions.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/status/cleanup - Clean up old transactions
router.post('/cleanup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    StatusService.cleanupOldTransactions();
    
    res.status(200).json({
      status: 'success',
      message: 'Old transactions cleaned up successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
