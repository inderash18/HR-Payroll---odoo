import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeNum: z.string().min(1).max(50),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  workEmail: z.string().email(),
  phone: z.string().optional(),
  legalEntityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  jobPositionId: z.string().uuid().optional(),
  joiningDate: z.coerce.date().optional(),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;

export const employeeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  departmentId: z.string().uuid().optional(),
  legalEntityId: z.string().uuid().optional(),
  isActive: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : val), z.boolean().optional()),
  search: z.string().optional(),
});

export type EmployeeQueryDto = z.infer<typeof employeeQuerySchema>;
