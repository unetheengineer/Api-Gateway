import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, timeout, TimeoutError } from 'rxjs';
import { AxiosError } from 'axios';
import { MessagingService } from '../messaging/messaging.service';
import { MessagePattern } from '../messaging/messaging.patterns';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly coreServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly messagingService: MessagingService,
  ) {
    this.coreServiceUrl = this.config.get<string>('CORE_SERVICE_URL') ?? '';
  }

  async login(dto: LoginDto) {
    try {
      // Primary path: RabbitMQ RPC
      if (this.messagingService.getConnectionStatus()) {
        try {
          this.logger.debug('[HYBRID] Login via RabbitMQ RPC');
          const result = await this.messagingService.sendRpc(
            MessagePattern.AUTH_LOGIN,
            dto,
            { timeout: 10000 },
          );

          // Publish event for analytics
          await this.messagingService
            .publishEvent(MessagePattern.AUTH_LOGIN_SUCCESS, {
              email: dto.email,
              timestamp: Date.now(),
            })
            .catch((err) =>
              this.logger.warn('Failed to publish login event', err),
            );

          return result;
        } catch (rpcError: any) {
          this.logger.warn(
            `[HYBRID] RabbitMQ RPC failed: ${rpcError.message}, falling back to HTTP`,
          );
        }
      }

      // Fallback path: HTTP
      this.logger.debug('[HYBRID] Login via HTTP fallback');
      const res = await firstValueFrom(
        this.http
          .post(`${this.coreServiceUrl}/auth/login`, dto, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );

      // Publish event for analytics
      await this.messagingService
        .publishEvent(MessagePattern.AUTH_LOGIN_SUCCESS, {
          email: dto.email,
          timestamp: Date.now(),
        })
        .catch((err) => this.logger.warn('Failed to publish login event', err));

      return res.data;
    } catch (error: any) {
      // Publish failed login event
      await this.messagingService
        .publishEvent(MessagePattern.AUTH_LOGIN_FAILED, {
          email: dto.email,
          reason: 'invalid_credentials',
          timestamp: Date.now(),
        })
        .catch((err) =>
          this.logger.warn('Failed to publish login failed event', err),
        );

      if (error?.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.data || 'Login failed';
        throw new HttpException(message, status);
      }
      throw new HttpException(
        'Core service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async register(dto: RegisterDto) {
    try {
      // Primary path: RabbitMQ RPC
      if (this.messagingService.getConnectionStatus()) {
        try {
          this.logger.debug('[HYBRID] Register via RabbitMQ RPC');
          const result = await this.messagingService.sendRpc(
            MessagePattern.AUTH_REGISTER,
            dto,
            { timeout: 10000 },
          );

          // Publish event for analytics and notifications
          await this.messagingService
            .publishEvent(MessagePattern.USER_REGISTERED, {
              userId: result.user?.id,
              email: dto.email,
              timestamp: Date.now(),
            })
            .catch((err) =>
              this.logger.warn('Failed to publish user registered event', err),
            );

          // Publish welcome email job
          await this.messagingService
            .publishJob(MessagePattern.EMAIL_WELCOME, {
              userId: result.user?.id,
              email: dto.email,
            })
            .catch((err) =>
              this.logger.warn('Failed to publish welcome email job', err),
            );

          return result;
        } catch (rpcError: any) {
          this.logger.warn(
            `[HYBRID] RabbitMQ RPC failed: ${rpcError.message}, falling back to HTTP`,
          );
        }
      }

      // Fallback path: HTTP
      this.logger.debug('[HYBRID] Register via HTTP fallback');
      const res = await firstValueFrom(
        this.http
          .post(`${this.coreServiceUrl}/auth/register`, dto, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );

      // Publish events
      await this.messagingService
        .publishEvent(MessagePattern.USER_REGISTERED, {
          userId: res.data.user?.id,
          email: dto.email,
          timestamp: Date.now(),
        })
        .catch((err) =>
          this.logger.warn('Failed to publish user registered event', err),
        );

      await this.messagingService
        .publishJob(MessagePattern.EMAIL_WELCOME, {
          userId: res.data.user?.id,
          email: dto.email,
        })
        .catch((err) =>
          this.logger.warn('Failed to publish welcome email job', err),
        );

      return res.data;
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message ||
          error.response.data ||
          'Registration failed';
        throw new HttpException(message, status);
      }
      throw new HttpException(
        'Core service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      // Primary path: RabbitMQ RPC
      if (this.messagingService.getConnectionStatus()) {
        try {
          this.logger.debug('[HYBRID] Token refresh via RabbitMQ RPC');
          const result = await this.messagingService.sendRpc(
            MessagePattern.AUTH_REFRESH,
            dto,
            { timeout: 10000 },
          );
          return result;
        } catch (rpcError: any) {
          this.logger.warn(
            `[HYBRID] RabbitMQ RPC failed: ${rpcError.message}, falling back to HTTP`,
          );
        }
      }

      // Fallback path: HTTP
      this.logger.debug('[HYBRID] Token refresh via HTTP fallback');
      const res = await firstValueFrom(
        this.http
          .post(`${this.coreServiceUrl}/auth/refresh`, dto, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );
      return res.data;
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message ||
          error.response.data ||
          'Token refresh failed';
        throw new HttpException(message, status);
      }
      throw new HttpException(
        'Core service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async logout(dto: RefreshTokenDto) {
    try {
      // Primary path: RabbitMQ RPC
      if (this.messagingService.getConnectionStatus()) {
        try {
          this.logger.debug('[HYBRID] Logout via RabbitMQ RPC');
          const result = await this.messagingService.sendRpc(
            MessagePattern.AUTH_LOGOUT,
            dto,
            { timeout: 10000 },
          );

          // Publish event for analytics
          await this.messagingService
            .publishEvent(MessagePattern.AUTH_LOGOUT_SUCCESS, {
              timestamp: Date.now(),
            })
            .catch((err) =>
              this.logger.warn('Failed to publish logout event', err),
            );

          return result;
        } catch (rpcError: any) {
          this.logger.warn(
            `[HYBRID] RabbitMQ RPC failed: ${rpcError.message}, falling back to HTTP`,
          );
        }
      }

      // Fallback path: HTTP
      this.logger.debug('[HYBRID] Logout via HTTP fallback');
      const res = await firstValueFrom(
        this.http
          .post(`${this.coreServiceUrl}/auth/logout`, dto, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );

      // Publish event
      await this.messagingService
        .publishEvent(MessagePattern.AUTH_LOGOUT_SUCCESS, {
          timestamp: Date.now(),
        })
        .catch((err) =>
          this.logger.warn('Failed to publish logout event', err),
        );

      return res.data;
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message ||
          error.response.data ||
          'Logout failed';
        throw new HttpException(message, status);
      }
      throw new HttpException(
        'Core service unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // ============================================
  // OAUTH METHODS
  // ============================================

  /**
   * GOOGLE OAUTH - Get Authorization URL
   * Strategy: HTTP → Core Service
   */
  async getGoogleAuthUrl(redirectUri: string): Promise<{ url: string }> {
    this.logger.log('[FAST-PATH] Getting Google OAuth URL');

    try {
      const url = `${this.coreServiceUrl}/auth/google`;
      const response = await firstValueFrom(
        this.http
          .get(url, {
            params: { redirect_uri: redirectUri },
          })
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(
                `Failed to get Google OAuth URL: ${error.message}`,
              );
              throw new BadRequestException(
                'Failed to initiate Google OAuth',
              );
            }),
          ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Google OAuth URL error: ${error.message}`);
      throw error;
    }
  }

  /**
   * GITHUB OAUTH - Get Authorization URL
   * Strategy: HTTP → Core Service
   */
  async getGithubAuthUrl(redirectUri: string): Promise<{ url: string }> {
    this.logger.log('[FAST-PATH] Getting GitHub OAuth URL');

    try {
      const url = `${this.coreServiceUrl}/auth/github`;
      const response = await firstValueFrom(
        this.http
          .get(url, {
            params: { redirect_uri: redirectUri },
          })
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(
                `Failed to get GitHub OAuth URL: ${error.message}`,
              );
              throw new BadRequestException(
                'Failed to initiate GitHub OAuth',
              );
            }),
          ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`GitHub OAuth URL error: ${error.message}`);
      throw error;
    }
  }

  /**
   * GOOGLE OAUTH CALLBACK
   * Strategy: HTTP → Core Service + Event Publishing
   */
  async handleGoogleCallback(callbackDto: OAuthCallbackDto) {
    this.logger.log('[HYBRID] Handling Google OAuth callback');

    // Check for OAuth errors
    if (callbackDto.error) {
      this.logger.warn(`Google OAuth error: ${callbackDto.error}`);

      // Publish failed event
      if (this.messagingService.getConnectionStatus()) {
        await this.messagingService
          .publishEvent(MessagePattern.AUTH_LOGIN_FAILED, {
            provider: 'google',
            error: callbackDto.error,
            error_description: callbackDto.error_description,
            timestamp: Date.now(),
          })
          .catch((err) =>
            this.logger.error('Failed to publish OAuth error event', err),
          );
      }

      throw new BadRequestException(
        callbackDto.error_description || 'Google OAuth authentication failed',
      );
    }

    try {
      // Forward to Core Service
      const url = `${this.coreServiceUrl}/auth/google/callback`;
      const response = await firstValueFrom(
        this.http
          .post(url, callbackDto)
          .pipe(
            timeout(15000),
            catchError((error: any) => {
              if (error instanceof TimeoutError) {
                throw new BadRequestException('OAuth authentication timeout');
              }
              if (error.response?.status === 401) {
                throw new UnauthorizedException('Invalid OAuth code');
              }
              throw error;
            }),
          ),
      );

      const result = response.data;

      // Publish success event
      if (this.messagingService.getConnectionStatus()) {
        await this.messagingService
          .publishEvent(MessagePattern.AUTH_LOGIN_SUCCESS, {
            userId: result.user?.id,
            email: result.user?.email,
            provider: 'google',
            timestamp: Date.now(),
          })
          .catch((err) =>
            this.logger.error('Failed to publish OAuth success event', err),
          );

        // If new user, publish registered event
        if (result.isNewUser) {
          await this.messagingService
            .publishEvent(MessagePattern.USER_REGISTERED, {
              userId: result.user.id,
              email: result.user.email,
              provider: 'google',
              timestamp: Date.now(),
            })
            .catch((err) =>
              this.logger.error('Failed to publish user registered event', err),
            );

          // Send welcome email
          await this.messagingService
            .publishJob(
              MessagePattern.EMAIL_WELCOME,
              {
                userId: result.user.id,
                email: result.user.email,
                name: result.user.name,
              },
              { retryCount: 3 },
            )
            .catch((err) =>
              this.logger.error('Failed to publish welcome email job', err),
            );
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Google OAuth callback error: ${error.message}`);
      throw error;
    }
  }

  /**
   * GITHUB OAUTH CALLBACK
   * Strategy: HTTP → Core Service + Event Publishing
   */
  async handleGithubCallback(callbackDto: OAuthCallbackDto) {
    this.logger.log('[HYBRID] Handling GitHub OAuth callback');

    // Check for OAuth errors
    if (callbackDto.error) {
      this.logger.warn(`GitHub OAuth error: ${callbackDto.error}`);

      // Publish failed event
      if (this.messagingService.getConnectionStatus()) {
        await this.messagingService
          .publishEvent(MessagePattern.AUTH_LOGIN_FAILED, {
            provider: 'github',
            error: callbackDto.error,
            error_description: callbackDto.error_description,
            timestamp: Date.now(),
          })
          .catch((err) =>
            this.logger.error('Failed to publish OAuth error event', err),
          );
      }

      throw new BadRequestException(
        callbackDto.error_description || 'GitHub OAuth authentication failed',
      );
    }

    try {
      // Forward to Core Service
      const url = `${this.coreServiceUrl}/auth/github/callback`;
      const response = await firstValueFrom(
        this.http
          .post(url, callbackDto)
          .pipe(
            timeout(15000),
            catchError((error: any) => {
              if (error instanceof TimeoutError) {
                throw new BadRequestException('OAuth authentication timeout');
              }
              if (error.response?.status === 401) {
                throw new UnauthorizedException('Invalid OAuth code');
              }
              throw error;
            }),
          ),
      );

      const result = response.data;

      // Publish success event
      if (this.messagingService.getConnectionStatus()) {
        await this.messagingService
          .publishEvent(MessagePattern.AUTH_LOGIN_SUCCESS, {
            userId: result.user?.id,
            email: result.user?.email,
            provider: 'github',
            timestamp: Date.now(),
          })
          .catch((err) =>
            this.logger.error('Failed to publish OAuth success event', err),
          );

        // If new user, publish registered event
        if (result.isNewUser) {
          await this.messagingService
            .publishEvent(MessagePattern.USER_REGISTERED, {
              userId: result.user.id,
              email: result.user.email,
              provider: 'github',
              timestamp: Date.now(),
            })
            .catch((err) =>
              this.logger.error('Failed to publish user registered event', err),
            );

          // Send welcome email
          await this.messagingService
            .publishJob(
              MessagePattern.EMAIL_WELCOME,
              {
                userId: result.user.id,
                email: result.user.email,
                name: result.user.name,
              },
              { retryCount: 3 },
            )
            .catch((err) =>
              this.logger.error('Failed to publish welcome email job', err),
            );
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`GitHub OAuth callback error: ${error.message}`);
      throw error;
    }
  }
}
