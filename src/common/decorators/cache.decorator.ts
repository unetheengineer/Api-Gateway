import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_METADATA = 'cache_ttl';
export const CACHE_KEY_METADATA = 'cache_key';
export const NO_CACHE_METADATA = 'no_cache';

/**
 * Set custom TTL for cache (in milliseconds)
 * @param ttl Time to live in milliseconds
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

/**
 * Set custom cache key
 * @param key Custom cache key
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

/**
 * Disable caching for this endpoint
 */
export const NoCache = () => SetMetadata(NO_CACHE_METADATA, true);
