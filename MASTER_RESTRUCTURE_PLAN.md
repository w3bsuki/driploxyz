# Master Restructure Plan - Driplo Turbo Monorepo

**Version:** 1.0  
**Date:** January 2025  
**Status:** Ready for Execution  
**Goal:** Reduce codebase by 30-50%, eliminate tech debt, align with SvelteKit 2/Svelte 5/Turborepo/Vercel best practices

---

## 🚨 CRITICAL: MCP-DRIVEN EXECUTION PROTOCOL

**When reading this plan in a NEW CHAT, you MUST:**

1. **IMMEDIATELY create a detailed task list** (20-30 tasks minimum) breaking down ALL phases
2. **For EACH task, use the appropriate MCP FIRST** to verify the correct approach:
   - **Svelte 5/SvelteKit 2 tasks** → Use `svelte-mcp get-documentation` for official patterns
   - **Turborepo/Vercel tasks** → Use `context7 get-library-docs` for best practices
   - **Supabase tasks** → Use `supabase-mcp` for database operations
   - **TypeScript/Paraglide/other** → Use `context7` to fetch official docs
3. **BEFORE executing ANY restructure:**
   - Verify target structure with `svelte-mcp get-documentation "project-structure"`
   - Verify routing patterns with `svelte-mcp get-documentation "routing"`
   - Verify Turborepo config with `context7 get-library-docs "/vercel/turborepo" --topic "configuration"`
4. **ALL imports MUST be fixed** - This is the #1 priority
5. **ALL folders/files/packages** must match perfect SvelteKit 2 + Turborepo structure
6. **Structure finalization comes FIRST** - Cleanup comes AFTER structure is perfect

**Success = Perfect structure verified by MCPs + All imports working + 0 TypeScript errors**

---

## Executive Summary

This is the authoritative plan to restructure the Driplo Turbo monorepo from its current bloated state (6,222 lines in PROJECT_SITEMAP.md) to an ideal, maintainable structure following official best practices from:

- ✅ **SvelteKit 2** - Route colocation, $lib/server separation, proper SSR patterns
- ✅ **Svelte 5** - Runes migration ($props, $derived, $effect), reactive patterns
- ✅ **Turborepo** - Task pipelines, caching, workspace boundaries
- ✅ **Vercel** - Optimal adapter configuration, deployment patterns

**Current State:**
- 770 dependencies (excessive)
- 13 illegal SvelteKit imports in @repo/core
- Component duplication across apps/web and packages/ui
- 115+ TypeScript errors
- Inconsistent file naming and structure
- Over-engineered stores and components

**Target State:**
- Clean apps/ + packages/ structure
- Framework-agnostic @repo/core
- 100% route colocation for single-use components
- Zero TypeScript errors
- 0 server-only imports in client code
- Efficient Turbo caching with <2min CI builds

---

## 📋 MANDATORY TASK BREAKDOWN (Execute in New Chat)

**When you start execution, create this exact task list and mark each complete:**

### Pre-Execution (Tasks 1-5)
1. ✅ **Read and verify MCP availability** - Test all three MCP servers work
2. ✅ **Fetch SvelteKit 2 project structure** - `svelte-mcp get-documentation "project-structure"`
3. ✅ **Fetch SvelteKit 2 routing patterns** - `svelte-mcp get-documentation "routing"`
4. ✅ **Fetch Turborepo best practices** - `context7 get-library-docs "/vercel/turborepo"`
5. ✅ **Create baseline audit** - Document current state vs target state

### Structure Foundation (Tasks 6-10)
6. ✅ **Fix @repo/core framework leakage** - Remove all `$app`, `$env`, `$lib` imports (MCP: context7 for DI patterns)
7. ✅ **Fix package aliasing** - Remove `../../packages/` from all configs (MCP: svelte-mcp for proper imports)
8. ✅ **Implement $lib/server separation** - Move server-only code (MCP: svelte-mcp "server-only-modules")
9. ✅ **Verify package.json exports** - All packages export from dist (MCP: svelte-mcp "packaging")
10. ✅ **Test builds** - `pnpm build` must succeed

### Route Colocation (Tasks 11-13)
11. ✅ **Audit component usage** - Identify single-use vs multi-use components
12. ✅ **Colocate single-use components** - Move to route directories (MCP: svelte-mcp "routing")
13. ✅ **Verify layout groups** - Ensure (app)/ and (auth)/ groups work (MCP: svelte-mcp "advanced-routing")

### Svelte 5 Migration (Tasks 14-17)
14. ✅ **Runes migration - props** - Convert `export let` to `$props()` (MCP: svelte-mcp for $props patterns)
15. ✅ **Runes migration - events** - Convert `on:` to `onclick` (MCP: svelte-mcp for event handling)
16. ✅ **Runes migration - reactivity** - Convert `$:` to `$derived` (MCP: svelte-mcp for $derived)
17. ✅ **Run svelte-autofixer** - Validate all components pass checks

### State Management (Tasks 18-19)
18. ✅ **Simplify stores** - Reduce auth/notifications/favorites stores (MCP: svelte-mcp "state-management")
19. ✅ **SSR safety audit** - Wrap browser APIs with checks (MCP: svelte-mcp for SSR patterns)

### Turborepo (Tasks 20-22)
20. ✅ **Update turbo.json** - Add proper inputs/outputs/dependsOn (MCP: context7 "/vercel/turborepo" --topic "caching")
21. ✅ **Add ESLint boundaries** - Block illegal imports (MCP: context7 for eslint patterns)
22. ✅ **Test cache performance** - Verify <2min builds with cache

