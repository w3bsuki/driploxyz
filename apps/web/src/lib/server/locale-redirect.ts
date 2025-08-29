import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

/**
 * Handle unknown locale prefixes by redirecting to the default locale
 * This prevents 404s for paths like /es/products or /fr/about
 */
export async function handleUnknownLocales(event: RequestEvent): Promise<void> {
  const pathname = event.url.pathname;
  
  // Check for any two-letter locale prefix that's not uk or bg
  const unknownLocaleMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/i);
  
  if (unknownLocaleMatch) {
    const prefix = unknownLocaleMatch[1]?.toLowerCase();
    const rest = unknownLocaleMatch[2] || '/';
    
    // If it's not one of our supported locales, redirect
    if (prefix !== 'uk' && prefix !== 'bg') {
      // Redirect to the path without the unknown prefix (defaults to Bulgarian)
      // Use 308 Permanent Redirect to preserve the HTTP method
      throw redirect(308, rest);
    }
  }
  
  // Also handle double slashes and trailing slashes (except for root)
  let cleanPath = pathname;
  
  // Remove double slashes
  cleanPath = cleanPath.replace(/\/+/g, '/');
  
  // Remove trailing slash (except for root)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  
  // If the path was cleaned, redirect
  if (cleanPath !== pathname) {
    throw redirect(308, cleanPath);
  }
}