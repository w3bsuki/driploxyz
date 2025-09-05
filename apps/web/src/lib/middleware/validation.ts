/**
 * Input Validation Middleware for SvelteKit API Routes
 * Provides comprehensive validation and sanitization
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // Product validation
  product: z.object({
    title: z.string().min(1).max(100).trim(),
    description: z.string().min(1).max(2000).trim(),
    price: z.number().positive().max(100000),
    category_id: z.string().uuid(),
    brand: z.string().max(50).trim().optional(),
    size: z.string().max(20).trim().optional(),
    condition: z.enum(['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair']),
    color: z.string().max(30).trim().optional(),
    material: z.string().max(50).trim().optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    location: z.string().max(100).trim().optional(),
    shipping_cost: z.number().min(0).max(1000).optional()
  }),

  // User profile validation
  profile: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    full_name: z.string().min(1).max(100).trim(),
    bio: z.string().max(500).trim().optional(),
    location: z.string().max(100).trim().optional(),
    phone: z.string().max(20).trim().optional(),
    date_of_birth: z.string().date().optional(),
    country_code: z.string().length(2).optional(),
    region: z.string().max(10).optional(),
    currency: z.string().length(3).optional()
  }),

  // Message validation
  message: z.object({
    content: z.string().min(1).max(1000).trim(),
    receiver_id: z.string().uuid(),
    product_id: z.string().uuid().optional(),
    order_id: z.string().uuid().optional()
  }),

  // Review validation
  review: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1).max(100).trim().optional(),
    comment: z.string().max(1000).trim().optional(),
    communication_rating: z.number().int().min(1).max(5).optional(),
    shipping_rating: z.number().int().min(1).max(5).optional(),
    product_quality_rating: z.number().int().min(1).max(5).optional()
  }),

  // Search validation
  search: z.object({
    q: z.string().min(1).max(100).trim(),
    category: z.string().uuid().optional(),
    min_price: z.number().min(0).optional(),
    max_price: z.number().min(0).optional(),
    condition: z.enum(['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair']).optional(),
    location: z.string().max(100).trim().optional(),
    sort: z.enum(['newest', 'oldest', 'price_low', 'price_high', 'relevance']).optional(),
    page: z.number().int().min(1).max(100).optional(),
    limit: z.number().int().min(1).max(50).optional()
  }),

  // File upload validation
  fileUpload: z.object({
    file: z.instanceof(File),
    type: z.enum(['image', 'document']),
    maxSize: z.number().optional().default(5 * 1024 * 1024), // 5MB default
    allowedTypes: z.array(z.string()).optional()
  }),

  // Order validation
  order: z.object({
    product_id: z.string().uuid(),
    shipping_address: z.object({
      name: z.string().min(1).max(100),
      address_line_1: z.string().min(1).max(200),
      address_line_2: z.string().max(200).optional(),
      city: z.string().min(1).max(100),
      postal_code: z.string().min(1).max(20),
      country: z.string().min(2).max(2),
      phone: z.string().max(20).optional()
    }),
    notes: z.string().max(500).optional()
  })
};

/**
 * Sanitize input to prevent XSS and other attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string; status: number }> {
  try {
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    const validatedData = schema.parse(sanitizedBody);
    
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { 
        success: false, 
        error: `Validation error: ${errorMessage}`, 
        status: 400 
      };
    }
    
    return { 
      success: false, 
      error: 'Invalid JSON in request body', 
      status: 400 
    };
  }
}

/**
 * Validate query parameters against schema
 */
export function validateQueryParams<T>(
  url: URL,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string; status: number } {
  try {
    const params: any = {};
    
    // Convert URLSearchParams to object
    for (const [key, value] of url.searchParams.entries()) {
      // Try to parse numbers
      if (!isNaN(Number(value))) {
        params[key] = Number(value);
      } else if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
      } else {
        params[key] = value;
      }
    }
    
    const sanitizedParams = sanitizeInput(params);
    const validatedData = schema.parse(sanitizedParams);
    
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { 
        success: false, 
        error: `Query parameter validation error: ${errorMessage}`, 
        status: 400 
      };
    }
    
    return { 
      success: false, 
      error: 'Invalid query parameters', 
      status: 400 
    };
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  config: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { success: true } | { success: false; error: string; status: number } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'] } = config;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
      status: 413
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      status: 415
    };
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      success: false,
      error: `File extension ${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
      status: 415
    };
  }
  
  return { success: true };
}

/**
 * Create validation middleware for SvelteKit API routes
 */
export function createValidationMiddleware<T>(
  schema: z.ZodSchema<T>,
  type: 'body' | 'query' = 'body'
) {
  return async (request: Request): Promise<{ success: true; data: T } | { success: false; response: Response }> => {
    let validationResult;
    
    if (type === 'body') {
      validationResult = await validateRequestBody(request, schema);
    } else {
      const url = new URL(request.url);
      validationResult = validateQueryParams(url, schema);
    }
    
    if (!validationResult.success) {
      return {
        success: false,
        response: new Response(
          JSON.stringify({ error: validationResult.error }),
          {
            status: validationResult.status,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }
    
    return { success: true, data: validationResult.data };
  };
}
