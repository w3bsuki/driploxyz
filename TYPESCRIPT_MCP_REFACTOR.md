# TypeScript MCP Refactor Plan

## Overview
This document provides a comprehensive refactor plan for optimizing TypeScript implementation, including strict mode implementation, type coverage improvement, generic optimization, import/export cleanup, and configuration optimization for production readiness.

## Objectives
- Implement comprehensive TypeScript strict mode
- Improve type coverage across the codebase
- Optimize generic types for better reusability
- Clean up import/export patterns
- Optimize TypeScript configuration for performance
- Ensure type safety throughout the application

## Prerequisites
- TypeScript 5.8.2 or later
- Existing TypeScript configuration
- Codebase with partial type coverage

---

## 1. Strict Mode Implementation

### 1.1 Current State Analysis
```bash
# Check current TypeScript strict mode settings
grep -r "strict" apps/web/tsconfig.json packages/*/tsconfig.json

# Analyze TypeScript errors with strict mode
npx tsc --noEmit --strict

# Check for implicit any types
grep -r ": any" apps/web/src packages/*/src --include="*.ts" --include="*.svelte"
```

### 1.2 Enable Comprehensive Strict Mode
```json
// packages/typescript-config/strict.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": false,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": "error"
  }
}
```

### 1.3 Gradual Strict Mode Migration
```typescript
// scripts/migrate-to-strict.ts
import * as fs from 'fs';
import * as path from 'path';

interface MigrationIssue {
  file: string;
  line: number;
  issue: string;
  suggestion: string;
  severity: 'error' | 'warning';
}

class StrictModeMigrator {
  private issues: MigrationIssue[] = [];
  
  async migrateProject(): Promise<void> {
    console.log('🔍 Analyzing TypeScript files for strict mode migration...');
    
    // Find all TypeScript files
    const files = this.findTypeScriptFiles();
    
    // Analyze each file
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    // Generate report
    this.generateReport();
    
    // Apply fixes
    await this.applyFixes();
  }
  
  private findTypeScriptFiles(): string[] {
    const files: string[] = [];
    
    function walkDir(dir: string) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.svelte')) {
          files.push(fullPath);
        }
      }
    }
    
    walkDir('apps/web/src');
    walkDir('packages');
    
    return files;
  }
  
  private async analyzeFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for implicit any
      if (line.includes(': any') && !line.includes('// @ts-ignore')) {
        this.issues.push({
          file: filePath,
          line: index + 1,
          issue: 'Implicit any type',
          suggestion: 'Replace with specific type or unknown',
          severity: 'error'
        });
      }
      
      // Check for non-null assertions
      if (line.includes('!') && !line.includes('! ==')) {
        this.issues.push({
          file: filePath,
          line: index + 1,
          issue: 'Non-null assertion',
          suggestion: 'Use optional chaining or nullish coalescing',
          severity: 'warning'
        });
      }
      
      // Check for untyped function parameters
      const functionMatch = line.match(/function\s+\w+\s*\(([^)]*)\)/);
      if (functionMatch && !functionMatch[1].includes(':')) {
        this.issues.push({
          file: filePath,
          line: index + 1,
          issue: 'Untyped function parameters',
          suggestion: 'Add type annotations to parameters',
          severity: 'error'
        });
      }
      
      // Check for untyped object properties
      const objectMatch = line.match(/:\s*\{\s*([^}]*)\s*\}/);
      if (objectMatch && !objectMatch[1].includes(':')) {
        this.issues.push({
          file: filePath,
          line: index + 1,
          issue: 'Untyped object properties',
          suggestion: 'Add type annotations to object properties',
          severity: 'warning'
        });
      }
    });
  }
  
  private generateReport(): void {
    console.log('\n📊 TypeScript Strict Mode Migration Report');
    console.log('=' .repeat(50));
    
    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    
    console.log(`\n🚨 Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n🔴 Critical Issues:');
      errors.slice(0, 10).forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
        console.log(`    Suggestion: ${issue.suggestion}`);
      });
      
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }
    
    if (warnings.length > 0) {
      console.log('\n🟡 Warnings:');
      warnings.slice(0, 5).forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
        console.log(`    Suggestion: ${issue.suggestion}`);
      });
      
      if (warnings.length > 5) {
        console.log(`  ... and ${warnings.length - 5} more warnings`);
      }
    }
  }
  
  private async applyFixes(): Promise<void> {
    console.log('\n🔧 Applying automatic fixes...');
    
    // Group issues by file
    const issuesByFile = new Map<string, MigrationIssue[]>();
    
    this.issues.forEach(issue => {
      if (!issuesByFile.has(issue.file)) {
        issuesByFile.set(issue.file, []);
      }
      issuesByFile.get(issue.file)!.push(issue);
    });
    
    // Apply fixes to each file
    for (const [filePath, fileIssues] of issuesByFile) {
      await this.fixFile(filePath, fileIssues);
    }
    
    console.log('✅ Automatic fixes applied');
  }
  
  private async fixFile(filePath: string, issues: MigrationIssue[]): Promise<void> {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Apply fixes in reverse order to maintain line numbers
    issues.reverse().forEach(issue => {
      const lineIndex = issue.line - 1;
      const line = lines[lineIndex];
      
      switch (issue.issue) {
        case 'Implicit any type':
          lines[lineIndex] = this.fixImplicitAny(line);
          break;
        
        case 'Non-null assertion':
          lines[lineIndex] = this.fixNonNullAssertion(line);
          break;
        
        case 'Untyped function parameters':
          lines[lineIndex] = this.fixUntypedParameters(line);
          break;
      }
    });
    
    fs.writeFileSync(filePath, lines.join('\n'));
  }
  
  private fixImplicitAny(line: string): string {
    // Replace : any with : unknown or specific type
    return line.replace(/: any/g, ': unknown');
  }
  
  private fixNonNullAssertion(line: string): string {
    // Replace ! with optional chaining
    return line.replace(/(\w+)!/g, '$1?');
  }
  
  private fixUntypedParameters(line: string): string {
    // Add type annotations to function parameters
    return line.replace(/function\s+(\w+)\s*\(([^)]*)\)/, (match, name, params) => {
      const typedParams = params.split(',').map(param => {
        const trimmed = param.trim();
        return trimmed.includes(':') ? trimmed : `${trimmed}: unknown`;
      }).join(', ');
      
      return `function ${name}(${typedParams})`;
    });
  }
}

