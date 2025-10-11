/**
 * Payment validation schemas
 */

import { z } from 'zod';

export const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Invalid currency code'),
  product_id: z.string().uuid('Invalid product ID'),
  payment_method_id: z.string().optional()
});

export const ConfirmPaymentSchema = z.object({
  payment_intent_id: z.string(),
  payment_method_id: z.string()
});

export const RefundSchema = z.object({
  payment_intent_id: z.string(),
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z.string().optional()
});

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;
export type RefundInput = z.infer<typeof RefundSchema>;