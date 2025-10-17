# API Gateway Project - Cline Memorybank

## Project Overview
Microservices architecture with hybrid communication pattern:
- **Synchronous**: Frontend ↔ API Gateway (REST/HTTP)
- **Asynchronous**: API Gateway ↔ Microservices (RabbitMQ)

## Current State

### Existing Services
1. **Core Service** (Already Implemented)
   - Technology: NestJS 11 + TypeScript + TypeORM
   - Database: MySQL/MariaDB (Docker: mariadb:10.11)
   - Status: ✅ Production Ready
   - Location: Separate repository (core-auth-service)
   - Port: 3001 (assumed)

### Services to Build
1. **API Gateway** (Current Focus - Faz 1)
   - Technology: NestJS 11 + TypeScript
   - Port: 3000
   - Status: 🚧 To Be Implemented

2. **Additional Microservices** (Future)
   - Currently: Only User/Auth domain
   - Planned: TBD based on business needs

---

## Core Service Architecture (Reference)

### Technology Stack
- **Framework**: NestJS 11
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: MySQL/MariaDB
- **Auth**: Passport + JWT + OAuth
- **API Docs**: Swagger
- **Container**: Docker (docker-compose.yml)

### Authentication System

#### JWT Configuration
- **Access Token**:
  - Not stored in database
  - Payload: `{ sub: userId, email: string, iat, exp }`
  - Short-lived (typically 15m)
  
- **Refresh Token**:
  - Stored hashed in database (`token` table)
  - Longer expiration
  - Different secret from access token
  - Fields: `id, hashedToken, userId, expiresAt, revoked, createdAt`

#### Token Management Flow
1. Login → Generate access + refresh tokens
2. Access token sent to client (not stored)
3. Refresh token hashed and saved to DB
4. Token refresh: validate hash in DB → issue new tokens
5. Logout: revoke refresh token in DB

#### Key Files (Core Service)
```
src/
├── modules/auth/
│   ├── auth.service.ts       # Token generation/validation logic
│   ├── jwt.service.ts        # JWT wrapper
│   ├── jwt.strategy.ts       # Passport JWT strategy
│   └── auth.controller.ts    # Login/register/refresh endpoints
├── entities/
│   ├── user.entity.ts        # User model
│   └── token.entity.ts       # Refresh token model
```

### User Entity Structure
```typescript
User {
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Authorization
- **Current State**: No role/permission system
- **Guards**: Only user authentication (JwtAuthGuard)
- **Strategy**: JWT validation only, no RBAC

### RabbitMQ Status (Core Service)
- ❌ Not currently integrated
- No `@nestjs/microservices` dependency
- No message handlers/consumers
- Will be added in **Faz 2**

---

## API Gateway Architecture Decisions

### Critical Decisions Made

#### Decision A: Token Validation Strategy
**✅ SELECTED: JWT Secret Sharing**
- API Gateway and Core Service share the same JWT_SECRET
- Gateway validates tokens independently (no DB/network call)
- **Rationale**: Best performance, lowest latency
- **Trade-off**: Secret must be kept in sync across services

**Rejected Alternatives:**
- ❌ HTTP call to Core for validation (high latency)
- ❌ RabbitMQ RPC for validation (unnecessary complexity)

#### Decision B: Initial Scope
**✅ SELECTED: User Service Only**
- Focus on User CRUD operations first
- Establish patterns before scaling
- Other microservices: Future implementation

#### Decision C: Communication Pattern
**✅ SELECTED: Event-Driven (Fire & Forget)**
- Frontend → API Gateway: Synchronous (immediate response: "Request received")
- API Gateway → Microservices: Asynchronous (RabbitMQ)
- Result notification: WebSocket/Polling (future implementation)

**Pattern:**
```
Client Request → Gateway (202 Accepted) → RabbitMQ → Microservice
                    ↓
              Track request ID
                    ↓
        Client polls/subscribes for result
```

#### Decision D: Implementation Order
**✅ SELECTED: Gateway First, RabbitMQ Later**
1. **Faz 1**: Build API Gateway with HTTP proxy (temporary)
2. **Faz 2**: Add RabbitMQ to both Gateway and Core
3. **Faz 3**: Replace HTTP proxy with RabbitMQ client

**Rationale**: Incremental development, test Gateway structure before adding message complexity

---

## Implementation Plan

### Faz 1: API Gateway Base Setup (CURRENT)

#### Objectives
- [x] Setup NestJS project structure
- [ ] Configure JWT validation (shared secret)
- [ ] Implement Auth proxy endpoints (login/register)
- [ ] Implement Users proxy endpoints (CRUD)
- [ ] Add Swagger documentation
- [ ] Setup logging & error handling

#### Dependencies
```json
{
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "passport": "^0.7.x",
  "passport-jwt": "^4.x",
  "@nestjs/config": "^3.x",
  "@nestjs/axios": "^3.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "@nestjs/swagger": "^7.x"
}
```

#### Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# JWT (MUST MATCH CORE SERVICE)
JWT_SECRET=<COPY_FROM_CORE_SERVICE>
JWT_EXPIRES_IN=15m

# Core Service
CORE_SERVICE_URL=http://localhost:3001

# RabbitMQ (commented out for Faz 1)
# RABBITMQ_URL=amqp://guest:guest@localhost:5672
# RABBITMQ_QUEUE_USER=user_queue
```

