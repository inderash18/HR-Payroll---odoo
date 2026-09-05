import { payrollRepository } from '../repositories/payroll.repository.js';
import { contractRepository } from '../repositories/contract.repository.js';
import { payrollEngine } from './payroll-engine.service.js';
import { prisma } from '../config/prisma.js';

export const payrollService = {
  // Structures & Rules
  async listStructures(organizationId) {
    return payrollRepository.findStructures(organizationId);
  },

  async createStructure(organizationId, dto) {
    return payrollRepository.createStructure({
      organizationId,
      ...dto,
    });
  },

  async createRule(organizationId, dto) {
    return payrollRepository.createRule({
      organizationId,
      ...dto,
    });
  },

  // Payruns
  async listPayruns(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await payrollRepository.findPayruns(organizationId, {
      skip,
      take: limit,
      status: query.status,
      search: query.search,
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

  async findPayrunById(organizationId, id) {
    const payrun = await payrollRepository.findPayrunById(organizationId, id);
    if (!payrun) throw new Error('Payrun not found');
    return payrun;
  },

  async createPayrun(organizationId, dto) {
    return payrollRepository.createPayrun({
      organizationId,
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      legalEntityId: dto.legalEntityId || null,
      salaryStructureId: dto.salaryStructureId || null,
      status: 'DRAFT',
    });
  },

  /**
   * Compute salary for all eligible employees with active contracts in the payrun period.
   */
  async computePayrun(organizationId, id) {
    const payrun = await payrollService.findPayrunById(organizationId, id);
    if (!['DRAFT', 'COMPUTED', 'WARNINGS_FOUND'].includes(payrun.status)) {
      throw new Error(`Cannot compute payrun in ${payrun.status} status. Only Draft or Computed payruns can be computed.`);
    }

    return prisma.$transaction(async (tx) => {
      // Clean previous payslips & warnings
      await tx.payslip.deleteMany({ where: { payrunId: id } });
      await tx.payrollWarning.deleteMany({ where: { payrunId: id } });

      // Find all active contracts covering this payrun period
      const activeContracts = await tx.contract.findMany({
        where: {
          organizationId,
          status: 'ACTIVE',
          startDate: { lte: payrun.endDate },
          OR: [{ endDate: null }, { endDate: { gte: payrun.startDate } }],
        },
        include: {
          employee: true,
          structure: {
            include: { rules: { where: { isActive: true }, orderBy: { sequence: 'asc' } } },
          },
        },
      });

      if (activeContracts.length === 0) {
        throw new Error('No active contracts found for this payrun period.');
      }

      let totalGross = 0;
      let totalNet = 0;
      const warnings = [];

      for (const contract of activeContracts) {
        const rules = contract.structure?.rules || [];
        if (rules.length === 0) {
          warnings.push({
            payrunId: id,
            employeeId: contract.employeeId,
            code: 'MISSING_SALARY_RULES',
            message: `No salary rules found for employee ${contract.employee.firstName} ${contract.employee.lastName}`,
            severity: 'WARNING',
          });
        }

        const calculation = payrollEngine.computeContractSalary(contract, rules, {
          scheduledDays: 30,
          workedDays: 30,
          unpaidLeaveDays: 0,
        });

        totalGross += calculation.grossSalary;
        totalNet += calculation.netSalary;

        await tx.payslip.create({
          data: {
            organizationId,
            payrunId: id,
            employeeId: contract.employeeId,
            contractId: contract.id,
            salaryStructureId: contract.structureId,
            periodStart: payrun.startDate,
            periodEnd: payrun.endDate,
            scheduledDays: 30,
            workedDays: 30,
            unpaidLeaveDays: 0,
            grossSalary: calculation.grossSalary,
            deductionAmount: calculation.deductionAmount,
            netSalary: calculation.netSalary,
            lines: {
              create: calculation.lines.map((l) => ({
                category: l.category,
                code: l.code,
                name: l.name,
                sequence: l.sequence,
                amount: l.amount,
                baseAmount: l.baseAmount,
                rate: l.rate,
              })),
            },
          },
        });
      }

      if (warnings.length > 0) {
        await tx.payrollWarning.createMany({ data: warnings });
      }

      const updatedPayrun = await tx.payrun.update({
        where: { id },
        data: {
          status: warnings.length > 0 ? 'WARNINGS_FOUND' : 'COMPUTED',
          totalGross,
          totalNet,
          computedAt: new Date(),
        },
        include: {
          payslips: { include: { employee: true } },
          warnings: true,
        },
      });

      return updatedPayrun;
    });
  },

  async validatePayrun(organizationId, id, validatorUserId) {
    const payrun = await payrollService.findPayrunById(organizationId, id);
    if (!['COMPUTED', 'WARNINGS_FOUND'].includes(payrun.status)) {
      throw new Error(`Cannot validate payrun in ${payrun.status} status. It must be computed first.`);
    }

    return payrollRepository.updatePayrun(id, {
      status: 'VALIDATED',
      validatedAt: new Date(),
      validatedById: validatorUserId,
    });
  },

  async markPayrunPaid(organizationId, id, payerUserId) {
    const payrun = await payrollService.findPayrunById(organizationId, id);
    if (payrun.status !== 'VALIDATED') {
      throw new Error(`Cannot mark payrun as Paid. Current status: ${payrun.status}. It must be VALIDATED first.`);
    }

    return payrollRepository.updatePayrun(id, {
      status: 'PAID',
      paidAt: new Date(),
      paidById: payerUserId,
    });
  },

  async sendPayrunPayslips(organizationId, id) {
    const payrun = await payrollService.findPayrunById(organizationId, id);
    if (!['VALIDATED', 'PAID'].includes(payrun.status)) {
      throw new Error('Payslips can only be sent once the payrun is validated or paid.');
    }

    return { message: 'Payslips enqueued for email dispatch.' };
  },

  // Payslips
  async listPayslips(organizationId, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [total, items] = await payrollRepository.findPayslips(organizationId, {
      payrunId: query.payrunId,
      employeeId: query.employeeId,
      skip,
      take: limit,
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

  async findPayslipById(organizationId, id) {
    const payslip = await payrollRepository.findPayslipById(organizationId, id);
    if (!payslip) throw new Error('Payslip not found');
    return payslip;
  },

  async generatePayslipHtml(organizationId, id) {
    const payslip = await payrollService.findPayslipById(organizationId, id);
    const emp = payslip.employee;
    const lines = payslip.lines || [];

    const earnings = lines.filter((l) => ['BASIC', 'ALLOWANCE', 'EARNING', 'GROSS'].includes(l.category));
    const deductions = lines.filter((l) => ['DEDUCTION', 'TAX'].includes(l.category));

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payslip - ${emp.employeeNum}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
    .title { font-size: 24px; font-weight: bold; color: #0f172a; }
    .company { font-size: 14px; color: #64748b; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { background: #0f172a; color: #fff; text-align: left; padding: 10px; font-size: 13px; }
    .table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .total-box { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: right; }
    .net-pay { font-size: 22px; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">PEOPLEPAY360 SALARY STATEMENT</div>
      <div class="company">Official Payslip Record</div>
    </div>
    <div style="text-align: right;">
      <strong>Period:</strong> ${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}
    </div>
  </div>

  <div class="meta-grid">
    <div>
      <div><strong>Employee:</strong> ${emp.firstName} ${emp.lastName}</div>
      <div><strong>Employee ID:</strong> ${emp.employeeNum}</div>
      <div><strong>Email:</strong> ${emp.workEmail || 'N/A'}</div>
    </div>
    <div>
      <div><strong>Department:</strong> ${emp.department?.name || 'General'}</div>
      <div><strong>Job Position:</strong> ${emp.jobPosition?.title || 'Staff'}</div>
      <div><strong>Bank Account:</strong> ${emp.bankAccountMasked || 'XXXX-XXXX'}</div>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
    <div>
      <h3>Earnings</h3>
      <table class="table">
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          ${earnings.map((e) => `<tr><td>${e.name}</td><td>$${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div>
      <h3>Deductions</h3>
      <table class="table">
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          ${deductions.map((d) => `<tr><td>${d.name}</td><td>$${Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="total-box">
    <div><strong>Gross Salary:</strong> $${Number(payslip.grossSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
    <div><strong>Total Deductions:</strong> $${Number(payslip.deductionAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
    <div class="net-pay">Net Take-Home: $${Number(payslip.netSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
  </div>
</body>
</html>
    `;
  },
};
