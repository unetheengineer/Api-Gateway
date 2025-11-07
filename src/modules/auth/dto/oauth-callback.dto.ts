import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class OAuthCallbackDto {
  @ApiProperty({
    description: 'OAuth authorization code',
    example: 'SplxlOBeZQQYbYS6WxSbIA',
  })
  @IsString()
  @IsNotEmpty({ message: 'Authorization code is required' })
  code: string;

  @ApiProperty({
    description: 'OAuth state parameter for CSRF protection',
    example: 'random-state-string',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: 'OAuth provider (google, github, facebook, etc.)',
    example: 'google',
    required: false,
  })
  @IsString()
  @IsOptional()
  provider?: string;
}
