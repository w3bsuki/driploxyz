# 🚀 PHASE 3: Package Structure & Monorepo Organization

**Date**: 2025-10-11  
**Status**: Ready to Execute  
**Prerequisites**: Phase 1 ✅ | Phase 2 ✅

---

## Quick Context

- ✅ **Phase 1 COMPLETE** - @repo/core is framework-agnostic (0 SvelteKit imports)
- ✅ **Phase 2 COMPLETE** - Route colocation applied, 84% reduction in lib/components clutter
- 🎯 **Phase 3 NOW** - Organize packages/@repo/* structure following Turborepo + SvelteKit best practices

---

## Mission: Organize Package Architecture

Apply **Turborepo + SvelteKit best practices** for internal packages:
- Clear package boundaries and responsibilities
- Proper dependency flow (apps → ui → core → domain)
- Clean exports (no barrel file anti-patterns)
- Remove app-specific code from packages
- Document package architecture

---

## Step-by-Step Plan (Estimated: 4-6 hours)

### Step 1: Audit @repo/ui Package (Main Focus - 2 hours)

This is the biggest package and needs thorough audit.

#### Commands:
```bash
# Check current structure
ls -R packages/ui/src/lib/components/

# Count all components
find packages/ui/src -name "*.svelte" | wc -l

# Check main export file
cat packages/ui/src/index.ts | head -50

# Search for app-specific imports
grep -r "from '../../../apps/" packages/ui/src/

# Find all component directories
ls packages/ui/src/lib/components/
```

#### Questions to Answer:
- [ ] How many components exist in @repo/ui?
- [ ] Are they organized by domain (badges/, buttons/, cards/, etc.)?
- [ ] Any app-specific components that should move to apps/web?
- [ ] Any unused/dead components (0 imports)?
- [ ] Export patterns: barrel files or named exports?
- [ ] Any hardcoded business logic in components?

#### Expected Structure:
```
packages/ui/src/lib/components/
├── badges/          # Badge components
├── buttons/         # Button components
├── cards/           # Card components
├── forms/           # Form components
├── layout/          # Layout components
├── modals/          # Modal components
├── navigation/      # Navigation components
├── product/         # Product-specific components
└── ui/              # Generic UI components
```

---

### Step 2: Audit Other Packages (1 hour)

#### Check Framework Contamination:
```bash
# @repo/core should have ZERO Svelte imports
grep -r "@sveltejs/kit" packages/core/
grep -r "from 'svelte'" packages/core/

# @repo/domain should be pure TypeScript types
grep -r "from 'svelte'" packages/domain/
grep -r "@sveltejs" packages/domain/

# @repo/database should have no UI
find packages/database/src -name "*.svelte"

# @repo/i18n check
ls -la packages/i18n/src/
```

#### Check Package Dependencies:
```bash
# View all package dependencies
cat packages/*/package.json | grep -A 5 "dependencies"

# Check for circular dependencies
pnpm list --depth 2 | grep "@repo"

# List all packages
ls -la packages/
```

#### Package Responsibilities Check:

**@repo/core** (Should be framework-agnostic):
- [ ] Services (ProductService, CollectionService, etc.)
- [ ] Business logic utilities
- [ ] NO Svelte imports
- [ ] NO SvelteKit imports

**@repo/ui** (Svelte components):
- [ ] Reusable Svelte 5 components
- [ ] Can import @repo/i18n, @repo/core
- [ ] Should NOT import @repo/database
- [ ] Should NOT import from apps/

**@repo/i18n** (Internationalization):
- [ ] Paraglide integration
- [ ] Message functions
- [ ] Locale utilities

**@repo/database** (Database types):
- [ ] Supabase generated types
- [ ] Database utilities
- [ ] NO UI components

**@repo/domain** (Pure types):
- [ ] TypeScript interfaces
- [ ] Domain models
- [ ] NO runtime logic
- [ ] NO framework imports

---

### Step 3: Organize @repo/ui Components (1-2 hours)

#### Actions:

1. **Verify Domain Organization**:
```bash
# Check each domain folder
ls packages/ui/src/lib/components/badges/
ls packages/ui/src/lib/components/buttons/
ls packages/ui/src/lib/components/cards/
ls packages/ui/src/lib/components/forms/
ls packages/ui/src/lib/components/layout/
ls packages/ui/src/lib/components/modals/
ls packages/ui/src/lib/components/navigation/
ls packages/ui/src/lib/components/product/
ls packages/ui/src/lib/components/ui/
```

2. **Identify App-Specific Components**:
```bash
# Search for components with hardcoded business logic
grep -r "from '@repo/database'" packages/ui/src/
grep -r "supabase" packages/ui/src/lib/components/

# Check for route-specific components
grep -r "checkout" packages/ui/src/lib/components/
grep -r "dashboard" packages/ui/src/lib/components/
```

3. **Find Unused Components**:
```bash
# For each component, check usage
grep -r "import.*Button" apps/web/src/
grep -r "import.*Modal" apps/web/src/
grep -r "import.*ProductCard" apps/web/src/
```

4. **Move App-Specific Components** (if found):
```bash
# Example: If CheckoutSummary is app-specific
mv packages/ui/src/lib/components/checkout/CheckoutSummary.svelte \
   apps/web/src/lib/components/checkout/CheckoutSummary.svelte

