import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import CircuitBreaker = require('opossum');

interface BreakerConfig {
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
}

@Injectable()
export class CircuitBreakerService implements OnModuleInit {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers: Map<string, CircuitBreaker<any[], any>> = new Map();
  private configs: Map<string, BreakerConfig> = new Map(); // ✅ Config'leri sakla

  onModuleInit() {
    // Core Service circuit breaker
    this.createBreaker('core-service', {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
    });
  }

  createBreaker(name: string, options: CircuitBreaker.Options) {
    const breaker = new CircuitBreaker(async () => {}, {
      ...options,
      name,
    });

    // Config'i sakla
    this.configs.set(name, {
      timeout: options.timeout || 5000,
      errorThresholdPercentage: options.errorThresholdPercentage || 50,
      resetTimeout: options.resetTimeout || 30000,
    });

    // Event listeners
    breaker.on('open', () => {
      this.logger.warn(`🔴 Circuit breaker [${name}] OPENED`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`🟡 Circuit breaker [${name}] HALF-OPEN`);
    });

    breaker.on('close', () => {
      this.logger.log(`🟢 Circuit breaker [${name}] CLOSED`);
    });

    breaker.on('failure', (error) => {
      this.logger.error(`Circuit breaker [${name}] failure: ${error.message}`);
    });

    this.breakers.set(name, breaker);
    return breaker;
  }

  getBreaker(name: string): CircuitBreaker<any[], any> | undefined {
    return this.breakers.get(name);
  }

  isOpen(name: string): boolean {
    const breaker = this.breakers.get(name);
    return breaker ? breaker.opened : false;
  }

  recordSuccess(name: string) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      // Success is tracked automatically
    }
  }

  recordFailure(name: string) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.fire().catch(() => {});
    }
  }

  getStatus(name: string) {
    const breaker = this.breakers.get(name);
    const config = this.configs.get(name);

    if (!breaker) {
      return { error: 'Breaker not found' };
    }

    return {
      name,
      state: breaker.opened
        ? 'OPEN'
        : breaker.halfOpen
          ? 'HALF_OPEN'
          : 'CLOSED',
      stats: breaker.stats,
      config: config || {}, // ✅ Saklanan config'i kullan
    };
  }

  getAllStatus() {
    const statuses: any = {};
    this.breakers.forEach((breaker, name) => {
      statuses[name] = this.getStatus(name);
    });
    return statuses;
  }

  forceOpen(name: string) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.open();
      this.logger.warn(`🔴 Circuit breaker [${name}] MANUALLY OPENED`);
    }
  }

  forceClose(name: string) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.close();
      this.logger.log(`🟢 Circuit breaker [${name}] MANUALLY CLOSED`);
    }
  }
}
