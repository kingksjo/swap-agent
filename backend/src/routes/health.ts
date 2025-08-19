import { Router, Request, Response, NextFunction } from 'express';
import { getAllTokens } from '../utils/addresses';

const router = Router();

// Health check endpoint - simple and fast
router.get('/health', (req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
    }
  };

  res.status(200).json({
    status: 'success',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    data: healthData
  });
});

// Detailed health check for monitoring systems
router.get('/health/detailed', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const checks = {
      database: 'healthy', // In a real app, check DB connection
      externalServices: 'healthy', // Check external API dependencies
      memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal < 0.9 ? 'healthy' : 'warning',
      uptime: process.uptime() > 60 ? 'healthy' : 'starting'
    };

    const overallStatus = Object.values(checks).every(status => status === 'healthy') ? 'healthy' : 'degraded';

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus === 'healthy' ? 'success' : 'error',
      message: `Service is ${overallStatus}`,
      timestamp: new Date().toISOString(),
      data: {
        overall: overallStatus,
        checks,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Readiness probe for Kubernetes
router.get('/ready', (req: Request, res: Response) => {
  // In a real app, check if all dependencies are ready
  const isReady = process.uptime() > 10; // Simple check: ready after 10 seconds

  if (isReady) {
    res.status(200).json({
      status: 'success',
      message: 'Service is ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'error',
      message: 'Service is not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe for Kubernetes
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
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
