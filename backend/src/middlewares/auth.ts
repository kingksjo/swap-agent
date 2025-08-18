import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export const authenticateApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({
      status: 'error',
      message: 'API key is required',
      code: 'MISSING_API_KEY'
    });
    return;
  }

  // Parse valid API keys from environment
  const validApiKeys = env.API_KEYS.split(',').map(key => key.trim());

  if (!validApiKeys.includes(apiKey)) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
    return;
  }

  // Store the API key in request for potential logging
  req.apiKey = apiKey;
  next();
};
