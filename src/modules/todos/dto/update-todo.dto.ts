import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TodoStatus } from '../entities/todo.entity';

export class UpdateTodoDto {
  @ApiProperty({
    description: 'Todo text content',
    example: 'Buy groceries and cook dinner',
    minLength: 1,
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Text must be a string' })
  @MinLength(1, { message: 'Text must be at least 1 character' })
  @MaxLength(500, { message: 'Text cannot exceed 500 characters' })
  text?: string;

  @ApiProperty({
    description: 'Todo status',
    enum: TodoStatus,
    example: TodoStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TodoStatus, {
    message: 'Status must be one of: pending, in_progress, completed',
  })
  status?: TodoStatus;
}
