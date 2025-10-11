/**
 * Authentication validation schemas
 */

import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
  full_name: z.string().optional()
});

export const EmailVerificationSchema = z.object({
  token: z.string().uuid('Invalid verification token')
});

export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const NewPasswordSchema = z.object({
  token: z.string().uuid('Invalid reset token'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type EmailVerificationInput = z.infer<typeof EmailVerificationSchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;
export type NewPasswordInput = z.infer<typeof NewPasswordSchema>;