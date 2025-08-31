/**
 * Link helper for localized URLs
 * 
 * Generates the correct path prefix based on locale:
 * - Bulgarian (bg): no prefix (default)
 * - English (en): /uk prefix
 */

export type Locale = 'bg' | 'en';

/**
 * Generate a localized URL path
 * 
 * @param path - The path to localize (should start with /)
 * @param locale - The target locale
 * @returns Localized path with appropriate prefix
 * 
 * @example
 * linkLocale('/products', 'bg') // '/products'
 * linkLocale('/products', 'en') // '/uk/products'
 * linkLocale('/', 'en') // '/uk'
 */
export function linkLocale(path: string, locale: Locale): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Bulgarian is default (no prefix)
  if (locale === 'bg') {
    return normalizedPath;
  }
  
  // English uses /uk prefix
  if (locale === 'en') {
    return `/uk${normalizedPath === '/' ? '' : normalizedPath}`;
  }
  
  // Fallback to no prefix
  return normalizedPath;
}