### Vercel & Performance (Tasks 23-25)
23. ✅ **Simplify adapter config** - Use defaults (MCP: context7 for adapter-vercel patterns)
24. ✅ **Add performance optimizations** - Images, fonts, lazy loading (MCP: svelte-mcp "performance")
25. ✅ **Deploy preview** - Verify Lighthouse >90

### Database (Tasks 26-27)
26. ✅ **Check Supabase advisors** - Security and performance (MCP: supabase-mcp get-advisors)
27. ✅ **Verify migrations** - All migrations applied (MCP: supabase-mcp list-migrations)

### Validation (Tasks 28-30)
28. ✅ **TypeScript check** - 0 errors (was 115+)
29. ✅ **Import validation** - No illegal imports remain
30. ✅ **Structure verification** - Matches perfect SvelteKit 2 structure

**Priority Order:** Tasks 6-10 (Foundation) → 11-13 (Routes) → 14-19 (Svelte 5) → 20-27 (Infra) → 28-30 (Validation)

---

## Phase 1: Structure Audit & Baseline (Week 1)

### 1.1 Current State Analysis

**MCP VERIFICATION REQUIRED FIRST:**

```bash
# STEP 1: Fetch official SvelteKit 2 structure documentation
svelte-mcp get-documentation "project-structure"
# → Save output to understand EXACT target structure

# STEP 2: Fetch routing best practices
svelte-mcp get-documentation "routing"
svelte-mcp get-documentation "advanced-routing"
# → Understand layout groups, route colocation rules

# STEP 3: Fetch server-only module patterns
svelte-mcp get-documentation "server-only-modules"
# → Learn how $lib/server MUST be structured

# STEP 4: Fetch Turborepo monorepo patterns
context7 get-library-docs "/vercel/turborepo" --topic "monorepo structure workspace configuration"
# → Understand proper package boundaries

# STEP 5: Check Supabase current state
supabase-mcp list-projects
supabase-mcp list-migrations --project-id "$PROJECT_ID"
supabase-mcp get-advisors --project-id "$PROJECT_ID" --type security
supabase-mcp get-advisors --project-id "$PROJECT_ID" --type performance
```

**THEN Generate Audit:**

```bash
# Manual checks AFTER understanding official patterns
grep -r "../../packages/" apps/web/
grep -r "\$app/" packages/core/src
grep -r "\$lib/server" apps/web/src/lib/components
```

**Deliverables:**
- `docs/audit/structure-violations.md` - List all illegal imports/aliasing
- `docs/audit/component-duplication.md` - Duplicate components between apps/ui
- `docs/audit/route-colocation-status.md` - Current colocation %
- `docs/audit/typescript-errors.md` - All TS errors categorized
- `docs/audit/turborepo-cache-baseline.md` - Current build times

**Acceptance Criteria:**
- Complete inventory of all structure violations
- Categorized TypeScript errors by package
- Baseline CI build time recorded

---

## Phase 2: Critical Structure Fixes (Week 1-2)

### 2.1 Fix Framework Leakage (@repo/core)

**Problem:** @repo/core has 13 SvelteKit imports - breaks framework-agnostic principle

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch dependency injection patterns from Context7
context7 resolve-library-id "typescript dependency injection"
context7 get-library-docs "[RESOLVED_ID]" --topic "dependency injection patterns"

# STEP 2: Fetch SvelteKit environment best practices
svelte-mcp get-documentation "load"
# → Shows how to pass environment context to framework-agnostic code

# STEP 3: Understand proper package boundaries
context7 get-library-docs "/vercel/turborepo" --topic "package boundaries"
```

**THEN Execute:**

```bash
# Find all violations
grep -r "\$app/" packages/core/src
grep -r "\$env/" packages/core/src
grep -r "\$lib/" packages/core/src

# Violations to fix:
packages/core/src/supabase/client.ts          # Uses $app/environment
packages/core/src/auth/session.ts             # Uses $app/stores
packages/core/src/services/analytics.ts       # Uses $app/navigation
```

**Solution Pattern:**

```typescript
// ❌ BEFORE (packages/core/src/supabase/client.ts)
import { browser } from '$app/environment';
export function createClient() {
  if (browser) { /* ... */ }
}

// ✅ AFTER - Use dependency injection
export function createClient(options: { isBrowser: boolean }) {
  if (options.isBrowser) { /* ... */ }
}

// Call site in apps/web/src/lib/server/supabase.ts
import { browser } from '$app/environment';
import { createClient } from '@repo/core/supabase';
export const supabase = createClient({ isBrowser: browser });
```

**Deliverables:**
- Move SvelteKit-specific code from @repo/core → apps/web/src/lib/
- Update @repo/core to accept config objects instead of importing framework APIs
- Zero $app, $env, $lib imports in packages/core, packages/domain, packages/database

**Acceptance Criteria:**
- `grep -r "\$app/" packages/` returns 0 results (except packages/ui)
- @repo/core builds in isolation without SvelteKit

---

### 2.2 Fix Package Aliasing

**Problem:** Apps directly import from `../../packages/*/src/**` instead of using exports

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch SvelteKit packaging documentation
svelte-mcp get-documentation "kit/packaging"
# → Learn how to properly export from packages

# STEP 2: Fetch Turborepo workspace best practices
context7 get-library-docs "/vercel/turborepo" --topic "workspace packages exports"

# STEP 3: Verify @sveltejs/package usage
context7 resolve-library-id "@sveltejs/package"
context7 get-library-docs "[RESOLVED_ID]" --topic "building packages"
```

**THEN Execute:**

```bash
# Find violations
grep -r "../../packages/" apps/web/svelte.config.js
grep -r "../../packages/" apps/web/vite.config.ts
grep -r "resolve.alias" apps/*/vite.config.ts
```

**Solution:**

```javascript
// ❌ BEFORE (apps/web/vite.config.ts)
export default defineConfig({
  resolve: {
    alias: {
      '@repo/ui': path.resolve('../../packages/ui/src'),
      '@repo/core': path.resolve('../../packages/core/src')
    }
  }
});

