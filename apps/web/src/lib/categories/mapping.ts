/**
 * Central category mapping utility with robust fallback system
 * Maps database category names to translation functions
 * Single source of truth for all category translations with comprehensive fallback hierarchy
 * 
 * Fallback hierarchy:
 * 1. i18n message key (category_<slugified_name>)
 * 2. Direct mapping translation
 * 3. Database category name (cleaned)
 * 4. Category slug as last resort
 */

import * as i18n from '@repo/i18n';

// Development mode flag for logging missing translations
const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

// Track missing translations to avoid duplicate logs
const missingTranslations = new Set<string>();

/**
 * Log missing category translation for development feedback
 */
function logMissingTranslation(categoryName: string, fallbackUsed: string) {
  if (isDevelopment && !missingTranslations.has(categoryName)) {
    console.warn(
      `[Category Translation] Missing translation for "${categoryName}", using fallback: "${fallbackUsed}"`
    );
    missingTranslations.add(categoryName);
  }
}

/**
 * Generate i18n message key from category name
 * Converts "Shirts & Blouses" -> "category_shirtsBlouses"
 */
function getCategoryMessageKey(categoryName: string): string {
  return 'category_' + categoryName
    .replace(/[&+]/g, '') // Remove & and + symbols
    .replace(/[^a-zA-Z0-9]/g, ' ') // Replace special chars with spaces
    .trim()
    .split(/\s+/)
    .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Clean category name for display
 * Handles case variations and special characters
 */
function cleanCategoryName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
    .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim();
}

/**
 * Generate slug from category name
 * Converts "Shirts & Blouses" -> "shirts-blouses"
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[&+]/g, '') // Remove & and + symbols
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Legacy direct mapping translations (fallback level 2)
export const categoryTranslations: Record<string, () => string> = {
  // Level 1 - Gender/Age
  'Men': () => 'Мъже',
  'Women': () => 'Жени',
  'Kids': () => 'Деца',
  'Unisex': () => 'Унисекс',
  
  // Level 2 - Product Types
  'Clothing': () => 'Дрехи',
  'Shoes': () => 'Обувки',
  'Accessories': () => 'Аксесоари',
  'Bags': () => 'Чанти',
  
  // Level 3 - Clothing items
  'T-Shirts': () => 'Тениски',
  'Shirts': () => 'Ризи',
  'Shirts & Blouses': () => 'Ризи и блузи',
  'Tops & T-Shirts': () => 'Топове и тениски',
  'Dresses': () => 'Рокли',
  'Skirts': () => 'Поли',
  'Pants & Jeans': () => 'Панталони и дънки',
  'Pants & Trousers': () => 'Панталони',
  'Jeans': () => 'Дънки',
  'Shorts': () => 'Къси панталони',
  'Jackets': () => 'Якета',
  'Jackets & Coats': () => 'Якета и палта',
  'Sweaters & Hoodies': () => 'Пуловери и суичъри',
  'Hoodies': () => 'Суичъри',
  'Suits & Blazers': () => 'Костюми и сака',
  'Swimwear': () => 'Бански',
  'Activewear': () => 'Спортни дрехи',
  'Underwear': () => 'Бельо',
  'Lingerie & Underwear': () => 'Дамско бельо',
  
  // Level 3 - Shoes
  'Sneakers': () => 'Кецове',
  'Boots': () => 'Ботуши',
  'Heels': () => 'Обувки с ток',
  'Flats': () => 'Равни обувки',
  'Sandals': () => 'Сандали',
  'Sandals & Slides': () => 'Сандали и чехли',
  'Formal Shoes': () => 'Елегантни обувки',
  
  // Level 3 - Accessories
  'Hats & Caps': () => 'Шапки',
  'Belts': () => 'Колани',
  'Scarves': () => 'Шалове',
  'Sunglasses': () => 'Слънчеви очила',
  'Jewelry': () => 'Бижута',
  'Watches': () => 'Часовници',
  'Wallets': () => 'Портфейли',
  'Hair Accessories': () => 'Аксесоари за коса',
  'Ties': () => 'Вратовръзки',
  'Cufflinks': () => 'Ръкавели',
  
  // Level 3 - Bags
  'Backpacks': () => 'Раници',
  'Handbags': () => 'Дамски чанти',
  'Totes': () => 'Големи чанти',
  'Clutches': () => 'Клъч чанти',
  'Crossbody': () => 'Чанти през рамо',
  'Travel': () => 'Пътни чанти',
  'Laptop Bags': () => 'Чанти за лаптоп',
  
  // Special subcategories
  'Gloves': () => 'Ръкавици',
  'Gloves & Mittens': () => 'Ръкавици',
  'Suspenders': () => 'Тиранти',
  'Keychains': () => 'Ключодържатели',
  'Bibs': () => 'Лигавници',
  'Bandanas': () => 'Бандани',
  
  // Kids specific
  'Baby': () => 'Бебешки',
  'School': () => 'Училищни',
  'Toys': () => 'Играчки'
};

/**
 * Get translation for a category name with robust fallback hierarchy
 * 
 * Fallback hierarchy:
 * 1. Primary: i18n message key (category_<slugified_name>)
 * 2. Secondary: Direct mapping translation
 * 3. Tertiary: Cleaned database name
 * 4. Last resort: Generated slug
 * 
 * @param categoryName - Raw category name from database
 * @param slug - Optional category slug from database
 * @param options - Translation options
 */
