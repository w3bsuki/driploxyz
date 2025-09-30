# System Architecture

This document describes the Driplo monorepo structure, technology choices, coding conventions, and ownership.

---

## Overview

Driplo is a **monorepo** using:
- **pnpm workspaces** - Package management and linking
- **Turborepo** - Build orchestration and caching
- **Node 22.12.x** - Runtime environment

**Apps** (apps/) contain user-facing applications.
**Packages** (packages/) contain shared code imported via `@repo/*` aliases.

---

## Monorepo Structure

```
driplo-turbo/
├── apps/
│   ├── web/              # Main storefront (SvelteKit 2 + Svelte 5)
│   ├── admin/            # Staff console
│   └── docs/             # Marketing site
├── packages/
│   ├── ui/               # Shared UI components
│   ├── core/             # Business logic & services
│   ├── database/         # Supabase types & schema
│   ├── i18n/             # Paraglide localization
│   ├── eslint-config/    # Shared ESLint flat config
│   └── typescript-config/# Shared TypeScript config
├── supabase/             # Database migrations & edge functions
├── turbo.json            # Turborepo pipeline
└── pnpm-workspace.yaml   # Workspace definition
```

---

## App Responsibilities

### apps/web - Storefront
**Purpose:** Customer-facing marketplace
**Contains:**
- `/src/routes` - SvelteKit routes (pages, API endpoints)
- `/src/lib/components` - App-specific compositions
- `/src/lib/stores` - App-specific state (auth popup, UI state)
- `/src/lib/hooks` - SvelteKit hooks (auth, error handling)
- `/src/lib/server` - Server-only utilities

**Imports from:**
- `@repo/ui` - Shared components
- `@repo/core` - Services and business logic
- `@repo/database` - Supabase types
- `@repo/i18n` - Translations

### apps/admin - Admin Dashboard
**Purpose:** Staff management console
**Shares:** UI primitives from `@repo/ui`
**Owns:** Admin-specific auth flows and routes

### apps/docs - Marketing Site
**Purpose:** Documentation and marketing
**Uses:** Design system from `@repo/ui`
**Owns:** Content-driven routes

---

## Package Responsibilities

### packages/ui
**Purpose:** Shared UI components and design system
**Exports:**
- Svelte 5 components (using runes)
- Tailwind CSS utilities
- Design tokens

**Rules:**
- Pure components (no business logic)
- Fully typed with TypeScript
- Documented with JSDoc

### packages/core
**Purpose:** Business logic and services
**Exports:**
- Auth utilities (session, cookies)
- Service layer (products, orders, stripe)
- Shared utilities
- Supabase client factories

**Rules:**
- No UI code
- Framework-agnostic when possible
- Unit tested (70% coverage)

### packages/database
**Purpose:** Database types and schema
**Exports:**
- Generated Supabase types
- Shared Zod schemas

**Generation:**
```bash
pnpm --filter @repo/database db:types
```

### packages/i18n
**Purpose:** Internationalization
**Exports:**
- Paraglide message bundles
- Translation utilities

**Supported Locales:** en, fr, de, es

### packages/eslint-config
**Purpose:** Shared linting rules
**Exports:** ESLint flat config consumed by all workspaces

### packages/typescript-config
**Purpose:** Shared TypeScript settings
**Exports:** Base tsconfig.json files

---

## Technology Stack

### Frontend
- **SvelteKit 2** - Application framework (routing, SSR, API routes)
- **Svelte 5** - UI framework with runes API (`$state`, `$derived`, `$effect`)
- **Tailwind CSS v4** - Utility-first styling
- **Paraglide** - Type-safe i18n with compile-time message extraction

### Backend
- **Supabase** - PostgreSQL database, Row Level Security, Auth, Storage
- **Stripe** - Payment processing (intents, webhooks, subscriptions)
- **Resend** - Transactional email

### Infrastructure
- **Vercel** - Hosting and edge deployment
- **Turborepo** - Monorepo task orchestration
- **pnpm** - Fast, disk-efficient package manager
- **Vitest** - Unit testing
- **Playwright** - E2E testing

---

## Data Flow

### Client → Server → Database

```
User Action (Browser)
  ↓
SvelteKit Route (+page.svelte)
  ↓
Load Function (+page.server.ts) or Form Action
  ↓
Service Layer (@repo/core/services)
  ↓
Supabase Client (@repo/core/supabase)
  ↓
PostgreSQL Database (Supabase)
```

### Auth Flow

```
1. User submits login form
2. SvelteKit action calls @repo/core/auth
3. Auth service calls Supabase Auth
4. Session cookie set via hooks.server.ts
5. Client receives session in page data
6. Protected routes check session in +page.server.ts
```

### Payment Flow

```
1. User initiates checkout
2. SvelteKit action calls @repo/core/services/stripe
3. Stripe service creates payment intent
4. Client confirms payment with Stripe.js
5. Webhook handler processes payment.succeeded event
6. Order record created in Supabase
7. Email sent via @repo/core/email
```

---

## Coding Conventions

### Naming

