import { 
  Controller, 
  Post, 
  Get,
  Body, 
  HttpException, 
  HttpStatus,
  Logger,
  HttpCode,
  Res,
  Query,
  Version,
} from '@nestjs/common';
import type { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
  
  @ApiTags('Authentication')
  @Controller('auth')
  export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    private readonly coreServiceUrl: string;
  
    constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
    ) {
      this.coreServiceUrl = this.configService.get<string>('CORE_SERVICE_URL') ?? 'http://localhost:3001';
      
      if (!this.coreServiceUrl) {
        this.logger.error('CORE_SERVICE_URL is not configured');
        throw new Error('CORE_SERVICE_URL environment variable is required');
      }
      
      this.logger.log(`Initialized Auth Controller - Core Service: ${this.coreServiceUrl}`);
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'User login',
      description: 'Authenticate user and receive access/refresh tokens. Proxied to Core Service.'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Login successful - Returns access and refresh tokens',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InJlZnJlc2gifQ...',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true
          }
        }
      }
    })
    @ApiResponse({ 
      status: 401, 
      description: 'Invalid credentials',
      schema: {
        example: {
          statusCode: 401,
          message: 'Invalid email or password',
          error: 'Unauthorized'
        }
      }
    })
    @ApiResponse({ 
      status: 503, 
      description: 'Core service unavailable',
      schema: {
        example: {
          statusCode: 503,
          message: 'Core service unavailable',
          error: 'Service Unavailable'
        }
      }
    })
    async login(@Body() loginDto: LoginDto) {
      try {
        this.logger.log(`[PROXY] Login request - Email: ${loginDto.email}`);
        
        const response = await firstValueFrom(
          this.httpService.post(
            `${this.coreServiceUrl}/auth/login`, 
            loginDto,
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000,
            }
          ).pipe(
            catchError((error: AxiosError) => {
              throw error;
            })
          )
        );
  
        this.logger.log(`[PROXY] Login successful - Email: ${loginDto.email}`);
        return response.data;
        
      } catch (error) {
        this.logger.error(
          `[PROXY] Login failed - Email: ${loginDto.email} - Error: ${error.message}`
        );
        
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data || 'Login failed';
          
          throw new HttpException(message, status);
        }
        
        throw new HttpException(
          'Core service unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
      summary: 'User registration',
      description: 'Create a new user account. Proxied to Core Service.'
    })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ 
      status: 201, 
      description: 'Registration successful - Returns access and refresh tokens',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InJlZnJlc2gifQ...',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true
          }
        }
      }
    })
    @ApiResponse({ 
      status: 400, 
      description: 'Invalid input data',
      schema: {
        example: {
          statusCode: 400,
          message: ['email must be a valid email', 'password must be at least 6 characters'],
          error: 'Bad Request'
        }
      }
    })
    @ApiResponse({ 
      status: 409, 
      description: 'User with this email already exists',
      schema: {
        example: {
          statusCode: 409,
          message: 'User with this email already exists',
          error: 'Conflict'
        }
      }
    })
    @ApiResponse({ 
      status: 503, 
      description: 'Core service unavailable'
    })
    async register(@Body() registerDto: RegisterDto) {
      try {
        this.logger.log(`[PROXY] Registration request - Email: ${registerDto.email}`);
        
        const response = await firstValueFrom(
          this.httpService.post(
            `${this.coreServiceUrl}/auth/register`, 
            registerDto,
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000,
            }
          ).pipe(
            catchError((error: AxiosError) => {
              throw error;
            })
          )
        );
  
        this.logger.log(`[PROXY] Registration successful - Email: ${registerDto.email}`);
        return response.data;
        
      } catch (error) {
        this.logger.error(
          `[PROXY] Registration failed - Email: ${registerDto.email} - Error: ${error.message}`
        );
        
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data || 'Registration failed';
          
          throw new HttpException(message, status);
        }
        
        throw new HttpException(
          'Core service unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'Refresh access token',
      description: 'Get a new access token using refresh token. Proxied to Core Service.'
    })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Token refreshed successfully',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InJlZnJlc2gifQ...'
        }
      }
    })
    @ApiResponse({ 
      status: 401, 
      description: 'Invalid or expired refresh token',
      schema: {
        example: {
          statusCode: 401,
          message: 'Invalid or expired refresh token',
          error: 'Unauthorized'
        }
      }
    })
    @ApiResponse({ 
      status: 503, 
      description: 'Core service unavailable'
    })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
      try {
        this.logger.log('[PROXY] Token refresh request');
        
        const response = await firstValueFrom(
          this.httpService.post(
            `${this.coreServiceUrl}/auth/refresh`, 
            refreshTokenDto,
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000,
            }
          ).pipe(
            catchError((error: AxiosError) => {
              throw error;
            })
          )
        );
  
        this.logger.log('[PROXY] Token refresh successful');
        return response.data;
        
      } catch (error) {
        this.logger.error(`[PROXY] Token refresh failed - Error: ${error.message}`);
        
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data || 'Token refresh failed';
          
          throw new HttpException(message, status);
        }
        
        throw new HttpException(
          'Core service unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'User logout',
      description: 'Revoke refresh token and logout user. Proxied to Core Service.'
    })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ 
      status: 200, 
      description: 'Logout successful',
      schema: {
        example: {
          message: 'Logout successful'
        }
      }
    })
    @ApiResponse({ 
      status: 401, 
      description: 'Invalid refresh token',
      schema: {
        example: {
          statusCode: 401,
          message: 'Invalid refresh token',
          error: 'Unauthorized'
        }
      }
    })
    @ApiResponse({ 
      status: 503, 
      description: 'Core service unavailable'
    })
    async logout(@Body() refreshTokenDto: RefreshTokenDto) {
      try {
        this.logger.log('[PROXY] Logout request');
        
        const response = await firstValueFrom(
          this.httpService.post(
            `${this.coreServiceUrl}/auth/logout`, 
            refreshTokenDto,
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000,
            }
          ).pipe(
            catchError((error: AxiosError) => {
              throw error;
            })
          )
        );
  
        this.logger.log('[PROXY] Logout successful');
        return response.data;
        
      } catch (error) {
        this.logger.error(`[PROXY] Logout failed - Error: ${error.message}`);
        
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data || 'Logout failed';
          
          throw new HttpException(message, status);
        }
        
        throw new HttpException(
          'Core service unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
    // ============================================
  // OAUTH PROXY ENDPOINTS
  // ============================================

  @Get('google')
  @ApiOperation({ 
    summary: 'Google OAuth - Initiate',
    description: 'Start Google OAuth flow. Redirects to Google login page.'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to Google OAuth page'
  })
  async googleAuth(@Res() res: Response) {
    const url = `${this.coreServiceUrl}/auth/google`;
    this.logger.log(`[PROXY] Redirecting to Google OAuth: ${url}`);
    return res.redirect(url);
  }

  @Get('google/callback')
  @ApiOperation({ 
    summary: 'Google OAuth - Callback',
    description: 'Google OAuth callback endpoint. Receives tokens and redirects to frontend.'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to frontend with tokens'
  })
  async googleAuthCallback(@Query() query: any, @Res() res: Response) {
    this.logger.log('[PROXY] Google OAuth callback received');
    
    // Core Service'den gelen redirect'i frontend'e yönlendir
    const url = `${this.coreServiceUrl}/auth/google/callback?code=${query.code}&state=${query.state}`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          maxRedirects: 0,
          validateStatus: (status) => status === 302 || status === 200,
        }).pipe(
          catchError((error: AxiosError) => {
            throw error;
          })
        )
      );

      // Core Service'den gelen redirect location'ı al
      const redirectUrl = response.headers.location || response.data?.redirectUrl;
      
      if (redirectUrl) {
        return res.redirect(redirectUrl);
      }
      
      throw new HttpException('OAuth callback failed', HttpStatus.INTERNAL_SERVER_ERROR);
      
    } catch (error: any) {
      this.logger.error(`[PROXY] Google OAuth callback failed: ${error.message}`);
      throw new HttpException('OAuth authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('github')
  @ApiOperation({ 
    summary: 'GitHub OAuth - Initiate',
    description: 'Start GitHub OAuth flow. Redirects to GitHub login page.'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to GitHub OAuth page'
  })
  async githubAuth(@Res() res: Response) {
    const url = `${this.coreServiceUrl}/auth/github`;
    this.logger.log(`[PROXY] Redirecting to GitHub OAuth: ${url}`);
    return res.redirect(url);
  }

  @Get('github/callback')
  @ApiOperation({ 
    summary: 'GitHub OAuth - Callback',
    description: 'GitHub OAuth callback endpoint. Receives tokens and redirects to frontend.'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to frontend with tokens'
  })
  async githubAuthCallback(@Query() query: any, @Res() res: Response) {
    this.logger.log('[PROXY] GitHub OAuth callback received');
    
    const url = `${this.coreServiceUrl}/auth/github/callback?code=${query.code}&state=${query.state}`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          maxRedirects: 0,
          validateStatus: (status) => status === 302 || status === 200,
        }).pipe(
          catchError((error: AxiosError) => {
            throw error;
          })
        )
      );

      const redirectUrl = response.headers.location || response.data?.redirectUrl;
      
      if (redirectUrl) {
        return res.redirect(redirectUrl);
      }
      
      throw new HttpException('OAuth callback failed', HttpStatus.INTERNAL_SERVER_ERROR);
      
    } catch (error: any) {
      this.logger.error(`[PROXY] GitHub OAuth callback failed: ${error.message}`);
      throw new HttpException('OAuth authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }
}