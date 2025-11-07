import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TodoStatus } from '../entities/todo.entity';

export enum SortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryTodosDto {
  @ApiProperty({
    description: 'Filter by todo status',
    enum: TodoStatus,
    required: false,
    example: TodoStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TodoStatus, {
    message: 'Status must be one of: pending, in_progress, completed',
  })
  status?: TodoStatus;

  @ApiProperty({
    description: 'Include soft-deleted todos in results',
    required: false,
    default: false,
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean = false;

  @ApiProperty({
    description: 'Page number',
    required: false,
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    enum: SortBy,
    required: false,
    default: SortBy.CREATED_AT,
    example: SortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SortBy, {
    message: 'Sort by must be one of: createdAt, updatedAt',
  })
  sortBy?: SortBy = SortBy.CREATED_AT;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, {
    message: 'Sort order must be one of: ASC, DESC',
  })
  sortOrder?: SortOrder = SortOrder.DESC;
}
