import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EventCategory,
  RecurrenceFrequency,
  ReminderUnit,
} from '../entities/calendar-event.entity';

export class RecurrenceRuleDto {
  @ApiProperty({
    description: 'Recurrence frequency',
    enum: RecurrenceFrequency,
    example: RecurrenceFrequency.WEEKLY,
  })
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Interval (e.g., every 2 weeks)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  interval: number;

  @ApiPropertyOptional({
    description: 'End date for recurrence (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of occurrences',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @ApiPropertyOptional({
    description: 'Days of week (0=Sunday, 1=Monday, ...)',
    example: [1, 3, 5],
    type: [Number],
  })
  @IsOptional()
  @IsInt({ each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({
    description: 'Day of month (1-31) for monthly recurrence',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  dayOfMonth?: number;

  @ApiPropertyOptional({
    description: 'Month of year (1-12) for yearly recurrence',
    example: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  monthOfYear?: number;
}

export class EventReminderDto {
  @ApiProperty({
    description: 'Reminder value',
    example: 15,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  value: number;

  @ApiProperty({
    description: 'Reminder unit',
    enum: ReminderUnit,
    example: ReminderUnit.MINUTES,
  })
  @IsEnum(ReminderUnit)
  unit: ReminderUnit;

  @ApiPropertyOptional({
    description: 'Custom reminder message',
    example: 'Meeting starts soon!',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'Team Meeting',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Event description',
    example: 'Discuss Q1 goals and objectives',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Event location',
    example: 'Conference Room A',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiProperty({
    description: 'Start time (ISO 8601)',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'End time (ISO 8601)',
    example: '2024-01-15T11:00:00.000Z',
  })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'All-day event',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean = false;

  @ApiPropertyOptional({
    description: 'Timezone',
    example: 'UTC',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiPropertyOptional({
    description: 'Event category',
    enum: EventCategory,
    example: EventCategory.MEETING,
    default: EventCategory.OTHER,
  })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory = EventCategory.OTHER;

  @ApiPropertyOptional({
    description: 'Event color (hex)',
    example: '#3B82F6',
  })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Recurring event rule',
    type: RecurrenceRuleDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceRuleDto)
  recurrenceRule?: RecurrenceRuleDto;

  @ApiPropertyOptional({
    description: 'Event reminders',
    type: [EventReminderDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventReminderDto)
  reminders?: EventReminderDto[];

  @ApiPropertyOptional({
    description: 'Link to a todo',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  linkedTodoId?: string;

  @ApiPropertyOptional({
    description: 'Link to a habit',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  linkedHabitId?: string;
}
