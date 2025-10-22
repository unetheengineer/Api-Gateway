import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import * as amqpConnectionManager from 'amqp-connection-manager';
import { v4 as uuidv4 } from 'uuid';
import { MessagePattern, MessageEnvelope } from './messaging.patterns';
import { RabbitMQTopology } from '../../config/rabbitmq-topology.config';
import { rabbitmqConfig } from '../../config/rabbitmq.config';

interface PendingRpc {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timeout: NodeJS.Timeout;
}

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagingService.name);
  private connection: amqpConnectionManager.AmqpConnectionManager | null = null;
  private channel: amqp.Channel | null = null;
  private replyQueue: string = '';
  private pendingRpcs = new Map<string, PendingRpc>();
  private connectionStatus = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
    await this.setupTopology();
    void this.setupReplyHandler();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const config = rabbitmqConfig();

      // Create connection manager
      this.connection = amqpConnectionManager.connect([config.url]);

      if (!this.connection) {
        throw new Error('Failed to establish RabbitMQ connection');
      }

      // Create channel wrapper
      this.channel = this.connection.createChannel({
        setup: async (channel: amqp.Channel) => {
          await channel.prefetch(config.prefetchCount);
        },
      }) as unknown as amqp.Channel;

      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      // Setup error handlers
      this.connection.on('connect', () => {
        this.connectionStatus = true;
        this.reconnectAttempts = 0;
        this.logger.log('✅ Connected to RabbitMQ');
      });

      this.connection.on('disconnect', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.connectionStatus = false;
      });

      this.connection.on('error', (error) => {
        this.logger.error('RabbitMQ connection error:', error);
        this.connectionStatus = false;
      });

      // Trigger initial connection
      await this.connection.connect();
      this.connectionStatus = true;
      this.reconnectAttempts = 0;
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      this.reconnect();
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached`,
      );
      return;
    }

    this.reconnectAttempts++;
    this.logger.warn(
      `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    );

    setTimeout(() => {
      this.connect().catch((err) =>
        this.logger.error('Reconnect failed:', err),
      );
    }, this.reconnectDelay);
  }

  private async setupTopology(): Promise<void> {
    if (!this.channel) return;

    try {
      // Create exchanges
      for (const exchange of Object.values(RabbitMQTopology.exchanges)) {
        await this.channel.assertExchange(
          exchange.name,
          exchange.type,
          exchange.options,
        );
        this.logger.debug(`📡 Exchange created: ${exchange.name}`);
      }

      // Create queues
      for (const queue of Object.values(RabbitMQTopology.queues)) {
        await this.channel.assertQueue(queue.name, queue.options);
        this.logger.debug(`📦 Queue created: ${queue.name}`);
      }

      // Create bindings
      for (const binding of RabbitMQTopology.bindings) {
        await this.channel.bindQueue(
          binding.queue,
          binding.exchange,
          binding.routingKey,
        );
        this.logger.debug(
          `🔗 Binding created: ${binding.exchange} -> ${binding.queue}`,
        );
      }

      this.logger.log('✅ RabbitMQ topology setup complete');
    } catch (error) {
      this.logger.error('Failed to setup RabbitMQ topology:', error);
      throw error;
    }
  }

  private async setupReplyHandler(): Promise<void> {
    if (!this.channel) return;

    try {
      const replyQueueResult = await this.channel.assertQueue('', {
        exclusive: true,
      });
      this.replyQueue = replyQueueResult.queue;

      await this.channel.consume(this.replyQueue, (msg) => {
        if (!msg) return;

        const correlationId = (
          msg.properties.correlationId as Buffer
        ).toString();
        const content = JSON.parse(msg.content.toString()) as Record<
          string,
          unknown
        >;

        const pendingRpc = this.pendingRpcs.get(correlationId);
        if (pendingRpc) {
          clearTimeout(pendingRpc.timeout);
          this.pendingRpcs.delete(correlationId);

          if (msg.properties.headers?.error) {
            const errorMessage =
              typeof content.error === 'string'
                ? content.error
                : 'Unknown error';
            pendingRpc.reject(new Error(errorMessage));
          } else {
            pendingRpc.resolve(content);
          }
        }

        this.channel!.ack(msg);
      });

      this.logger.debug(`📬 Reply queue setup: ${this.replyQueue}`);
    } catch (error) {
      this.logger.error('Failed to setup reply handler:', error);
    }
  }

  async sendRpc<T = any>(
    pattern: MessagePattern | string,
    data: any,
    options: { timeout?: number } = {},
  ): Promise<T> {
    if (!this.connectionStatus || !this.channel) {
      throw new Error('RabbitMQ is not connected');
    }

    const timeout = options.timeout || 10000;
    const correlationId = uuidv4();
    const envelope: MessageEnvelope = {
      pattern,
      data,
      metadata: {
        correlationId,
        timestamp: Date.now(),
        source: 'api-gateway',
      },
    };

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRpcs.delete(correlationId);
        reject(new Error(`RPC timeout for pattern: ${pattern}`));
      }, timeout);

      this.pendingRpcs.set(correlationId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      try {
        const sent = this.channel!.sendToQueue(
          RabbitMQTopology.queues.coreUserCommands.name,
          Buffer.from(JSON.stringify(envelope)),
          {
            correlationId,
            replyTo: this.replyQueue,
            contentType: 'application/json',
            persistent: true,
          },
        );

        if (!sent) {
          throw new Error('Failed to send RPC message to queue');
        }

        this.logger.debug(`📤 RPC sent: ${pattern} (${correlationId})`);
      } catch (error) {
        clearTimeout(timeoutHandle);
        this.pendingRpcs.delete(correlationId);
        reject(error);
      }
    });
  }

  async publishEvent(
    pattern: MessagePattern | string,
    data: any,
  ): Promise<void> {
    if (!this.connectionStatus || !this.channel) {
      this.logger.warn(
        `⚠️  RabbitMQ not connected, skipping event: ${pattern}`,
      );
      return;
    }

    const envelope: MessageEnvelope = {
      pattern,
      data,
      metadata: {
        correlationId: uuidv4(),
        timestamp: Date.now(),
        source: 'api-gateway',
      },
    };

    try {
      const published = this.channel.publish(
        RabbitMQTopology.exchanges.events.name,
        pattern,
        Buffer.from(JSON.stringify(envelope)),
        {
          contentType: 'application/json',
          persistent: true,
        },
      );

      if (!published) {
        this.logger.warn(`Failed to publish event (buffer full): ${pattern}`);
        return;
      }

      this.logger.debug(`📢 Event published: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${pattern}`, error);
    }
  }

  async publishJob(
    pattern: MessagePattern | string,
    data: any,
    options: { retryCount?: number; delay?: number } = {},
  ): Promise<void> {
    if (!this.connectionStatus || !this.channel) {
      this.logger.warn(`⚠️  RabbitMQ not connected, skipping job: ${pattern}`);
      return;
    }

    const envelope: MessageEnvelope = {
      pattern,
      data,
      metadata: {
        correlationId: uuidv4(),
        timestamp: Date.now(),
        source: 'api-gateway',
        retryCount: options.retryCount || 0,
      },
    };

    try {
      const published = this.channel.publish(
        RabbitMQTopology.exchanges.events.name,
        pattern,
        Buffer.from(JSON.stringify(envelope)),
        {
          contentType: 'application/json',
          persistent: true,
          expiration: options.delay?.toString(),
        },
      );

      if (!published) {
        this.logger.warn(`Failed to publish job (buffer full): ${pattern}`);
        return;
      }

      this.logger.debug(`⚙️  Job published: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to publish job: ${pattern}`, error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.connectionStatus = false;
      this.logger.log('✅ Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  getConnectionStatus(): boolean {
    return this.connectionStatus;
  }

  getConnectionStats() {
    return {
      connected: this.connectionStatus,
      url: rabbitmqConfig().url,
      channelCount: this.channel ? 1 : 0,
      pendingReplies: this.pendingRpcs.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  isHealthy(): boolean {
    return this.connectionStatus;
  }
}
