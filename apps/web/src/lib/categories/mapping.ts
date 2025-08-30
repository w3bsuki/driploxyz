/**
 * Central category mapping utility
 * Maps database category names to translation functions
 * Single source of truth for all category translations
 */
import * as i18n from '@repo/i18n';

// All translation functions are now properly typed and available

// Map database category names to translation functions
export const categoryTranslations: Record<string, () => string> = {
  // Level 1 - Gender/Age
  'Men': i18n.category_men,
  'Women': i18n.category_women,
  'Kids': i18n.category_kids,
  'Unisex': i18n.category_unisex,
  
  // Level 2 - Product Types
  'Clothing': i18n.category_clothing,
  'Shoes': i18n.category_shoes,
  'Accessories': i18n.category_accessories,
  'Bags': i18n.category_bags,
  
  // Level 3 - Clothing items
  'T-Shirts': i18n.category_tshirts,
  'Shirts': i18n.category_shirts,
  'Shirts & Blouses': i18n.category_shirtsBlouses,
  'Tops & T-Shirts': i18n.category_topsTshirts,
  'Dresses': i18n.category_dresses,
  'Skirts': i18n.category_skirts,
  'Pants & Jeans': i18n.category_pantsJeans,
  'Pants & Trousers': i18n.category_pantsTrousers,
  'Jeans': i18n.category_jeans,
  'Shorts': i18n.category_shorts,
  'Jackets': i18n.category_jackets,
  'Jackets & Coats': i18n.category_jacketsCoats,
  'Sweaters & Hoodies': i18n.category_sweatersHoodies,
  'Hoodies': i18n.category_hoodies,
  'Suits & Blazers': i18n.category_suitsBlazers,
  'Swimwear': i18n.category_swimwear,
  'Activewear': i18n.category_activewear,
  'Underwear': i18n.category_underwear,
  'Lingerie & Underwear': i18n.category_lingerie,
  
  // Level 3 - Shoes
  'Sneakers': i18n.category_sneakers,
  'Boots': i18n.category_boots,
  'Heels': i18n.category_heels,
  'Flats': i18n.category_flats,
  'Sandals': i18n.category_sandals,
  'Sandals & Slides': i18n.category_sandalsSlides,
  'Formal Shoes': i18n.category_formalShoes,
  
  // Level 3 - Accessories (CRITICAL FIX)
  'Hats & Caps': i18n.category_hatsAndCaps, // Maps to "Шапки" in Bulgarian
  'Belts': i18n.category_belts,
  'Scarves': i18n.category_scarves,
  'Sunglasses': i18n.category_sunglasses,
  'Jewelry': i18n.category_jewelry,
  'Watches': i18n.category_watches,
  'Wallets': i18n.category_wallets,
  'Hair Accessories': i18n.category_hairAccessories,
  'Ties': i18n.category_ties,
  'Cufflinks': i18n.category_cufflinks,
  
  // Level 3 - Bags
  'Backpacks': i18n.category_backpacks,
  'Handbags': i18n.category_handbags,
  'Totes': i18n.subcategory_totes,
  'Clutches': i18n.category_clutches,
  'Crossbody': i18n.subcategory_crossbody,
  'Travel': i18n.subcategory_travel,
  'Laptop Bags': i18n.category_laptopBags,
  
  // Special subcategories
  'Gloves': () => 'Ръкавици',
  'Gloves & Mittens': () => 'Ръкавици',
  'Suspenders': () => 'Тиранти',
  'Keychains': () => 'Ключодържатели',
  'Bibs': () => 'Лигавници',
  'Bandanas': () => 'Бандани',
  
  // Kids specific
  'Baby': i18n.subcategory_baby,
  'School': i18n.subcategory_school,
  'Toys': i18n.subcategory_toys
};

/**
 * Get translation for a category name
 * Falls back to the original name if no translation exists
 */
export function translateCategory(categoryName: string | undefined | null): string {
  if (!categoryName) return '';
  
  const translator = categoryTranslations[categoryName];
  return translator ? translator() : categoryName;
}

/**
 * Get icon for a category
 */
export const categoryIcons: Record<string, string> = {
  // Level 1
  'Men': '👨',
  'Women': '👩',
  'Kids': '👶',
  'Unisex': '👥',
  
  // Level 2
  'Clothing': '👕',
  'Shoes': '👟',
  'Accessories': '💍',
  'Bags': '👜',
  
  // Level 3 - Clothing
  'T-Shirts': '👕',
  'Shirts': '👔',
  'Dresses': '👗',
  'Skirts': '👗',
  'Jeans': '👖',
  'Pants': '👖',
  'Jackets': '🧥',
  'Sweaters': '🧶',
  'Hoodies': '🧥',
  
  // Level 3 - Accessories
  'Hats & Caps': '🧢',
  'Belts': '👔',
  'Scarves': '🧣',
  'Sunglasses': '🕶️',
  'Jewelry': '💍',
  'Watches': '⌚',
  'Wallets': '👛',
  'Ties': '👔',
  
  // Level 3 - Shoes
  'Sneakers': '👟',
  'Boots': '🥾',
  'Heels': '👠',
  'Sandals': '👡',
  'Flats': '🩰'
};

export function getCategoryIcon(categoryName: string): string {
  return categoryIcons[categoryName] || '📦';
}

/**
 * Build category hierarchy from database categories
 */
export interface CategoryHierarchyItem {
  id: string;
  name: string;
  translatedName: string;
  icon: string;
  slug: string;
  level: number;
  parent_id: string | null;
  children?: CategoryHierarchyItem[];
}

export function buildCategoryHierarchy(categories: any[]): Record<string, CategoryHierarchyItem> {
  const hierarchy: Record<string, CategoryHierarchyItem> = {};
  
  // First, get all level 1 categories
  const level1 = categories.filter(c => c.level === 1);
  
  level1.forEach(cat => {
    const item: CategoryHierarchyItem = {
      id: cat.id,
      name: cat.name,
      translatedName: translateCategory(cat.name),
      icon: getCategoryIcon(cat.name),
      slug: cat.slug || cat.name.toLowerCase(),
      level: 1,
      parent_id: null,
      children: []
    };
    
    // Get level 2 children
    const level2Children = categories.filter(c => c.parent_id === cat.id && c.level === 2);
    
    item.children = level2Children.map(l2 => {
      const l2Item: CategoryHierarchyItem = {
        id: l2.id,
        name: l2.name,
        translatedName: translateCategory(l2.name),
        icon: getCategoryIcon(l2.name),
        slug: l2.slug || l2.name.toLowerCase(),
        level: 2,
        parent_id: l2.parent_id,
        children: []
      };
      
      // Get level 3 children
      const level3Children = categories.filter(c => c.parent_id === l2.id && c.level === 3);
      
      l2Item.children = level3Children.map(l3 => ({
        id: l3.id,
        name: l3.name,
        translatedName: translateCategory(l3.name),
        icon: getCategoryIcon(l3.name),
        slug: l3.slug || l3.name.toLowerCase(),
        level: 3,
        parent_id: l3.parent_id
      }));
      
      return l2Item;
    });
    
    hierarchy[cat.slug || cat.name.toLowerCase()] = item;
  });
  
  return hierarchy;
}