
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  rating?: number;
  reviews_count: number;
  sales_count: number;
  purchases_count: number;
  followers_count: number;
  following_count: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  account_type?: string;
  verification_status?: string;
  subscription_tier?: string;
  subscription_expires_at?: string;
  role?: 'buyer' | 'seller' | 'admin';  // Database field for role-based checks
}

export interface Seller extends Profile {
  verification_status?: 'unverified' | 'pending' | 'verified';
  shop_name?: string;
  shop_banner?: string;
  pro?: boolean;
  itemCount?: number;
  followers?: number;
  description?: string;
  account_type?: 'new' | 'pro' | 'brand';
  is_verified?: boolean;
  total_products?: number;
  average_rating?: number;
  full_name?: string;
  totalSales?: number;
  recentProducts?: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
  }>;
  // Computed display name fields (for component compatibility)
  name?: string;          // Computed from display_name || full_name || username
  displayName?: string;   // Computed display name
  avatar?: string;        // Alias for avatar_url for component compatibility
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  shipping_address?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id?: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  product_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Component Design System Types

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'square';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error' | 'success';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';

// Component State Types
export type ComponentState = 'default' | 'loading' | 'error' | 'success' | 'disabled';

// Design System Token Types
export interface DesignTokens {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    neutral: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    error: Record<string, string>;
  };
  spacing: Record<string, string>;
  typography: {
    fontSizes: Record<string, string>;
    fontWeights: Record<string, string>;
    lineHeights: Record<string, string>;
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Responsive Breakpoint Types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Animation Types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce' | 'spin';
export type AnimationDuration = 'fast' | 'normal' | 'slow';

// Accessibility Types
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabindex?: number;
}

// Translation/i18n Types
export interface Translations {
  [key: string]: string | Translations;
}

// Product Page (PDP) Types
export * from './product';

// Search Types
export * from './search';