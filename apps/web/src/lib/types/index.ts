// Seller types
export interface Seller {
  id: string;
  name: string;
  username?: string;
  premium: boolean;
  avatar: string | null;
  rating: number;
  itemCount: number;
  followers: number;
  description?: string;
}

// Product display types
export interface ProductDisplay {
  id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  brand?: string;
  size?: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  category: string;
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  sellerAvatar?: string;
  createdAt: string;
  location?: string;
}

// Promoted product type
export interface PromotedProduct {
  id: string;
  title: string;
  price: number;
  images: Array<{ image_url: string }>;
  seller_name?: string;
  seller_id: string;
}

// Category icons mapping
export const CATEGORY_ICONS: Record<string, string> = {
  'Women': '👗',
  'Men': '👔',
  'Kids': '👶',
  'Pets': '🐕',
  'Shoes': '👟',
  'Bags': '👜',
  'Home': '🏠',
  'Beauty': '💄'
} as const;

export const DEFAULT_CATEGORY_ICON = '📦';