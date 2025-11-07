# Active Context - API Gateway

## Current Work Focus

### Primary Objective
The project is in a **stable foundation phase** with core infrastructure completed. The next major focus is implementing the productivity modules: **Pomodoro**, **Calendar**, and **Habits**.

### Current State (November 2025)
- ✅ API Gateway infrastructure is complete and functional
- ✅ Mock implementations for Auth and Todos modules are working
- ✅ All core features (rate limiting, validation, logging) are operational
- ⏳ Ready for productivity modules implementation
- ⏳ Microservice integration patterns defined but not yet implemented

## Recent Changes

### Latest Modifications (Based on Git Status)
The following files have been modified or added recently:

#### Modified Files
1. **src/app.module.ts**
   - Removed unused modules (UsersModule, MetricsModule, CacheModule)
   - Kept essential modules (Auth, Todos, Health, Messaging)
   - Clean template state achieved

2. **src/main.ts**
   - Enhanced CORS configuration
   - Added rate limit headers to exposed headers
   - Updated Swagger documentation
   - Improved startup logging

3. **Authentication System**
   - `src/modules/auth/auth.controller.ts`: Full CRUD operations
   - `src/modules/auth/auth.service.ts`: Mock user management
   - `src/modules/auth/auth.module.ts`: JWT integration
   - `src/modules/auth/jwt.strategy.ts`: Token validation
   - Updated DTOs: login, register, refresh-token, oauth-callback

4. **Guards**
   - `src/common/guards/jwt-auth.guard.ts`: Updated authentication
   - `src/common/guards/throttler-behind-proxy.guard.ts`: Proxy-aware rate limiting

5. **Configuration**
   - `tsconfig.json`: Updated TypeScript settings

#### Deleted Files (Cleanup)
- `.cursor/plans/` directory (old planning files)
- `src/modules/users/` (consolidated into auth)
- `src/modules/metrics/metrics.module.ts` (prepared for future)
- `src/modules/ceche/cache.module.ts` (typo in name, cleaned up)
- `src/modules/auth/jwt-auth.guard.ts` (moved to common/guards)

#### New Files
1. **Docker Support**
   - `.dockerignore`: Docker ignore rules
   - `Dockerfile`: Container configuration

2. **Todos Module** (Complete implementation)
   - `src/modules/todos/todos.module.ts`
   - `src/modules/todos/todos.controller.ts`
   - `src/modules/todos/todos.service.ts`
   - `src/modules/todos/entities/todo.entity.ts`
   - `src/modules/todos/dto/create-todo.dto.ts`
   - `src/modules/todos/dto/update-todo.dto.ts`
   - `src/modules/todos/dto/query-todos.dto.ts`

3. **Type Definitions**
   - `src/types/express.d.ts`: Extended Express Request type

4. **HTTP Test Files**
   - `test-rate-limit.http`: Rate limiting tests
   - `test-todos.http`: Todos API tests

5. **Documentation**
   - `TODOS_MODULE.md`: Todos module documentation (will need review)

## Next Steps

### Immediate Tasks (Priority Order)

#### 1. Pomodoro Module Implementation
**Goal**: Implement timer management for Pomodoro technique

**Tasks**:
- [ ] Create module structure: `src/modules/pomodoro/`
- [ ] Define entities:
  - `PomodoroSession` entity
  - Session types: work (25min), short break (5min), long break (15min)
- [ ] Create DTOs:
  - `StartSessionDto`
  - `PauseSessionDto`
  - `CompleteSessionDto`
  - `UpdateConfigDto`
- [ ] Implement service:
  - Session state management
  - Timer calculations
  - History tracking
  - Statistics computation