// Run migration
async function main() {
  const migrator = new StrictModeMigrator();
  await migrator.migrateProject();
}

main().catch(console.error);
```

### 1.4 Type Safety Enhancements
```typescript
// packages/typescript/src/type-guards.ts
import type { z } from 'zod';

// Generic type guards
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// Zod schema type guards
export function isValid<T>(schema: z.ZodSchema<T>, value: unknown): value is T {
  return schema.safeParse(value).success;
}

// Runtime type checking utilities
export function assertType<T>(value: unknown, validator: (value: unknown) => value is T): asserts value is T {
  if (!validator(value)) {
    throw new TypeError(`Type assertion failed`);
  }
}

// Branded types for type safety
export type Brand<T, B> = T & { __brand: B };

export function brand<T, B>(value: T, _brand: B): Brand<T, B> {
  return value as Brand<T, B>;
}

export function unbrand<T, B>(value: Brand<T, B>): T {
  return value as T;
}

// Common branded types
export type UserId = Brand<string, 'UserId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type Email = Brand<string, 'Email'>;
export type Currency = Brand<string, 'Currency'>;

// Constructor functions for branded types
export const UserId = {
  from: (id: string): UserId => brand(id, 'UserId' as const),
  isValid: (id: unknown): id is UserId => isString(id) && id.length > 0
};

export const ProductId = {
  from: (id: string): ProductId => brand(id, 'ProductId' as const),
  isValid: (id: unknown): id is ProductId => isString(id) && id.length > 0
};

export const Email = {
  from: (email: string): Email => {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return brand(email, 'Email' as const);
  },
  isValid: (email: unknown): email is Email => {
    return isString(email) && email.includes('@') && email.length > 3;
  }
};
```

---

## 2. Type Coverage Improvement

### 2.1 Type Coverage Analysis
```bash
# Install type coverage tool
npm install --save-dev type-coverage

# Run type coverage analysis
npx type-coverage --detail --strict

# Generate coverage report
npx type-coverage --json > type-coverage.json
```

### 2.2 Type Coverage Enhancement
```typescript
// scripts/improve-type-coverage.ts
import * as fs from 'fs';
import * as path from 'path';

interface TypeCoverageReport {
  total: number;
  covered: number;
  percentage: number;
  files: {
    [path: string]: {
      total: number;
      covered: number;
      percentage: number;
      uncovered: string[];
    };
  };
}