export function translateCategory(
  categoryName: string | undefined | null, 
  slug?: string | null,
  options: {
    logMissing?: boolean;
    fallbackToSlug?: boolean;
  } = {}
): string {
  const { logMissing = true, fallbackToSlug = true } = options;
  
  if (!categoryName) return '';
  
  // 1. Try i18n message key first (Primary)
  try {
    const messageKey = getCategoryMessageKey(categoryName);
    if (messageKey in i18n) {
      const translationFunction = (i18n as any)[messageKey];
      if (typeof translationFunction === 'function') {
        return translationFunction();
      }
    }
  } catch (error) {
    // i18n key doesn't exist or function call failed
  }
  
  // 2. Try direct mapping translation (Secondary)
  const translator = categoryTranslations[categoryName];
  if (translator) {
    try {
      return translator();
    } catch (error) {
      // Translation function failed
    }
  }
  
  // 3. Use cleaned category name (Tertiary)
  const cleanedName = cleanCategoryName(categoryName);
  if (cleanedName !== categoryName) {
    if (logMissing) {
      logMissingTranslation(categoryName, cleanedName);
    }
    return cleanedName;
  }
  
  // 4. Last resort: use slug or generate one
  if (fallbackToSlug) {
    const fallbackSlug = slug || generateSlug(categoryName);
    const slugDisplay = fallbackSlug.replace(/-/g, ' ');
    
    if (logMissing) {
      logMissingTranslation(categoryName, slugDisplay);
    }
    
    return slugDisplay;
  }
  
  // Final fallback: return original name
  if (logMissing) {
    logMissingTranslation(categoryName, categoryName);
  }
  
  return categoryName;
}

/**
 * Validate category translation coverage
 * Returns missing translations for development feedback
 */
export function validateCategoryTranslations(categories: Array<{name: string, slug?: string}>): {
  missing: Array<{name: string, suggestedKey: string, slug?: string}>;
  coverage: number;
} {
  const missing: Array<{name: string, suggestedKey: string, slug?: string}> = [];
  
  for (const category of categories) {
    const messageKey = getCategoryMessageKey(category.name);
    const hasI18nKey = messageKey in i18n;
    const hasDirectMapping = category.name in categoryTranslations;
    
    if (!hasI18nKey && !hasDirectMapping) {
      missing.push({
        name: category.name,
        suggestedKey: messageKey,
        slug: category.slug
      });
    }
  }
  
  const coverage = ((categories.length - missing.length) / categories.length) * 100;
  
  return { missing, coverage };
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
      translatedName: translateCategory(cat.name, cat.slug),
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
        translatedName: translateCategory(l2.name, l2.slug),
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
        translatedName: translateCategory(l3.name, l3.slug),
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