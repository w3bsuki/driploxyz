export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  brand?: string;
  size: string;
  condition: 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
  category?: string;
  category_name?: string;
  main_category_name?: string;
  subcategory_name?: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerAvatar?: string;
  createdAt: string;
  location?: string;
  tags?: string[];
  is_sold?: boolean;
  sold_at?: string;
  status?: string;
  favorite_count?: number;
  product_images?: Array<{
    id: string;
    image_url: string;
    alt_text?: string;
    sort_order?: number;
  }>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  memberSince: string;
  location?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  reviewerId: string;
  reviewerName: string;
  productId?: string;
  sellerId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  images?: string[];
  timestamp: string;
  read: boolean;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  size?: string[];
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  location?: string;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'relevance';
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type SearchBarVariant = 'hero' | 'power' | 'compact';
export type MegaMenuVariant = 'dropdown' | 'accordion';

export interface CategorySubcategory {
  name: string;
  icon: string;
  itemCount?: number;
}

export interface Category {
  name: string;
  icon: string;
  subcategories?: CategorySubcategory[];
  itemCount?: number;
}

export interface CategoryData {
  [key: string]: Category;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export interface Order {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  class?: string;
  aspectRatio?: 'square' | 'auto';
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  sizes?: string;
  onclick?: () => void;
}