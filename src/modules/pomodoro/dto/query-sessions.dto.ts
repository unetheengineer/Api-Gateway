import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import {
  PomodoroSessionStatus,
  PomodoroSessionType,
} from '../entities/pomodoro-session.entity';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QuerySessionsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by session type',
    enum: PomodoroSessionType,
    example: PomodoroSessionType.WORK,
  })
  @IsOptional()
  @IsEnum(PomodoroSessionType)
  type?: PomodoroSessionType;

  @ApiPropertyOptional({
    description: 'Filter by session status',
    enum: PomodoroSessionStatus,
    example: PomodoroSessionStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(PomodoroSessionStatus)
  status?: PomodoroSessionStatus;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Only show completed sessions',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  completedOnly?: boolean = false;
}
