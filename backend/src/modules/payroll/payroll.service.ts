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
            periodStart: payrun.startDate,
            periodEnd: payrun.endDate,
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
            employee: { select: { id: true, firstName: true, lastName: true, employeeNum: true, workEmail: true } },
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

  // ----------------------------------------------------
  // PAYSLIPS & DISPATCH
  // ----------------------------------------------------
  async listPayslips(organizationId: string, payrunId?: string, employeeId?: string) {
    return this.prisma.payslip.findMany({
      where: {
        organizationId,
        ...(payrunId ? { payrunId } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNum: true,
            workEmail: true,
            department: { select: { name: true } },
            jobPosition: { select: { title: true } },
          },
        },
        payrun: { select: { id: true, name: true, status: true, startDate: true, endDate: true } },
        lines: { orderBy: { sequence: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPayslipById(organizationId: string, payslipId: string, userId?: string, isEmployeeOnly = false) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id: payslipId, organizationId },
      include: {
        employee: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            employeeNum: true,
            workEmail: true,
            bankName: true,
            bankAccountMasked: true,
            department: { select: { name: true } },
            jobPosition: { select: { title: true } },
          },
        },
        contract: {
          select: {
            id: true,
            wage: true,
            wagePeriod: true,
            structure: { select: { name: true, code: true } },
          },
        },
        payrun: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        organization: { select: { id: true, name: true } },
        lines: { orderBy: { sequence: 'asc' } },
      },
    });

    if (!payslip) throw new NotFoundError('Payslip not found');

    if (isEmployeeOnly && userId && payslip.employee.userId !== userId) {
      throw new BadRequestError('You are not authorized to access this payslip');
    }

    return payslip;
  }

  async generatePayslipHtml(organizationId: string, payslipId: string, userId?: string, isEmployeeOnly = false) {
    const p = await this.getPayslipById(organizationId, payslipId, userId, isEmployeeOnly);

    const earnings = p.lines.filter((l) => l.category === 'BASIC' || l.category === 'ALLOWANCE' || l.category === 'GROSS');
    const deductions = p.lines.filter((l) => l.category === 'DEDUCTION' || l.category === 'CONTRIBUTION');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${p.employee.firstName} ${p.employee.lastName} (${p.payrun.name})</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 30px; color: #1e293b; background: #ffffff; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .title { font-size: 24px; font-weight: 700; color: #0f172a; }
    .org-name { font-size: 16px; color: #64748b; font-weight: 500; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; }
    .box h4 { margin-top: 0; color: #334155; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .box p { margin: 4px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px 12px; font-size: 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .amount-col { text-align: right; }
    .summary-box { background: #0f172a; color: white; border-radius: 6px; padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
    .net-salary { font-size: 22px; font-weight: 700; color: #38bdf8; }
    .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">PAYSLIP CONFIRMATION</div>
      <div class="org-name">${p.organization.name}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 600;">Pay Period</div>
      <div style="font-size: 13px; color: #64748b;">${new Date(p.payrun.startDate).toLocaleDateString()} - ${new Date(p.payrun.endDate).toLocaleDateString()}</div>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h4>Employee Details</h4>
      <p><strong>Name:</strong> ${p.employee.firstName} ${p.employee.lastName}</p>
      <p><strong>Employee ID:</strong> ${p.employee.employeeNum}</p>
      <p><strong>Department:</strong> ${p.employee.department?.name || 'N/A'}</p>
      <p><strong>Designation:</strong> ${p.employee.jobPosition?.title || 'N/A'}</p>
      <p><strong>Bank Account:</strong> ${p.employee.bankAccountMasked || 'N/A'}</p>
    </div>
    <div class="box">
      <h4>Attendance & Work Summary</h4>
      <p><strong>Worked Days:</strong> ${p.workedDays}</p>
      <p><strong>Unpaid Leave Days:</strong> ${p.unpaidLeaveDays}</p>
      <p><strong>Payrun Name:</strong> ${p.payrun.name}</p>
      <p><strong>Status:</strong> ${p.payrun.status}</p>
      <p><strong>Currency:</strong> ${p.currency}</p>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div>
      <h4 style="margin-bottom: 8px;">Earnings & Allowances</h4>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount-col">Amount (${p.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${earnings
            .map(
              (l) => `<tr>
            <td>${l.name} (${l.code})</td>
            <td class="amount-col">${Number(l.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div>
      <h4 style="margin-bottom: 8px;">Deductions & Contributions</h4>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount-col">Amount (${p.currency})</th>
          </tr>
        </thead>
        <tbody>
          ${deductions
            .map(
              (l) => `<tr>
            <td>${l.name} (${l.code})</td>
            <td class="amount-col">${Number(l.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="summary-box">
    <div>
      <div style="font-size: 13px; color: #94a3b8;">GROSS SALARY: ${Number(p.grossSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })} | DEDUCTIONS: ${Number(p.deductionAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      <div style="font-size: 14px; font-weight: 500; margin-top: 4px;">NET TAKE-HOME PAY</div>
    </div>
    <div class="net-salary">
      ${p.currency} ${Number(p.netSalary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  </div>

  <div class="footer">
    This is a computer-generated payslip generated by PeoplePay360. PostgreSQL Database Record ID: ${p.id} &bull; Generated on ${new Date().toISOString()}
  </div>
</body>
</html>`;
  }

  async sendPayrunPayslips(organizationId: string, payrunId: string, actorId?: string) {
    const payrun = await this.findPayrunById(organizationId, payrunId);
    if (payrun.status !== PayrunStatus.VALIDATED && payrun.status !== PayrunStatus.PAID) {
      throw new BadRequestError('Payslips can only be distributed for VALIDATED or PAID payruns');
    }

    const payslips = await this.prisma.payslip.findMany({
      where: { payrunId, organizationId },
      include: { employee: true },
    });

    const results = await this.prisma.runInTransaction(async (tx) => {
      const records = [];
      for (const payslip of payslips) {
        const record = await tx.emailDeliveryRecord.create({
          data: {
            organizationId,
            payslipId: payslip.id,
            recipient: payslip.employee.workEmail,
            status: 'PENDING',
          },
        });
        records.push(record);

        await this.outboxService.publish(
          {
            organizationId,
            eventType: 'PAYSLIP_EMAIL_QUEUED',
            payload: {
              deliveryId: record.id,
              payslipId: payslip.id,
              recipient: payslip.employee.workEmail,
              employeeName: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
            },
          },
          tx,
        );
      }

      await this.auditService.log(
        {
          organizationId,
          userId: actorId || null,
          action: 'PAYSLIPS_EMAIL_DISPATCHED',
          entityType: 'Payrun',
          entityId: payrunId,
          newValues: { recipientCount: records.length },
        },
        tx,
      );

      return records;
    });

    return {
      message: `Dispatched ${results.length} payslips to outbound queue successfully`,
      queuedCount: results.length,
    };
  }
}
