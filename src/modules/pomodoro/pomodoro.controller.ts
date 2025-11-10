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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PomodoroService } from './pomodoro.service';
import { StartSessionDto } from './dto/start-session.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Pomodoro')
@Controller({ path: 'pomodoro', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  /**
   * Start a new pomodoro session
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start new pomodoro session',
    description:
      '🔧 MOCK: Starts a new pomodoro session (work, short break, or long break).\n\n' +
      'Only one active session allowed per user at a time.',
  })
  @ApiResponse({
    status: 201,
    description: 'Session started successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        userId: '1',
        type: 'work',
        status: 'running',
        duration: 25,
        startedAt: '2024-01-10T10:00:00.000Z',
        pausedAt: null,
        resumedAt: null,
        completedAt: null,
        cancelledAt: null,
        linkedTodoId: '123',
        notes: 'Working on API Gateway',
        createdAt: '2024-01-10T10:00:00.000Z',
        updatedAt: '2024-01-10T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already has an active session',
  })
  async startSession(@Body() dto: StartSessionDto, @Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.startSession(dto, user.userId);
  }

  /**
   * Get current active session
   */
  @Get('current')
  @ApiOperation({
    summary: 'Get current active session',
    description:
      '🔧 MOCK: Returns the current active session (running or paused).\n\n' +
      'Returns null if no active session.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current session retrieved or null',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentSession(@Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.getCurrentSession(user.userId);
  }

  /**
   * Pause current session
   */
  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pause pomodoro session',
    description: '🔧 MOCK: Pauses a running pomodoro session.',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Session paused successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Session not running',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async pauseSession(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.pauseSession(id, user.userId);
  }

  /**
   * Resume paused session
   */
  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resume pomodoro session',
    description: '🔧 MOCK: Resumes a paused pomodoro session.',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Session resumed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Session not paused',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async resumeSession(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.resumeSession(id, user.userId);
  }

  /**
   * Complete session
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete pomodoro session',
    description: '🔧 MOCK: Marks a session as completed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Session completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Session already completed or cancelled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async completeSession(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.completeSession(id, user.userId);
  }

  /**
   * Cancel session
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel pomodoro session',
    description: '🔧 MOCK: Cancels an active session.',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Session cancelled successfully',
    schema: {
      example: {
        message: 'Session cancelled successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Session already completed or cancelled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async cancelSession(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.cancelSession(id, user.userId);
  }

  /**
   * Get session history
   */
  @Get('history')
  @ApiOperation({
    summary: 'Get session history',
    description:
      '🔧 MOCK: Returns paginated session history with filters.\n\n' +
      'Supports filtering by type, status, date range, and more.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session history retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '1',
            userId: '1',
            type: 'work',
            status: 'completed',
            duration: 25,
            startedAt: '2024-01-10T09:00:00.000Z',
            completedAt: '2024-01-10T09:25:00.000Z',
            linkedTodoId: '1',
            notes: 'Working on API Gateway',
          },
        ],
        meta: {
          total: 10,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getHistory(@Query() queryDto: QuerySessionsDto, @Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.getHistory(queryDto, user.userId);
  }

  /**
   * Get statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get pomodoro statistics',
    description:
      '🔧 MOCK: Returns productivity statistics for the user.\n\n' +
      'Includes total sessions, work time, streaks, and more.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalSessions: 50,
        completedSessions: 45,
        totalWorkTime: 1125, // minutes
        totalBreakTime: 225, // minutes
        currentStreak: 5, // days
        longestStreak: 12, // days
        todaysSessions: 4,
        thisWeeksSessions: 20,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getStatistics(@Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.getStatistics(user.userId);
  }

  /**
   * Get user configuration
   */
  @Get('config')
  @ApiOperation({
    summary: 'Get pomodoro configuration',
    description: '🔧 MOCK: Returns user\'s pomodoro configuration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    schema: {
      example: {
        userId: '1',
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartBreaks: false,
        autoStartWork: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getConfig(@Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.getConfig(user.userId);
  }

  /**
   * Update user configuration
   */
  @Patch('config')
  @ApiOperation({
    summary: 'Update pomodoro configuration',
    description: '🔧 MOCK: Updates user\'s pomodoro timer settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateConfig(@Body() dto: UpdateConfigDto, @Req() req: Request) {
    const user = req.user!;
    return this.pomodoroService.updateConfig(dto, user.userId);
  }
}
