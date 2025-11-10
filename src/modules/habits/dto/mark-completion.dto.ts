import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class MarkCompletionDto {
  @IsDateString()
  @ApiProperty({
    description: 'Date for completion (ISO 8601 format, YYYY-MM-DD)',
    example: '2024-01-15',
  })
  date: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the habit was completed',
    example: true,
  })
  completed: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Number of times completed (for habits with targetCount > 1)',
    example: 1,
    default: 1,
  })
  completionCount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Optional notes for this completion',
    example: 'Felt great today!',
    maxLength: 500,
  })
  notes?: string;
}