class TypeCoverageImprover {
  private report: TypeCoverageReport;
  
  constructor(reportPath: string) {
    this.report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  }
  
  improveCoverage(): void {
    console.log('🔧 Improving type coverage...');
    
    // Find files with lowest coverage
    const sortedFiles = Object.entries(this.report.files)
      .sort(([, a], [, b]) => a.percentage - b.percentage);
    
    // Improve each file
    for (const [filePath, fileReport] of sortedFiles) {
      if (fileReport.percentage < 100) {
        this.improveFile(filePath, fileReport);
      }
    }
    
    console.log('✅ Type coverage improvements applied');
  }
  
  private improveFile(filePath: string, fileReport: TypeCoverageReport['files'][string]): void {
    console.log(`Improving ${filePath} (${fileReport.percentage}% coverage)`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    let improvedContent = content;
    
    // Add missing type annotations
    for (const uncovered of fileReport.uncovered) {
      improvedContent = this.addTypeAnnotation(improvedContent, uncovered);
    }
    
    // Write improved content
    if (improvedContent !== content) {
      fs.writeFileSync(filePath, improvedContent);
      console.log(`  ✅ Added type annotations`);
    }
  }
  
  private addTypeAnnotation(content: string, uncoveredItem: string): string {
    // Add type annotation based on the uncovered item
    const patterns = [
      // Function parameters
      {
        regex: /function\s+(\w+)\s*\(([^)]+)\)/g,
        replacement: (match: string, name: string, params: string) => {
          const typedParams = params.split(',').map(param => {
            const trimmed = param.trim();
            if (trimmed && !trimmed.includes(':')) {
              return `${trimmed}: unknown`;
            }
            return trimmed;
          }).join(', ');
          
          return `function ${name}(${typedParams})`;
        }
      },
      
      // Variable declarations
      {
        regex: /(?:const|let|var)\s+(\w+)\s*=\s*([^;]+);/g,
        replacement: (match: string, name: string, value: string) => {
          if (!match.includes(':')) {
            return `const ${name}: typeof ${value} = ${value};`;
          }
          return match;
        }
      },
      
      // Object properties
      {
        regex: /(\w+):\s*([^,}]+)/g,
        replacement: (match: string, key: string, value: string) => {
          if (!match.includes(':') || match.split(':').length === 2) {
            return match;
          }
          return match;
        }
      }
    ];
    
    let result = content;
    
    for (const pattern of patterns) {
      result = result.replace(pattern.regex, pattern.replacement as any);
    }
    
    return result;
  }
}

// Run type coverage improvement
async function main() {
  const improver = new TypeCoverageImprover('type-coverage.json');
  improver.improveCoverage();
}

main().catch(console.error);
```

### 2.3 Comprehensive Type Definitions
```typescript
// packages/types/src/api.types.ts
import type { z } from 'zod';

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Request types
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// Validation schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

// API Client types
export interface ApiClient {
  get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
}
```

```typescript
// packages/types/src/database.types.ts
import type { Database } from '@repo/database';

// Enhanced database types with better nullability
export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  // Ensure required fields are not null
  id: string;
  username: string;
  email: string;
  created_at: string;
  
  // Optional fields with proper typing
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  is_verified: boolean;
  is_seller: boolean;
};

