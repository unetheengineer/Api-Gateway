export interface ExchangeConfig {
  name: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  options?: {
    durable?: boolean;
    autoDelete?: boolean;
    internal?: boolean;
    alternateExchange?: string;
  };
}

export interface QueueConfig {
  name: string;
  options?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    messageTtl?: number;
    maxLength?: number;
  };
}

export interface BindingConfig {
  exchange: string;
  queue: string;
  routingKey: string;
}

export const RabbitMQTopology = {
  exchanges: {
    events: {
      name: 'lifeplaneer.events',
      type: 'topic' as const,
      options: { durable: true },
    },
    rpc: {
      name: 'lifeplaneer.rpc',
      type: 'direct' as const,
      options: { durable: true },
    },
    dlx: {
      name: 'lifeplaneer.dlx',
      type: 'fanout' as const,
      options: { durable: true },
    },
  },

  queues: {
    gatewayResponses: {
      name: 'gateway.responses',
      options: { durable: true, exclusive: false },
    },
    coreUserCommands: {
      name: 'core.user.commands',
      options: {
        durable: true,
        deadLetterExchange: 'lifeplaneer.dlx',
      },
    },
    coreAuthCommands: {
      name: 'core.auth.commands',
      options: {
        durable: true,
        deadLetterExchange: 'lifeplaneer.dlx',
      },
    },
    deadLetterQueue: {
      name: 'dead-letter.queue',
      options: { durable: true },
    },
  },

  bindings: [
    {
      exchange: 'lifeplaneer.events',
      queue: 'core.user.commands',
      routingKey: 'user.*',
    },
    {
      exchange: 'lifeplaneer.events',
      queue: 'core.auth.commands',
      routingKey: 'auth.*',
    },
    {
      exchange: 'lifeplaneer.dlx',
      queue: 'dead-letter.queue',
      routingKey: '',
    },
  ],
};
