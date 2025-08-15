import * as i18n from '@repo/i18n';

/**
 * Format price with proper locale-specific formatting
 * For Bulgarian: "123 лв" instead of "лв.123.00"
 * For English: "$123" instead of "$123.00" (for whole numbers)
 */
export function formatPrice(price: number, locale?: string): string {
  const currentLocale = locale || i18n.languageTag();
  
  // Bulgarian formatting
  if (currentLocale === 'bg') {
    const roundedPrice = Math.round(price);
    return `${roundedPrice} ${i18n.common_currency()}`;
  }
  
  // Russian formatting
  if (currentLocale === 'ru') {
    const roundedPrice = Math.round(price);
    return `${roundedPrice} ₽`;
  }
  
  // Ukrainian formatting  
  if (currentLocale === 'ua') {
    const roundedPrice = Math.round(price);
    return `${roundedPrice} ₴`;
  }
  
  // Default English formatting
  const hasDecimals = price % 1 !== 0;
  const formattedPrice = hasDecimals ? price.toFixed(2) : Math.round(price).toString();
  return `$${formattedPrice}`;
}

/**
 * Parse a price string back to number
 */
export function parsePrice(priceString: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = priceString.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}