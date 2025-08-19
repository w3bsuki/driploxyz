import { z } from 'zod';

// Condition types
export const ProductCondition = z.enum(['new', 'like-new', 'good', 'fair']);

// Product form schema with all fields
export const ProductSchema = z.object({
  // Step 1: Photos & Details
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must be less than 50 characters')
    .trim(),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional()
    .nullable(),
  
  category_id: z.string()
    .min(1, 'Please select a category'),
  
  subcategory_id: z.string()
    .optional()
    .nullable(),
  
  // Step 2: Product Info
  brand: z.string()
    .min(1, 'Please select or enter a brand')
    .max(50, 'Brand name too long'),
  
  size: z.string()
    .min(1, 'Please select a size'),
  
  condition: ProductCondition,
  
  color: z.string()
    .max(30, 'Color description too long')
    .optional()
    .nullable(),
  
  material: z.string()
    .max(50, 'Material description too long')
    .optional()
    .nullable(),
  
  // Step 3: Price & Publish
  price: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Price must be a positive number'
    })
    .refine((val) => parseFloat(val) <= 10000, {
      message: 'Price cannot exceed $10,000'
    }),
  
  shipping_cost: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'Shipping cost must be 0 or positive'
    })
    .refine((val) => parseFloat(val) <= 100, {
      message: 'Shipping cost cannot exceed $100'
    }),
  
  tags: z.array(z.string().trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  
  use_premium_boost: z.boolean().default(false),
  
  // File handling (for validation purposes)
  photos_count: z.number()
    .min(1, 'At least one photo is required')
    .max(10, 'Maximum 10 photos allowed')
});

// Step-specific validation schemas
export const Step1Schema = ProductSchema.pick({
  title: true,
  description: true,
  category_id: true,
  subcategory_id: true,
  photos_count: true
});

export const Step2Schema = ProductSchema.pick({
  brand: true,
  size: true,
  condition: true,
  color: true,
  material: true
});

export const Step3Schema = ProductSchema.pick({
  price: true,
  shipping_cost: true,
  tags: true,
  use_premium_boost: true
});

// Type exports
export type ProductFormData = z.infer<typeof ProductSchema>;
export type Step1FormData = z.infer<typeof Step1Schema>;
export type Step2FormData = z.infer<typeof Step2Schema>;
export type Step3FormData = z.infer<typeof Step3Schema>;
export type ProductConditionType = z.infer<typeof ProductCondition>;

// Helper function to validate step data
export function validateStep(step: number, data: Partial<ProductFormData>) {
  switch (step) {
    case 1:
      return Step1Schema.safeParse(data);
    case 2:
      return Step2Schema.safeParse(data);
    case 3:
      return Step3Schema.safeParse(data);
    default:
      return { success: false, error: new Error('Invalid step') };
  }
}

// Popular brands list (can be imported from constants)
export const POPULAR_BRANDS = [
  'Nike', 'Adidas', 'Zara', 'H&M', "Levi's", 'Gap', 'Uniqlo',
  'Forever 21', 'Urban Outfitters', 'Mango', 'COS', 'Other'
] as const;

// Size categories
export const SIZE_CATEGORIES = {
  clothing: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  shoes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  kids: ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14']
} as const;