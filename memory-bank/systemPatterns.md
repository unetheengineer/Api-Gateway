# System Patterns - API Gateway

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  (Web Apps, Mobile Apps, Third-party Services)              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                    │   │
│  │  - CORS, Compression, Request ID, Logging           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Guards                                              │   │
│  │  - Rate Limiting (IP + User), JWT Auth              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controllers & Services                              │   │
│  │  - Auth, Todos, (Pomodoro, Calendar, Habits)       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Interceptors                                        │   │
│  │  - Transform, Logging, Rate Limit Headers           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌────────┐   ┌─────────┐   ┌──────────┐
   │  Auth  │   │  Todos  │   │ Future   │
   │Service │   │ Service │   │ Services │
   └────────┘   └─────────┘   └──────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
                      ▼
                ┌──────────┐
                │ RabbitMQ │
                └──────────┘
```

## Core Design Patterns

### 1. Module Pattern (NestJS)
**Location**: All modules (AuthModule, TodosModule, etc.)

**Structure**:
```
ModuleFolder/
├── module.ts          # Module definition
├── controller.ts      # HTTP endpoints
├── service.ts         # Business logic
├── entities/          # Data models
└── dto/              # Data Transfer Objects
```

**Example**: `src/modules/todos/`
- `todos.module.ts`: Declares controllers and providers
- `todos.controller.ts`: Defines REST endpoints
- `todos.service.ts`: Contains mock business logic
- `dto/`: Request/response DTOs with validation
- `entities/`: Todo entity definition

### 2. Guard Pattern
**Location**: `src/common/guards/`

**JWT Authentication Guard**
```typescript
// src/common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt')
```
- Extends Passport's AuthGuard
- Used with `@UseGuards(JwtAuthGuard)` decorator
- Validates JWT tokens on protected routes
- Extracts user from token payload

**Rate Limiting Guard**
```typescript
// src/common/guards/throttler-behind-proxy.guard.ts
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard
```
- Extends NestJS ThrottlerGuard
- Handles IP extraction behind proxies
- Applied globally via APP_GUARD
- Respects X-Forwarded-For header

### 3. Middleware Pattern
**Location**: `src/common/middleware/`

**Request ID Middleware**
```typescript
// src/common/middleware/request-id.middleware.ts
export class RequestIdMiddleware implements NestMiddleware
```
- Applied to all routes: `consumer.apply(RequestIdMiddleware).forRoutes('*')`
- Generates unique UUID for each request
- Attaches to request headers (X-Request-ID)
- Used for request tracing and debugging

### 4. Interceptor Pattern
**Location**: `src/common/interceptors/`

**Interceptor Chain** (Applied in order):
1. **LoggingInterceptor**: Logs request/response with timing
2. **TransformInterceptor**: Wraps responses in standard format
3. **RateLimitHeadersInterceptor**: Adds rate limit headers

**Transform Response Pattern**:
```typescript
// All successful responses follow this format
{
  statusCode: 200,
  message: "Success",
  data: { /* actual data */ },
  timestamp: "2024-01-10T10:00:00.000Z",
  path: "/v1/todos"
}
```

### 5. DTO Validation Pattern
**Location**: All `dto/` folders

**Pattern**:
```typescript
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  text: string;
}
```

**Benefits**:
- Automatic validation via ValidationPipe
- Clear error messages
- Type safety
- Swagger documentation generation

### 6. Mock-to-Microservice Pattern
**Current Implementation** (Mock):
```typescript
// In service
private mockTodos: Todo[] = [/* ... */];

async create(dto: CreateTodoDto, userId: string): Promise<Todo> {
  // Mock implementation with in-memory storage
  const newTodo = { id: uuid(), ...dto, userId };
  this.mockTodos.push(newTodo);
  return newTodo;
}
```

**Future Implementation** (Microservice):
```typescript
// In service
constructor(
  private httpService: HttpService,
  private circuitBreaker: CircuitBreakerService
) {}

