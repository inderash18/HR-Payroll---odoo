import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { ConflictError, NotFoundError } from '@common/errors/app-error';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(organizationId: string, dto: CreateEmployeeDto, actorId?: string) {
    const existing = await this.prisma.employee.findUnique({
      where: {
        organizationId_employeeNum: {
          organizationId,
          employeeNum: dto.employeeNum,
        },
      },
    });

    if (existing) {
      throw new ConflictError(`Employee with number '${dto.employeeNum}' already exists`);
    }

    if (dto.legalEntityId) {
      const le = await this.prisma.legalEntity.findFirst({
        where: { id: dto.legalEntityId, organizationId },
      });
      if (!le) throw new NotFoundError('Legal entity not found in organization');
    }

    if (dto.departmentId) {
      const dept = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, organizationId },
      });
      if (!dept) throw new NotFoundError('Department not found in organization');
    }

    return this.prisma.runInTransaction(async (tx) => {
      const emp = await tx.employee.create({
        data: {
          organizationId,
          employeeNum: dto.employeeNum,
          firstName: dto.firstName,
          lastName: dto.lastName,
          workEmail: dto.workEmail,
          phone: dto.phone || null,
          legalEntityId: dto.legalEntityId || null,
          userId: dto.userId || null,
          departmentId: dto.departmentId || null,
          jobPositionId: dto.jobPositionId || null,
          joiningDate: dto.joiningDate || new Date(),
        },
        include: {
          department: { select: { id: true, name: true, code: true } },
          legalEntity: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, email: true, role: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'EMPLOYEE_CREATED',
          entityType: 'Employee',
          entityId: emp.id,
          newValues: { employeeNum: emp.employeeNum, workEmail: emp.workEmail },
        },
        tx,
      );

      return emp;
    });
  }

  async findById(organizationId: string, id: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { id, organizationId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        jobPosition: { select: { id: true, title: true, code: true } },
        legalEntity: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, email: true, role: true } },
        contracts: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, wage: true, wagePeriod: true, status: true, startDate: true, endDate: true },
        },
      },
    });

    if (!emp) throw new NotFoundError('Employee not found');
    return emp;
  }

  async list(organizationId: string, query: EmployeeQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.EmployeeWhereInput = {
      organizationId,
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.legalEntityId ? { legalEntityId: query.legalEntityId } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { workEmail: { contains: query.search, mode: 'insensitive' } },
              { employeeNum: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          department: { select: { id: true, name: true, code: true } },
          legalEntity: { select: { id: true, name: true, code: true } },
          contracts: {
            where: { status: 'ACTIVE' },
            select: { id: true, wage: true, status: true },
            take: 1,
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

  async update(organizationId: string, id: string, dto: UpdateEmployeeDto, actorId?: string) {
    const existing = await this.findById(organizationId, id);

    if (dto.employeeNum && dto.employeeNum !== existing.employeeNum) {
      const duplicate = await this.prisma.employee.findFirst({
        where: { organizationId, employeeNum: dto.employeeNum, NOT: { id } },
      });
      if (duplicate) throw new ConflictError(`Employee number '${dto.employeeNum}' is already in use`);
    }

    return this.prisma.runInTransaction(async (tx) => {
      const updated = await tx.employee.update({
        where: { id },
        data: {
          ...(dto.firstName ? { firstName: dto.firstName } : {}),
          ...(dto.lastName ? { lastName: dto.lastName } : {}),
          ...(dto.workEmail ? { workEmail: dto.workEmail } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
          ...(dto.jobPositionId !== undefined ? { jobPositionId: dto.jobPositionId } : {}),
          ...(dto.legalEntityId !== undefined ? { legalEntityId: dto.legalEntityId } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
        include: {
          department: { select: { id: true, name: true, code: true } },
          legalEntity: { select: { id: true, name: true, code: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'EMPLOYEE_UPDATED',
          entityType: 'Employee',
          entityId: id,
          oldValues: { firstName: existing.firstName, lastName: existing.lastName },
          newValues: { firstName: updated.firstName, lastName: updated.lastName },
        },
        tx,
      );

      return updated;
    });
  }
}
