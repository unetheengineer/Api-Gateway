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
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { MarkCompletionDto } from './dto/mark-completion.dto';
import { QueryHabitsDto } from './dto/query-habits.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Habits')
@Controller({ path: 'habits', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  /**
   * Create new habit
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new habit',
    description:
      '🔧 MOCK: Creates a new habit for tracking.\n\n' +
      'Supports daily, weekly, monthly, and custom frequency patterns.',
  })
  @ApiResponse({
    status: 201,
    description: 'Habit created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(@Body() dto: CreateHabitDto, @Req() req: Request) {
    const user = req.user!;
    return this.habitsService.create(dto, user.userId);
  }

  /**
   * Get all habits
   */
  @Get()
  @ApiOperation({
    summary: 'Get all habits',
    description:
      '🔧 MOCK: Returns paginated list of habits with filters.\n\n' +
      'Supports filtering by frequency, category, and archived status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Habits retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(@Query() queryDto: QueryHabitsDto, @Req() req: Request) {
    const user = req.user!;
    return this.habitsService.findAll(queryDto, user.userId);
  }

  /**
   * Get today's habits
   */
  @Get('today')
  @ApiOperation({
    summary: "Get today's habits",
    description:
      '🔧 MOCK: Returns all habits that should be completed today.\n\n' +
      'Includes completion status for today.',
  })
  @ApiResponse({
    status: 200,
    description: "Today's habits retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTodaysHabits(@Req() req: Request) {
    const user = req.user!;
    return this.habitsService.getTodaysHabits(user.userId);
  }

  /**
   * Get calendar view for a month
   */
  @Get('calendar/:year/:month')
  @ApiOperation({
    summary: 'Get calendar month view',
    description: '🔧 MOCK: Returns all habits and completions for a month.',
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
    description: 'Month view retrieved successfully',
  })
  async getMonthView(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Req() req: Request,
  ) {
    const user = req.user!;
    return this.habitsService.getMonthView(year, month, user.userId);
  }

  /**
   * Get single habit
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get habit by ID',
    description: '🔧 MOCK: Returns a single habit by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Habit found',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.habitsService.findOne(id, user.userId);
  }

  /**
   * Get habit statistics
   */
  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get habit statistics',
    description:
      '🔧 MOCK: Returns statistics for a habit.\n\n' +
      'Includes streaks, completion rate, and recent completions.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async getStatistics(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.habitsService.getStatistics(id, user.userId);
  }

  /**
   * Update habit
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update habit',
    description: '🔧 MOCK: Updates an existing habit.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Habit updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
    @Req() req: Request,
  ) {
    const user = req.user!;
    return this.habitsService.update(id, dto, user.userId);
  }

  /**
   * Mark habit completion
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark habit completion',
    description: '🔧 MOCK: Marks a habit as completed for a specific date.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Completion marked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async markCompletion(
    @Param('id') id: string,
    @Body() dto: MarkCompletionDto,
    @Req() req: Request,
  ) {
    const user = req.user!;
    return this.habitsService.markCompletion(id, dto, user.userId);
  }

  /**
   * Unmark habit completion
   */
  @Delete(':id/complete/:date')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unmark habit completion',
    description: '🔧 MOCK: Removes completion for a specific date.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
  })
  @ApiParam({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Completion removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit or completion not found',
  })
  async unmarkCompletion(
    @Param('id') id: string,
    @Param('date') date: string,
    @Req() req: Request,
  ) {
    const user = req.user!;
    return this.habitsService.unmarkCompletion(id, date, user.userId);
  }

  /**
   * Delete habit (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete habit',
    description: '🔧 MOCK: Soft deletes a habit.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Habit deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found',
  })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.habitsService.softDelete(id, user.userId);
  }

  /**
   * Restore deleted habit
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore deleted habit',
    description: '🔧 MOCK: Restores a soft-deleted habit.',
  })
  @ApiParam({
    name: 'id',
    description: 'Habit ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Habit restored successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Habit not found or not deleted',
  })
  async restore(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.habitsService.restore(id, user.userId);
  }

  /**
   * 🔧 MOCK: Debug endpoint
   */
  @Get('debug/all')
  @ApiOperation({
    summary: '🔧 [DEBUG] Get all mock habits',
    description:
      '⚠️ DEVELOPMENT ONLY - Shows all mock habits.\n\n' +
      'Remove this endpoint in production!',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all mock habits',
  })
  async getAllMockHabits() {
    return {
      message: '🔧 MOCK DATA - Remove this endpoint in production',
      habits: this.habitsService.getAllMockHabits(),
    };
  }
}
