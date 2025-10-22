# OAuth Authentication Guide

## Overview

API Gateway supports OAuth 2.0 authentication with Google and GitHub. The OAuth logic is handled by the Core Service, while the API Gateway acts as a proxy and handles event publishing.

## OAuth Flow

### 1. Frontend Initiates OAuth

```typescript
// Step 1: Get OAuth authorization URL
const response = await fetch('http://localhost:3000/v1/auth/google?redirect_uri=http://localhost:5173/auth/callback');
const { data } = await response.json();

// Step 2: Redirect user to OAuth provider
window.location.href = data.url;
```

### 2. User Authenticates with Provider

- User is redirected to Google/GitHub login page
- User grants permissions
- Provider redirects back to callback URL with `code` and `state`

### 3. Frontend Handles Callback

```typescript
// Step 3: Extract code from URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');
const error = urlParams.get('error');

// Step 4: Handle errors
if (error) {
  console.error('OAuth error:', error);
  // Redirect to login page
  return;
}

// Step 5: Send code to API Gateway
const callbackResponse = await fetch(
  `http://localhost:3000/v1/auth/google/callback?code=${code}&state=${state}`
);
const { data: authData } = await callbackResponse.json();

// Step 6: Store tokens
localStorage.setItem('access_token', authData.access_token);
localStorage.setItem('refresh_token', authData.refresh_token);
localStorage.setItem('user', JSON.stringify(authData.user));

// Step 7: Redirect to dashboard
window.location.href = '/dashboard';
```

## Endpoints

### Get Google OAuth URL

```
GET /v1/auth/google?redirect_uri=http://localhost:5173/auth/callback
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  },
  "timestamp": "2025-10-22T12:00:00.000Z"
}
```

### Get GitHub OAuth URL

```
GET /v1/auth/github?redirect_uri=http://localhost:5173/auth/callback
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "url": "https://github.com/login/oauth/authorize?client_id=..."
  },
  "timestamp": "2025-10-22T12:00:00.000Z"
}
```

### Google OAuth Callback

```
GET /v1/auth/google/callback?code=xxx&state=yyy
```

**Response (Success):**
```json
{
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "user-123",
      "email": "user@gmail.com",
      "name": "John Doe",
      "avatar": "https://lh3.googleusercontent.com/...",
      "provider": "google"
    },
    "isNewUser": false
  },
  "timestamp": "2025-10-22T12:00:00.000Z"
}
```

**Response (Error):**
```json
{
  "statusCode": 400,
  "message": "Invalid OAuth code",
  "error": "Bad Request",
  "timestamp": "2025-10-22T12:00:00.000Z"
}
```

### GitHub OAuth Callback

```
GET /v1/auth/github/callback?code=xxx&state=yyy
```

**Response:** Same as Google callback

## Error Handling

### Common OAuth Errors

| Error | Description | Action |
|-------|-------------|--------|
| `access_denied` | User cancelled OAuth | Show login page again |
| `invalid_request` | Invalid parameters | Check redirect_uri |
| `unauthorized_client` | Invalid client_id | Check Core Service config |
| `invalid_code` | Code expired or invalid | Restart OAuth flow |
| `timeout` | OAuth took too long | Retry or show error |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Google OAuth authentication failed",
  "error": "Bad Request",
  "timestamp": "2025-10-22T12:00:00.000Z"
}
```

## Frontend Implementation Example

