import { z } from 'zod';
import { LeaveStatus } from '@prisma/client';

export const createLeaveTypeSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30).toUpperCase(),
  isPaid: z.boolean().default(true),
  daysAllowed: z.number().int().positive().default(10),
});

export type CreateLeaveTypeDto = z.infer<typeof createLeaveTypeSchema>;

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  numberOfDays: z.number().positive(),
  reason: z.string().optional(),
});

export type CreateLeaveRequestDto = z.infer<typeof createLeaveRequestSchema>;

export const leaveQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  employeeId: z.string().uuid().optional(),
  status: z.nativeEnum(LeaveStatus).optional(),
});

export type LeaveQueryDto = z.infer<typeof leaveQuerySchema>;