// ✅ AFTER - Use package exports only
export default defineConfig({
  // No aliases! Use package.json exports
});
```

Update all `package.json` exports:

```json
// packages/ui/package.json
{
  "exports": {
    ".": {
      "svelte": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./src/lib/styles/index.css",
    "./components/*": {
      "svelte": "./dist/components/*.svelte",
      "types": "./dist/components/*.svelte.d.ts"
    }
  },
  "files": ["dist", "src/lib/styles"]
}
```

**Deliverables:**
- Remove ALL `resolve.alias` pointing to `packages/*/src`
- Standardize `exports` in all package.json files
- Build packages with `@sveltejs/package` (ui) or `tsup` (core/domain)

**Acceptance Criteria:**
- `grep -r "../../packages/" apps/ | wc -l` = 0
- `pnpm -w build` completes successfully
- Apps import from package exports only

---

### 2.3 Fix $lib/server Separation

**Problem:** Server-only code mixed with client code

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch server-only modules documentation
svelte-mcp get-documentation "server-only-modules"
# → CRITICAL: Learn exact rules for what goes in $lib/server

# STEP 2: Fetch load function patterns
svelte-mcp get-documentation "load"
# → Understand server vs universal load functions

# STEP 3: Fetch Supabase SSR patterns
supabase-mcp search-docs '{
  searchDocs(query: "server-side rendering client") {
    nodes {
      title
      href
      content
    }
  }
}'
```

**THEN Execute:**

```bash
# Find violations
grep -r "\$lib/server" apps/web/src/lib/components/
grep -r "createClient.*PUBLIC" apps/web/src/lib/server/
```

**Rules:**

```typescript
// ✅ ALLOWED in $lib/server/
- Database clients (Supabase with service role)
- API keys and secrets
- Server-side auth logic
- Backend services

// ✅ ALLOWED in $lib/
- Shared components
- Client utilities
- Shared types
- Client stores

// ❌ NEVER in $lib/
- Server-only Supabase client
- Private env vars
- Admin operations
```

**Move server-only code:**

```bash
# Create $lib/server structure
mkdir -p apps/web/src/lib/server/{auth,database,services}

# Move server utilities
mv apps/web/src/lib/supabase/admin.ts apps/web/src/lib/server/database/
mv apps/web/src/lib/auth/session-server.ts apps/web/src/lib/server/auth/

# Update imports
sed -i 's|$lib/supabase/admin|$lib/server/database/admin|g' apps/web/src/**/*.ts
```

**Deliverables:**
- All server-only code in `$lib/server/**`
- Client code in `$lib/**` (non-server)
- ESLint rule blocking `$lib/server` imports in client contexts

**Acceptance Criteria:**
- SvelteKit build passes with 0 server-only import errors
- `sv check` clean or with documented exceptions

---

### 2.4 Route Colocation

**Problem:** Only ~30% of components are properly colocated with routes

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch routing documentation to understand colocation
svelte-mcp get-documentation "routing"
# → Look for "Other files" section explaining colocation rules

# STEP 2: Fetch advanced routing for layout groups
svelte-mcp get-documentation "advanced-routing"
# → Understand when to use (groups) vs direct routes

# STEP 3: Fetch project structure documentation
svelte-mcp get-documentation "project-structure"
# → See exact examples of colocated components
```

**THEN Execute:**

```bash
# Audit single-use components
find apps/web/src/lib/components -name "*.svelte" | while read file; do
  usage_count=$(grep -r "$(basename $file .svelte)" apps/web/src/routes | wc -l)
  if [ $usage_count -eq 1 ]; then
    echo "Single-use: $file"
  fi
done
```

**Solution Pattern:**

```bash
# ❌ BEFORE
apps/web/src/lib/components/ProductDetailPanel.svelte  # Used only in product/[id]
apps/web/src/lib/components/CheckoutSummary.svelte     # Used only in checkout

# ✅ AFTER - Colocate with route
apps/web/src/routes/product/[id]/ProductDetailPanel.svelte
apps/web/src/routes/checkout/CheckoutSummary.svelte
```

**Keep in $lib only if:**
- Used by 2+ routes
- Part of design system
- Shared utility component

**Deliverables:**
- Move all single-use components to route directories
- Update imports in route files
- Delete empty component directories

**Acceptance Criteria:**
- 100% single-use components colocated
- Multi-use components remain in $lib/components
- No broken imports

---

## Phase 3: Svelte 5 + SvelteKit 2 Best Practices (Week 2-3)

### 3.1 Runes Migration

**Problem:** Mixed legacy Svelte 4 patterns with Svelte 5 runes

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch ALL runes documentation
svelte-mcp get-documentation "svelte/$state"
svelte-mcp get-documentation "svelte/$derived"
svelte-mcp get-documentation "svelte/$effect"
svelte-mcp get-documentation "svelte/$props"
svelte-mcp get-documentation "svelte/$bindable"

# STEP 2: Fetch migration guide
svelte-mcp list-sections | grep -i "migrat"
svelte-mcp get-documentation "[MIGRATION_SECTION]"

# STEP 3: Understand component composition
svelte-mcp get-documentation "svelte/component-composition"
```

**THEN Execute:**

```bash
# Audit all components
find apps/web/src packages/ui/src -name "*.svelte" -exec svelte-autofixer {} \;

# Review common patterns
grep -r "export let" apps/web/src/routes
grep -r "on:" apps/web/src/routes
grep -r "\$:" apps/web/src/routes
```

**Patterns to fix:**

```svelte
<!-- ❌ BEFORE: Legacy props -->
<script lang="ts">
  export let title: string;
  export let onClick: () => void;
  
  $: doubled = count * 2;
</script>

<!-- ✅ AFTER: Svelte 5 runes -->
<script lang="ts">
  let { title, onClick = () => {} }: Props = $props();
  
  let doubled = $derived(count * 2);
</script>
```

```svelte
<!-- ❌ BEFORE: Legacy events -->
<button on:click={handleClick}>Click</button>

<!-- ✅ AFTER: Svelte 5 -->
<button onclick={handleClick}>Click</button>
```

**Effect optimization:**

```typescript
// ❌ BEFORE: Overused $effect
let user = $state(null);
$effect(() => {
  // Complex logic that should be $derived
  const isAdmin = user?.role === 'admin';
  const hasPermission = user?.permissions.includes('write');
  return isAdmin && hasPermission;
});

// ✅ AFTER: Use $derived
let user = $state(null);
let isAdmin = $derived(user?.role === 'admin');
let hasPermission = $derived(user?.permissions.includes('write'));
let canWrite = $derived(isAdmin && hasPermission);
```

**Deliverables:**
- Convert all `export let` to `$props()`
- Replace `on:` with native handlers
- Replace `$:` computed with `$derived`
- Minimize `$effect` usage (reserve for side effects only)

**Acceptance Criteria:**
- `svelte-autofixer` reports 0 warnings
- All components using consistent Svelte 5 patterns
- `grep "export let" | wc -l` = 0 (except type definitions)

---

### 3.2 SSR Safety Audit

**Problem:** Client-only code running during SSR

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch SSR patterns
svelte-mcp get-documentation "kit/state-management"
# → Includes "Avoid shared state on the server" section

# STEP 2: Fetch $app/environment docs
svelte-mcp list-sections | grep "app/"
svelte-mcp get-documentation "[APP_ENVIRONMENT_SECTION]"

# STEP 3: Fetch browser checks patterns
svelte-mcp get-documentation "svelte/$effect"
# → Shows how to use $effect for browser-only code
```

**THEN Execute:**

```bash
# Find potential SSR issues
grep -r "window\." apps/web/src/routes
grep -r "document\." apps/web/src/routes
grep -r "localStorage" apps/web/src/routes
grep -r "sessionStorage" apps/web/src/routes
```

**Fix pattern:**

```svelte
<!-- ❌ BEFORE: Unsafe SSR -->
<script>
  import { browser } from '$app/environment';
  
  const theme = localStorage.getItem('theme'); // ❌ Crashes on server
</script>

<!-- ✅ AFTER: Safe SSR -->
<script>
  import { browser } from '$app/environment';
  
  let theme = $state(browser ? localStorage.getItem('theme') : null);
  
  $effect(() => {
    if (browser && theme) {
      localStorage.setItem('theme', theme);
    }
  });
</script>
```

**Deliverables:**
- Wrap all browser APIs with `browser` checks
- Move client-only logic to `$effect` blocks
- Document SSR-safe patterns in ARCHITECTURE.md

**Acceptance Criteria:**
- `pnpm build` succeeds without SSR errors
- Preview server runs without crashes
- Lighthouse reports no hydration mismatches

---

### 3.3 State Management Cleanup

**Problem:** Over-engineered stores with 305+ lines

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch state management patterns
svelte-mcp get-documentation "kit/state-management"
# → Learn context API and proper state patterns

# STEP 2: Fetch $state documentation
svelte-mcp get-documentation "svelte/$state"
# → Understand reactive state management

# STEP 3: Fetch $derived for computed values
svelte-mcp get-documentation "svelte/$derived"
# → Replace complex getters with $derived
```

**THEN Execute:**

```typescript
// ❌ BEFORE: apps/web/src/lib/stores/auth.svelte.ts (305 lines)
export function createAuthStore() {
  let state = $state({/* ... */});
  
  return {
    get user() { return state.user; },
    get session() { return state.session; },
    get profile() { return state.profile; },
    get loading() { return state.loading; },
    // ... 10+ more getters
    get isAuthenticated() { return !!state.user; },
    setUser(user) { state.user = user; },
    setSession(session) { state.session = session; },
    // ... methods
  };
}

