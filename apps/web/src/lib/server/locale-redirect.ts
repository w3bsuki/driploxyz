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
      try {
        redirect(308, rest);
      } catch (error) {
        // Re-throw actual redirects (they're Response objects)
        if (error instanceof Response && error.status >= 300 && error.status < 400) {
          throw error;
        }
        // Log and handle unexpected errors
        console.error('Locale redirect error:', error, { prefix, rest });
        // Continue without redirect if it fails
        return;
      }
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
    try {
      redirect(308, cleanPath);
    } catch (error) {
      // Re-throw actual redirects (they're Response objects)
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      // Log and handle unexpected errors
      console.error('Path cleanup redirect error:', error, { original: pathname, clean: cleanPath });
      // Continue without redirect if it fails
      return;
    }
  }
}