export type Product = Database['public']['Tables']['products']['Row'] & {
  id: string;
  title: string;
  description: string | null;
  price: number;
  seller_id: string;
  category_id: string | null;
  status: 'active' | 'inactive' | 'sold';
  is_sold: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithImages = Product & {
  images: ProductImage[];
  seller: UserProfile;
  category: Category | null;
};

export type ProductImage = Database['public']['Tables']['product_images']['Row'] & {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type Category = Database['public']['Tables']['categories']['Row'] & {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

// Insert types with better validation
export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
  title: string; // Required
  price: number; // Required
  seller_id: string; // Required
  description?: string; // Optional
  category_id?: string; // Optional
};

export type UpdateProductInput = Partial<CreateProductInput> & {
  id: string; // Required for updates
};

// Query types
export type ProductQuery = {
  category_id?: string;
  seller_id?: string;
  status?: Product['status'];
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: 'created_at' | 'price' | 'title';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
};
```

---

## 3. Generic Optimization

### 3.1 Generic Utility Types
```typescript
// packages/types/src/generics.ts
import type { z } from 'zod';

// Deep readonly utility
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Deep partial utility
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep required utility
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Optional properties utility
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Required properties utility
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ValueOf utility
export type ValueOf<T> = T[keyof T];

// Array element type utility
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Promise value type utility
export type PromiseValue<T> = T extends Promise<infer U> ? U : never;

// Function return type utility
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Function parameters type utility
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// Constructor parameters type utility
export type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;

// Instance type utility
export type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never;

// Async function return type utility
export type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

// Event handler type utility
export type EventHandler<T = Event> = (event: T) => void;

// Component props type utility
export type ComponentProps<T> = T extends new (...args: any[]) => infer R 
  ? R extends { $set: infer S } ? S : never 
  : never;

// Zod schema inference utility
export type InferSchema<T extends z.ZodSchema> = z.infer<T>;

// API response wrapper utility
export type ApiResponseData<T> = {
  data: T;
  success: boolean;
  message?: string;
};

// Paginated response utility
export type PaginatedData<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Repository pattern utility
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(query?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

// Service pattern utility
export interface Service<T, ID = string> {
  get(id: ID): Promise<T>;
  getAll(query?: any): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: ID, data: any): Promise<T>;
  remove(id: ID): Promise<void>;
}

// Cache utility
export interface Cache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

// Result type utility
export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// State management utility
export type State<T> = {
  value: T;
  loading: boolean;
  error: string | null;
};

// Form state utility
export type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
};
```

### 3.2 Generic Component Types
```typescript
// packages/types/src/components.ts
import type { Snippet } from 'svelte';

// Base component props
export interface BaseComponentProps {
  class?: string;
  id?: string;
  'data-testid'?: string;
}

// Button component props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onclick?: () => void;
  children?: Snippet;
}

// Form component props
export interface FormProps<T> extends BaseComponentProps {
  values: T;
  errors?: Partial<Record<keyof T, string>>;
  onsubmit?: (values: T) => void | Promise<void>;
  oninput?: (values: T) => void;
  children?: Snippet<[FormContext<T>]>;
}

// Form context
export interface FormContext<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setError: <K extends keyof T>(key: K, error: string | undefined) => void;
  setTouched: <K extends keyof T>(key: K, touched: boolean) => void;
  validate: () => boolean;
  submit: () => void;
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  description?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  children?: Snippet;
}

// Table component props
export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
}

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// List component props
export interface ListProps<T> extends BaseComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => Snippet;
  emptyState?: Snippet;
  loading?: boolean;
  loadingState?: Snippet;
  itemKey?: (item: T) => string | number;
}

// Generic component factory
export function createComponent<T extends Record<string, any>>(
  defaults: T
): (props: Partial<T>) => T {
  return (props: Partial<T>) => ({ ...defaults, ...props });
}

// Generic event handler
export type EventHandler<T = Event> = (event: T) => void;

// Generic async event handler
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Generic change handler
export type ChangeHandler<T> = (value: T) => void;

// Generic input handler
export type InputHandler = ChangeHandler<string>;

// Generic select handler
export type SelectHandler<T> = ChangeHandler<T>;

// Generic checkbox handler
export type CheckboxHandler = ChangeHandler<boolean>;
```

### 3.3 Generic API Types
```typescript
// packages/types/src/api-generics.ts
import type { z } from 'zod';

// Generic API client
export interface ApiClient {
  request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>>;
  get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
}

export interface ApiRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  meta?: Record<string, unknown>;
}

// Generic repository pattern
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  findOne(filter: Partial<T>): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  createMany(data: Omit<T, 'id'>[]): Promise<T[]>;
  update(id: ID, data: Partial<T>): Promise<T>;
  updateMany(filter: Partial<T>, data: Partial<T>): Promise<T[]>;
  delete(id: ID): Promise<boolean>;
  deleteMany(filter: Partial<T>): Promise<number>;
  count(filter?: Partial<T>): Promise<number>;
  exists(filter: Partial<T>): Promise<boolean>;
}

// Generic service pattern
export interface Service<T, ID = string> {
  get(id: ID): Promise<T>;
  getAll(filter?: any): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: ID, data: any): Promise<T>;
  delete(id: ID): Promise<void>;
  validate(data: any): Promise<boolean>;
  transform(data: any): T;
}

