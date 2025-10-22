import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

@Injectable()
export class CoreServiceHealthIndicator {
  private readonly logger = new Logger(CoreServiceHealthIndicator.name);
  private readonly coreServiceUrl: string;
  private readonly healthCheckTimeout = 5000; // 5 seconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreServiceUrl =
      this.configService.get<string>('CORE_SERVICE_URL') ??
      'http://localhost:3001';
  }

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.coreServiceUrl}/health`).pipe(
          timeout(this.healthCheckTimeout),
          catchError((error) => {
            throw error;
          }),
        ),
      );

      const responseTime = Date.now() - startTime;

      this.logger.debug(
        `Core Service health check successful (${responseTime}ms)`,
      );

      return {
        status: 'healthy',
        responseTime,
        details: {
          statusCode: response.status,
          url: this.coreServiceUrl,
        },
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = this.getErrorMessage(error);

      this.logger.warn(
        `Core Service health check failed: ${errorMessage} (${responseTime}ms)`,
      );

      return {
        status: 'unhealthy',
        responseTime,
        error: errorMessage,
        details: {
          url: this.coreServiceUrl,
          errorCode: error.code,
          errorName: error.name,
        },
      };
    }
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused - Core Service is not running';
    }

    if (error.code === 'ENOTFOUND') {
      return 'Host not found - Invalid Core Service URL';
    }

    if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      return 'Request timeout - Core Service is not responding';
    }

    if (error.response?.status) {
      return `HTTP ${error.response.status} - ${error.response.statusText || 'Error'}`;
    }

    return error.message || 'Unknown error';
  }
}
