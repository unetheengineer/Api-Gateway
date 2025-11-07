# Technical Context - API Gateway

## Technology Stack

### Core Framework
**NestJS 11.0.1**
- TypeScript-first framework for Node.js
- Built on Express.js (configurable to Fastify)
- Modular architecture with dependency injection
- Extensive ecosystem and community support
- Documentation: https://docs.nestjs.com

### Runtime
**Node.js** (via package.json engines field)
- JavaScript runtime built on Chrome's V8
- Non-blocking, event-driven architecture
- Excellent for I/O-heavy applications
- Large ecosystem (npm)

### Language
**TypeScript 5.7.3**
- Superset of JavaScript with static typing
- Enhanced IDE support and code completion
- Compile-time error detection
- Better refactoring capabilities

## Dependencies

### Authentication & Security
1. **@nestjs/jwt (11.0.1)**
   - JWT token generation and validation
   - Integration with Passport

2. **@nestjs/passport (11.0.5)**
   - Authentication middleware
   - Strategy pattern implementation

3. **passport (0.7.0) & passport-jwt (4.0.1)**
   - Authentication strategies
   - JWT extraction and validation

### API & Documentation
1. **@nestjs/swagger (11.2.1)**
   - OpenAPI/Swagger documentation generation
   - Automatic API documentation from decorators
   - Interactive API explorer UI

2. **swagger-ui-express (5.0.1)**
   - Swagger UI hosting
   - API documentation interface

### Validation & Transformation
1. **class-validator (0.14.2)**
   - Decorator-based validation
   - Runtime type checking
   - Custom validation rules

2. **class-transformer (0.5.1)**
   - Object transformation
   - Type conversion
   - Serialization/deserialization

3. **joi (17.13.3)**
   - Environment variable validation
   - Schema validation
   - Used in `src/config/env.validation.ts`

### HTTP & Communication
1. **@nestjs/axios (4.0.1)**
   - Axios integration for NestJS
   - HTTP client for microservice calls
   - RxJS integration

2. **axios (1.12.2)**
   - Promise-based HTTP client
   - Request/response interceptors
   - Automatic JSON transformation

### Messaging (RabbitMQ)
1. **@nestjs/microservices (11.1.6)**
   - Microservice communication patterns
   - Transport layer abstraction
   - Support for RabbitMQ, Redis, MQTT, etc.

2. **amqplib (0.10.9)**
   - RabbitMQ client library
   - AMQP 0-9-1 protocol implementation

3. **amqp-connection-manager (5.0.0)**
   - Connection pooling
   - Automatic reconnection
   - Channel management

### Rate Limiting & Throttling
1. **@nestjs/throttler (6.2.1)**
   - Rate limiting middleware
   - IP-based and user-based throttling
   - Configurable limits and TTL

### Monitoring & Health Checks
1. **@nestjs/terminus (11.0.0)**
   - Health check endpoints
   - Service dependency monitoring
   - Built-in health indicators

2. **@willsoto/nestjs-prometheus (6.0.2)**
   - Prometheus metrics integration (prepared, not fully active)
   - Custom metrics collection
   - HTTP request metrics

### Utilities
1. **compression (1.8.1)**
   - Response compression (Gzip)
   - Configurable compression threshold
   - Improves response times for large payloads

2. **uuid (13.0.0)**
   - UUID generation (v4)
   - Used for request IDs and entity IDs

3. **opossum (9.0.0)**
   - Circuit breaker implementation
   - Fault tolerance pattern
   - Prevents cascading failures

### Caching
1. **@nestjs/cache-manager (3.0.1)**
   - Caching abstraction
   - Support for in-memory and Redis

2. **cache-manager (7.2.4)**
   - Multi-store caching
   - TTL management
   - Currently configured for in-memory (Redis optional)

## Development Tools

### Build & Compilation
1. **@nestjs/cli (11.0.0)**
   - NestJS command-line interface
   - Project scaffolding
   - Build and development commands

2. **ts-node (10.9.2)**
   - TypeScript execution for Node.js
   - Development runtime

3. **ts-loader (9.5.2)**
   - TypeScript loader for Webpack
   - Used by NestJS build process

