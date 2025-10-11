import slugify from 'slugify';

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
 * Generate a clean, URL-friendly slug from text
 */
export function createSlug(text: string, config: SlugConfig = {}): string {
  const { maxLength = 60 } = config;

  // Use slugify with comprehensive options
  const baseSlug = slugify(text, {
    lower: true,           // Convert to lowercase
    strict: true,          // Strip special characters except replacement
    remove: /[*+~.()'"!:@]/g, // Remove these specific characters
    replacement: '-',      // Replace spaces with -
    trim: true            // Trim leading/trailing replacement chars
  });

  // Additional cleaning for edge cases
  const cleanedSlug = baseSlug
    .replace(/--+/g, '-')           // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '')          // Remove leading/trailing dashes
    .substring(0, maxLength);       // Trim to max length

  // Ensure minimum length (fallback to random if too short)
  if (cleanedSlug.length < 3) {
    return `item-${generateCollisionSuffix(6)}`;
  }

  return cleanedSlug;
}

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string, additionalReserved: string[] = []): boolean {
  const allReserved = new Set([...RESERVED_SLUGS, ...additionalReserved]);
  return allReserved.has(slug.toLowerCase());
}

/**
 * Generate a collision suffix using nanoid
 */
export function generateCollisionSuffix(length: number = 6): string {
  // Use nanoid with a custom alphabet that's URL-safe and readable
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  return customAlphabet(alphabet)(length);
}

/**
 * Custom alphabet function for nanoid
 */
function customAlphabet(alphabet: string) {
  return (size: number) => {
    let id = '';
    for (let i = 0; i < size; i++) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
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