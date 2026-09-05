import { z } from 'zod';

export const scheduleLineSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:MM'),
  breakMinutes: z.number().int().min(0).max(360).default(60),
});

export const createWorkingScheduleSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.string().default('STANDARD_40H'),
  timezone: z.string().default('UTC'),
  lines: z.array(scheduleLineSchema).min(1),
});
export type CreateWorkingScheduleDto = z.infer<typeof createWorkingScheduleSchema>;

export const updateWorkingScheduleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.string().optional(),
  timezone: z.string().optional(),
  active: z.boolean().optional(),
  lines: z.array(scheduleLineSchema).optional(),
});
export type UpdateWorkingScheduleDto = z.infer<typeof updateWorkingScheduleSchema>;
