/**
 * API endpoint for validating product slugs
 * POST /api/validate-slug
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateProductSlug } from '$lib/server/slug-validation';
import { checkSlugExists } from '$lib/utils/slug';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

const limiter = new RateLimiter({
  IP: [50, 'h'], // 50 requests per hour per IP
  IPUA: [10, 'm'] // 10 requests per minute per IP+User Agent combo
});

export const POST: RequestHandler = async (event) => {
  const { request, locals } = event;
  
  // Rate limiting
  if (await limiter.isLimited(event)) {
    throw error(429, 'Too many validation requests');
  }

  const { supabase, session } = locals;
  
  // Authentication check - only authenticated users can validate slugs
  if (!session?.user) {
    throw error(401, 'Authentication required');
  }

  let requestData;
  try {
    requestData = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const { slug, productId, checkExistence = true } = requestData;

  if (!slug || typeof slug !== 'string') {
    throw error(400, 'Slug is required and must be a string');
  }

  try {
    // Validate slug format and reserved words
    const validation = validateProductSlug(slug.trim(), {
      throwOnError: false
    });

    const result = {
      valid: validation.valid,
      slug: validation.slug,
      errors: validation.errors,
      isReserved: validation.isReserved,
      hasFormatIssues: validation.hasFormatIssues,
      exists: false,
      available: false
    };

    // Check if slug exists in database if requested
    if (checkExistence && validation.valid) {
      try {
        result.exists = await checkSlugExists(supabase, slug, productId);
        result.available = !result.exists;
      } catch (dbError) {
        // Don't fail the entire request if database check fails
        console.error('Database slug check failed:', dbError);
        result.errors.push('Unable to check slug availability');
      }
    } else if (validation.valid) {
      // If format is valid but we're not checking existence, assume available
      result.available = true;
    }

    // Update overall validity based on existence check
    if (result.exists) {
      result.valid = false;
      result.errors.push('This URL slug is already in use');
    }

    return json(result);

  } catch (validationError) {
    console.error('Slug validation error:', validationError);
    throw error(500, 'Validation failed');
  }
};

// Optional: Add GET endpoint for simple slug checks
export const GET: RequestHandler = async ({ url, locals }) => {
  const { session } = locals;
  
  if (!session?.user) {
    throw error(401, 'Authentication required');
  }

  const slug = url.searchParams.get('slug');
  
  if (!slug) {
    throw error(400, 'Slug parameter is required');
  }

  // Simple validation without database check for GET requests
  const validation = validateProductSlug(slug, { throwOnError: false });

  return json({
    valid: validation.valid,
    slug: validation.slug,
    errors: validation.errors,
    isReserved: validation.isReserved,
    hasFormatIssues: validation.hasFormatIssues
  });
};