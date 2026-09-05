import { prisma } from '../config/prisma.js';

export const attendanceRepository = {
  findMany: (organizationId, { skip = 0, take = 50, employeeId, startDate, endDate, status } = {}) => {
    const where = {
      organizationId,
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status } : {}),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    return Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeNum: true, department: true },
          },
        },
      }),
    ]);
  },

  findByDate: (organizationId, employeeId, date) => {
    return prisma.attendance.findFirst({
      where: {
        organizationId,
        employeeId,
        date: new Date(date),
      },
    });
  },

  create: (data, tx = prisma) => {
    return tx.attendance.create({ data });
  },

  update: (id, data, tx = prisma) => {
    return tx.attendance.update({
      where: { id },
      data,
    });
  },
};
