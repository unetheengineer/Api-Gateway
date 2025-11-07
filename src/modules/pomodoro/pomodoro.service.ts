import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  PomodoroSession,
  PomodoroSessionStatus,
  PomodoroSessionType,
  PomodoroConfig,
} from './entities/pomodoro-session.entity';
import { StartSessionDto } from './dto/start-session.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QuerySessionsDto, SortOrder } from './dto/query-sessions.dto';

/**
 * 🔧 MOCK: Pomodoro Service
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
export class PomodoroService {
  private readonly logger = new Logger(PomodoroService.name);

  // 🔧 MOCK: In-memory session storage
  private mockSessions: PomodoroSession[] = [
    {
      id: '1',
      userId: '1',
      type: PomodoroSessionType.WORK,
      status: PomodoroSessionStatus.COMPLETED,
      duration: 25,
      startedAt: new Date('2024-01-10T09:00:00.000Z'),
      pausedAt: null,
      resumedAt: null,
      completedAt: new Date('2024-01-10T09:25:00.000Z'),
      cancelledAt: null,
      linkedTodoId: '1',
      notes: 'Working on API Gateway setup',
      createdAt: new Date('2024-01-10T09:00:00.000Z'),
      updatedAt: new Date('2024-01-10T09:25:00.000Z'),
    },
    {
      id: '2',
      userId: '1',
      type: PomodoroSessionType.SHORT_BREAK,
      status: PomodoroSessionStatus.COMPLETED,
      duration: 5,
      startedAt: new Date('2024-01-10T09:25:00.000Z'),
      pausedAt: null,
      resumedAt: null,
      completedAt: new Date('2024-01-10T09:30:00.000Z'),
      cancelledAt: null,
      linkedTodoId: null,
      notes: null,
      createdAt: new Date('2024-01-10T09:25:00.000Z'),
      updatedAt: new Date('2024-01-10T09:30:00.000Z'),
    },
  ];

  // 🔧 MOCK: In-memory config storage
  private mockConfigs: Map<string, PomodoroConfig> = new Map([
    [
      '1',
      {
        userId: '1',
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartBreaks: false,
        autoStartWork: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ],
  ]);

  /**
   * 🔧 MOCK: Start a new pomodoro session
   * TODO: Replace with microservice call
   */
  async startSession(
    dto: StartSessionDto,
    userId: string,
  ): Promise<PomodoroSession> {
    this.logger.log(
      `[MOCK] Starting ${dto.type} session for user: ${userId}`,
    );

    // Check if user has an active session
    const activeSession = this.mockSessions.find(
      (s) =>
        s.userId === userId &&
        (s.status === PomodoroSessionStatus.RUNNING ||
          s.status === PomodoroSessionStatus.PAUSED),
    );

    if (activeSession) {
      throw new ConflictException(
        `You already have an active ${activeSession.type} session. Complete or cancel it first.`,
      );
    }

    // Get user config for duration
    const config = this.getOrCreateConfig(userId);
    let duration: number;

    switch (dto.type) {
      case PomodoroSessionType.WORK:
        duration = config.workDuration;
        break;
      case PomodoroSessionType.SHORT_BREAK:
        duration = config.shortBreakDuration;
        break;
      case PomodoroSessionType.LONG_BREAK:
        duration = config.longBreakDuration;
        break;
    }

    const newSession: PomodoroSession = {
      id: uuid(),
      userId,
      type: dto.type,
      status: PomodoroSessionStatus.RUNNING,
      duration,
      startedAt: new Date(),
      pausedAt: null,
      resumedAt: null,
      completedAt: null,
      cancelledAt: null,
      linkedTodoId: dto.linkedTodoId || null,
      notes: dto.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockSessions.push(newSession);

    this.logger.log(`[MOCK] Session started: ${newSession.id}`);
    return newSession;
  }

  /**
   * 🔧 MOCK: Get current active session
   * TODO: Replace with microservice call
   */
  async getCurrentSession(userId: string): Promise<PomodoroSession | null> {
    this.logger.log(`[MOCK] Getting current session for user: ${userId}`);

    const activeSession = this.mockSessions.find(
      (s) =>
        s.userId === userId &&
        (s.status === PomodoroSessionStatus.RUNNING ||
          s.status === PomodoroSessionStatus.PAUSED),
    );

    return activeSession || null;
  }

  /**
   * 🔧 MOCK: Pause current session
   * TODO: Replace with microservice call
   */
  async pauseSession(sessionId: string, userId: string): Promise<PomodoroSession> {
    this.logger.log(`[MOCK] Pausing session: ${sessionId} for user: ${userId}`);

    const session = this.mockSessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    if (session.status !== PomodoroSessionStatus.RUNNING) {
      throw new BadRequestException('Only running sessions can be paused');
    }

    session.status = PomodoroSessionStatus.PAUSED;
    session.pausedAt = new Date();
    session.updatedAt = new Date();

    this.logger.log(`[MOCK] Session paused: ${sessionId}`);
    return session;
  }

  /**
   * 🔧 MOCK: Resume paused session
   * TODO: Replace with microservice call
   */
  async resumeSession(sessionId: string, userId: string): Promise<PomodoroSession> {
    this.logger.log(`[MOCK] Resuming session: ${sessionId} for user: ${userId}`);

    const session = this.mockSessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    if (session.status !== PomodoroSessionStatus.PAUSED) {
      throw new BadRequestException('Only paused sessions can be resumed');
    }

    session.status = PomodoroSessionStatus.RUNNING;
    session.resumedAt = new Date();
    session.updatedAt = new Date();

    this.logger.log(`[MOCK] Session resumed: ${sessionId}`);
    return session;
  }

  /**
   * 🔧 MOCK: Complete current session
   * TODO: Replace with microservice call
   */
  async completeSession(
    sessionId: string,
    userId: string,
  ): Promise<PomodoroSession> {
    this.logger.log(
      `[MOCK] Completing session: ${sessionId} for user: ${userId}`,
    );

    const session = this.mockSessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    if (
      session.status !== PomodoroSessionStatus.RUNNING &&
      session.status !== PomodoroSessionStatus.PAUSED
    ) {
      throw new BadRequestException('Session is already completed or cancelled');
    }

    session.status = PomodoroSessionStatus.COMPLETED;
    session.completedAt = new Date();
    session.updatedAt = new Date();

    this.logger.log(`[MOCK] Session completed: ${sessionId}`);
    return session;
  }

  /**
   * 🔧 MOCK: Cancel current session
   * TODO: Replace with microservice call
   */
  async cancelSession(
    sessionId: string,
    userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(
      `[MOCK] Cancelling session: ${sessionId} for user: ${userId}`,
    );

    const session = this.mockSessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    if (
      session.status !== PomodoroSessionStatus.RUNNING &&
      session.status !== PomodoroSessionStatus.PAUSED
    ) {
      throw new BadRequestException('Session is already completed or cancelled');
    }

    session.status = PomodoroSessionStatus.CANCELLED;
    session.cancelledAt = new Date();
    session.updatedAt = new Date();

    this.logger.log(`[MOCK] Session cancelled: ${sessionId}`);
    return { message: 'Session cancelled successfully' };
  }

  /**
   * 🔧 MOCK: Get session history with filters
   * TODO: Replace with microservice call
   */
  async getHistory(
    queryDto: QuerySessionsDto,
    userId: string,
  ): Promise<{
    data: PomodoroSession[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    this.logger.log(`[MOCK] Getting session history for user: ${userId}`);

    let filteredSessions = this.mockSessions.filter((s) => s.userId === userId);

    // Filter by type
    if (queryDto.type) {
      filteredSessions = filteredSessions.filter((s) => s.type === queryDto.type);
    }

    // Filter by status
    if (queryDto.status) {
      filteredSessions = filteredSessions.filter(
        (s) => s.status === queryDto.status,
      );
    }

    // Filter by completed only
    if (queryDto.completedOnly) {
      filteredSessions = filteredSessions.filter(
        (s) => s.status === PomodoroSessionStatus.COMPLETED,
      );
    }

    // Filter by date range
    if (queryDto.startDate) {
      const startDate = new Date(queryDto.startDate);
      filteredSessions = filteredSessions.filter(
        (s) => s.startedAt >= startDate,
      );
    }

    if (queryDto.endDate) {
      const endDate = new Date(queryDto.endDate);
      filteredSessions = filteredSessions.filter((s) => s.startedAt <= endDate);
    }

    // Sort by startedAt
    filteredSessions.sort((a, b) => {
      if (queryDto.sortOrder === SortOrder.ASC) {
        return a.startedAt.getTime() - b.startedAt.getTime();
      } else {
        return b.startedAt.getTime() - a.startedAt.getTime();
      }
    });

    // Pagination
    const total = filteredSessions.length;
    const page = queryDto.page!;
    const limit = queryDto.limit!;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const paginatedSessions = filteredSessions.slice(skip, skip + limit);

    this.logger.log(
      `[MOCK] Returning ${paginatedSessions.length}/${total} sessions`,
    );

    return {
      data: paginatedSessions,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * 🔧 MOCK: Get user statistics
   * TODO: Replace with microservice call
   */
  async getStatistics(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    totalWorkTime: number; // in minutes
    totalBreakTime: number; // in minutes
    currentStreak: number; // consecutive days with completed work sessions
    longestStreak: number;
    todaysSessions: number;
    thisWeeksSessions: number;
  }> {
    this.logger.log(`[MOCK] Getting statistics for user: ${userId}`);

    const userSessions = this.mockSessions.filter((s) => s.userId === userId);
    const completedSessions = userSessions.filter(
      (s) => s.status === PomodoroSessionStatus.COMPLETED,
    );

    const totalWorkTime = completedSessions
      .filter((s) => s.type === PomodoroSessionType.WORK)
      .reduce((sum, s) => sum + s.duration, 0);

    const totalBreakTime = completedSessions
      .filter(
        (s) =>
          s.type === PomodoroSessionType.SHORT_BREAK ||
          s.type === PomodoroSessionType.LONG_BREAK,
      )
      .reduce((sum, s) => sum + s.duration, 0);

    // Today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysSessions = userSessions.filter((s) => s.startedAt >= today).length;

    // This week's sessions
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const thisWeeksSessions = userSessions.filter(
      (s) => s.startedAt >= weekStart,
    ).length;

    return {
      totalSessions: userSessions.length,
      completedSessions: completedSessions.length,
      totalWorkTime,
      totalBreakTime,
      currentStreak: 0, // TODO: Implement streak calculation
      longestStreak: 0, // TODO: Implement streak calculation
      todaysSessions,
      thisWeeksSessions,
    };
  }

  /**
   * 🔧 MOCK: Get user configuration
   * TODO: Replace with microservice call
   */
  async getConfig(userId: string): Promise<PomodoroConfig> {
    this.logger.log(`[MOCK] Getting config for user: ${userId}`);
    return this.getOrCreateConfig(userId);
  }

  /**
   * 🔧 MOCK: Update user configuration
   * TODO: Replace with microservice call
   */
  async updateConfig(
    dto: UpdateConfigDto,
    userId: string,
  ): Promise<PomodoroConfig> {
    this.logger.log(`[MOCK] Updating config for user: ${userId}`);

    const config = this.getOrCreateConfig(userId);

    if (dto.workDuration !== undefined) {
      config.workDuration = dto.workDuration;
    }
    if (dto.shortBreakDuration !== undefined) {
      config.shortBreakDuration = dto.shortBreakDuration;
    }
    if (dto.longBreakDuration !== undefined) {
      config.longBreakDuration = dto.longBreakDuration;
    }
    if (dto.sessionsBeforeLongBreak !== undefined) {
      config.sessionsBeforeLongBreak = dto.sessionsBeforeLongBreak;
    }
    if (dto.autoStartBreaks !== undefined) {
      config.autoStartBreaks = dto.autoStartBreaks;
    }
    if (dto.autoStartWork !== undefined) {
      config.autoStartWork = dto.autoStartWork;
    }

    config.updatedAt = new Date();
    this.mockConfigs.set(userId, config);

    this.logger.log(`[MOCK] Config updated for user: ${userId}`);
    return config;
  }

  /**
   * Helper: Get or create default config
   */
  private getOrCreateConfig(userId: string): PomodoroConfig {
    let config = this.mockConfigs.get(userId);

    if (!config) {
      config = {
        userId,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartBreaks: false,
        autoStartWork: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mockConfigs.set(userId, config);
    }

    return config;
  }
}
