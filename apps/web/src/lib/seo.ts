import type { RequestEvent } from '@sveltejs/kit';

interface HreflangEntry {
  hrefLang: string;
  href: string;
}

interface SeoData {
  canonicalHref: string;
  hreflangs: HreflangEntry[];
}

/**
 * Generate canonical URL and hreflang entries for SEO
 * 
 * @param eventOrUrl - SvelteKit RequestEvent or URL object
 * @returns Canonical href and hreflang entries
 */
export function getCanonicalAndHreflang(eventOrUrl: RequestEvent | URL): SeoData {
  const url = eventOrUrl instanceof URL ? eventOrUrl : eventOrUrl.url;
  const pathname = url.pathname;
  
  // Extract locale prefix if present
  const match = pathname.match(/^\/(uk|bg)(\/.*)?$/);
  const cleanPath = match ? (match[2] || '/') : pathname;
  
  // Base URL without locale prefix
  const baseUrl = `${url.protocol}//${url.host}`;
  const cleanUrl = `${baseUrl}${cleanPath}`;
  
  // Default locale is Bulgarian (no prefix)
  const canonicalHref = cleanUrl;
  
  // Generate hreflang entries
  const hreflangs: HreflangEntry[] = [
    {
      hrefLang: 'bg',
      href: cleanUrl
    },
    {
      hrefLang: 'en-GB',
      href: `${baseUrl}/uk${cleanPath}`
    }
  ];
  
  return {
    canonicalHref,
    hreflangs
  };
}