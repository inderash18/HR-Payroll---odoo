import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Department code is required'),
  parentId: z.string().uuid().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createContractSchema = z.object({
  employeeId: z.string().uuid('Valid Employee ID is required'),
  structureId: z.string().uuid('Valid Salary Structure ID is required'),
  workingScheduleId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Contract title is required'),
  wage: z.coerce.number().positive('Wage must be a positive number'),
  wagePeriod: z.enum(['MONTHLY', 'HOURLY', 'WEEKLY']).default('MONTHLY'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).default('ACTIVE'),
});

export const updateContractSchema = createContractSchema.partial();
