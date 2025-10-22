import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let errorName = 'InternalServerError';
    let validationErrors: any[] | undefined;
    let errorDetails: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      // Extract error name from exception
      errorName = exception.constructor.name.replace('Exception', '');
      
      // Handle different response formats
      if (typeof res === 'string') {
        message = [res];
      } else if (typeof res === 'object') {
        const resObj = res as any;
        message = Array.isArray(resObj.message) 
          ? resObj.message 
          : [resObj.message || resObj.error || 'Unknown error'];
        
        // Extract validation errors if present
        if (resObj.errors && Array.isArray(resObj.errors)) {
          validationErrors = resObj.errors;
        }
      } else {
        message = [String(res)];
      }
    } else if (exception instanceof Error) {
      const error = exception as any;
      errorName = error.constructor.name;

      // Handle network errors
      if (error.code === 'ECONNREFUSED') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = ['Service unavailable - Connection refused'];
        errorDetails = {
          code: 'ECONNREFUSED',
          hint: 'The target service is not running or not accepting connections',
        };
      } else if (error.code === 'ENOTFOUND') {
        status = HttpStatus.BAD_GATEWAY;
        message = ['Bad gateway - Host not found'];
        errorDetails = {
          code: 'ENOTFOUND',
          hint: 'The target service URL is invalid or unreachable',
        };
      } else if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
        status = HttpStatus.GATEWAY_TIMEOUT;
        message = ['Gateway timeout - Request took too long'];
        errorDetails = {
          code: error.code || 'ETIMEDOUT',
          hint: 'The target service is not responding in time',
        };
      } else if (error.code === 'EHOSTUNREACH') {
        status = HttpStatus.BAD_GATEWAY;
        message = ['Bad gateway - Host unreachable'];
        errorDetails = {
          code: 'EHOSTUNREACH',
          hint: 'The target service host is unreachable',
        };
      } else if (error.code === 'ECONNRESET') {
        status = HttpStatus.BAD_GATEWAY;
        message = ['Bad gateway - Connection reset'];
        errorDetails = {
          code: 'ECONNRESET',
          hint: 'The connection to the target service was reset',
        };
      } else {
        message = [error.message || 'Internal server error'];
      }
    }

    // ✅ STANDARDIZED ERROR RESPONSE FORMAT
    const errorResponse: any = {
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error: errorName,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      requestId: (request as any).id || 'unknown',
    };

    // Add validation errors if present
    if (validationErrors) {
      errorResponse.errors = validationErrors;
    }

    // Add error details if present
    if (Object.keys(errorDetails).length > 0) {
      errorResponse.details = errorDetails;
    }

    // Log error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} : ${JSON.stringify(errorResponse)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${status} : ${JSON.stringify(errorResponse)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
export {};
