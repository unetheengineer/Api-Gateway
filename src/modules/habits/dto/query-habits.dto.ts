import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { HabitFrequency, HabitCategory } from '../entities/habit.entity';

export class QueryHabitsDto {
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  limit?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1,
  })
  page?: number;

  @IsEnum(['daily', 'weekly', 'monthly', 'custom'])
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by frequency',
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    example: 'daily',
  })
  frequency?: HabitFrequency;

  @IsEnum([
    'health',
    'fitness',
    'productivity',
    'learning',
    'mindfulness',
    'social',
    'finance',
    'other',
  ])
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: [
      'health',
      'fitness',
      'productivity',
      'learning',
      'mindfulness',
      'social',
      'finance',
      'other',
    ],
    example: 'fitness',
  })
  category?: HabitCategory;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ApiPropertyOptional({
    description: 'Filter by archived status',
    example: false,
    default: false,
  })
  isArchived?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ApiPropertyOptional({
    description: 'Include deleted habits',
    example: false,
    default: false,
  })
  includeDeleted?: boolean;

  @IsEnum(['name', 'createdAt', 'currentStreak', 'totalCompletions'])
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['name', 'createdAt', 'currentStreak', 'totalCompletions'],
    example: 'createdAt',
    default: 'createdAt',
  })
  sortBy?: string;

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  sortOrder?: 'asc' | 'desc';
}
