import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Calendar')
@Controller({ path: 'calendar', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /**
   * Create new event
   */
  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new calendar event',
    description:
      '🔧 MOCK: Creates a new calendar event with optional recurrence and reminders.',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const user = req.user!;
    return this.calendarService.create(dto, user.userId);
  }

  /**
   * Get all events
   */
  @Get('events')
  @ApiOperation({
    summary: 'Get all calendar events',
    description:
      '🔧 MOCK: Returns paginated list of events with filters.\n\n' +
      'Supports filtering by category, date range, and more.',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(@Query() queryDto: QueryEventsDto, @Req() req: Request) {
    const user = req.user!;
    return this.calendarService.findAll(queryDto, user.userId);
  }

  /**
   * Get single event
   */
  @Get('events/:id')
  @ApiOperation({
    summary: 'Get event by ID',
    description: '🔧 MOCK: Returns a single event by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Event found',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.calendarService.findOne(id, user.userId);
  }

  /**
   * Update event
   */
  @Patch('events/:id')
  @ApiOperation({
    summary: 'Update calendar event',
    description: '🔧 MOCK: Updates an existing event.',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: Request,
  ) {
    const user = req.user!;
    return this.calendarService.update(id, dto, user.userId);
  }

  /**
   * Delete event (soft delete)
   */
  @Delete('events/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete calendar event',
    description: '🔧 MOCK: Soft deletes an event.',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.calendarService.softDelete(id, user.userId);
  }

  /**
   * Restore deleted event
   */
  @Post('events/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore deleted event',
    description: '🔧 MOCK: Restores a soft-deleted event.',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Event restored successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found or not deleted',
  })
  async restore(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.calendarService.restore(id, user.userId);
  }

  /**
   * Get month view
   */
  @Get('month/:year/:month')
  @ApiOperation({
    summary: 'Get calendar month view',
    description: '🔧 MOCK: Returns all events for a specific month.',
  })
  @ApiParam({
    name: 'year',
    description: 'Year (e.g., 2024)',
    example: 2024,
  })
  @ApiParam({
    name: 'month',
    description: 'Month (1-12)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Month events retrieved successfully',
  })
  async getMonthView(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Req() req: Request,
  ) {
    const user = req.user!;
    return this.calendarService.getMonthView(year, month, user.userId);
  }

  /**
   * Get day view
   */
  @Get('day/:date')
  @ApiOperation({
    summary: 'Get calendar day view',
    description: '🔧 MOCK: Returns all events for a specific day.',
  })
  @ApiParam({
    name: 'date',
    description: 'Date in ISO 8601 format',
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Day events retrieved successfully',
  })
  async getDayView(@Param('date') date: string, @Req() req: Request) {
    const user = req.user!;
    return this.calendarService.getDayView(date, user.userId);
  }
}
