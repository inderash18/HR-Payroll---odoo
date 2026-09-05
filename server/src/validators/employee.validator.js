import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeNum: z.string().min(1, 'Employee Number is required'),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  workEmail: z.string().email('Valid work email is required'),
  personalEmail: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  departmentId: z.string().uuid().optional().nullable(),
  jobPositionId: z.string().uuid().optional().nullable(),
  workingScheduleId: z.string().uuid().optional().nullable(),
  joiningDate: z.string().optional(),
  bankName: z.string().optional().or(z.literal('')),
  bankAccountMasked: z.string().optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
