# Product Context - API Gateway

## Why This Project Exists

### Problem Statement
Modern web applications require:
1. **Centralized Security**: Single point for authentication and authorization
2. **Request Management**: Rate limiting and request validation to prevent abuse
3. **Service Orchestration**: Unified interface for multiple microservices
4. **Monitoring**: Comprehensive logging and health checks across services
5. **Developer Experience**: Consistent API patterns and documentation

### Solution
An API Gateway that:
- Provides a single entry point for all client requests
- Handles cross-cutting concerns (auth, rate limiting, logging)
- Routes requests to appropriate microservices
- Transforms and validates requests/responses
- Provides comprehensive API documentation

## Problems It Solves

### 1. Authentication Complexity
**Problem**: Each microservice implementing its own authentication
**Solution**: JWT-based authentication at gateway level
- Single sign-on experience
- Consistent token validation
- Role-based access control
- Token refresh mechanism

### 2. API Abuse Prevention
**Problem**: Uncontrolled API access can overwhelm services
**Solution**: Multi-layer rate limiting
- IP-based rate limiting for public endpoints
- User-based rate limiting for authenticated endpoints
- Configurable limits per environment
- Clear rate limit headers for clients

### 3. Request Validation
**Problem**: Invalid data reaching microservices
**Solution**: Input validation at gateway
- DTO validation with class-validator
- Type transformation
- Required field enforcement
- Clear validation error messages

### 4. Service Communication
**Problem**: Complex service-to-service communication patterns
**Solution**: Multiple communication methods
- HTTP/REST for synchronous calls
- RabbitMQ for asynchronous messaging
- Circuit breakers for fault tolerance
- Retry mechanisms for failed requests

### 5. Monitoring & Debugging
**Problem**: Difficult to trace requests across services
**Solution**: Comprehensive tracking
- Unique request IDs (X-Request-ID)
- Centralized logging
- Health check endpoints
- Swagger documentation

## How It Works

### Request Flow
```
1. Client sends request to API Gateway
   ↓
2. Gateway applies middleware
   - Request ID generation
   - Logging
   - CORS handling
   ↓
3. Rate limiting check
   - Check IP-based limits
   - Check user-based limits (if authenticated)
   ↓
4. Authentication (if required)
   - JWT token validation
   - User extraction
   ↓
5. Request validation
   - DTO validation
   - Type transformation
   ↓
6. Route to handler
   - Mock implementation (current)
   - Microservice call (future)
   ↓
7. Response transformation
   - Standard format
   - Error handling
   ↓
8. Return to client
   - With rate limit headers
   - With request ID
```

### Authentication Flow
```
1. User Registration/Login
   ↓
2. Gateway validates credentials (mock)
   ↓
3. Generate JWT tokens
   - Access token (15m)
   - Refresh token (7d)
   ↓
4. Return tokens to client
   ↓
5. Client includes access token in subsequent requests
   ↓
6. Gateway validates token on protected routes
   ↓
7. Token expires → Client uses refresh token
   ↓
8. Gateway issues new access token
```

### Module Architecture (Current + Planned)

#### Current Modules

**Auth Module**
- User registration and login
- JWT token generation
- Token refresh
- OAuth placeholder
- Mock user storage

**Todos Module**
- CRUD operations
- Soft delete support
- User-specific data
- Pagination and filtering
- Status management

**Health Module**
- Service health checks
- RabbitMQ connection status
- Core service connectivity
- Memory and uptime metrics

**Messaging Module**
- RabbitMQ setup
- Event publishing
- RPC communication patterns
- Retry mechanisms

#### Planned Modules

**Pomodoro Module**
- Session management (25min work, 5min break, 15min long break)
- Timer state tracking (running, paused, completed)
- Session history and statistics
- Configurable timer durations
- Integration with Todos (link todo to pomodoro session)
- Daily/weekly productivity metrics

**Calendar Module**
- Event CRUD operations
- Date/time scheduling
- Event categories (work, personal, meeting, etc.)
- Recurring events support
- Event reminders
- Integration with Todos (convert todo to calendar event)
- Integration with Pomodoro (schedule pomodoro sessions)
- Month/week/day views

**Habits Module**
- Daily habit tracking
- Habit creation with frequency (daily, weekly, custom)
- Completion marking
- Streak tracking (current streak, longest streak)
- Habit categories (health, productivity, learning, etc.)
- Progress statistics
- Habit reminders
- Integration with Calendar (schedule habit time)

## User Experience Goals

### For Frontend Developers
1. **Clear API Documentation**: Swagger UI with examples
2. **Consistent Response Format**: Standard success/error responses
3. **Predictable Behavior**: RESTful conventions
4. **Good Error Messages**: Descriptive, actionable errors
5. **Rate Limit Visibility**: Headers showing remaining quota

### For End Users
1. **Fast Response Times**: Gateway overhead < 100ms
2. **Secure Authentication**: JWT-based security
3. **Reliable Service**: Circuit breakers prevent cascading failures
4. **Productivity Tools**: Integrated Pomodoro, Calendar, and Habits

### For Operations Team
1. **Health Monitoring**: /health endpoint with service status
2. **Request Tracing**: X-Request-ID for debugging
3. **Logging**: Comprehensive request/response logging
4. **Metrics**: Response times, error rates (prepared for Prometheus)

## Expected User Interactions

### Developer Integration
```typescript
// 1. Register user
POST /v1/auth/register
Body: { email, password, firstName, lastName }
Returns: { accessToken, refreshToken, user }

// 2. Login
POST /v1/auth/login
Body: { email, password }
Returns: { accessToken, refreshToken, user }

// 3. Access protected resources
GET /v1/todos
Headers: { Authorization: "Bearer {accessToken}" }
Returns: { data: [...], meta: {...} }

// 4. Refresh token when expired
POST /v1/auth/refresh
Body: { refreshToken }
Returns: { accessToken, refreshToken }
```

### Productivity Workflow (Planned)
```
1. User creates a habit (e.g., "Morning exercise")
   ↓
2. User creates calendar event for habit
   ↓
3. User creates todo items for today
   ↓
4. User starts pomodoro session for a todo
   ↓
5. System tracks time and updates statistics
   ↓
6. User marks habit as complete
   ↓
7. System updates streak and shows progress
```

## Business Value

### Immediate Benefits
1. **Faster Development**: Mock implementations allow frontend development without microservices
2. **Security**: Centralized authentication reduces security risks
3. **Scalability**: Gateway can handle increasing load with rate limiting
4. **Documentation**: Swagger UI reduces integration time

### Long-term Benefits
1. **Microservice Ready**: Easy transition from mock to microservices
2. **Maintainability**: Centralized cross-cutting concerns
3. **Observability**: Better monitoring and debugging
4. **Extensibility**: Easy to add new modules and features

## Success Metrics

### Technical Metrics
- Gateway response time < 100ms (P95)
- Token validation < 10ms
- Rate limiting overhead < 5ms
- 99.9% uptime

### Developer Metrics
- API documentation coverage 100%
- Clear error messages for all validation failures
- Swagger examples for all endpoints
- Integration time < 1 day for new frontends

### User Metrics (Planned Modules)
- Pomodoro sessions completed per day
- Habit streak maintenance rate
- Calendar event completion rate
- Todo completion rate
- Cross-module usage (e.g., todo → pomodoro → calendar)