#### Project Structure
```
api-gateway/
├── src/
│   ├── main.ts                          # Bootstrap
│   ├── app.module.ts                    # Root module
│   ├── config/
│   │   ├── jwt.config.ts                # JWT configuration
│   │   └── rabbitmq.config.ts           # (Faz 2)
│   ├── common/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts        # JWT validation guard
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts       # Proxy: login, register, refresh
│   │   │   ├── jwt.strategy.ts          # Token validation strategy
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   └── users/
│   │       ├── users.module.ts
│   │       ├── users.controller.ts      # Proxy: GET/PUT/DELETE /users
│   │       ├── users.service.ts         # HTTP client (temp) → RabbitMQ (Faz 2)
│   │       └── dto/
│   │           └── update-user.dto.ts
│   └── types/
│       └── user.interface.ts
├── .env
├── .env.example
├── docker-compose.yml                   # (Faz 2: RabbitMQ)
├── package.json
├── tsconfig.json
└── README.md
```

#### Key Components

**JWT Strategy** (Token Validation)
```typescript
// src/modules/auth/jwt.strategy.ts
// Purpose: Validate JWT tokens without DB lookup
// Input: Bearer token from Authorization header
// Output: { userId: string, email: string }
// Important: Uses SAME secret as Core Service
```

**JWT Auth Guard**
```typescript
// src/common/guards/jwt-auth.guard.ts
// Purpose: Protect routes requiring authentication
// Usage: @UseGuards(JwtAuthGuard)
```

**Auth Controller** (Proxy)
```typescript
// src/modules/auth/auth.controller.ts
// Endpoints:
//   POST /auth/login      → Core Service HTTP
//   POST /auth/register   → Core Service HTTP
//   POST /auth/refresh    → Core Service HTTP
// Faz 2: Replace HTTP with RabbitMQ
```

**Users Controller** (Proxy)
```typescript
// src/modules/users/users.controller.ts
// Endpoints:
//   GET    /users/me              → Core Service (authenticated)
//   GET    /users/:id             → Core Service (authenticated)
//   PUT    /users/:id             → Core Service (authenticated)
//   DELETE /users/:id             → Core Service (authenticated)
// Faz 2: Replace HTTP with RabbitMQ
```

**Users Service** (Temporary HTTP Client)
```typescript
// src/modules/users/users.service.ts
// Current: HttpService.get/post/put/delete to Core Service
// Faz 2: Replace with RabbitMQ ClientProxy
// Methods: getUserById, updateUser, deleteUser
```

---

### Faz 2: RabbitMQ Integration (NEXT)

#### Objectives
- [ ] Add RabbitMQ to docker-compose
- [ ] Install @nestjs/microservices in both services
- [ ] Core Service: Add message consumers
- [ ] API Gateway: Replace HTTP with RabbitMQ ClientProxy
- [ ] Implement event patterns (user.created, user.updated, etc.)

#### RabbitMQ Configuration
```yaml
# docker-compose.yml (to be added)
rabbitmq:
  image: rabbitmq:3.12-management
  ports:
    - "5672:5672"    # AMQP
    - "15672:15672"  # Management UI
  environment:
    RABBITMQ_DEFAULT_USER: guest
    RABBITMQ_DEFAULT_PASS: guest
```

#### Exchange/Queue Design (Planned)
```
Exchange: user_exchange (Topic)
├── Queue: user_commands      # CRUD operations (RPC-style)
├── Queue: user_events        # Events (Fire & Forget)
│   ├── user.created
│   ├── user.updated
│   └── user.deleted
```

#### Core Service Changes
```typescript
// Add to main.ts
app.connectMicroservice({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL],
    queue: 'user_commands',
    queueOptions: { durable: true },
  },
});

// Add message handlers
@MessagePattern({ cmd: 'get_user' })
async getUser(data: { userId: string }) { ... }

@EventPattern('user.created')
async handleUserCreated(data: User) { ... }
```

#### API Gateway Changes
```typescript
// Replace HttpService with ClientProxy
constructor(
  @Inject('USER_SERVICE') private client: ClientProxy
) {}

async getUserById(userId: string) {
  return this.client.send(
    { cmd: 'get_user' },
    { userId }
  ).toPromise();
}

// Emit events
this.client.emit('user.created', userData);
```

