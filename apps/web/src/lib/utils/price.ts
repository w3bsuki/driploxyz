import * as i18n from '@repo/i18n';

// Currency mappings for each locale
const CURRENCY_MAP = {
  'en': 'USD',
  'bg': 'BGN'
} as const;

// Locale mappings for Intl formatting
const LOCALE_MAP = {
  'en': 'en-US',
  'bg': 'bg-BG'
} as const;

/**
 * Format price using Intl.NumberFormat for proper locale-specific formatting
 * Supports different currencies and locales with proper number formatting
 */
export function formatPrice(price: number, locale?: string): string {
  const currentLocale = locale || i18n.getLocale() as keyof typeof CURRENCY_MAP;
  
  // For Bulgarian, use simple format: "5лв" instead of "лв 5.00"
  if (currentLocale === 'bg') {
    const roundedPrice = price % 1 === 0 ? Math.round(price) : price.toFixed(2);
    return `${roundedPrice}лв`;
  }
  
  const currency = CURRENCY_MAP[currentLocale as keyof typeof CURRENCY_MAP] || 'USD';
  const intlLocale = LOCALE_MAP[currentLocale as keyof typeof LOCALE_MAP] || 'en-US';
  
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(price);
  } catch {
    // Fallback to simple formatting if Intl fails
    return formatPriceFallback(price, currentLocale);
  }
}

/**
 * Fallback currency formatting if Intl.NumberFormat fails
 */
function formatPriceFallback(price: number, locale: string): string {
  const roundedPrice = price % 1 === 0 ? Math.round(price) : price.toFixed(2);
  
  switch (locale) {
    case 'bg': return `${roundedPrice}лв`;
    default: return `$${roundedPrice}`;
  }
}

/**
 * Format price range with proper currency formatting
 */
export function formatPriceRange(minPrice: number, maxPrice: number, locale?: string): string {
  const min = formatPrice(minPrice, locale);
  const max = formatPrice(maxPrice, locale);
  return `${min} - ${max}`;
}

/**
 * Parse a price string back to number
 */
export function parsePrice(priceString: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = priceString.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}