### Testing
1. **jest (30.0.0)**
   - JavaScript testing framework
   - Unit and integration testing
   - Coverage reporting

2. **@nestjs/testing (11.0.1)**
   - Testing utilities for NestJS
   - Mock providers and modules

3. **supertest (7.0.0)**
   - HTTP assertion library
   - API endpoint testing

4. **ts-jest (29.2.5)**
   - TypeScript preprocessor for Jest
   - Type checking in tests

### Code Quality
1. **eslint (9.18.0)**
   - JavaScript/TypeScript linting
   - Code style enforcement

2. **typescript-eslint (8.20.0)**
   - TypeScript-specific ESLint rules

3. **prettier (3.4.2)**
   - Code formatting
   - Consistent style across codebase

4. **eslint-plugin-prettier (5.2.2)**
   - Prettier integration with ESLint

### Type Definitions
All major packages have @types packages installed:
- @types/express (5.0.0)
- @types/node (22.10.7)
- @types/jest (30.0.0)
- @types/compression (1.7.5)
- @types/uuid (10.0.0)
- @types/opossum (8.1.9)
- @types/amqplib (0.10.5)

## Configuration Files

### TypeScript Configuration
**tsconfig.json**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

**Key Settings**:
- `experimentalDecorators`: Required for NestJS decorators
- `emitDecoratorMetadata`: Required for dependency injection
- `strictNullChecks`: Strict null checking enabled
- `target: ES2021`: Modern JavaScript features

### Jest Configuration
**package.json jest section**
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

### NestJS Configuration
**nest-cli.json**
```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

## Environment Configuration

### Environment Files
- `.env.development`: Development environment variables
- `.env.test`: Test environment variables (if exists)
- `.env`: Default/production variables

### Required Environment Variables
```bash
# Server Configuration
PORT=3000
NODE_ENV=development|production|test

# Core Service
CORE_SERVICE_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=<min 32 characters>
JWT_EXPIRES_IN=15m

# Rate Limiting
THROTTLE_TTL=60          # seconds
THROTTLE_LIMIT=100       # requests
THROTTLE_ENABLED=true    # true|false

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Redis (Optional)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true

# Metrics
METRICS_ENABLED=true
```

### Environment Validation
Location: `src/config/env.validation.ts`
- Uses Joi for schema validation
- Validates on application startup
- Provides clear error messages
- Sets default values where appropriate

## Development Workflow

### Available Scripts
```bash
# Build
npm run build              # Compile TypeScript to JavaScript

# Development
npm run start              # Start application
npm run start:dev          # Start with watch mode (auto-reload)
npm run start:test         # Start in test environment
npm run start:debug        # Start with debugger

# Code Quality
npm run format             # Format code with Prettier
npm run lint               # Lint code with ESLint

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:debug         # Run tests with debugger
npm run test:e2e           # Run end-to-end tests

# Utilities
npm run cleanup            # Kill processes on ports 3000-3001 (Linux/Mac)
npm run cleanup:win        # Kill processes on ports 3000-3001 (Windows)
npm run cleanup:force      # Force kill all Node processes
```

### Custom Cleanup Scripts
**scripts/cleanup-ports.sh** (Linux/Mac)
- Identifies processes on ports 3000-3001
- Gracefully terminates processes
- Prevents "port already in use" errors

**scripts/cleanup-ports.bat** (Windows)
- Windows equivalent of cleanup script
- Uses netstat and taskkill

## Technical Constraints

### Performance Requirements
- **Gateway Overhead**: < 100ms per request
- **Token Validation**: < 10ms per request
- **Rate Limiting Check**: < 5ms per request
- **Response Compression**: Only for responses > 1KB

### Security Requirements
- **JWT Secret**: Minimum 32 characters
- **HTTPS**: Required in production (not handled by gateway)
- **Rate Limiting**: Configurable per environment
- **Input Validation**: All user inputs validated
- **CORS**: Configurable allowed origins

### Scalability Considerations
- **Stateless**: No server-side sessions (JWT-based)
- **Horizontal Scaling**: Can run multiple instances
- **Load Balancer**: Required for multiple instances
- **Rate Limiting**: Per-instance (consider Redis for distributed)

## Development Setup

### Prerequisites
```bash
# Node.js and npm
node --version  # Should be v18+ or v20+
npm --version   # Should be v9+ or v10+

