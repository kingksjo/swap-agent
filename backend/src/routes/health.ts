import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAllTokens } from '../utils/addresses';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'ok',
      blockchain: 'ok',
      autoswap: 'mock'
    }
  });
});

// Token list endpoint
router.get('/tokens', (req: Request, res: Response) => {
  const tokens = getAllTokens();
  res.json({
    status: 'success',
    data: tokens,
    timestamp: new Date().toISOString()
  });
});

export default router;
