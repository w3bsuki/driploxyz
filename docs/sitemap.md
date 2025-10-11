# Project Sitemap - Ideal Structure

This sitemap defines the **IDEAL** final directory layout for the SvelteKit 2 + Svelte 5 monorepo following official best practices. This represents the target structure we're working toward through the refactor process.

## Legend

- ✅ Already aligned with best practices
- 🔄 Needs refactoring to match ideal structure  
- 🗑️ Should be removed (duplicate or unnecessary)
- 📝 Needs documentation or cleanup
- ⚠️ Requires careful migration

## Philosophy

This structure follows **SvelteKit Best Practices**:
1. **Single Source of Truth** - No duplicate assets across apps
2. **Colocation** - Keep related code together in routes
3. **Clear Boundaries** - Separate server-only code with `$lib/server`
4. **Type Safety** - Generated types via `$types.d.ts`
5. **Package Isolation** - Shared packages are truly reusable

## Final Monorepo Layoutitemap

This sitemap locks in the final directory layout for the SvelteKit 2 + Svelte 5 monorepo with Supabase, Paraglide, Tailwind v4, and shared UI packages. Treat it as the single source of truth before executing any refactor work.

## Legend

- ✅ Moved or confirmed in the new structure
- 🔄 Action required to finish alignment
- 🗑️ Remove or archive after verification

## Final Monorepo Layout

### Apps Structure (SvelteKit Applications)

| Path | Status | Purpose | Key Principles |
|------|--------|---------|----------------|
| `/apps/web/src/routes` | ✅ | Customer-facing routes, layouts, pages | **Colocation**: Keep route-specific components in route folders |
| `/apps/web/src/lib` | 🔄 | Reusable utilities & components via `$lib` | **Server isolation**: Use `$lib/server` for server-only code |
| `/apps/web/src/lib/server` | 🔄 | Server-only code (Supabase clients, auth) | **Never** imported by client code |
| `/apps/web/src/params` | ✅ | Custom parameter matchers | For advanced routing validation |
| `/apps/web/static` | ✅ | Static assets (images, fonts, robots.txt) | Served as-is, no processing |
| `/apps/admin/src` | ✅ | Admin panel with service-role Supabase auth | Uses `$lib/server` pattern |
| `/apps/docs/src` | ✅ | Documentation site (pre-rendered) | Static generation |

### Packages Structure (Shared Code)

| Path | Status | Purpose | Export Pattern |
|------|--------|---------|----------------|
| `/packages/ui/src/lib` | ✅ | **Publishable** Svelte 5 component library | Exports via `package.json` "exports" field |
| `/packages/ui/src/lib/components` | ✅ | Runes-based UI components | Fully typed with `$props()`, `$derived()` |
| `/packages/i18n` | ✅ | **Single source** for i18n (Paraglide) | ⚠️ NO duplicates in apps |
| `/packages/i18n/paraglide` | ✅ | Generated i18n output | Auto-generated, DO NOT edit manually |
| `/packages/core/src` | 🔄 | Business logic services | Pure functions, no framework deps |
| `/packages/domain/src` | ✅ | Type definitions & validators | Shared types across apps |
| `/packages/database/src` | ✅ | Supabase generated types | Auto-generated via `supabase gen types` |
| `/packages/database/src/generated` | ✅ | Type generation output | Regenerated via Turbo pipeline |
| `/packages/testing` | ✅ | Vitest & Playwright configs | Shared test setup |

### Infrastructure & Tooling

| Path | Status | Purpose | Notes |
|------|--------|---------|-------|
| `/supabase/migrations` | ✅ | SQL migration files | Version controlled |
| `/supabase/functions` | ✅ | Edge functions | Deno runtime |
| `/scripts` | 🔄 | Build & automation scripts | ESM-only, no legacy CJS |
| `/docs` | 📝 | Project documentation | Keep updated with changes |

## Critical Principles from SvelteKit Best Practices

