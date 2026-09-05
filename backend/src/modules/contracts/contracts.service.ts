import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { CreateContractDto, UpdateContractDto, ContractQueryDto } from './dto/contract.dto';
import { NotFoundError, BadRequestError } from '@common/errors/app-error';
import { ContractStatus, Prisma } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(organizationId: string, dto: CreateContractDto, actorId?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, organizationId },
    });
    if (!employee) throw new NotFoundError('Employee not found in organization');

    const structure = await this.prisma.salaryStructure.findFirst({
      where: { id: dto.structureId, organizationId },
    });
    if (!structure) throw new NotFoundError('Salary structure not found in organization');

    return this.prisma.runInTransaction(async (tx) => {
      // If creating an ACTIVE contract, set any previous ACTIVE contracts for this employee to EXPIRED
      if (dto.status === ContractStatus.ACTIVE) {
        await tx.contract.updateMany({
          where: { employeeId: dto.employeeId, status: ContractStatus.ACTIVE },
          data: { status: ContractStatus.EXPIRED, endDate: new Date() },
        });
      }

      const contract = await tx.contract.create({
        data: {
          organizationId,
          employeeId: dto.employeeId,
          structureId: dto.structureId,
          name: dto.name,
          wage: dto.wage,
          wagePeriod: dto.wagePeriod,
          startDate: dto.startDate,
          endDate: dto.endDate || null,
          status: dto.status,
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true } },
          structure: { select: { id: true, name: true, code: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'CONTRACT_CREATED',
          entityType: 'Contract',
          entityId: contract.id,
          newValues: { name: contract.name, wage: Number(contract.wage), status: contract.status },
        },
        tx,
      );

      return contract;
    });
  }

  async findById(organizationId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, organizationId },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true, workEmail: true } },
        structure: {
          select: {
            id: true,
            name: true,
            code: true,
            rules: { orderBy: { sequence: 'asc' } },
          },
        },
      },
    });

    if (!contract) throw new NotFoundError('Contract not found');
    return contract;
  }

  async list(organizationId: string, query: ContractQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.ContractWhereInput = {
      organizationId,
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.contract.count({ where }),
      this.prisma.contract.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true } },
          structure: { select: { id: true, name: true, code: true } },
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

  async update(organizationId: string, id: string, dto: UpdateContractDto, actorId?: string) {
    const existing = await this.findById(organizationId, id);

    if (dto.structureId) {
      const structure = await this.prisma.salaryStructure.findFirst({
        where: { id: dto.structureId, organizationId },
      });
      if (!structure) throw new NotFoundError('Salary structure not found');
    }

    return this.prisma.runInTransaction(async (tx) => {
      if (dto.status === ContractStatus.ACTIVE && existing.status !== ContractStatus.ACTIVE) {
        await tx.contract.updateMany({
          where: { employeeId: existing.employeeId, status: ContractStatus.ACTIVE, NOT: { id } },
          data: { status: ContractStatus.EXPIRED, endDate: new Date() },
        });
      }

      const updated = await tx.contract.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.wage ? { wage: dto.wage } : {}),
          ...(dto.wagePeriod ? { wagePeriod: dto.wagePeriod } : {}),
          ...(dto.startDate ? { startDate: dto.startDate } : {}),
          ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
          ...(dto.structureId ? { structureId: dto.structureId } : {}),
          ...(dto.status ? { status: dto.status } : {}),
        },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true } },
          structure: { select: { id: true, name: true, code: true } },
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'CONTRACT_UPDATED',
          entityType: 'Contract',
          entityId: id,
          oldValues: { wage: Number(existing.wage), status: existing.status },
          newValues: { wage: Number(updated.wage), status: updated.status },
        },
        tx,
      );

      return updated;
    });
  }
}
