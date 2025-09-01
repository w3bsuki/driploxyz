import type { ParamMatcher } from '@sveltejs/kit';

/**
 * Parameter matcher for category slugs
 * Validates that category segments match expected patterns:
 * - Level 1: women, men, kids, unisex
 * - Level 2: clothing, shoes, accessories, bags
 * - Level 3: any valid slug pattern (a-z, 0-9, hyphens)
 */
export const match = ((param) => {
  // Allow empty segments (handled by the load function)
  if (!param || param.trim() === '') {
    return true;
  }
  
  // Basic slug validation: lowercase letters, numbers, hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  
  if (!slugPattern.test(param)) {
    return false;
  }
  
  // Check length constraints
  if (param.length > 50) {
    return false;
  }
  
  // Prevent common reserved words
  const reservedWords = ['api', 'admin', 'www', 'ftp', 'mail', 'search', 'help', 'about', 'contact', 'terms', 'privacy'];
  if (reservedWords.includes(param)) {
    return false;
  }
  
  return true;
}) satisfies ParamMatcher;