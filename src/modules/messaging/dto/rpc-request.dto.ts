import { IsString, IsObject, IsOptional, IsNumber } from 'class-validator';

export class RpcRequestDto {
  @IsString()
  pattern: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsNumber()
  timeout?: number;
}
