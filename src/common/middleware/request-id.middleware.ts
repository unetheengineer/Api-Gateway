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

    // ✅ ADD: Expose Request ID and rate limit headers for CORS
    const currentExposed = res.getHeader('Access-Control-Expose-Headers') as string;
    const exposedHeaders = [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-RateLimit-Reset-Ms',
      'Retry-After',
    ];

    if (currentExposed) {
      const existingHeaders = currentExposed.split(',').map(h => h.trim());
      const allHeaders = Array.from(new Set([...existingHeaders, ...exposedHeaders]));
      res.setHeader('Access-Control-Expose-Headers', allHeaders.join(', '));
    } else {
      res.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(', '));
    }

    next();
  }
}
