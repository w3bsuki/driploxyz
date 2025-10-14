import type { Database } from '@repo/database';

export function formatPrice(price: number, currency: string = 'BGN'): string {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return past.toLocaleDateString();
}

export function formatProductCondition(condition: Database['public']['Enums']['product_condition']): string {
  const conditions = {
    'brand_new_with_tags': 'Brand New With Tags',
    'new_without_tags': 'New Without Tags',
    'like_new': 'Like New',
    'good': 'Good',
    'worn': 'Worn',
    'fair': 'Fair',
  };

  return conditions[condition] || condition;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}