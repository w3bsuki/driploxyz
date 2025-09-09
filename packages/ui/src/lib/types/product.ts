/**
 * Product Page (PDP) Type Definitions
 * 
 * Comprehensive type definitions for the Product Detail Page ecosystem.
 * These types extend the base Product and Review types with additional
 * properties specific to PDP functionality.
 */

import type { Product, Review, Profile } from './index';

// Core Product Page Data Types

export interface ProductData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  brand?: string | null;
  condition: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  images: string[];
  is_sold: boolean | null;
  favorite_count: number;
  view_count?: number;
  location?: string;
  categories?: {
    id?: string;
    name?: string;
    slug?: string;
    parent_id?: string | null;
  };
  parent_category?: {
    name?: string;
    slug?: string;
  } | null;
  seller: {
    id: string;
    username: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    rating?: number | null;
    bio?: string | null;
    created_at: string | null;
    sales_count?: number | null;
  };
}

export interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  reviewer?: {
    id: string;
    username: string | null;
    avatar_url?: string | null;
  };
  reviewer_name?: string;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    [key: number]: number; // rating -> count
  };
}

// Derived Component Types

export interface BuyBoxProduct {
  id: string;
  price: number;
  originalPrice?: number;
  currency: string;
  title: string;
  isSold: boolean;
  viewCount?: number;
  location?: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  aspectRatio?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export interface SellerStats {
  rating: number;
  totalSales: number;
  responseTime: number; // hours
  joinedDate: string;
  verificationLevel: 'basic' | 'verified' | 'pro';
  lastActive: string;
}

export interface ProductQuickFacts {
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  condition: string;
  category?: string;
}

// Event Handler Types

export interface ProductPageEventHandlers {
  onFavorite?: () => Promise<{favoriteCount: number, favorited: boolean} | undefined> | void;
  onMessage?: () => void;
  onBuyNow?: () => void;
  onMakeOffer?: () => void;
  onNavigate?: (url: string) => void;
  onShare?: () => void;
  onReportItem?: () => void;
  onViewSeller?: (sellerId: string) => void;
}

export interface GalleryEventHandlers {
  onImageSelect?: (index: number) => void;
  onImageLoad?: (index: number) => void;
  onImageError?: (index: number) => void;
  onZoomToggle?: (enabled: boolean) => void;
}

export interface ReviewEventHandlers {
  onReviewLoad?: (page: number) => void;
  onReviewSubmit?: (review: Omit<ReviewData, 'id' | 'created_at'>) => void;
  onReviewReport?: (reviewId: string) => void;
  onReviewHelpful?: (reviewId: string, helpful: boolean) => void;
}

// Component Props Interfaces

export interface ProductPageProps {
  product: ProductData;
  reviews?: ReviewData[];
  ratingSummary?: RatingSummary | null;
  similarProducts?: ProductData[];
  sellerProducts?: ProductData[];
  isOwner?: boolean;
  isAuthenticated?: boolean;
  isFavorited?: boolean;
  showQuickFacts?: boolean;
  showStickyHeader?: boolean;
  currentUrl?: string;
  eventHandlers?: ProductPageEventHandlers;
}

export interface ProductGalleryProps {
  images: GalleryImage[] | string[];
  title: string;
  isSold?: boolean;
  condition?: string;
  selectedIndex?: number;
  showThumbnails?: boolean;
  showZoom?: boolean;
  aspectRatio?: string;
  eventHandlers?: GalleryEventHandlers;
}

export interface ProductInfoProps {
  title: string;
  quickFacts: ProductQuickFacts;
  description?: string;
  showQuickFacts?: boolean;
  showTrustBadges?: boolean;
  expandedByDefault?: boolean;
}

export interface BuyBoxProps {
  product: BuyBoxProduct;
  isOwner?: boolean;
  hasUser?: boolean;
  className?: string;
  eventHandlers?: Pick<ProductPageEventHandlers, 'onBuyNow' | 'onMessage' | 'onMakeOffer'>;
}

export interface SellerCardProps {
  id: string;
  name: string;
  avatar?: string;
  stats: SellerStats;
  translations: Record<string, string>;
  eventHandlers?: Pick<ProductPageEventHandlers, 'onMessage' | 'onViewSeller'>;
}

export interface ReviewsSectionProps {
  reviews: ReviewData[];
  ratingSummary?: RatingSummary;
  showAll?: boolean;
  maxInitialReviews?: number;
  eventHandlers?: ReviewEventHandlers;
}

// Utility Types

export type ProductCondition = 
  | 'brand_new_with_tags'
  | 'brand_new_without_tags' 
  | 'like_new'
  | 'good'
  | 'worn'
  | 'fair';

export type ProductSize = 
  | 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  | 'UK4' | 'UK6' | 'UK8' | 'UK10' | 'UK12' | 'UK14' | 'UK16' | 'UK18'
  | 'EU34' | 'EU36' | 'EU38' | 'EU40' | 'EU42' | 'EU44' | 'EU46' | 'EU48'
  | string;

export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'BGN';

export interface PriceFormatOptions {
  currency: CurrencyCode;
  locale?: string;
  showSymbol?: boolean;
  precision?: number;
}

// Navigation and URL Types

export interface ProductPageUrl {
  seller: string;
  slug: string;
  id?: string; // for legacy support
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface ProductBreadcrumbs {
  items: BreadcrumbItem[];
  structuredData?: object; // JSON-LD schema
}

// Error and Loading States

export type ProductPageLoadingState = 
  | 'idle'
  | 'loading' 
  | 'success'
  | 'error'
  | 'not-found';

export interface ProductPageError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ProductPageState {
  loading: ProductPageLoadingState;
  error?: ProductPageError;
  data?: ProductData;
}

// Feature Flags and Configuration

export interface ProductPageConfig {
  enableStickyHeader: boolean;
  enableQuickFacts: boolean;
  enableReviews: boolean;
  enableRecommendations: boolean;
  enableSocialSharing: boolean;
  maxSimilarProducts: number;
  maxSellerProducts: number;
  lazyLoadThreshold: number;
  performanceMode: 'standard' | 'optimized';
}

// Analytics and Tracking

export interface ProductPageAnalytics {
  productView: (product: ProductData) => void;
  galleryInteraction: (action: string, imageIndex?: number) => void;
  ctaClick: (action: 'buy' | 'message' | 'offer' | 'favorite') => void;
  sectionView: (section: string) => void;
  shareProduct: (method: string) => void;
  errorTracking: (error: ProductPageError) => void;
}

// Type Guards and Validators

export function isProductData(obj: unknown): obj is ProductData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'price' in obj &&
    'currency' in obj &&
    'images' in obj &&
    'seller' in obj
  );
}

export function isReviewData(obj: unknown): obj is ReviewData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'rating' in obj &&
    typeof (obj as ReviewData).rating === 'number' &&
    (obj as ReviewData).rating >= 1 &&
    (obj as ReviewData).rating <= 5
  );
}

// Compatibility with existing types
export type LegacyProduct = Product;
export type LegacyReview = Review;