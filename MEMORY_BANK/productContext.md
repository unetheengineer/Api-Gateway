# Product Context

## Ürün Açıklaması

API Gateway, "Lifeplaneer" projesinin merkezi API yönetim katmanıdır. Microservices mimarisinde birden fazla backend servisi (Core Service, vb.) arasında tek bir giriş noktası sağlayarak istemci uygulamalarının (web, mobile) bu servislere erişimini kolaylaştırır.

## Çözülen Problem

**Sorun:**
- Microservices mimarisinde her servise ayrı ayrı bağlanmak karmaşık
- Kimlik doğrulama ve yetkilendirme her serviste tekrarlanması
- Rate limiting, logging, monitoring merkezi olmayan
- Cross-Origin Resource Sharing (CORS) yönetimi zor
- Request/Response transformasyonları tutarsız

**Çözüm:**
- Merkezi API Gateway tüm istekleri yönetir
- Tek noktada JWT authentication ve authorization
- Global rate limiting ve request throttling
- Merkezi logging ve monitoring (Prometheus metrics)
- Tutarlı error handling ve response formatting
- Cache management ve circuit breaker pattern

## Kullanıcı Deneyimi Hedefleri

### 1. **Geliştiriciler İçin**
- **Kolay Entegrasyon**: Tek bir API endpoint'e bağlanma
- **Clear Documentation**: Swagger/OpenAPI dokümantasyonu
- **Debugging**: Request ID tracking ve detailed logging
- **Rate Limit Info**: Headers'da rate limit bilgisi (X-RateLimit-*)
- **Error Messages**: Anlaşılır ve actionable hata mesajları

### 2. **End Users İçin**
- **Fast Responses**: Response compression (Gzip)
- **Reliable Service**: Circuit breaker ile backend failures'dan korunma
- **Secure Access**: JWT-based authentication
- **Smooth Experience**: Consistent response format

### 3. **DevOps/Operations İçin**
- **Monitoring**: Prometheus metrics
- **Health Checks**: `/health` endpoint
- **Logging**: Centralized request/response logging
- **Performance Metrics**: Response times, error rates
- **Rate Limiting**: DDoS protection

## Temel Özellikler

### Authentication & Authorization
- **JWT Token-based**: Stateless authentication
- **OAuth Support**: Google & GitHub (hazırlanmış)
- **Token Refresh**: Automatic token refresh mechanism
- **Logout**: Token invalidation support

