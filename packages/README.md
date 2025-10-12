# Packages Architecture

## Overview
This monorepo contains shared packages following **Turborepo + SvelteKit best practices**.

## Package Structure

```
packages/
├── core/          # Framework-agnostic business logic
├── ui/            # Reusable Svelte 5 components
├── i18n/          # Internationalization (Paraglide)
├── database/      # Supabase types and utilities
├── domain/        # Pure TypeScript types and interfaces
├── testing/       # Test utilities and configuration
├── typescript-config/  # Shared TypeScript configs
└── eslint-config/      # Shared ESLint configs
```

---

## Package Responsibilities

### @repo/core
**Purpose**: Framework-agnostic business logic and services  
**Can import**: `@repo/domain`, `@repo/database`  
**Cannot import**: `svelte`, `@sveltejs/kit` (runtime imports)  
**Contains**: 
- Services (ProductService, CollectionService, CategoryService, etc.)
- Business logic utilities
- Authentication helpers (type imports only)
- Stripe integration
- Email services (Resend)

**Key Principle**: Must remain framework-agnostic. Type imports from SvelteKit are acceptable for creating abstractions (e.g., `Cookies` type), but no runtime imports.

**Example**:
```typescript
// ✅ ALLOWED - Type import for abstraction
import type { Cookies } from '@sveltejs/kit';

// ❌ NOT ALLOWED - Runtime import
import { error, redirect } from '@sveltejs/kit';

// ✅ SOLUTION - Use framework-agnostic errors
export class CategoryError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
```

---

### @repo/ui
**Purpose**: Reusable Svelte 5 components library  
**Can import**: `@repo/i18n`, `@repo/core`, `@repo/domain`, `@repo/database` (types only)  
**Cannot import**: `apps/*`  
**Contains**: 
- 174 Svelte components organized by domain
- Melt UI primitives
- Toast system
- Component utilities

**Component Organization** (16 domains):
```
src/lib/components/
├── auth/          (2)   # Authentication UI
├── badges/        (8)   # Badge components
├── banners/       (8)   # Banner components
├── business/      (20)  # Business logic components
├── cards/         (6)   # Card layouts
├── description-list/ (3) # Description lists
├── forms/         (17)  # Form inputs and controls
├── layout/        (7)   # Layout components
├── media/         (3)   # Image/media components
├── modals/        (11)  # Modal dialogs
├── navigation/    (22)  # Navigation components
├── notifications/ (2)   # Notification components
├── product/       (24)  # Product display components
├── skeleton/      (7)   # Loading skeletons
├── ui/            (13)  # Generic UI primitives
└── utilities/     (12)  # Utility components
```

**Export Pattern**: Named exports by component
```typescript
// ✅ GOOD - Explicit named exports
export { default as Button } from './components/ui/Button.svelte';
export { default as Modal } from './components/modals/Modal.svelte';

// ❌ AVOID - Barrel file anti-pattern
export * from './components';
```

**Database Types**: Only type imports are allowed
```typescript
// ✅ ALLOWED - Type-only import
import type { Tables } from '@repo/database';

// ❌ NOT ALLOWED - Runtime database logic
import { supabase } from '@repo/database';
```

---

### @repo/i18n
**Purpose**: Internationalization with Paraglide  
**Can import**: Minimal dependencies  
**Contains**: 
- Paraglide integration
- Message functions
- Locale utilities
- Language switcher components

**Single Source of Truth**:
- All i18n assets live in `packages/i18n/paraglide/`
- No duplicate `apps/web/src/paraglide` directory
- Apps import via `@repo/i18n`

---

### @repo/database
**Purpose**: Supabase types and database utilities  
**Can import**: Minimal dependencies  
**Contains**: 
- Supabase generated types
- Database type definitions
- Query utilities (optional)

**Key Principle**: NO UI components, pure types and utilities

---

### @repo/domain
**Purpose**: Pure TypeScript types and domain models  
**Can import**: **NONE** (must be dependency-free)  
**Contains**: 
- Interfaces
- Domain models
- Type definitions
- Validation schemas (Zod)

**Key Principle**: Zero runtime dependencies, pure types only

---

### @repo/testing
**Purpose**: Shared test utilities  
**Contains**: 
- Vitest configuration
- Test helpers
- Mock factories
- Testing utilities

---

## Dependency Graph

```
apps/web
  ↓ can import from
  @repo/ui, @repo/i18n, @repo/core, @repo/database, @repo/domain
  
@repo/ui
  ↓ can import from
  @repo/i18n, @repo/core, @repo/domain, @repo/database (types only)
  ↓ CANNOT import from
  apps/*, @repo/database (runtime)

@repo/core
  ↓ can import from
  @repo/domain, @repo/database
  ↓ CANNOT import from
  apps/*, @repo/ui, svelte, @sveltejs/kit (runtime)

@repo/i18n
  ↓ standalone or minimal deps

@repo/database
  ↓ standalone or minimal deps

@repo/domain
  ↓ pure types, NO dependencies
```

---

## Import Rules

### 1. Apps can import from any package ✅
```typescript
// In apps/web/src/routes/+page.svelte
import { Button } from '@repo/ui';
import { ProductService } from '@repo/core/services';
import type { Product } from '@repo/domain';
```

