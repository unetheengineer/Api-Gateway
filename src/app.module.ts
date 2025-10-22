import { HttpModule } from '@nestjs/axios';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { envValidationSchema } from './config/env.validation';
import { httpConfig } from './config/http.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { MetricsModule } from './modules/metrics/metrics.module';
import { metricsProviders } from './modules/metrics/metrics.providers';
import { CacheModule } from './modules/ceche/cache.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { CircuitBreakerService } from './common/sercvices/circuit-breaker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`],
      load: [jwtConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('THROTTLE_TTL') ?? 60),
          limit: Number(config.get('THROTTLE_LIMIT') ?? 100),
        },
      ],
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...httpConfig,
        baseURL: configService.get<string>('CORE_SERVICE_URL'),
      }),
      inject: [ConfigService],
    }),
    CacheModule,
    MessagingModule,
    AuthModule,
    UsersModule,
    HealthModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard, // ✅ Global rate limiting
    },
    ...metricsProviders,
    CircuitBreakerService,
  ],
  exports: [CircuitBreakerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