### React with TypeScript

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for errors
      if (error) {
        console.error('OAuth error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (!code) {
        navigate('/login?error=missing_code');
        return;
      }

      try {
        // Determine provider from URL
        const provider = window.location.pathname.includes('google') ? 'google' : 'github';
        
        // Call callback endpoint
        const response = await fetch(
          `http://localhost:3000/v1/auth/${provider}/callback?code=${code}&state=${state}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const { data } = await response.json();

        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        navigate('/dashboard');
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

### Routes Setup

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OAuthCallback } from './pages/OAuthCallback';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/google/callback" element={<OAuthCallback />} />
        <Route path="/auth/github/callback" element={<OAuthCallback />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Events Published

### OAuth Login Success

**Pattern:** `event.auth.login.success`

```json
{
  "userId": "user-123",
  "email": "user@gmail.com",
  "provider": "google",
  "timestamp": 1666432800000
}
```

### OAuth Login Failed

**Pattern:** `event.auth.login.failed`

```json
{
  "provider": "google",
  "error": "access_denied",
  "error_description": "User cancelled OAuth",
  "timestamp": 1666432800000
}
```

### User Registered (New User)

**Pattern:** `event.user.registered`

```json
{
  "userId": "user-123",
  "email": "user@gmail.com",
  "provider": "google",
  "timestamp": 1666432800000
}
```

### Welcome Email Job (New User)

**Pattern:** `job.email.welcome`

```json
{
  "userId": "user-123",
  "email": "user@gmail.com",
  "name": "John Doe"
}
```

## Configuration

### Environment Variables

```bash
# Core Service URL (where OAuth logic is handled)
CORE_SERVICE_URL=http://localhost:3001

# Frontend callback URL (optional, defaults to http://localhost:5173/auth/callback)
FRONTEND_CALLBACK_URL=http://localhost:5173/auth/callback
```

### Frontend Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/google/callback
VITE_GITHUB_OAUTH_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

## Testing with cURL

### Get Google OAuth URL

```bash
curl -X GET "http://localhost:3000/v1/auth/google?redirect_uri=http://localhost:5173/auth/callback"
```

### Get GitHub OAuth URL

```bash
curl -X GET "http://localhost:3000/v1/auth/github?redirect_uri=http://localhost:5173/auth/callback"
```

### Handle Callback (with mock code)

```bash
curl -X GET "http://localhost:3000/v1/auth/google/callback?code=mock-code&state=mock-state"
```

## Testing with Postman

1. **Get OAuth URL:**
   - Method: GET
   - URL: `http://localhost:3000/v1/auth/google`
   - Query Params: `redirect_uri=http://localhost:5173/auth/callback`

2. **Handle Callback:**
   - Method: GET
   - URL: `http://localhost:3000/v1/auth/google/callback`
   - Query Params: `code=xxx&state=yyy`

## Swagger Documentation

All OAuth endpoints are documented in Swagger UI:

```
http://localhost:3000/api/docs
```

Look for the "Authentication" section to see all OAuth endpoints with examples.

## Troubleshooting

### "Failed to initiate Google OAuth"

- Check `CORE_SERVICE_URL` is correct
- Verify Core Service is running
- Check network connectivity

### "Invalid OAuth code"

- Code might have expired (usually 10 minutes)
- Restart OAuth flow
- Check `redirect_uri` matches in Core Service

### "OAuth authentication timeout"

- Core Service is slow or down
- Check Core Service logs
- Increase timeout in Core Service config

### "User cancelled OAuth"

- This is normal, user clicked "Cancel" on OAuth provider
- Redirect user back to login page
- Show message: "OAuth cancelled by user"

## Best Practices

1. **Store tokens securely:**
   - Use httpOnly cookies for refresh token
   - Use localStorage for access token (or sessionStorage)
   - Never expose tokens in URL

2. **Handle token expiration:**
   - Check token expiration before API calls
   - Refresh token automatically when expired
   - Redirect to login if refresh fails

3. **Validate state parameter:**
   - Generate random state before OAuth
   - Verify state in callback
   - Prevents CSRF attacks

4. **Handle errors gracefully:**
   - Show user-friendly error messages
   - Log errors for debugging
   - Provide retry mechanism

5. **Test thoroughly:**
   - Test with real OAuth providers
   - Test error scenarios
   - Test token refresh flow
   - Test on different browsers

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
