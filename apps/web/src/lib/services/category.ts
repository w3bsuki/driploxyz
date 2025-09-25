import { error, redirect } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

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

export class CategoryService {
  constructor(
    // @ts-expect-error - supabase will be used for database queries in future implementation
    private supabase: SupabaseClient<Database>
  ) {}

  /**
   * Resolve category segments into a structured resolution
   */
  async resolveCategories(segments: string[]): Promise<CategoryResolution> {
    // Validate segment count (max 3 levels: L1/L2/L3)
    if (segments.length > 3) {
      error(400, 'Too many category levels');
    }

    if (segments.length === 0) {
      redirect(301, '/search');
    }

    // Check if this is a virtual category (clothing, shoes, etc.)
    const isVirtual = ['clothing', 'shoes', 'accessories', 'bags'].includes(segments[0] || '');

    const resolution: CategoryResolution = {
      level: segments.length as 1 | 2 | 3,
      l1: segments.length >= 1 ? { id: '1', name: segments[0]!, slug: segments[0]! } : undefined,
      l2: segments.length >= 2 ? { id: '2', name: segments[1]!, slug: segments[1]! } : undefined,
      l3: segments.length >= 3 ? { id: '3', name: segments[2]!, slug: segments[2]! } : undefined,
      categoryIds: ['1', '2', '3'], // TODO: Replace with actual DB lookup
      canonicalPath: `/category/${segments.join('/')}`,
      isValid: true,
      isVirtual
    };

    // TODO: Add actual database validation here
    // This is a placeholder for real category validation logic

    return resolution;
  }

  /**
   * Get appropriate navigation categories based on the current resolution level
   */
  async getCategoryNavigation(resolution: CategoryResolution): Promise<CategoryNavigation> {
    if (resolution.isVirtual) {
      // Virtual categories (e.g., /category/clothing) → Show gender categories (L1)
      return {
        pills: [
          { id: 'men', name: 'Men', slug: 'men', productCount: 500 },
          { id: 'women', name: 'Women', slug: 'women', productCount: 750 },
          { id: 'kids', name: 'Kids', slug: 'kids', productCount: 200 },
          { id: 'unisex', name: 'Unisex', slug: 'unisex', productCount: 150 }
        ],
        dropdown: [
          { id: 'men', name: 'Men', slug: 'men', productCount: 500 },
          { id: 'women', name: 'Women', slug: 'women', productCount: 750 },
          { id: 'kids', name: 'Kids', slug: 'kids', productCount: 200 },
          { id: 'unisex', name: 'Unisex', slug: 'unisex', productCount: 150 }
        ]
      };
    }

    // Regular categories - show appropriate level based on current depth
    if (resolution.level === 1) {
      // L1 page (/category/men) → Show L2 categories (Clothing, Shoes, Accessories, Bags)
      return {
        pills: [
          { id: '1', name: 'Clothing', slug: 'clothing', productCount: 150 },
          { id: '2', name: 'Shoes', slug: 'shoes', productCount: 89 },
          { id: '3', name: 'Accessories', slug: 'accessories', productCount: 67 },
          { id: '4', name: 'Bags', slug: 'bags', productCount: 34 }
        ],
        dropdown: [
          { id: '1', name: 'Clothing', slug: 'clothing', productCount: 150 },
          { id: '2', name: 'Shoes', slug: 'shoes', productCount: 89 },
          { id: '3', name: 'Accessories', slug: 'accessories', productCount: 67 },
          { id: '4', name: 'Bags', slug: 'bags', productCount: 34 }
        ]
      };
    } else if (resolution.level === 2) {
      // L2 page (/category/men/clothing) → Show L3 categories (T-Shirts, Jeans, etc.)
      return {
        pills: [
          { id: '11', name: 'T-Shirts', slug: 't-shirts', productCount: 45 },
          { id: '12', name: 'Jeans', slug: 'jeans', productCount: 32 },
          { id: '13', name: 'Jackets', slug: 'jackets', productCount: 28 },
          { id: '14', name: 'Hoodies', slug: 'hoodies', productCount: 19 }
        ],
        dropdown: [
          { id: '11', name: 'T-Shirts', slug: 't-shirts', productCount: 45 },
          { id: '12', name: 'Jeans', slug: 'jeans', productCount: 32 },
          { id: '13', name: 'Jackets', slug: 'jackets', productCount: 28 },
          { id: '14', name: 'Hoodies', slug: 'hoodies', productCount: 19 }
        ]
      };
    }

    // Level 3 - no further navigation needed
    return {
      pills: [],
      dropdown: []
    };
  }

  /**
   * Generate breadcrumbs for a category resolution
   */
  generateBreadcrumbs(segments: string[]) {
    return {
      items: [
        { name: 'Home', href: '/', level: 0 },
        ...(segments.map((segment, i) => ({
          name: segment,
          href: `/category/${segments.slice(0, i + 1).join('/')}`,
          level: i + 1
        })))
      ],
      jsonLd: {} // TODO: Add structured data
    };
  }

  /**
   * Generate SEO meta information
   */
  generateSEOMeta(resolution: CategoryResolution, productCount: number) {
    const title = this.generateMetaTitle(resolution);
    const description = this.generateMetaDescription(resolution, productCount);
    const canonicalUrl = `https://driplo.com${resolution.canonicalPath}`;

    return {
      title,
      description,
      canonical: canonicalUrl
    };
  }

  /**
   * Generate meta title based on category resolution
   */
  private generateMetaTitle(resolution: CategoryResolution): string {
    const titles: string[] = [];

    // Handle virtual categories
    if (resolution.isVirtual && resolution.l1?.name) {
      titles.push(resolution.l1.name);
    } else {
      // Handle regular categories
      if (resolution.l3?.name) {
        titles.push(resolution.l3.name);
      }
      if (resolution.l2?.name) {
        titles.push(resolution.l2.name);
      }
      if (resolution.l1?.name) {
        titles.push(resolution.l1.name);
      }
    }

    if (titles.length === 0) {
      return 'Categories - Driplo';
    }

    return `${titles.join(' - ')} - Driplo`;
  }

  /**
   * Generate meta description based on category resolution and product count
   */
  private generateMetaDescription(resolution: CategoryResolution, productCount: number): string {
    let description = '';

    // Handle virtual categories
    if (resolution.isVirtual && resolution.l1?.name) {
      description = `Shop ${productCount} ${resolution.l1.name.toLowerCase()} from men's, women's, kids' and unisex collections`;
    } else {
      // Handle regular categories
      if (resolution.l3?.name) {
        description = `Shop ${productCount} ${resolution.l3.name.toLowerCase()} items`;
        if (resolution.l2?.name) {
          description += ` in ${resolution.l2.name.toLowerCase()}`;
        }
        if (resolution.l1?.name) {
          description += ` for ${resolution.l1.name.toLowerCase()}`;
        }
      } else if (resolution.l2?.name) {
        description = `Discover ${productCount} ${resolution.l2.name.toLowerCase()} items`;
        if (resolution.l1?.name) {
          description += ` for ${resolution.l1.name.toLowerCase()}`;
        }
      } else if (resolution.l1?.name) {
        description = `Browse ${productCount} items in ${resolution.l1.name.toLowerCase()}'s fashion`;
      }
    }

    if (!description) {
      description = `Explore fashion items on Driplo marketplace`;
    }

    description += '. Find unique preloved and new items from trusted sellers.';

    return description;
  }
}