import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.nativeEnum(Role).default(Role.EMPLOYEE),
  legalEntityId: z.string().uuid().optional().nullable(),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
  legalEntityId: z.string().uuid().optional().nullable(),
});
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const userQuerySchema = z.object({
  role: z.nativeEnum(Role).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
export type UserQueryDto = z.infer<typeof userQuerySchema>;
