# Phase 4B Domain Package Audit

**Date:** 2025-01-11
**Phase:** 4B - Domain Package Restructure
**Status:** In Progress

## 📋 Current Domain Package Structure

### Existing Files Analysis

```
packages/domain/src/
├── index.ts                           # Main export file - WELL STRUCTURED
├── services/
│   ├── index.ts                      # Services aggregator - GOOD
│   ├── products/                     # ✅ WELL-STRUCTURED DOMAIN
│   │   ├── index.ts                  # Comprehensive exports
│   │   ├── entities.ts               # Domain entities (Product, Category, etc.)
│   │   ├── ports.ts                  # Repository interfaces
│   │   ├── repos.ts                  # Repository implementations
│   │   ├── services.ts               # Business logic services
│   │   ├── value-objects.ts          # Value objects (Money, Slug)
│   │   └── __tests__/services.test.ts # Tests present
│   ├── orders/index.ts               # ❌ SIMPLE EXPORT ONLY
│   ├── profiles/index.ts             # ❌ SIMPLE EXPORT ONLY
│   ├── messaging/index.ts            # ❌ SIMPLE EXPORT ONLY
│   ├── payments/index.ts             # ❌ SIMPLE EXPORT ONLY
│   ├── adapters/                     # ❌ CROSS-CONTAMINATION
│   │   ├── index.ts
│   │   ├── category.domain.ts        # Domain logic in adapters
│   │   └── products.domain.ts        # Domain logic in adapters
│   └── cleanup/                      # ✅ HAS TESTS
│       └── __tests__/generateCleanupPlan.test.ts
├── types/index.ts                    # Type definitions - NEEDS REVIEW
├── validation/index.ts               # Validation rules - NEEDS EXPANSION
└── vitest-globals.d.ts              # Test setup - OK
```

### Package.json Analysis

**Current Exports:**
```json
{
  ".": "./dist/index.js",
  "./services": "./dist/services/index.js",
  "./services/products": "./dist/services/products/index.js",
  "./services/orders": "./dist/services/orders/index.js",
  "./services/profiles": "./dist/services/profiles/index.js",
  "./services/messaging": "./dist/services/messaging/index.js",
  "./services/payments": "./dist/services/payments/index.js",
  "./validation": "./dist/validation/index.js",
  "./types": "./dist/types/index.js",
  "./adapters": "./dist/services/adapters/index.js"
}
```

**Issues:**
- Services nested under `/services/` path - inconsistent with target structure
- Missing domain exports (cart, auth, users)
- Adapters exported as domain concern

## 🎯 Target Structure

### Desired Domain Organization

```
packages/domain/src/
├── cart/                    # 🆕 NEW DOMAIN
│   ├── services.ts         # Cart business logic
│   ├── validation.ts       # Cart validation rules
│   ├── types.ts            # Cart types & interfaces
│   └── index.ts            # Public exports
├── products/               # ✅ RESTRUCTURE EXISTING
│   ├── services.ts         # Consolidate business logic
│   ├── validation.ts       # Extract/create validation
│   ├── types.ts            # Extract all types
│   └── index.ts            # Public exports
├── auth/                   # 🆕 NEW DOMAIN
│   ├── services.ts         # Auth business rules only
│   ├── validation.ts       # Auth validation
│   ├── types.ts            # Auth types
│   └── index.ts            # Public exports
├── orders/                 # ✅ EXPAND EXISTING
│   ├── services.ts         # Expand from simple export
│   ├── validation.ts       # Add validation layer
│   ├── types.ts            # Add comprehensive types
│   └── index.ts            # Public exports
├── users/                  # 🆕 NEW DOMAIN
│   ├── services.ts         # User business logic
│   ├── validation.ts       # User validation
│   ├── types.ts            # User types
│   └── index.ts            # Public exports
├── payments/               # ✅ EXPAND EXISTING
│   ├── services.ts         # Expand from simple export
│   ├── validation.ts       # Add payment validation
│   ├── types.ts            # Add payment types
│   └── index.ts            # Public exports
└── shared/                 # 🆕 NEW SHARED UTILITIES
    ├── types.ts            # Shared domain types
    └── index.ts            # Public exports
```

