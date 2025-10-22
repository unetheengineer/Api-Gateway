import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CACHE_TTL_METADATA,
  CACHE_KEY_METADATA,
  NO_CACHE_METADATA,
} from '../decorators/cache.decorator';

@Injectable()
export class AdvancedCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AdvancedCacheInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Check if caching is disabled
    const noCache = this.reflector.get<boolean>(
      NO_CACHE_METADATA,
      context.getHandler(),
    );

    if (noCache || request.method !== 'GET') {
      return next.handle();
    }

    // Get custom TTL (default: 5 minutes)
    const ttl =
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ||
      5 * 60 * 1000;

    // Get custom cache key
    const customKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheKey = customKey || this.generateCacheKey(request);

    try {
      const cachedValue = await this.cacheManager.get(cacheKey);

      if (cachedValue !== undefined && cachedValue !== null) {
        this.logger.debug(`✅ Cache HIT: ${cacheKey}`);
        return of(cachedValue);
      }

      this.logger.debug(`❌ Cache MISS: ${cacheKey}`);
    } catch (error: any) {
      this.logger.warn(`Cache read error: ${error.message}`);
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.cacheManager.set(cacheKey, response, ttl);
          this.logger.debug(`💾 Cached: ${cacheKey} (TTL: ${ttl}ms)`);
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
