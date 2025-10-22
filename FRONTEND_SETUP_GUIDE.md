# Frontend Setup Guide

## Quick Start

### 1. API Configuration

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  version: 'v1',
  timeout: 10000,
};
```

### 2. API Client Setup

```typescript
// src/services/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_CONFIG.baseURL}/${API_CONFIG.version}`,
      timeout: API_CONFIG.timeout,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracking
      config.headers['X-Request-ID'] = crypto.randomUUID();
      return config;
    });

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.client.post('/auth/refresh', {
              refresh_token: localStorage.getItem('refresh_token'),
            });

            const { access_token, refresh_token } = response.data.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle 429 - rate limited
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          console.error(`Rate limited! Retry after ${retryAfter} seconds`);
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
```

## Authentication

### Email/Password Login

```typescript
// src/services/auth.service.ts
import { apiClient } from './api-client';

export async function login(email: string, password: string) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const { access_token, refresh_token, user } = response.data.data;

    // Store tokens
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));

    return { success: true, user };
  } catch (error: any) {
    const message =
      error.response?.data?.message?.[0] || 'Login failed';
    return { success: false, error: message };
  }
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout', {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error);
    return { success: false };
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}
```

### OAuth Login

```typescript
// src/services/oauth.service.ts
import { apiClient } from './api-client';

export async function getGoogleAuthUrl(redirectUri?: string) {
  try {
    const response = await apiClient.get('/auth/google', {
      params: {
        redirect_uri: redirectUri || `${window.location.origin}/auth/callback`,
      },
    });
    return response.data.data.url;
  } catch (error) {
    console.error('Failed to get Google OAuth URL:', error);
    throw error;
  }
}

export async function getGithubAuthUrl(redirectUri?: string) {
  try {
    const response = await apiClient.get('/auth/github', {
      params: {
        redirect_uri: redirectUri || `${window.location.origin}/auth/callback`,
      },
    });
    return response.data.data.url;
  } catch (error) {
    console.error('Failed to get GitHub OAuth URL:', error);
    throw error;
  }
}

export async function handleOAuthCallback(
  provider: 'google' | 'github',
  code: string,
  state?: string
) {
  try {
    const response = await apiClient.get(`/auth/${provider}/callback`, {
      params: { code, state },
    });

    const { access_token, refresh_token, user } = response.data.data;

    // Store tokens
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));

    return { success: true, user };
  } catch (error: any) {
    const message =
      error.response?.data?.message?.[0] || 'OAuth callback failed';
    return { success: false, error: message };
  }
}
```

### OAuth Callback Component (React)

```typescript
// src/pages/OAuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback } from '../services/oauth.service';

export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for OAuth errors
      if (error) {
        console.error('OAuth error:', error);
        navigate(`/login?error=${error}`);
        return;
      }

      if (!code) {
        navigate('/login?error=missing_code');
        return;
      }

      try {
        // Determine provider from URL
        const provider = window.location.pathname.includes('google')
          ? 'google'
          : 'github';

        // Handle callback
        const result = await handleOAuthCallback(provider, code, state || undefined);

        if (result.success) {
          navigate('/dashboard');
        } else {
          navigate(`/login?error=${result.error}`);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return <div>Processing OAuth callback...</div>;
}
```

## Error Handling

### Standardized Error Response Format

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string[];
  error: string;
  path: string;
  method: string;
  timestamp: string;
  requestId: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  details?: Record<string, any>;
}
```

### Error Handler Hook (React)

```typescript
// src/hooks/useApiError.ts
import { AxiosError } from 'axios';

export function useApiError() {
  const handleError = (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        // Validation error
        if (data?.errors) {
          return {
            type: 'validation',
            message: 'Validation failed',
            errors: data.errors,
          };
        }
        return {
          type: 'bad_request',
          message: data?.message?.[0] || 'Bad request',
        };

      case 401:
        // Unauthorized
        return {
          type: 'unauthorized',
          message: 'Please log in again',
        };

      case 429:
        // Rate limited
        const retryAfter = error.response?.headers['retry-after'];
        return {
          type: 'rate_limited',
          message: `Too many requests. Try again in ${retryAfter} seconds`,
          retryAfter: parseInt(retryAfter || '60'),
        };

      case 500:
      case 503:
        // Server error
        return {
          type: 'server_error',
          message: 'Server error. Please try again later',
        };

      default:
        return {
          type: 'unknown',
          message: error.message || 'An error occurred',
        };
    }
  };

  return { handleError };
}
```

## Rate Limiting

### Rate Limit Headers

Every response includes rate limit information:

```typescript
// Access rate limit headers
const response = await apiClient.get('/users/me');
const limit = response.headers['x-ratelimit-limit'];
const remaining = response.headers['x-ratelimit-remaining'];
const reset = response.headers['x-ratelimit-reset'];

console.log(`Rate limit: ${remaining}/${limit}`);
console.log(`Resets at: ${new Date(parseInt(reset) * 1000).toISOString()}`);
```

### Rate Limit Hook (React)

```typescript
// src/hooks/useRateLimit.ts
import { useState, useEffect } from 'react';
import { AxiosResponse } from 'axios';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  percentage: number;
}

export function useRateLimit() {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  const updateRateLimit = (response: AxiosResponse) => {
    const limit = parseInt(response.headers['x-ratelimit-limit'] || '100');
    const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '100');
    const reset = parseInt(response.headers['x-ratelimit-reset'] || '0');

    setRateLimit({
      limit,
      remaining,
      reset: new Date(reset * 1000),
      percentage: (remaining / limit) * 100,
    });
  };

  return { rateLimit, updateRateLimit };
}
```

## Request Tracking

### Request ID Header

Every request includes a unique `X-Request-ID` header for tracking:

```typescript
// Automatically added by API client
const requestId = response.headers['x-request-id'];
console.log('Request ID:', requestId);
```

### Logging with Request ID

```typescript
// src/utils/logger.ts
export function logWithRequestId(message: string, requestId: string) {
  console.log(`[${requestId}] ${message}`);
}
```

## Environment Variables

### .env.local

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id

# Feature Flags
VITE_ENABLE_OAUTH=true
VITE_ENABLE_RATE_LIMIT_DISPLAY=true
```

## Protected Routes (React Router)

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth.service';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

// Usage
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/auth/callback" element={<OAuthCallback />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

## Testing with Postman

### 1. Login

- Method: POST
- URL: `http://localhost:3000/v1/auth/login`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### 2. Get Current User

- Method: GET
- URL: `http://localhost:3000/v1/users/me`
- Headers: `Authorization: Bearer <access_token>`

### 3. Check Rate Limit

- Make multiple requests and check response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Troubleshooting

### "CORS error"

- Check `CORS_ORIGIN` environment variable
- Verify frontend URL is in allowed origins
- Check browser console for exact error

### "401 Unauthorized"

- Token might be expired
- Try refreshing token with `/auth/refresh`
- If refresh fails, redirect to login

### "429 Too Many Requests"

- Check `Retry-After` header
- Wait before retrying
- Consider implementing exponential backoff

### "Network error"

- Check if API Gateway is running
- Verify `VITE_API_BASE_URL` is correct
- Check Core Service is running (for backend calls)

## Resources

- **API Documentation**: http://localhost:3000/api/docs
- **OAuth Guide**: [README_OAUTH.md](README_OAUTH.md)
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics
