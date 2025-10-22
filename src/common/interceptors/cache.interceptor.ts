import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request);

    try {
      // Try to get from cache
      const cachedValue = await this.cacheManager.get(cacheKey);

      if (cachedValue !== undefined && cachedValue !== null) {
        this.logger.debug(`✅ Cache HIT: ${cacheKey}`);
        return of(cachedValue);
      }

      this.logger.debug(`❌ Cache MISS: ${cacheKey}`);
    } catch (error: any) {
      this.logger.warn(`Cache read error: ${error.message}`);
    }

    // If not in cache, execute handler and cache the result
    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.cacheManager.set(cacheKey, response, 5 * 60 * 1000); // 5 minutes
          this.logger.debug(`💾 Cached: ${cacheKey}`);
        } catch (error: any) {
          this.logger.warn(`Cache write error: ${error.message}`);
        }
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const userId = request.user?.userId || 'anonymous';
    const url = request.originalUrl || request.url;
    return `cache:${userId}:${url}`;
  }
}
