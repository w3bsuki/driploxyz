# Phase 4B Domain Package Restructure - File Copy Script (Fixed Version)
param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"
$BaseDir = "K:\driplo-turbo-1\packages\domain\src"

Write-Host "🚀 Phase 4B: Domain Package Restructure - File Copy Script" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be copied" -ForegroundColor Yellow
}

function EnsureDirectory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Force -Path $Path | Out-Null
        }
        Write-Host "📁 Created directory: $Path" -ForegroundColor Green
    }
}

function CopyDomainFile {
    param([string]$Source, [string]$Target)
    $SourcePath = Join-Path $BaseDir $Source
    $TargetPath = Join-Path $BaseDir $Target

    if (-not (Test-Path $SourcePath)) {
        Write-Host "❌ Source not found: $SourcePath" -ForegroundColor Red
        return
    }

    $TargetDir = Split-Path $TargetPath -Parent
    EnsureDirectory $TargetDir

    if ($DryRun) {
        Write-Host "🔍 Would copy: $Source -> $Target" -ForegroundColor Yellow
        return
    }

    try {
        Copy-Item -Path $SourcePath -Destination $TargetPath -Force
        Write-Host "✅ Copied: $Source -> $Target" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed: $Source -> $Target" -ForegroundColor Red
    }
}

function CreateNewDomainFile {
    param([string]$Path, [string]$Content)
    $TargetPath = Join-Path $BaseDir $Path
    $TargetDir = Split-Path $TargetPath -Parent
    EnsureDirectory $TargetDir

    if ($DryRun) {
        Write-Host "🔍 Would create: $Path" -ForegroundColor Yellow
        return
    }

    try {
        Set-Content -Path $TargetPath -Value $Content -NoNewline
        Write-Host "📝 Created: $Path" -ForegroundColor Blue
    }
    catch {
        Write-Host "❌ Failed to create: $Path" -ForegroundColor Red
    }
}

# Copy existing files
Write-Host "📦 Copying existing files..." -ForegroundColor Cyan

# Products domain files
CopyDomainFile "services\products\entities.ts" "products\types-temp-entities.ts"
CopyDomainFile "services\products\ports.ts" "products\types-temp-ports.ts"
CopyDomainFile "services\products\value-objects.ts" "products\types-temp-value-objects.ts"
CopyDomainFile "services\products\repos.ts" "products\services-temp-repos.ts"
CopyDomainFile "services\products\services.ts" "products\services-temp-services.ts"
CopyDomainFile "services\products\__tests__\services.test.ts" "products\__tests__\services.test.ts"

# Other domain files
CopyDomainFile "services\orders\index.ts" "orders\services.ts"
CopyDomainFile "services\profiles\index.ts" "users\services.ts"
CopyDomainFile "services\payments\index.ts" "payments\services.ts"
CopyDomainFile "types\index.ts" "shared\types.ts"
CopyDomainFile "validation\index.ts" "shared\validation.ts"

# Create new domain files (basic structure)
Write-Host ""
Write-Host "📝 Creating new domain files..." -ForegroundColor Cyan

# Products types (consolidated)
CreateNewDomainFile "products\types.ts" @'
/**
 * Products Domain Types
 */

import type { Database } from '@repo/database';

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
  readonly images: ProductImage[];
  readonly category_name?: string;
  readonly seller_username?: string;
  readonly seller_rating?: number;
}

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
  readonly product_count?: number;
  readonly children?: Category[];
}

export interface ProductImage {
  readonly id: string;
  readonly product_id: string;
  readonly image_url: string;
  readonly alt_text?: string;
  readonly display_order: number;
  readonly sort_order?: number;
  readonly created_at: Date;
}

