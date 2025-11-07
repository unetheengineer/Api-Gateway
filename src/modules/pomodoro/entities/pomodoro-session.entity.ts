/**
 * Pomodoro Session Entity
 *
 * Represents a single pomodoro session (work, short break, or long break)
 */

export enum PomodoroSessionType {
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
}

export enum PomodoroSessionStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface PomodoroSession {
  id: string;
  userId: string;
  type: PomodoroSessionType;
  status: PomodoroSessionStatus;

  // Duration in minutes
  duration: number;

  // Timestamps
  startedAt: Date;
  pausedAt: Date | null;
  resumedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;

  // Integration
  linkedTodoId: string | null;

  // Optional notes
  notes: string | null;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User's Pomodoro Configuration
 */
export interface PomodoroConfig {
  userId: string;

  // Duration settings (in minutes)
  workDuration: number; // Default: 25
  shortBreakDuration: number; // Default: 5
  longBreakDuration: number; // Default: 15

  // Sessions before long break
  sessionsBeforeLongBreak: number; // Default: 4

  // Auto-start next session
  autoStartBreaks: boolean; // Default: false
  autoStartWork: boolean; // Default: false

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