- [ ] Create controller:
  - POST `/v1/pomodoro/start` - Start new session
  - POST `/v1/pomodoro/:id/pause` - Pause session
  - POST `/v1/pomodoro/:id/resume` - Resume session
  - POST `/v1/pomodoro/:id/complete` - Complete session
  - GET `/v1/pomodoro/current` - Get current session
  - GET `/v1/pomodoro/history` - Get session history
  - GET `/v1/pomodoro/stats` - Get statistics
  - PATCH `/v1/pomodoro/config` - Update timer durations
- [ ] Add Swagger documentation
- [ ] Consider WebSocket support for real-time timer updates (future enhancement)

#### 2. Calendar Module Implementation
**Goal**: Implement event management and scheduling

**Tasks**:
- [ ] Create module structure: `src/modules/calendar/`
- [ ] Define entities:
  - `CalendarEvent` entity
  - Support for single and recurring events
- [ ] Create DTOs:
  - `CreateEventDto`
  - `UpdateEventDto`
  - `QueryEventsDto` (with date range filters)
  - `RecurrenceRuleDto`
- [ ] Implement service:
  - Event CRUD operations
  - Recurring event logic
  - Date range queries
  - Event reminders
- [ ] Create controller:
  - POST `/v1/calendar/events` - Create event
  - GET `/v1/calendar/events` - Get events (with date filters)
  - GET `/v1/calendar/events/:id` - Get single event
  - PATCH `/v1/calendar/events/:id` - Update event
  - DELETE `/v1/calendar/events/:id` - Delete event
  - GET `/v1/calendar/month/:year/:month` - Get month view
  - GET `/v1/calendar/week/:year/:week` - Get week view
- [ ] Add date/time library (date-fns or dayjs)
- [ ] Add Swagger documentation
- [ ] Consider integration with Todos (convert todo to event)

#### 3. Habits Module Implementation
**Goal**: Implement habit tracking and streak management

**Tasks**:
- [ ] Create module structure: `src/modules/habits/`
- [ ] Define entities:
  - `Habit` entity
  - `HabitCompletion` entity
- [ ] Create DTOs:
  - `CreateHabitDto`
  - `UpdateHabitDto`
  - `MarkCompletionDto`
  - `QueryHabitsDto`
- [ ] Implement service:
  - Habit CRUD operations
  - Completion tracking
  - Streak calculation
  - Statistics computation
- [ ] Create controller:
  - POST `/v1/habits` - Create habit
  - GET `/v1/habits` - Get all habits
  - GET `/v1/habits/:id` - Get single habit
  - PATCH `/v1/habits/:id` - Update habit
  - DELETE `/v1/habits/:id` - Delete habit (soft)
  - POST `/v1/habits/:id/complete` - Mark as complete for date
  - GET `/v1/habits/:id/stats` - Get habit statistics
  - GET `/v1/habits/today` - Get today's habits
- [ ] Add Swagger documentation

#### 4. Cross-Module Integration
**Goal**: Enable modules to work together

**Tasks**:
- [ ] Todo → Pomodoro: Link todo to pomodoro session
- [ ] Todo → Calendar: Convert todo to calendar event
- [ ] Habit → Calendar: Link habit to calendar event
- [ ] Shared types and interfaces between modules

### Medium-Term Goals

#### Documentation & Testing
- [ ] Update README.md with new modules
- [ ] Write unit tests for each module
- [ ] Write integration tests for cross-module features
- [ ] Update Swagger documentation

#### Code Quality
- [ ] Review and refactor common patterns
- [ ] Ensure consistent error handling
- [ ] Add more validation rules
- [ ] Performance optimization

#### Microservice Preparation
- [ ] Document microservice migration path for each module
- [ ] Define API contracts for microservices
- [ ] Implement circuit breaker for all service calls
- [ ] Add retry logic and timeout handling

### Long-Term Goals

#### Production Readiness
- [ ] Replace mock implementations with microservice calls
- [ ] Add Redis caching layer
- [ ] Implement distributed rate limiting
- [ ] Set up monitoring and alerts
- [ ] Load testing and performance tuning
- [ ] Security audit

