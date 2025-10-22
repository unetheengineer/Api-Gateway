import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Check if request already has an ID (from client or load balancer)
    const existingRequestId = req.headers['x-request-id'] as string;
    
    // Generate new ID if not exists
    const requestId = existingRequestId || uuidv4();
    
    // Attach to request object
    req.id = requestId;
    
    // Set response header
    res.setHeader('X-Request-ID', requestId);
    
    // Optional: Log request ID for debugging
    // this.logger.debug(`Request ID: ${requestId} - ${req.method} ${req.originalUrl}`);
    
    next();
  }
}