// Generic query builder
export interface QueryBuilder<T> {
  select<K extends keyof T>(keys: K[]): QueryBuilder<Pick<T, K>>;
  where(filter: Partial<T>): QueryBuilder<T>;
  orderBy(key: keyof T, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  include(relations: string[]): QueryBuilder<T>;
  build(): QueryConfig<T>;
}

export interface QueryConfig<T> {
  select?: (keyof T)[];
  where?: Partial<T>;
  orderBy?: { key: keyof T; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
  include?: string[];
}

// Generic validation
export interface Validator<T> {
  validate(data: unknown): ValidationResult<T>;
  validatePartial(data: unknown): ValidationResult<Partial<T>>;
  schema: z.ZodSchema<T>;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Generic cache
export interface Cache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

// Generic event emitter
export interface EventEmitter<T> {
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
  once<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
}

// Generic state manager
export interface StateManager<T> {
  get(): T;
  set(value: T): void;
  update(updater: (current: T) => T): void;
  subscribe(listener: (value: T) => void): () => void;
  reset(): void;
}

// Generic paginator
export interface Paginator<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
  hasNext: boolean;
  hasPrev: boolean;
  nextPage(): Promise<T[]>;
  prevPage(): Promise<T[]>;
  goToPage(page: number): Promise<T[]>;
  refresh(): Promise<T[]>;
}
```

---

## 4. Import/Export Cleanup

### 4.1 Import Analysis
```bash
# Analyze import patterns
find apps/web/src packages/*/src -name "*.ts" -o -name "*.svelte" | \
  xargs grep -h "^import" | \
  sort | uniq -c | sort -nr

# Find unused imports
npx ts-unused-exports tsconfig.json

# Find circular dependencies
npx madge --circular apps/web/src packages/*/src
```

### 4.2 Import Optimization
```typescript
// scripts/optimize-imports.ts
import * as fs from 'fs';
import * as path from 'path';

interface ImportAnalysis {
  file: string;
  imports: ImportInfo[];
  unusedImports: string[];
  circularDependencies: string[];
}

interface ImportInfo {
  module: string;
  imports: string[];
  type: 'default' | 'named' | 'namespace' | 'type';
  used: boolean;
}

class ImportOptimizer {
  private analysis: Map<string, ImportAnalysis> = new Map();
  
  async optimizeImports(): Promise<void> {
    console.log('🔍 Analyzing imports...');
    
    // Find all TypeScript files
    const files = this.findTypeScriptFiles();
    
    // Analyze each file
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    // Detect circular dependencies
    this.detectCircularDependencies();
    
    // Find unused imports
    this.findUnusedImports();
    
    // Generate report
    this.generateReport();
    
    // Apply optimizations
    await this.applyOptimizations();
  }
  
  private findTypeScriptFiles(): string[] {
    const files: string[] = [];
    
    function walkDir(dir: string) {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.svelte')) {
          files.push(fullPath);
        }
      }
    }
    
    walkDir('apps/web/src');
    walkDir('packages');
    
    return files;
  }
  
  private async analyzeFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = this.extractImports(content);
    
