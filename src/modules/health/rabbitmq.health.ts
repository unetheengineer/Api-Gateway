import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { MessagingService } from '../messaging/messaging.service';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RabbitMQHealthIndicator.name);

  constructor(private messagingService: MessagingService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.messagingService.isHealthy();
    const stats = this.messagingService.getConnectionStats();

    const result = this.getStatus(key, isHealthy, {
      connected: isHealthy,
      url: stats.url,
      channels: stats.channelCount,
      pendingReplies: stats.pendingReplies,
      reconnectAttempts: stats.reconnectAttempts,
    });

    if (isHealthy) {
      this.logger.debug(`✅ RabbitMQ health check passed`);
      return result;
    }

    this.logger.warn(`❌ RabbitMQ health check failed`);
    throw new HealthCheckError('RabbitMQ check failed', result);
  }
}
