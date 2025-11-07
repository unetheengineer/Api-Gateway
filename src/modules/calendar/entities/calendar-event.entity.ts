/**
 * Calendar Event Entity
 *
 * Represents a calendar event with support for recurring events and reminders
 */

export enum EventCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  MEETING = 'meeting',
  DEADLINE = 'deadline',
  APPOINTMENT = 'appointment',
  BIRTHDAY = 'birthday',
  HOLIDAY = 'holiday',
  OTHER = 'other',
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum ReminderUnit {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
}

/**
 * Recurrence Rule for recurring events
 */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks
  endDate?: Date | null; // When recurrence ends
  count?: number | null; // Number of occurrences
  daysOfWeek?: number[] | null; // 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number | null; // For monthly recurrence
  monthOfYear?: number | null; // For yearly recurrence (1-12)
}

/**
 * Event Reminder
 */
export interface EventReminder {
  id: string;
  value: number; // e.g., 15
  unit: ReminderUnit; // e.g., minutes
  message?: string | null;
}

/**
 * Calendar Event
 */
export interface CalendarEvent {
  id: string;
  userId: string;

  // Basic info
  title: string;
  description: string | null;
  location: string | null;

  // Time
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  timezone: string; // e.g., 'UTC', 'America/New_York'

  // Organization
  category: EventCategory;
  color: string | null; // Hex color for UI

  // Recurrence
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule | null;
  parentEventId: string | null; // For recurring event instances

  // Reminders
  reminders: EventReminder[];

  // Integration
  linkedTodoId: string | null;
  linkedHabitId: string | null;
  linkedPomodoroSessionId: string | null;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // Soft delete
}

/**
 * Event with recurrence instances (for API responses)
 */
export interface EventWithInstances extends CalendarEvent {
  instances?: CalendarEvent[]; // Recurring event instances
}
