import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validates JWT payload and returns user object
   * This method is called automatically by Passport after JWT verification
   *
   * When microservice is integrated, you can:
   * 1. Make HTTP/RPC call to Core Service to validate user exists
   * 2. Fetch additional user data from database
   * 3. Check if user is active/blocked
   */
  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 🔧 MOCK: Return user from JWT payload
    // TODO: When integrating with microservice, replace with actual user lookup:
    // const user = await this.httpService.get(`/users/${payload.sub}`);
    // if (!user) throw new UnauthorizedException('User not found');

    return {
      userId: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      roles: payload.roles || ['user'],
    };
  }
}