async create(dto: CreateTodoDto, userId: string): Promise<Todo> {
  // Call microservice via HTTP with circuit breaker
  return this.circuitBreaker.fire('todos-service', async () => {
    const response = await this.httpService.post('/todos', {
      ...dto,
      userId
    });
    return response.data;
  });
}
```

**Key Principle**: Keep method signatures identical for seamless migration

### 7. Exception Filter Pattern
**Location**: `src/common/filters/http-exception.filter.ts`

**Pattern**:
```typescript
{
  statusCode: 400,
  timestamp: "2024-01-10T10:00:00.000Z",
  path: "/v1/todos",
  message: "Validation failed",
  errors: [
    {
      field: "text",
      message: "text should not be empty"
    }
  ]
}
```

**Benefits**:
- Consistent error format across all endpoints
- Detailed validation errors
- Proper HTTP status codes
- Request tracking via path and timestamp

### 8. Strategy Pattern (JWT)
**Location**: `src/modules/auth/jwt.strategy.ts`

**Pattern**:
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
```
- Extracts JWT from Bearer token
- Validates token signature
- Returns user payload
- Used by JwtAuthGuard

### 9. Configuration Pattern
**Location**: `src/config/`

**Environment Validation**:
```typescript
// src/config/env.validation.ts
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test'),
  PORT: Joi.number().port().default(3000),
  JWT_SECRET: Joi.string().min(32).required(),
  // ... more validations
});
```

**Benefits**:
- Fails fast on invalid configuration
- Clear error messages
- Type-safe configuration access
- Default values

### 10. Soft Delete Pattern
**Location**: `src/modules/todos/` (example)

**Entity Pattern**:
```typescript
export class Todo {
  id: string;
  text: string;
  // ... other fields
  deletedAt: Date | null;  // Soft delete marker
}
```

**Usage**:
- Delete: Set `deletedAt = new Date()`
- Restore: Set `deletedAt = null`
- Query: Filter by `deletedAt === null` (exclude deleted)
- Include deleted: Use `includeDeleted=true` query param

## Component Relationships

### Request Flow Architecture
```
1. Client Request
   ↓
2. RequestIdMiddleware (generates UUID)
   ↓
3. CORS Check (express CORS middleware)
   ↓
4. Compression (gzip if > 1KB)
   ↓
5. ThrottlerBehindProxyGuard (rate limiting)
   ↓
6. JwtAuthGuard (if @UseGuards present)
   ↓
7. ValidationPipe (DTO validation)
   ↓
8. Controller Method
   ↓
9. Service Method (mock or microservice call)
   ↓
10. LoggingInterceptor (log response time)
    ↓
11. TransformInterceptor (wrap response)
    ↓
12. RateLimitHeadersInterceptor (add headers)
    ↓
13. HttpExceptionFilter (if error occurred)
    ↓
14. Return to Client
```

### Module Dependencies
```
AppModule
├── ConfigModule (Global)
├── ThrottlerModule (Global)
├── HttpModule (Global)
├── AuthModule
│   ├── PassportModule
│   ├── JwtModule
│   ├── AuthController
│   ├── AuthService
│   └── JwtStrategy
├── TodosModule
│   ├── TodosController
│   └── TodosService
├── HealthModule
│   ├── TerminusModule
│   ├── HealthController
│   ├── CoreServiceHealth
│   └── RabbitMQHealth
└── MessagingModule
    └── MessagingService (RabbitMQ)
```

## Critical Implementation Paths

### 1. Authentication Flow
```
POST /v1/auth/login
  ↓
AuthController.login()
  ↓
AuthService.login()
  ├─ Find user in mockUsers
  ├─ Validate password
  ├─ Generate JWT tokens (JwtService)
  └─ Return tokens + user data
  ↓
Client stores tokens
  ↓
Subsequent requests include: Authorization: Bearer {accessToken}
  ↓
JwtAuthGuard validates token
  ↓
JwtStrategy extracts user
  ↓
Request.user populated with user data
```

### 2. Rate Limiting Flow
```
Request arrives
  ↓
ThrottlerBehindProxyGuard.canActivate()
  ├─ Extract IP (from X-Forwarded-For or req.ip)
  ├─ Check rate limit for IP
  ├─ If authenticated: Check user-based limit
  └─ Throw 429 if exceeded
  ↓
RateLimitHeadersInterceptor adds headers:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset
  - X-RateLimit-Reset-Ms
```

