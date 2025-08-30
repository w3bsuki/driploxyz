// Product page shared constants and utilities
import * as i18n from '@repo/i18n';

// Button styles following 36-40-44px mobile hierarchy - NO ANIMATIONS per CLAUDE.md
export const BUTTON_STYLES = {
  // 44px - Primary CTAs (Buy, Checkout)
  primary: 'min-h-[44px] bg-black text-white rounded-xl font-semibold hover:bg-gray-800 px-6',
  primaryOutline: 'min-h-[44px] bg-white border-2 border-black text-black rounded-xl font-semibold hover:bg-gray-50 px-6',
  
  // 40px - Standard actions (Message, Offer, Secondary buttons)
  secondary: 'min-h-[40px] bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 px-4',
  secondaryOutline: 'min-h-[40px] border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 px-4',
  
  // 36px - Compact actions (Pills, filters, tertiary)
  compact: 'min-h-[36px] bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 px-3',
  
  // Touch targets for icons
  iconLarge: 'min-w-[44px] min-h-[44px] flex items-center justify-center', // Primary icons
  iconMedium: 'min-w-[40px] min-h-[40px] flex items-center justify-center', // Standard icons
  iconCompact: 'min-w-[36px] min-h-[36px] flex items-center justify-center', // Small icons
  
  // Icon sizes
  iconSize: {
    large: 'w-6 h-6',
    medium: 'w-5 h-5', 
    small: 'w-4 h-4'
  }
} as const;

// Colors and styling
export const COLORS = {
  heart: {
    liked: 'text-red-500 drop-shadow-sm',
    default: 'text-gray-900'
  },
  status: {
    sold: 'bg-red-500 text-white',
    available: 'bg-green-500 text-white'
  },
  hashtag: 'text-blue-600 hover:text-blue-800 hover:underline cursor-pointer'
} as const;

// Category translation mapping
export const CATEGORY_TRANSLATIONS: Record<string, () => string> = {
  // Level 1 - Gender categories
  'Women': () => i18n.category_women(),
  'Men': () => i18n.category_men(),
  'Kids': () => i18n.category_kids(),
  'Unisex': () => i18n.category_unisex(),
  
  // Level 2 - Product Types
  'Clothing': () => i18n.category_clothing(),
  'Shoes': () => i18n.category_shoesType(),
  'Accessories': () => i18n.category_accessoriesType(),
  'Bags': () => i18n.category_bagsType(),
  
  // Level 3 - Specific items
  'Activewear': () => i18n.category_activewear(),
  'Boots': () => i18n.category_boots(),
  'Dresses': () => i18n.category_dresses(),
  'Flats': () => i18n.category_flats(),
  'Formal Shoes': () => i18n.category_formalShoes(),
  'Heels': () => i18n.category_heels(),
  'Hoodies': () => i18n.category_hoodies(),
  'Jackets': () => i18n.category_jackets(),
  'Jackets & Coats': () => i18n.category_jacketsCoats(),
  'Jeans': () => i18n.category_jeans(),
  'Jewelry': () => i18n.category_jewelry(),
  'Lingerie & Underwear': () => i18n.category_lingerie(),
  'Pants & Jeans': () => i18n.category_pantsJeans(),
  'Pants & Trousers': () => i18n.category_pantsTrousers(),
  'Sandals': () => i18n.category_sandals(),
  'Sandals & Slides': () => i18n.category_sandalsSlides(),
  'Shirts': () => i18n.category_shirts(),
  'Shirts & Blouses': () => i18n.category_shirtsBlouses(),
  'Shorts': () => i18n.category_shorts(),
  'Skirts': () => i18n.category_skirts(),
  'Sneakers': () => i18n.category_sneakers(),
  'Suits & Blazers': () => i18n.category_suitsBlazers(),
  'Sweaters & Hoodies': () => i18n.category_sweatersHoodies(),
  'Swimwear': () => i18n.category_swimwear(),
  'T-Shirts': () => i18n.category_tshirts(),
  'Tops & T-Shirts': () => i18n.category_topsTshirts(),
  'Underwear': () => i18n.category_underwear(),
  'Watches': () => i18n.category_watches(),
  
  // Level 3 - Accessory subcategories
  'Hats & Caps': () => i18n.category_hatsAndCaps(),
  'Belts': () => i18n.category_belts(),
  'Scarves': () => i18n.category_scarves(),
  'Sunglasses': () => i18n.category_sunglasses(),
  'Wallets': () => i18n.category_wallets(),
  'Hair Accessories': () => i18n.category_hairAccessories(),
  'Ties': () => i18n.category_ties(),
  'Cufflinks': () => i18n.category_cufflinks(),
  'Backpacks': () => i18n.category_backpacks()
};

// Condition translations (matching database values)
export const CONDITION_TRANSLATIONS = {
  'brand_new_with_tags': () => i18n.product_newWithTags(),
  'new': () => i18n.product_newWithTags(),
  'like_new': () => i18n.product_likeNewCondition(),
  'like-new': () => i18n.product_likeNewCondition(),
  'good': () => i18n.product_goodCondition(),
  'fair': () => i18n.product_fairCondition(),
  'poor': () => i18n.product_fairCondition()
} as const;