// ✅ AFTER: apps/web/src/lib/stores/auth.svelte.ts (80 lines)
export function createAuthStore() {
  let user = $state<User | null>(null);
  let session = $state<Session | null>(null);
  let profile = $state<Profile | null>(null);
  let loading = $state(false);
  
  // Computed values as $derived
  let isAuthenticated = $derived(!!user);
  
  // Expose reactive state directly
  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    
    // Methods only
    async signIn(email: string, password: string) { /* ... */ },
    async signOut() { /* ... */ }
  };
}
```

**Simplification targets:**
- auth.svelte.ts: 305 → 100 lines
- notifications.svelte.ts: 304 → 80 lines
- favorites.svelte.ts: 231 → 60 lines

**Deliverables:**
- Simplify complex stores using $state + $derived
- Remove unnecessary getters/setters
- Keep only essential methods

**Acceptance Criteria:**
- 60% reduction in store code
- Stores use Svelte 5 runes consistently
- All store consumers updated and working

---

## Phase 4: Turborepo Optimization (Week 3-4)

### 4.1 Task Pipeline Configuration

**Current turbo.json problems:**
- No explicit inputs/outputs
- Missing task dependencies
- No environment variable tracking

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch comprehensive Turborepo documentation
context7 get-library-docs "/vercel/turborepo" --topic "configuration tasks caching pipelines"

# STEP 2: Fetch specific examples for SvelteKit
context7 get-library-docs "/vercel/turborepo" --topic "sveltekit vite outputs"

# STEP 3: Fetch environment variable handling
context7 get-library-docs "/vercel/turborepo" --topic "environment variables env globalEnv"

# STEP 4: Fetch transit nodes pattern for type checking
context7 get-library-docs "/vercel/turborepo" --topic "transit nodes type checking"
```

