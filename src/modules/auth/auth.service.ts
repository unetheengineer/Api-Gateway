import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';

// 🔧 MOCK: In-memory user storage (for demo purposes only)
interface MockUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  firstName: string;
  lastName: string;
  roles: string[];
  refreshToken?: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // 🔧 MOCK: In-memory user database
  private mockUsers: MockUser[] = [
    {
      id: '1',
      email: 'admin@example.com',
      password: 'Admin123!', // ⚠️ Never store plain passwords in production
      firstName: 'Admin',
      lastName: 'User',
      roles: ['admin', 'user'],
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      email: 'user@example.com',
      password: 'User123!',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['user'],
      createdAt: new Date('2024-01-15'),
    },
  ];

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 🔧 MOCK: Login user and return JWT tokens
   * TODO: Replace with microservice call when integrating
   */
  async login(loginDto: LoginDto) {
    this.logger.log(`[MOCK] Login attempt for: ${loginDto.email}`);

    // 🔧 MOCK: Find user by email
    const user = this.mockUsers.find((u) => u.email === loginDto.email);

    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;

    this.logger.log(`[MOCK] Login successful for: ${user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  /**
   * 🔧 MOCK: Register new user
   * TODO: Replace with microservice call when integrating
   */
  async register(registerDto: RegisterDto) {
    this.logger.log(`[MOCK] Registration attempt for: ${registerDto.email}`);

    // Check if user already exists
    const existingUser = this.mockUsers.find(
      (u) => u.email === registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 🔧 MOCK: Create new user
    const newUser: MockUser = {
      id: (this.mockUsers.length + 1).toString(),
      email: registerDto.email,
      password: registerDto.password, // ⚠️ Should be hashed in production
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      roles: ['user'],
      createdAt: new Date(),
    };

    this.mockUsers.push(newUser);

    // Generate tokens
    const tokens = await this.generateTokens(newUser);

    // Save refresh token
    newUser.refreshToken = tokens.refreshToken;

    this.logger.log(`[MOCK] Registration successful for: ${newUser.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        roles: newUser.roles,
      },
    };
  }

  /**
   * 🔧 MOCK: Refresh access token using refresh token
   * TODO: Replace with microservice call when integrating
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    this.logger.log('[MOCK] Refresh token request');

    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      // Find user by ID
      const user = this.mockUsers.find((u) => u.id === payload.sub);

      if (!user || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      user.refreshToken = tokens.refreshToken;

      this.logger.log(`[MOCK] Token refresh successful for: ${user.email}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      this.logger.error('[MOCK] Token refresh failed:', error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * 🔧 MOCK: OAuth callback handler
   * TODO: Implement actual OAuth flow when integrating with providers
   */
  async oauthCallback(oauthCallbackDto: OAuthCallbackDto) {
    this.logger.log(
      `[MOCK] OAuth callback from provider: ${oauthCallbackDto.provider || 'unknown'}`,
    );

    // 🔧 MOCK: Simulate OAuth user creation/login
    // In real implementation:
    // 1. Exchange code for access token with OAuth provider
    // 2. Fetch user info from OAuth provider
    // 3. Create or find user in database
    // 4. Generate JWT tokens

    const mockOAuthUser: MockUser = {
      id: '999',
      email: 'oauth.user@example.com',
      password: '', // OAuth users don't have passwords
      firstName: 'OAuth',
      lastName: 'User',
      roles: ['user'],
      createdAt: new Date(),
    };

    const tokens = await this.generateTokens(mockOAuthUser);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: mockOAuthUser.id,
        email: mockOAuthUser.email,
        firstName: mockOAuthUser.firstName,
        lastName: mockOAuthUser.lastName,
        roles: mockOAuthUser.roles,
      },
    };
  }

  /**
   * 🔧 MOCK: Logout user (invalidate refresh token)
   * TODO: Replace with microservice call when integrating
   */
  async logout(userId: string) {
    this.logger.log(`[MOCK] Logout request for user: ${userId}`);

    const user = this.mockUsers.find((u) => u.id === userId);

    if (user) {
      user.refreshToken = undefined;
      this.logger.log(`[MOCK] Logout successful for: ${user.email}`);
    }

    return { message: 'Logout successful' };
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(user: MockUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // Refresh tokens typically last longer
    });

    return { accessToken, refreshToken };
  }

  /**
   * 🔧 MOCK: Get all users (for testing purposes)
   */
  getAllMockUsers() {
    return this.mockUsers.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roles: u.roles,
      createdAt: u.createdAt,
    }));
  }
}