#### Advanced Features
- [ ] WebSocket support for real-time updates
- [ ] Background job processing
- [ ] Email notifications for reminders
- [ ] Mobile push notifications
- [ ] Data export functionality
- [ ] Advanced analytics and reporting

## Active Decisions and Considerations

### 1. Module Implementation Order
**Decision**: Pomodoro → Calendar → Habits
**Rationale**:
- Pomodoro is simplest (timer logic, no complex dependencies)
- Calendar has date/time complexity and recurring events
- Habits depends on understanding of completion patterns
- Each builds on patterns learned from previous

### 2. Real-Time Timer Updates
**Consideration**: WebSocket vs Polling
**Current Decision**: Implement basic REST API first, add WebSocket later
**Rationale**:
- REST API works immediately
- WebSocket adds complexity
- Can be added as enhancement without breaking existing API
**Future**: Use `@nestjs/websockets` and `socket.io` when needed

### 3. Date/Time Library Selection
**Consideration**: date-fns vs dayjs vs moment
**Recommendation**: date-fns
**Rationale**:
- Lightweight and modular
- Tree-shakable (only import what you need)
- TypeScript support
- Active maintenance
- No timezone issues (uses native Date)
**Alternative**: dayjs if timezone support becomes critical

### 4. Cross-Module Data Relationships
**Decision**: Use foreign keys (IDs) rather than embedded objects
**Example**:
```typescript
// Pomodoro session linking to todo
{
  sessionId: '123',
  linkedTodoId: '456',  // ✅ Reference by ID
  // NOT: linkedTodo: { ... }  // ❌ Don't embed full object
}
```
**Rationale**:
- Easier to maintain
- Avoids data duplication
- Microservice-ready (services own their data)
- Flexible querying (client can choose to expand or not)

### 5. Soft Delete Everywhere
**Decision**: Use soft delete for all user data
**Applies To**: Todos, Pomodoro sessions, Calendar events, Habits
**Rationale**:
- User can recover accidentally deleted data
- Maintains data for statistics
- Audit trail
**Implementation**: `deletedAt: Date | null` field

### 6. Pagination and Filtering
**Decision**: Consistent query params across all modules
**Standard Params**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `sortBy` (default: 'createdAt')
- `sortOrder` ('asc' | 'desc', default: 'desc')
- `includeDeleted` (boolean, default: false)
**Module-Specific Filters**:
- Todos: `status`
- Calendar: `startDate`, `endDate`, `category`
- Habits: `frequency`, `category`, `active`
- Pomodoro: `type`, `completed`, `startDate`, `endDate`

### 7. Mock Data Philosophy
**Decision**: Keep mock implementations realistic
**Guidelines**:
- Simulate real-world scenarios
- Include edge cases (deleted items, different users, etc.)
- Use realistic timestamps
- Maintain data consistency
**Purpose**: Easy testing and frontend development

## Important Patterns and Preferences

### Code Organization
```
src/modules/{module-name}/
├── {module-name}.module.ts       # Module definition
├── {module-name}.controller.ts   # HTTP endpoints
├── {module-name}.service.ts      # Business logic
├── entities/                     # Data models
│   └── {entity}.entity.ts
└── dto/                          # Data Transfer Objects
    ├── create-{entity}.dto.ts
    ├── update-{entity}.dto.ts
    └── query-{entity}.dto.ts
```

### Naming Conventions
- **Files**: kebab-case (`create-todo.dto.ts`)
- **Classes**: PascalCase (`CreateTodoDto`)
- **Functions/Methods**: camelCase (`createTodo()`)
- **Constants**: UPPER_SNAKE_CASE (`JWT_SECRET`)
- **Interfaces**: PascalCase with 'I' prefix optional (`User` or `IUser`)

### DTO Pattern
```typescript
export class CreateEntityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  @ApiProperty({
    description: 'Clear description',
    example: 'Example value',
  })
  field: string;
}
```

