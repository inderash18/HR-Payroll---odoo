import { prisma } from '../config/prisma.js';

export const organizationRepository = {
  findById: (id) => {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        legalEntities: true,
        _count: {
          select: { employees: true, departments: true, users: true },
        },
      },
    });
  },

  findByCode: (code) => {
    return prisma.organization.findUnique({
      where: { code },
    });
  },

  findAll: () => {
    return prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { employees: true, departments: true, users: true } },
      },
    });
  },

  create: (data, tx = prisma) => {
    return tx.organization.create({ data });
  },

  update: (id, data, tx = prisma) => {
    return tx.organization.update({
      where: { id },
      data,
    });
  },
};

export const legalEntityRepository = {
  findMany: (organizationId) => {
    return prisma.legalEntity.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { employees: true, payruns: true } },
      },
    });
  },

  findById: (organizationId, id) => {
    return prisma.legalEntity.findFirst({
      where: { organizationId, id },
    });
  },

  create: (data, tx = prisma) => {
    return tx.legalEntity.create({ data });
  },

  update: (organizationId, id, data, tx = prisma) => {
    return tx.legalEntity.update({
      where: { id },
      data,
    });
  },
};
