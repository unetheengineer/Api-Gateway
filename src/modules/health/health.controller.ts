import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { CircuitBreakerService } from '../../common/sercvices/circuit-breaker.service';
import { RabbitMQHealthIndicator } from './rabbitmq.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly coreServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly rabbitmqHealthIndicator: RabbitMQHealthIndicator,
  ) {
    this.coreServiceUrl =
      this.configService.get<string>('CORE_SERVICE_URL') ??
      'http://localhost:3001';
  }

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check API Gateway and Core Service health status',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-10-18T12:00:00.000Z',
        uptime: 3600.5,
        environment: 'development',
        services: {
          apiGateway: {
            status: 'healthy',
            version: '1.0.0',
            port: 3000,
          },
          coreService: {
            status: 'healthy',
            url: 'http://localhost:3001',
            responseTime: 45,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
    schema: {
      example: {
        status: 'error',
        timestamp: '2025-10-18T12:00:00.000Z',
        services: {
          coreService: {
            status: 'unhealthy',
            error: 'Connection timeout',
          },
        },
      },
    },
  })
  async healthCheck() {
    const startTime = Date.now();

    // Core Service health check
    const coreServiceHealth = await this.checkCoreService();
    const coreServiceResponseTime = Date.now() - startTime;

    const healthStatus = {
      status: coreServiceHealth.status === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        apiGateway: {
          status: 'healthy',
          version: '1.0.0',
          port: process.env.PORT || 3000,
        },
        coreService: {
          ...coreServiceHealth,
          url: this.coreServiceUrl,
          responseTime: coreServiceResponseTime,
        },
      },
    };

    // If core service is down, return 503
    if (coreServiceHealth.status === 'unhealthy') {
      this.logger.warn('Health check failed: Core Service is unhealthy');
      throw new HttpException(healthStatus, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return healthStatus;
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Check if service is ready to accept traffic (Kubernetes readiness probe)',
  })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readinessCheck() {
    const coreServiceHealth = await this.checkCoreService();

    if (coreServiceHealth.status === 'unhealthy') {
      throw new HttpException(
        'Service not ready',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

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

  @Get('rabbitmq')
  @ApiOperation({
    summary: 'RabbitMQ health check',
    description: 'Check RabbitMQ connection status',
  })
  @ApiResponse({ status: 200, description: 'RabbitMQ is healthy' })
  @ApiResponse({ status: 503, description: 'RabbitMQ is unhealthy' })
  async rabbitmqHealthCheck() {
    try {
      const result = await this.rabbitmqHealthIndicator.isHealthy('rabbitmq');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        rabbitmq: result,
      };
    } catch (error: any) {
      this.logger.error('RabbitMQ health check failed:', error);
      throw new HttpException(
        {
          status: 'error',
          timestamp: new Date().toISOString(),
          message: error.message || 'RabbitMQ health check failed',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async checkCoreService(): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/health`).pipe(
          timeout(3000), // 3 second timeout
          catchError((error) => {
            throw error;
          }),
        ),
      );
      return { status: 'healthy' };
    } catch (error: any) {
      this.logger.error(`Core Service health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        error: error.message || 'Connection failed',
      };
    }
  }
}