- **Components:** PascalCase (`ProductCard.svelte`, `Button.svelte`)
- **Routes:** kebab-case (`/product-detail`, `/user-profile`)
- **Variables:** camelCase (`userId`, `productData`)
- **Constants:** UPPER_SNAKE_CASE (`PUBLIC_SUPABASE_URL`, `STRIPE_SECRET_KEY`)
- **Files:** kebab-case or PascalCase matching export

### Imports

**Use workspace aliases:**
```typescript
// ✅ Good
import { Button } from '@repo/ui';
import { createClient } from '@repo/core/supabase';
import type { Database } from '@repo/database';

// ❌ Bad
import { Button } from '../../../packages/ui/src/Button.svelte';
```

### TypeScript

- **Explicit return types** on functions
- **No `any` types** - use `unknown` and type guards
- **Prefer interfaces** over types for objects
- **Use `satisfies`** for SvelteKit load/action exports

```typescript
// ✅ Good
export const load = (async ({ locals }) => {
  const session = locals.session;
  return { session };
}) satisfies PageServerLoad;

// ❌ Bad
export async function load({ locals }) {
  return { session: locals.session };
}
```

### File Organization

**SvelteKit Routes:**
```
routes/
├── +layout.svelte          # Root layout
├── +layout.server.ts       # Root layout data
├── +page.svelte            # Home page UI
├── +page.server.ts         # Home page data
├── products/
│   ├── +page.svelte
│   ├── +page.server.ts
│   └── [id]/
│       ├── +page.svelte
│       └── +page.server.ts
└── api/
    └── checkout/
        └── +server.ts      # API endpoint
```

**Keep server-only code in:**
- `+page.server.ts` (page data)
- `+server.ts` (API endpoints)
- `src/lib/server/` (utilities)

---

## Svelte 5 Rules

### State Management
```svelte
<script>
  // ✅ Reactive state
  let count = $state(0);

  // ✅ Derived values
  let doubled = $derived(count * 2);

  // ✅ Side effects
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### Component Props
```svelte
<script>
  // ✅ Props with defaults
  let { title = 'Default', onClick } = $props();
</script>
```

### Avoid
- ❌ Mutating arrays/objects (reassign instead)
- ❌ Renaming props (`export let someProp as renamed`)
- ❌ Mutating module-scope variables (use factories/context)
- ❌ Complex logic in `$effect` (use `$derived` for pure computations)

---

## SvelteKit 2 Data Conventions

### Load Functions
```typescript
// +page.server.ts
export const load = (async ({ locals, params }) => {
  const { supabase } = locals;
  const { data } = await supabase.from('products').select('*');
  return { products: data };
}) satisfies PageServerLoad;
```

### Form Actions
```typescript
// +page.server.ts
export const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    // Process form
    return { success: true };
  }
} satisfies Actions;
```

### Navigation
```typescript
import { goto, invalidate } from '$app/navigation';

// Navigate
await goto('/products');

// Rerun load functions
await invalidate('supabase:auth');
```

---

## Package Ownership

### Ownership Matrix

| Package | Primary Owner | Purpose |
|---------|--------------|---------|
| apps/web | Team | Storefront app |
| apps/admin | Team | Admin console |
| packages/ui | Team | Shared components |
| packages/core | Team | Business logic |
| packages/database | Team | Database types |
| packages/i18n | Team | Translations |

**Note:** Update ownership as team structure evolves.

---

## Deployment Architecture

### Vercel Deployment

```
User Request
  ↓
Vercel Edge Network (CDN)
  ↓
SvelteKit App (Serverless Functions)
  ↓
Supabase (Hosted PostgreSQL)
```

**Edge Functions:** Used for API routes (`/api/*`)
**Static Assets:** Served from Vercel CDN
**SSR:** Pages rendered on-demand via serverless functions

### Environment Variables

**Client-side (PUBLIC_*):**
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Server-side:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

**Storage:** Store in Vercel dashboard, copy to `.env` for local dev

---

## Required Artifacts

### Apps
- `package.json` with Node 22.12.x engine
- `vitest.config.ts` for unit tests
- `playwright.config.ts` for E2E tests
- `svelte.config.ts` with `@repo/*` aliases
- `tsconfig.json` extending SvelteKit config

### Packages
- `package.json` with workspace dependencies
- `README.md` or inline docs explaining purpose
- Unit tests or usage examples
- Type declarations (`.d.ts`)

### Supabase
- Migrations with revert strategy
- RLS policies for all tables
- Verified test coverage for policies

---

## Phase 0 Audit (Completed)

- ✅ Node 22.12.x enforced in all `package.json` files
- ✅ Workspace aliases (`@repo/*`) configured
- ✅ Legacy folders removed (`.logs/`, deprecated scripts)
- ✅ All workspaces have README or purpose section
- ✅ No build artifacts in git

---

## See Also

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [FRAMEWORKS.md](./FRAMEWORKS.md) - Framework-specific guides
- [SUPABASE.md](./SUPABASE.md) - Database and auth
- [TESTING.md](./TESTING.md) - Testing strategy