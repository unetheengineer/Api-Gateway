import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateConfigDto {
  @ApiPropertyOptional({
    description: 'Work session duration in minutes',
    example: 25,
    minimum: 1,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  workDuration?: number;

  @ApiPropertyOptional({
    description: 'Short break duration in minutes',
    example: 5,
    minimum: 1,
    maximum: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  shortBreakDuration?: number;

  @ApiPropertyOptional({
    description: 'Long break duration in minutes',
    example: 15,
    minimum: 1,
    maximum: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  longBreakDuration?: number;

  @ApiPropertyOptional({
    description: 'Number of work sessions before long break',
    example: 4,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sessionsBeforeLongBreak?: number;

  @ApiPropertyOptional({
    description: 'Auto-start break sessions',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  autoStartBreaks?: boolean;

  @ApiPropertyOptional({
    description: 'Auto-start work sessions',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  autoStartWork?: boolean;
}
