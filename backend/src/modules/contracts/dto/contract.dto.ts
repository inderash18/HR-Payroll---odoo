import { z } from 'zod';
import { ContractStatus } from '@prisma/client';

export const createContractSchema = z.object({
  employeeId: z.string().uuid(),
  structureId: z.string().uuid(),
  name: z.string().min(2).max(100),
  wage: z.number().positive(),
  wagePeriod: z.enum(['MONTHLY', 'WEEKLY', 'HOURLY']).default('MONTHLY'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: z.nativeEnum(ContractStatus).default(ContractStatus.DRAFT),
});

export type CreateContractDto = z.infer<typeof createContractSchema>;

export const updateContractSchema = createContractSchema.partial();
export type UpdateContractDto = z.infer<typeof updateContractSchema>;

export const contractQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  employeeId: z.string().uuid().optional(),
  status: z.nativeEnum(ContractStatus).optional(),
});

export type ContractQueryDto = z.infer<typeof contractQuerySchema>;