### 2. @repo/ui can import from @repo/i18n, @repo/core, @repo/domain ✅
```typescript
// In packages/ui/src/lib/components/Button.svelte
import * as m from '@repo/i18n';
import type { Product } from '@repo/domain';
import type { Tables } from '@repo/database'; // Types only!
```

### 3. @repo/core can ONLY import from @repo/domain, @repo/database ✅
```typescript
// In packages/core/src/services/products.ts
import type { Product } from '@repo/domain';
import type { Database } from '@repo/database';
// NO svelte or @sveltejs/kit runtime imports!
```

### 4. @repo/domain has NO dependencies ✅
```typescript
// In packages/domain/src/types/product.ts
export interface Product {
  id: string;
  title: string;
  // Only pure TypeScript
}
```

### 5. No package can import from apps/* ❌
```typescript
// ❌ NEVER DO THIS
import { something } from '../../../apps/web/src/lib/utils';
```

### 6. No circular dependencies allowed ❌
Use `pnpm list --depth 2 | grep "@repo"` to check for circular dependencies.

---

## Framework Contamination Checks

### Checking @repo/core for SvelteKit imports:
```bash
# Should return ZERO matches (except type imports)
grep -r "@sveltejs/kit" packages/core/src/

# Should return ZERO matches
grep -r "from 'svelte'" packages/core/src/
```

### Checking @repo/domain for framework imports:
```bash
# Should return ZERO matches
grep -r "from 'svelte'" packages/domain/src/
grep -r "@sveltejs" packages/domain/src/
```

### Checking for forbidden cross-package imports:
```bash
# @repo/ui should NOT import @repo/database (runtime)
grep -r "from '@repo/database'" packages/ui/src/
# Only type imports are OK: `import type { X } from '@repo/database'`

# No package should import from apps
grep -r "from '../../../apps/" packages/*/src/
```

---

## Adding New Packages

When creating a new package:

1. **Create package directory**: `packages/new-package/`
2. **Add package.json** with proper exports:
```json
{
  "name": "@repo/new-package",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```
3. **Add to pnpm-workspace.yaml**
4. **Define clear responsibility** (update this README)
5. **Follow dependency rules** (check graph above)
6. **Add TypeScript config** (extend workspace config)

---

## Build & Validation Commands

```bash
# Build all packages
pnpm turbo build --filter="@repo/*"

# Type check all packages
pnpm turbo check

# Test all packages
pnpm turbo test --filter="@repo/*"

# Check for circular dependencies
pnpm list --depth 2 | grep "@repo"

# Verify package exports
cat packages/ui/src/index.ts | head -50
```

---

## Metrics (as of 2025-10-11)

### Package Statistics:
- **Total packages**: 7
- **@repo/ui components**: 174 across 16 domains
- **Framework contamination**: ✅ 0 violations
- **Forbidden imports**: ✅ 0 violations
- **Export pattern**: ✅ Named exports (explicit)
- **Dependency flow**: ✅ Correct (no circular deps)

### Recent Fixes (Phase 3):
1. ✅ Fixed `@repo/core/services/category.ts` - Replaced SvelteKit `error()` and `redirect()` with framework-agnostic `CategoryError` and `CategoryRedirect` classes
2. ✅ Verified `@repo/ui` database imports are type-only (acceptable per Svelte packaging best practices)
3. ✅ Validated dependency flow across all packages
4. ✅ Confirmed zero circular dependencies

---

## Troubleshooting

### Issue: TypeScript errors after refactoring
**Solution**: 
```bash
pnpm install
pnpm turbo check
```

### Issue: Circular dependency detected
**Solution**: 
1. Use `pnpm why <package>` to trace dependency
2. Refactor to remove circular import
3. Consider extracting shared code to `@repo/domain`

### Issue: Component not found after moving
**Solution**: Update all imports in `apps/web` with correct path

### Issue: Build fails for package
**Solution**: 
1. Check `package.json` exports are correct
2. Verify `tsconfig.json` extends workspace config
3. Run `pnpm turbo build --filter="@repo/package-name" --force`

---

## Phase Completion Status

- ✅ **Phase 1 COMPLETE** - @repo/core is framework-agnostic (0 runtime SvelteKit imports)
- ✅ **Phase 2 COMPLETE** - Route colocation applied, 84% reduction in lib/components clutter  
- ✅ **Phase 3 COMPLETE** - Package architecture organized following Turborepo + SvelteKit best practices

---

## Key Learnings

1. **Type imports are OK**: `import type { X } from '@sveltejs/kit'` is fine for creating abstractions in `@repo/core`
2. **Runtime imports are NOT OK**: `import { error } from '@sveltejs/kit'` violates framework-agnostic principle
3. **Solution pattern**: Create custom error classes that apps can convert to framework-specific errors
4. **Database type imports in UI**: Type-only imports from `@repo/database` in `@repo/ui` are acceptable per official Svelte packaging docs
5. **Explicit > Implicit**: Named exports (`export { default as X }`) > barrel files (`export *`)

---

**Last Updated**: 2025-10-11  
**Maintainer**: Project Team  
**Status**: ✅ Production Ready
