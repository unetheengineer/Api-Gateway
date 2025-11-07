# Project Brief - API Gateway

## Project Overview
A modern, production-ready API Gateway built with NestJS that serves as the central entry point for a microservices architecture. The gateway provides authentication, rate limiting, request routing, and comprehensive monitoring capabilities.

## Core Purpose
- **Central API Entry Point**: Single point of entry for all client requests to backend microservices
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Request Management**: Rate limiting, request validation, and transformation
- **Service Integration**: Seamless communication with backend microservices (HTTP/RabbitMQ)
- **Monitoring & Health**: Comprehensive health checks, logging, and metrics

## Current Implementation Status
The project is in **active development** phase with core infrastructure completed:
- ✅ NestJS API Gateway foundation
- ✅ JWT Authentication (Mock implementation)
- ✅ Rate Limiting (IP-based and user-based)
- ✅ Request validation and transformation
- ✅ Todos Module (Mock - demonstrates CRUD operations)
- ✅ Health monitoring system
- ✅ RabbitMQ messaging setup
- ✅ Swagger API documentation
- ✅ CORS configuration
- ✅ Request ID tracking
- ✅ Error handling and logging

## Planned Features (Roadmap)
The following modules are planned for future implementation:

**⚠️ IMPORTANT**: All new modules will be implemented as **MOCK implementations first**, following the same pattern as Auth and Todos modules. Each module will eventually be replaced with a dedicated microservice.

### 1. Pomodoro Module (Mock → Microservice)
- **Implementation**: Mock service with in-memory storage
- **Future**: Dedicated Pomodoro Microservice
- Timer management for Pomodoro technique
- Session tracking (work sessions, short breaks, long breaks)
- Statistics and productivity metrics
- User-specific timer configurations

### 2. Calendar Module (Mock → Microservice)
- **Implementation**: Mock service with in-memory storage
- **Future**: Dedicated Calendar Microservice
- Event management (create, read, update, delete)
- Date/time scheduling
- Event categories and tags
- Reminders and notifications
- Integration with Todos module

### 3. Habits Module (Mock → Microservice)
- **Implementation**: Mock service with in-memory storage
- **Future**: Dedicated Habits Microservice
- Habit tracking and management
- Streak tracking
- Daily/weekly/monthly habit goals
- Progress visualization
- Habit completion statistics

## Architecture Goals
1. **Mock-to-Microservice Transition**: Current modules (Auth, Todos) use mock implementations that can be seamlessly replaced with microservice calls
2. **Scalability**: Designed to handle multiple microservices with proper circuit breakers and retry mechanisms
3. **Security**: JWT authentication, rate limiting, and input validation at gateway level
4. **Observability**: Comprehensive logging, health checks, and monitoring
5. **Developer Experience**: Clear documentation, Swagger UI, and consistent API patterns

## Technology Stack
- **Framework**: NestJS 11.x (Node.js/TypeScript)
- **Authentication**: JWT (Passport)
- **Messaging**: RabbitMQ (AMQP)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer, Joi
- **HTTP Client**: Axios with circuit breaker (Opossum)
- **Rate Limiting**: @nestjs/throttler

## Target Users
- Frontend applications (React, Vue, Angular, etc.)
- Mobile applications (iOS, Android)
- Third-party integrations
- Internal microservices

## Success Criteria
1. All requests pass through gateway with proper authentication
2. Rate limiting prevents abuse while allowing legitimate traffic
3. Response times remain under 100ms for gateway overhead
4. Clear error messages and proper HTTP status codes
5. Complete API documentation via Swagger
6. Seamless transition from mock to microservice implementations
7. Health checks provide accurate service status
8. All planned modules (Pomodoro, Calendar, Habits) fully integrated

## Project Boundaries
### In Scope
- API Gateway functionality (routing, auth, rate limiting)
- Mock implementations for demonstration
- Integration patterns for microservices
- Common middleware (logging, validation, error handling)
- Infrastructure setup (RabbitMQ, health checks)

### Out of Scope
- Actual microservice implementations (Auth Service, Todo Service, etc.)
- Database management (handled by microservices)
- Business logic (delegated to microservices)
- Frontend application development
- DevOps/deployment configurations (Docker, K8s, CI/CD)

## Development Phases
### Phase 1: Foundation (Completed)
- ✅ Basic NestJS setup
- ✅ Authentication flow (mock)
- ✅ Todos module (mock)
- ✅ Rate limiting
- ✅ Health checks

### Phase 2: Productivity Modules (Planned - All as MOCK)
- ⏳ Pomodoro module implementation (MOCK with in-memory storage)
- ⏳ Calendar module implementation (MOCK with in-memory storage)
- ⏳ Habits module implementation (MOCK with in-memory storage)
- **Note**: All modules follow the same mock pattern as Auth and Todos

### Phase 3: Microservice Migration (Future)
- Replace Auth mock → Auth Microservice
- Replace Todos mock → Todos Microservice
- Replace Pomodoro mock → Pomodoro Microservice
- Replace Calendar mock → Calendar Microservice
- Replace Habits mock → Habits Microservice
- Implement circuit breakers for all service calls
- Add distributed caching layer (Redis)
- Enhanced monitoring and metrics

### Phase 4: Microservice Development (Separate Projects)
Each microservice will be a separate NestJS project with:
- Own database (PostgreSQL/MongoDB)
- Own business logic
- Own tests and documentation
- RabbitMQ/HTTP communication with gateway
- Independent deployment

### Phase 5: Production Readiness (Future)
- Performance optimization
- Security hardening
- Load testing
- Production deployment configuration
