import { prisma } from '../config/prisma.js';

export const auditRepository = {
  create: (data, tx = prisma) => {
    return tx.auditLog.create({ data });
  },

  findMany: (organizationId, { skip = 0, take = 50, entityType, entityId, userId, startDate, endDate } = {}) => {
    const where = {
      organizationId,
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(userId ? { userId } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    return Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
          },
        },
      }),
    ]);
  },
};
