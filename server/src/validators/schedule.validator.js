import { z } from 'zod';

export const workingScheduleLineSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid format (HH:mm)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid format (HH:mm)'),
  breakMinutes: z.number().int().min(0).default(60),
});

export const createWorkingScheduleSchema = z.object({
  name: z.string().min(2, 'Schedule name is required'),
  type: z.string().default('STANDARD_40H'),
  timezone: z.string().default('UTC'),
  lines: z.array(workingScheduleLineSchema).min(1, 'At least one working schedule day is required'),
});

export const updateWorkingScheduleSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.string().optional(),
  timezone: z.string().optional(),
  active: z.boolean().optional(),
  lines: z.array(workingScheduleLineSchema).optional(),
});
