import { prisma } from '../config/prisma.js';

export const leaveRepository = {
  // Leave Types
  findTypes: (organizationId) => {
    return prisma.leaveType.findMany({
      where: { organizationId, active: true },
      orderBy: { name: 'asc' },
    });
  },

  findTypeById: (organizationId, id) => {
    return prisma.leaveType.findFirst({
      where: { organizationId, id },
    });
  },

  createType: (data, tx = prisma) => {
    return tx.leaveType.create({ data });
  },

  // Leave Allocations
  findAllocations: (organizationId, employeeId) => {
    return prisma.leaveAllocation.findMany({
      where: {
        organizationId,
        ...(employeeId ? { employeeId } : {}),
      },
      include: { leaveType: true, employee: true },
      orderBy: { validFrom: 'desc' },
    });
  },

  findActiveAllocation: (organizationId, employeeId, leaveTypeId, date = new Date()) => {
    return prisma.leaveAllocation.findFirst({
      where: {
        organizationId,
        employeeId,
        leaveTypeId,
        status: 'APPROVED',
        validFrom: { lte: date },
        validUntil: { gte: date },
      },
    });
  },

  createAllocation: (data, tx = prisma) => {
    return tx.leaveAllocation.create({ data });
  },

  updateAllocation: (id, data, tx = prisma) => {
    return tx.leaveAllocation.update({
      where: { id },
      data,
    });
  },

  // Leave Requests
  findRequests: (organizationId, { skip = 0, take = 50, employeeId, status, startDate, endDate } = {}) => {
    const where = {
      organizationId,
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status } : {}),
      ...(startDate || endDate
        ? {
            startDate: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    return Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeNum: true, department: true },
          },
          leaveType: true,
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          refusedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);
  },

  findRequestById: (organizationId, id) => {
    return prisma.leaveRequest.findFirst({
      where: { organizationId, id },
      include: {
        employee: true,
        leaveType: true,
      },
    });
  },

  createRequest: (data, tx = prisma) => {
    return tx.leaveRequest.create({ data });
  },

  updateRequest: (organizationId, id, data, tx = prisma) => {
    return tx.leaveRequest.update({
      where: { id },
      data,
    });
  },
};
