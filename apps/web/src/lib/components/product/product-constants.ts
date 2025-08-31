// Clean product page design system

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

// Category translation mapping (temporary fallbacks until proper i18n keys are added)
export const CATEGORY_TRANSLATIONS: Record<string, () => string> = {
  // Level 1 - Gender categories
  'Women': () => 'Жени',
  'Men': () => 'Мъже',
  'Kids': () => 'Деца',
  'Unisex': () => 'Унисекс',
  
  // Level 2 - Product Types
  'Clothing': () => 'Дрехи',
  'Shoes': () => 'Обувки',
  'Accessories': () => 'Аксесоари',
  'Bags': () => 'Чанти',
  
  // Level 3 - Specific items
  'Activewear': () => 'Спортни дрехи',
  'Boots': () => 'Ботуши',
  'Dresses': () => 'Рокли',
  'Flats': () => 'Равни обувки',
  'Formal Shoes': () => 'Елегантни обувки',
  'Heels': () => 'Обувки с ток',
  'Hoodies': () => 'Суичъри',
  'Jackets': () => 'Якета',
  'Jackets & Coats': () => 'Якета и палта',
  'Jeans': () => 'Дънки',
  'Jewelry': () => 'Бижута',
  'Lingerie & Underwear': () => 'Дамско бельо',
  'Pants & Jeans': () => 'Панталони и дънки',
  'Pants & Trousers': () => 'Панталони',
  'Sandals': () => 'Сандали',
  'Sandals & Slides': () => 'Сандали и чехли',
  'Shirts': () => 'Ризи',
  'Shirts & Blouses': () => 'Ризи и блузи',
  'Shorts': () => 'Къси панталони',
  'Skirts': () => 'Поли',
  'Sneakers': () => 'Кецове',
  'Suits & Blazers': () => 'Костюми и сака',
  'Sweaters & Hoodies': () => 'Пуловери и суичъри',
  'Swimwear': () => 'Бански',
  'T-Shirts': () => 'Тениски',
  'Tops & T-Shirts': () => 'Топове и тениски',
  'Underwear': () => 'Бельо',
  'Watches': () => 'Часовници',
  
  // Level 3 - Accessory subcategories
  'Hats & Caps': () => 'Шапки',
  'Belts': () => 'Колани',
  'Scarves': () => 'Шалове',
  'Sunglasses': () => 'Слънчеви очила',
  'Wallets': () => 'Портфейли',
  'Hair Accessories': () => 'Аксесоари за коса',
  'Ties': () => 'Вратовръзки',
  'Cufflinks': () => 'Ръкавели',
  'Backpacks': () => 'Раници'
};

// Condition translations (matching database values) - temporary fallbacks
export const CONDITION_TRANSLATIONS = {
  'brand_new_with_tags': () => 'Ново с етикети',
  'new': () => 'Ново с етикети',
  'like_new': () => 'Като ново',
  'like-new': () => 'Като ново',
  'good': () => 'Добро състояние',
  'fair': () => 'Задоволително състояние',
  'poor': () => 'Задоволително състояние'
} as const;