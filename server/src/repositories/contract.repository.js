import { prisma } from '../config/prisma.js';

export const contractRepository = {
  findMany: (organizationId, { skip = 0, take = 50, employeeId, status, search } = {}) => {
    const where = {
      organizationId,
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { employee: { firstName: { contains: search, mode: 'insensitive' } } },
              { employee: { lastName: { contains: search, mode: 'insensitive' } } },
              { employee: { employeeNum: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.contract.count({ where }),
      prisma.contract.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'desc' },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeNum: true, department: true },
          },
          structure: { select: { id: true, name: true, code: true } },
          workingSchedule: { select: { id: true, name: true } },
        },
      }),
    ]);
  },

  findById: (organizationId, id) => {
    return prisma.contract.findFirst({
      where: { organizationId, id },
      include: {
        employee: true,
        structure: { include: { rules: { where: { isActive: true }, orderBy: { sequence: 'asc' } } } },
        workingSchedule: { include: { lines: true } },
      },
    });
  },

  findOverlapping: (organizationId, employeeId, startDate, endDate, excludeId = null) => {
    return prisma.contract.findMany({
      where: {
        organizationId,
        employeeId,
        status: { in: ['ACTIVE', 'DRAFT'] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        OR: [
          // Case 1: Existing contract has no end date (open-ended)
          { endDate: null, startDate: { lte: endDate || new Date('2099-12-31') } },
          // Case 2: New contract starts before existing ends, and ends after existing starts
          {
            startDate: { lte: endDate || new Date('2099-12-31') },
            endDate: { gte: startDate },
          },
        ],
      },
    });
  },

  create: (data, tx = prisma) => {
    return tx.contract.create({ data });
  },

  update: (organizationId, id, data, tx = prisma) => {
    return tx.contract.update({
      where: { id },
      data,
    });
  },
};
