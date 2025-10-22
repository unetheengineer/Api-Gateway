import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { CircuitBreakerService }  from '../../common/sercvices/circuit-breaker.service';
import { CoreServiceHealthIndicator } from './core-service.health';


@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [HealthController],
  providers: [CircuitBreakerService, CoreServiceHealthIndicator],
  exports: [CoreServiceHealthIndicator],
})
export class HealthModule {}