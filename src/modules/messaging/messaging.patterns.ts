export enum MessagePattern {
  // RPC Patterns (Request-Reply)
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_GET = 'user.get',

  AUTH_LOGIN = 'auth.login',
  AUTH_REGISTER = 'auth.register',
  AUTH_REFRESH = 'auth.refresh',
  AUTH_LOGOUT = 'auth.logout',

  // Event Patterns (Fire-and-Forget)
  USER_REGISTERED = 'event.user.registered',
  USER_UPDATED = 'event.user.updated',
  USER_DELETED = 'event.user.deleted',

  AUTH_LOGIN_SUCCESS = 'event.auth.login.success',
  AUTH_LOGIN_FAILED = 'event.auth.login.failed',
  AUTH_LOGOUT_SUCCESS = 'event.auth.logout.success',

  // Background Job Patterns
  EMAIL_SEND = 'job.email.send',
  EMAIL_WELCOME = 'job.email.welcome',
  EMAIL_RESET_PASSWORD = 'job.email.reset-password',

  REPORT_GENERATE = 'job.report.generate',
  NOTIFICATION_SEND = 'job.notification.send',
}

export interface MessageEnvelope<T = any> {
  pattern: MessagePattern | string;
  data: T;
  metadata: {
    correlationId: string;
    timestamp: number;
    userId?: string;
    requestId?: string;
    source?: string;
    retryCount?: number;
  };
}
