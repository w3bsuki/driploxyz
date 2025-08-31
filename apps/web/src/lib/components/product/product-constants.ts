// Clean product page design system
import * as i18n from '@repo/i18n';

// Clean button system - 44px primary, 36px secondary
export const BUTTON_STYLES = {
  // 44px - Primary CTAs (Buy Now, Make Offer)
  primary: 'min-h-[44px] bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 active:bg-black transition-colors shadow-lg px-6 flex items-center justify-center gap-2',
  primaryOutline: 'min-h-[44px] bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors px-6 flex items-center justify-center gap-2',
  
  // 36px - Secondary actions (Like, Share, Message)
  secondary: 'min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors',
  
  // Navigation - 44px for primary navigation
  navigation: 'min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors',
  
  // Icon sizes
  iconSize: {
    large: 'w-6 h-6',
    medium: 'w-5 h-5', 
    small: 'w-4 h-4'
  }
} as const;

// Clean color system - black/white/gray only
export const COLORS = {
  // Text colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700', 
    tertiary: 'text-gray-500',
    caption: 'text-gray-400'
  },
  
  // UI elements
  heart: {
    liked: 'text-red-500',
    default: 'text-gray-700'
  },
  
  // Status badges
  status: {
    sold: 'bg-red-600 text-white shadow-lg',
    new: 'bg-green-600 text-white shadow-lg',
    condition: 'bg-blue-600 text-white shadow-lg'
  },
  
  // Backgrounds
  surface: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    tertiary: 'bg-gray-100'
  },
  
  // Borders
  border: {
    light: 'border-gray-100',
    medium: 'border-gray-200',
    dark: 'border-gray-300'
  }
} as const;

// Mobile-first typography scale (Instagram-inspired)
export const TYPOGRAPHY = {
  // Product titles - mobile optimized
  productTitle: 'text-lg font-semibold text-gray-900 leading-tight', // 18px max
  productSubtitle: 'text-sm font-medium text-gray-700',
  
  // Price display - much smaller and cleaner
  priceMain: 'text-xl font-bold text-gray-900', // 20px max (was 48px!)
  priceOriginal: 'text-base text-gray-500 line-through',
  priceSavings: 'text-sm text-green-600 font-medium',
  
  // Body text
  body: 'text-sm text-gray-700 leading-relaxed',
  bodySmall: 'text-xs text-gray-600',
  caption: 'text-xs text-gray-500',
  
  // Labels and metadata
  label: 'text-sm font-medium text-gray-900',
  labelSmall: 'text-xs font-medium text-gray-600',
  metaInfo: 'text-xs text-gray-500',
  
  // Instagram-style elements
  username: 'text-sm font-semibold text-gray-900',
  timestamp: 'text-xs text-gray-500'
} as const;

// Mobile-first spacing system (4px grid, Instagram-inspired)
export const SPACING = {
  // Section padding - tighter for mobile
  section: 'px-4 py-3',
  sectionTight: 'px-4 py-2',
  element: 'p-3',
  elementSmall: 'p-2',
  
  // Instagram-style spacing
  instagramActions: 'px-4 py-3', // Like, comment, share row
  instagramContent: 'px-4 py-2', // Caption and info
  
  // Gaps - mobile optimized
  large: 'gap-4',
  medium: 'gap-3', 
  small: 'gap-2',
  tight: 'gap-1',
  
  // Margins - reduced for mobile
  bottom: 'mb-3',
  bottomSmall: 'mb-2',
  bottomTiny: 'mb-1',
  top: 'mt-3',
  topSmall: 'mt-2'
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