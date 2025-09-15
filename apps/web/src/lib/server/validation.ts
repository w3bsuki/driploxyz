import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';

// Common validation schemas
export const productSchema = z.object({
  title: z.string().min(3).max(255).trim(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().max(50000),
  condition: z.enum(['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair']),
  brand: z.string().max(100).optional(),
  size: z.string().max(20).optional(),
  category_id: z.string().uuid()
});

export const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  full_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional()
});

export const messageSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
  receiver_id: z.string().uuid(),
  product_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional()
});

export const searchSchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  condition: z.string().optional(),
  page: z.number().int().positive().max(100).default(1),
  limit: z.number().int().positive().max(50).default(20)
});

// Validation helper
export async function validateRequest<T>(
  event: RequestEvent,
  schema: z.ZodSchema<T>
): Promise<T> {
  const formData = await event.request.formData();
  const data = Object.fromEntries(formData.entries());

  // Convert numeric strings to numbers
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
      (data as any)[key] = parseFloat(value);
    }
  }

  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Response(JSON.stringify({
        error: 'Validation failed',
        details: error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
}

// CSRF protection helper
export function validateOrigin(event: RequestEvent): boolean {
  const origin = event.request.headers.get('origin');
  const host = event.request.headers.get('host');

  if (!origin || !host) return false;

  const expectedOrigins = [
    `https://${host}`,
    `http://${host}`, // Allow HTTP in development
    'http://localhost:5173', // Vite dev server
    'http://localhost:4173'  // Vite preview
  ];

  return expectedOrigins.includes(origin);
}

// Sanitize user input
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS chars
    .slice(0, 1000); // Limit length
}