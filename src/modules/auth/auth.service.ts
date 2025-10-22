import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly coreServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.coreServiceUrl = this.config.get<string>('CORE_SERVICE_URL') ?? '';
  }

  async login(dto: LoginDto) {
    try {
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
      return res.data;
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data || 'Login failed';
        throw new HttpException(message, status);
      }
      throw new HttpException('Core service unavailable. Please try again later.', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async register(dto: RegisterDto) {
    try {
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
      return res.data;
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data || 'Registration failed';
        throw new HttpException(message, status);
      }
      throw new HttpException('Core service unavailable. Please try again later.', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async refresh(dto: RefreshTokenDto) {
    try {
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
        const message = error.response.data?.message || error.response.data || 'Token refresh failed';
        throw new HttpException(message, status);
      }
      throw new HttpException('Core service unavailable. Please try again later.', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async logout(dto: RefreshTokenDto) {
    try {
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
      return res.data;
    } catch (error: any) {
      if (error?.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data || 'Logout failed';
        throw new HttpException(message, status);
      }
      throw new HttpException('Core service unavailable. Please try again later.', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}

