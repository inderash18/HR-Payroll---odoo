import { prisma } from '../config/prisma.js';

export const employeeRepository = {
  findMany: (organizationId, { skip = 0, take = 50, departmentId, search, isActive } = {}) => {
    const where = {
      organizationId,
      ...(departmentId ? { departmentId } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { workEmail: { contains: search, mode: 'insensitive' } },
              { employeeNum: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          department: { select: { id: true, name: true, code: true } },
          jobPosition: { select: { id: true, title: true, code: true } },
          workingSchedule: { select: { id: true, name: true } },
          contracts: {
            where: { status: 'ACTIVE' },
            take: 1,
            select: { id: true, name: true, wage: true, status: true },
          },
        },
      }),
    ]);
  },

  findById: (organizationId, id) => {
    return prisma.employee.findFirst({
      where: { organizationId, id },
      include: {
        department: { include: { manager: true } },
        jobPosition: true,
        workingSchedule: { include: { lines: true } },
        contracts: {
          orderBy: { startDate: 'desc' },
          include: { structure: true },
        },
        leaveAllocations: {
          include: { leaveType: true },
        },
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
    });
  },

  findByUserId: (organizationId, userId) => {
    return prisma.employee.findFirst({
      where: { organizationId, userId },
      include: {
        department: true,
        jobPosition: true,
        workingSchedule: true,
      },
    });
  },

  create: (data, tx = prisma) => {
    return tx.employee.create({ data });
  },

  update: (organizationId, id, data, tx = prisma) => {
    return tx.employee.update({
      where: { id },
      data,
    });
  },
};
