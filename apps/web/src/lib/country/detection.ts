import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { COOKIES } from '$lib/cookies/production-cookie-system';

export type CountryCode = 'BG' | 'GB' | 'US' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'PL' | 'RO';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  locale: string;
  domain?: string;
  defaultShipping?: number;
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  BG: {
    code: 'BG',
    name: 'Bulgaria',
    currency: 'BGN',
    locale: 'bg',
    defaultShipping: 5
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    locale: 'en',
    domain: 'driplo.uk',
    defaultShipping: 3.99
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    locale: 'en',
    domain: 'driplo.us',
    defaultShipping: 4.99
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    locale: 'en',
    defaultShipping: 4.99
  },
  FR: {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    locale: 'en',
    defaultShipping: 4.99
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    locale: 'en',
    defaultShipping: 4.99
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    locale: 'en',
    defaultShipping: 4.99
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    locale: 'en',
    defaultShipping: 4.99
  },
  PL: {
    code: 'PL',
    name: 'Poland',
    currency: 'PLN',
    locale: 'en',
    defaultShipping: 20
  },
  RO: {
    code: 'RO',
    name: 'Romania',
    currency: 'RON',
    locale: 'en',
    defaultShipping: 20
  }
};

// Get country from subdomain
export function getCountryFromDomain(hostname: string): CountryCode | null {
  // Check for subdomains first - be precise with matching
  if (hostname.startsWith('uk.')) return 'GB';
  if (hostname.startsWith('bg.')) return 'BG';
  if (hostname.startsWith('us.')) return 'US';
  if (hostname.startsWith('de.')) return 'DE';
  
  // Check for country TLDs
  if (hostname.endsWith('.uk')) return 'GB';
  if (hostname.endsWith('.bg')) return 'BG';
  if (hostname.endsWith('.us')) return 'US';
  if (hostname.endsWith('.de')) return 'DE';
  
  return null;
}

// Server-side country detection from IP
export async function detectCountryFromIP(event: RequestEvent): Promise<CountryCode | null> {
  try {
    // Get real IP from various headers (works with Vercel, Cloudflare, etc.)
    let ip: string | null = null;

    try {
      ip = event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           event.request.headers.get('x-real-ip') ||
           event.request.headers.get('cf-connecting-ip') ||
           event.getClientAddress();
    } catch (clientAddressError) {
      // In development, getClientAddress might fail
      console.debug('Could not get client address:', clientAddressError);
      ip = null;
    }

    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      // Local development
      return dev ? 'BG' : null;
    }

    // Use ipapi.co for geolocation (free tier)
    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });

    if (!response.ok) return null;

    const country = (await response.text()).trim().toUpperCase();
    
    // Check if it's a supported country
    if (country in COUNTRY_CONFIGS) {
      return country as CountryCode;
    }

    // Map unsupported countries to nearest supported ones
    const countryMappings: Record<string, CountryCode> = {
      // UK variations
      'UK': 'GB',
      'IM': 'GB', // Isle of Man
      'JE': 'GB', // Jersey
      'GG': 'GB', // Guernsey
      
      // Eastern Europe to Bulgaria
      'MK': 'BG', // North Macedonia
      'RS': 'BG', // Serbia
      'GR': 'BG', // Greece
      'TR': 'BG', // Turkey
      
      // Baltic states to Bulgaria  
      'LV': 'BG', // Latvia
      'LT': 'BG', // Lithuania
      'EE': 'BG', // Estonia
      'BY': 'BG', // Belarus
      'KZ': 'BG', // Kazakhstan
      'RU': 'BG', // Russia
      'UA': 'BG', // Ukraine
      
      // Western Europe to UK
      'IE': 'GB', // Ireland
      'BE': 'GB', // Belgium
      'LU': 'GB', // Luxembourg
      'CH': 'GB', // Switzerland
      'AT': 'DE', // Austria to Germany
      
      // Scandinavian to UK
      'NO': 'GB', // Norway
      'SE': 'GB', // Sweden
      'DK': 'GB', // Denmark
      'FI': 'GB', // Finland
      'IS': 'GB', // Iceland
    };

    return countryMappings[country] || 'BG'; // Default to Bulgaria
  } catch (error) {
    console.error('Failed to detect country from IP:', error);
    return null;
  }
}

