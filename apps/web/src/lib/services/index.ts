import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

// Service imports
import { ProductService } from './products';
import { CategoryService } from './categories';
import { ProfileService } from './profiles';

// Service class exports
export { ProductService } from './products';
export { CategoryService } from './categories';
export { ProfileService } from './profiles';

// Type exports
export type {
  ProductWithImages,
  ProductFilters,
  ProductSort,
  ProductListOptions
} from './products';

export type {
  CategoryWithChildren,
  CategoryTree
} from './categories';

export type {
  ProfileWithStats,
  SellerStats
} from './profiles';

/**
 * Service factory to create all services with a Supabase client
 */
export function createServices(supabase: SupabaseClient<Database>) {
  return {
    products: new ProductService(supabase),
    categories: new CategoryService(supabase),
    profiles: new ProfileService(supabase)
  };
}

/**
 * Service manager class that provides easy access to all services
 */
export class ServiceManager {
  public products: ProductService;
  public categories: CategoryService;
  public profiles: ProfileService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.products = new ProductService(supabase);
    this.categories = new CategoryService(supabase);
    this.profiles = new ProfileService(supabase);
  }

  /**
   * Update the Supabase client for all services
   */
  updateClient(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.products = new ProductService(supabase);
    this.categories = new CategoryService(supabase);
    this.profiles = new ProfileService(supabase);
  }
}

// Utility functions for common operations
export const serviceUtils = {
  /**
   * Format price for display
   */
  formatPrice(price: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  },

  /**
   * Format date for display
   */
  formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(new Date(date));
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  },

  /**
   * Generate URL-friendly slug from string
   */
  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate username
   */
  isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  },

  /**
   * Generate image URL with transformation parameters
   */
  transformImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}): string {
    if (!url) return url;
    
    // If using Supabase Storage, you might want to add transformation parameters
    // This is a placeholder for image transformation logic
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  },

  /**
   * Calculate shipping cost based on location and item
   */
  calculateShipping(sellerLocation: string, buyerLocation: string, itemWeight?: number): number {
    // Placeholder shipping calculation
    // In a real app, you'd integrate with a shipping API
    const baseRate = 5.99;
    const weightMultiplier = itemWeight ? Math.max(1, itemWeight * 0.5) : 1;
    
    // Simple distance-based calculation (would be more sophisticated in production)
    const isSameArea = sellerLocation.toLowerCase() === buyerLocation.toLowerCase();
    const areaMultiplier = isSameArea ? 0.5 : 1;
    
    return Math.round((baseRate * weightMultiplier * areaMultiplier) * 100) / 100;
  },

  /**
   * Validate product data
   */
  validateProduct(product: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!product.title || product.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }
    
    if (!product.description || product.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }
    
    if (!product.price || product.price <= 0) {
      errors.push('Price must be greater than 0');
    }
    
    if (!product.condition) {
      errors.push('Condition is required');
    }
    
    if (!product.category_id) {
      errors.push('Category is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};