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

## OAuth Authentication Flow

### OAuth Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │API Gateway  │    │Core Service │    │OAuth Provider│
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                   │                   │
       │ GET /auth/google │                   │                   │
       ├─────────────────>│                   │                   │
       │                  │ Forward request   │                   │
       │                  ├──────────────────>│                   │
       │                  │                   │ Generate OAuth URL│
       │                  │ OAuth URL         │<──────────────────│
       │ Redirect to URL  │<──────────────────│                   │
       │<─────────────────┤                   │                   │
       │                  │                   │                   │
       │ User authenticates                   │                   │
       ├──────────────────────────────────────────────────────────>
       │                  │                   │                   │
       │ Callback with code                   │                   │
       │<─────────────────────────────────────────────────────────┤
       │                  │                   │                   │
       │ GET /auth/google/callback?code=xxx   │                   │
       ├─────────────────>│                   │                   │
       │                  │ Forward code      │                   │
       │                  ├──────────────────>│                   │
       │                  │                   │ Exchange code     │
       │                  │                   ├──────────────────>
       │                  │                   │ User profile      │
       │                  │                   │<──────────────────│
       │                  │                   │ Create/Login user │
       │                  │                   │ Generate JWT      │
       │                  │ JWT tokens        │                   │
       │ Tokens + User    │<──────────────────│                   │
       │<─────────────────┤                   │                   │
       │                  │                   │                   │
       │                  │ Publish Events    │                   │
       │                  │ (LOGIN_SUCCESS,   │                   │
       │                  │  USER_REGISTERED) │                   │
       │                  │                   │                   │
```

### OAuth Responsibilities

**API Gateway:**
- Provide OAuth URLs (`GET /auth/google`, `GET /auth/github`)
- Handle OAuth callbacks (`GET /auth/google/callback`)
- Forward requests to Core Service
- Publish authentication events
- Trigger background jobs (welcome email)
- Error handling and user-friendly messages

**Core Service:**
- OAuth provider integration (Google/GitHub API)
- Token exchange (code → access token)
- Fetch user profile
- User creation/update (Database)
- JWT token generation
- State validation (CSRF protection)

### OAuth Event Flow
```
OAuth Success → Event: AUTH_LOGIN_SUCCESS
             → Event: USER_REGISTERED (if new user)
             → Job: EMAIL_WELCOME (background)

OAuth Error → Event: AUTH_LOGIN_FAILED
```

## Error Handling Pattern

### Standardized Error Response
```json
{
  "statusCode": 400,
  "message": ["Error message"],
  "error": "ErrorType",
  "path": "/v1/auth/login",
  "method": "POST",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "requestId": "uuid",
  "errors": [
    {
      "field": "email",
      "message": "Validation message"
    }
  ]
}
```

### Error Processing Flow
```
Request → Validation → Business Logic → Response
  ↓           ↓              ↓              ↓
Error     Error          Error          Success
  ↓           ↓              ↓              ↓
  └───────────┴──────────────┴──────────────→ GlobalExceptionFilter
                                               ↓
                                     Log + Format + Send
                                               ↓
                                     Frontend receives:
                                     {statusCode, message, error, ...}
```

### Error Types

- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Invalid/expired JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side errors
- **503 Service Unavailable**: Core Service down

## Rate Limiting Pattern

### Architecture
```
Request → ThrottlerGuard → RateLimitInterceptor → Controller
              ↓                     ↓
         Check limit          Add headers
              ↓                     ↓
         Allow/Deny          X-RateLimit-*

Response Headers
All Responses:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315200
429 Response (Rate Limited):
X-RateLimit-Remaining: 0
Retry-After: 60

Frontend Handling

const response = await fetch('/v1/auth/login');

if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  // Wait before retrying
}
```

## Key Architectural Decisions

- **Proxy Pattern**: Gateway tüm istekleri backend servislere proxy'ler
- **Stateless Design**: Her request bağımsız, session yok
- **Async/Await**: RxJS observables yerine async/await kullanımı
- **Global Error Handling**: Merkezi exception filter
- **Rate Limiting**: Proxy-aware throttler (X-Forwarded-For header)
- **Caching Strategy**: Decorator-based ve interceptor-based caching
- **Circuit Breaker**: Backend service failures için resilience
