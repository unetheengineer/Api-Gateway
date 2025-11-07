import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Todo text content',
    example: 'Buy groceries from the market',
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'Text must be a string' })
  @IsNotEmpty({ message: 'Text is required' })
  @MinLength(1, { message: 'Text must be at least 1 character' })
  @MaxLength(500, { message: 'Text cannot exceed 500 characters' })
  text: string;
}
