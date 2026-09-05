import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Get high-level organizational KPI metrics' })
  async getOverview(@Req() req: any) {
    const data = await this.dashboardService.getOverview(req.user.organizationId);
    return { success: true, data };
  }

  @Get('attendance')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Get aggregated attendance metrics by date range' })
  async getAttendanceMetrics(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.dashboardService.getAttendanceMetrics(req.user.organizationId, startDate, endDate);
    return { success: true, data };
  }

  @Get('time-off')
  @Roles(Role.ADMIN, Role.HR_PAYROLL_MANAGER, Role.HR_PAYROLL_USER, Role.HR_MANAGER)
  @ApiOperation({ summary: 'Get time off and leave request statistics' })
  async getTimeOffMetrics(@Req() req: any) {
    const data = await this.dashboardService.getTimeOffMetrics(req.user.organizationId);
    return { success: true, data };
  }
}
