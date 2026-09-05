import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { LeavesService } from './leaves.service';
import {
  CreateLeaveTypeDto,
  CreateLeaveRequestDto,
  LeaveQueryDto,
  createLeaveTypeSchema,
  createLeaveRequestSchema,
  leaveQuerySchema,
} from './dto/leave.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@ApiTags('Leaves & Time Off')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('types')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Create a leave type policy' })
  async createLeaveType(
    @Req() req: any,
    @Body(new ZodValidationPipe(createLeaveTypeSchema)) dto: CreateLeaveTypeDto,
  ) {
    return this.leavesService.createLeaveType(req.user.organizationId, dto, req.user.id);
  }

  @Get('types')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List available leave types' })
  async listLeaveTypes(@Req() req: any) {
    return this.leavesService.listLeaveTypes(req.user.organizationId);
  }

  @Post('requests')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Submit a leave request' })
  async createLeaveRequest(
    @Req() req: any,
    @Body(new ZodValidationPipe(createLeaveRequestSchema)) dto: CreateLeaveRequestDto,
  ) {
    return this.leavesService.createLeaveRequest(req.user.organizationId, dto, req.user.id);
  }

  @Get('requests')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List leave requests with pagination and filters' })
  async listLeaveRequests(
    @Req() req: any,
    @Query(new ZodValidationPipe(leaveQuerySchema)) query: LeaveQueryDto,
  ) {
    return this.leavesService.listLeaveRequests(req.user.organizationId, query);
  }

  @Post('requests/:id/approve')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Approve a pending leave request' })
  async approve(@Req() req: any, @Param('id') id: string) {
    return this.leavesService.approveLeaveRequest(req.user.organizationId, id, req.user.id);
  }

  @Post('requests/:id/reject')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Reject a pending leave request' })
  async reject(@Req() req: any, @Param('id') id: string) {
    return this.leavesService.rejectLeaveRequest(req.user.organizationId, id, req.user.id);
  }
}
