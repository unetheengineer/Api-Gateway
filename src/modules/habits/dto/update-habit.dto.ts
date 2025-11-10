import { PartialType } from '@nestjs/swagger';
import { CreateHabitDto } from './create-habit.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Whether the habit is archived',
    example: false,
  })
  isArchived?: boolean;
}
