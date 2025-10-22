import { 
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200 })
  async me(@Headers('authorization') authorization: string) {
    return this.usersService.getMe(authorization);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200 })
  async getById(@Param('id') id: string, @Headers('authorization') authorization: string) {
    return this.usersService.getById(id, authorization);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200 })
  async updateMe(@Body() dto: UpdateUserDto, @Headers('authorization') authorization: string) {
    return this.usersService.updateMe(dto, authorization);
  }
}