### 1. ✅ Route Colocation (Already Good)
```
src/routes/
  blog/
    [slug]/
      +page.svelte          ← Page component
      +page.ts              ← Load function
      +page.server.ts       ← Server-only load
      BlogComments.svelte   ← Route-specific component (colocated!)
```
**Rationale**: Components used by a single route should live WITH that route, not in a global `$lib/components`.

### 2. ⚠️ $lib vs $lib/server Separation (Needs Work)
```
src/lib/
  components/        ← Client-safe components only
  utils/            ← Pure utilities
  stores/           ← Svelte stores
  server/           ← ⚠️ SERVER-ONLY code
    database.ts     ← Supabase service role client
    auth.ts         ← Server-side auth helpers
```
**Action Required**: Audit all `$lib` imports to ensure server code is in `$lib/server`.

### 3. ✅ Single Source of Truth - i18n (CONFIRMED CORRECT)
- ✅ `/packages/i18n` is the ONLY source for Paraglide
- ✅ NO `apps/web/src/paraglide` directory (verified deleted)
- ✅ All apps import via `@repo/i18n`

### 4. 🔄 State Management (Needs Review)
- ❌ Avoid global stores shared across SSR requests
- ✅ Use `$derived()` for computed values (not `$effect()`)
- ✅ Use context API for passing state down component tree
- ⚠️ URL search params for filters, sorting (needs verification)

### 5. 🔄 Type Safety (Partially Complete)
- ✅ Use `$types.d.ts` imports: `import type { PageProps } from './$types'`
- 🔄 Ensure all `load` functions have correct type annotations
- 🔄 Fix type errors identified in check command

## Refactor Action Items

### Phase 1: i18n Centralization ✅ COMPLETE
- ✅ Confirmed NO duplicate `apps/web/src/paraglide` directory
- ✅ All imports use `@repo/i18n` package
- 🔄 Fix missing i18n message keys (separate task)

### Phase 2: Server/Client Code Separation 🔄 IN PROGRESS
1. Audit `src/lib` in all apps for server-only code
2. Move server code to `src/lib/server`
3. Update imports to use `$lib/server` alias
4. Verify build catches any incorrect client imports

### Phase 3: Component Colocation 📝 PLANNED
1. Identify components used by only one route
2. Move them from `$lib/components` into route folders
3. Keep only truly shared components in packages/ui

### Phase 4: Type Error Resolution 🔄 IN PROGRESS
1. Fix missing i18n message keys
2. Add proper type annotations to load functions
3. Fix nullable type handling
4. Run `pnpm --filter web run check` until zero errors

## SvelteKit Architecture Guidelines

### Route Organization (Per SvelteKit Standards)

```
apps/web/src/routes/
  (marketing)/                    ← Layout group (no URL segment)
    +layout.svelte               ← Marketing layout
    +page.svelte                 ← Homepage
    about/
      +page.svelte               ← /about
  
  (auth)/                         ← Auth layout group
    login/
      +page.svelte               ← /login
      +page.server.ts            ← Server-side auth
    signup/
      +page.svelte
  
  (app)/                          ← Protected app layout
    +layout.server.ts            ← Auth check
    dashboard/
      +page.svelte
    profile/
      [id]/
        +page.svelte             ← /profile/[id]
        +page.server.ts          ← Load user data
        ProfileHeader.svelte     ← ✅ Route-colocated component
        ProfileStats.svelte      ← ✅ Route-colocated component
  
  api/                            ← API routes (avoid if using remote functions)
    +server.ts                   ← REST-style endpoints (legacy)
```

### Load Function Best Practices

```typescript
// ✅ CORRECT: Type-safe server load
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const post = await locals.supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .single();
  
  return { post };
};
```

```svelte
<!-- ✅ CORRECT: Type-safe props -->
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageProps } from './$types';
  
  let { data }: PageProps = $props();
</script>

<h1>{data.post.title}</h1>
```

### State Management Patterns

