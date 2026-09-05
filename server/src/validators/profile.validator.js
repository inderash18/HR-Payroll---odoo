import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  personalEmail: z.string().email('Invalid personal email format').optional().nullable(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relation: z.string().optional(),
    phone: z.string().optional(),
  }).optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountMasked: z.string().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const avatarUploadSchema = z.object({
  avatarData: z.string().min(1, 'Avatar image data is required'), // Base64 Data URL
});

export const preferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  payrollAlerts: z.boolean().default(true),
  leaveAlerts: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'system']).default('light'),
});

export const documentUploadSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  category: z.enum(['IDENTITY', 'TAX', 'CONTRACT', 'CERTIFICATE', 'OTHER']).default('OTHER'),
  fileData: z.string().min(1, 'File content is required'), // Base64
  mimeType: z.string().default('application/pdf'),
  fileSize: z.number().int().nonnegative().default(0),
});
