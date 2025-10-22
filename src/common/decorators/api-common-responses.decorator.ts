import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation error',
      schema: {
        example: {
          statusCode: 400,
          message: ['Validation error message'],
          error: 'BadRequest',
          path: '/v1/auth/login',
          method: 'POST',
          timestamp: '2024-01-15T10:00:00.000Z',
          requestId: 'uuid-here',
          errors: [
            {
              field: 'email',
              message: 'Email must be valid',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
      schema: {
        example: {
          statusCode: 401,
          message: ['Unauthorized'],
          error: 'Unauthorized',
          path: '/v1/users/me',
          method: 'GET',
          timestamp: '2024-01-15T10:00:00.000Z',
          requestId: 'uuid-here',
        },
      },
    }),
    ApiResponse({
      status: 429,
      description: 'Too Many Requests - Rate limit exceeded',
      schema: {
        example: {
          statusCode: 429,
          message: ['ThrottlerException: Too Many Requests'],
          error: 'ThrottlerException',
          path: '/v1/auth/login',
          method: 'POST',
          timestamp: '2024-01-15T10:00:00.000Z',
          requestId: 'uuid-here',
        },
      },
      headers: {
        'X-RateLimit-Limit': {
          description: 'Maximum requests per window',
          schema: { type: 'integer', example: 100 },
        },
        'X-RateLimit-Remaining': {
          description: 'Remaining requests in window',
          schema: { type: 'integer', example: 0 },
        },
        'X-RateLimit-Reset': {
          description: 'Time when rate limit resets (unix timestamp)',
          schema: { type: 'integer', example: 1705315200 },
        },
        'Retry-After': {
          description: 'Seconds to wait before retrying',
          schema: { type: 'integer', example: 60 },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        example: {
          statusCode: 500,
          message: ['Internal server error'],
          error: 'InternalServerError',
          path: '/v1/auth/login',
          method: 'POST',
          timestamp: '2024-01-15T10:00:00.000Z',
          requestId: 'uuid-here',
        },
      },
    }),
    ApiResponse({
      status: 503,
      description: 'Service Unavailable - Core service down',
      schema: {
        example: {
          statusCode: 503,
          message: ['Service unavailable - Connection refused'],
          error: 'ServiceUnavailable',
          path: '/v1/auth/login',
          method: 'POST',
          timestamp: '2024-01-15T10:00:00.000Z',
          requestId: 'uuid-here',
          details: {
            code: 'ECONNREFUSED',
            hint: 'The target service is not running or not accepting connections',
          },
        },
      },
    }),
  );
}
