// Use Seller type from @repo/ui instead

// Import types for Locals interface
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type { CountryCode } from '$lib/country/detection';
import type { LanguageTag } from '@repo/i18n';

// Define Locals type for use in services
export interface Locals {
  supabase: SupabaseClient<Database>;
  safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
  session: Session | null;
  user: User | null;
  country: CountryCode;
  locale: LanguageTag;
  cspNonce?: string;
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
  condition: 'new' | 'like_new' | 'good' | 'fair';
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