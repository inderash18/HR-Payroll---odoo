import { auditRepository } from '../repositories/audit.repository.js';
import { prisma } from '../config/prisma.js';

export const auditService = {
  async log({ organizationId, userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null, userAgent = null }, tx = prisma) {
    try {
      if (organizationId === 'dev-local-org') return;
      await auditRepository.create({
        organizationId,
        userId: userId || null,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      }, tx);
    } catch (e) {
      console.warn('Failed to record audit log:', e.message);
    }
  },

  async list(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await auditRepository.findMany(organizationId, {
      skip,
      take: limit,
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
