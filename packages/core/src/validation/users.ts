/**
 * User validation schemas
 */

import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long').optional(),
  full_name: z.string().max(100, 'Name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  avatar_url: z.string().url().optional(),
  location: z.string().optional(),
  website: z.string().url().optional()
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your new password')
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;