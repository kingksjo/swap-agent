import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { StatusService } from '../services/status.service';
import type { StatusRequest, ApiResponse, StatusResponse } from '../types/api';
import { createApiError } from '../middlewares/error';

const router = Router();
const statusService = new StatusService();

// Validation middleware for status requests
const validateStatusRequest = (req: Request, res: Response, next: NextFunction) => {
  const { transactionHash } = req.params;

  if (!transactionHash) {
    const error = createApiError(
      'Transaction hash is required',
      400,
      'MISSING_TRANSACTION_HASH'
    );
    return next(error);
  }

  if (!transactionHash.startsWith('0x') || transactionHash.length < 60) {
    const error = createApiError(
      'Invalid transaction hash format',
      400,
      'INVALID_TRANSACTION_HASH'
    );
    return next(error);
  }

  next();
};

// GET /api/status/:transactionHash - Get transaction status
router.get('/status/:transactionHash', validateStatusRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionHash } = req.params;
    
    const status = await statusService.getTransactionStatus({ transactionHash });
    
    const response: ApiResponse<StatusResponse> = {
      status: 'success',
      data: status,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
