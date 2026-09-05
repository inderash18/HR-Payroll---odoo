import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  createWorkingScheduleSchema,
  CreateWorkingScheduleDto,
  updateWorkingScheduleSchema,
  UpdateWorkingScheduleDto,
} from './dto/schedule.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles, CurrentUser } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '@common/auth/interfaces/token-payload.interface';

@ApiTags('Working Schedules')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('working-schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Create working schedule with shifts (Admin / HR Manager)' })
  @ApiResponse({ status: 201, description: 'Working schedule created successfully' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createWorkingScheduleSchema)) dto: CreateWorkingScheduleDto,
  ) {
    return this.schedulesService.create(user.organizationId, dto, user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER)
  @ApiOperation({ summary: 'List all organization working schedules' })
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.schedulesService.list(user.organizationId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER)
  @ApiOperation({ summary: 'Get working schedule by ID' })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.schedulesService.findById(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Update working schedule' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWorkingScheduleSchema)) dto: UpdateWorkingScheduleDto,
  ) {
    return this.schedulesService.update(user.organizationId, id, dto, user.id);
  }
}
