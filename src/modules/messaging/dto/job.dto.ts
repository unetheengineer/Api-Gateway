import { IsString, IsObject, IsOptional, IsNumber } from 'class-validator';

export class JobDto {
  @IsString()
  pattern: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @IsOptional()
  @IsNumber()
  delay?: number;
}