// Get country from cookies
export function getCountryFromCookie(event: RequestEvent): CountryCode | null {
  const country = event.cookies.get(COOKIES.COUNTRY) || event.cookies.get('country');
  if (country && country in COUNTRY_CONFIGS) {
    return country as CountryCode;
  }
  return null;
}

// Set country in cookie
export function setCountryCookie(event: RequestEvent, country: CountryCode): void {
  event.cookies.set(COOKIES.COUNTRY, country, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    httpOnly: false,
    sameSite: 'lax',
    secure: !dev
  });
}

// Get user's country with fallback chain
export async function getUserCountry(event: RequestEvent): Promise<CountryCode> {
  // 1. Check URL parameter (highest priority for testing)
  const urlCountry = event.url.searchParams.get('country');
  if (urlCountry && urlCountry in COUNTRY_CONFIGS) {
    const country = urlCountry as CountryCode;
    setCountryCookie(event, country);
    return country;
  }
  
  // 2. Check Vercel host-based headers (from subdomain mapping)
  const headerCountry = event.request.headers.get('x-country');
  if (headerCountry && headerCountry in COUNTRY_CONFIGS) {
    const country = headerCountry as CountryCode;
    setCountryCookie(event, country);
    return country;
  }
  
  // 3. Check subdomain/domain (fallback if headers not set)
  const domainCountry = getCountryFromDomain(event.url.hostname);
  if (domainCountry) {
    setCountryCookie(event, domainCountry);
    return domainCountry;
  }

  // 4. Check cookie
  const cookieCountry = getCountryFromCookie(event);
  if (cookieCountry) {
    return cookieCountry;
  }

  // 5. Check Vercel geo headers
  const vercelCountry = event.request.headers.get('x-vercel-ip-country');
  if (vercelCountry && vercelCountry in COUNTRY_CONFIGS) {
    const country = vercelCountry as CountryCode;
    setCountryCookie(event, country);
    return country;
  }

  // 6. Detect from IP
  const ipCountry = await detectCountryFromIP(event);
  if (ipCountry) {
    setCountryCookie(event, ipCountry);
    return ipCountry;
  }

  // 7. Default to Bulgaria
  return 'BG';
}

// Check if country switch is needed
export function shouldSuggestCountrySwitch(
  currentCountry: CountryCode,
  detectedCountry: CountryCode | null,
  dismissed: boolean = false
): boolean {
  if (dismissed) return false;
  if (!detectedCountry) return false;
  if (currentCountry === detectedCountry) return false;
  
  // Only suggest switch for major country changes
  const majorSwitches = new Set([
    'BG-GB', 'GB-BG',
    'BG-US', 'US-BG',
    'GB-US', 'US-GB'
  ]);
  
  return majorSwitches.has(`${currentCountry}-${detectedCountry}`);
}

// Format price for country
export function formatPriceForCountry(price: number, country: CountryCode): string {
  const config = COUNTRY_CONFIGS[country];
  const formatter = new Intl.NumberFormat(config.locale === 'bg' ? 'bg-BG' : 'en-GB', {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(price);
}

// Convert price between countries (basic conversion, should use real rates in production)
export function convertPrice(price: number, fromCountry: CountryCode, toCountry: CountryCode): number {
  if (fromCountry === toCountry) return price;
  
  // Basic conversion rates (should be fetched from API in production)
  const rates: Record<string, number> = {
    'BGN': 1,
    'GBP': 2.3,
    'USD': 1.8,
    'EUR': 1.95,
    'PLN': 0.45,
    'RON': 0.39
  };
  
  const fromConfig = COUNTRY_CONFIGS[fromCountry];
  const toConfig = COUNTRY_CONFIGS[toCountry];
  
  if (!fromConfig || !toConfig) {
    return price; // Return original price if configs not found
  }
  
  const fromCurrency = fromConfig.currency;
  const toCurrency = toConfig.currency;
  
  if (!rates?.[fromCurrency] || !rates?.[toCurrency]) {
    return price; // Return original price if rates not found
  }
  
  const priceInBGN = price / rates[fromCurrency];
  return priceInBGN * rates[toCurrency];
}