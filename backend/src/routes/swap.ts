import { Router, Request, Response, NextFunction } from 'express';
import { SwapService } from '../services/swap.service';
import { validateSwapRequest } from '../types/api';
import { getSupportedTokens, getTokenBySymbol } from '../utils/addresses';
import { z } from 'zod';

const router = Router();

// POST /api/swap - Execute a token swap
router.post('/swap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const swapRequest = validateSwapRequest(req.body);
    
    // Additional service-level validation
    await SwapService.validateSwapRequest(swapRequest);
    
    // Execute the swap
    const swapResponse = await SwapService.executeSwap(swapRequest);
    
    res.status(200).json(swapResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        code: 'VALIDATION_ERROR',
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
});

// POST /api/swap/estimate - Get gas estimation for a swap
router.post('/swap/estimate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const swapRequest = validateSwapRequest(req.body);
    await SwapService.validateSwapRequest(swapRequest);
    
    const gasEstimate = await SwapService.estimateSwapGas(swapRequest);
    
    res.status(200).json({
      status: 'success',
      message: 'Gas estimate retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        estimatedGas: gasEstimate,
        fromToken: swapRequest.fromToken,
        toToken: swapRequest.toToken,
        amount: swapRequest.amount
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        code: 'VALIDATION_ERROR',
        details: error.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
});

// GET /api/swap/tokens - Get list of supported tokens
router.get('/tokens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = getSupportedTokens();
    
    res.status(200).json({
      status: 'success',
      message: 'Supported tokens retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        tokens,
        count: tokens.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/swap/tokens/:symbol - Get specific token information
router.get('/tokens/:symbol', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol } = req.params;
    
    const token = getTokenBySymbol(symbol);
    
    if (!token) {
      return res.status(404).json({
        status: 'error',
        message: `Token '${symbol}' not found`,
        timestamp: new Date().toISOString(),
        code: 'TOKEN_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Token information retrieved successfully',
      timestamp: new Date().toISOString(),
      data: token
    });
  } catch (error) {
    next(error);
  }
});

export default router;
