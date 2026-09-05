import { prisma } from '../config/prisma.js';

export const departmentRepository = {
  findMany: (organizationId, { skip = 0, take = 50, search } = {}) => {
    const where = {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.department.count({ where }),
      prisma.department.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          parent: true,
          manager: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { employees: true, jobPositions: true } },
        },
      }),
    ]);
  },

  findById: (organizationId, id) => {
    return prisma.department.findFirst({
      where: { organizationId, id },
      include: {
        parent: true,
        children: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        jobPositions: true,
        _count: { select: { employees: true } },
      },
    });
  },

  create: (data, tx = prisma) => {
    return tx.department.create({ data });
  },

  update: (organizationId, id, data, tx = prisma) => {
    return tx.department.update({
      where: { id },
      data,
    });
  },
};

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
        department: true,
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
