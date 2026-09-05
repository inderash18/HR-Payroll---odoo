import { describe, it, expect, beforeEach } from 'vitest';
import { PayrollEngineService } from './payroll-engine.service';
import { RuleCategoryType } from '@prisma/client';

describe('PayrollEngineService', () => {
  let service: PayrollEngineService;

  beforeEach(() => {
    service = new PayrollEngineService();
  });

  it('should calculate basic wage without leaves correctly', () => {
    const rules = [
      {
        id: '1',
        code: 'BASIC',
        name: 'Basic Salary',
        category: RuleCategoryType.EARNING,
        sequence: 10,
        amountType: 'FIXED',
      },
    ];

    const result = service.calculatePayslip(5000, rules, 30, 30, 0);

    expect(result.grossSalary).toBe(5000);
    expect(result.netSalary).toBe(5000);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toEqual({
      category: RuleCategoryType.EARNING,
      code: 'BASIC',
      name: 'Basic Salary',
      amount: 5000,
      baseAmount: 5000,
      rate: undefined,
    });
  });

  it('should prorate basic salary based on unpaid leave days', () => {
    const rules = [
      {
        id: '1',
        code: 'BASIC',
        name: 'Basic Salary',
        category: RuleCategoryType.EARNING,
        sequence: 10,
        amountType: 'FIXED',
      },
    ];

    // 6 days unpaid leave out of 30 working days => 24/30 = 80% of 5000 = 4000
    const result = service.calculatePayslip(5000, rules, 24, 30, 6);

    expect(result.grossSalary).toBe(4000);
    expect(result.netSalary).toBe(4000);
  });

  it('should compute complex allowances, deductions, and tax tiers correctly', () => {
    const rules = [
      {
        id: '1',
        code: 'BASIC',
        name: 'Basic Salary',
        category: RuleCategoryType.EARNING,
        sequence: 10,
        amountType: 'FIXED',
      },
      {
        id: '2',
        code: 'HRA',
        name: 'House Rent Allowance',
        category: RuleCategoryType.ALLOWANCE,
        sequence: 20,
        amountType: 'PERCENTAGE',
        amountPercentage: 40, // 40% of BASIC (40% of 5000 = 2000)
        percentageBasedOn: 'BASIC',
      },
      {
        id: '3',
        code: 'PF',
        name: 'Provident Fund',
        category: RuleCategoryType.DEDUCTION,
        sequence: 30,
        amountType: 'PERCENTAGE',
        amountPercentage: 12, // 12% of BASIC (12% of 5000 = 600)
        percentageBasedOn: 'BASIC',
      },
      {
        id: '4',
        code: 'TAX',
        name: 'Income Tax',
        category: RuleCategoryType.TAX,
        sequence: 40,
        amountType: 'PERCENTAGE',
        amountPercentage: 10, // 10% of GROSS (10% of 7000 = 700)
        percentageBasedOn: 'GROSS',
      },
    ];

    const result = service.calculatePayslip(5000, rules, 30, 30, 0);

    // Gross = 5000 (Basic) + 2000 (HRA) = 7000
    expect(result.grossSalary).toBe(7000);
    // Net = 7000 - 600 (PF) - 700 (TAX) = 5700
    expect(result.netSalary).toBe(5700);
  });
});
