import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { PayrunStatus, ContractStatus, LeaveStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(organizationId: string) {
    const [
      activeEmployees,
      activeContracts,
      pendingLeaves,
      latestPayrun,
      paidTotals,
      departmentHeadcounts,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: { organizationId, isActive: true },
      }),
      this.prisma.contract.count({
        where: { organizationId, status: ContractStatus.ACTIVE },
      }),
      this.prisma.leaveRequest.count({
        where: { organizationId, status: LeaveStatus.PENDING_APPROVAL },
      }),
      this.prisma.payrun.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true,
          totalGross: true,
          totalNet: true,
        },
      }),
      this.prisma.payrun.aggregate({
        where: { organizationId, status: PayrunStatus.PAID },
        _sum: { totalGross: true, totalNet: true },
      }),
      this.prisma.department.findMany({
        where: { organizationId, active: true },
        select: {
          id: true,
          name: true,
          code: true,
          _count: { select: { employees: true } },
        },
      }),
    ]);

    return {
      activeEmployees,
      activeContracts,
      pendingLeaves,
      latestPayrun,
      allTimePaidNet: Number(paidTotals._sum.totalNet || 0),
      allTimePaidGross: Number(paidTotals._sum.totalGross || 0),
      departmentHeadcounts: departmentHeadcounts.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        employeeCount: d._count.employees,
      })),
    };
  }

  async getAttendanceMetrics(organizationId: string, startDate?: string, endDate?: string) {
    const where: any = { organizationId };
    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [present, absent, late, halfDay, missingCheckout] = await Promise.all([
      this.prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'LATE' } }),
      this.prisma.attendance.count({ where: { ...where, status: 'HALF_DAY' } }),
      this.prisma.attendance.count({
        where: { ...where, checkOut: null, date: { lt: new Date() } },
      }),
    ]);

    return {
      present,
      absent,
      late,
      halfDay,
      missingCheckout,
    };
  }

  async getTimeOffMetrics(organizationId: string) {
    const [approved, pending, refused, usageByType] = await Promise.all([
      this.prisma.leaveRequest.count({
        where: { organizationId, status: LeaveStatus.APPROVED },
      }),
      this.prisma.leaveRequest.count({
        where: { organizationId, status: LeaveStatus.PENDING_APPROVAL },
      }),
      this.prisma.leaveRequest.count({
        where: { organizationId, status: LeaveStatus.REJECTED },
      }),
      this.prisma.leaveType.findMany({
        where: { organizationId, active: true },
        select: {
          id: true,
          name: true,
          code: true,
          isPaid: true,
          _count: { select: { leaveRequests: true } },
        },
      }),
    ]);

    return {
      approvedCount: approved,
      pendingCount: pending,
      refusedCount: refused,
      usageByType: usageByType.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        isPaid: t.isPaid,
        requestCount: t._count.leaveRequests,
      })),
    };
  }
}
