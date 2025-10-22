import {
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

export const metricsProviders = [
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  }),
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),
  makeCounterProvider({
    name: 'rabbitmq_messages_sent_total',
    help: 'Total RabbitMQ messages sent',
    labelNames: ['pattern', 'type'],
  }),
  makeCounterProvider({
    name: 'rabbitmq_messages_received_total',
    help: 'Total RabbitMQ messages received',
    labelNames: ['pattern', 'status'],
  }),
  makeHistogramProvider({
    name: 'rabbitmq_rpc_duration_seconds',
    help: 'RabbitMQ RPC call duration',
    labelNames: ['pattern', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),
  makeGaugeProvider({
    name: 'rabbitmq_pending_replies',
    help: 'Number of pending RPC replies',
  }),
];
