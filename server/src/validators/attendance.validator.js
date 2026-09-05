import { z } from 'zod';

export const clockInSchema = z.object({
  employeeId: z.string().uuid().optional(),
  date: z.string().optional(),
  checkIn: z.string().optional(),
});

export const clockOutSchema = z.object({
  employeeId: z.string().uuid().optional(),
  date: z.string().optional(),
  checkOut: z.string().optional(),
});

export const createLeaveTypeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  isPaid: z.boolean().default(true),
  requiresAllocation: z.boolean().default(true),
  daysAllowed: z.coerce.number().int().min(1).default(20),
});

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid('Employee ID is required'),
  leaveTypeId: z.string().uuid('Leave Type ID is required'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  numberOfDays: z.coerce.number().positive('Number of days must be positive'),
  reason: z.string().optional(),
});

export const createLeaveAllocationSchema = z.object({
  employeeId: z.string().uuid('Employee ID is required'),
  leaveTypeId: z.string().uuid('Leave Type ID is required'),
  allocatedAmount: z.coerce.number().positive('Allocated amount must be positive'),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
});
