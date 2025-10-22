import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    public requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    public requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000;
          const labels = {
            method: req.method,
            route: req.route?.path || req.url,
            status_code: res.statusCode.toString(),
          };

          this.requestCounter.inc(labels);
          this.requestDuration.observe(labels, duration);
        },
        error: (error) => {
          const duration = (Date.now() - start) / 1000;
          const labels = {
            method: req.method,
            route: req.route?.path || req.url,
            status_code: error.status?.toString() || '500',
          };

          this.requestCounter.inc(labels);
          this.requestDuration.observe(labels, duration);
        },
      }),
    );
  }
}