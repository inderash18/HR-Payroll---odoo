import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const clockInSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.coerce.date().optional(),
});

export type ClockInDto = z.infer<typeof clockInSchema>;

export const clockOutSchema = z.object({
  attendanceId: z.string().uuid(),
});

export type ClockOutDto = z.infer<typeof clockOutSchema>;

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  employeeId: z.string().uuid().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
});

export type AttendanceQueryDto = z.infer<typeof attendanceQuerySchema>;
