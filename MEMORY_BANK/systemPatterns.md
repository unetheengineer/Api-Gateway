# System Patterns

## Klasör Yapısı

```
Api-Gateway/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── common/                          # Shared utilities
│   │   ├── decorators/                  # Custom decorators
│   │   │   ├── cache-ttl.decorator.ts
│   │   │   ├── cache.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/                     # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                      # Route guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── throttler-behind-proxy.guard.ts
│   │   ├── interceptors/                # Request/Response interceptors
│   │   │   ├── advanced-cache.interceptor.ts
│   │   │   ├── cache.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── metrics.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── middleware/                  # Express middleware
│   │   │   └── request-id.middleware.ts
│   │   └── services/                    # Shared services
│   │       └── circuit-breaker.service.ts
│   │
│   ├── config/                          # Configuration
│   │   ├── jwt.config.ts
│   │   └── rabbitmq.config.ts
│   │
│   ├── modules/                         # Feature modules
│   │   ├── auth/                        # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── users/                       # Users module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── health/                      # Health check module
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   │
│   │   ├── metrics/                     # Prometheus metrics module
│   │   │   ├── metrics.module.ts
│   │   │   └── metrics.providers.ts
│   │   │
│   │   └── ceche/                       # Cache module (typo: ceche)
│   │       └── cache.module.ts
│   │
│   └── types/                           # TypeScript type definitions
│       └── user.types.ts
│
├── test/                                # Test files
│   └── jest-e2e.json
│
├── dist/                                # Compiled output
├── node_modules/                        # Dependencies
├── .git/                                # Git repository
├── .cursor/                             # Cursor IDE config
├── cline/                               # Cline AI config (gitignored)
│
├── Configuration Files:
├── package.json                         # Dependencies & scripts
├── package-lock.json                    # Locked versions
├── tsconfig.json                        # TypeScript config
├── tsconfig.build.json                  # Build TypeScript config
├── nest-cli.json                        # NestJS CLI config
├── eslint.config.mjs                    # ESLint config (flat config)
├── .prettierrc                          # Prettier config
├── .gitignore                           # Git ignore rules
├── .env                                 # Environment variables (gitignored)
├── .env.development                     # Development env (gitignored)
├── README.md                            # Project documentation
└── MEMORY_BANK/                         # Memory bank documentation
```

## Mimari Desenleri

### 1. **Microservices Gateway Pattern**
- API Gateway merkezi giriş noktası
- Backend servislere proxy/routing
- Core Service URL'sine HTTP istekleri iletme

### 2. **Modular Architecture**
- Feature-based module organization
- Her modül kendi controller, service, DTO'larını içerir
- Shared utilities `common/` dizininde

### 3. **Dependency Injection (DI)**
- NestJS built-in DI container
- Constructor injection pattern
- Service providers

### 4. **Guard-Based Security**
- JWT authentication guard
- Throttler guard (rate limiting)
- Proxy-aware throttler implementation

### 5. **Interceptor Chain**
- Request/Response transformation
- Logging interceptor
- Caching interceptor
- Metrics interceptor
- Transform interceptor

### 6. **Middleware Pipeline**
- Request ID middleware (X-Request-ID header)
- Compression middleware (Gzip)
- CORS middleware

### 7. **Exception Handling**
- Global HTTP exception filter
- Centralized error responses
- Consistent error format

### 8. **Configuration Management**
- Environment-based configuration
- ConfigService for runtime config
- JWT config factory

## Ana Bileşenler ve İlişkileri

```
┌─────────────────────────────────────────────────────────┐
│                    Client Requests                       │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐      ┌────▼────┐     ┌────▼────┐
    │ CORS    │      │Compression│    │ Request │
    │Middleware│     │Middleware │    │ID Middle│
    └───┬────┘      └────┬────┘     └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Global Pipes & Validation     │
        │  (ValidationPipe, Transform)    │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Route Matching & Routing      │
        │      (NestJS Router)            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Guards (JWT, Throttler)       │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Interceptors (Pre-execution)  │
        │  Logging, Caching, Metrics      │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Controller Methods            │
        │  (auth, users, health, metrics) │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Services                      │
        │  (AuthService, UsersService)    │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   HTTP Client (Axios)           │
        │   → Core Service                │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Interceptors (Post-execution) │
        │  Response Transform, Cache      │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Exception Filter              │
        │  (Error Handling)               │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │   Response to Client            │
        │  (JSON + Headers)               │
        └────────────────────────────────┘
```

## Module Dependencies

```
AppModule
├── ConfigModule (Global)
├── ThrottlerModule (Global - Rate Limiting)
├── HttpModule (Global - Axios)
├── CacheModule
├── AuthModule
│   ├── HttpModule
│   ├── ConfigModule
│   └── JwtStrategy
├── UsersModule
│   └── HttpModule
├── HealthModule
├── MetricsModule
│   └── PrometheusModule
└── CircuitBreakerService (Global)
```

## Request Flow Örneği (Login)

```
1. POST /v1/auth/login
   ↓
2. CORS Middleware → Compression → Request ID
   ↓
3. ValidationPipe (LoginDto validation)
   ↓
4. Throttler Guard (Rate limit check)
   ↓
5. Logging Interceptor (Request log)
   ↓
6. AuthController.login()
   ↓
7. AuthService.login()
   ↓
8. HttpService.post() → Core Service
   ↓
9. Response Transform Interceptor
   ↓
10. Metrics Interceptor (Record metrics)
    ↓
11. Response to Client (200 + JWT Token)
```

## Key Architectural Decisions

- **Proxy Pattern**: Gateway tüm istekleri backend servislere proxy'ler
- **Stateless Design**: Her request bağımsız, session yok
- **Async/Await**: RxJS observables yerine async/await kullanımı
- **Global Error Handling**: Merkezi exception filter
- **Rate Limiting**: Proxy-aware throttler (X-Forwarded-For header)
- **Caching Strategy**: Decorator-based ve interceptor-based caching
- **Circuit Breaker**: Backend service failures için resilience
