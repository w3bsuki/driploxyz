import type { RequestEvent } from '@sveltejs/kit';

export type Region = 'BG' | 'UK';

export interface GeoLocation {
  country: string;
  region: Region;
  currency: 'BGN' | 'GBP';
  locale: 'bg' | 'en';
}

/**
 * Detect user's region from IP address
 * Uses Vercel's geolocation headers or Cloudflare headers
 */
export function detectRegion(event: RequestEvent): GeoLocation {
  // First check subdomain - this is the strongest signal
  const subdomainRegion = detectRegionFromUrl(event.url);
  if (subdomainRegion) {
    return {
      country: subdomainRegion === 'UK' ? 'GB' : 'BG',
      region: subdomainRegion,
      currency: subdomainRegion === 'UK' ? 'GBP' : 'BGN',
      locale: subdomainRegion === 'UK' ? 'en' : 'bg'
    };
  }
  
  // Check cookie preference
  const cookieRegion = event.cookies.get('user_region');
  
  // Check for Vercel geolocation headers
  const vercelCountry = event.request.headers.get('x-vercel-ip-country');
  
  // Check for Cloudflare headers
  const cfCountry = event.request.headers.get('cf-ipcountry');
  
  // Check for custom header (for testing)
  const customRegion = event.request.headers.get('x-custom-region');
  
  // Priority: Subdomain > Cookie > Custom Header > Vercel > Cloudflare > Default
  const country = cookieRegion || customRegion || vercelCountry || cfCountry || 'BG';
  
  // Map country codes to our regions
  const isUK = ['GB', 'UK'].includes(country.toUpperCase());
  
  return {
    country: country.toUpperCase(),
    region: isUK ? 'UK' : 'BG',
    currency: isUK ? 'GBP' : 'BGN',
    locale: isUK ? 'en' : 'bg'
  };
}

/**
 * Set region preference in cookie
 */
export function setRegionPreference(event: RequestEvent, region: Region) {
  event.cookies.set('user_region', region, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });
}

/**
 * Get region-specific domain/subdomain
 */
export function getRegionUrl(region: Region, currentUrl: URL): string {
  const hostname = currentUrl.hostname;
  
  // Already on the correct subdomain?
  if (region === 'UK' && hostname.startsWith('uk.')) {
    return currentUrl.origin;
  }
  if (region === 'BG' && hostname.startsWith('bg.')) {
    return currentUrl.origin;
  }
  
  // Remove any existing subdomain
  const baseDomain = hostname.replace(/^(uk\.|bg\.)/, '');
  
  // Build the correct URL
  if (region === 'UK') {
    return `${currentUrl.protocol}//uk.${baseDomain}`;
  } else if (region === 'BG') {
    return `${currentUrl.protocol}//bg.${baseDomain}`;
  }
  
  // Default (no subdomain)
  return `${currentUrl.protocol}//${baseDomain}`;
}

/**
 * Detect region from subdomain
 */
export function detectRegionFromUrl(url: URL): Region | null {
  const hostname = url.hostname;
  
  if (hostname.startsWith('uk.')) {
    return 'UK';
  }
  if (hostname.startsWith('bg.')) {
    return 'BG';
  }
  
  return null;
}

/**
 * Currency formatter for region
 */
export function formatCurrency(amount: number, region: Region): string {
  if (region === 'UK') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency', 
    currency: 'BGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}