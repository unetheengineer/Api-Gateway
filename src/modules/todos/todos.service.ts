import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodosDto, SortOrder } from './dto/query-todos.dto';
import { Todo, TodoStatus } from './entities/todo.entity';

/**
 * 🔧 MOCK: Todos Service
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
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  // 🔧 MOCK: In-memory todo storage
  private mockTodos: Todo[] = [
    {
      id: '1',
      text: 'Complete API Gateway setup',
      status: TodoStatus.COMPLETED,
      userId: '1', // Admin user
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      deletedAt: null,
    },
    {
      id: '2',
      text: 'Implement rate limiting',
      status: TodoStatus.COMPLETED,
      userId: '1',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-04'),
      deletedAt: null,
    },
    {
      id: '3',
      text: 'Add JWT authentication',
      status: TodoStatus.IN_PROGRESS,
      userId: '1',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      deletedAt: null,
    },
    {
      id: '4',
      text: 'Write tests for todo module',
      status: TodoStatus.PENDING,
      userId: '2', // Regular user
      createdAt: new Date('2024-01-06'),
      updatedAt: new Date('2024-01-06'),
      deletedAt: null,
    },
    {
      id: '5',
      text: 'Deleted todo example',
      status: TodoStatus.COMPLETED,
      userId: '1',
      createdAt: new Date('2024-01-07'),
      updatedAt: new Date('2024-01-08'),
      deletedAt: new Date('2024-01-09'),
    },
  ];

  /**
   * 🔧 MOCK: Create new todo
   * TODO: Replace with microservice call
   */
  async create(createTodoDto: CreateTodoDto, userId: string): Promise<Todo> {
    this.logger.log(`[MOCK] Creating todo for user: ${userId}`);

    const newTodo: Todo = {
      id: uuid(),
      text: createTodoDto.text.trim(),
      status: TodoStatus.PENDING,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    this.mockTodos.push(newTodo);

    this.logger.log(`[MOCK] Todo created: ${newTodo.id}`);
    return newTodo;
  }

  /**
   * 🔧 MOCK: Get all todos with filtering and pagination
   * TODO: Replace with microservice call
   */
  async findAll(
    queryDto: QueryTodosDto,
    userId: string,
  ): Promise<{
    data: Todo[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    this.logger.log(`[MOCK] Fetching todos for user: ${userId}`);

    // Filter todos by user
    let filteredTodos = this.mockTodos.filter((todo) => todo.userId === userId);

    // Filter by deleted status
    if (!queryDto.includeDeleted) {
      filteredTodos = filteredTodos.filter((todo) => todo.deletedAt === null);
    }

    // Filter by status
    if (queryDto.status) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.status === queryDto.status,
      );
    }

    // Sort todos
    filteredTodos.sort((a, b) => {
      const aValue = a[queryDto.sortBy!];
      const bValue = b[queryDto.sortBy!];

      if (queryDto.sortOrder === SortOrder.ASC) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = filteredTodos.length;
    const page = queryDto.page!;
    const limit = queryDto.limit!;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Apply pagination
    const paginatedTodos = filteredTodos.slice(skip, skip + limit);

    this.logger.log(
      `[MOCK] Returning ${paginatedTodos.length}/${total} todos for user: ${userId}`,
    );

    return {
      data: paginatedTodos,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * 🔧 MOCK: Get single todo by ID
   * TODO: Replace with microservice call
   */
  async findOne(id: string, userId: string): Promise<Todo> {
    this.logger.log(`[MOCK] Fetching todo: ${id} for user: ${userId}`);

    const todo = this.mockTodos.find((t) => t.id === id && !t.deletedAt);

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // Check ownership
    if (todo.userId !== userId) {
      throw new ForbiddenException('You do not have access to this todo');
    }

    return todo;
  }

  /**
   * 🔧 MOCK: Update todo
   * TODO: Replace with microservice call
   */
  async update(
    id: string,
    updateTodoDto: UpdateTodoDto,
    userId: string,
  ): Promise<Todo> {
    this.logger.log(`[MOCK] Updating todo: ${id} for user: ${userId}`);

    const todo = await this.findOne(id, userId);

    // Update fields
    if (updateTodoDto.text !== undefined) {
      todo.text = updateTodoDto.text.trim();
    }
    if (updateTodoDto.status !== undefined) {
      todo.status = updateTodoDto.status;
    }

    todo.updatedAt = new Date();

    this.logger.log(`[MOCK] Todo updated: ${id}`);
    return todo;
  }

  /**
   * 🔧 MOCK: Soft delete todo
   * TODO: Replace with microservice call
   */
  async softDelete(id: string, userId: string): Promise<{ message: string }> {
    this.logger.log(`[MOCK] Soft deleting todo: ${id} for user: ${userId}`);

    const todo = await this.findOne(id, userId);

    todo.deletedAt = new Date();
    todo.updatedAt = new Date();

    this.logger.log(`[MOCK] Todo soft deleted: ${id}`);
    return { message: 'Todo deleted successfully' };
  }

  /**
   * 🔧 MOCK: Restore soft-deleted todo
   * TODO: Replace with microservice call
   */
  async restore(id: string, userId: string): Promise<Todo> {
    this.logger.log(`[MOCK] Restoring todo: ${id} for user: ${userId}`);

    const todo = this.mockTodos.find((t) => t.id === id);

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // Check ownership
    if (todo.userId !== userId) {
      throw new ForbiddenException('You do not have access to this todo');
    }

    if (!todo.deletedAt) {
      throw new NotFoundException('Todo is not deleted');
    }

    todo.deletedAt = null;
    todo.updatedAt = new Date();

    this.logger.log(`[MOCK] Todo restored: ${id}`);
    return todo;
  }

  /**
   * 🔧 MOCK: Get deleted todos
   * TODO: Replace with microservice call
   */
  async findDeleted(userId: string): Promise<Todo[]> {
    this.logger.log(`[MOCK] Fetching deleted todos for user: ${userId}`);

    const deletedTodos = this.mockTodos.filter(
      (todo) => todo.userId === userId && todo.deletedAt !== null,
    );

    this.logger.log(
      `[MOCK] Found ${deletedTodos.length} deleted todos for user: ${userId}`,
    );
    return deletedTodos;
  }

  /**
   * 🔧 MOCK: Debug endpoint - Get all todos (for testing)
   * Remove this in production!
   */
  getAllMockTodos(): Todo[] {
    return this.mockTodos;
  }
}
