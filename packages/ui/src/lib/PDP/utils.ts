/**
 * Product Detail Page Utility Functions
 * 
 * Shared utility functions for PDP components including price formatting,
 * condition translation, category handling, and other common operations.
 */

import type { 
  ProductData, 
  ReviewData, 
  CurrencyCode, 
  PriceFormatOptions,
  ProductCondition 
} from '../types/product';

// Price Formatting Utilities

/**
 * Format price with proper locale and currency support
 */
export function formatPrice(
  price: number, 
  options: Partial<PriceFormatOptions> = {}
): string {
  const {
    currency = 'EUR',
    locale,
    showSymbol = true,
    precision
  } = options;
  
  // Auto-detect locale if not provided
  const detectedLocale = locale || detectLocale(currency);
  
  // Bulgarian Lev special handling
  if (currency === 'BGN' || detectedLocale === 'bg-BG') {
    const roundedPrice = precision !== undefined 
      ? Number(price.toFixed(precision))
      : (price % 1 === 0 ? Math.round(price) : price);
    
    return showSymbol ? `${roundedPrice}лв` : String(roundedPrice);
  }
  
  // Standard Intl.NumberFormat for other currencies
  try {
    const formatter = new Intl.NumberFormat(detectedLocale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency,
      minimumFractionDigits: precision !== undefined ? precision : (price % 1 === 0 ? 0 : 2),
      maximumFractionDigits: precision !== undefined ? precision : 2
    });
    
    return formatter.format(price);
  } catch (error) {
    console.warn('Price formatting failed, using fallback:', error);
    return fallbackPriceFormat(price, currency, showSymbol, precision);
  }
}

/**
 * Detect appropriate locale based on currency
 */
function detectLocale(currency: CurrencyCode): string {
  // Try to get from global i18n context first
  try {
    const globalI18n = (globalThis as any)?.i18n;
    if (globalI18n?.getLocale) {
      const currentLocale = globalI18n.getLocale();
      return currentLocale === 'bg' ? 'bg-BG' : 'en-GB';
    }
  } catch {
    // Continue with currency-based detection
  }
  
  switch (currency) {
    case 'BGN': return 'bg-BG';
    case 'GBP': return 'en-GB';
    case 'USD': return 'en-US';
    case 'EUR': 
    default: return 'en-GB';
  }
}

/**
 * Fallback price formatting when Intl.NumberFormat fails
 */
function fallbackPriceFormat(
  price: number, 
  currency: CurrencyCode, 
  showSymbol: boolean,
  precision?: number
): string {
  const roundedPrice = precision !== undefined 
    ? Number(price.toFixed(precision)) 
    : price;
    
  if (!showSymbol) return String(roundedPrice);
  
  switch (currency) {
    case 'GBP': return `£${roundedPrice}`;
    case 'USD': return `$${roundedPrice}`;
    case 'BGN': return `${roundedPrice}лв`;
    case 'EUR': return `€${roundedPrice}`;
    default: return `${currency} ${roundedPrice}`;
  }
}

// Condition Translation Utilities

/**
 * Translate product condition to display string
 */
export function translateCondition(
  condition: string,
  translationFunction?: (key: string) => string
): string {
  if (translationFunction) {
    try {
      return translationFunction(condition);
    } catch {
      // Fallback to built-in translation
    }
  }
  
  const conditionMap: Record<string, string> = {
    brand_new_with_tags: 'New with tags',
    brand_new_without_tags: 'New without tags', 
    like_new: 'Like new',
    good: 'Good',
    worn: 'Worn',
    fair: 'Fair',
    poor: 'Poor'
  };
  
  return conditionMap[condition] || condition;
}

/**
 * Get condition display color for styling
 */
export function getConditionColor(condition: string): {
  background: string;
  text: string;
  border: string;
} {
  switch (condition) {
    case 'brand_new_with_tags':
    case 'brand_new_without_tags':
      return {
        background: 'var(--semantic-success-bg)',
        text: 'var(--semantic-success-text)',
        border: 'var(--semantic-success-border)'
      };
    case 'like_new':
      return {
        background: 'var(--semantic-info-bg)', 
        text: 'var(--semantic-info-text)',
        border: 'var(--semantic-info-border)'
      };
    case 'good':
      return {
        background: 'var(--semantic-warning-bg)',
        text: 'var(--semantic-warning-text)', 
        border: 'var(--semantic-warning-border)'
      };
    case 'worn':
    case 'fair':
      return {
        background: 'var(--surface-subtle)',
        text: 'var(--text-secondary)',
        border: 'var(--border-subtle)'
      };
    case 'poor':
      return {
        background: 'var(--semantic-error-bg)',
        text: 'var(--semantic-error-text)',
        border: 'var(--semantic-error-border)'
      };
    default:
      return {
        background: 'var(--surface-elevated)',
        text: 'var(--text-primary)',
        border: 'var(--border-subtle)'
      };
  }
}