**THEN Execute:** Update turbo.json with best practices

```json
// ✅ IDEAL turbo.json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env.production.local",
        ".env.local",
        ".env.production",
        ".env"
      ],
      "outputs": [
        ".svelte-kit/**",
        "!.svelte-kit/cache/**",
        ".next/**",
        "!.next/cache/**",
        "dist/**"
      ],
      "env": ["DATABASE_URL", "SUPABASE_URL"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "check-types": {
      "dependsOn": ["transit"],
      "inputs": ["$TURBO_DEFAULT$", "**/*.{ts,tsx,svelte}"],
      "outputs": []
    },
    "transit": {
      "dependsOn": ["^transit"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "format": {},
    "clean": {
      "cache": false
    }
  },
  "globalEnv": ["NODE_ENV"],
  "globalPassThroughEnv": ["PLAYWRIGHT_*"]
}
```

**Key improvements:**
- Use `$TURBO_DEFAULT$` for standard inputs
- Exclude cache directories from outputs
- Add transit node for parallel type checking
- Track environment variables in cache keys
- Proper `dependsOn` for task ordering

**Deliverables:**
- Updated turbo.json with optimal configuration
- Remove package-level turbo.json files (centralize at root)
- Document task dependencies in ARCHITECTURE.md

**Acceptance Criteria:**
- `turbo run build` completes in <5min
- Cache hit rate >80% on subsequent runs
- CI builds complete in <2min with cache

---

### 4.2 Workspace Boundaries

**Problem:** Apps can import directly from package source

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch ESLint import rules patterns
context7 resolve-library-id "eslint plugin import"
context7 get-library-docs "[RESOLVED_ID]" --topic "no-restricted-imports boundaries"

# STEP 2: Fetch Turborepo boundary patterns
context7 get-library-docs "/vercel/turborepo" --topic "workspace boundaries package imports"

