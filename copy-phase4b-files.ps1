# Phase 4B Domain Package Restructure - File Copy Script
#
# This script copies files from the old domain structure to the new domain-driven design
# It preserves the old files as backup until testing passes
#
# Usage: .\copy-phase4b-files.ps1

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Base directory
$BaseDir = "K:\driplo-turbo-1\packages\domain\src"

Write-Host "🚀 Phase 4B: Domain Package Restructure - File Copy Script" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be copied" -ForegroundColor Yellow
}

if ($Verbose) {
    Write-Host "📝 Verbose mode enabled" -ForegroundColor Green
}

Write-Host ""

# Function to create directory if it doesn't exist
function EnsureDirectory {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Force -Path $Path | Out-Null
        }
        Write-Host "📁 Created directory: $Path" -ForegroundColor Green
    }
}

# Function to copy file with logging
function CopyDomainFile {
    param(
        [string]$Source,
        [string]$Target,
        [string]$Description = ""
    )

    $SourcePath = Join-Path $BaseDir $Source
    $TargetPath = Join-Path $BaseDir $Target

    if (-not (Test-Path $SourcePath)) {
        Write-Host "❌ Source file not found: $SourcePath" -ForegroundColor Red
        return $false
    }

    # Create target directory if needed
    $TargetDir = Split-Path $TargetPath -Parent
    EnsureDirectory $TargetDir

    if ($DryRun) {
        Write-Host "🔍 [DRY RUN] Would copy: $Source -> $Target" -ForegroundColor Yellow
        if ($Description) {
            Write-Host "   └─ $Description" -ForegroundColor Gray
        }
        return $true
    }

    try {
        Copy-Item -Path $SourcePath -Destination $TargetPath -Force
        Write-Host "✅ Copied: $Source -> $Target" -ForegroundColor Green
        if ($Description) {
            Write-Host "   └─ $Description" -ForegroundColor Gray
        }
        return $true
    }
    catch {
        Write-Host "❌ Failed to copy: $Source -> $Target" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to create new file with content
function CreateNewDomainFile {
    param(
        [string]$Path,
        [string]$Content,
        [string]$Description = ""
    )

    $TargetPath = Join-Path $BaseDir $Path

    # Create target directory if needed
    $TargetDir = Split-Path $TargetPath -Parent
    EnsureDirectory $TargetDir

    if ($DryRun) {
        Write-Host "🔍 [DRY RUN] Would create: $Path" -ForegroundColor Yellow
        if ($Description) {
            Write-Host "   └─ $Description" -ForegroundColor Gray
        }
        return $true
    }

    try {
        Set-Content -Path $TargetPath -Value $Content -NoNewline
        Write-Host "📝 Created: $Path" -ForegroundColor Blue
        if ($Description) {
            Write-Host "   └─ $Description" -ForegroundColor Gray
        }
        return $true
    }
    catch {
        Write-Host "❌ Failed to create: $Path" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "📦 Starting domain restructure..." -ForegroundColor Cyan
Write-Host ""

# Track success/failure
$SuccessCount = 0
$FailureCount = 0

# ==========================================
# PRODUCTS DOMAIN - Restructure existing well-organized domain
# ==========================================
Write-Host "🏷️  PRODUCTS DOMAIN" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta

# Copy entities to types (this will be consolidated with other files)
CopyDomainFile -Source "services\products\entities.ts" -Target "products\types-temp-entities.ts" -Description "Domain entities"
CopyDomainFile -Source "services\products\ports.ts" -Target "products\types-temp-ports.ts" -Description "Repository interfaces"
CopyDomainFile -Source "services\products\value-objects.ts" -Target "products\types-temp-value-objects.ts" -Description "Value objects"
CopyDomainFile -Source "services\products\repos.ts" -Target "products\services-temp-repos.ts" -Description "Repository implementations"
CopyDomainFile -Source "services\products\services.ts" -Target "products\services-temp-services.ts" -Description "Business logic services"
CopyDomainFile -Source "services\products\__tests__\services.test.ts" -Target "products\__tests__\services.test.ts" -Description "Tests"

# ==========================================
# ORDERS DOMAIN - Expand existing simple domain
# ==========================================
Write-Host ""
Write-Host "📋 ORDERS DOMAIN" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta

CopyDomainFile -Source "services\orders\index.ts" -Target "orders\services.ts" -Description "Order services (expand from simple export)"

# ==========================================
# USERS DOMAIN - Create from existing profiles
# ==========================================
Write-Host ""
Write-Host "👤 USERS DOMAIN" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta

CopyDomainFile -Source "services\profiles\index.ts" -Target "users\services.ts" -Description "User services (from profiles)"

# ==========================================
# PAYMENTS DOMAIN - Expand existing simple domain
# ==========================================
Write-Host ""
Write-Host "💳 PAYMENTS DOMAIN" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta

CopyDomainFile -Source "services\payments\index.ts" -Target "payments\services.ts" -Description "Payment services (expand from simple export)"

# ==========================================
# SHARED DOMAIN - Move existing shared items
# ==========================================
Write-Host ""
Write-Host "🔗 SHARED DOMAIN" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta

CopyDomainFile -Source "types\index.ts" -Target "shared\types.ts" -Description "Shared types"
CopyDomainFile -Source "validation\index.ts" -Target "shared\validation.ts" -Description "Shared validation utilities"

# ==========================================
# CREATE NEW DOMAIN FILES
# ==========================================

# Products domain - consolidation and new files
Write-Host ""
Write-Host "📝 CREATING NEW DOMAIN FILES" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Products types (consolidated file)
$ProductsTypesContent = @'
/**
 * Products Domain Types
 *
 * Consolidated types from entities, ports, and value-objects
 */

// Import Database types
import type { Database } from '@repo/database';

/**
 * Domain entity for a Product
 * Represents a product with all its business logic invariants
 */
export interface Product {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly price: Money;
  readonly condition: ProductCondition;
  readonly size?: string;
  readonly brand?: string;
  readonly color?: string;
  readonly material?: string;
  readonly location: string;
  readonly country_code: string;
  readonly region?: string;
  readonly slug: Slug;
  readonly seller_id: string;
  readonly category_id: string;
  readonly is_active: boolean;
  readonly is_sold: boolean;
  readonly view_count: number;
  readonly favorite_count: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  // Joined data
  readonly images: ProductImage[];
  readonly category_name?: string;
  readonly seller_username?: string;
  readonly seller_rating?: number;
}

/**
 * Domain entity for a Category
 */
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly slug: Slug;
  readonly parent_id?: string;
  readonly level: number;
  readonly sort_order: number;
  readonly is_active: boolean;
  readonly image_url?: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  // Computed properties
  readonly product_count?: number;
  readonly children?: Category[];
}

/**
 * Domain entity for Product Images
 */
export interface ProductImage {
  readonly id: string;
  readonly product_id: string;
  readonly image_url: string;
  readonly alt_text?: string;
  readonly display_order: number;
  readonly sort_order?: number;
  readonly created_at: Date;
}

/**
 * Value Objects
 */

export interface Money {
  readonly amount: number;
  readonly currency: string; // ISO 4217 currency code
}

export interface Slug {
  readonly value: string;
}

export type ProductCondition =
  | 'brand_new_with_tags'
  | 'new_without_tags'
  | 'like_new'
  | 'good'
  | 'worn'
  | 'fair';

/**
 * Domain-specific error types
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly type: 'not_found' | 'validation' | 'policy' | 'conflict';
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly type = 'not_found' as const;

  constructor(entity: string, identifier?: string) {
    super(`${entity}${identifier ? ` with identifier ${identifier}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

export class ProductValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly type = 'validation' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class PolicyError extends DomainError {
  readonly code = 'POLICY_ERROR';
  readonly type = 'policy' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PolicyError';
  }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT_ERROR';
  readonly type = 'conflict' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * Result type for domain operations
 */
export type Result<T, E = DomainError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper functions for working with Results
 */
export const Ok = <T, E = never>(data: T): Result<T, E> => ({ success: true, data });

export const Err = <E extends DomainError>(error: E): Result<never, E> => ({
  success: false,
  error
});

/**
 * Repository interfaces
 */
export interface ProductSearchParams {
  query?: string;
  category_id?: string;
  condition?: ProductCondition;
  min_price?: number;
  max_price?: number;
  location?: string;
  seller_id?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'price' | 'view_count' | 'favorite_count';
  sort_order?: 'asc' | 'desc';
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  has_more: boolean;
}

export interface ProductRepository {
  findBySlug(slug: string): Promise<Result<Product, NotFoundError>>;
  search(params: ProductSearchParams): Promise<Result<ProductSearchResult>>;
  findByCategory(categoryId: string, params?: Omit<ProductSearchParams, 'category_id'>): Promise<Result<ProductSearchResult>>;
  getFeatured(limit?: number): Promise<Result<Product[]>>;
  create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'favorite_count' | 'images'>): Promise<Result<Product>>;
}

export interface CategoryRepository {
  findBySlug(slug: string): Promise<Result<Category, NotFoundError>>;
  findTree(): Promise<Result<Category[]>>;
  findChildren(parentId?: string): Promise<Result<Category[]>>;
}

/**
 * Database type mappings
 */
export type DbProduct = Database['public']['Tables']['products']['Row'];
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbProductImage = Database['public']['Tables']['product_images']['Row'];
'@

CreateNewDomainFile -Path "products\types.ts" -Content $ProductsTypesContent -Description "Consolidated products types"

# Products services (consolidated file)
$ProductsServicesContent = @'
/**
 * Products Domain Services
 *
 * Business logic for product and category operations
 */

import type { Product, Category, ProductSearchParams, ProductSearchResult, ProductRepository, CategoryRepository, Result } from './types.js';

// Service classes will be moved here from temp files
// TODO: Consolidate services-temp-services.ts and services-temp-repos.ts

export const ProductService = {
  // Placeholder for product services
  // Will be populated by consolidating existing service files
} as const;

export const CategoryService = {
  // Placeholder for category services
  // Will be populated by consolidating existing service files
} as const;
'@

CreateNewDomainFile -Path "products\services.ts" -Content $ProductsServicesContent -Description "Products services placeholder"

# Products validation
$ProductsValidationContent = @'
/**
 * Products Domain Validation
 *
 * Validation rules for products and categories
 */

import type { Product, Category, Money, Slug, ProductCondition } from './types.js';

export function validateMoney(value: number, currency: string): Money {
  if (value < 0) {
    throw new Error('Money amount cannot be negative');
  }

  if (!currency || currency.length !== 3) {
    throw new Error('Currency must be a valid 3-letter ISO code');
  }

  return { amount: value, currency };
}

export function validateSlug(value: string): Slug {
  if (!value || value.trim().length === 0) {
    throw new Error('Slug cannot be empty');
  }

  if (!/^[a-z0-9-]+$/.test(value)) {
    throw new Error('Slug can only contain lowercase letters, numbers, and hyphens');
  }

  return { value: value.toLowerCase().trim() };
}

export function validateProductCondition(condition: string): ProductCondition {
  const validConditions: ProductCondition[] = [
    'brand_new_with_tags',
    'new_without_tags',
    'like_new',
    'good',
    'worn',
    'fair'
  ];

  if (!validConditions.includes(condition as ProductCondition)) {
    throw new Error(`Invalid product condition: ${condition}`);
  }

  return condition as ProductCondition;
}

export function validateProductTitle(title: string): string {
  if (!title || title.trim().length === 0) {
    throw new Error('Product title cannot be empty');
  }

  if (title.length > 200) {
    throw new Error('Product title cannot exceed 200 characters');
  }

  return title.trim();
}

export function validateProductDescription(description: string): string {
  if (description.length > 2000) {
    throw new Error('Product description cannot exceed 2000 characters');
  }

  return description.trim();
}
'@

CreateNewDomainFile -Path "products\validation.ts" -Content $ProductsValidationContent -Description "Products validation rules"

# Products index
$ProductsIndexContent = @'
/**
 * Products Domain
 *
 * Public exports for the products domain
 */

// Export all types
export * from './types.js';

// Export all services
export * from './services.js';

// Export validation
export * from './validation.js';

// Re-export commonly used items for convenience
export type {
  Product,
  Category,
  ProductImage,
  Money,
  Slug,
  ProductCondition,
  ProductSearchParams,
  ProductSearchResult,
  ProductRepository,
  CategoryRepository,
  Result
} from './types.js';

export {
  ProductService,
  CategoryService
} from './services.js';

export {
  validateMoney,
  validateSlug,
  validateProductCondition,
  validateProductTitle,
  validateProductDescription
} from './validation.js';
'@

CreateNewDomainFile -Path "products\index.ts" -Content $ProductsIndexContent -Description "Products domain index"

# Orders types
$OrdersTypesContent = @'
/**
 * Orders Domain Types
 *
 * Order-related types and interfaces
 */

export interface Order {
  readonly id: string;
  readonly buyer_id: string;
  readonly seller_id: string;
  readonly product_id: string;
  readonly quantity: number;
  readonly unit_price: number;
  readonly total_price: number;
  readonly status: OrderStatus;
  readonly shipping_address: ShippingAddress;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface ShippingAddress {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postal_code: string;
  readonly country: string;
}

export interface OrderItem {
  readonly id: string;
  readonly order_id: string;
  readonly product_id: string;
  readonly quantity: number;
  readonly unit_price: number;
  readonly total_price: number;
}
'@

CreateNewDomainFile -Path "orders\types.ts" -Content $OrdersTypesContent -Description "Orders types"

# Orders validation
$OrdersValidationContent = @'
/**
 * Orders Domain Validation
 *
 * Validation rules for orders
 */

import type { Order, OrderStatus } from './types.js';

export function validateOrderStatus(status: string): OrderStatus {
  const validStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ];

  if (!validStatuses.includes(status as OrderStatus)) {
    throw new Error(`Invalid order status: ${status}`);
  }

  return status as OrderStatus;
}

export function validateOrderQuantity(quantity: number): number {
  if (quantity <= 0) {
    throw new Error('Order quantity must be positive');
  }

  if (quantity > 100) {
    throw new Error('Order quantity cannot exceed 100 items');
  }

  return quantity;
}
'@

CreateNewDomainFile -Path "orders\validation.ts" -Content $OrdersValidationContent -Description "Orders validation rules"

# Orders index
$OrdersIndexContent = @'
/**
 * Orders Domain
 *
 * Public exports for the orders domain
 */

// Export all types
export * from './types.js';

// Export all services
export * from './services.js';

// Export validation
export * from './validation.js';

// Re-export commonly used items
export type {
  Order,
  OrderStatus,
  ShippingAddress,
  OrderItem
} from './types.js';

export { OrdersDomain } from './services.js';

export {
  validateOrderStatus,
  validateOrderQuantity
} from './validation.js';
'@

CreateNewDomainFile -Path "orders\index.ts" -Content $OrdersIndexContent -Description "Orders domain index"

# Users types
$UsersTypesContent = @'
/**
 * Users Domain Types
 *
 * User-related types and interfaces
 */

export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly first_name?: string;
  readonly last_name?: string;
  readonly avatar_url?: string;
  readonly bio?: string;
  readonly location?: string;
  readonly rating?: number;
  readonly review_count?: number;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface UserProfile {
  readonly user_id: string;
  readonly display_name: string;
  readonly bio?: string;
  readonly location?: string;
  readonly website?: string;
  readonly social_links?: SocialLink[];
  readonly preferences: UserPreferences;
}

export interface SocialLink {
  readonly platform: string;
  readonly url: string;
}

export interface UserPreferences {
  readonly email_notifications: boolean;
  readonly push_notifications: boolean;
  readonly marketing_emails: boolean;
  readonly language: string;
  readonly currency: string;
}
'@

CreateNewDomainFile -Path "users\types.ts" -Content $UsersTypesContent -Description "Users types"

# Users validation
$UsersValidationContent = @'
/**
 * Users Domain Validation
 *
 * Validation rules for users
 */

import type { User } from './types.js';

export function validateUsername(username: string): string {
  if (!username || username.trim().length === 0) {
    throw new Error('Username cannot be empty');
  }

  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }

  if (username.length > 30) {
    throw new Error('Username cannot exceed 30 characters');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
  }

  return username.trim();
}

export function validateEmail(email: string): string {
  if (!email || email.trim().length === 0) {
    throw new Error('Email cannot be empty');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  return email.toLowerCase().trim();
}
'@

CreateNewDomainFile -Path "users\validation.ts" -Content $UsersValidationContent -Description "Users validation rules"

# Users index
$UsersIndexContent = @'
/**
 * Users Domain
 *
 * Public exports for the users domain
 */

// Export all types
export * from './types.js';

// Export all services
export * from './services.js';

// Export validation
export * from './validation.js';

// Re-export commonly used items
export type {
  User,
  UserProfile,
  SocialLink,
  UserPreferences
} from './types.js';

export {
  validateUsername,
  validateEmail
} from './validation.js';
'@

CreateNewDomainFile -Path "users\index.ts" -Content $UsersIndexContent -Description "Users domain index"

# Payments types
$PaymentsTypesContent = @'
/**
 * Payments Domain Types
 *
 * Payment-related types and interfaces
 */

export interface Payment {
  readonly id: string;
  readonly order_id: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly payment_method: PaymentMethod;
  readonly transaction_id?: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'stripe'
  | 'bank_transfer';

export interface PaymentIntent {
  readonly id: string;
  readonly amount: number;
  readonly currency: string;
  readonly payment_method: PaymentMethod;
  readonly client_secret?: string;
}

export interface Refund {
  readonly id: string;
  readonly payment_id: string;
  readonly amount: number;
  readonly reason?: string;
  readonly status: RefundStatus;
  readonly created_at: Date;
}

export type RefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';
'@

CreateNewDomainFile -Path "payments\types.ts" -Content $PaymentsTypesContent -Description "Payments types"

# Payments validation
$PaymentsValidationContent = @'
/**
 * Payments Domain Validation
 *
 * Validation rules for payments
 */

import type { PaymentStatus, PaymentMethod } from './types.js';

export function validatePaymentStatus(status: string): PaymentStatus {
  const validStatuses: PaymentStatus[] = [
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
  ];

  if (!validStatuses.includes(status as PaymentStatus)) {
    throw new Error(`Invalid payment status: ${status}`);
  }

  return status as PaymentStatus;
}

export function validatePaymentMethod(method: string): PaymentMethod {
  const validMethods: PaymentMethod[] = [
    'credit_card',
    'debit_card',
    'paypal',
    'stripe',
    'bank_transfer'
  ];

  if (!validMethods.includes(method as PaymentMethod)) {
    throw new Error(`Invalid payment method: ${method}`);
  }

  return method as PaymentMethod;
}

export function validatePaymentAmount(amount: number): number {
  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }

  if (amount > 100000) {
    throw new Error('Payment amount cannot exceed $100,000');
  }

  return Math.round(amount * 100) / 100; // Round to 2 decimal places
}
'@

CreateNewDomainFile -Path "payments\validation.ts" -Content $PaymentsValidationContent -Description "Payments validation rules"

# Payments index
$PaymentsIndexContent = @'
/**
 * Payments Domain
 *
 * Public exports for the payments domain
 */

// Export all types
export * from './types.js';

// Export all services
export * from './services.js';

// Export validation
export * from './validation.js';

// Re-export commonly used items
export type {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentIntent,
  Refund,
  RefundStatus
} from './types.js';

export {
  validatePaymentStatus,
  validatePaymentMethod,
  validatePaymentAmount
} from './validation.js';
'@

CreateNewDomainFile -Path "payments\index.ts" -Content $PaymentsIndexContent -Description "Payments domain index"

# Cart domain (completely new)
$CartTypesContent = @'
/**
 * Cart Domain Types
 *
 * Shopping cart related types and interfaces
 */

export interface Cart {
  readonly id: string;
  readonly user_id: string;
  readonly items: CartItem[];
  readonly total_amount: number;
  readonly currency: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface CartItem {
  readonly id: string;
  readonly cart_id: string;
  readonly product_id: string;
  readonly quantity: number;
  readonly unit_price: number;
  readonly total_price: number;
  readonly added_at: Date;
}

export interface AddToCartRequest {
  readonly product_id: string;
  readonly quantity: number;
}

export interface UpdateCartItemRequest {
  readonly quantity: number;
}
'@

CreateNewDomainFile -Path "cart\types.ts" -Content $CartTypesContent -Description "Cart types"

$CartServicesContent = @'
/**
 * Cart Domain Services
 *
 * Business logic for shopping cart operations
 */

import type { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from './types.js';

export const CartService = {
  // Placeholder for cart services
  addToCart: (userId: string, request: AddToCartRequest): Promise<Cart> => {
    // TODO: Implement add to cart logic
    throw new Error('Not implemented');
  },

  updateCartItem: (cartItemId: string, request: UpdateCartItemRequest): Promise<CartItem> => {
    // TODO: Implement update cart item logic
    throw new Error('Not implemented');
  },

  removeFromCart: (cartItemId: string): Promise<void> => {
    // TODO: Implement remove from cart logic
    throw new Error('Not implemented');
  },

  getCart: (userId: string): Promise<Cart> => {
    // TODO: Implement get cart logic
    throw new Error('Not implemented');
  },

  clearCart: (userId: string): Promise<void> => {
    // TODO: Implement clear cart logic
    throw new Error('Not implemented');
  }
} as const;
'@

CreateNewDomainFile -Path "cart\services.ts" -Content $CartServicesContent -Description "Cart services"

$CartValidationContent = @'
/**
 * Cart Domain Validation
 *
 * Validation rules for shopping cart operations
 */

export function validateCartItemQuantity(quantity: number): number {
  if (quantity <= 0) {
    throw new Error('Cart item quantity must be positive');
  }

  if (quantity > 10) {
    throw new Error('Cannot add more than 10 of the same item to cart');
  }

  return quantity;
}

export function validateCartItemCount(itemCount: number): void {
  if (itemCount > 50) {
    throw new Error('Cart cannot contain more than 50 items');
  }
}

export function validateCartTotalAmount(amount: number): void {
  if (amount <= 0) {
    throw new Error('Cart total amount must be positive');
  }

  if (amount > 10000) {
    throw new Error('Cart total amount cannot exceed $10,000');
  }
}
'@

CreateNewDomainFile -Path "cart\validation.ts" -Content $CartValidationContent -Description "Cart validation rules"

$CartIndexContent = @'
/**
 * Cart Domain
 *
 * Public exports for the cart domain
 */

// Export all types
export * from './types.js';

// Export all services
export * from './services.js';

// Export validation
export * from './validation.js';

// Re-export commonly used items
export type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest
} from './types.js';

export { CartService } from './services.js';

export {
  validateCartItemQuantity,
  validateCartItemCount,
  validateCartTotalAmount
} from './validation.js';
'@

CreateNewDomainFile -Path "cart\index.ts" -Content $CartIndexContent -Description "Cart domain index"

# Auth domain (business rules only)
$AuthTypesContent = @'
/**
 * Auth Domain Types
 *
 * Authentication-related types (business rules only)
 */

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly is_verified: boolean;
  readonly is_active: boolean;
  readonly roles: AuthRole[];
  readonly created_at: Date;
  readonly last_login?: Date;
}

export type AuthRole =
  | 'user'
  | 'admin'
  | 'moderator';

export interface AuthSession {
  readonly id: string;
  readonly user_id: string;
  readonly expires_at: Date;
  readonly is_active: boolean;
}

export interface AuthCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AuthRegistration {
  readonly email: string;
  readonly username: string;
  readonly password: string;
  readonly confirm_password: string;
}
'@

CreateNewDomainFile -Path "auth\types.ts" -Content $AuthTypesContent -Description "Auth types"

$AuthServicesContent = @'
/**
 * Auth Domain Services
 *
 * Authentication business rules (no framework-specific code)
 */

import type { AuthUser, AuthCredentials, AuthRegistration, AuthSession } from './types.js';

export const AuthService = {
  // Business rules for authentication
  validatePassword: (password: string): boolean => {
    // Password must be at least 8 characters
    if (password.length < 8) {
      return false;
    }

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return false;
    }

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return false;
    }

    // Must contain at least one number
    if (!/\d/.test(password)) {
      return false;
    }

    return true;
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  canUserLogin: (user: AuthUser): boolean => {
    return user.is_active && user.is_verified;
  },

  isSessionValid: (session: AuthSession): boolean => {
    return session.is_active && new Date() < session.expires_at;
  }
} as const;
'@

CreateNewDomainFile -Path "auth\services.ts" -Content $AuthServicesContent -Description "Auth services (business rules only)"

$AuthValidationContent = @'
/**
 * Auth Domain Validation
 *
 * Validation rules for authentication
 */

import type { AuthRegistration, AuthCredentials } from './types.js';

export function validateAuthRegistration(registration: AuthRegistration): void {
  // Validate email
  if (!registration.email || registration.email.trim().length === 0) {
    throw new Error('Email is required');
  }

  // Validate username
  if (!registration.username || registration.username.trim().length === 0) {
    throw new Error('Username is required');
  }

  if (registration.username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }

  // Validate password
  if (!registration.password || registration.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (registration.password !== registration.confirm_password) {
    throw new Error('Passwords do not match');
  }
}

export function validateAuthCredentials(credentials: AuthCredentials): void {
  if (!credentials.email || credentials.email.trim().length === 0) {
    throw new Error('Email is required');
  }

  if (!credentials.password || credentials.password.length === 0) {
    throw new Error('Password is required');
  }
}
'@

CreateNewDomainFile -Path "auth\validation.ts" -Content $AuthValidationContent -Description "Auth validation rules"

$AuthIndexContent = @'
/**
 * Auth Domain
 *
 * Public exports for the auth domain (business rules only)
 */

// Export all types
export * from './types.js';

// Export all services
export * from './services.js';

// Export validation
export * from './validation.js';

// Re-export commonly used items
export type {
  AuthUser,
  AuthRole,
  AuthSession,
  AuthCredentials,
  AuthRegistration
} from './types.js';

export { AuthService } from './services.js';

export {
  validateAuthRegistration,
  validateAuthCredentials
} from './validation.js';
'@

CreateNewDomainFile -Path "auth\index.ts" -Content $AuthIndexContent -Description "Auth domain index"

# Shared domain index
$SharedIndexContent = @'
/**
 * Shared Domain
 *
 * Shared utilities and types for all domains
 */

// Export shared types
export * from './types.js';

// Export shared validation
export * from './validation.js';
'@

CreateNewDomainFile -Path "shared\index.ts" -Content $SharedIndexContent -Description "Shared domain index"

Write-Host ""
Write-Host "✅ Domain file creation completed!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "========" -ForegroundColor Cyan
Write-Host "Files processed: See above for details"
Write-Host ""
Write-Host "🔍 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update package.json exports (Step 5)"
Write-Host "2. Create import fix scripts (Step 6)"
Write-Host "3. Run import fix scripts (Step 7)"
Write-Host "4. Test domain package build (Step 9)"
Write-Host "5. Test dev server (Step 11)"
Write-Host "6. Delete old files (Step 12)"
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN COMPLETED - No files were actually copied" -ForegroundColor Yellow
    Write-Host "Run without -DryRun switch to execute the file copy operations" -ForegroundColor Yellow
} else {
    Write-Host "🎉 FILE COPY COMPLETED - New domain structure created!" -ForegroundColor Green
    Write-Host "Old files preserved as backup until testing passes" -ForegroundColor Green
}