# Update imports in apps/web
```

---

### Step 4: Fix Package Exports (30 min)

#### Current Export Pattern (Check):
```bash
cat packages/ui/src/index.ts
```

#### Good Export Pattern (Named Exports by Domain):
```typescript
// packages/ui/src/index.ts

// Badges
export { ConditionBadge, StatusBadge } from './lib/components/badges';

// Buttons
export { Button, PrimaryButton, SecondaryButton } from './lib/components/buttons';

// Cards
export { ProductCard, ProductCardWithTracking } from './lib/components/cards';

// Forms
export { Input, TextArea, Select, Checkbox } from './lib/components/forms';

// Layout
export { Header, Footer, Sidebar } from './lib/components/layout';

// Modals
export { Modal, ModalHeader, ModalBody, ModalFooter } from './lib/components/modals';

// Navigation
export { NavBar, BottomNav, BreadcrumbNav } from './lib/components/navigation';

// Product
export { ProductGallery, ProductGrid, FeaturedProducts } from './lib/components/product';

// UI (Generic)
export { Avatar, Badge, Spinner, Toast } from './lib/components/ui';
```

#### Bad Export Pattern (Avoid):
```typescript
// ❌ DON'T DO THIS - Barrel file anti-pattern
export * from './lib/components';
export * from './lib/components/badges';
export * from './lib/components/buttons';
// ... etc
```

#### Update package.json Exports:
```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "svelte": "./src/index.ts"
    }
  },
  "svelte": "./src/index.ts",
  "types": "./src/index.ts"
}
```

---

### Step 5: Validate Package Dependencies (30 min)

#### Correct Dependency Flow:
```
apps/web
  ↓ can import from
  @repo/ui, @repo/i18n, @repo/core, @repo/database, @repo/domain
  
@repo/ui
  ↓ can import from
  @repo/i18n, @repo/core, @repo/domain
  ↓ CANNOT import from
  apps/*, @repo/database

@repo/core
  ↓ can import from
  @repo/domain
  ↓ CANNOT import from
  apps/*, @repo/ui, @sveltejs/*, svelte

@repo/i18n
  ↓ standalone or minimal deps

@repo/database
  ↓ standalone or minimal deps

@repo/domain
  ↓ pure types, no dependencies
```

#### Validation Commands:
```bash
# Check @repo/ui doesn't import database
grep -r "from '@repo/database'" packages/ui/src/

# Check @repo/core doesn't import Svelte
grep -r "from 'svelte'" packages/core/src/
grep -r "@sveltejs" packages/core/src/

# Check no package imports from apps
grep -r "from '../../../apps/" packages/*/src/
grep -r "from '../../apps/" packages/*/src/

# Check package.json dependencies
cat packages/ui/package.json | grep -A 10 "dependencies"
cat packages/core/package.json | grep -A 10 "dependencies"
```

#### Fix Forbidden Imports (if found):
```bash
# If @repo/ui imports from @repo/database, refactor to:
# 1. Move database logic to apps/web
# 2. Pass data as props to UI components
# 3. Keep UI components generic
```

---

### Step 6: Document Package Architecture (30 min)

#### Create packages/README.md:
```markdown
# Packages Architecture

## Overview
This monorepo contains shared packages following Turborepo best practices.

## Packages

### @repo/core
**Purpose**: Framework-agnostic business logic  
**Can import**: @repo/domain  
**Cannot import**: Svelte, SvelteKit, @repo/ui  
**Contains**: Services, utilities, business logic

### @repo/ui
**Purpose**: Reusable Svelte 5 components  
**Can import**: @repo/i18n, @repo/core, @repo/domain  
**Cannot import**: @repo/database, apps/*  
**Contains**: Generic UI components organized by domain

### @repo/i18n
**Purpose**: Internationalization  
**Can import**: Minimal dependencies  
**Contains**: Paraglide integration, message functions, locale utilities

### @repo/database
**Purpose**: Database types and utilities  
**Can import**: Minimal dependencies  
**Contains**: Supabase types, database helpers, query utilities

### @repo/domain
**Purpose**: Pure TypeScript types  
**Can import**: None  
**Contains**: Interfaces, domain models, shared types

### @repo/testing
**Purpose**: Test utilities  
**Contains**: Vitest config, test helpers, mocks

## Dependency Graph
```
apps/web → @repo/ui → @repo/core → @repo/domain
         ↘ @repo/i18n
         ↘ @repo/database
```

## Import Rules

1. **Apps can import from any package**
2. **@repo/ui can import from @repo/i18n, @repo/core, @repo/domain**
3. **@repo/core can ONLY import from @repo/domain**
4. **@repo/domain has NO dependencies (pure types)**
5. **No package can import from apps/**
6. **No circular dependencies allowed**

## Adding New Packages

1. Create package directory: `packages/new-package/`
2. Add package.json with proper exports
3. Add to pnpm-workspace.yaml
4. Define clear responsibility
5. Follow dependency rules
6. Document in this README
```

#### Update docs/02_LOG.md:
```markdown
## 2025-10-11 · Session 6: Phase 3 Complete - Package Structure

**Duration**: 4-6 hours  
**Focus**: Organize monorepo packages following Turborepo best practices

### ✅ PHASE 3 COMPLETE - PACKAGE ARCHITECTURE ORGANIZED

**Actions Taken**:
- Audited all packages in packages/
- Organized @repo/ui components by domain
- Fixed package exports (named exports, no barrel files)
- Validated dependency flow
- Removed forbidden imports
- Created packages/README.md documentation

**Metrics**:
- Packages audited: 6
- Components organized: [COUNT]
- Forbidden imports removed: [COUNT]
- Export improvements: Named exports by domain

**Benefits**:
- ✅ Clear package boundaries
- ✅ Proper dependency flow
- ✅ Tree-shakeable exports
- ✅ Faster builds
- ✅ Better maintainability
```

---

## Validation Checklist

Run these commands to validate Phase 3 completion:

```bash
# 1. TypeScript check (all packages)
pnpm turbo check

# 2. Build all packages
pnpm turbo build --filter="@repo/*"

# 3. Check for framework contamination
grep -r "@sveltejs/kit" packages/core/
grep -r "from 'svelte'" packages/core/
grep -r "from 'svelte'" packages/domain/

# 4. Check for forbidden imports
grep -r "from '@repo/database'" packages/ui/src/
grep -r "from '../../../apps/" packages/*/src/

