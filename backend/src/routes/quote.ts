import { Router, Request, Response, NextFunction } from 'express';
import { QuoteService } from '../services/quote.service';
import { validateQuoteRequest } from '../types/api';
import { z } from 'zod';

const router = Router();

// GET /api/quote - Get price quote for a token swap
router.get('/quote', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const { fromToken, toToken, amount } = req.query;
    
    // Validate required parameters
    if (!fromToken || !toToken || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: fromToken, toToken, amount',
        timestamp: new Date().toISOString(),
        code: 'MISSING_PARAMETERS'
      });
    }
    
    // Create request object for validation
    const quoteRequest = {
      fromToken: fromToken as string,
      toToken: toToken as string,
      amount: amount as string
    };
    
    // Validate request data
    const validatedRequest = validateQuoteRequest(quoteRequest);
    
    // Additional service-level validation
    await QuoteService.validateQuoteRequest(validatedRequest);
    
    // Get the quote
    const quoteResponse = await QuoteService.getQuote(validatedRequest);
    
    res.status(200).json(quoteResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        timestamp: new Date().toISOString(),
        code: 'VALIDATION_ERROR',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    next(error);
  }
});

// GET /api/quote/price/:fromToken/:toToken - Get current price between two tokens
router.get('/price/:fromToken/:toToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromToken, toToken } = req.params;
    
    if (!fromToken || !toToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: fromToken, toToken',
        timestamp: new Date().toISOString(),
        code: 'MISSING_PARAMETERS'
      });
    }
    
    const price = await QuoteService.getCurrentPrice(fromToken, toToken);
    
    if (price === null) {
      return res.status(404).json({
        status: 'error',
        message: `Price not available for ${fromToken}/${toToken}`,
        timestamp: new Date().toISOString(),
        code: 'PRICE_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Current price retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        fromToken: fromToken.toUpperCase(),
        toToken: toToken.toUpperCase(),
        price: price.toString(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/quote/route/:fromToken/:toToken - Get best route between two tokens
router.get('/route/:fromToken/:toToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromToken, toToken } = req.params;
    
    if (!fromToken || !toToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: fromToken, toToken',
        timestamp: new Date().toISOString(),
        code: 'MISSING_PARAMETERS'
      });
    }
    
    const route = await QuoteService.getBestRoute(fromToken, toToken);
    
    res.status(200).json({
      status: 'success',
      message: 'Best route retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        fromToken: fromToken.toUpperCase(),
        toToken: toToken.toUpperCase(),
        route,
        hops: route.length - 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/quote/history/:fromToken/:toToken - Get price history
router.get('/history/:fromToken/:toToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromToken, toToken } = req.params;
    const { hours = '24' } = req.query;
    
    if (!fromToken || !toToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: fromToken, toToken',
        timestamp: new Date().toISOString(),
        code: 'MISSING_PARAMETERS'
      });
    }
    
    const hoursNum = parseInt(hours as string, 10);
    if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 168) { // Max 1 week
      return res.status(400).json({
        status: 'error',
        message: 'Hours parameter must be between 1 and 168',
        timestamp: new Date().toISOString(),
        code: 'INVALID_HOURS'
      });
    }
    
    const history = await QuoteService.getPriceHistory(fromToken, toToken, hoursNum);
    
    res.status(200).json({
      status: 'success',
      message: 'Price history retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        fromToken: fromToken.toUpperCase(),
        toToken: toToken.toUpperCase(),
        hours: hoursNum,
        history,
        count: history.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
