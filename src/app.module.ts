import { HttpModule } from '@nestjs/axios';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { httpConfig } from './config/http.config';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { AuthModule } from './modules/auth/auth.module';
import { TodosModule } from './modules/todos/todos.module';
import { PomodoroModule } from './modules/pomodoro/pomodoro.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';

@Module({
  imports: [
    // ✅ KEEP: Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, `.env`],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),

    // ✅ KEEP: Rate Limiting
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

    // ✅ KEEP: HTTP Client for proxying
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...httpConfig,
        baseURL: configService.get<string>('CORE_SERVICE_URL'),
      }),
      inject: [ConfigService],
    }),

    // ✅ KEEP: Health Check
    HealthModule,

    // ✅ KEEP: Messaging/RabbitMQ (for template use)
    MessagingModule,

    // ✅ KEEP: Authentication (JWT)
    AuthModule,

    // ✅ KEEP: Todos Module (Mock - will be microservice)
    TodosModule,

    // ✅ KEEP: Pomodoro Module (Mock - will be microservice)
    PomodoroModule,

    // ✅ KEEP: Calendar Module (Mock - will be microservice)
    CalendarModule,

    // ❌ REMOVED:
    // - UsersModule
    // - MetricsModule
    // - CacheModule
  ],
  providers: [
    // ✅ KEEP: Global Rate Limiting Guard (IP-based for public routes)
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