# 5. Check for circular dependencies
pnpm list --depth 2 | grep "@repo"

# 6. Verify exports
cat packages/ui/src/index.ts
```

### Success Criteria:
- [ ] All packages have clear, single responsibility
- [ ] No framework imports in @repo/core or @repo/domain
- [ ] No circular dependencies
- [ ] @repo/ui components organized by domain
- [ ] Clean exports (named exports by domain)
- [ ] No app-specific code in packages
- [ ] TypeScript check passes
- [ ] Build passes for all packages
- [ ] packages/README.md created
- [ ] docs/02_LOG.md updated

---

## Expected Results

**After Phase 3**:
- ✅ **Clear package boundaries** - Each package has single responsibility
- ✅ **Organized @repo/ui** - Components grouped by domain (badges/, buttons/, cards/, etc.)
- ✅ **Clean dependency flow** - apps → ui → core → domain
- ✅ **Better exports** - Named exports by domain, tree-shakeable
- ✅ **No forbidden imports** - No framework imports in pure packages
- ✅ **Faster builds** - Cleaner dependencies
- ✅ **Documentation** - Package architecture documented

---

## Troubleshooting

### Issue: TypeScript errors after refactoring
**Solution**: Run `pnpm install` and `pnpm turbo check` to regenerate types

### Issue: Circular dependency detected
**Solution**: 
1. Use `pnpm why <package>` to trace dependency
2. Refactor to remove circular import
3. Consider extracting shared code to @repo/domain

### Issue: Component not found after moving
**Solution**: Update all imports in apps/web with correct path

### Issue: Build fails for package
**Solution**: 
1. Check package.json exports are correct
2. Verify tsconfig.json extends workspace config
3. Run `pnpm turbo build --filter="@repo/package-name" --force`

---

## Quick Commands Reference

```bash
# Audit
ls -la packages/
find packages/ui/src -name "*.svelte"
cat packages/ui/src/index.ts
grep -r "@sveltejs" packages/core/
grep -r "from '@repo/database'" packages/ui/src/

# Build & Test
pnpm turbo build --filter="@repo/*"
pnpm turbo check
pnpm turbo test --filter="@repo/core"

# Dependencies
pnpm list --depth 2 | grep "@repo"
cat packages/*/package.json | grep -A 5 "dependencies"

# Move Components (if needed)
mv packages/ui/src/lib/components/X.svelte apps/web/src/lib/components/X.svelte

# Update Imports (after moving)
# Find and replace in apps/web/src/
# From: import X from '@repo/ui'
# To: import X from '$lib/components/X.svelte'
```

---

## After Phase 3

Once complete, you'll have:
- Professional monorepo architecture
- Clear package separation
- Optimized build times
- Better developer experience
- Production-ready structure

**Next**: Phase 4 (if needed) - Advanced optimizations, performance tuning, or other improvements

---

## Notes

- **Phase 1** cleaned @repo/core (framework-agnostic)
- **Phase 2** cleaned apps/web components (route colocation)
- **Phase 3** cleans packages/ structure (proper boundaries)

Each phase builds on the previous, creating a progressively cleaner, more maintainable codebase following official SvelteKit 2 + Turborepo best practices.

---

**Ready to execute?** Start with Step 1 (audit @repo/ui) and work through each step! 🚀

Good luck! < 3
