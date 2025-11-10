import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Habit, HabitCompletion } from './entities/habit.entity';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { MarkCompletionDto } from './dto/mark-completion.dto';
import { QueryHabitsDto } from './dto/query-habits.dto';

/**
 * Habits Service
 * 🔧 MOCK Implementation - In-memory storage
 *
 * TODO: Replace with microservice call when Habits Service is ready
 */
@Injectable()
export class HabitsService {
  private readonly logger = new Logger(HabitsService.name);

  // 🔧 MOCK: In-memory storage
  private mockHabits: Habit[] = [
    {
      id: '1',
      userId: '1',
      name: 'Morning Exercise',
      description: '30 minutes of cardio or strength training',
      frequency: 'daily',
      customDays: null,
      category: 'fitness',
      color: '#4CAF50',
      targetCount: 1,
      goalDescription: 'Stay healthy and energized',
      currentStreak: 7,
      longestStreak: 14,
      totalCompletions: 45,
      startDate: new Date('2024-01-01'),
      endDate: null,
      isArchived: false,
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      userId: '1',
      name: 'Read for 30 minutes',
      description: 'Reading books before bed',
      frequency: 'daily',
      customDays: null,
      category: 'learning',
      color: '#2196F3',
      targetCount: 1,
      goalDescription: 'Read 24 books this year',
      currentStreak: 3,
      longestStreak: 10,
      totalCompletions: 28,
      startDate: new Date('2024-01-05'),
      endDate: null,
      isArchived: false,
      deletedAt: null,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      userId: '1',
      name: 'Meditation',
      description: '10 minutes of mindfulness meditation',
      frequency: 'weekly',
      customDays: [1, 3, 5], // Mon, Wed, Fri
      category: 'mindfulness',
      color: '#9C27B0',
      targetCount: 1,
      goalDescription: 'Reduce stress and improve focus',
      currentStreak: 2,
      longestStreak: 6,
      totalCompletions: 18,
      startDate: new Date('2024-01-08'),
      endDate: null,
      isArchived: false,
      deletedAt: null,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  private mockCompletions: HabitCompletion[] = [
    {
      id: '1',
      habitId: '1',
      userId: '1',
      date: '2024-01-15',
      completed: true,
      completionCount: 1,
      notes: 'Great morning workout!',
      createdAt: new Date('2024-01-15T07:00:00Z'),
      updatedAt: new Date('2024-01-15T07:00:00Z'),
    },
    {
      id: '2',
      habitId: '2',
      userId: '1',
      date: '2024-01-15',
      completed: true,
      completionCount: 1,
      notes: 'Finished chapter 5',
      createdAt: new Date('2024-01-15T22:00:00Z'),
      updatedAt: new Date('2024-01-15T22:00:00Z'),
    },
  ];

  /**
   * Create new habit
   */
  async create(dto: CreateHabitDto, userId: string): Promise<Habit> {
    this.logger.log(`[MOCK] Creating habit for user: ${userId}`);

    // Validate customDays for weekly/custom frequency
    if (
      (dto.frequency === 'weekly' || dto.frequency === 'custom') &&
      (!dto.customDays || dto.customDays.length === 0)
    ) {
      throw new BadRequestException(
        'customDays is required for weekly or custom frequency',
      );
    }

    const habit: Habit = {
      id: uuidv4(),
      userId,
      name: dto.name,
      description: dto.description || null,
      frequency: dto.frequency,
      customDays:
        dto.frequency === 'daily' || dto.frequency === 'monthly'
          ? null
          : dto.customDays || null,
      category: dto.category,
      color: dto.color || '#4CAF50',
      targetCount: dto.targetCount || 1,
      goalDescription: dto.goalDescription || null,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      isArchived: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockHabits.push(habit);

    this.logger.log(`[MOCK] Habit created: ${habit.id}`);
    return habit;
  }

  /**
   * Get all habits with filtering and pagination
   */
  async findAll(queryDto: QueryHabitsDto, userId: string) {
    this.logger.log(`[MOCK] Fetching habits for user: ${userId}`);

    const {
      page = 1,
      limit = 10,
      frequency,
      category,
      isArchived = false,
      includeDeleted = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    let filtered = this.mockHabits.filter((habit) => habit.userId === userId);

    // Apply filters
    if (!includeDeleted) {
      filtered = filtered.filter((habit) => habit.deletedAt === null);
    }

    if (frequency) {
      filtered = filtered.filter((habit) => habit.frequency === frequency);
    }

    if (category) {
      filtered = filtered.filter((habit) => habit.category === category);
    }

    filtered = filtered.filter((habit) => habit.isArchived === isArchived);

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Habit];
      let bVal: any = b[sortBy as keyof Habit];

      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    this.logger.log(`[MOCK] Found ${total} habits for user: ${userId}`);

    return {
      data: paginatedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single habit by ID
   */
  async findOne(id: string, userId: string): Promise<Habit> {
    this.logger.log(`[MOCK] Fetching habit ${id} for user: ${userId}`);

    const habit = this.mockHabits.find(
      (h) => h.id === id && h.deletedAt === null,
    );

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    if (habit.userId !== userId) {
      throw new ForbiddenException('You do not have access to this habit');
    }

    return habit;
  }

  /**
   * Update habit
   */
  async update(
    id: string,
    dto: UpdateHabitDto,
    userId: string,
  ): Promise<Habit> {
    this.logger.log(`[MOCK] Updating habit ${id} for user: ${userId}`);

    const habit = await this.findOne(id, userId);

    // Validate customDays if frequency is being updated
    if (dto.frequency === 'weekly' || dto.frequency === 'custom') {
      if (
        (!dto.customDays || dto.customDays.length === 0) &&
        (!habit.customDays || habit.customDays.length === 0)
      ) {
        throw new BadRequestException(
          'customDays is required for weekly or custom frequency',
        );
      }
    }

    // Update fields
    if (dto.name !== undefined) habit.name = dto.name;
    if (dto.description !== undefined) habit.description = dto.description;
    if (dto.frequency !== undefined) habit.frequency = dto.frequency;
    if (dto.customDays !== undefined) habit.customDays = dto.customDays;
    if (dto.category !== undefined) habit.category = dto.category;
    if (dto.color !== undefined) habit.color = dto.color;
    if (dto.targetCount !== undefined) habit.targetCount = dto.targetCount;
    if (dto.goalDescription !== undefined)
      habit.goalDescription = dto.goalDescription;
    if (dto.startDate !== undefined)
      habit.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      habit.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.isArchived !== undefined) habit.isArchived = dto.isArchived;

    habit.updatedAt = new Date();

    this.logger.log(`[MOCK] Habit updated: ${id}`);
    return habit;
  }

  /**
   * Soft delete habit
   */
  async softDelete(id: string, userId: string) {
    this.logger.log(`[MOCK] Soft deleting habit ${id} for user: ${userId}`);

    const habit = await this.findOne(id, userId);
    habit.deletedAt = new Date();
    habit.updatedAt = new Date();

    this.logger.log(`[MOCK] Habit soft deleted: ${id}`);
    return { message: 'Habit deleted successfully' };
  }

  /**
   * Restore soft-deleted habit
   */
  async restore(id: string, userId: string): Promise<Habit> {
    this.logger.log(`[MOCK] Restoring habit ${id} for user: ${userId}`);

    const habit = this.mockHabits.find(
      (h) => h.id === id && h.userId === userId,
    );

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    if (!habit.deletedAt) {
      throw new BadRequestException('Habit is not deleted');
    }

    habit.deletedAt = null;
    habit.updatedAt = new Date();

    this.logger.log(`[MOCK] Habit restored: ${id}`);
    return habit;
  }

  /**
   * Mark habit completion for a specific date
   */
  async markCompletion(
    habitId: string,
    dto: MarkCompletionDto,
    userId: string,
  ): Promise<HabitCompletion> {
    this.logger.log(
      `[MOCK] Marking completion for habit ${habitId}, date: ${dto.date}`,
    );

    // Verify habit exists and belongs to user
    await this.findOne(habitId, userId);

    // Find existing completion for this date
    let completion = this.mockCompletions.find(
      (c) => c.habitId === habitId && c.date === dto.date,
    );

    if (completion) {
      // Update existing completion
      completion.completed = dto.completed;
      completion.completionCount = dto.completionCount || 1;
      completion.notes = dto.notes || null;
      completion.updatedAt = new Date();
    } else {
      // Create new completion
      completion = {
        id: uuidv4(),
        habitId,
        userId,
        date: dto.date,
        completed: dto.completed,
        completionCount: dto.completionCount || 1,
        notes: dto.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mockCompletions.push(completion);
    }

    // Recalculate streak and total completions
    await this.recalculateHabitStats(habitId, userId);

    this.logger.log(`[MOCK] Completion marked for habit ${habitId}`);
    return completion;
  }

  /**
   * Unmark completion for a specific date
   */
  async unmarkCompletion(
    habitId: string,
    date: string,
    userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(
      `[MOCK] Unmarking completion for habit ${habitId}, date: ${date}`,
    );

    // Verify habit exists and belongs to user
    await this.findOne(habitId, userId);

    const completionIndex = this.mockCompletions.findIndex(
      (c) => c.habitId === habitId && c.date === date && c.userId === userId,
    );

    if (completionIndex === -1) {
      throw new NotFoundException('Completion not found for this date');
    }

    this.mockCompletions.splice(completionIndex, 1);

    // Recalculate streak and total completions
    await this.recalculateHabitStats(habitId, userId);

    this.logger.log(`[MOCK] Completion unmarked for habit ${habitId}`);
    return { message: 'Completion removed successfully' };
  }

  /**
   * Get habit statistics
   */
  async getStatistics(habitId: string, userId: string) {
    this.logger.log(`[MOCK] Fetching statistics for habit ${habitId}`);

    const habit = await this.findOne(habitId, userId);
    const completions = this.mockCompletions.filter(
      (c) => c.habitId === habitId && c.completed === true,
    );

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysCompletions = completions.filter((c) => {
      const completionDate = new Date(c.date);
      return completionDate >= thirtyDaysAgo;
    });

    const completionRate =
      last30DaysCompletions.length > 0
        ? (last30DaysCompletions.length / 30) * 100
        : 0;

    return {
      habitId: habit.id,
      habitName: habit.name,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      completionRate: Math.round(completionRate * 100) / 100,
      last30DaysCompletions: last30DaysCompletions.length,
      recentCompletions: completions.slice(-10).reverse(),
    };
  }

  /**
   * Get today's habits (habits that should be done today)
   */
  async getTodaysHabits(userId: string) {
    this.logger.log(`[MOCK] Fetching today's habits for user: ${userId}`);

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    const habits = this.mockHabits.filter(
      (h) =>
        h.userId === userId && h.deletedAt === null && h.isArchived === false,
    );

    const todaysHabits = habits.filter((habit) => {
      // Check if habit is active (started and not ended)
      if (habit.startDate > today) return false;
      if (habit.endDate && habit.endDate < today) return false;

      // Check frequency
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
        return habit.customDays?.includes(dayOfWeek) || false;
      }
      if (habit.frequency === 'monthly') {
        // For monthly, check if it's the same day of month as start date
        return today.getDate() === habit.startDate.getDate();
      }

      return false;
    });

    // Check completion status for today
    const todayStr = today.toISOString().split('T')[0];
    const habitsWithStatus = todaysHabits.map((habit) => {
      const completion = this.mockCompletions.find(
        (c) => c.habitId === habit.id && c.date === todayStr,
      );

      return {
        ...habit,
        completedToday: completion?.completed || false,
        todayCompletionCount: completion?.completionCount || 0,
        todayNotes: completion?.notes || null,
      };
    });

    return habitsWithStatus;
  }

  /**
   * Get calendar view for a specific month
   */
  async getMonthView(year: number, month: number, userId: string) {
    this.logger.log(
      `[MOCK] Fetching calendar for ${year}-${month}, user: ${userId}`,
    );

    const habits = this.mockHabits.filter(
      (h) =>
        h.userId === userId && h.deletedAt === null && h.isArchived === false,
    );

    // Get all completions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const monthCompletions = this.mockCompletions.filter(
      (c) =>
        c.userId === userId && c.date >= startDateStr && c.date <= endDateStr,
    );

    return {
      year,
      month,
      habits: habits.map((h) => ({
        id: h.id,
        name: h.name,
        color: h.color,
      })),
      completions: monthCompletions,
    };
  }

  /**
   * Recalculate habit statistics (streak, total completions)
   */
  private async recalculateHabitStats(habitId: string, userId: string) {
    const habit = this.mockHabits.find(
      (h) => h.id === habitId && h.userId === userId,
    );
    if (!habit) return;

    const completions = this.mockCompletions
      .filter((c) => c.habitId === habitId && c.completed === true)
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort descending

    // Calculate total completions
    habit.totalCompletions = completions.length;

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      // Check last year
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasCompletion = completions.some((c) => c.date === dateStr);

      if (hasCompletion) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
        if (i > 0) {
          break; // Stop counting current streak if we hit a gap
        }
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(longestStreak, currentStreak);
    habit.updatedAt = new Date();
  }

  /**
   * 🔧 MOCK: Get all habits (for debugging)
   */
  getAllMockHabits() {
    return this.mockHabits;
  }
}
