import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20).toUpperCase(),
  currency: z.string().length(3).toUpperCase().default('USD'),
  timezone: z.string().default('UTC'),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = createOrganizationSchema.partial();
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;
