import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import {
  ClockInDto,
  ClockOutDto,
  AttendanceQueryDto,
  clockInSchema,
  clockOutSchema,
  attendanceQuerySchema,
} from './dto/attendance.dto';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Clock in employee attendance' })
  async clockIn(
    @Req() req: any,
    @Body(new ZodValidationPipe(clockInSchema)) dto: ClockInDto,
  ) {
    return this.attendanceService.clockIn(req.user.organizationId, dto, req.user.id);
  }

  @Post('clock-out')
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Clock out employee attendance' })
  async clockOut(
    @Req() req: any,
    @Body(new ZodValidationPipe(clockOutSchema)) dto: ClockOutDto,
  ) {
    return this.attendanceService.clockOut(req.user.organizationId, dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.HR_PAYROLL_USER, Role.HR_PAYROLL_MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List attendance logs with pagination and filters' })
  async list(
    @Req() req: any,
    @Query(new ZodValidationPipe(attendanceQuerySchema)) query: AttendanceQueryDto,
  ) {
    return this.attendanceService.list(req.user.organizationId, query);
  }
}
