import { prisma } from '../config/prisma.js';

export const departmentRepository = {
  findMany: async (organizationId, { skip = 0, take = 50, search } = {}) => {
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

    const total = await prisma.department.count({ where });
    const items = await prisma.department.findMany({
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
    });

    return [total, items];
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

  delete: (organizationId, id, tx = prisma) => {
    return tx.department.delete({
      where: { id },
    });
  },
};

