/**
 * Habit Entity
 * 🔧 MOCK Implementation - In-memory storage
 *
 * Represents a habit that a user wants to track.
 * Supports daily, weekly, and custom frequency patterns.
 */

export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'productivity'
  | 'learning'
  | 'mindfulness'
  | 'social'
  | 'finance'
  | 'other';

export class Habit {
  /** Unique habit identifier */
  id: string;

  /** User who owns this habit */
  userId: string;

  /** Habit name */
  name: string;

  /** Detailed description */
  description: string | null;

  /** Frequency type */
  frequency: HabitFrequency;

  /**
   * Custom days for weekly frequency (0-6, where 0 = Sunday)
   * Used only when frequency = 'weekly' or 'custom'
   */
  customDays: number[] | null;

  /** Habit category */
  category: HabitCategory;

  /** Display color (hex format) */
  color: string;

  /** Target completion count per day (for habits that can be done multiple times) */
  targetCount: number;

  /** Goal description (e.g., "Drink 8 glasses") */
  goalDescription: string | null;

  /** Current streak in days */
  currentStreak: number;

  /** Longest streak ever achieved */
  longestStreak: number;

  /** Total completions count */
  totalCompletions: number;

  /** When the habit tracking started */
  startDate: Date;

  /** When the habit tracking should end (null for ongoing) */
  endDate: Date | null;

  /** Whether the habit is archived */
  isArchived: boolean;

  /** Soft delete timestamp */
  deletedAt: Date | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Habit Completion Entity
 * Tracks individual completions for a habit
 */
export class HabitCompletion {
  /** Unique completion identifier */
  id: string;

  /** Reference to habit */
  habitId: string;

  /** User who owns this completion */
  userId: string;

  /** Date of completion (YYYY-MM-DD format) */
  date: string;

  /** Whether completed on this date */
  completed: boolean;

  /** Number of times completed on this date */
  completionCount: number;

  /** Optional notes for this completion */
  notes: string | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}
