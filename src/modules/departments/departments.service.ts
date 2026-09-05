import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentQueryDto } from './dto/department.dto';
import { ConflictError, NotFoundError } from '@common/errors/app-error';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(organizationId: string, dto: CreateDepartmentDto, actorId?: string) {
    const existing = await this.prisma.department.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictError(`Department with code '${dto.code}' already exists in this organization`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.department.findFirst({
        where: { id: dto.parentId, organizationId },
      });
      if (!parent) {
        throw new NotFoundError('Parent department not found');
      }
    }

    return this.prisma.runInTransaction(async (tx) => {
      const dept = await tx.department.create({
        data: {
          organizationId,
          name: dto.name,
          code: dto.code,
          parentId: dto.parentId || null,
          managerId: dto.managerId || null,
        },
        include: {
          parent: { select: { id: true, name: true, code: true } },
          manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'DEPARTMENT_CREATED',
          entityType: 'Department',
          entityId: dept.id,
          newValues: { name: dept.name, code: dept.code },
        },
        tx,
      );

      return dept;
    });
  }

  async findById(organizationId: string, id: string) {
    const dept = await this.prisma.department.findFirst({
      where: { id, organizationId },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { employees: true, jobPositions: true } },
      },
    });

    if (!dept) {
      throw new NotFoundError('Department not found');
    }

    return dept;
  }

  async list(organizationId: string, query: DepartmentQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.DepartmentWhereInput = {
      organizationId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.department.count({ where }),
      this.prisma.department.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: { select: { id: true, name: true, code: true } },
          manager: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { employees: true } },
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

  async update(organizationId: string, id: string, dto: UpdateDepartmentDto, actorId?: string) {
    const existingDept = await this.findById(organizationId, id);

    if (dto.code && dto.code !== existingDept.code) {
      const duplicate = await this.prisma.department.findFirst({
        where: { organizationId, code: dto.code, NOT: { id } },
      });
      if (duplicate) {
        throw new ConflictError(`Department code '${dto.code}' is already in use`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictError('Department cannot be its own parent');
      }
      const parent = await this.prisma.department.findFirst({
        where: { id: dto.parentId, organizationId },
      });
      if (!parent) {
        throw new NotFoundError('Parent department not found');
      }
    }

    return this.prisma.runInTransaction(async (tx) => {
      const updated = await tx.department.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.code ? { code: dto.code } : {}),
          ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
          ...(dto.managerId !== undefined ? { managerId: dto.managerId } : {}),
        },
        include: {
          parent: { select: { id: true, name: true, code: true } },
          manager: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'DEPARTMENT_UPDATED',
          entityType: 'Department',
          entityId: id,
          oldValues: { name: existingDept.name, code: existingDept.code },
          newValues: { name: updated.name, code: updated.code },
        },
        tx,
      );

      return updated;
    });
  }
}