// Category Translation Utilities

/**
 * Translate category name using slug-based key mapping
 */
export function translateCategory(
  name?: string | null,
  slug?: string | null,
  translationFunction?: (key: string) => string
): string {
  if (!translationFunction || !slug) {
    return name || '';
  }
  
  try {
    const key = `category_${slug.replace(/-/g, '_')}`;
    return translationFunction(key);
  } catch {
    return name || '';
  }
}

// Product Utilities

/**
 * Generate product canonical URL
 */
export function getProductUrl(
  product: ProductData,
  baseUrl: string = ''
): string {
  if (product.seller?.username) {
    return `${baseUrl}/product/${product.seller.username}/${product.id}`;
  }
  
  // Fallback to ID-based URL
  return `${baseUrl}/product/${product.id}`;
}

/**
 * Get display name for seller
 */
export function getSellerDisplayName(
  seller: ProductData['seller'],
  fallback: string = 'Anonymous'
): string {
  return seller?.full_name || seller?.username || fallback;
}

/**
 * Format product images for gallery display
 */
export function formatProductImages(
  images: string[],
  title: string
): Array<{
  url: string;
  alt: string;
  loading: 'eager' | 'lazy';
}> {
  return images.map((url, index) => ({
    url,
    alt: `${title} - Image ${index + 1}`,
    loading: index === 0 ? 'eager' as const : 'lazy' as const
  }));
}

// Review Utilities

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: ReviewData[]): number {
  if (!reviews.length) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get rating distribution for display
 */
export function getRatingDistribution(reviews: ReviewData[]): Record<number, number> {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    const rating = Math.max(1, Math.min(5, Math.round(review.rating)));
    distribution[rating as keyof typeof distribution]++;
  });
  
  return distribution;
}

/**
 * Format review date for display
 */
export function formatReviewDate(
  dateString: string | null,
  locale: string = 'en-GB'
): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return '';
  }
}

// Accessibility Utilities

/**
 * Generate ARIA label for product card
 */
export function getProductCardAriaLabel(
  product: ProductData,
  formattedPrice: string
): string {
  const condition = product.condition ? `, ${translateCondition(product.condition)}` : '';
  const sold = product.is_sold ? ', Sold' : '';
  
  return `View product: ${product.title}${condition}. Price: ${formattedPrice}${sold}`;
}

/**
 * Generate ARIA label for rating display
 */
export function getRatingAriaLabel(
  rating: number,
  totalReviews?: number
): string {
  const ratingText = `${rating} out of 5 stars`;
  const reviewText = totalReviews ? ` based on ${totalReviews} review${totalReviews === 1 ? '' : 's'}` : '';
  
  return `${ratingText}${reviewText}`;
}

// Performance Utilities

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Validation Utilities

/**
 * Validate product data completeness
 */
export function isValidProductData(data: any): data is ProductData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.price === 'number' &&
    typeof data.currency === 'string' &&
    Array.isArray(data.images) &&
    data.seller &&
    typeof data.seller === 'object'
  );
}

/**
 * Sanitize product data for display
 */
export function sanitizeProductData(data: any): ProductData | null {
  if (!isValidProductData(data)) return null;
  
  return {
    ...data,
    title: String(data.title).trim(),
    price: Math.max(0, Number(data.price) || 0),
    images: Array.isArray(data.images) ? data.images.filter(img => typeof img === 'string') : [],
    favorite_count: Math.max(0, Number(data.favorite_count) || 0)
  };
}

// Constants for consistent usage

export const CONDITION_ORDER: ProductCondition[] = [
  'brand_new_with_tags',
  'brand_new_without_tags', 
  'like_new',
  'good',
  'worn',
  'fair'
];

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['EUR', 'GBP', 'USD', 'BGN'];

export const PRICE_PRECISION = {
  EUR: 2,
  GBP: 2, 
  USD: 2,
  BGN: 0 // Bulgarian Lev typically doesn't use decimal places
} as const;