# RabbitMQ (Optional for full functionality)
# Can be run via Docker:
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management

# Redis (Optional for distributed caching)
# Can be run via Docker:
docker run -d --name redis \
  -p 6379:6379 \
  redis:alpine
```

### Installation Steps
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.development
# Edit .env.development with your values

# 3. Start development server
npm run start:dev

# 4. Access Swagger documentation
# Open browser: http://localhost:3000/api/docs

# 5. Access health check
# Open browser: http://localhost:3000/health
```

## Docker Support

### Dockerfile
Location: `/Dockerfile`
- Multi-stage build
- Production-optimized image
- Node.js Alpine base image

### .dockerignore
- Excludes node_modules, .git, .env files
- Keeps image size small

### Docker Commands
```bash
# Build image
docker build -t api-gateway .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  api-gateway
```

## Tool Usage Patterns

### Logging Pattern
```typescript
private readonly logger = new Logger(ClassName.name);

this.logger.log('Info message');
this.logger.error('Error message', trace);
this.logger.warn('Warning message');
this.logger.debug('Debug message');
this.logger.verbose('Verbose message');
```

### Config Service Usage
```typescript
constructor(private configService: ConfigService) {}

const jwtSecret = this.configService.get<string>('JWT_SECRET');
const port = this.configService.get<number>('PORT', 3000);
```

### Validation Usage
```typescript
// In DTO
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  @ApiProperty({ example: 'Buy groceries' })
  text: string;
}
```

### Swagger Documentation
```typescript
// Controller
@ApiTags('Todos')
@ApiBearerAuth()
@Controller({ path: 'todos', version: '1' })

// Endpoint
@Post()
@ApiOperation({ summary: 'Create new todo' })
@ApiResponse({ status: 201, description: 'Todo created' })
@ApiResponse({ status: 400, description: 'Validation error' })
async create(@Body() dto: CreateTodoDto) { }
```

## Future Technical Considerations

### For Pomodoro Module
- **WebSocket Support**: For real-time timer updates
  - Package: `@nestjs/websockets`, `socket.io`
  - Gateway: WebSocket gateway for timer events

- **Background Jobs**: For timer completion
  - Package: `@nestjs/bull`, `bull`
  - Queue: Timer queue with scheduled jobs

### For Calendar Module
- **Date/Time Library**: For date manipulation
  - Package: `date-fns` or `dayjs`
  - Purpose: Recurrence rules, timezone handling

- **Event Scheduling**: For reminders
  - Package: `node-cron` or `@nestjs/schedule`
  - Purpose: Scheduled reminder notifications

### For Habits Module
- **Statistics & Analytics**: For habit insights
  - Package: Built-in JavaScript math functions
  - Purpose: Streak calculations, completion rates

- **Data Visualization**: For progress charts (frontend)
  - API returns data, frontend renders charts
  - Format: JSON with time-series data

### Microservice Migration
When replacing mocks with microservices:

1. **HTTP Communication**:
   - Use existing `HttpService` (@nestjs/axios)
   - Wrap calls in `CircuitBreakerService`
   - Add retry logic with exponential backoff

2. **RabbitMQ Communication**:
   - Use `@nestjs/microservices` ClientProxy
   - Define message patterns
   - Implement request/response and event patterns

3. **Service Discovery** (Future):
   - Package: `@nestjs/consul` or custom implementation
   - Purpose: Dynamic service URL resolution

### Monitoring & Observability (Future)
1. **Prometheus Metrics**: Already prepared
   - Counter: Request count
   - Histogram: Response times
   - Gauge: Active connections

2. **Distributed Tracing**:
   - Package: `@opentelemetry/api`, `@opentelemetry/sdk-node`
   - Purpose: Trace requests across microservices

3. **Error Tracking**:
   - Integration: Sentry, Rollbar, or similar
   - Purpose: Production error monitoring

## IDE Configuration

### Recommended Extensions (VS Code)
- **ESLint**: Linting support
- **Prettier**: Code formatting
- **Thunder Client**: API testing (alternative to Postman)
- **GitLens**: Git integration
- **TypeScript Importer**: Auto-import suggestions

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
