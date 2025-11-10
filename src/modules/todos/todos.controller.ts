import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
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
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Todos')
@Controller({ path: 'todos', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  /**
   * Create new todo
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new todo',
    description:
      '🔧 MOCK: Creates a new todo for the authenticated user.\n\n' +
      'Returns the created todo with auto-generated ID and timestamps.',
  })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        text: 'Buy groceries',
        status: 'pending',
        userId: '1',
        createdAt: '2024-01-10T10:00:00.000Z',
        updatedAt: '2024-01-10T10:00:00.000Z',
        deletedAt: null,
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
  async create(@Body() createTodoDto: CreateTodoDto, @Req() req: Request) {
    const user = req.user!;
    return this.todosService.create(createTodoDto, user.userId);
  }

  /**
   * Get all todos with filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get all todos',
    description:
      '🔧 MOCK: Returns paginated list of todos for the authenticated user.\n\n' +
      'Supports filtering by status, sorting, and pagination.\n' +
      'Soft-deleted todos are excluded by default.',
  })
  @ApiResponse({
    status: 200,
    description: 'Todos retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '3',
            text: 'Add JWT authentication',
            status: 'in_progress',
            userId: '1',
            createdAt: '2024-01-05T00:00:00.000Z',
            updatedAt: '2024-01-05T00:00:00.000Z',
            deletedAt: null,
          },
          {
            id: '2',
            text: 'Implement rate limiting',
            status: 'completed',
            userId: '1',
            createdAt: '2024-01-03T00:00:00.000Z',
            updatedAt: '2024-01-04T00:00:00.000Z',
            deletedAt: null,
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
    description: 'Unauthorized - Invalid or missing token',
  })
  async findAll(@Query() queryDto: QueryTodosDto, @Req() req: Request) {
    const user = req.user!;
    return this.todosService.findAll(queryDto, user.userId);
  }

  /**
   * Get single todo by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get todo by ID',
    description:
      '🔧 MOCK: Returns a single todo by its ID.\n\n' +
      'User can only access their own todos.',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo found',
    schema: {
      example: {
        id: '1',
        text: 'Complete API Gateway setup',
        status: 'completed',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Todo belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
  })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.todosService.findOne(id, user.userId);
  }

  /**
   * Update todo
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update todo',
    description:
      '🔧 MOCK: Updates todo text and/or status.\n\n' +
      'User can only update their own todos.',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo updated successfully',
    schema: {
      example: {
        id: '1',
        text: 'Complete API Gateway setup - Updated',
        status: 'completed',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-10T15:30:00.000Z',
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Todo belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Req() req: Request,
  ) {
    const user = req.user!;
    return this.todosService.update(id, updateTodoDto, user.userId);
  }

  /**
   * Soft delete todo
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete todo (soft delete)',
    description:
      '🔧 MOCK: Soft deletes a todo by setting deletedAt timestamp.\n\n' +
      'User can only delete their own todos.\n' +
      'Deleted todos can be restored using the restore endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo deleted successfully',
    schema: {
      example: {
        message: 'Todo deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Todo belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found',
  })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.todosService.softDelete(id, user.userId);
  }

  /**
   * Restore soft-deleted todo
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore deleted todo',
    description:
      '🔧 MOCK: Restores a soft-deleted todo by setting deletedAt to null.\n\n' +
      'User can only restore their own todos.',
  })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo restored successfully',
    schema: {
      example: {
        id: '5',
        text: 'Deleted todo example',
        status: 'completed',
        userId: '1',
        createdAt: '2024-01-07T00:00:00.000Z',
        updatedAt: '2024-01-10T16:00:00.000Z',
        deletedAt: null,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Todo belongs to another user',
  })
  @ApiResponse({
    status: 404,
    description: 'Todo not found or not deleted',
  })
  async restore(@Param('id') id: string, @Req() req: Request) {
    const user = req.user!;
    return this.todosService.restore(id, user.userId);
  }

  /**
   * Get deleted todos
   */
  @Get('deleted/list')
  @ApiOperation({
    summary: 'Get deleted todos',
    description:
      '🔧 MOCK: Returns all soft-deleted todos for the authenticated user.\n\n' +
      'These todos can be restored using the restore endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted todos retrieved successfully',
    schema: {
      example: [
        {
          id: '5',
          text: 'Deleted todo example',
          status: 'completed',
          userId: '1',
          createdAt: '2024-01-07T00:00:00.000Z',
          updatedAt: '2024-01-08T00:00:00.000Z',
          deletedAt: '2024-01-09T00:00:00.000Z',
        },
      ],
    },
  })
  async findDeleted(@Req() req: Request) {
    const user = req.user!;
    return this.todosService.findDeleted(user.userId);
  }

  /**
   * 🔧 MOCK: Debug endpoint to see all todos
   * Remove this in production!
   */
  @Get('debug/all')
  @ApiOperation({
    summary: '🔧 [DEBUG] Get all mock todos',
    description:
      '⚠️ DEVELOPMENT ONLY - Shows all mock todos for testing.\n\n' +
      'Remove this endpoint in production!',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all mock todos',
  })
  async getAllMockTodos() {
    return {
      message: '🔧 MOCK DATA - Remove this endpoint in production',
      todos: this.todosService.getAllMockTodos(),
    };
  }
}
