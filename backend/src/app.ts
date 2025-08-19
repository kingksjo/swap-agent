import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/error';
import { authenticateApiKey } from './middlewares/auth';
import healthRoutes from './routes/health';
import swapRoutes from './routes/swap';
import statusRoutes from './routes/status';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:5173'] // Frontend URL
    : true, // Allow all origins in development
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoints (no auth required)
app.use('/', healthRoutes);

// API routes with authentication
app.use('/api', authenticateApiKey);
app.use('/api', swapRoutes);
app.use('/api', statusRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
