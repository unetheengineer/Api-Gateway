import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // 1. Önce authenticated user'ı kontrol et
    const user = (req as any).user;
    if (user && user.userId) {
      return `user:${user.userId}`;
    }

    // 2. User yoksa IP adresini kullan
    // Proxy arkasındaysak X-Forwarded-For'dan al
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return `ip:${ips.trim()}`;
    }

    // 3. Real IP varsa onu kullan
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return `ip:${Array.isArray(realIp) ? realIp[0] : realIp}`;
    }

    // 4. Son çare: req.ip
    return `ip:${req.ip || 'unknown'}`;
  }
}
