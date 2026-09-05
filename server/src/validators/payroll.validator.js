import { z } from 'zod';

export const createSalaryStructureSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  description: z.string().optional(),
});

export const createSalaryRuleSchema = z.object({
  structureId: z.string().uuid('Structure ID is required'),
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  category: z.enum(['BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'CONTRIBUTION', 'NET', 'EARNING', 'TAX', 'EMPLOYER_CONTRIBUTION']),
  sequence: z.number().int().default(10),
  amountType: z.enum(['FIXED', 'PERCENTAGE', 'FORMULA', 'CONTRACT_BASE', 'CODE_FORMULA']).default('FIXED'),
  amountFixed: z.coerce.number().optional().nullable(),
  amountPercentage: z.coerce.number().optional().nullable(),
  percentageBasedOn: z.string().optional().nullable(),
  codeFormula: z.string().optional().nullable(),
});

export const createPayrunSchema = z.object({
  name: z.string().min(2, 'Payrun name is required'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  legalEntityId: z.string().uuid().optional().nullable(),
  salaryStructureId: z.string().uuid().optional().nullable(),
  employeeIds: z.array(z.string().uuid()).optional().nullable(),
});

export const createUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE']).default('EMPLOYEE'),
});

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE']).optional(),
  isActive: z.boolean().optional(),
});
