import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET') ?? '';
        const rawExpiresIn = config.get<string>('JWT_EXPIRES_IN') ?? '15m';
        const expiresIn: SignOptions['expiresIn'] = /^\d+$/.test(rawExpiresIn)
          ? Number(rawExpiresIn)
          : (rawExpiresIn as SignOptions['expiresIn']);
        const signOptions: SignOptions = { expiresIn };
        return { secret, signOptions };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
export {};
