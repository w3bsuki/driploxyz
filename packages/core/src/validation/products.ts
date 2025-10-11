/**
 * Product validation schemas
 */

import { z } from 'zod';

export const CreateProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  price: z.number().positive('Price must be positive'),
  category_id: z.string().uuid('Invalid category ID'),
  condition: z.enum(['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair']),
  size: z.string().optional(),
  brand: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string().url()).optional()
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductFiltersSchema = z.object({
  category_ids: z.array(z.string().uuid()).optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  conditions: z.array(z.enum(['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'])).optional(),
  sizes: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  location: z.string().optional(),
  seller_id: z.string().uuid().optional(),
  search: z.string().optional(),
  country_code: z.string().length(2).optional()
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductFiltersInput = z.infer<typeof ProductFiltersSchema>;