import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { OutboxService } from '@modules/outbox/outbox.service';
import { PayrollEngineService } from './payroll-engine.service';
import {
  CreateSalaryStructureDto,
  CreateSalaryRuleDto,
  CreatePayrunDto,
  PayrunQueryDto,
} from './dto/payroll.dto';
import { NotFoundError, BadRequestError, ConflictError } from '@common/errors/app-error';
import { PayrunStatus, ContractStatus, Prisma } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly outboxService: OutboxService,
    private readonly payrollEngine: PayrollEngineService,
  ) {}

  // ----------------------------------------------------
  // SALARY STRUCTURES & RULES
  // ----------------------------------------------------
  async createStructure(organizationId: string, dto: CreateSalaryStructureDto, actorId?: string) {
    const existing = await this.prisma.salaryStructure.findUnique({
      where: {
        organizationId_code: { organizationId, code: dto.code },
      },
    });

    if (existing) {
      throw new ConflictError(`Salary structure code '${dto.code}' already exists`);
    }

    return this.prisma.runInTransaction(async (tx) => {
      const struct = await tx.salaryStructure.create({
        data: {
          organizationId,
          name: dto.name,
          code: dto.code,
          description: dto.description || null,
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'SALARY_STRUCTURE_CREATED',
          entityType: 'SalaryStructure',
          entityId: struct.id,
          newValues: { name: struct.name, code: struct.code },
        },
        tx,
      );

      return struct;
    });
  }

  async listStructures(organizationId: string) {
    return this.prisma.salaryStructure.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        rules: { orderBy: { sequence: 'asc' } },
        _count: { select: { contracts: true } },
      },
    });
  }

  async createRule(organizationId: string, dto: CreateSalaryRuleDto, actorId?: string) {
    const structure = await this.prisma.salaryStructure.findFirst({
      where: { id: dto.structureId, organizationId },
    });

    if (!structure) {
      throw new NotFoundError('Salary structure not found');
    }

    const existingRule = await this.prisma.salaryRule.findUnique({
      where: {
        structureId_code: {
          structureId: dto.structureId,
          code: dto.code,
        },
      },
    });

    if (existingRule) {
      throw new ConflictError(`Rule with code '${dto.code}' already exists in this structure`);
    }

    return this.prisma.runInTransaction(async (tx) => {
      const rule = await tx.salaryRule.create({
        data: {
          organizationId,
          structureId: dto.structureId,
          name: dto.name,
          code: dto.code,
          category: dto.category,
          sequence: dto.sequence,
          amountType: dto.amountType,
          amountFixed: dto.amountFixed !== undefined ? dto.amountFixed : null,
          amountPercentage: dto.amountPercentage !== undefined ? dto.amountPercentage : null,
          percentageBasedOn: dto.percentageBasedOn || null,
          codeFormula: dto.codeFormula || null,
          isActive: dto.isActive,
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'SALARY_RULE_CREATED',
          entityType: 'SalaryRule',
          entityId: rule.id,
          newValues: { name: rule.name, code: rule.code, category: rule.category },
        },
        tx,
      );

      return rule;
    });
  }

  // ----------------------------------------------------
  // PAYRUN PROCESSING & GENERATION
  // ----------------------------------------------------
  async createPayrun(organizationId: string, dto: CreatePayrunDto, actorId?: string) {
    return this.prisma.runInTransaction(async (tx) => {
      const payrun = await tx.payrun.create({
        data: {
          organizationId,
          legalEntityId: dto.legalEntityId || null,
          name: dto.name,
          startDate: dto.startDate,
          endDate: dto.endDate,
          status: PayrunStatus.DRAFT,
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'PAYRUN_CREATED',
          entityType: 'Payrun',
          entityId: payrun.id,
          newValues: { name: payrun.name, status: payrun.status },
        },
        tx,
      );

      return payrun;
    });
  }

  async computePayrun(organizationId: string, payrunId: string, actorId?: string) {
    const payrun = await this.prisma.payrun.findFirst({
      where: { id: payrunId, organizationId },
    });

    if (!payrun) throw new NotFoundError('Payrun not found');
    if (payrun.status === PayrunStatus.PAID || payrun.status === PayrunStatus.CANCELLED) {
      throw new BadRequestError(`Cannot re-compute payrun in '${payrun.status}' state`);
    }

    // Update status to COMPUTING
    await this.prisma.payrun.update({
      where: { id: payrunId },
      data: { status: PayrunStatus.COMPUTING },
    });

    // Find all ACTIVE contracts for employees matching legal entity if specified
    const contracts = await this.prisma.contract.findMany({
      where: {
        organizationId,
        status: ContractStatus.ACTIVE,
        ...(payrun.legalEntityId
          ? { employee: { legalEntityId: payrun.legalEntityId } }
          : {}),
      },
      include: {
        employee: true,
        structure: {
          include: {
            rules: {
              where: { isActive: true },
              orderBy: { sequence: 'asc' },
            },
          },
        },
      },
    });

    let totalGross = 0;
    let totalNet = 0;

    await this.prisma.runInTransaction(async (tx) => {
      // Clear existing payslips for re-computation
      await tx.payslip.deleteMany({ where: { payrunId } });

      for (const contract of contracts) {
        // Fetch unpaid leaves within payrun date range
        const unpaidLeaves = await tx.leaveRequest.aggregate({
          where: {
            organizationId,
            employeeId: contract.employeeId,
            status: 'APPROVED',
            leaveType: { isPaid: false },
            startDate: { gte: payrun.startDate },
            endDate: { lte: payrun.endDate },
          },
          _sum: { numberOfDays: true },
        });

        const unpaidDays = Number(unpaidLeaves._sum.numberOfDays || 0);
        const totalWorkingDays = 30; // standard month baseline
        const workedDays = Math.max(0, totalWorkingDays - unpaidDays);

        const calculation = this.payrollEngine.calculatePayslip(
          Number(contract.wage),
          contract.structure.rules.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            category: r.category,
            sequence: r.sequence,
            amountType: r.amountType,
            amountFixed: r.amountFixed ? Number(r.amountFixed) : null,
            amountPercentage: r.amountPercentage ? Number(r.amountPercentage) : null,
            percentageBasedOn: r.percentageBasedOn,
            codeFormula: r.codeFormula,
          })),
          workedDays,
          totalWorkingDays,
          unpaidDays,
        );

        totalGross += calculation.grossSalary;
        totalNet += calculation.netSalary;

        await tx.payslip.create({
          data: {
            organizationId,
            payrunId,
            employeeId: contract.employeeId,
            contractId: contract.id,
            workedDays,
            unpaidLeaveDays: unpaidDays,
            grossSalary: calculation.grossSalary,
            netSalary: calculation.netSalary,
            lines: {
              create: calculation.lines.map((line) => ({
                category: line.category,
                code: line.code,
                name: line.name,
                amount: line.amount,
                baseAmount: line.baseAmount !== undefined ? line.baseAmount : null,
                rate: line.rate !== undefined ? line.rate : null,
              })),
            },
          },
        });
      }

      await tx.payrun.update({
        where: { id: payrunId },
        data: {
          status: PayrunStatus.COMPUTED,
          totalGross: Number(totalGross.toFixed(2)),
          totalNet: Number(totalNet.toFixed(2)),
        },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'PAYRUN_COMPUTED',
          entityType: 'Payrun',
          entityId: payrunId,
          newValues: { totalGross, totalNet, processedCount: contracts.length },
        },
        tx,
      );
    });

    return this.findPayrunById(organizationId, payrunId);
  }

  async validatePayrun(organizationId: string, payrunId: string, actorId?: string) {
    const payrun = await this.findPayrunById(organizationId, payrunId);
    if (payrun.status !== PayrunStatus.COMPUTED) {
      throw new BadRequestError(`Only COMPUTED payruns can be validated. Current state: ${payrun.status}`);
    }

    return this.prisma.runInTransaction(async (tx) => {
      const updated = await tx.payrun.update({
        where: { id: payrunId },
        data: { status: PayrunStatus.VALIDATED },
      });

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'PAYRUN_VALIDATED',
          entityType: 'Payrun',
          entityId: payrunId,
        },
        tx,
      );

      return updated;
    });
  }

  async markPayrunPaid(organizationId: string, payrunId: string, actorId?: string) {
    const payrun = await this.findPayrunById(organizationId, payrunId);
    if (payrun.status !== PayrunStatus.VALIDATED) {
      throw new BadRequestError(`Only VALIDATED payruns can be marked as PAID. Current state: ${payrun.status}`);
    }

    return this.prisma.runInTransaction(async (tx) => {
      const updated = await tx.payrun.update({
        where: { id: payrunId },
        data: { status: PayrunStatus.PAID },
      });

      await this.outboxService.publish(
        {
          organizationId,
          eventType: 'PAYRUN_PAID',
          payload: {
            payrunId: updated.id,
            name: updated.name,
            totalGross: Number(updated.totalGross),
            totalNet: Number(updated.totalNet),
          },
        },
        tx,
      );

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'PAYRUN_PAID',
          entityType: 'Payrun',
          entityId: payrunId,
        },
        tx,
      );

      return updated;
    });
  }

  async findPayrunById(organizationId: string, id: string) {
    const payrun = await this.prisma.payrun.findFirst({
      where: { id, organizationId },
      include: {
        legalEntity: { select: { id: true, name: true, code: true } },
        payslips: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true } },
            contract: { select: { id: true, wage: true, wagePeriod: true } },
            lines: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!payrun) throw new NotFoundError('Payrun not found');
    return payrun;
  }

  async listPayruns(organizationId: string, query: PayrunQueryDto) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.PayrunWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.legalEntityId ? { legalEntityId: query.legalEntityId } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.payrun.count({ where }),
      this.prisma.payrun.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          legalEntity: { select: { id: true, name: true, code: true } },
          _count: { select: { payslips: true } },
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
