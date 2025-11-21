
import type { Tables } from '@repo/database';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Use Supabase types as single source of truth for persisted data
export type Profile = Tables<'profiles'>;

export interface Seller extends Profile {
  // UI-specific fields not in database
  pro?: boolean;
  itemCount?: number;
  followers?: number;
  description?: string;
  is_verified?: boolean;
  total_products?: number;
  average_rating?: number;
  totalSales?: number;
  recentProducts?: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
  }>;
  // Computed display name fields (for component compatibility)
  name?: string;          // Computed from display_name || full_name || username
  displayName?: string;   // Computed display name (derived from database display_name)
  avatar?: string;        // Alias for avatar_url for component compatibility
}

// Lightweight variant accepted by UI components where full Profile is unnecessary
export type SellerLike = Pick<Seller, 'id' | 'username' | 'full_name' | 'avatar_url'> & {
  // Common optional fields used in cards/banners
  is_verified?: boolean;
  verified?: boolean; // allow alternative naming, normalized in components
  total_products?: number;
  average_rating?: number;
  account_type?: string;
  name?: string;
  avatar?: string;
};

// Replace manual interfaces with Supabase types as single source of truth
export type Category = Tables<'categories'>;
export type Order = Tables<'orders'>;
export type Message = Tables<'messages'>;
export type Review = Tables<'reviews'>;
export type Favorite = Tables<'favorites'>;

// Component Design System Types

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonDensity = 'spacious' | 'cozy' | 'compact';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'square';

// Extended to include 'subtle' styling variant and 'xs' size used in some components
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'subtle';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

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

// Navigation / Breadcrumb types (lightweight; not persisted)
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Payments (UI-facing subset of Stripe PaymentIntent we actually use)
export interface PaymentIntent {
  id: string;
  status: 'requires_payment_method' | 'requires_action' | 'processing' | 'succeeded' | 'canceled' | string;
  amount?: number;
  currency?: string;
  client_secret?: string | null;
}

// Cross-env timeout handle unified
export type Timeout = ReturnType<typeof setTimeout>;

// Filter Types
export * from './filters';

// Global type declarations
declare global {
  interface Window {
    Sentry?: {
      captureException?: (err: unknown, context?: unknown) => void;
    };
  }
}