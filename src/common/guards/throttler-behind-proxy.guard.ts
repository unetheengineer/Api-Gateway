import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/**
 * Custom Throttler Guard that works behind proxies and supports user-based rate limiting
 *
 * Features:
 * - User-based tracking for authenticated requests (tracks by userId)
 * - IP-based tracking for public requests
 * - Proxy-aware (reads X-Forwarded-For, X-Real-IP headers)
 * - Automatically sets rate limit headers on responses
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // 1. Önce authenticated user'ı kontrol et (JWT guard'dan sonra set ediliyor)
    // Authenticated route'larda req.user mevcut olacak
    const user = req.user;
    if (user && user.userId) {
      return `user:${user.userId}`;
    }

    // 2. User yoksa IP adresini kullan
    // Proxy arkasındaysak X-Forwarded-For'dan al (nginx, cloudflare, etc.)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return `ip:${ips.trim()}`;
    }

    // 3. Real IP varsa onu kullan (bazı reverse proxy'ler bu header'ı kullanır)
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return `ip:${Array.isArray(realIp) ? realIp[0] : realIp}`;
    }

    // 4. Son çare: req.ip (express'in kendi IP algılaması)
    return `ip:${req.ip || 'unknown'}`;
  }
}
