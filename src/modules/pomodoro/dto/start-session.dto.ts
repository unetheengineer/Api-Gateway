import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PomodoroSessionType } from '../entities/pomodoro-session.entity';

export class StartSessionDto {
  @ApiProperty({
    description: 'Type of pomodoro session',
    enum: PomodoroSessionType,
    example: PomodoroSessionType.WORK,
  })
  @IsEnum(PomodoroSessionType)
  type: PomodoroSessionType;

  @ApiPropertyOptional({
    description: 'Link session to a specific todo (optional)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  linkedTodoId?: string;

  @ApiPropertyOptional({
    description: 'Optional notes for this session',
    example: 'Working on API Gateway documentation',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
