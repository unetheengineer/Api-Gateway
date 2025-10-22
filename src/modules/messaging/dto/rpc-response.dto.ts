import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class RpcResponseDto {
  @IsBoolean()
  success: boolean;

  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  error?: string;

  @IsString()
  correlationId: string;
}
