import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly http: HttpService) {}

  async getMe(authorization: string) {
    try {
      const res = await firstValueFrom(
        this.http
          .get(`/users/me`, { headers: { Authorization: authorization }, timeout: 5000 })
          .pipe(catchError((error: AxiosError) => { throw error; })),
      );
      return res.data;
    } catch (error: any) {
      const status = error?.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE;
      const message = error?.response?.data?.message || error?.message || 'Failed';
      throw new HttpException(message, status);
    }
  }

  async getById(id: string, authorization: string) {
    try {
      const res = await firstValueFrom(
        this.http
          .get(`/users/${id}`, { headers: { Authorization: authorization }, timeout: 5000 })
          .pipe(catchError((error: AxiosError) => { throw error; })),
      );
      return res.data;
    } catch (error: any) {
      const status = error?.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE;
      const message = error?.response?.data?.message || error?.message || 'Failed';
      throw new HttpException(message, status);
    }
  }

  async updateMe(dto: UpdateUserDto, authorization: string) {
    try {
      const res = await firstValueFrom(
        this.http
          .put(`/users/me`, dto, { headers: { Authorization: authorization, 'Content-Type': 'application/json' }, timeout: 5000 })
          .pipe(catchError((error: AxiosError) => { throw error; })),
      );
      return res.data;
    } catch (error: any) {
      const status = error?.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE;
      const message = error?.response?.data?.message || error?.message || 'Failed';
      throw new HttpException(message, status);
    }
  }
}
export {};

