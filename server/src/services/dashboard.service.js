import { prisma } from '../config/prisma.js';
import { auditRepository } from '../repositories/audit.repository.js';

export const dashboardService = {
  async getOverview(organizationId) {
    const [
      activeEmployees,
      activeContracts,
      pendingLeaves,
      latestPayrun,
      allPayruns,
      departments,
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId, isActive: true } }),
      prisma.contract.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'PENDING_APPROVAL' } }),
      prisma.payrun.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payrun.findMany({
        where: { organizationId, status: 'PAID' },
        select: { totalGross: true, totalNet: true },
      }),
      prisma.department.findMany({
        where: { organizationId },
        include: { _count: { select: { employees: true } } },
      }),
    ]);

    const allTimePaidGross = allPayruns.reduce((acc, p) => acc + Number(p.totalGross), 0);
    const allTimePaidNet = allPayruns.reduce((acc, p) => acc + Number(p.totalNet), 0);

    const departmentHeadcounts = departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      employeeCount: d._count.employees,
    }));

    return {
      activeEmployees,
      activeContracts,
      pendingLeaves,
      latestPayrun: latestPayrun
        ? {
            id: latestPayrun.id,
            name: latestPayrun.name,
            status: latestPayrun.status,
            startDate: latestPayrun.startDate,
            endDate: latestPayrun.endDate,
            totalGross: Number(latestPayrun.totalGross),
            totalNet: Number(latestPayrun.totalNet),
          }
        : null,
      allTimePaidGross,
      allTimePaidNet,
      departmentHeadcounts,
    };
  },

  async getAttendanceMetrics(organizationId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [presentToday, totalEmployees] = await Promise.all([
      prisma.attendance.count({ where: { organizationId, date: today, status: 'PRESENT' } }),
      prisma.employee.count({ where: { organizationId, isActive: true } }),
    ]);

    return {
      presentToday,
      totalEmployees,
      attendanceRate: totalEmployees > 0 ? parseFloat(((presentToday / totalEmployees) * 100).toFixed(1)) : 100,
    };
  },

  async getTimeOffMetrics(organizationId) {
    const [pending, approved, rejected] = await Promise.all([
      prisma.leaveRequest.count({ where: { organizationId, status: 'PENDING_APPROVAL' } }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'APPROVED' } }),
      prisma.leaveRequest.count({ where: { organizationId, status: 'REJECTED' } }),
    ]);

    return { pending, approved, rejected };
  },
};

export const auditService = {
  async log({ organizationId, userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null, userAgent = null }, tx = prisma) {
    try {
      if (organizationId === 'dev-local-org') return;
      await auditRepository.create({
        organizationId,
        userId: userId || null,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      }, tx);
    } catch (e) {
      console.warn('Failed to record audit log:', e.message);
    }
  },

  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await auditRepository.findMany(organizationId, {
      skip,
      take: limit,
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
