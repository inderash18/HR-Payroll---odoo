import { z } from 'zod';

export const createLegalEntitySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).toUpperCase(),
  registrationNum: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  country: z.string().length(2).toUpperCase().default('US'),
  currency: z.string().length(3).toUpperCase().default('USD'),
  address: z.record(z.unknown()).optional().nullable(),
});

export type CreateLegalEntityDto = z.infer<typeof createLegalEntitySchema>;

export const updateLegalEntitySchema = createLegalEntitySchema.partial();
export type UpdateLegalEntityDto = z.infer<typeof updateLegalEntitySchema>;