---

### Faz 3: Advanced Features (FUTURE)

#### Planned Features
- [ ] Rate limiting (per user/IP)
- [ ] Request caching (Redis)
- [ ] Circuit breaker (resilience)
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Health checks (/health endpoint)
- [ ] Metrics (Prometheus)
- [ ] WebSocket for real-time updates
- [ ] API versioning (v1, v2)

---

## Development Guidelines

### Code Style
- **Language**: TypeScript (strict mode)
- **Naming**: camelCase for variables, PascalCase for classes
- **Async**: Use async/await, avoid callbacks
- **Error Handling**: Use NestJS exception filters
- **Validation**: Use class-validator DTOs
- **Documentation**: JSDoc for complex logic

### Testing Strategy (Future)
- Unit tests: Jest
- E2E tests: Supertest
- Target coverage: 80%

### Git Workflow
- Branch: feature/api-gateway-base
- Commit messages: Conventional Commits format
- PR required before merge

---

## Important Constraints & Notes

### Security
- **JWT Secret**: MUST match Core Service exactly
- **Password**: Never log or expose in responses
- **CORS**: Configure allowed origins
- **Rate Limiting**: Implement before production

### Performance
- **Connection Pooling**: Use for HTTP/DB/RabbitMQ
- **Timeouts**: Set reasonable timeouts for external calls
- **Caching**: Consider Redis for frequently accessed data

### Docker
- Use docker-compose for local development
- Core Service and API Gateway in separate containers
- RabbitMQ and MySQL as services

### Environment-Specific Config
- Development: .env file
- Production: Environment variables (Kubernetes secrets)
- Never commit .env to git

---

## Troubleshooting Guide

### Common Issues

**Issue**: JWT validation fails
- **Check**: JWT_SECRET matches Core Service
- **Check**: Token format (Bearer <token>)
- **Check**: Token not expired

**Issue**: Cannot connect to Core Service
- **Check**: CORE_SERVICE_URL is correct
- **Check**: Core Service is running
- **Check**: Network/firewall rules

**Issue**: RabbitMQ connection errors (Faz 2)
- **Check**: RabbitMQ container is running
- **Check**: RABBITMQ_URL is correct
- **Check**: Queue names match on both sides

---

## Next Steps (Immediate Actions)

1. **Create NestJS Project**
   ```bash
   nest new api-gateway
   cd api-gateway
   npm install [dependencies from Faz 1]
   ```

2. **Copy JWT Secret from Core Service**
   - Locate Core Service `.env` file
   - Copy `JWT_SECRET` value
   - Add to API Gateway `.env`

3. **Implement Core Files** (in order)
   - jwt.config.ts
   - jwt.strategy.ts
   - jwt-auth.guard.ts
   - current-user.decorator.ts
   - auth.module.ts + auth.controller.ts
   - users.module.ts + users.controller.ts + users.service.ts
   - app.module.ts
   - main.ts (with Swagger)

4. **Test Locally**
   - Start Core Service (port 3001)
   - Start API Gateway (port 3000)
   - Test /auth/login → should proxy to Core
   - Test /users/me with JWT token

5. **Prepare for Faz 2**
   - Document Core Service endpoints to proxy
   - Design RabbitMQ message schemas
   - Plan event types and patterns

---

## Reference Links

### Documentation
- NestJS: https://docs.nestjs.com
- RabbitMQ: https://www.rabbitmq.com/tutorials
- JWT: https://jwt.io
- TypeORM: https://typeorm.io

### Core Service Endpoints (to be proxied)
```
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
POST   /auth/logout
GET    /users/me
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

---

## Changelog

### 2025-10-16
- Initial memorybank creation
- Defined Faz 1, 2, 3 implementation plan
- Architecture decisions documented
- Project structure designed

---

## Questions for Developer

### Pending Decisions
1. **Rate Limiting**: Which strategy? (per-user, per-IP, both?)
2. **Caching**: Should we cache user data? TTL?
3. **Logging Level**: Debug in dev, Info in prod?
4. **Error Format**: Standard format for all errors?
5. **API Versioning**: Start with /v1 prefix now or later?

### To Clarify
1. Core Service exact port number?
2. Database connection details for Gateway (if needed)?
3. Expected request volume (for performance planning)?
4. Deployment environment (AWS, GCP, On-prem)?

---

## Team Context

**Developer**: Turkish speaker, experienced with NestJS
**Project Phase**: Early development
**Deadline**: Not specified
**Priority**: Core functionality first, optimization later

---

*Last Updated: 2025-10-16*
*Next Review: After Faz 1 completion*