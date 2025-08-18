import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(254, 'Email is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long')
});

export const SignupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(80, 'Name is too long'),
  email: z.string().email('Please enter a valid email address').max(254, 'Email is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match'
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;