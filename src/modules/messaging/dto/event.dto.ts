import { IsString, IsObject, IsOptional } from 'class-validator';

export class EventDto {
  @IsString()
  pattern: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  source?: string;
}