    this.analysis.set(filePath, {
      file: filePath,
      imports,
      unusedImports: [],
      circularDependencies: []
    });
  }
  
  private extractImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    
    // Match import statements
    const importRegex = /^import\s+(?:(?:type\s+)?\{([^}]+)\}|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"];?$/gm;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const [, namedImports, defaultImport, namespaceImport, module] = match;
      
      if (namedImports) {
        imports.push({
          module,
          imports: namedImports.split(',').map(imp => imp.trim().replace('type ', '')),
          type: 'named',
          used: false
        });
      } else if (defaultImport) {
        imports.push({
          module,
          imports: [defaultImport],
          type: 'default',
          used: false
        });
      } else if (namespaceImport) {
        imports.push({
          module,
          imports: [namespaceImport],
          type: 'namespace',
          used: false
        });
      }
    }
    
    return imports;
  }
  
  private detectCircularDependencies(): void {
    // Build dependency graph
    const graph = new Map<string, string[]>();
    
    for (const [filePath, analysis] of this.analysis) {
      const dependencies = analysis.imports
        .map(imp => this.resolveModulePath(imp.module, filePath))
        .filter(Boolean);
      
      graph.set(filePath, dependencies);
    }
    
    // Detect circular dependencies
    for (const [filePath, dependencies] of graph) {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      
      if (this.hasCircularDependency(filePath, graph, visited, recursionStack)) {
        const analysis = this.analysis.get(filePath)!;
        analysis.circularDependencies = Array.from(recursionStack);
      }
    }
  }
  
  private hasCircularDependency(
    node: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(node);
    recursionStack.add(node);
    
    const dependencies = graph.get(node) || [];
    
    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        if (this.hasCircularDependency(dep, graph, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dep)) {
        return true;
      }
    }
    
    recursionStack.delete(node);
    return false;
  }
  
  private findUnusedImports(): void {
    for (const [filePath, analysis] of this.analysis) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const imp of analysis.imports) {
        for (const imported of imp.imports) {
          const isUsed = this.isImportUsed(imported, content, imp.type);
          imp.used = isUsed;
        }
      }
      
      analysis.unusedImports = analysis.imports
        .filter(imp => !imp.used)
        .flatMap(imp => imp.imports);
    }
  }
  
  private isImportUsed(importName: string, content: string, importType: string): boolean {
    switch (importType) {
      case 'default':
      case 'named':
        return content.includes(importName);
      
      case 'namespace':
        return new RegExp(`\\b${importName}\\.`).test(content);
      
      default:
        return false;
    }
  }
  
  private resolveModulePath(module: string, fromFile: string): string | null {
    // Simple module resolution - in a real implementation, this would be more sophisticated
    if (module.startsWith('.')) {
      return path.resolve(path.dirname(fromFile), module);
    }
    
    return null;
  }
  
  private generateReport(): void {
    console.log('\n📊 Import Analysis Report');
    console.log('=' .repeat(50));
    
    let totalUnused = 0;
    let totalCircular = 0;
    
    for (const [filePath, analysis] of this.analysis) {
      if (analysis.unusedImports.length > 0) {
        console.log(`\n📁 ${filePath}`);
        console.log(`  Unused imports: ${analysis.unusedImports.join(', ')}`);
        totalUnused += analysis.unusedImports.length;
      }
      
      if (analysis.circularDependencies.length > 0) {
        console.log(`\n📁 ${filePath}`);
        console.log(`  Circular dependencies: ${analysis.circularDependencies.join(' -> ')}`);
        totalCircular += analysis.circularDependencies.length;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total unused imports: ${totalUnused}`);
    console.log(`  Total circular dependencies: ${totalCircular}`);
  }
  
  private async applyOptimizations(): Promise<void> {
    console.log('\n🔧 Applying optimizations...');
    
    for (const [filePath, analysis] of this.analysis) {
      if (analysis.unusedImports.length > 0) {
        await this.removeUnusedImports(filePath, analysis.unusedImports);
      }
    }
    
    console.log('✅ Optimizations applied');
  }
  
  private async removeUnusedImports(filePath: string, unusedImports: string[]): Promise<void> {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Remove unused imports
    const filteredLines = lines.filter(line => {
      const isUnusedImport = unusedImports.some(imp => 
        line.includes(`import`) && line.includes(imp)
      );
      
      return !isUnusedImport;
    });
    
    fs.writeFileSync(filePath, filteredLines.join('\n'));
  }
}

// Run import optimization
async function main() {
  const optimizer = new ImportOptimizer();
  await optimizer.optimizeImports();
}

main().catch(console.error);
```

### 4.3 Import/Export Standards
```typescript
// packages/types/src/import-standards.ts

// ✅ Good import practices

// Named imports with explicit types
import type { User, Product, Category } from './database.types';
import { UserService, ProductService } from './services';

// Default imports for utilities
import { formatCurrency } from './utils/currency';
import { validateEmail } from './utils/validation';

// Namespace imports for related functionality
import * as API from './api';
import * as Helpers from './helpers';

// Type-only imports
import type { ApiResponse, PaginatedResponse } from './api.types';

// ❌ Bad import practices

// Avoid namespace imports for large modules
// import * as Everything from './large-module';

// Avoid importing everything with *
// import * from './utils';

// Avoid mixing default and named imports unnecessarily
// import UserService, { validateEmail } from './services';

// Export standards

// ✅ Good export practices

// Named exports for utilities
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]/g, ''));
};

// Type exports
export type UserPreferences = {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
};

// Default export for main functionality
export default class UserService {
  // Implementation
}

// Re-exports for clean public API
export type { User, Product } from './database.types';
export { formatCurrency, validateEmail } from './utils';

// ❌ Bad export practices

// Avoid mixed default and named exports without clear purpose
// export default class UserService { }
// export const helper = () => { };

// Avoid exporting too many things from a single module
// export { util1, util2, util3, util4, util5, util6, util7, util8, util9, util10 };
```

---

## 5. Configuration Optimization

### 5.1 Enhanced TypeScript Configuration
```json
// packages/typescript-config/optimized.json
{
  "extends": "./strict.json",
  "compilerOptions": {
    // Performance optimizations
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "assumeChangesOnlyAffectDirectDependencies": true,
    
    // Module resolution optimizations
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolvePackageJsonExports": true,
    "resolvePackageJsonImports": true,
    
    // Type checking optimizations
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    
    // Output optimizations
    "noEmit": true,
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false,
    
    // Language optimizations
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    
    // Path mappings for faster resolution
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@repo/*": ["../../packages/*/src/*"]
    },
    
    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    
    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    
    // Module system
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  },
  
  // Include/exclude patterns for performance
  "include": [
    "src/**/*",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    ".svelte-kit",
    "coverage",
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  
  // TypeScript compiler options for different environments
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

### 5.2 Project-Specific Configurations
```json
// apps/web/tsconfig.json
{
  "extends": "@repo/typescript-config/optimized.json",
  "compilerOptions": {
    "types": ["vite/client", "@sveltejs/kit"],
    "moduleResolution": "Bundler",
    "allowJs": true,
    "checkJs": false,
    
    // Svelte-specific options
    "module": "ESNext",
    "target": "ESNext",
    
    // Path aliases
    "baseUrl": ".",
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"],
      "@repo/ui": ["../../packages/ui/src/lib"],
      "@repo/ui/*": ["../../packages/ui/src/*"],
      "@repo/i18n": ["../../packages/i18n/src"],
      "@repo/i18n/*": ["../../packages/i18n/src/*"],
      "@repo/core": ["../../packages/core/src"],
      "@repo/core/*": ["../../packages/core/src/*"]
    }
  },
  
  "include": [
    "src/**/*.ts",
    "src/**/*.svelte",
    "src/**/*.js",
    "vite.config.ts"
  ],
  
  "exclude": [
    "node_modules",
    ".svelte-kit",
    "build",
    "dist"
  ]
}
```

```json
// packages/ui/tsconfig.json
{
  "extends": "@repo/typescript-config/optimized.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "outDir": "./dist",
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"]
    }
  },
  
  "include": [
    "src/**/*.ts",
    "src/**/*.svelte"
  ],
  
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

### 5.3 Build Performance Optimization
```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "assumeChangesOnlyAffectDirectDependencies": true,
    
    // Production optimizations
    "removeComments": true,
    "importHelpers": true,
    "downlevelIteration": true,
    
    // Source maps for debugging
    "sourceMap": true,
    "sourceRoot": "./src"
  },
  
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.stories.ts"
  ]
}
```

### 5.4 Development Configuration
```json
// tsconfig.dev.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    // Development-friendly options
    "sourceMap": true,
    "inlineSourceMap": true,
    "removeComments": false,
    
    // Faster compilation
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    
    // Better debugging
    "preserveWatchOutput": true,
    "pretty": true
  }
}
```

---

## 6. Implementation Checklist

### 6.1 Pre-Implementation
- [ ] Analyze current TypeScript configuration
- [ ] Identify type coverage gaps
- [ ] Check for circular dependencies
- [ ] Set up type checking in CI/CD

### 6.2 Implementation Tasks
- [ ] Enable comprehensive strict mode
- [ ] Improve type coverage across all files
- [ ] Optimize generic types
- [ ] Clean up import/export patterns
- [ ] Optimize TypeScript configuration
- [ ] Set up performance monitoring

### 6.3 Post-Implementation
- [ ] Monitor compilation performance
- [ ] Validate type safety improvements
- [ ] Update development guidelines
- [ ] Train team on TypeScript best practices

---

## 7. Success Criteria

### 7.1 Type Safety Metrics
- 100% strict mode compliance
- 95%+ type coverage
- Zero implicit any types
- No circular dependencies

### 7.2 Performance Metrics
- Compilation time under 5 seconds
- Incremental compilation under 1 second
- Type checking performance improved by 50%
- Zero type-related runtime errors

### 7.3 Developer Experience
- Clear error messages
- Comprehensive IntelliSense
- Fast compilation times
- Consistent code patterns

---

## 8. Next Steps

1. Implement strict mode gradually
2. Set up automated type checking
3. Create TypeScript style guide
4. Establish code review guidelines
5. Monitor and optimize performance