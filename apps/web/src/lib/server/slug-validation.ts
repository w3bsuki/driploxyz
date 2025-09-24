/**
 * Server-side slug validation middleware for Driplo marketplace
 * Ensures no reserved words are used as product slugs
 */

import { error } from '@sveltejs/kit';
import { validateSlug, isReservedSlug, RESERVED_SLUGS } from '$lib/utils/slug';
import type { RequestHandler, RequestEvent } from '@sveltejs/kit';

/**
 * Configuration for slug validation
 */
export interface SlugValidationConfig {
  /**
   * Whether to throw an error or return validation result
   * @default true
   */
  throwOnError?: boolean;
  
  /**
   * Custom error message for reserved slugs
   */
  reservedErrorMessage?: string;
  
  /**
   * Custom error message for invalid slug format
   */
  formatErrorMessage?: string;
  
  /**
   * Additional reserved words beyond the default set
   */
  additionalReserved?: string[];
}

/**
 * Validation result for slug checking
 */
export interface SlugValidationResult {
  valid: boolean;
  slug: string;
  errors: string[];
  isReserved: boolean;
  hasFormatIssues: boolean;
}

/**
 * Validate a slug for server-side use
 */
export function validateProductSlug(
  slug: string,
  config: SlugValidationConfig = {}
): SlugValidationResult {
  const {
    throwOnError = false,
    reservedErrorMessage = 'This URL slug is reserved and cannot be used',
    additionalReserved = []
  } = config;
  
  const result: SlugValidationResult = {
    valid: true,
    slug,
    errors: [],
    isReserved: false,
    hasFormatIssues: false
  };
  
  // Check if slug is reserved
  if (isReservedSlug(slug, additionalReserved)) {
    result.valid = false;
    result.isReserved = true;
    result.errors.push(reservedErrorMessage);
  }
  
  // Validate slug format
  const formatValidation = validateSlug(slug, additionalReserved, false);
  if (!formatValidation.valid) {
    result.valid = false;
    result.hasFormatIssues = true;
    result.errors.push(...formatValidation.errors);
  }
  
  if (!result.valid && throwOnError) {
    throw error(400, 'Invalid slug: ' + result.errors.join('; '));
  }
  
  return result;
}

/**
 * SvelteKit request handler for slug validation
 * Use this in API routes or page server functions
 */
export function createSlugValidationHandler(
  config: SlugValidationConfig = {}
): RequestHandler {
  return async ({ params, url }) => {
    const slug = params.slug || url.searchParams.get('slug');
    
    if (!slug) {
      throw error(400, 'Slug parameter is required');
    }
    
    const validation = validateProductSlug(slug, {
      ...config,
      throwOnError: true
    });
    
    // If we get here, validation passed
    return new Response(JSON.stringify({ 
      valid: true, 
      slug: validation.slug 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  };
}

/**
 * Middleware function to validate product slugs in form submissions
 * Use this in actions that create or update products
 */
export function validateSlugInFormData(
  formData: FormData,
  fieldName: string = 'slug',
  config: SlugValidationConfig = {}
): SlugValidationResult {
  const slug = formData.get(fieldName) as string;
  
  if (!slug || typeof slug !== 'string') {
    const result: SlugValidationResult = {
      valid: false,
      slug: '',
      errors: ['Slug is required'],
      isReserved: false,
      hasFormatIssues: true
    };
    
    if (config.throwOnError) {
      throw error(400, 'Slug is required');
    }
    
    return result;
  }
  
  return validateProductSlug(slug, config);
}

/**
 * Check if a request is attempting to access a reserved route
 * Use this in hooks.server.ts or route handlers
 */
export function isRequestForReservedRoute(pathname: string): boolean {
  // Remove leading slash and any query parameters
  const cleanPath = pathname.replace(/^\/+/, '').split('?')[0]?.split('#')[0];
  
  if (!cleanPath) return false;
  
  // Check if the first segment matches any reserved slug
  const firstSegment = cleanPath.split('/')[0];
  
  if (!firstSegment) return false;
  
  return RESERVED_SLUGS.has(firstSegment.toLowerCase());
}

/**
 * Route protection hook - use in hooks.server.ts
 * This ensures reserved routes are properly handled before checking for products
 */
export function createReservedRouteHandler() {
  return async ({ event, resolve }: { event: RequestEvent; resolve: (event: RequestEvent) => Promise<Response> }) => {
    const { pathname } = event.url;
    
    // If this is a reserved route, let the normal routing handle it
    if (isRequestForReservedRoute(pathname)) {
      return resolve(event);
    }
    
    // For dynamic product routes, you might want to check if the slug exists
    // and return 404 if it doesn't, but that's handled by the page load functions
    
    return resolve(event);
  };
}

/**
 * Utility to get all reserved slugs (for documentation or debugging)
 */
export function getAllReservedSlugs(): string[] {
  return Array.from(RESERVED_SLUGS).sort();
}

/**
 * Utility to check if a slug would conflict with existing routes
 * This goes beyond the basic reserved list to check actual route patterns
 */
export function wouldSlugConflictWithRoutes(
  slug: string,
  routePatterns: string[] = []
): boolean {
  // Check against basic reserved list
  if (isReservedSlug(slug)) {
    return true;
  }
  
  // Check against provided route patterns
  for (const pattern of routePatterns) {
    if (pattern === slug || pattern.startsWith(slug + '/')) {
      return true;
    }
  }
  
  // Additional checks for common patterns
  const problematicPatterns = [
    // API-like patterns
    /^v\d+$/,           // v1, v2, etc.
    /^api-/,            // api-something
    /^admin-/,          // admin-something
    /^auth-/,           // auth-something
    
    // File-like patterns  
    /\.(xml|txt|json|js|css|html)$/,
    
    // System-like patterns
    /^(test|staging|dev|prod)-/,
    /^_/,               // underscore prefix
    /^-/,               // hyphen prefix
    /--/,               // double hyphen
  ];
  
  for (const pattern of problematicPatterns) {
    if (pattern.test(slug)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Development helper to list potential conflicts
 * Only use in development environment
 */
export function debugSlugConflicts(slug: string): {
  isReserved: boolean;
  reservedReason?: string;
  hasFormatIssues: boolean;
  formatIssues: string[];
  recommendations: string[];
} {
  const validation = validateSlug(slug);
  const isReserved = isReservedSlug(slug);
  
  const result = {
    isReserved,
    reservedReason: isReserved ? 'Matches reserved word list' : undefined,
    hasFormatIssues: !validation.valid,
    formatIssues: validation.errors,
    recommendations: [] as string[]
  };

  if (isReserved) {
    result.recommendations.push('Try adding a descriptive prefix like "item-" or "product-"');
  }
  
  if (wouldSlugConflictWithRoutes(slug)) {
    result.recommendations.push('This slug might conflict with application routes');
  }
  
  if (slug.length < 5) {
    result.recommendations.push('Consider using a longer, more descriptive slug');
  }
  
  if (!result.isReserved && result.hasFormatIssues) {
    result.recommendations.push('Fix format issues: use only lowercase letters, numbers, and hyphens');
  }
  
  return result;
}