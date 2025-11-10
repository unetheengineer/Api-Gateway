import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .messages({
      'any.only': 'NODE_ENV must be one of: development, production, test',
    }),

  PORT: Joi.number().port().default(3000).messages({
    'number.port': 'PORT must be a valid port number (0-65535)',
  }),

  CORE_SERVICE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .messages({
      'string.uri': 'CORE_SERVICE_URL must be a valid HTTP/HTTPS URL',
    }),

  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters long',
    'any.required': 'JWT_SECRET is required',
  }),

  JWT_EXPIRES_IN: Joi.string().default('15m').messages({
    'string.base': 'JWT_EXPIRES_IN must be a string (e.g., "15m", "24h", "7d")',
  }),

  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000,http://localhost:5173')
    .messages({
      'string.base': 'CORS_ORIGIN must be a comma-separated string of URLs',
    }),

  THROTTLE_LIMIT: Joi.number().default(100).min(1).messages({
    'number.min': 'THROTTLE_LIMIT must be at least 1',
  }),

  THROTTLE_TTL: Joi.number().default(60).min(1).messages({
    'number.min': 'THROTTLE_TTL must be at least 1 second',
  }),

  THROTTLE_ENABLED: Joi.string()
    .valid('true', 'false')
    .default('true')
    .messages({
      'any.only': 'THROTTLE_ENABLED must be "true" or "false"',
    }),

  CACHE_TTL: Joi.number().default(300).min(0).messages({
    'number.min': 'CACHE_TTL must be 0 or greater',
  }),

  LOG_LEVEL: Joi.string()
    .valid('debug', 'log', 'warn', 'error', 'verbose')
    .default('log')
    .messages({
      'any.only': 'LOG_LEVEL must be one of: debug, log, warn, error, verbose',
    }),
});