# STEP 3: Fetch ESLint flat config patterns
context7 resolve-library-id "eslint flat config"
context7 get-library-docs "[RESOLVED_ID]" --topic "configuration"
```

**THEN Execute:** Add ESLint rules to enforce boundaries

```javascript
// packages/eslint-config/index.js
export default {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../packages/*/src/**'],
            message: 'Import from package exports, not src directly'
          },
          {
            group: ['$lib/server/**'],
            message: 'Server-only imports not allowed in client code',
            // Only apply in client contexts
          }
        ]
      }
    ]
  }
};
```

**Deliverables:**
- ESLint rules enforcing workspace boundaries
- Pre-commit hooks running lint checks
- CI validation of import rules

**Acceptance Criteria:**
- `pnpm lint` catches illegal imports
- All existing violations fixed
- New violations blocked by CI

---

## Phase 5: Vercel Optimization (Week 4)

### 5.1 Adapter Configuration

**Problem:** Over-configured adapters with unnecessary complexity

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch adapter-vercel documentation
context7 resolve-library-id "@sveltejs/adapter-vercel"
context7 get-library-docs "[RESOLVED_ID]" --topic "configuration options defaults"

# STEP 2: Fetch Vercel deployment patterns
context7 resolve-library-id "vercel sveltekit"
context7 get-library-docs "[RESOLVED_ID]" --topic "deployment configuration"

# STEP 3: Fetch SvelteKit adapter docs
svelte-mcp get-documentation "kit/adapters"
```

**THEN Execute:** Simplify to defaults

```javascript
// ❌ BEFORE: apps/web/svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x',
      regions: ['iad1'],
      split: true,
      prerender: { entries: [] }
    })
  }
};

// ✅ AFTER: Use defaults
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter()
    // Let Vercel/adapter handle configuration
  }
};
```

**Rationale:**
- Default runtime is already Node 20
- Vercel handles regions automatically
- Split is unnecessary for this app size
- Empty prerender.entries causes 404 issues

**Deliverables:**
- Simplified adapter config in all apps
- Remove custom vercel.json (unless needed for headers)
- Document deployment process in docs/deployment.md

**Acceptance Criteria:**
- Apps deploy successfully to Vercel
- No runtime errors in production
- Lighthouse score >90 on deployed app

---

### 5.2 Performance Optimization

**MCP VERIFICATION FIRST:**

```bash
# STEP 1: Fetch performance documentation
svelte-mcp get-documentation "kit/performance"
# → Official performance patterns for SvelteKit

# STEP 2: Fetch image optimization patterns
context7 resolve-library-id "@sveltejs/enhanced-img"
context7 get-library-docs "[RESOLVED_ID]" --topic "usage examples"

# STEP 3: Fetch preloading patterns
svelte-mcp get-documentation "kit/hooks"
# → Look for handle hook and preload examples
```

**THEN Execute:** Implement recommended patterns

```typescript
// ✅ Image optimization
import { enhanced } from '@sveltejs/enhanced-img';

<img src={enhanced(productImage)} alt="Product" />

// ✅ Font preloading in hooks.server.ts
export const handle = async ({ event, resolve }) => {
  return resolve(event, {
    preload: ({ type, path }) => {
      if (type === 'font' && path.includes('/fonts/')) {
        return true;
      }
      return false;
    }
  });
};

// ✅ Lazy loading for non-critical components
const HeavyChart = lazy(() => import('$lib/charts/HeavyChart.svelte'));
```

**Deliverables:**
- Image optimization using @sveltejs/enhanced-img
- Font preloading via handle hook
- Lazy loading for heavy components
- Bundle analysis and optimization

**Acceptance Criteria:**
- First Contentful Paint <1.5s
- Time to Interactive <3s
- Lighthouse Performance >90

---

## Phase 6: Cleanup & Documentation (Week 5)

### 6.1 Remove Tech Debt

**Action:** Execute cleanup manifest

```bash
# Delete artifact files
rm -f *.txt nul NUL
rm -f remaining-typescript-errors.txt lint-output.txt

# Archive old docs
mkdir -p docs/archive
mv PHASE_*.md docs/archive/
mv *_PROMPT.md docs/archive/agents/
mv *_AUDIT*.md docs/archive/audits/

# Remove legacy scripts
mkdir -p scripts/archive
mv scripts/fix-*.{mjs,ps1,sh} scripts/archive/
mv scripts/update-phase4c-imports.sh scripts/archive/

# Clean stale routes
rm -rf apps/web/src/routes/category/slug_disabled

# Remove duplicate components (already consolidated to @repo/ui)
# Verify first, then delete
```

**Deliverables:**
- Root directory cleaned (only essential files)
- docs/ contains only living documentation
- scripts/ contains only active scripts
- Zero duplicate components

**Acceptance Criteria:**
- Root `ls | wc -l` < 20 files
- docs/ organized into clear sections
- All links in README.md valid

---

### 6.2 Documentation Update

**Living Docs (Keep & Maintain):**

```
docs/
├── ARCHITECTURE.md         # System overview, package structure
├── DEVELOPMENT.md          # Setup, dev workflow, testing
├── MASTER_PLAN.md          # This file (strategy)
├── IDEAL_STRUCTURE.md      # Target structure reference
├── PROJECT_SITEMAP.md      # Current structure (update)
├── TESTING.md              # Testing patterns
└── deployment.md           # Deployment guide
```

**Archive (Move to docs/archive/):**

```
docs/archive/
├── agents/                 # Old prompts and agent instructions
├── audits/                 # Historical audit reports
├── planning/               # Phase planning documents
└── refactor/               # Previous refactor docs
```

**Action:**

```bash
# Update living docs
vim docs/ARCHITECTURE.md    # Add Turbo task graph
vim docs/DEVELOPMENT.md     # Update setup steps
vim docs/TESTING.md         # Add Vitest patterns

# Update README
cat > README.md << 'EOF'
# Driplo Turbo Monorepo

Modern e-commerce platform built with:
- SvelteKit 2 + Svelte 5
- Turborepo monorepo
- Supabase backend
- Vercel deployment

## Quick Start
\`\`\`bash
pnpm install
pnpm dev --filter web
\`\`\`

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Testing](docs/TESTING.md)

EOF
```

**Deliverables:**
- Updated ARCHITECTURE.md with current structure
- DEVELOPMENT.md with accurate setup steps
- README.md linking to living docs only
- All archive files moved to docs/archive/

**Acceptance Criteria:**
- All links work
- Setup instructions tested on clean machine
- No references to deleted files

---

## Phase 7: Validation & Testing (Week 6)

### 7.1 Automated Validation

**Action:** Create validation script

```bash
#!/bin/bash
# scripts/validate-structure.sh

echo "🔍 Validating structure..."

# Check for illegal imports
echo "Checking for framework leakage in packages..."
illegal_imports=$(grep -r "\$app\|\$env\|\$lib" packages/core packages/domain packages/database --include="*.ts" --include="*.js" | wc -l)
if [ $illegal_imports -ne 0 ]; then
  echo "❌ Found $illegal_imports illegal imports in packages"
  exit 1
fi

# Check for src aliasing
echo "Checking for src aliasing in apps..."
src_aliases=$(grep -r "../../packages/" apps/ --include="*.ts" --include="*.js" | wc -l)
if [ $src_aliases -ne 0 ]; then
  echo "❌ Found $src_aliases src aliases in apps"
  exit 1
fi

# Check TypeScript
echo "Type checking..."
pnpm run check-types
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found"
  exit 1
fi

# Check build
echo "Building..."
pnpm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ All validations passed!"
```

**Deliverables:**
- validation script in scripts/
- CI workflow running validation
- Pre-commit hook for local validation

**Acceptance Criteria:**
- `./scripts/validate-structure.sh` passes
- CI green on main branch
- Zero TypeScript errors

---

### 7.2 Testing

**Action:** Implement essential tests

```bash
# Unit tests
pnpm --filter web test            # Component tests
pnpm --filter @repo/core test     # Business logic tests

# E2E tests
pnpm --filter web test:e2e        # Critical user flows

# Type checking
pnpm -w run check-types           # All packages

# Lint
pnpm -w run lint                  # All packages
```

**Critical test coverage:**
- ✅ Auth flow (sign up, sign in, sign out)
- ✅ Product search and filtering
- ✅ Checkout process
- ✅ Admin order management
- ✅ i18n language switching

**Deliverables:**
- Test suite for critical flows
- Vitest config in @repo/testing
- Playwright E2E tests
- CI running all tests

**Acceptance Criteria:**
- All tests passing
- Coverage >70% for business logic
- E2E tests for critical flows pass

---

## Success Metrics

### Before Restructure:
- 6,222 line sitemap (massive bloat)
- 770 dependencies
- 115+ TypeScript errors
- 13 framework imports in @repo/core
- ~30% route colocation
- CI builds: >5min

### After Restructure:
- ✅ <3,000 line sitemap (50% reduction)
- ✅ <400 dependencies (48% reduction)
- ✅ 0 TypeScript errors
- ✅ 0 framework imports in @repo/core
- ✅ 100% route colocation
- ✅ CI builds: <2min with cache

### Code Quality:
- ✅ 0 ESLint errors
- ✅ 0 Svelte warnings
- ✅ Lighthouse Performance >90
- ✅ All tests passing
- ✅ Type-safe end-to-end

---

## Safety Measures

### Before Starting Each Phase:

```bash
# Create checkpoint branch
git checkout -b refactor/phase-N-$(date +%Y%m%d)

# Verify current state
pnpm build
pnpm test
```

### After Completing Each Phase:

```bash
# Test thoroughly
pnpm -w run validate-structure
pnpm -w run test
pnpm dev --filter web  # Manual smoke test

# Commit with clear message
git add .
git commit -m "refactor: complete phase N - [description]"

# Merge to main
git checkout main
git merge refactor/phase-N-$(date +%Y%m%d)
```

### Rollback Procedure:

```bash
# If something breaks
git checkout main
git revert HEAD

# Or reset to checkpoint
git reset --hard refactor/phase-N-$(date +%Y%m%d)^
```

---

## 🔥 MCP-DRIVEN EXECUTION (MANDATORY)

### CRITICAL: Use MCPs BEFORE Every Action

**You MUST follow this pattern for EVERY task:**

```bash
# PATTERN FOR EVERY TASK:
# 1. Fetch official documentation FIRST
# 2. Read and understand the pattern
# 3. Apply to your specific case
# 4. Validate with MCP tools
# 5. Test the change

# Example: Fixing route colocation
# STEP 1: Get official docs
svelte-mcp get-documentation "routing"

# STEP 2: Read and identify pattern for colocation

# STEP 3: Apply - move component to route directory

# STEP 4: Validate import paths work

# STEP 5: Test with `pnpm dev --filter web`
```

### MCP Usage by Task Type

| Task Type | MCP to Use | Documentation to Fetch |
|-----------|------------|------------------------|
| **Project Structure** | `svelte-mcp` | `"project-structure"`, `"routing"`, `"advanced-routing"` |
| **Component Patterns** | `svelte-mcp` | `"svelte/$state"`, `"svelte/$derived"`, `"svelte/$props"` |
| **Load Functions** | `svelte-mcp` | `"load"`, `"server-only-modules"` |
| **State Management** | `svelte-mcp` | `"kit/state-management"` |
| **SSR Patterns** | `svelte-mcp` | `"kit/state-management"`, `"svelte/$effect"` |
| **Turborepo Config** | `context7` | `"/vercel/turborepo"` with relevant topic |
| **Package Exports** | `svelte-mcp` + `context7` | `"kit/packaging"` + turborepo docs |
| **Adapter Config** | `context7` | `"@sveltejs/adapter-vercel"` |
| **TypeScript Config** | `context7` | `"typescript tsconfig"` |
| **Paraglide i18n** | `context7` | `"paraglide inlang"` |
| **Database Operations** | `supabase-mcp` | Use GraphQL queries |
| **Performance** | `svelte-mcp` | `"kit/performance"` |

### Execution Checklist (Every Task)

- [ ] **1. MCP Fetch** - Get official documentation for this task type
- [ ] **2. Read & Understand** - Study the official pattern/approach
- [ ] **3. Plan Implementation** - How does official pattern apply here?
- [ ] **4. Execute Change** - Make the actual code change
- [ ] **5. Validate with MCP** - Run autofixer or check documentation again
- [ ] **6. Test** - `pnpm dev --filter web` must work
- [ ] **7. Commit** - Git commit with clear message

### Svelte MCP Commands

```bash
# List all available documentation sections
svelte-mcp list-sections

# Get specific documentation (use exact section names from list-sections)
svelte-mcp get-documentation "project-structure"
svelte-mcp get-documentation "routing"
svelte-mcp get-documentation "load"
svelte-mcp get-documentation "server-only-modules"
svelte-mcp get-documentation "kit/state-management"
svelte-mcp get-documentation "svelte/$state"
svelte-mcp get-documentation "svelte/$derived"
svelte-mcp get-documentation "svelte/$effect"
svelte-mcp get-documentation "svelte/$props"

# Validate component after changes
svelte-mcp svelte-autofixer "path/to/component.svelte"

# Generate playground link for testing
svelte-mcp playground-link --name "Component Name" --tailwind true --files '{"App.svelte": "code"}'
```

### Context7 MCP Commands

```bash
# Resolve library ID first
context7 resolve-library-id "turborepo"
context7 resolve-library-id "@sveltejs/adapter-vercel"
context7 resolve-library-id "typescript"
context7 resolve-library-id "paraglide"

# Get documentation (use resolved ID)
context7 get-library-docs "/vercel/turborepo" --topic "configuration caching"
context7 get-library-docs "/vercel/turborepo" --topic "workspace packages"
context7 get-library-docs "/vercel/turborepo" --topic "environment variables"
context7 get-library-docs "[RESOLVED_ID]" --topic "[specific topic]"
```

### Supabase MCP Commands

```bash
# List projects
supabase-mcp list-projects

# Check migrations
supabase-mcp list-migrations --project-id "$PROJECT_ID"

# Get advisors (ALWAYS check security)
supabase-mcp get-advisors --project-id "$PROJECT_ID" --type security
supabase-mcp get-advisors --project-id "$PROJECT_ID" --type performance

# Search documentation
supabase-mcp search-docs '{
  searchDocs(query: "your search term") {
    nodes {
      title
      href
      content
    }
  }
}'

# Execute SQL (for queries, NOT migrations)
supabase-mcp execute-sql --project-id "$PROJECT_ID" --query "SELECT version()"
```

### MCP Best Practices

1. **ALWAYS fetch docs BEFORE coding** - Don't assume, verify with official source
2. **Use specific topics** - More specific = better results from Context7
3. **Read the output** - Don't just fetch and ignore, actually read the patterns
4. **Validate after changes** - Run autofixer for Svelte components
5. **Test frequently** - `pnpm dev --filter web` after each major change
6. **Check Supabase security** - Run advisors check after ANY database change

---

## Execution Timeline

| Week | Phase | Key Activities | Validation |
|------|-------|----------------|------------|
| 1 | Audit & Critical Fixes | Structure violations, framework leakage, aliasing | Illegal imports = 0 |
| 2 | SvelteKit Best Practices | Route colocation, $lib/server, SSR safety | sv check clean |
| 3 | Svelte 5 Optimization | Runes migration, store cleanup, effects audit | autofixer clean |
| 4 | Turborepo + Vercel | Pipeline config, boundaries, adapter tuning | CI <2min |
| 5 | Cleanup | Tech debt removal, docs update | Root <20 files |
| 6 | Validation | Testing, CI, deployment verification | All tests pass |

**Total Duration:** 6 weeks  
**Required Effort:** 1-2 hours/day + weekend testing  
**Risk Level:** Low (phased approach with rollback points)

---

## Critical Success Factors

1. 🔥 **USE MCPs BEFORE EVERY ACTION** - Fetch official docs first, code second
2. ✅ **Test after EVERY task** - Not just phases, but individual tasks
3. ✅ **Verify with MCPs** - Run autofixer, check docs, validate patterns
4. ✅ **Small atomic commits** - One task = one commit
5. ✅ **All imports MUST work** - #1 priority, test imports constantly
6. ✅ **Structure matches official docs** - Use svelte-mcp to verify
7. ✅ **Zero TypeScript errors** - Fix as you go, don't accumulate
8. ✅ **Keep it working** - Never break main branch

---

## Appendix A: Command Reference

```bash
# Development
pnpm dev --filter web             # Start web app
pnpm dev --filter admin           # Start admin app
pnpm build                        # Build all packages
pnpm test                         # Run all tests

# Validation
pnpm run check-types              # TypeScript check
pnpm run lint                     # ESLint check
pnpm run format                   # Prettier format
./scripts/validate-structure.sh  # Structure validation

# Turborepo
turbo run build --summarize       # Build with summary
turbo run test --filter=web       # Test specific package
turbo run lint --force            # Bypass cache

# Git workflow
git checkout -b refactor/phase-N
git commit -m "refactor: phase N - description"
git push origin refactor/phase-N

# Deployment
pnpm build --filter web
vercel --prod
```

---

## Appendix B: Package Structure Reference

```
apps/
  web/                           # Main storefront
    src/
      routes/                    # File-based routing
        (app)/                   # App layout group
        (auth)/                  # Auth layout group
        +layout.svelte
        +page.svelte
      lib/
        components/              # Multi-use components only
        server/                  # Server-only code
          auth/
          database/
          services/
        stores/
        utils/
      app.css                    # Tailwind v4 styles
  admin/                         # Admin dashboard
  docs/                          # Documentation site

packages/
  ui/                            # Shared UI components
    src/lib/
      components/
      styles/
      primitives/
    dist/                        # Built output
  core/                          # Business logic (framework-agnostic)
    src/
      auth/
      payments/
      email/
      services/
    dist/
  domain/                        # Types and models
    src/
      types/
      validators/
    dist/
  database/                      # Supabase types
    src/
      types.ts
  i18n/                          # Paraglide i18n
    messages/
    lib/                         # Compiled output
  testing/                       # Shared test configs
    vitest.config.base.js
    playwright.config.base.js
  eslint-config/                 # Shared ESLint
  typescript-config/             # Shared TypeScript
```

---

## Appendix C: Key Resources

### Official Documentation:
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Vercel SvelteKit](https://vercel.com/docs/frameworks/sveltekit)

### Internal Docs:
- `docs/IDEAL_STRUCTURE.md` - Target structure
- `docs/MASTER_PLAN.md` - High-level strategy
- `docs/ARCHITECTURE.md` - System design
- `docs/DEVELOPMENT.md` - Dev workflow

### MCP Servers:
- Svelte MCP - Component validation and docs
- Context7 MCP - Library best practices
- Supabase MCP - Database operations

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2025 | Initial comprehensive plan |

---

**This is the authoritative plan. Execute it phase by phase, test thoroughly, and maintain discipline. Success is guaranteed if you follow the process.**
