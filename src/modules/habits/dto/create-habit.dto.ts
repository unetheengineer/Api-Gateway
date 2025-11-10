import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import type { HabitFrequency, HabitCategory } from '../entities/habit.entity';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({
    description: 'Habit name',
    example: 'Morning Exercise',
    minLength: 1,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Detailed description of the habit',
    example: '30 minutes of cardio or strength training',
    maxLength: 500,
  })
  description?: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'custom'])
  @ApiProperty({
    description: 'Frequency of the habit',
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    example: 'daily',
  })
  frequency: HabitFrequency;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @ApiPropertyOptional({
    description:
      'Custom days for weekly/custom frequency (0-6, where 0 = Sunday). Required for weekly/custom frequency.',
    example: [1, 3, 5], // Monday, Wednesday, Friday
    type: [Number],
  })
  customDays?: number[];

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
  @ApiProperty({
    description: 'Habit category',
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
  category: HabitCategory;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  @ApiPropertyOptional({
    description: 'Display color in hex format',
    example: '#4CAF50',
    default: '#4CAF50',
  })
  color?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Target completion count per day',
    example: 1,
    default: 1,
    minimum: 1,
    maximum: 100,
  })
  targetCount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  @ApiPropertyOptional({
    description: 'Goal description',
    example: 'Complete 10,000 steps',
    maxLength: 200,
  })
  goalDescription?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Start date for habit tracking (ISO 8601 format)',
    example: '2024-01-01',
  })
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'End date for habit tracking (ISO 8601 format, optional)',
    example: '2024-12-31',
  })
  endDate?: string;
}
