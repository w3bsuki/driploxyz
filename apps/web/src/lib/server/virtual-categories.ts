// Virtual category definitions for unisex category pages
// Maps virtual category slugs to actual L2 category slugs across all genders

export interface VirtualCategoryConfig {
  name: string;
  slug: string;
  description: string;
  targetSlugs: string[];
  icon?: string;
}

export const VIRTUAL_CATEGORIES: Record<string, VirtualCategoryConfig> = {
  'shoes': {
    name: 'Shoes',
    slug: 'shoes',
    description: 'All shoes across men\'s, women\'s, kids\' and unisex collections',
    targetSlugs: ['men-shoes', 'women-shoes', 'kids-shoes', 'unisex-shoes']
  },
  'bags': {
    name: 'Bags',
    slug: 'bags', 
    description: 'All bags and accessories across all collections',
    targetSlugs: ['men-bags', 'women-bags', 'kids-bags', 'unisex-bags']
  },
  'accessories': {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Jewelry, watches, hats and accessories for everyone',
    targetSlugs: ['men-accessories', 'women-accessories', 'kids-accessories', 'unisex-accessories']
  },
  'clothing': {
    name: 'Clothing', 
    slug: 'clothing',
    description: 'All clothing items across all collections',
    targetSlugs: ['men-clothing', 'women-clothing', 'kids-clothing', 'unisex-clothing']
  }
};

/**
 * Check if a slug represents a virtual category
 */
export function isVirtualCategory(slug: string): boolean {
  return slug in VIRTUAL_CATEGORIES;
}

/**
 * Get virtual category config by slug
 */
export function getVirtualCategory(slug: string): VirtualCategoryConfig | null {
  return VIRTUAL_CATEGORIES[slug] || null;
}

/**
 * Get all virtual category configs
 */
export function getAllVirtualCategories(): VirtualCategoryConfig[] {
  return Object.values(VIRTUAL_CATEGORIES);
}

/**
 * Get target slugs for a virtual category
 */
export function getVirtualCategoryTargets(slug: string): string[] {
  const virtualCategory = getVirtualCategory(slug);
  return virtualCategory?.targetSlugs || [];
}