### API Management
- **Request Routing**: Microservices'e intelligent routing
- **Request Validation**: DTO-based validation
- **Response Transformation**: Consistent response format
- **Versioning**: URI-based API versioning (/v1/*)

### Performance & Reliability
- **Response Compression**: Gzip compression (1KB threshold)
- **Caching**: Multi-level caching strategy
- **Circuit Breaker**: Graceful degradation
- **Rate Limiting**: 100 requests/60 seconds (configurable)

### Monitoring & Observability
- **Request Tracking**: X-Request-ID header
- **Logging**: Detailed request/response logging
- **Metrics**: Prometheus metrics collection
- **Health Checks**: Service health monitoring

### Security
- **CORS**: Flexible CORS configuration
- **Input Validation**: Strict DTO validation
- **Error Handling**: No sensitive data in errors
- **Rate Limiting**: DDoS protection

## Supported Endpoints (Planned)

### Authentication Module
```
POST   /v1/auth/login          - User login
POST   /v1/auth/register       - User registration
POST   /v1/auth/refresh        - Token refresh
POST   /v1/auth/logout         - User logout
POST   /v1/auth/google         - Google OAuth (planned)
POST   /v1/auth/github         - GitHub OAuth (planned)
```

### Users Module
```
GET    /v1/users/me            - Get current user
GET    /v1/users/:id           - Get user by ID
PUT    /v1/users/me            - Update current user
```

### Health Module
```
GET    /health                 - Health check
GET    /health/live            - Liveness probe
GET    /health/ready           - Readiness probe
```

### Metrics Module
```
GET    /metrics                - Prometheus metrics
```

### Documentation
```
GET    /api/docs               - Swagger UI
GET    /api-docs.json          - OpenAPI JSON
```

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Configuration Options

### Environment Variables
- `NODE_ENV`: development | test | production
- `PORT`: Server port (default: 3000)
- `CORE_SERVICE_URL`: Backend Core Service URL
- `CORS_ORIGIN`: Allowed CORS origins (comma-separated)
- `THROTTLE_ENABLED`: Enable/disable rate limiting
- `THROTTLE_LIMIT`: Requests per window (default: 100)
- `THROTTLE_TTL`: Time window in seconds (default: 60)
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRATION`: JWT expiration time (default: 3600s)

## Performance Targets

- **Response Time**: < 200ms (excluding backend latency)
- **Throughput**: 1000+ requests/second
- **Availability**: 99.9% uptime
- **Error Rate**: < 0.1%

## Frontend Entegrasyon Rehberi

### Quick Start

**API Configuration:**
```typescript
const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  version: 'v1',
  timeout: 10000,
};
```

**Authentication Flow:**
```typescript
// 1. Login
const { data } = await api.post('/v1/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = data.access_token;
localStorage.setItem('token', token);

// 2. Use token
const response = await api.get('/v1/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**OAuth Flow:**
```typescript
// 1. Get OAuth URL
const { data } = await api.get('/v1/auth/google');
window.location.href = data.url;

// 2. Handle callback
const code = new URLSearchParams(window.location.search).get('code');
const { data } = await api.get(`/v1/auth/google/callback?code=${code}`);
localStorage.setItem('token', data.access_token);
```

### Error Handling

**Standardized Error Format:**
```json
{
  "statusCode": 400,
  "message": ["Validation failed"],
  "error": "BadRequest",
  "path": "/v1/auth/login",
  "method": "POST",
  "timestamp": "2024-01-15T10:00:00Z",
  "requestId": "uuid",
  "errors": [
    {"field": "email", "message": "Invalid email"}
  ]
}
```

**Error Handling Example:**
```typescript
try {
  await api.post('/v1/auth/login', credentials);
} catch (error) {
  if (error.response?.status === 401) {
    // Invalid credentials
  } else if (error.response?.status === 429) {
    // Rate limited - check Retry-After header
    const retryAfter = error.response.headers['retry-after'];
  } else if (error.response?.data?.errors) {
    // Validation errors
    error.response.data.errors.forEach(err => {
      console.error(`${err.field}: ${err.message}`);
    });
  }
}
```

### Rate Limiting

**Response Headers:**
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (unix timestamp)
- `Retry-After`: Seconds to wait (on 429 errors)

**Frontend Handling:**
```typescript
const response = await api.post('/v1/auth/login', data);

// Check rate limit
const limit = response.headers['x-ratelimit-limit'];
const remaining = response.headers['x-ratelimit-remaining'];
console.log(`Rate limit: ${remaining}/${limit} remaining`);
```

### Request Tracking

**Every response includes:**
- `X-Request-ID`: Unique request identifier

**Usage:**
```typescript
// Optional: Send request ID
const requestId = crypto.randomUUID();
await api.get('/v1/users/me', {
  headers: { 'X-Request-ID': requestId }
});

// Response echoes back the ID
const responseId = response.headers['x-request-id'];
```

### Documentation Resources

- **Swagger UI**: http://localhost:3000/api/docs
- **Frontend Setup Guide**: [FRONTEND_SETUP_GUIDE.md](../FRONTEND_SETUP_GUIDE.md)
- **OAuth Guide**: [README_OAUTH.md](../README_OAUTH.md)
- **Integration Report**: [FRONTEND_INTEGRATION_REPORT.md](../FRONTEND_INTEGRATION_REPORT.md)
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics

### CORS Configuration

- **Enabled**: Yes
- **Origins**: Configurable via `CORS_ORIGIN` env
- **Credentials**: Supported
- **Exposed Headers**:
  - `X-Request-ID` 
  - `X-RateLimit-Limit` 
  - `X-RateLimit-Remaining` 
  - `X-RateLimit-Reset` 
  - `Retry-After` 

## Future Enhancements

- [ ] OAuth2 full implementation (Google, GitHub)
- [ ] WebSocket support for real-time features
- [ ] GraphQL gateway layer
- [ ] Advanced caching strategies (Redis)
- [ ] Request/Response logging to database
- [ ] Advanced analytics and reporting
- [ ] API key management
- [ ] Webhook support
- [ ] Rate limiting per user/API key
- [ ] Service mesh integration (Istio)
