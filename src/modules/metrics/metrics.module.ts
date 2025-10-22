import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
      defaultLabels: {
        app: 'api-gateway',
      },
    }),
  ],
})
export class MetricsModule {}