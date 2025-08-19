import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { SwapService } from '../services/swap.service';
import { AutoSwapService } from '../services/autoswap.service';
import type { SwapRequest, QuoteRequest, ApiResponse, SwapResponse, QuoteResponse } from '../types/api';
import { createApiError } from '../middlewares/error';

const router = Router();
const swapService = new SwapService();
const autoSwapService = new AutoSwapService();

// Validation middleware for swap requests
const validateSwapRequest = (req: Request, res: Response, next: NextFunction) => {
  const { fromToken, toToken, amount } = req.body as SwapRequest;

  if (!fromToken || !toToken || !amount) {
    const error = createApiError(
      'Missing required fields: fromToken, toToken, amount',
      400,
      'MISSING_FIELDS'
    );
    return next(error);
  }

  if (fromToken === toToken) {
    const error = createApiError(
      'Cannot swap token to itself',
      400,
      'INVALID_TOKEN_PAIR'
    );
    return next(error);
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    const error = createApiError(
      'Amount must be a positive number',
      400,
      'INVALID_AMOUNT'
    );
    return next(error);
  }

  next();
};

// Validation middleware for quote requests
const validateQuoteRequest = (req: Request, res: Response, next: NextFunction) => {
  const { fromToken, toToken, amount } = req.query;

  if (!fromToken || !toToken || !amount) {
    const error = createApiError(
      'Missing required query parameters: fromToken, toToken, amount',
      400,
      'MISSING_PARAMETERS'
    );
    return next(error);
  }

  if (fromToken === toToken) {
    const error = createApiError(
      'Cannot quote token to itself',
      400,
      'INVALID_TOKEN_PAIR'
    );
    return next(error);
  }

  const amountNum = parseFloat(amount as string);
  if (isNaN(amountNum) || amountNum <= 0) {
    const error = createApiError(
      'Amount must be a positive number',
      400,
      'INVALID_AMOUNT'
    );
    return next(error);
  }

  next();
};

// GET /api/quote - Get swap quote
router.get('/quote', validateQuoteRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromToken, toToken, amount } = req.query;
    
    const quote = await swapService.getQuote({
      fromToken: fromToken as string,
      toToken: toToken as string,
      amount: amount as string
    });
    
    const response: ApiResponse<QuoteResponse> = {
      status: 'success',
      data: quote,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/swap - Execute swap
router.post('/swap', validateSwapRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const swapRequest = req.body as SwapRequest;
    
    const result = await swapService.executeSwap(swapRequest);
    
    const response: ApiResponse<SwapResponse> = {
      status: 'success',
      data: result,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Real AutoSwap Integration Routes

// GET /api/connection-test - Test StarkNet connection
router.get('/connection-test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isConnected = await autoSwapService.checkConnection();
    
    res.json({
      status: isConnected ? 'success' : 'error',
      connected: isConnected,
      message: isConnected ? 'StarkNet connection successful' : 'Failed to connect to StarkNet',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/quote-real - Get real AutoSwap quote
router.get('/quote-real', validateQuoteRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromToken, toToken, amount } = req.query;
    
    const quote = await autoSwapService.getQuote({
      fromToken: fromToken as string,
      toToken: toToken as string,
      amount: amount as string
    });
    
    const response: ApiResponse<QuoteResponse> = {
      status: 'success',
      data: quote,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const apiError = createApiError(
      `AutoSwap quote failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      'AUTOSWAP_QUOTE_ERROR'
    );
    next(apiError);
  }
});

// POST /api/swap-real - Execute real AutoSwap
router.post('/swap-real', validateSwapRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const swapRequest = req.body as SwapRequest;
    
    const result = await autoSwapService.executeSwap(swapRequest);
    
    const response: ApiResponse<SwapResponse> = {
      status: result.status === 'success' ? 'success' : 'error',
      data: result,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    const apiError = createApiError(
      `AutoSwap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      'AUTOSWAP_EXECUTION_ERROR'
    );
    next(apiError);
  }
});

export default router;
