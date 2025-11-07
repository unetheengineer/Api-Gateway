/**
 * Todo Entity
 *
 * This interface defines the Todo data structure.
 * When migrating to microservice, this structure will remain the same.
 * Only the data source will change (in-memory → database/microservice).
 */

export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Todo {
  id: string;
  text: string;
  status: TodoStatus;
  userId: string; // Owner of the todo
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // Soft delete timestamp
}
