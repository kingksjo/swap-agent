import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApproveService, ApproveRequestSchema } from '../services/approve.service';

const router = Router();

// POST /approve - Submit a token approval transaction
router.post('/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body against the Zod schema
    const approveRequest = ApproveRequestSchema.parse(req.body);

    // Call the service to handle the approval logic
    const approveResponse = await ApproveService.approveSpender(approveRequest);

    res.status(200).json({
      status: 'success',
      message: approveResponse.message,
      data: {
        transactionHash: approveResponse.transactionHash,
        status: approveResponse.status,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Handle validation errors specifically for a clear 400 response
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    // Pass other errors to the global error handler
    next(error);
  }
});

export default router;
