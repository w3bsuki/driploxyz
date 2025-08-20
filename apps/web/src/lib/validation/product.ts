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
  price: z.number()
    .min(0.01, 'Price must be at least $0.01')
    .max(10000, 'Price cannot exceed $10,000'),
  
  shipping_cost: z.number()
    .min(0, 'Shipping cost must be 0 or positive')
    .max(100, 'Shipping cost cannot exceed $100'),
  
  tags: z.array(z.string().trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  
  use_premium_boost: z.boolean().default(false),
  
  // File handling (for validation purposes)
  photos_count: z.number()
    .min(1, 'At least one photo is required')
    .max(10, 'Maximum 10 photos allowed')
    .optional()
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
  clothing: [
    { value: 'XXS', label: 'XXS' },
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
    { value: '3XL', label: '3XL' }
  ],
  shoes: [
    { value: '5', label: 'US 5' },
    { value: '5.5', label: 'US 5.5' },
    { value: '6', label: 'US 6' },
    { value: '6.5', label: 'US 6.5' },
    { value: '7', label: 'US 7' },
    { value: '7.5', label: 'US 7.5' },
    { value: '8', label: 'US 8' },
    { value: '8.5', label: 'US 8.5' },
    { value: '9', label: 'US 9' },
    { value: '9.5', label: 'US 9.5' },
    { value: '10', label: 'US 10' },
    { value: '10.5', label: 'US 10.5' },
    { value: '11', label: 'US 11' },
    { value: '11.5', label: 'US 11.5' },
    { value: '12', label: 'US 12' }
  ],
  kids: [
    { value: '0-3M', label: '0-3 Months' },
    { value: '3-6M', label: '3-6 Months' },
    { value: '6-12M', label: '6-12 Months' },
    { value: '12-18M', label: '12-18 Months' },
    { value: '18-24M', label: '18-24 Months' },
    { value: '2T', label: '2T' },
    { value: '3T', label: '3T' },
    { value: '4T', label: '4T' },
    { value: '5', label: 'Size 5' },
    { value: '6', label: 'Size 6' },
    { value: '7', label: 'Size 7' },
    { value: '8', label: 'Size 8' },
    { value: '10', label: 'Size 10' },
    { value: '12', label: 'Size 12' },
    { value: '14', label: 'Size 14' }
  ]
} as const;