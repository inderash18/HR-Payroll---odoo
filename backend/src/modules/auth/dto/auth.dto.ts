import { z } from 'zod';

export const loginSchema = z.object({
  organizationCode: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  organizationName: z.string().min(2).max(100),
  organizationCode: z.string().min(2).max(20).toUpperCase(),
  currency: z.string().length(3).toUpperCase().default('USD'),
  timezone: z.string().default('UTC'),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const requestPasswordResetSchema = z.object({
  organizationCode: z.string().min(2).max(20),
  email: z.string().email(),
});
export type RequestPasswordResetDto = z.infer<typeof requestPasswordResetSchema>;

export const confirmPasswordResetSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});
export type ConfirmPasswordResetDto = z.infer<typeof confirmPasswordResetSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
