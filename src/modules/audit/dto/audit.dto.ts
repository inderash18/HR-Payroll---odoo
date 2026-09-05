import { z } from 'zod';

export const createAuditLogSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(100),
  entityId: z.string().min(1).max(100),
  oldValues: z.record(z.unknown()).optional().nullable(),
  newValues: z.record(z.unknown()).optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
});

export type CreateAuditLogDto = z.infer<typeof createAuditLogSchema>;

export const auditQuerySchema = z.object({
  organizationId: z.string().uuid(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type AuditQueryDto = z.infer<typeof auditQuerySchema>;
