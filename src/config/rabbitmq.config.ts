export interface RabbitMQConfig {
  url: string;
  queue: string;
  prefetchCount: number;
  noAck: boolean;
  queueOptions: {
    durable: boolean;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    messageTtl?: number;
  };
}

export const rabbitmqConfig = (): RabbitMQConfig => ({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  queue: process.env.RABBITMQ_QUEUE || 'api-gateway',
  prefetchCount: parseInt(process.env.RABBITMQ_PREFETCH || '10', 10),
  noAck: false,
  queueOptions: {
    durable: true,
    deadLetterExchange: 'lifeplaneer.dlx',
    deadLetterRoutingKey: 'dead-letter',
    messageTtl: 300000, // 5 minutes
  },
});

export default rabbitmqConfig;
