/**
 * Central category mapping utility
 * Maps database category names to translation functions
 * Single source of truth for all category translations
 * 
 * NOTE: Temporary fallback translations until proper i18n keys are added
 */

// Map database category names to translation functions
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