### Service Method Pattern
```typescript
async methodName(dto: DtoType, userId: string): Promise<ReturnType> {
  this.logger.log(`[MOCK] Action description for user: ${userId}`);

  // Business logic

  this.logger.log(`[MOCK] Action completed for user: ${userId}`);
  return result;
}
```

### Controller Pattern
```typescript
@Post()
@HttpCode(HttpStatus.CREATED) // or OK, NO_CONTENT, etc.
@ApiOperation({ summary: 'Short summary' })
@ApiResponse({ status: 201, description: 'Success' })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async create(@Body() dto: CreateDto, @Req() req: Request) {
  const user = req.user as any;
  return this.service.create(dto, user.userId);
}
```

### Error Handling
- Use NestJS exceptions: `NotFoundException`, `BadRequestException`, etc.
- Provide clear error messages
- Include field names in validation errors
- HttpExceptionFilter handles formatting

### Testing Approach
- Unit tests for services (business logic)
- Integration tests for controllers (API endpoints)
- E2E tests for complete flows
- Mock external dependencies (microservices, databases)

## Learnings and Project Insights

### What Works Well
1. **Module Pattern**: Clear separation of concerns
2. **DTO Validation**: Catches errors early, clear messages
3. **Mock Implementations**: Enables rapid development
4. **Swagger Integration**: Auto-generated docs save time
5. **Rate Limiting**: Prevents abuse without impacting users
6. **Request ID Tracking**: Makes debugging much easier
7. **Global Interceptors**: Consistent response format
8. **Soft Delete**: Users appreciate recovery capability

### What to Improve
1. **Testing Coverage**: Need more unit and integration tests
2. **Error Messages**: Some could be more user-friendly
3. **Documentation**: Add more inline comments for complex logic
4. **Performance Metrics**: Need actual monitoring in place
5. **Caching Strategy**: Define what and when to cache

### Best Practices Established
1. **Always use DTOs** for request/response types
2. **Always validate** user inputs
3. **Always log** important actions
4. **Always include** Swagger documentation
5. **Always use soft delete** for user data
6. **Always check** user ownership for data access
7. **Always use** request ID for debugging
8. **Always return** consistent response format

### Common Pitfalls to Avoid
1. **Don't embed full objects** in responses (use IDs for relationships)
2. **Don't skip validation** even for "simple" endpoints
3. **Don't forget** to check user ownership
4. **Don't use** synchronous operations for I/O
5. **Don't expose** sensitive data in error messages
6. **Don't forget** to update Swagger when changing APIs
7. **Don't commit** .env files with secrets

### Performance Considerations
1. **Pagination**: Always paginate large result sets
2. **Compression**: Enabled for responses > 1KB
3. **Validation**: Minimal overhead with class-validator
4. **Rate Limiting**: Efficient in-memory storage (Redis for distributed)
5. **Logging**: Use appropriate log levels (avoid verbose in production)

## Current Blockers
**None** - Project is ready for next phase implementation

## Questions to Resolve
1. **WebSocket Integration**: When to add real-time features?
   - Recommendation: After REST APIs are complete and tested

2. **Background Jobs**: Bull queue vs NestJS Scheduler?
   - Recommendation: Start with @nestjs/schedule for simple jobs

3. **Notification System**: How to handle reminders?
   - Recommendation: Start with simple in-app state, add email/push later

4. **Time Zones**: How to handle different time zones for calendar?
   - Recommendation: Store all dates in UTC, handle timezone in frontend

5. **Analytics**: What metrics to track for productivity features?
   - Recommendation: Define metrics per module (completion rate, streaks, etc.)

## Memory Bank Update Triggers
Update this file when:
- Starting work on new modules (Pomodoro, Calendar, Habits)
- Completing major features
- Making architectural decisions
- Discovering new patterns or insights
- Encountering and resolving issues
- User requests **update memory bank** command
