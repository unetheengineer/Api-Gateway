import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class RateLimitHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();

        // Extract rate limit headers if they exist
        const limit = response.getHeader('X-RateLimit-Limit');
        const remaining = response.getHeader('X-RateLimit-Remaining');
        const reset = response.getHeader('X-RateLimit-Reset');
        const resetMs = response.getHeader('X-RateLimit-Reset-Ms');
        const retryAfter = response.getHeader('Retry-After');

        // Ensure headers are set (for non-rate-limited requests)
        if (!limit) {
          response.setHeader('X-RateLimit-Limit', 100);
          response.setHeader('X-RateLimit-Remaining', 100);
          response.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + 60);
          response.setHeader('X-RateLimit-Reset-Ms', Date.now() + 60000);
        }

        // Ensure Retry-After is set for rate limited responses
        if (response.statusCode === 429 && !retryAfter) {
          response.setHeader('Retry-After', '60');
        }
      }),
    );
  }
}
