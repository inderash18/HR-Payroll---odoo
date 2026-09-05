import { prisma } from '../config/prisma.js';

export const scheduleRepository = {
  findMany: (organizationId) => {
    return prisma.workingSchedule.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
      include: {
        lines: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { employees: true, contracts: true } },
      },
    });
  },

  findById: (organizationId, id) => {
    return prisma.workingSchedule.findFirst({
      where: { organizationId, id },
      include: {
        lines: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { employees: true, contracts: true } },
      },
    });
  },

  create: async (data, lines = [], tx = prisma) => {
    return tx.workingSchedule.create({
      data: {
        ...data,
        lines: {
          create: lines.map((l) => ({
            dayOfWeek: l.dayOfWeek,
            startTime: l.startTime,
            endTime: l.endTime,
            breakMinutes: l.breakMinutes || 60,
          })),
        },
      },
      include: { lines: true },
    });
  },

  update: async (organizationId, id, data, lines = null, tx = prisma) => {
    if (lines && Array.isArray(lines)) {
      await tx.workingScheduleLine.deleteMany({ where: { scheduleId: id } });
      await tx.workingScheduleLine.createMany({
        data: lines.map((l) => ({
          scheduleId: id,
          dayOfWeek: l.dayOfWeek,
          startTime: l.startTime,
          endTime: l.endTime,
          breakMinutes: l.breakMinutes || 60,
        })),
      });
    }

    return tx.workingSchedule.update({
      where: { id },
      data,
      include: { lines: true },
    });
  },
};

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
