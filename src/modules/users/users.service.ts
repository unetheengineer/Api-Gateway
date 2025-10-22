import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { MessagingService } from '../messaging/messaging.service';
import { MessagePattern } from '../messaging/messaging.patterns';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly http: HttpService,
    private readonly messagingService: MessagingService,
  ) {}

  // READ operations - Fast path (HTTP only)
  async getMe(authorization: string) {
    try {
      this.logger.debug('[FAST-PATH] Get current user via HTTP');
      const res = await firstValueFrom(
        this.http
          .get(`/users/me`, {
            headers: { Authorization: authorization },
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
      const status = error?.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE;
      const message =
        error?.response?.data?.message || error?.message || 'Failed';
      throw new HttpException(message, status);
    }
  }

  async getById(id: string, authorization: string) {
    try {
      this.logger.debug('[FAST-PATH] Get user by ID via HTTP');
      const res = await firstValueFrom(
        this.http
          .get(`/users/${id}`, {
            headers: { Authorization: authorization },
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
      const status = error?.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE;
      const message =
        error?.response?.data?.message || error?.message || 'Failed';
      throw new HttpException(message, status);
    }
  }

  // WRITE operations - Hybrid path (RabbitMQ RPC + HTTP fallback)
  async updateMe(dto: UpdateUserDto, authorization: string) {
    try {
      // Primary path: RabbitMQ RPC
      if (this.messagingService.getConnectionStatus()) {
        try {
          this.logger.debug('[HYBRID] Update user via RabbitMQ RPC');
          const result = await this.messagingService.sendRpc(
            MessagePattern.USER_UPDATE,
            { ...dto, authorization },
            { timeout: 10000 },
          );

          // Publish event for analytics
          await this.messagingService
            .publishEvent(MessagePattern.USER_UPDATED, {
              userId: result.id,
              changes: dto,
              timestamp: Date.now(),
            })
            .catch((err) =>
              this.logger.warn('Failed to publish user updated event', err),
            );

          return result;
        } catch (rpcError: any) {
          this.logger.warn(
            `[HYBRID] RabbitMQ RPC failed: ${rpcError.message}, falling back to HTTP`,
          );
        }
      }

      // Fallback path: HTTP
      this.logger.debug('[HYBRID] Update user via HTTP fallback');
      const res = await firstValueFrom(
        this.http
          .put(`/users/me`, dto, {
            headers: {
              Authorization: authorization,
              'Content-Type': 'application/json',
            },
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
        .publishEvent(MessagePattern.USER_UPDATED, {
          userId: res.data.id,
          changes: dto,
          timestamp: Date.now(),
        })
        .catch((err) =>
          this.logger.warn('Failed to publish user updated event', err),
        );

      return res.data;
    } catch (error: any) {
      const status = error?.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE;
      const message =
        error?.response?.data?.message || error?.message || 'Failed';
      throw new HttpException(message, status);
    }
  }
}
