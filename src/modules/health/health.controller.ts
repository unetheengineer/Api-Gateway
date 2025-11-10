import {
  Controller,
  Get,
  Post,
  Param,
  Logger,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CircuitBreakerService } from '../../common/sercvices/circuit-breaker.service';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly circuitBreakerService: CircuitBreakerService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check API Gateway health status',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-10-18T12:00:00.000Z',
        uptime: 3600.5,
        environment: 'production',
        version: '1.0.0',
        port: 3000,
      },
    },
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      port: process.env.PORT || 3000,
    };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Check if service is ready to accept traffic (Kubernetes readiness probe)',
  })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async readinessCheck() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Check if service is alive (Kubernetes liveness probe)',
  })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async livenessCheck() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  // ============================================
  // CIRCUIT BREAKER ENDPOINTS
  // ============================================

  @Get('circuit')
  @ApiOperation({
    summary: 'Get all circuit breaker status',
    description: 'Returns status of all circuit breakers',
  })
  @ApiResponse({
    status: 200,
    description: 'Circuit breaker status',
    schema: {
      example: {
        'core-service': {
          name: 'core-service',
          state: 'CLOSED',
          stats: {
            fires: 0,
            failures: 0,
            successes: 5,
            rejects: 0,
            timeouts: 0,
            cacheHits: 0,
            cacheMisses: 0,
            semaphoreRejections: 0,
          },
          config: {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
          },
        },
      },
    },
  })
  getCircuitStatus() {
    return this.circuitBreakerService.getAllStatus();
  }

  @Get('circuit/:name')
  @ApiOperation({
    summary: 'Get specific circuit breaker status',
    description: 'Returns status of a specific circuit breaker by name',
  })
  @ApiResponse({ status: 200, description: 'Circuit breaker status' })
  @ApiResponse({ status: 404, description: 'Circuit breaker not found' })
  getCircuitStatusByName(@Param('name') name: string) {
    return this.circuitBreakerService.getStatus(name);
  }

  @Post('circuit/:name/open')
  @ApiOperation({
    summary: 'Manually open circuit breaker',
    description: 'Force open a circuit breaker (test only)',
  })
  @ApiResponse({ status: 200, description: 'Circuit breaker opened' })
  forceOpenCircuit(@Param('name') name: string) {
    this.circuitBreakerService.forceOpen(name);
    return {
      message: `Circuit breaker [${name}] manually opened`,
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('circuit/:name/close')
  @ApiOperation({
    summary: 'Manually close circuit breaker',
    description: 'Force close a circuit breaker (test only)',
  })
  @ApiResponse({ status: 200, description: 'Circuit breaker closed' })
  forceCloseCircuit(@Param('name') name: string) {
    this.circuitBreakerService.forceClose(name);
    return {
      message: `Circuit breaker [${name}] manually closed`,
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // CACHE TEST ENDPOINTS (Removed for clean template)
  // To enable caching, add CacheModule to app.module.ts
  // ============================================

}
