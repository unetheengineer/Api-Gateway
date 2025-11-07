import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  CalendarEvent,
  EventCategory,
  RecurrenceFrequency,
  ReminderUnit,
} from './entities/calendar-event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto, SortOrder } from './dto/query-events.dto';

/**
 * 🔧 MOCK: Calendar Service
 *
 * This service uses in-memory storage for demonstration purposes.
 * When integrating with microservices, replace the mock methods with HTTP/RPC calls.
 *
 * Migration path:
 * 1. Keep the method signatures exactly the same
 * 2. Replace in-memory logic with microservice calls
 * 3. Controller and DTOs remain unchanged
 */
@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  // 🔧 MOCK: In-memory event storage
  private mockEvents: CalendarEvent[] = [
    {
      id: '1',
      userId: '1',
      title: 'Team Standup',
      description: 'Daily team sync meeting',
      location: 'Zoom',
      startTime: new Date('2024-01-15T09:00:00.000Z'),
      endTime: new Date('2024-01-15T09:30:00.000Z'),
      isAllDay: false,
      timezone: 'UTC',
      category: EventCategory.MEETING,
      color: '#3B82F6',
      isRecurring: true,
      recurrenceRule: {
        frequency: RecurrenceFrequency.DAILY,
        interval: 1,
        endDate: null,
        count: null,
        daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
        dayOfMonth: null,
        monthOfYear: null,
      },
      parentEventId: null,
      reminders: [
        {
          id: uuid(),
          value: 15,
          unit: ReminderUnit.MINUTES,
          message: 'Standup starts soon',
        },
      ],
      linkedTodoId: null,
      linkedHabitId: null,
      linkedPomodoroSessionId: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      deletedAt: null,
    },
    {
      id: '2',
      userId: '1',
      title: 'Project Deadline',
      description: 'API Gateway v1.0 release',
      location: null,
      startTime: new Date('2024-02-01T00:00:00.000Z'),
      endTime: new Date('2024-02-01T23:59:59.999Z'),
      isAllDay: true,
      timezone: 'UTC',
      category: EventCategory.DEADLINE,
      color: '#EF4444',
      isRecurring: false,
      recurrenceRule: null,
      parentEventId: null,
      reminders: [
        {
          id: uuid(),
          value: 1,
          unit: ReminderUnit.DAYS,
          message: 'Deadline tomorrow!',
        },
        {
          id: uuid(),
          value: 1,
          unit: ReminderUnit.HOURS,
          message: 'Deadline in 1 hour!',
        },
      ],
      linkedTodoId: '1',
      linkedHabitId: null,
      linkedPomodoroSessionId: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      deletedAt: null,
    },
  ];

  /**
   * 🔧 MOCK: Create new event
   * TODO: Replace with microservice call
   */
  async create(dto: CreateEventDto, userId: string): Promise<CalendarEvent> {
    this.logger.log(`[MOCK] Creating event for user: ${userId}`);

    // Validate dates
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const newEvent: CalendarEvent = {
      id: uuid(),
      userId,
      title: dto.title,
      description: dto.description || null,
      location: dto.location || null,
      startTime,
      endTime,
      isAllDay: dto.isAllDay || false,
      timezone: dto.timezone || 'UTC',
      category: dto.category || EventCategory.OTHER,
      color: dto.color || null,
      isRecurring: !!dto.recurrenceRule,
      recurrenceRule: dto.recurrenceRule
        ? {
            frequency: dto.recurrenceRule.frequency,
            interval: dto.recurrenceRule.interval,
            endDate: dto.recurrenceRule.endDate
              ? new Date(dto.recurrenceRule.endDate)
              : null,
            count: dto.recurrenceRule.count || null,
            daysOfWeek: dto.recurrenceRule.daysOfWeek || null,
            dayOfMonth: dto.recurrenceRule.dayOfMonth || null,
            monthOfYear: dto.recurrenceRule.monthOfYear || null,
          }
        : null,
      parentEventId: null,
      reminders: dto.reminders
        ? dto.reminders.map((r) => ({
            id: uuid(),
            value: r.value,
            unit: r.unit,
            message: r.message || null,
          }))
        : [],
      linkedTodoId: dto.linkedTodoId || null,
      linkedHabitId: dto.linkedHabitId || null,
      linkedPomodoroSessionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    this.mockEvents.push(newEvent);

    this.logger.log(`[MOCK] Event created: ${newEvent.id}`);
    return newEvent;
  }

  /**
   * 🔧 MOCK: Get all events with filters
   * TODO: Replace with microservice call
   */
  async findAll(
    queryDto: QueryEventsDto,
    userId: string,
  ): Promise<{
    data: CalendarEvent[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    this.logger.log(`[MOCK] Getting events for user: ${userId}`);

    let filteredEvents = this.mockEvents.filter((e) => e.userId === userId);

    // Filter deleted
    if (!queryDto.includeDeleted) {
      filteredEvents = filteredEvents.filter((e) => e.deletedAt === null);
    }

    // Filter by category
    if (queryDto.category) {
      filteredEvents = filteredEvents.filter(
        (e) => e.category === queryDto.category,
      );
    }

    // Filter by date range
    if (queryDto.startDate) {
      const startDate = new Date(queryDto.startDate);
      filteredEvents = filteredEvents.filter((e) => e.startTime >= startDate);
    }

    if (queryDto.endDate) {
      const endDate = new Date(queryDto.endDate);
      filteredEvents = filteredEvents.filter((e) => e.startTime <= endDate);
    }

    // Filter recurring only
    if (queryDto.recurringOnly) {
      filteredEvents = filteredEvents.filter((e) => e.isRecurring);
    }

    // Sort by startTime
    filteredEvents.sort((a, b) => {
      if (queryDto.sortOrder === SortOrder.ASC) {
        return a.startTime.getTime() - b.startTime.getTime();
      } else {
        return b.startTime.getTime() - a.startTime.getTime();
      }
    });

    // Pagination
    const total = filteredEvents.length;
    const page = queryDto.page!;
    const limit = queryDto.limit!;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const paginatedEvents = filteredEvents.slice(skip, skip + limit);

    this.logger.log(
      `[MOCK] Returning ${paginatedEvents.length}/${total} events`,
    );

    return {
      data: paginatedEvents,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * 🔧 MOCK: Get single event by ID
   * TODO: Replace with microservice call
   */
  async findOne(id: string, userId: string): Promise<CalendarEvent> {
    this.logger.log(`[MOCK] Getting event: ${id} for user: ${userId}`);

    const event = this.mockEvents.find((e) => e.id === id && !e.deletedAt);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.userId !== userId) {
      throw new BadRequestException('This event does not belong to you');
    }

    return event;
  }

  /**
   * 🔧 MOCK: Update event
   * TODO: Replace with microservice call
   */
  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<CalendarEvent> {
    this.logger.log(`[MOCK] Updating event: ${id} for user: ${userId}`);

    const event = await this.findOne(id, userId);

    // Update fields
    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description || null;
    if (dto.location !== undefined) event.location = dto.location || null;

    if (dto.startTime !== undefined) {
      event.startTime = new Date(dto.startTime);
    }
    if (dto.endTime !== undefined) {
      event.endTime = new Date(dto.endTime);
    }

    // Validate dates
    if (event.endTime <= event.startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (dto.isAllDay !== undefined) event.isAllDay = dto.isAllDay;
    if (dto.timezone !== undefined) event.timezone = dto.timezone;
    if (dto.category !== undefined) event.category = dto.category;
    if (dto.color !== undefined) event.color = dto.color || null;

    if (dto.recurrenceRule !== undefined) {
      event.isRecurring = !!dto.recurrenceRule;
      event.recurrenceRule = dto.recurrenceRule
        ? {
            frequency: dto.recurrenceRule.frequency,
            interval: dto.recurrenceRule.interval,
            endDate: dto.recurrenceRule.endDate
              ? new Date(dto.recurrenceRule.endDate)
              : null,
            count: dto.recurrenceRule.count || null,
            daysOfWeek: dto.recurrenceRule.daysOfWeek || null,
            dayOfMonth: dto.recurrenceRule.dayOfMonth || null,
            monthOfYear: dto.recurrenceRule.monthOfYear || null,
          }
        : null;
    }

    if (dto.reminders !== undefined) {
      event.reminders = dto.reminders
        ? dto.reminders.map((r) => ({
            id: uuid(),
            value: r.value,
            unit: r.unit,
            message: r.message || null,
          }))
        : [];
    }

    if (dto.linkedTodoId !== undefined) event.linkedTodoId = dto.linkedTodoId || null;
    if (dto.linkedHabitId !== undefined) event.linkedHabitId = dto.linkedHabitId || null;

    event.updatedAt = new Date();

    this.logger.log(`[MOCK] Event updated: ${id}`);
    return event;
  }

  /**
   * 🔧 MOCK: Soft delete event
   * TODO: Replace with microservice call
   */
  async softDelete(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`[MOCK] Soft deleting event: ${id} for user: ${userId}`);

    const event = await this.findOne(id, userId);

    event.deletedAt = new Date();
    event.updatedAt = new Date();

    this.logger.log(`[MOCK] Event soft deleted: ${id}`);
    return { message: 'Event deleted successfully' };
  }

  /**
   * 🔧 MOCK: Restore soft-deleted event
   * TODO: Replace with microservice call
   */
  async restore(id: string, userId: string): Promise<CalendarEvent> {
    this.logger.log(`[MOCK] Restoring event: ${id} for user: ${userId}`);

    const event = this.mockEvents.find((e) => e.id === id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.userId !== userId) {
      throw new BadRequestException('This event does not belong to you');
    }

    if (!event.deletedAt) {
      throw new BadRequestException('Event is not deleted');
    }

    event.deletedAt = null;
    event.updatedAt = new Date();

    this.logger.log(`[MOCK] Event restored: ${id}`);
    return event;
  }

  /**
   * 🔧 MOCK: Get events for a specific month
   * TODO: Replace with microservice call
   */
  async getMonthView(
    year: number,
    month: number,
    userId: string,
  ): Promise<CalendarEvent[]> {
    this.logger.log(
      `[MOCK] Getting month view for ${year}-${month} for user: ${userId}`,
    );

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const events = this.mockEvents.filter(
      (e) =>
        e.userId === userId &&
        !e.deletedAt &&
        e.startTime >= startOfMonth &&
        e.startTime <= endOfMonth,
    );

    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * 🔧 MOCK: Get events for a specific day
   * TODO: Replace with microservice call
   */
  async getDayView(date: string, userId: string): Promise<CalendarEvent[]> {
    this.logger.log(`[MOCK] Getting day view for ${date} for user: ${userId}`);

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const events = this.mockEvents.filter(
      (e) =>
        e.userId === userId &&
        !e.deletedAt &&
        e.startTime >= startOfDay &&
        e.startTime <= endOfDay,
    );

    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
}
