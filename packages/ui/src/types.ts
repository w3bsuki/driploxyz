export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  brand?: string;
  size: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  category: string;
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