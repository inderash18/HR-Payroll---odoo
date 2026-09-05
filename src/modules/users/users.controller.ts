import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  createUserSchema,
  CreateUserDto,
  updateUserSchema,
  UpdateUserDto,
  userQuerySchema,
  UserQueryDto,
} from './dto/user.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles, CurrentUser } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '@common/auth/interfaces/token-payload.interface';

@ApiTags('Users & RBAC')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get profile of current authenticated user' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.organizationId, user.id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user with designated role (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
  ) {
    return this.usersService.create(user.organizationId, dto, user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'List and search organization users (Admin and HR Manager)' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(userQuerySchema)) query: UserQueryDto,
  ) {
    return this.usersService.list(user.organizationId, query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Get user details by ID' })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.usersService.findById(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user role or status (Admin only)' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.organizationId, id, dto, user.id);
  }
}
