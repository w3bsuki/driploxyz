/**
 * Category Domain Adapter
 *
 * This file provides a bridge between the SvelteKit application and the domain layer.
 * It adapts the domain services to work with the existing app structure and
 * maintains backward compatibility with existing CategoryService interface.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import {
  // Domain types
  type Category as DomainCategory,
  type Result,

  // Domain infrastructure
  createSupabasePort,
  createCategoryRepository,

  // Domain services
  createResolveCategorySegments,
  createGetProductsByCategory
} from '@repo/domain';

// Legacy types from the app for compatibility
export interface CategoryResolution {
  level: 1 | 2 | 3;
  l1?: { id: string; name: string; slug: string };
  l2?: { id: string; name: string; slug: string };
  l3?: { id: string; name: string; slug: string };
  categoryIds: string[];
  canonicalPath: string;
  isValid: boolean;
  isVirtual: boolean;
}

export interface CategoryNavigation {
  pills: Array<{ id: string; name: string; slug: string; productCount: number }>;
  dropdown: Array<{ id: string; name: string; slug: string; productCount: number }>;
}

export interface BreadcrumbsResult {
  items: Array<{ name: string; slug: string; href: string }>;
  jsonLd: string;
}

/**
 * Adapter class that provides the same interface as the existing CategoryService
 * but uses the domain layer internally
 */
export class CategoryDomainAdapter {
  private categoryRepo: ReturnType<typeof createCategoryRepository>;
  private resolveCategorySegments: ReturnType<typeof createResolveCategorySegments>;

  constructor(supabase: SupabaseClient<Database>) {
    // Create domain infrastructure
    const db = createSupabasePort(supabase);
    this.categoryRepo = createCategoryRepository(db);

    // Create domain services
    this.resolveCategorySegments = createResolveCategorySegments(this.categoryRepo);
  }

  /**
   * Resolve category segments into a structured resolution
   */
  async resolveCategories(segments: string[]): Promise<CategoryResolution> {
    // Validate segment count (max 3 levels: L1/L2/L3)
    if (segments.length > 3) {
      throw new Error('Too many category levels');
    }

    if (segments.length === 0) {
      throw new Error('No segments provided');
    }

    // Check if this is a virtual category (clothing, shoes, etc.)
    const isVirtual = ['clothing', 'shoes', 'accessories', 'bags'].includes(segments[0] || '');

    // Use domain service to resolve segments
    const result = await this.resolveCategorySegments.execute(segments);

    if (!result.success) {
      // Return fallback resolution for invalid categories
      return {
        level: segments.length as 1 | 2 | 3,
        l1: segments.length >= 1 ? { id: 'virtual-1', name: segments[0]!, slug: segments[0]! } : undefined,
        l2: segments.length >= 2 ? { id: 'virtual-2', name: segments[1]!, slug: segments[1]! } : undefined,
        l3: segments.length >= 3 ? { id: 'virtual-3', name: segments[2]!, slug: segments[2]! } : undefined,
        categoryIds: [],
        canonicalPath: `/category/${segments.join('/')}`,
        isValid: false,
        isVirtual
      };
    }

    const categoryIds = result.data;

    // Map domain categories to legacy format
    const resolution: CategoryResolution = {
      level: segments.length as 1 | 2 | 3,
      categoryIds,
      canonicalPath: `/category/${segments.join('/')}`,
      isValid: true,
      isVirtual: false, // Real categories from domain are not virtual
      // Legacy format placeholders - would need actual category data from domain
      l1: segments.length >= 1 ? { id: categoryIds[0] || '1', name: segments[0]!, slug: segments[0]! } : undefined,
      l2: segments.length >= 2 ? { id: categoryIds[1] || '2', name: segments[1]!, slug: segments[1]! } : undefined,
      l3: segments.length >= 3 ? { id: categoryIds[2] || '3', name: segments[2]!, slug: segments[2]! } : undefined
    };

    return resolution;
  }

  /**
   * Generate breadcrumbs for category navigation
   */
  generateBreadcrumbs(segments: string[]): BreadcrumbsResult {
    const items = segments.map((segment, index) => ({
      name: segment,
      slug: segment,
      href: `/category/${segments.slice(0, index + 1).join('/')}`
    }));

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.href
      }))
    });

    return { items, jsonLd };
  }

  /**
   * Get category navigation (pills and dropdown)
   * For now, return empty structure - can be enhanced with domain data
   */
  async getCategoryNavigation(resolution: CategoryResolution): Promise<CategoryNavigation> {
    // TODO: Implement using domain category tree structure
    return {
      pills: [],
      dropdown: []
    };
  }

  /**
   * Generate SEO metadata for category pages
   */
  generateSEOMeta(resolution: CategoryResolution, totalProducts: number): {
    title: string;
    description: string;
    keywords: string[];
    canonical: string;
  } {
    const category = resolution.l3 || resolution.l2 || resolution.l1;
    const categoryName = category?.name || 'Products';

    return {
      title: `${categoryName} for Sale | Driplo`,
      description: `Shop ${categoryName.toLowerCase()} with ${totalProducts} items available. Buy and sell second-hand ${categoryName.toLowerCase()} easily.`,
      keywords: [categoryName, 'second hand', 'thrift', 'buy', 'sell'],
      canonical: resolution.canonicalPath
    };
  }
}