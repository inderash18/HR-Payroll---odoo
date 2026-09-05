import { prisma } from '../config/prisma.js';

export const userRepository = {
  findByEmail: (organizationId, email) => {
    return prisma.user.findFirst({
      where: {
        organizationId,
        email: { equals: email, mode: 'insensitive' },
      },
      include: {
        organization: true,
        employee: true,
      },
    });
  },

  findByEmailGlobal: (email) => {
    return prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
      include: {
        organization: true,
        employee: true,
      },
    });
  },

  findById: (organizationId, id) => {
    return prisma.user.findFirst({
      where: { id, ...(organizationId ? { organizationId } : {}) },
      include: {
        organization: true,
        employee: true,
      },
    });
  },

  findMany: (organizationId, { skip = 0, take = 50, role, search } = {}) => {
    const where = {
      organizationId,
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: { id: true, employeeNum: true, department: true, jobPosition: true },
          },
        },
      }),
    ]);
  },

  create: (data, tx = prisma) => {
    return tx.user.create({ data });
  },

  update: (id, data, tx = prisma) => {
    return tx.user.update({
      where: { id },
      data,
    });
  },

  // Refresh tokens
  createRefreshToken: (data, tx = prisma) => {
    return tx.refreshToken.create({ data });
  },

  findRefreshToken: (tokenHash) => {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { organization: true } } },
    });
  },

  revokeRefreshToken: (id, replacedByTokenHash = null, tx = prisma) => {
    return tx.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        ...(replacedByTokenHash ? { replacedByTokenHash } : {}),
      },
    });
  },

  revokeAllUserRefreshTokens: (userId, tx = prisma) => {
    return tx.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  findActiveUserSessions: (userId) => {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Password reset tokens
  createPasswordResetToken: (data, tx = prisma) => {
    return tx.passwordResetToken.create({ data });
  },

  findPasswordResetToken: (tokenHash) => {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  markPasswordResetTokenUsed: (id, tx = prisma) => {
    return tx.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