### 3. Validation Flow
```
Request with body
  ↓
ValidationPipe (Global)
  ├─ Transform JSON to DTO class
  ├─ Run class-validator decorators
  └─ If invalid: Throw BadRequestException
  ↓
HttpExceptionFilter catches and formats:
{
  statusCode: 400,
  message: "Validation failed",
  errors: [/* detailed field errors */]
}
```

### 4. Microservice Communication (Future)
```
Gateway receives request
  ↓
Service method called
  ↓
CircuitBreakerService.fire()
  ├─ Check circuit state (open/closed/half-open)
  ├─ If closed: Execute request
  ├─ If open: Fail fast
  └─ If half-open: Try one request
  ↓
HttpService makes call to microservice
  ├─ Success: Close circuit, return data
  ├─ Failure: Increment failure count
  └─ If failure threshold exceeded: Open circuit
  ↓
Retry mechanism (if configured)
  ├─ Exponential backoff
  └─ Max retry attempts
```

## Design Decisions

### 1. Why NestJS?
- **TypeScript First**: Full type safety
- **Modular Architecture**: Easy to organize code
- **Dependency Injection**: Testable and maintainable
- **Decorator Pattern**: Clean, readable code
- **Built-in Features**: Guards, interceptors, pipes
- **Microservice Ready**: Native support for HTTP, RabbitMQ, gRPC

### 2. Why JWT for Authentication?
- **Stateless**: No server-side session storage
- **Scalable**: Works across multiple gateway instances
- **Standard**: Widely supported by clients
- **Secure**: Signed tokens prevent tampering
- **Flexible**: Can include user data in payload

### 3. Why Mock Implementations First?
- **Parallel Development**: Frontend can start without microservices
- **Rapid Prototyping**: Quick to test API contracts
- **Clear Interface**: Defines expected service behavior
- **Easy Migration**: Same method signatures for real services

### 4. Why Rate Limiting at Gateway?
- **Protection**: Prevents API abuse early
- **Centralized**: Single place to manage limits
- **Flexible**: Different limits for different users/IPs
- **Transparent**: Headers inform clients about limits

### 5. Why Soft Delete?
- **Data Recovery**: Can restore accidentally deleted items
- **Audit Trail**: Maintains history
- **User Experience**: "Trash" functionality
- **Compliance**: Some regulations require data retention

### 6. Why Request ID Tracking?
- **Debugging**: Track request across services
- **Logging**: Correlate logs from different components
- **Error Reporting**: Include request ID in error reports
- **Performance**: Measure end-to-end request time

## Future Architecture Patterns (Planned Modules)

### Pomodoro Module Pattern
```
Timer State Machine:
  IDLE → WORK_SESSION → SHORT_BREAK → WORK_SESSION → LONG_BREAK → IDLE
       (25min)        (5min)        (25min)        (15min)

Data Structure:
{
  sessionId: string,
  userId: string,
  type: 'work' | 'short_break' | 'long_break',
  duration: number,
  startedAt: Date,
  endedAt: Date | null,
  pausedAt: Date | null,
  linkedTodoId: string | null,
  completed: boolean
}
```

### Calendar Module Pattern
```
Event Management:
- Single events
- Recurring events (daily, weekly, monthly, custom)
- All-day events
- Event reminders

Data Structure:
{
  eventId: string,
  userId: string,
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  isAllDay: boolean,
  category: string,
  recurrence: RecurrenceRule | null,
  reminders: Reminder[],
  linkedTodoId: string | null,
  linkedHabitId: string | null
}
```

### Habits Module Pattern
```
Habit Tracking:
- Daily/weekly/custom frequency
- Completion tracking
- Streak calculation

Data Structure:
{
  habitId: string,
  userId: string,
  name: string,
  description: string,
  frequency: 'daily' | 'weekly' | 'custom',
  customDays: number[] | null,
  category: string,
  createdAt: Date,
  completions: Completion[],
  currentStreak: number,
  longestStreak: number
}

Completion:
{
  date: Date,
  completed: boolean,
  notes: string | null
}
```

### Cross-Module Integration
```
Integration Points:
1. Todo → Pomodoro: Link todo to work session
2. Todo → Calendar: Convert todo to calendar event
3. Habit → Calendar: Schedule habit time
4. Calendar → Pomodoro: Start pomodoro for calendar event
5. All modules share userId for data isolation
```
