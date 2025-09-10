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
  if (!slug) return false;
  
  // Exclude gender categories that should take precedence
  const genderCategorySlugs = ['men', 'women', 'kids', 'unisex'];
  if (genderCategorySlugs.includes(slug.toLowerCase())) {
    return false;
  }
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

/**
 * Validate that virtual category target slugs actually exist in the database
 * Returns only the slugs that exist, with warnings for missing ones
 */
export async function validateVirtualCategoryTargets(
  supabase: any, 
  virtualSlug: string, 
  targetSlugs: string[]
): Promise<{ validSlugs: string[]; missingCount: number }> {
  try {
    const { data: existingSlugs, error } = await supabase
      .from('categories')
      .select('slug')
      .in('slug', targetSlugs)
      .eq('level', 2) // Virtual categories target L2 categories
      .eq('is_active', true);

    if (error) {
      console.error(`Error validating virtual category '${virtualSlug}' targets:`, error);
      return { validSlugs: targetSlugs, missingCount: 0 }; // Fail gracefully
    }

    const existingSlugSet = new Set((existingSlugs || []).map((row: any) => row.slug));
    const validSlugs = targetSlugs.filter(slug => existingSlugSet.has(slug));
    const missingCount = targetSlugs.length - validSlugs.length;

    if (missingCount > 0) {
      const missingSlugs = targetSlugs.filter(slug => !existingSlugSet.has(slug));
      console.warn(
        `Virtual category '${virtualSlug}' has ${missingCount} missing target slugs: ${missingSlugs.join(', ')}. ` +
        `Using ${validSlugs.length} valid targets: ${validSlugs.join(', ')}`
      );
    }

    return { validSlugs, missingCount };
    
  } catch (error) {
    console.error(`Failed to validate virtual category '${virtualSlug}' targets:`, error);
    return { validSlugs: targetSlugs, missingCount: 0 }; // Fail gracefully
  }
}