```typescript
// ❌ WRONG: Global mutable state
let currentUser = null; // This is shared across ALL requests!

// ✅ CORRECT: Context-based state
import { setContext, getContext } from 'svelte';

// In +layout.svelte
setContext('user', () => data.user);

// In child component
const user = getContext('user');
```

### Server vs Client Code

```typescript
// ❌ WRONG: Server code in $lib
// src/lib/database.ts
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
// This will fail if imported client-side!

// ✅ CORRECT: Server code in $lib/server
// src/lib/server/database.ts
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
// SvelteKit prevents client imports

// ✅ CORRECT: Client import
// src/lib/api.ts
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
// Safe to import anywhere
```

## Package Architecture (Component Library Pattern)

### `/packages/ui` - Svelte Component Library

Following **@sveltejs/package** best practices:

```
packages/ui/
  src/
    lib/                    ← Public API (becomes dist/)
      components/
        Button.svelte       ← Exported component
        Input.svelte
      index.ts              ← Main export
    routes/                 ← Demo/docs site (not published)
      +page.svelte          ← Component showcase
  
  package.json
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "svelte": "./dist/index.js"
      }
    }
```

**Key Points**:
- ✅ `src/lib` is the publishable part
- ✅ `src/routes` is for demos/docs only
- ✅ Export via `package.json` "exports" field
- ✅ Generate types with `svelte-package`

### `/packages/i18n` - Internationalization (Paraglide)

```
packages/i18n/
  messages/               ← Source messages (en.json, es.json)
  paraglide/             ← ✅ GENERATED output (DO NOT EDIT)
    messages.js
    runtime.js
  src/
    index.ts             ← Re-exports paraglide runtime
  package.json
```

**Critical Rules**:
- ⚠️ NO duplicate paraglide folders in apps
- ✅ All apps import from `@repo/i18n`
- ✅ Messages defined ONCE in `packages/i18n/messages`

### `/packages/database` - Supabase Types

```
packages/database/
  src/
    generated/           ← ✅ Auto-generated (supabase gen types)
      supabase.ts
    index.ts             ← Re-exports types
  
  scripts/
    generate-types.ts    ← Turbo pipeline task
```

### `/packages/core` - Business Logic

```
packages/core/
  src/
    services/
      product.service.ts     ← Pure business logic
      order.service.ts
    utils/
      validation.ts          ← Framework-agnostic helpers
```

**Important**: 
- ❌ No SvelteKit-specific imports (`$app/*`)
- ❌ No Svelte components
- ✅ Pure TypeScript/JavaScript
- ✅ Testable with Vitest

### `/packages/domain` - Shared Types

```
packages/domain/
  src/
    types/
      user.ts
      product.ts
    validators/
      schemas.ts         ← Zod schemas
```

## Infrastructure & Configuration

### Root Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `pnpm-workspace.yaml` | Monorepo workspace definition | ✅ |
| `turbo.json` | Build orchestration & caching | ✅ |
| `tsconfig.json` | Base TypeScript config | ✅ |
| `.gitignore` | ⚠️ Ensure `.svelte-kit`, `dist`, `node_modules` | 🔄 |

### Per-App Configuration

Each SvelteKit app MUST have:
```
apps/web/
  svelte.config.js        ← Vite plugin, adapters, aliases
  vite.config.ts          ← Vite-specific config
  tsconfig.json           ← Extends base, adds $lib alias
  playwright.config.ts    ← E2E tests (if applicable)
  vitest.config.ts        ← Unit tests (if applicable)
```

**Critical `svelte.config.js` patterns**:
```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '$lib': './src/lib',
      '$lib/server': './src/lib/server'  // ⚠️ Critical!
    }
  }
};
```

## Verification & Testing Strategy

### Per-Phase Verification Steps

#### Phase 1: i18n Centralization ✅ COMPLETE
```bash
# ✅ Verify no duplicate paraglide directory
Test-Path "apps/web/src/paraglide"  # Should be False

# ✅ Verify imports use @repo/i18n
grep -r "from '@repo/i18n'" apps/web/src --include="*.ts" --include="*.svelte"

# 🔄 Run type check (will show missing i18n keys)
pnpm --filter web run check
```