### Target Package.json Exports

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  },
  "./cart": {
    "types": "./dist/cart/index.d.ts",
    "default": "./dist/cart/index.js"
  },
  "./products": {
    "types": "./dist/products/index.d.ts",
    "default": "./dist/products/index.js"
  },
  "./auth": {
    "types": "./dist/auth/index.d.ts",
    "default": "./dist/auth/index.js"
  },
  "./orders": {
    "types": "./dist/orders/index.d.ts",
    "default": "./dist/orders/index.js"
  },
  "./users": {
    "types": "./dist/users/index.d.ts",
    "default": "./dist/users/index.js"
  },
  "./payments": {
    "types": "./dist/payments/index.d.ts",
    "default": "./dist/payments/index.js"
  },
  "./shared": {
    "types": "./dist/shared/index.d.ts",
    "default": "./dist/shared/index.js"
  }
}
```

## 🔍 Domain Boundary Analysis

### Current State Issues

1. **Cross-Package Contamination:**
   - `adapters/` folder contains domain logic
   - Framework-specific code mixed with business logic
   - Unclear separation between domain and application layers

2. **Inconsistent Domain Structure:**
   - Products domain: Well-structured with entities, ports, repos, services
   - Other domains: Simple export files only
   - Missing proper validation layers

3. **Missing Domains:**
   - Cart domain (critical for e-commerce)
   - Auth domain (business rules only)
   - Users domain (user management business logic)

4. **Framework Dependencies:**
   - Need to audit for SvelteKit-specific code
   - Remove server-side initialization from domain logic
   - Ensure pure business logic only

### Files to Restructure

**Products Domain (Keep Architecture, Reorganize Files):**
- `services/products/entities.ts` → `products/types.ts`
- `services/products/value-objects.ts` → `products/types.ts`
- `services/products/ports.ts` → `products/types.ts`
- `services/products/repos.ts` → `products/services.ts`
- `services/products/services.ts` → `products/services.ts`

**Simple Domains (Expand):**
- `services/orders/index.ts` → `orders/services.ts` + `orders/types.ts` + `orders/validation.ts`
- `services/profiles/index.ts` → `users/services.ts` + `users/types.ts` + `users/validation.ts`
- `services/messaging/index.ts` → Consolidate into shared or appropriate domain
- `services/payments/index.ts` → `payments/services.ts` + `payments/types.ts` + `payments/validation.ts`

**New Domains (Create):**
- `cart/` - Create from scratch
- `auth/` - Create from scratch (business rules only)
- `users/` - Create (may pull from profiles)
- `shared/` - Create shared utilities

**Adapters (Move/Remove):**
- `services/adapters/` - Move to appropriate layer or remove domain-specific parts

## 📊 Import Analysis

### Current Import Patterns to Fix

**From Apps (examples to search for):**
```typescript
// These will need to be updated:
import { productService } from '@repo/domain/services/products';
import { orderService } from '@repo/domain/services/orders';
import { profileService } from '@repo/domain/services/profiles';
```

**Target Import Patterns:**
```typescript
// Should become:
import { productService } from '@repo/domain/products';
import { orderService } from '@repo/domain/orders';
import { userService } from '@repo/domain/users';
import { cartService } from '@repo/domain/cart';
```

### Internal Dependencies to Map

1. **Products domain self-contained** - Minimal changes needed
2. **Orders may depend on products** - Update relative imports
3. **Payments may depend on orders** - Update relative imports
4. **Users/Profiles relationship** - Clarify and organize
5. **Auth may depend on users** - Plan import structure

## 🚨 Critical Success Factors

1. **Preserve Products Domain Architecture** - It's well-designed
2. **Maintain Business Logic Purity** - No framework code in domains
3. **Create Clean Domain Boundaries** - Each domain self-contained
4. **Systematic Import Fixes** - Use PowerShell scripts (Phase 4A pattern)
5. **Test Early, Test Often** - Don't break the dev server
6. **Keep Git History Clean** - One comprehensive commit

## 📝 Migration Strategy

### Phase 4A Success Patterns to Follow:
- ✅ Create import mapping BEFORE moving files
- ✅ Copy files to new locations (keep old as backup)
- ✅ Use PowerShell scripts for systematic import fixes
- ✅ Test dev server BEFORE deleting old files
- ✅ Only commit when everything works

### Risks and Mitigations:
- **Risk:** Breaking existing imports
- **Mitigation:** Comprehensive import mapping + systematic scripts

- **Risk:** Losing business logic during restructure
- **Mitigation:** Preserve products architecture, audit each file

- **Risk:** Introducing framework dependencies
- **Mitigation:** Strict domain boundary enforcement

## ✅ Completion Criteria

- [ ] All 13 steps completed successfully
- [ ] Domain package organized by business boundaries
- [ ] Each domain has services, validation, types, index
- [ ] All imports fixed across monorepo (0 broken imports)
- [ ] package.json exports updated and working
- [ ] Domain package builds successfully
- [ ] Monorepo builds successfully
- [ ] Dev server runs without errors
- [ ] Old files deleted after successful testing
- [ ] Changes committed to git with descriptive message

## 📊 Expected Metrics

- **Files moved/restructured**: ~15-20 files
- **New domains created**: 4 (cart, auth, users, shared)
- **Import fixes needed**: 50+ across monorepo
- **PowerShell scripts**: 4 (domain, apps, packages, index)
- **Test files to update**: 1 (services test)
- **Build verification steps**: 3 (domain, monorepo, dev server)

---

**Next Step:** Create import mapping JSON file with detailed file movements.