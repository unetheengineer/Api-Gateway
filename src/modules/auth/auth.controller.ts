import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint
   * Returns JWT access token and refresh token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      '🔧 MOCK: Authenticates user with email and password. Returns JWT tokens.\n\n' +
      '**Test Credentials:**\n' +
      '- Admin: `admin@example.com` / `Admin123!`\n' +
      '- User: `user@example.com` / `User123!`',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          roles: ['admin', 'user'],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Register endpoint
   * Creates new user and returns JWT tokens
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
    description:
      '🔧 MOCK: Creates a new user account and returns JWT tokens.\n\n' +
      'Password requirements: min 8 chars, uppercase, lowercase, number, special char',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '3',
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          roles: ['user'],
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Refresh token endpoint
   * Issues new access token using refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      '🔧 MOCK: Generates a new access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * OAuth callback endpoint
   * Handles OAuth provider callbacks (Google, GitHub, etc.)
   */
  @Post('oauth/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OAuth callback handler',
    description:
      '🔧 MOCK: Handles OAuth provider callbacks.\n\n' +
      'In production, this exchanges authorization code for user tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth authentication successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '999',
          email: 'oauth.user@example.com',
          firstName: 'OAuth',
          lastName: 'User',
          roles: ['user'],
        },
      },
    },
  })
  async oauthCallback(@Body() oauthCallbackDto: OAuthCallbackDto) {
    return this.authService.oauthCallback(oauthCallbackDto);
  }

  /**
   * Logout endpoint (protected)
   * Invalidates user's refresh token
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      '🔧 MOCK: Invalidates user refresh token.\n\n' +
      '**Requires:** Valid JWT access token in Authorization header',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logout successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async logout(@Req() req: Request) {
    const user = req.user!;
    return this.authService.logout(user.userId);
  }

  /**
   * Get current user endpoint (protected)
   * Returns authenticated user info from JWT
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns authenticated user information extracted from JWT token.\n\n' +
      '**Requires:** Valid JWT access token in Authorization header',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved',
    schema: {
      example: {
        userId: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin', 'user'],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getCurrentUser(@Req() req: Request) {
    return req.user;
  }

  /**
   * 🔧 MOCK: Debug endpoint to see all mock users
   * Remove this in production!
   */
  @Get('debug/users')
  @ApiOperation({
    summary: '🔧 [DEBUG] Get all mock users',
    description:
      '⚠️ DEVELOPMENT ONLY - Shows all mock users for testing.\n\n' +
      'Remove this endpoint in production!',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all mock users',
  })
  async getAllMockUsers() {
    return {
      message: '🔧 MOCK DATA - Remove this endpoint in production',
      users: this.authService.getAllMockUsers(),
    };
  }
}
