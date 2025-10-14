/**
 * Client-safe country configuration constants
 * This file can be safely imported by both client and server code
 */

import type { LanguageTag } from '@repo/i18n';

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

export const COUNTRY_FALLBACKS: Record<string, CountryCode> = {
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

export function normalizeCountryCode(code: string | null | undefined): CountryCode | null {
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

// Get country from subdomain - CLIENT-SAFE
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

// Check if country switch is needed - CLIENT-SAFE
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

// Format price for country - CLIENT-SAFE
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

// Convert price between countries - CLIENT-SAFE
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
