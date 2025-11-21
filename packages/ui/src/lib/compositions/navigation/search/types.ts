// Stub search types to satisfy component imports; refine later with real shapes
import type { Category } from '../../../types';
import type { LanguageOption } from '../../../types/panels';

// Image object used by some product APIs
export interface ProductImage {
  id?: string;
  image_url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ProductWithImages {
  id: string;
  title: string;
  price: number;
  images?: ProductImage[] | string[]; // allow legacy string[] usage
  seller_username?: string;
  seller_id?: string;
  slug?: string;
  condition?: string;
  category_name?: string; // displayed in search results
  rating?: number; // average rating
}

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
  product_count?: number;
  // keep the same domain contract: 'level' present with number|null, not undefined
  level: number | null;
  parent_id?: string | null;
  emoji?: string; // UI decoration
};

export interface SearchSeller {
  id: string;
  username: string;
  avatar_url?: string;
  product_count?: number;
  total_products?: number; // alias
  rating?: number;
  is_verified?: boolean;
}

export interface Collection {
  key: string;
  title: string;
  label?: string; // displayed label (alias of title)
  product_count?: number;
  emoji?: string;
}

export interface CategoryBreadcrumb {
  slug: string;
  name: string;
}

// Minimal profile subset actually consumed by MobileNavigationDialog
export interface ProfileMinimal {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  rating?: number | null;
  total_sales?: number | null;
  products_count?: number | null;
}

// Strong translations contract (keys drawn from component default literal)
export interface MobileNavTranslations {
  sellItems: string;
  myProfile: string;
  startSelling: string;
  settings: string;
  signOut: string;
  signingOut: string;
  signIn: string;
  signUp: string;
  browseCategories: string;
  whatLookingFor: string; // 'What are you looking for?'
  browseAll: string;
  popularBrands: string;
  newToday: string;
  orders: string;
  favorites: string;
  categoryWomen: string;
  categoryMen: string;
  categoryKids: string;
  categoryUnisex: string;
  help: string;
  privacy: string;
  terms: string;
  returns: string;
  trustSafety: string;
  searchPlaceholder: string;
  quickActionsLabel: string;
  settingsLabel: string;
  supportLabel: string;
}

export interface MobileNavigationDialogProps {
  // Basic dialog state
  id?: string;
  isOpen: boolean;
  onClose: () => void;

  // User/session info
  isLoggedIn?: boolean;
  user?: ProfileMinimal | null;
  profile?: ProfileMinimal | null;
  userDisplayName?: string;
  initials?: string;
  canSell?: boolean;

  // i18n / language
  currentLanguage?: string;
  languages?: LanguageOption[];

  // Category data
  categories: CategoryWithChildren[];
  onCategoryClick?: (slug: string, level?: number, path?: string[]) => void;
  onCategorySelect?: (c: CategoryWithChildren) => void; // legacy

  // Actions / callbacks
  onSignOut?: () => void;
  onLanguageChange?: (lang: string) => void;
  searchFunction?: SearchFunction;

  // Notifications / counts
  unreadMessages?: number;
  unreadNotifications?: number;
  signingOut?: boolean;

  // Copy overrides
  translations?: Partial<MobileNavTranslations>;
}

export type SearchContext = 'search' | 'main' | 'category';

export interface SearchResultEnvelope<T> { data: T; error: string | null }

export type SearchFunction = (q: string) => ProductWithImages[] | Promise<ProductWithImages[]> | Promise<SearchResultEnvelope<ProductWithImages[]>>;

export interface SearchDropdownProps {
  query: string;
  context?: SearchContext;
  categoryContext?: string | CategoryWithChildren | null;
  onSearch?: SearchFunction;
  onSelect?: (product: ProductWithImages) => void;
  onClose?: () => void;
  maxResults?: number;
  showCategories?: boolean;
  class?: string;
  visible?: boolean;
  listboxId?: string;
  categories?: CategoryWithChildren[];
  sellers?: SearchSeller[];
  collections?: Collection[];
  onCategorySelect?: (category: CategoryWithChildren) => void;
  onSellerSelect?: (seller: SearchSeller) => void;
  onCollectionSelect?: (collection: Collection) => void;
  translations?: Record<string, string>;
  filterType?: 'products' | 'brands' | 'sellers';
}
