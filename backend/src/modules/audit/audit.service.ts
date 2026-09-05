import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { CreateAuditLogDto, AuditQueryDto } from './dto/audit.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto, tx?: Prisma.TransactionClient): Promise<void> {
    try {
      const client = tx || this.prisma;
      await client.auditLog.create({
        data: {
          organizationId: dto.organizationId,
          userId: dto.userId || null,
          action: dto.action,
          entityType: dto.entityType,
          entityId: dto.entityId,
          oldValues: dto.oldValues ? (dto.oldValues as Prisma.InputJsonValue) : Prisma.DbNull,
          newValues: dto.newValues ? (dto.newValues as Prisma.InputJsonValue) : Prisma.DbNull,
          ipAddress: dto.ipAddress || null,
          userAgent: dto.userAgent || null,
        },
      });
    } catch (error) {
      // Audit log failures should not silently crash domain flows, but should be logged loudly
      this.logger.error('Failed to write audit log entry', error);
    }
  }

  async findByQuery(query: AuditQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.AuditLogWhereInput = {
      organizationId: query.organizationId,
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.startDate || query.endDate
        ? {
            createdAt: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
