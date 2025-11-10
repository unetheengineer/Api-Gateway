import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { CircuitBreakerService } from '../../common/sercvices/circuit-breaker.service';

@Module({
  controllers: [HealthController],
  providers: [CircuitBreakerService],
})
export class HealthModule {}
