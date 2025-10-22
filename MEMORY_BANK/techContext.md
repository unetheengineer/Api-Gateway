# Tech Context

## Tespit Edilen Teknolojiler (package.json)

### Core Framework
- **@nestjs/core**: 11.0.1 - NestJS çekirdek kütüphanesi
- **@nestjs/common**: 11.0.1 - Ortak NestJS modülleri
- **@nestjs/platform-express**: 11.0.1 - Express entegrasyonu

### Authentication & Security
- **@nestjs/jwt**: 11.0.1 - JWT token yönetimi
- **@nestjs/passport**: 11.0.5 - Passport.js entegrasyonu
- **passport**: 0.7.0 - Kimlik doğrulama middleware
- **passport-jwt**: 4.0.1 - JWT stratejisi

### HTTP & Networking
- **@nestjs/axios**: 4.0.1 - Axios HTTP client wrapper
- **axios**: 1.12.2 - HTTP istek kütüphanesi
- **compression**: 1.8.1 - Gzip sıkıştırma middleware

### Configuration & Environment
- **@nestjs/config**: 4.0.2 - Ortam değişkenleri yönetimi
- **class-validator**: 0.14.2 - DTO validasyonu
- **class-transformer**: 0.5.1 - Veri transformasyonu

### Caching & Performance
- **@nestjs/cache-manager**: 3.0.1 - Cache yönetimi
- **cache-manager**: 7.2.4 - Cache provider

### Rate Limiting & Circuit Breaking
- **@nestjs/throttler**: 6.2.1 - Rate limiting
- **opossum**: 9.0.0 - Circuit breaker pattern

### Monitoring & Metrics
- **@willsoto/nestjs-prometheus**: 6.0.2 - Prometheus metrikleri
- **@nestjs/microservices**: 11.1.6 - Microservices desteği

### Message Queue (Hazırlanmış)
- **amqplib**: 0.10.9 - RabbitMQ client
- **amqp-connection-manager**: 5.0.0 - RabbitMQ connection management

### API Documentation
- **@nestjs/swagger**: 11.2.1 - Swagger/OpenAPI
- **swagger-ui-express**: 5.0.1 - Swagger UI

### Utilities
- **uuid**: 13.0.0 - UUID generation
- **reflect-metadata**: 0.2.2 - Metadata reflection
- **rxjs**: 7.8.1 - Reactive programming

## Development Dependencies

### Build & Compilation
- **typescript**: 5.7.3 - TypeScript compiler
- **ts-loader**: 9.5.2 - TypeScript webpack loader
- **ts-node**: 10.9.2 - TypeScript Node.js runner
- **@nestjs/cli**: 11.0.0 - NestJS CLI tools
- **@nestjs/schematics**: 11.0.0 - NestJS code generators

### Testing
- **jest**: 30.0.0 - Test framework
- **@nestjs/testing**: 11.0.1 - NestJS testing utilities
- **ts-jest**: 29.2.5 - Jest TypeScript support
- **supertest**: 7.0.0 - HTTP assertion library
- **@types/jest**: 30.0.0 - Jest type definitions

### Linting & Formatting
- **eslint**: 9.18.0 - Code linter
- **prettier**: 3.4.2 - Code formatter
- **eslint-config-prettier**: 10.0.1 - ESLint Prettier config
- **eslint-plugin-prettier**: 5.2.2 - ESLint Prettier plugin
- **typescript-eslint**: 8.20.0 - TypeScript ESLint support

### Type Definitions
- **@types/node**: 22.10.7 - Node.js types
- **@types/express**: 5.0.0 - Express types
- **@types/compression**: 1.7.5 - Compression types
- **@types/opossum**: 8.1.9 - Opossum types
- **@types/uuid**: 10.0.0 - UUID types
- **@types/supertest**: 6.0.2 - Supertest types

### Utilities
- **source-map-support**: 0.5.21 - Source map support
- **tsconfig-paths**: 4.2.0 - TypeScript path mapping
- **globals**: 16.0.0 - Global types
- **@eslint/eslintrc**: 3.2.0 - ESLint config
- **@eslint/js**: 9.18.0 - ESLint JavaScript

## Geliştirme Ortamı Gereksinimleri

### Node.js & npm
- Node.js: v22.10.7+ (type definitions)
- npm: Latest (package-lock.json mevcut)

### Build & Run Scripts
```bash
npm run build          # Üretim build
npm run start          # Üretim modunda başlat
npm run start:dev      # Development modunda başlat (watch mode)
npm run start:test     # Test modunda başlat
npm run start:debug    # Debug modunda başlat
npm run cleanup        # Port temizleme (Linux/Mac)
npm run cleanup:win    # Port temizleme (Windows)
```

### Testing
```bash
npm run test           # Unit testler
npm run test:watch    # Watch modunda testler
npm run test:cov      # Coverage raporu
npm run test:e2e      # E2E testler
```

### Code Quality
```bash
npm run lint          # ESLint çalıştır ve düzelt
npm run format        # Prettier ile format
```

## Konfigürasyon Dosyaları

### TypeScript
- **tsconfig.json**: Ana TypeScript konfigürasyonu
- **tsconfig.build.json**: Build için TypeScript konfigürasyonu

### NestJS
- **nest-cli.json**: NestJS CLI konfigürasyonu

### Code Quality
- **.prettierrc**: Prettier konfigürasyonu
- **eslint.config.mjs**: ESLint konfigürasyonu (ESLint 9 flat config)

### Jest
- **jest.config** (package.json içinde): 
  - rootDir: src
  - testRegex: *.spec.ts
  - testEnvironment: node
  - Coverage directory: ../coverage

## Environment Variables (Örnek)
```
NODE_ENV=development
PORT=3000
CORE_SERVICE_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
THROTTLE_ENABLED=true
THROTTLE_LIMIT=100
THROTTLE_TTL=60
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600
```
