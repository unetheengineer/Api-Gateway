import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 dakika (milliseconds)
      max: 100, // Max items
    }),
  ],
})
export class CacheModule {}