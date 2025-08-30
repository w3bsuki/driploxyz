// Product page utility functions
import { formatPrice } from '$lib/utils/price';
import * as i18n from '@repo/i18n';
import { CATEGORY_TRANSLATIONS, CONDITION_TRANSLATIONS } from './product-constants';

/**
 * Get translated category name
 */
export function getCategoryTranslation(categoryName: string): string {
  return CATEGORY_TRANSLATIONS[categoryName]?.() || categoryName;
}

/**
 * Get translated condition label
 */
export function getConditionLabel(condition: string): string {
  return CONDITION_TRANSLATIONS[condition as keyof typeof CONDITION_TRANSLATIONS]?.() || condition;
}

/**
 * Format date relative to now (Instagram-style)
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Real Instagram-style time formatting
  if (diffInSeconds < 30) return 'now';
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
  
  // For older posts, show actual date
  const months = Math.floor(diffInSeconds / 2592000);
  if (months < 12) return `${months}mo`;
  
  // Show actual date for posts older than 1 year
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format hashtag-friendly string
 */
export function formatHashtag(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '');
}

/**
 * Create breadcrumb items for product
 */
export function createBreadcrumbItems(product: any) {
  const items = [
    { label: i18n.nav_home(), href: '/' }
  ];
  
  // Add parent category (Men/Women/Kids)
  if (product.parent_category) {
    items.push({
      label: getCategoryTranslation(product.parent_category.name),
      href: `/category/${product.parent_category.id}`
    });
  }
  
  // Add current category if different from parent
  if (product.category_name && product.category_name !== product.parent_category?.name) {
    items.push({
      label: getCategoryTranslation(product.category_name),
      href: `/category/${product.category_id}`
    });
  }
  
  // Add product name (no href for current page)
  items.push({
    label: product.title
  });
  
  return items;
}

/**
 * Share product using Web Share API or fallback
 */
export function shareProduct(product: any, onCopy?: () => void): void {
  const shareData = {
    title: product.title,
    text: `Check out ${product.title} on Driplo`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(window.location.href);
    if (onCopy) onCopy();
  }
}