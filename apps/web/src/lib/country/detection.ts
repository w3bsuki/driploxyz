import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getOrSetClientIp } from '$lib/server/client-ip';
import type { LanguageTag } from '@repo/i18n';
import { COOKIES } from '$lib/cookies/constants';

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

const COUNTRY_FALLBACKS: Record<string, CountryCode> = {
  // UK variations
  UK: 'GB',
  IM: 'GB',
  JE: 'GB',
  GG: 'GB',

  // Eastern Europe to Bulgaria
  MK: 'BG',
  RS: 'BG',
  GR: 'BG',
  TR: 'BG',

  // Baltic states to Bulgaria
  LV: 'BG',
  LT: 'BG',
  EE: 'BG',
  BY: 'BG',
  KZ: 'BG',
  RU: 'BG',
  UA: 'BG',

  // Western Europe to UK
  IE: 'GB',
  BE: 'GB',
  LU: 'GB',
  CH: 'GB',
  AT: 'DE',

  // Scandinavian to UK
  NO: 'GB',
  SE: 'GB',
  DK: 'GB',
  FI: 'GB',
  IS: 'GB'
};

function normalizeCountryCode(code: string | null | undefined): CountryCode | null {
  if (!code) return null;
  const upper = code.toUpperCase();
  if (upper in COUNTRY_CONFIGS) {
    return upper as CountryCode;
  }
  if (upper in COUNTRY_FALLBACKS) {
    const fallback = COUNTRY_FALLBACKS[upper];
    if (fallback) {
      return fallback;
    }
  }
  return null;
}

export function getLocaleForCountry(country: CountryCode | null | undefined): LanguageTag {
  if (!country) return 'bg';
  const config = COUNTRY_CONFIGS[country];
  if (!config) return 'bg';
  return (config.locale as LanguageTag) ?? 'bg';
}

export function detectCountryFromHeaders(request: Request): CountryCode | null {
  const headerCandidates = [
    request.headers.get('cf-ipcountry'),
    request.headers.get('cf-ip-country'),
    request.headers.get('x-country'),
    request.headers.get('x-geo-country'),
    request.headers.get('x-vercel-ip-country'),
    request.headers.get('x-country-code')
  ];

  for (const candidate of headerCandidates) {
    const normalized = normalizeCountryCode(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

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

    // Try headers first (most reliable in production environments)
    ip = event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    if (!ip) ip = event.request.headers.get('x-real-ip') || null;
    if (!ip) ip = event.request.headers.get('cf-connecting-ip') || null;

    // Only try to resolve from event once if we don't have an IP from headers
    if (!ip) {
      ip = getOrSetClientIp(event) || null;
      if (!ip) return dev ? 'BG' : null;
    }

    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      // Local development or loopback address
      return dev ? 'BG' : null;
    }

    // Use ipapi.co for geolocation (free tier)
    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });

    if (!response.ok) return null;

    const country = normalizeCountryCode((await response.text()).trim());
    if (country) {
      return country;
    }

    return 'BG'; // Default to Bulgaria when location is unsupported
  } catch {
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
  let urlCountry: string | null = null;
  try {
    urlCountry = event.url.searchParams.get('country');
  } catch {
    // Handle prerendering context where searchParams is not available
    urlCountry = null;
  }
  if (urlCountry && urlCountry in COUNTRY_CONFIGS) {
    const country = urlCountry as CountryCode;
    setCountryCookie(event, country);
    return country;
  }
  
  // 2. Check Vercel host-based headers (from subdomain mapping)
  const headerCountry = detectCountryFromHeaders(event.request);
  if (headerCountry) {
    setCountryCookie(event, headerCountry);
    return headerCountry;
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