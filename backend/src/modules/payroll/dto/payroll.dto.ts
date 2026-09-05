import { z } from 'zod';
import { RuleCategoryType, PayrunStatus } from '@prisma/client';

export const createSalaryStructureSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30).toUpperCase(),
  description: z.string().optional(),
});

export type CreateSalaryStructureDto = z.infer<typeof createSalaryStructureSchema>;

export const createSalaryRuleSchema = z.object({
  structureId: z.string().uuid(),
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30).toUpperCase(),
  category: z.nativeEnum(RuleCategoryType),
  sequence: z.number().int().default(10),
  amountType: z.enum(['FIXED', 'PERCENTAGE', 'CODE_FORMULA']).default('FIXED'),
  amountFixed: z.number().nonnegative().optional(),
  amountPercentage: z.number().min(0).max(100).optional(),
  percentageBasedOn: z.enum(['BASIC', 'GROSS']).optional(),
  codeFormula: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateSalaryRuleDto = z.infer<typeof createSalaryRuleSchema>;

export const createPayrunSchema = z.object({
  name: z.string().min(2).max(100),
  legalEntityId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type CreatePayrunDto = z.infer<typeof createPayrunSchema>;

export const payrunQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(PayrunStatus).optional(),
  legalEntityId: z.string().uuid().optional(),
});

export type PayrunQueryDto = z.infer<typeof payrunQuerySchema>;
