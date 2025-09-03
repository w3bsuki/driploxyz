/**
 * Comprehensive slug generation system for Driplo marketplace
 * Production-ready with collision handling and reserved word validation
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Reserved slug patterns that cannot be used for products
 * These are critical routes and system endpoints
 */
export const RESERVED_SLUGS = new Set([
  // Core routes
  'api',
  'auth',
  'category',
  'search',
  'signup',
  'login',
  'logout',
  'profile',
  'wishlist',
  'checkout',
  'terms',
  'privacy',
  'sitemap.xml',
  'robots.txt',
  
  // Admin routes
  'admin',
  'dashboard',
  'sell',
  'favorites',
  'onboarding',
  'welcome',
  'settings',
  'upgrade',
  'orders',
  'order-management',
  
  // API endpoints
  'subscriptions',
  'webhooks',
  'payments',
  'uploads',
  'images',
  'notifications',
  
  // System pages
  'about',
  'contact',
  'help',
  'support',
  'faq',
  'legal',
  'cookies',
  'accessibility',
  'security',
  'status',
  'health',
  
  // Reserved patterns
  'www',
  'mail',
  'ftp',
  'test',
  'staging',
  'dev',
  'development',
  'production',
  'prod',
  'demo',
  'sandbox',
  
  // Short/ambiguous slugs that should be reserved
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'new', 'old', 'hot', 'top', 'best', 'popular', 'trending', 'featured', 'latest'
]);

/**
 * Configuration for slug generation
 */
export interface SlugConfig {
  /**
   * Maximum length of the base slug (before collision suffix)
   * @default 60
   */
  maxLength?: number;
  
  /**
   * Length of collision suffix (e.g., -x7y3k2)
   * @default 6
   */
  collisionSuffixLength?: number;
  
  /**
   * Custom reserved words to add to the default set
   */
  additionalReserved?: string[];
  
  /**
   * Whether to allow reserved words (dangerous, use with caution)
   * @default false
   */
  allowReserved?: boolean;
}

/**
 * Result of slug generation
 */
export interface SlugGenerationResult {
  slug: string;
  isUnique: boolean;
  hasCollisionSuffix: boolean;
  attempts: number;
}

/**
 * Generate a random alphanumeric string for collision suffixes
 */
function generateRandomId(length: number = 6): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

/**
 * Generate a clean, URL-friendly slug from text
 */
export function createSlug(text: string, config: SlugConfig = {}): string {
  const { maxLength = 60 } = config;
  
  if (!text || typeof text !== 'string') {
    return `item-${generateRandomId(8)}`;
  }
  
  // Convert to slug format
  let slug = text
    .toLowerCase()
    .trim()
    // Remove special characters but keep letters, numbers, spaces, and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces or underscores with single dash
    .replace(/[\s_]+/g, '-')
    // Replace multiple dashes with single dash
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Trim to max length
    .substring(0, maxLength);
  
  // Ensure minimum length (fallback to random if too short)
  if (slug.length < 3) {
    return `item-${generateRandomId(6)}`;
  }
  
  return slug;
}

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string, additionalReserved: string[] = []): boolean {
  const allReserved = new Set([...RESERVED_SLUGS, ...additionalReserved]);
  return allReserved.has(slug.toLowerCase());
}

/**
 * Generate a collision suffix
 */
export function generateCollisionSuffix(length: number = 6): string {
  return generateRandomId(length);
}

/**
 * Check if a slug exists in the database
 */
export async function checkSlugExists(
  supabase: SupabaseClient,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const query = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug);
    
  if (excludeId) {
    query.neq('id', excludeId);
  }
  
  const { count, error } = await query;
  
  if (error) {
    throw new Error(`Failed to check slug existence: ${error.message}`);
  }
  
  return (count || 0) > 0;
}

/**
 * Generate a unique slug with collision handling
 */
export async function generateUniqueSlug(
  supabase: SupabaseClient,
  text: string,
  config: SlugConfig = {},
  excludeId?: string
): Promise<SlugGenerationResult> {
  const {
    maxLength = 60,
    collisionSuffixLength = 6,
    additionalReserved = [],
    allowReserved = false
  } = config;
  
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loops
  
  // Generate base slug
  const baseSlug = createSlug(text, { maxLength });
  let currentSlug = baseSlug;
  
  // Check if base slug is reserved
  if (!allowReserved && isReservedSlug(currentSlug, additionalReserved)) {
    // If reserved, immediately add a suffix
    const suffix = generateCollisionSuffix(collisionSuffixLength);
    currentSlug = `${baseSlug}-${suffix}`;
    attempts = 1;
  }
  
  // Check for database collisions and resolve them
  while (attempts < maxAttempts) {
    const exists = await checkSlugExists(supabase, currentSlug, excludeId);
    
    if (!exists) {
      return {
        slug: currentSlug,
        isUnique: true,
        hasCollisionSuffix: attempts > 0,
        attempts: attempts + 1
      };
    }
    
    // Generate new slug with collision suffix
    attempts++;
    const suffix = generateCollisionSuffix(collisionSuffixLength);
    
    // Ensure the slug with suffix doesn't exceed reasonable length
    const maxBaseLength = maxLength - collisionSuffixLength - 1; // -1 for the dash
    const trimmedBase = baseSlug.substring(0, maxBaseLength);
    currentSlug = `${trimmedBase}-${suffix}`;
  }
  
  // Fallback: if we still can't find a unique slug, use a fully random one
  const fallbackSlug = `product-${generateRandomId(12)}`;
  
  return {
    slug: fallbackSlug,
    isUnique: true,
    hasCollisionSuffix: true,
    attempts: maxAttempts + 1
  };
}

/**
 * Validate a slug meets all requirements
 */
export function validateSlug(
  slug: string, 
  additionalReserved: string[] = [],
  allowReserved: boolean = false
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Length validation
  if (slug.length < 3) {
    errors.push('Slug must be at least 3 characters long');
  }
  if (slug.length > 100) {
    errors.push('Slug must be less than 100 characters long');
  }
  
  // Character validation
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
  }
  
  // Pattern validation
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug cannot start or end with a hyphen');
  }
  
  if (slug.includes('--')) {
    errors.push('Slug cannot contain consecutive hyphens');
  }
  
  // Reserved word validation
  if (!allowReserved && isReservedSlug(slug, additionalReserved)) {
    errors.push('Slug is reserved and cannot be used');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}