// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RateLimitHeadersInterceptor } from './common/interceptors/rate-limit-headers.interceptor';
import compression = require('compression');
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  // Response Compression (Gzip)
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024,
      level: 6,
    }),
  );

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS Configuration
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000']; // Default: React/Vite dev servers

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check wildcard patterns (örn: https://*.yourdomain.com)
      const isAllowed = corsOrigins.some((allowedOrigin) => {
        if (allowedOrigin.includes('*')) {
          const regex = new RegExp(
            '^' + allowedOrigin.replace(/\*/g, '.*') + '$',
          );
          return regex.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // Origin not allowed
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    // ✅ CRITICAL: Expose these headers to frontend
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-RateLimit-Reset-Ms',
      'Retry-After',
    ],
    credentials: true, // Cookie/Session desteği
    maxAge: 3600, // Preflight cache süresi (saniye)
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('API Gateway - Clean Template')
    .setDescription(
      'Minimal API Gateway Template\n\n' +
        '## Infrastructure\n' +
        '- JWT Authentication (Mock)\n' +
        '- Rate Limiting (per-user and per-IP)\n' +
        '- Request Validation\n' +
        '- Response Compression (Gzip)\n' +
        '- Request ID Tracking (X-Request-ID)\n' +
        '- Health Checks\n' +
        '- Centralized Error Handling\n' +
        '- CORS Support\n' +
        '- Soft Delete Support\n\n' +
        '## Modules\n' +
        '- **Authentication**: User auth and JWT token management (Mock)\n' +
        '- **Todos**: Todo management with soft delete (Mock)\n\n' +
        '## Usage\n' +
        'This is a clean template API Gateway. Mock modules will be replaced with microservice calls.\n\n' +
        '## Base URL\n' +
        `- Development: http://localhost:${process.env.PORT || 3000}\n` +
        '- Production: https://api.yourdomain.com',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'User authentication and JWT token management')
    .addTag('Todos', 'Todo management with CRUD operations and soft delete')
    .addTag('Health', 'Service health checks')
    .addBearerAuth()
    .addServer(`http://localhost:${process.env.PORT || 3000}`, 'Development')
    .addServer('https://api.yourdomain.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Gateway Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new RateLimitHeadersInterceptor(),
  );

  const port = process.env.PORT || 3000;
  const env = process.env.NODE_ENV || 'development';

  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 API Gateway Started                                   ║
║  📝 Environment: ${env.padEnd(42)}║
║  🌐 Server: http://localhost:${port.toString().padEnd(32)}║
║  📚 Swagger Docs: http://localhost:${port}/api/docs${' '.repeat(18)}║
║  🛡️  Rate Limiting: ${process.env.THROTTLE_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}${' '.repeat(33)}║
${process.env.THROTTLE_ENABLED === 'true' ? `║     └─ ${process.env.THROTTLE_LIMIT || '100'} requests / ${process.env.THROTTLE_TTL || '60'}s${' '.repeat(26)}║` : ''}
║  🗜️  Compression: ENABLED (Gzip, threshold: 1KB)${' '.repeat(10)}║
║  🔖 Request ID: ENABLED (X-Request-ID header)${' '.repeat(13)}║
║  ❤️  Health Check: http://localhost:${port}/health${' '.repeat(20)}║
║  🌐 CORS Origins:${' '.repeat(40)}║
${corsOrigins.map((origin) => `║     • ${origin.padEnd(52)}║`).join('\n')}
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
