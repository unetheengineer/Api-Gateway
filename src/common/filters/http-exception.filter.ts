import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let errorDetails: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? res;
    } else if (exception instanceof Error) {
      const error = exception as any;

      // Handle network errors
      if (error.code === 'ECONNREFUSED') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Service unavailable - Connection refused';
        errorDetails = { code: 'ECONNREFUSED', hint: 'The target service is not running or not accepting connections' };
      } else if (error.code === 'ENOTFOUND') {
        status = HttpStatus.BAD_GATEWAY;
        message = 'Bad gateway - Host not found';
        errorDetails = { code: 'ENOTFOUND', hint: 'The target service URL is invalid or unreachable' };
      } else if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
        status = HttpStatus.GATEWAY_TIMEOUT;
        message = 'Gateway timeout - Request took too long';
        errorDetails = { code: error.code || 'ETIMEDOUT', hint: 'The target service is not responding in time' };
      } else if (error.code === 'EHOSTUNREACH') {
        status = HttpStatus.BAD_GATEWAY;
        message = 'Bad gateway - Host unreachable';
        errorDetails = { code: 'EHOSTUNREACH', hint: 'The target service host is unreachable' };
      } else if (error.code === 'ECONNRESET') {
        status = HttpStatus.BAD_GATEWAY;
        message = 'Bad gateway - Connection reset';
        errorDetails = { code: 'ECONNRESET', hint: 'The connection to the target service was reset' };
      } else {
        message = error.message || 'Internal server error';
      }
    }

    const errorResponse = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(Object.keys(errorDetails).length > 0 && { details: errorDetails }),
    };

    this.logger.error(
      `${request.method} ${request.url} -> ${status} : ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
export {};