export interface Money {
  readonly amount: number;
  readonly currency: string;
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

export type Result<T, E = DomainError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Ok = <T, E = never>(data: T): Result<T, E> => ({ success: true, data });
export const Err = <E extends DomainError>(error: E): Result<never, E> => ({
  success: false,
  error
});

export type DbProduct = Database['public']['Tables']['products']['Row'];
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbProductImage = Database['public']['Tables']['product_images']['Row'];
'@

# Create basic index files for each domain
$basicIndex = @'
/**
 * {DOMAIN} Domain
 * Public exports
 */

export * from './types.js';
export * from './services.js';
export * from './validation.js';
'@

CreateNewDomainFile "products\index.ts" ($basicIndex -replace '\{DOMAIN\}', 'Products')
CreateNewDomainFile "orders\index.ts" ($basicIndex -replace '\{DOMAIN\}', 'Orders')
CreateNewDomainFile "users\index.ts" ($basicIndex -replace '\{DOMAIN\}', 'Users')
CreateNewDomainFile "payments\index.ts" ($basicIndex -replace '\{DOMAIN\}', 'Payments')
CreateNewDomainFile "cart\index.ts" ($basicIndex -replace '\{DOMAIN\}', 'Cart')
CreateNewDomainFile "auth\index.ts" ($basicIndex -replace '\{DOMAIN\}', 'Auth')
CreateNewDomainFile "shared\index.ts" @'
/**
 * Shared Domain
 * Public exports
 */

export * from './types.js';
export * from './validation.js';
'@

# Create basic type files for new domains
$basicTypes = @'
/**
 * {DOMAIN} Domain Types
 */

// TODO: Add domain-specific types here
export interface {Domain}Item {
  readonly id: string;
  readonly created_at: Date;
}
'@

CreateNewDomainFile "orders\types.ts" ($basicTypes -replace '\{DOMAIN\}', 'Order' -replace '\{Domain\}', 'Order')
CreateNewDomainFile "users\types.ts" ($basicTypes -replace '\{DOMAIN\}', 'User' -replace '\{Domain\}', 'User')
CreateNewDomainFile "payments\types.ts" ($basicTypes -replace '\{DOMAIN\}', 'Payment' -replace '\{Domain\}', 'Payment')
CreateNewDomainFile "cart\types.ts" ($basicTypes -replace '\{DOMAIN\}', 'Cart' -replace '\{Domain\}', 'Cart')
CreateNewDomainFile "auth\types.ts" ($basicTypes -replace '\{DOMAIN\}', 'Auth' -replace '\{Domain\}', 'Auth')

# Create basic service files
$basicServices = @'
/**
 * {DOMAIN} Domain Services
 */

// TODO: Add domain services here
export const {Domain}Service = {
  // Placeholder for services
} as const;
'@

CreateNewDomainFile "orders\services.ts" ($basicServices -replace '\{DOMAIN\}', 'Order')
CreateNewDomainFile "users\services.ts" ($basicServices -replace '\{DOMAIN\}', 'User')
CreateNewDomainFile "payments\services.ts" ($basicServices -replace '\{DOMAIN\}', 'Payment')
CreateNewDomainFile "cart\services.ts" ($basicServices -replace '\{DOMAIN\}', 'Cart')
CreateNewDomainFile "auth\services.ts" ($basicServices -replace '\{DOMAIN\}', 'Auth')

# Create basic validation files
$basicValidation = @'
/**
 * {DOMAIN} Domain Validation
 */

// TODO: Add domain validation rules here
export function validate{Domain}Item(data: any): boolean {
  // Basic validation
  return data && typeof data.id === 'string';
}
'@

CreateNewDomainFile "orders\validation.ts" ($basicValidation -replace '\{DOMAIN\}', 'Order')
CreateNewDomainFile "users\validation.ts" ($basicValidation -replace '\{DOMAIN\}', 'User')
CreateNewDomainFile "payments\validation.ts" ($basicValidation -replace '\{DOMAIN\}', 'Payment')
CreateNewDomainFile "cart\validation.ts" ($basicValidation -replace '\{DOMAIN\}', 'Cart')
CreateNewDomainFile "auth\validation.ts" ($basicValidation -replace '\{DOMAIN\}', 'Auth')

Write-Host ""
Write-Host "✅ Domain file creation completed!" -ForegroundColor Green

if ($DryRun) {
    Write-Host "🔍 DRY RUN COMPLETED - No files were actually copied" -ForegroundColor Yellow
} else {
    Write-Host "🎉 FILE COPY COMPLETED - New domain structure created!" -ForegroundColor Green
}