#### Phase 2: Server/Client Separation
```bash
# Find potential server-only code in $lib
grep -r "SUPABASE_SERVICE_ROLE\|env/static/private" apps/web/src/lib --include="*.ts"

# Verify $lib/server exists and is used
ls apps/web/src/lib/server

# Build should catch client imports of server code
pnpm --filter web run build
```

#### Phase 3: Component Colocation
```bash
# Identify single-use components
# (Manual review of imports)

# After moving: verify imports updated
pnpm --filter web run check
pnpm --filter web run build
```

#### Phase 4: Type Error Resolution
```bash
# Zero errors goal
pnpm --filter web run check

# Build succeeds
pnpm --filter web run build

# Tests pass
pnpm --filter web run test
```

## Common Anti-Patterns to Avoid

### ❌ Don't: Global Mutable State on Server
```typescript
// ❌ WRONG - Shared across all users!
let currentUser = null;

export function setUser(user) {
  currentUser = user;  // BUG: All users see this!
}
```

### ✅ Do: Use Context or Return from Load
```typescript
// ✅ CORRECT - Per-request state
export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user  // Scoped to this request
  };
};
```

### ❌ Don't: Side Effects in Load Functions
```typescript
// ❌ WRONG
export const load: PageLoad = async () => {
  globalStore.set(data);  // Side effect!
  return { data };
};
```

### ✅ Do: Pure Load Functions
```typescript
// ✅ CORRECT
export const load: PageLoad = async () => {
  return { data };  // Just return data
};
```

### ❌ Don't: Duplicate Assets Across Apps
```
❌ apps/web/src/paraglide/     ← NO!
❌ apps/admin/src/paraglide/   ← NO!
✅ packages/i18n/paraglide/    ← YES!
```

### ✅ Do: Single Source Package
```typescript
// All apps import from same package
import * as i18n from '@repo/i18n';
```

## Maintenance Guidelines

### When Adding a New Route
1. Create route folder: `src/routes/feature/`
2. Add `+page.svelte` (and `+page.ts`/`+page.server.ts` if needed)
3. **Colocate** route-specific components in same folder
4. Use `$lib` only for truly shared utilities
5. Use `$lib/server` for any server-only code
6. Add types via `import type { PageProps } from './$types'`

### When Adding a Shared Component
1. Is it used by multiple routes? → `packages/ui`
2. Is it app-specific but reused? → `apps/[app]/src/lib/components`
3. Is it route-specific? → Keep it in the route folder!

### When Adding Server Code
1. ✅ Create in `src/lib/server/`
2. ✅ Import private env vars here
3. ✅ Use service role Supabase clients here
4. ❌ NEVER import server code in client components

### Before Each Commit
```bash
# Run these checks
pnpm lint
pnpm --filter web run check
pnpm --filter web run build
pnpm test

# Ensure no build artifacts committed
git status | grep -E ".svelte-kit|dist|node_modules"  # Should be empty
```

## Migration Tracking

| Task | Status | Blocker | Next Step |
|------|--------|---------|-----------|
| i18n centralization | ✅ | None | Document missing keys |
| Fix type errors | 🔄 | 2000+ errors | Prioritize by severity |
| Server/client audit | 📝 | None | Start with $lib scan |
| Component colocation | 📝 | Type errors | After types fixed |
| Remove legacy code | 📝 | Testing | After refactor complete |

## Success Criteria

✅ **Project is "perfect" when**:
1. Zero TypeScript errors (`pnpm check`)
2. All builds succeed (`pnpm build`)
3. All tests pass (`pnpm test`)
4. No duplicate assets (verified by grep)
5. Clear `$lib` vs `$lib/server` separation
6. Components colocated with routes where possible
7. Packages follow official `@sveltejs/package` pattern
8. All imports use workspace packages (`@repo/*`)

---

**Last Updated**: 2025-10-11  
**Next Review**: After Phase 2 completion
