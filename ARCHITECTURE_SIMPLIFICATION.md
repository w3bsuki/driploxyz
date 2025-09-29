# Architecture Simplification Strategy
**Date:** 2025-09-29
**Status:** DRAFT
**Purpose:** Detailed execution plan for Phase 2 of refactor (package restructuring)

---

## Problem Statement

### Current Architecture Issues

**1. Inverted Dependency Sizes**
```
apps/web/src:        2.9MB (business logic, services, utilities)
packages/ui/src:     2.1MB (168 components, dumping ground)
packages/core/src:   50KB  (severely underutilized)
```

**Issue:** The app contains business logic that should be in shared packages. The monorepo exists in name only.

**2. Code Duplication**
- Form components exist in both apps/web/src/lib/components/forms AND packages/ui/src/lib/components/forms
- Auth components duplicated
- Service utilities scattered across app and packages

**3. Unclear Package Boundaries**
- @repo/ui contains business logic and UI primitives mixed together
- @repo/core only has auth and cookies, missing services and utilities
- No clear separation between domain logic and presentation

**4. Import Chaos**
Apps import from each other through relative paths instead of using @repo/* aliases consistently.

---

## Target Architecture

### Package Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    apps/web (SvelteKit App)                 │
│  • Routes and page compositions                             │
│  • App-specific layouts                                     │
│  • Environment configuration                                │
│  • Server-side route handlers                               │
│  Target: ~1.5MB                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓ imports
┌──────────────────────┬──────────────────────┬───────────────┐
│   @repo/ui           │   @repo/core         │ @repo/domain  │
│   • Pure UI          │   • Services         │ • Models      │
│   • Components       │   • Clients          │ • Validation  │
│   • Primitives       │   • Auth             │ • Types       │
│   • No business      │   • Email/Stripe     │ • Business    │
│     logic            │   • Analytics        │   rules       │
│   Target: ~1.5MB     │   Target: ~400KB     │ Target: ~500KB│
└──────────────────────┴──────────────────────┴───────────────┘
                              ↓ imports
┌─────────────────────────────────────────────────────────────┐
│                    @repo/database                           │
│  • Generated Supabase types                                 │
│  • Database schema definitions                              │
│  Target: ~100KB (generated)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Package Responsibilities

#### apps/web (1.5MB target)
**Keep:**
- `/routes/*` - All SvelteKit routes and API endpoints
- `/lib/hooks/*` - SvelteKit hooks (handle, handleError)
- `/lib/env/*` - Environment variable configuration
- `/lib/server/*` - Server-only utilities
- `/lib/stores/*` - App-specific UI state (auth popup, tutorial state)
- `/lib/components/*` - App-specific page compositions only

**Move Out:**
- `/lib/services/*` → @repo/core/services
- `/lib/client/*` → @repo/core/clients
- `/lib/stripe/*` → @repo/core/stripe
- `/lib/email/*` → @repo/core/email
- `/lib/supabase/*` → @repo/core/supabase
- `/lib/analytics/*` → @repo/core/analytics
- `/lib/monitoring/*` → @repo/core/monitoring
- `/lib/security/*` → @repo/core/security
- `/lib/validation/*` → @repo/domain/validation
- `/lib/types/*` → @repo/domain/types (except SvelteKit app types)
- `/lib/utils/*` → @repo/core/utils or @repo/domain depending on purpose

#### @repo/domain (NEW package, 500KB target)
**Purpose:** Business entities, validation, and domain logic independent of infrastructure.

**Contains:**
- `/models/*` - Product, Order, User, Profile, Transaction entities
- `/validation/*` - Zod schemas for domain objects
- `/types/*` - TypeScript types for domain concepts
- `/rules/*` - Business rules (commission calculation, pricing logic, status transitions)
- `/constants/*` - Business constants (categories, statuses, limits)
- `/helpers/*` - Pure functions for domain operations

**Examples:**
```typescript
// @repo/domain/models/product.ts
export interface Product {
  id: string;
  title: string;
  price: number;
  status: ProductStatus;
  // ... other fields
}

// @repo/domain/validation/product.ts
export const createProductSchema = z.object({
  title: z.string().min(3).max(100),
  price: z.number().positive(),
  // ... validation rules
});

// @repo/domain/rules/commission.ts
export function calculateCommission(price: number): number {
  // Business logic for commission calculation
}
```

**Dependencies:**
- `@repo/database` (for type references)
- `zod` (validation)
- NO dependencies on @repo/ui, @repo/core, or apps

#### @repo/core (expand to 400KB target)
**Purpose:** Service layer, external integrations, and infrastructure utilities.

**Current:** auth + cookies (50KB)
**Add:**
```
/services/
  - products.ts      (Product CRUD operations)
  - orders.ts        (Order management)
  - users.ts         (User management)
  - messages.ts      (Messaging operations)
  - subscriptions.ts (Subscription handling)
  - transactions.ts  (Transaction operations)

/clients/
  - supabase.ts      (Supabase client creation)
  - stripe.ts        (Stripe client wrapper)
  - storage.ts       (File upload/download)

/integrations/
  - email/           (Email sending via Resend)
  - analytics/       (Analytics tracking)
  - monitoring/      (Sentry, logging)
  - search/          (Search service)

/utilities/
  - date.ts          (Date formatting, parsing)
  - string.ts        (String manipulation)
  - currency.ts      (Currency formatting)
  - seo.ts           (SEO helpers)
  - image.ts         (Image processing)
```

**Dependencies:**
- `@repo/database` (database types)
- `@repo/domain` (business models and validation)
- `@supabase/supabase-js` (client)
- `stripe` (payments)
- `resend` (email)
- NO dependencies on @repo/ui or apps

#### @repo/ui (reorganize, keep ~1.5MB)
**Purpose:** Pure, reusable UI components with no business logic.

**Current Structure:** Flat 168 components across 17 categories
**Target Structure:** Organized by domain with clear exports

```
/primitives/          (Low-level wrappers around Melt UI, bits-ui)
  - button/
  - input/
  - select/
  - dialog/
  - tooltip/
  (Keep as-is, these are solid)

/components/
  /auth/              (Auth UI only, no business logic)
    - LoginForm.svelte
    - SignupForm.svelte
    - PasswordResetForm.svelte

  /product/           (Product display components)
    - ProductCard.svelte
    - ProductGrid.svelte
    - ProductImage.svelte
    - ProductPrice.svelte

  /messaging/         (Messaging UI)
    - MessageThread.svelte
    - MessageInput.svelte
    - ConversationList.svelte

  /forms/             (Generic form primitives only)
    - FormField.svelte
    - FormError.svelte
    - FormLabel.svelte

  /layout/            (Layout components)
    - Header.svelte
    - Footer.svelte
    - Sidebar.svelte

  /utilities/         (UI utilities)
    - Toast.svelte
    - ErrorBoundary.svelte
    - LoadingSpinner.svelte
    - Modal.svelte

/actions/             (Svelte actions)
/hooks/               (UI hooks - click outside, etc.)
/stores/              (UI-only stores - toast state, modal state)
/utils/               (UI utilities - class merging, etc.)
```

**Dependencies:**
- `@repo/database` (for type inference only)
- `@repo/domain` (for type references in props)
- `@melt-ui/svelte`, `bits-ui` (UI primitives)
- `tailwind-merge`, `clsx` (styling utilities)
- NO dependencies on @repo/core or service logic

**Rules:**
- ❌ No API calls in components
- ❌ No business logic (calculations, validation)
- ❌ No direct database access
- ✅ Accept data via props
- ✅ Emit events for user actions
- ✅ Focus on presentation and interaction

---

## Migration Strategy

### Phase 1: Create @repo/domain Package

**Step 1.1:** Initialize package structure
```bash
mkdir -p packages/domain/src/{models,validation,rules,types,constants,helpers}
touch packages/domain/package.json
touch packages/domain/tsconfig.json
touch packages/domain/README.md
```

**Step 1.2:** Configure package.json
```json
{
  "name": "@repo/domain",
  "version": "0.0.0",
  "type": "module",
  "engines": { "node": ">=22.12.0 <23" },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./models": "./dist/models/index.js",
    "./validation": "./dist/validation/index.js",
    "./rules": "./dist/rules/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "check-types": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run"
  },
  "dependencies": {
    "@repo/database": "workspace:*",
    "zod": "^3"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "tsup": "^8.0.0",
    "vitest": "^3.2.4"
  }
}
```

**Step 1.3:** Move domain logic from apps/web
- Identify pure business logic in `/lib/types/*`, `/lib/validation/*`
- Create models in @repo/domain
- Add tests as you move code
- Update imports incrementally

**Validation:**
```bash
pnpm --filter @repo/domain build
pnpm --filter @repo/domain test
```

### Phase 2: Expand @repo/core

**Step 2.1:** Move services layer
```bash
# Move files
mv apps/web/src/lib/services/* packages/core/src/services/
mv apps/web/src/lib/client/* packages/core/src/clients/

# Update package.json dependencies
# Add stripe, resend, @supabase/supabase-js to @repo/core
```

**Step 2.2:** Move integrations
```bash
mv apps/web/src/lib/stripe/* packages/core/src/integrations/stripe/
mv apps/web/src/lib/email/* packages/core/src/integrations/email/
mv apps/web/src/lib/analytics/* packages/core/src/integrations/analytics/
mv apps/web/src/lib/monitoring/* packages/core/src/integrations/monitoring/
```

**Step 2.3:** Update exports in @repo/core
```typescript
// packages/core/src/index.ts
export * from './services';
export * from './clients';
export * from './integrations';
export * from './auth';
export * from './utils';
```

**Step 2.4:** Update imports in apps/web
```typescript
// Before
import { createProduct } from '$lib/services/products';

// After
import { createProduct } from '@repo/core/services';
```

**Validation:**
```bash
pnpm --filter @repo/core build
pnpm --filter @repo/core test
pnpm --filter web check-types  # Must still pass
```

### Phase 3: Reorganize @repo/ui

**Step 3.1:** Audit component usage
- Find components only used in apps/web (move back to app)
- Find components duplicated between ui and web (consolidate in ui)
- Identify components with business logic (extract logic to @repo/core)

**Step 3.2:** Create domain-based folders
```bash
cd packages/ui/src/lib/components
mkdir -p product messaging checkout profile admin
# Move components into domain folders
```

**Step 3.3:** Remove business logic from components
- Extract API calls to @repo/core services
- Extract calculations to @repo/domain rules
- Pass data via props instead of fetching in components
- Emit events instead of calling services directly

**Example Refactor:**
```typescript
// Before (❌ Business logic in component)
// ProductCard.svelte
<script>
  import { supabase } from '$lib/supabase';

  async function addToFavorites() {
    const { error } = await supabase
      .from('favorites')
      .insert({ product_id: product.id });
  }
</script>

// After (✅ Pure component)
// @repo/ui/product/ProductCard.svelte
<script>
  import type { Product } from '@repo/domain/models';

  interface Props {
    product: Product;
    onFavorite?: (productId: string) => void;
  }

  let { product, onFavorite }: Props = $props();

  function handleFavorite() {
    onFavorite?.(product.id);
  }
</script>

// apps/web routes call the service
// +page.svelte
<script>
  import { addFavorite } from '@repo/core/services';
  import { ProductCard } from '@repo/ui/product';

  async function handleFavorite(productId: string) {
    await addFavorite(productId);
  }
</script>

<ProductCard {product} onFavorite={handleFavorite} />
```

**Validation:**
```bash
pnpm --filter @repo/ui build
pnpm --filter @repo/ui test
pnpm --filter web dev  # App still works
```

### Phase 4: Clean apps/web

**Step 4.1:** Remove migrated code
```bash
# After confirming imports are updated and tests pass
rm -rf apps/web/src/lib/services
rm -rf apps/web/src/lib/client
rm -rf apps/web/src/lib/stripe
rm -rf apps/web/src/lib/email
# ... etc
```

**Step 4.2:** Consolidate remaining app code
Keep only:
- `/lib/hooks/*` - SvelteKit hooks
- `/lib/server/*` - Server-side utilities for routes
- `/lib/env/*` - Environment configuration
- `/lib/stores/*` - App-specific state (tutorial, auth popup)
- `/lib/components/*` - Page-specific compositions (not reusable)

**Step 4.3:** Update imports throughout routes
Find/replace old import paths:
```bash
# Example
find apps/web/src/routes -type f -name "*.ts" -o -name "*.svelte" \
  | xargs sed -i "s/from '\$lib\/services/from '@repo\/core\/services/g"
```

**Validation:**
```bash
pnpm --filter web check-types
pnpm --filter web lint
pnpm --filter web build
pnpm --filter web test
```

---

## Testing Strategy During Migration

### 1. Incremental Moves
- Move one service at a time
- Update imports immediately
- Run tests after each move
- Commit working state before next move

### 2. Write Tests Before Moving
- Add unit tests to services before moving to @repo/core
- Ensures behavior doesn't change during migration
- Tests serve as documentation

### 3. Integration Tests
- E2E tests in apps/web should catch breaking changes
- Run full test suite after completing each phase
- Manual smoke testing of critical paths

### 4. Type Safety as Guard Rails
- TypeScript errors will catch broken imports
- Use strict mode during migration
- Fix type errors before committing

---

## Rollback Strategy

If migration causes problems:

**Level 1: Revert Single Move**
```bash
git revert <commit-hash>  # Revert specific file move
pnpm install              # Restore previous state
```

**Level 2: Revert Phase**
```bash
git revert <phase-start>..<phase-end>
pnpm install
```

**Level 3: Nuclear Option**
```bash
git reset --hard <pre-migration-commit>
pnpm install
# Start over with smaller increments
```

---

## Success Criteria

### Quantitative Metrics
- [ ] apps/web/src reduced from 2.9MB to ~1.5MB
- [ ] packages/core/src expanded from 50KB to ~400KB
- [ ] New @repo/domain package created (~500KB)
- [ ] Zero TypeScript errors after migration
- [ ] All tests pass
- [ ] All builds succeed

### Qualitative Indicators
- [ ] Clear separation between UI, domain, and infrastructure
- [ ] No circular dependencies between packages
- [ ] Imports use @repo/* aliases consistently
- [ ] Business logic is testable without UI
- [ ] Components are reusable without modification
- [ ] New features can be added without touching multiple packages

---

## Timeline Estimate

| Task | Duration | Dependencies |
|------|----------|--------------|
| Create @repo/domain | 1 day | None |
| Move domain logic | 1 day | @repo/domain created |
| Expand @repo/core | 2 days | Tests written |
| Reorganize @repo/ui | 2 days | Logic extracted |
| Clean apps/web | 1 day | All moves complete |
| Integration testing | 1 day | All phases done |

**Total:** 5-8 days (depending on test coverage added)

---

## Next Steps

1. Get approval for architecture changes
2. Create @repo/domain package
3. Write tests for services before moving
4. Execute Phase 1 (domain package)
5. Review and adjust before Phase 2

---

**Remember:** Move slowly, test frequently, commit working states.