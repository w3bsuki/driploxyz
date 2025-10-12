# 🧠 ULTRATHINK: Driplo Turbo MCP-Driven Restructure Analysis

**Generated:** October 12, 2025  
**Status:** Pre-Execution Deep Analysis  
**Purpose:** Strategic execution plan with MCP-verified patterns

---

## 📊 CURRENT STATE ANALYSIS

### ✅ **MCP Server Verification: OPERATIONAL**

1. **Svelte MCP:** ✅ 264 sections available
   - Key sections validated: `kit/project-structure`, `kit/routing`, `kit/advanced-routing`, `kit/load`, `kit/server-only-modules`
   - Official SvelteKit 2 + Svelte 5 documentation accessible
   
2. **Context7 MCP:** ✅ Turborepo library resolved
   - Library ID: `/vercel/turborepo`
   - Trust Score: 10/10
   - 822 code snippets available
   - Full access to best practices documentation
   
3. **Supabase MCP:** ✅ Project accessible
   - Project ID: `koowfhsaqmarfdkwsfiz`
   - Region: EU-Central-1
   - Status: ACTIVE_HEALTHY
   - PostgreSQL: 17.4.1.074

### 📋 **Current Codebase Metrics** (Baseline)

**From Documentation Review:**
- **Total Files:** 6,222 lines in PROJECT_SITEMAP.md (massive bloat)
- **Dependencies:** 770 packages (over-engineered)
- **TypeScript Errors:** 115+ documented
- **Framework Leakage:** 13+ illegal SvelteKit imports in `@repo/core`
- **Route Colocation:** ~30% (target: 100%)
- **Store Complexity:** 
  - `auth.svelte.ts`: 305 lines
  - `notifications.svelte.ts`: 304 lines
  - `favorites.svelte.ts`: 231 lines

**Current Stack (Verified):**
```json
{
  "@sveltejs/kit": "^2.36.2",
  "svelte": "^5.36.12",
  "vite": "^7.1.2",
  "tailwindcss": "^4.1.12",
  "@tailwindcss/vite": "^4.1.12",
  "turbo": "2.5.4",
  "@supabase/ssr": "0.7.0"
}
```

---

## 🎯 TARGET STATE (Official SvelteKit 2 Structure)

### **Official Project Structure** (From Svelte MCP)

```
my-project/
├ src/
│ ├ lib/
│ │ ├ server/              ← SERVER-ONLY CODE ONLY
│ │ │ └ [server utilities]
│ │ └ [shared lib files]   ← Client-safe code only
│ ├ params/
│ │ └ [param matchers]
│ ├ routes/
│ │ ├ (app)/              ← Layout group for authenticated routes
│ │ ├ (auth)/             ← Layout group for auth pages
│ │ └ [colocated components with routes]
│ ├ app.html
│ ├ error.html
│ ├ hooks.client.js
│ ├ hooks.server.js
│ └ service-worker.js
├ static/
├ tests/
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
```

### **Key Official Patterns Validated:**

1. **Server-Only Modules** (`kit/server-only-modules`):
   - Files with `.server` suffix or in `$lib/server/` are server-only
   - SvelteKit prevents importing these in client code
   - Private env vars (`$env/static/private`) only accessible server-side

2. **Route Colocation** (`kit/routing`):
   - "Any other files inside a route directory are ignored by SvelteKit"
   - "You can colocate components and utility modules with routes"
   - "If components are needed by multiple routes, put them in `$lib`"

3. **Layout Groups** (`kit/advanced-routing`):
   - `(group)` directories don't affect URL paths
   - Allow different layouts for different route sets
   - Example: `(app)/dashboard` and `(marketing)/about`

4. **$lib vs $lib/server** (`kit/project-structure`):
   - `$lib` contains library code importable via `$lib` alias
   - `$lib/server` contains server-only code via `$lib/server` alias
   - SvelteKit prevents importing `$lib/server` in client code

---

## 🔥 CRITICAL VIOLATIONS IDENTIFIED

### **1. Framework Leakage in @repo/core** ❌ SEVERE

**Problem:** Core business logic packages importing SvelteKit-specific APIs
```typescript
// ❌ FOUND IN packages/core/src/
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
```

**Impact:** 
- Breaks framework-agnostic principle
- Cannot reuse logic in other frameworks
- Violates clean architecture boundaries
- Makes testing harder

**Official Pattern (from Context7 Turborepo):**
- Business logic packages should be framework-agnostic
- Use dependency injection for framework-specific concerns
- Pass configuration objects instead of importing framework APIs

### **2. Package Source Aliasing** ❌ HIGH

**Problem:** Apps importing from `../../packages/*/src` instead of exports
```javascript
// ❌ FOUND IN apps/web/vite.config.ts
resolve: {
  alias: {
    '@repo/ui': path.resolve('../../packages/ui/src'),
    '@repo/core': path.resolve('../../packages/core/src')
  }
}
```

**Impact:**
- Bypasses package.json exports
- No proper package boundaries
- Cannot use built packages
- Breaks Turborepo caching

**Official Pattern (from Svelte MCP `kit/packaging`):**
- Use proper `exports` field in package.json
- Apps import from package exports only
- Build packages with `@sveltejs/package` or `tsup`

### **3. $lib/server Separation** ❌ HIGH

**Problem:** Server-only code mixed with client code
```typescript
// ❌ FOUND IN apps/web/src/lib/
supabase/admin.ts              // Server-only (service role)
auth/session-server.ts         // Server-only (cookies)
```

**Impact:**
- Server secrets could leak to client
- SvelteKit build warnings/errors
- Security vulnerabilities
- SSR issues

**Official Pattern (from Svelte MCP):**
- All server-only code in `$lib/server/**`
- SvelteKit prevents importing `$lib/server` in client code
- Use `$lib/server` alias for imports

### **4. Poor Route Colocation** ❌ MEDIUM

**Problem:** Only ~30% of single-use components colocated with routes
```
apps/web/src/lib/components/
  ProductDetailPanel.svelte     // Used only in product/[id]
  CheckoutSummary.svelte        // Used only in checkout
  OrderConfirmation.svelte      // Used only in order/[id]
```

**Official Pattern (from Svelte MCP `kit/routing`):**
- "You can colocate components and utility modules with routes"
- Single-use components should live in route directories
- Only multi-use components in `$lib/components`

---

## 📐 STRATEGIC EXECUTION ORDER

### **Phase Priority Matrix**

```
CRITICAL PATH (MUST BE SEQUENTIAL):
  Structure Foundation (Tasks 6-10)
    ↓
  Route Colocation (Tasks 11-13)
    ↓
  Svelte 5 Migration (Tasks 14-17)
    ↓
  State & Infrastructure (Tasks 18-27)
    ↓
  Final Validation (Tasks 28-30)
```

### **Why This Order:**

1. **Foundation First (Tasks 6-10):**
   - Fix imports = Everything else works
   - Package boundaries = Proper structure
   - $lib/server separation = Security + SSR
   - **Blocks:** Everything depends on clean imports

2. **Colocation Second (Tasks 11-13):**
   - Requires stable import structure
   - Affects component organization
   - **Blocks:** Runes migration (need to know where components are)

3. **Svelte 5 Third (Tasks 14-17):**
   - Requires all components in final locations
   - Component-level refactor
   - **Blocks:** Store simplification (stores use runes)

4. **Infrastructure Fourth (Tasks 18-27):**
   - Requires stable component structure
   - Configuration optimization
   - Database validation
   - **Blocks:** Nothing (parallel-ish)

5. **Validation Last (Tasks 28-30):**
   - Comprehensive checks
   - Structure compliance
   - Final sign-off

---

## 🔧 DETAILED TASK BREAKDOWN WITH MCP PATTERNS

### **TASK 6: Fix Framework Leakage (CRITICAL)**

**MCP Pattern Required:** Dependency Injection (Context7)

**Current Violations:**
```typescript
// ❌ packages/core/src/supabase/client.ts
import { browser } from '$app/environment';
export function createClient() {
  if (browser) { /* ... */ }
}
```

**Official Pattern:**
```typescript
// ✅ packages/core/src/supabase/client.ts
export function createClient(options: { isBrowser: boolean }) {
  if (options.isBrowser) { /* ... */ }
}

// ✅ apps/web/src/lib/supabase.ts
import { browser } from '$app/environment';
import { createClient } from '@repo/core/supabase';
export const supabase = createClient({ isBrowser: browser });
```

**Files to Refactor:**
1. `packages/core/src/supabase/client.ts` → Accept runtime config
2. `packages/core/src/auth/session.ts` → Remove `$app/stores` imports
3. `packages/core/src/services/analytics.ts` → Remove `$app/navigation` imports

**Validation:**
```bash
# Must return 0 results
grep -r "\$app/" packages/core packages/domain packages/database
grep -r "\$env/" packages/core packages/domain packages/database  
grep -r "\$lib/" packages/core packages/domain packages/database
```

---

### **TASK 8: Fix Package Aliasing**

**MCP Pattern Required:** Package Exports (Svelte MCP `kit/packaging`)

**Current Violations:**
```javascript
// ❌ apps/web/vite.config.ts
resolve: {
  alias: {
    '@repo/ui': '../../packages/ui/src',
    '@repo/core': '../../packages/core/src'
  }
}
```

**Official Pattern:**
```json
// ✅ packages/ui/package.json
{
  "exports": {
    ".": {
      "svelte": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./components/*": {
      "svelte": "./dist/components/*.svelte",
      "types": "./dist/components/*.svelte.d.ts"
    }
  },
  "files": ["dist"]
}
```

```javascript
// ✅ apps/web/vite.config.ts
export default defineConfig({
  // NO ALIASES - Use package exports
});
```

**Required Changes:**
1. Remove ALL `resolve.alias` from vite.config.ts files
2. Update `package.json` exports for all packages
3. Build packages to `dist/` with proper structure
4. Update imports in apps to use package exports

**Validation:**
```bash
# Must return 0 results
grep -r "resolve.alias" apps/
grep -r "../../packages/" apps/
```

---

### **TASK 10: Implement $lib/server Separation**

**MCP Pattern Required:** Server-Only Modules (Svelte MCP)

**Official Rules:**
```
✅ ALLOWED in $lib/server/:
  - Database clients (Supabase with service role)
  - API keys and secrets
  - Server-side auth logic
  - Backend services

✅ ALLOWED in $lib/:
  - Shared components
  - Client utilities
  - Shared types
  - Client stores

❌ NEVER in $lib/:
  - Server-only Supabase client
  - Private env vars
  - Admin operations
```

**Migration Plan:**
```bash
# Create structure
mkdir -p apps/web/src/lib/server/{auth,database,services}

# Move server utilities
mv apps/web/src/lib/supabase/admin.ts \
   apps/web/src/lib/server/database/admin.ts
   
mv apps/web/src/lib/auth/session-server.ts \
   apps/web/src/lib/server/auth/session.ts

# Update imports globally
find apps/web/src -type f -name "*.ts" -o -name "*.svelte" | \
  xargs sed -i 's|$lib/supabase/admin|$lib/server/database/admin|g'
```

**Validation:**
SvelteKit will error on build if violated:
```
Cannot import $lib/server/* into code that runs in the browser
```

---

### **TASK 12: Execute Route Colocation**

**MCP Pattern Required:** Routing Best Practices (Svelte MCP)

**Official Pattern:**
> "You can colocate components and utility modules with routes"  
> "If components are needed by multiple routes, put them in `$lib`"

**Algorithm:**
```bash
# 1. Identify single-use components
for component in apps/web/src/lib/components/*.svelte; do
  usage_count=$(grep -r "$(basename $component .svelte)" apps/web/src/routes | wc -l)
  if [ $usage_count -eq 1 ]; then
    echo "Single-use: $component"
  fi
done

# 2. Find which route uses it
for component in [single-use-list]; do
  route=$(grep -r "import.*$(basename $component)" apps/web/src/routes | head -1)
  # Move component to that route directory
done
```

**Target Structure:**
```
src/routes/
├ product/[id]/
│ ├ ProductDetailPanel.svelte     ← Colocated
│ ├ ProductImage.svelte            ← Colocated
│ └ +page.svelte
├ checkout/
│ ├ CheckoutSummary.svelte         ← Colocated
│ ├ PaymentForm.svelte             ← Colocated
│ └ +page.svelte
```

**Keep in $lib/components:**
- Button, Input, Card (used everywhere)
- Layout components (Header, Footer)
- Design system primitives

---

### **TASK 14-16: Runes Migration**

**MCP Pattern Required:** Svelte 5 Runes (Svelte MCP)

**Official Patterns:**

**Props (`$props()`):**
```svelte
<!-- ❌ OLD -->
<script>
  export let title: string;
  export let onClick: () => void = () => {};
</script>

<!-- ✅ NEW -->
<script>
  let { title, onClick = () => {} }: Props = $props();
</script>
```

**Events (native handlers):**
```svelte
<!-- ❌ OLD -->
<button on:click={handleClick}>Click</button>

<!-- ✅ NEW -->
<button onclick={handleClick}>Click</button>
```

**Reactivity ($derived):**
```typescript
// ❌ OLD
$: doubled = count * 2;

// ✅ NEW
let doubled = $derived(count * 2);
```

**Effects ($effect - minimize):**
```typescript
// ❌ OVERUSED - Should be $derived
let user = $state(null);
$effect(() => {
  const isAdmin = user?.role === 'admin';
  return isAdmin;
});

// ✅ CORRECT - Use $derived
let user = $state(null);
let isAdmin = $derived(user?.role === 'admin');

// ✅ CORRECT - True side effect
$effect(() => {
  const interval = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(interval);
});
```

**Validation:**
Use `svelte-mcp svelte-autofixer` on ALL components after migration.

---

### **TASK 18: Simplify Store Files**

**MCP Pattern Required:** State Management (Svelte MCP)

**Target Reductions:**
- `auth.svelte.ts`: 305 → 100 lines (67% reduction)
- `notifications.svelte.ts`: 304 → 80 lines (74% reduction)
- `favorites.svelte.ts`: 231 → 60 lines (74% reduction)

**Official Pattern:**
```typescript
// ❌ OLD (305 lines)
export function createAuthStore() {
  let state = $state({/* ... */});
  
  return {
    get user() { return state.user; },
    get session() { return state.session; },
    get profile() { return state.profile; },
    // ... 10+ more getters
    setUser(user) { state.user = user; },
    // ... methods
  };
}

// ✅ NEW (100 lines)
export function createAuthStore() {
  let user = $state<User | null>(null);
  let session = $state<Session | null>(null);
  let profile = $state<Profile | null>(null);
  
  // Computed as $derived
  let isAuthenticated = $derived(!!user);
  
  return {
    user,      // Direct reactive state
    session,
    profile,
    isAuthenticated,
    
    // Only methods
    async signIn(email: string, password: string) { /* ... */ },
    async signOut() { /* ... */ }
  };
}
```

**Key Simplifications:**
1. Remove getters → Expose reactive state directly
2. Convert computed to `$derived`
3. Remove setters → Direct assignment
4. Keep only essential methods

---

### **TASK 20: Update turbo.json**

**MCP Pattern Required:** Turborepo Best Practices (Context7)

**Current Issues:**
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".svelte-kit/**", ".vercel/**", "dist/**"]
    }
  }
}
```

**Official Pattern (from Context7 Turborepo docs):**
```json
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
        "!.svelte-kit/cache/**",      // ← Exclude cache
        "dist/**"
      ],
      "env": ["DATABASE_URL", "SUPABASE_URL"]  // ← Track in cache key
    },
    "check-types": {
      "dependsOn": ["transit"],        // ← Transit node pattern
      "inputs": ["$TURBO_DEFAULT$", "**/*.{ts,tsx,svelte}"],
      "outputs": []
    },
    "transit": {
      "dependsOn": ["^transit"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  },
  "globalEnv": ["NODE_ENV"],
  "globalPassThroughEnv": ["PLAYWRIGHT_*"]
}
```

**Key Improvements:**
1. **Exclude cache directories** from outputs
2. **Track env vars** in cache keys
3. **Transit node** for parallel type checking
4. **Specific inputs** for each task type

---

## 🎯 SUCCESS METRICS & VALIDATION

### **After Each Task:**
```bash
# 1. Build must succeed
pnpm build

# 2. Dev server must start
pnpm dev --filter web

# 3. Type check must pass (or improve)
pnpm run check-types

# 4. Commit with clear message
git add .
git commit -m "refactor(task-N): [clear description]"
```

### **Phase Milestones:**

**Phase 1 (Foundation):**
- ✅ 0 framework imports in packages/
- ✅ 0 src aliasing in apps/
- ✅ All server code in $lib/server/
- ✅ pnpm build succeeds

**Phase 2 (Colocation):**
- ✅ 100% single-use components colocated
- ✅ Layout groups functioning
- ✅ Clean imports throughout

**Phase 3 (Svelte 5):**
- ✅ 0 `export let` patterns
- ✅ 0 `on:` directives
- ✅ 0 `$:` reactive statements
- ✅ svelte-autofixer 0 warnings

**Phase 4 (Infrastructure):**
- ✅ Turbo cache hit >80%
- ✅ Build times <2min with cache
- ✅ ESLint boundaries enforced

**Phase 5 (Final):**
- ✅ 0 TypeScript errors (down from 115+)
- ✅ PROJECT_SITEMAP.md <3,000 lines
- ✅ Lighthouse Performance >90
- ✅ All tests passing

---

## 🚨 RISK MITIGATION

### **Git Safety:**
```bash
# Before each phase
git checkout -b refactor/phase-N-$(date +%Y%m%d)
git commit --allow-empty -m "checkpoint: phase N start"

# After each task
git add .
git commit -m "refactor(task-N): [description]"

# Rollback if needed
git reset --hard HEAD^
```

### **Testing Cadence:**
```bash
# After EVERY task (not just phases)
pnpm dev --filter web  # Manual smoke test
pnpm build             # Build validation
pnpm check-types       # TS validation
```

### **Breaking Change Prevention:**
1. **Never modify public APIs** without updating consumers
2. **Test imports immediately** after moving files
3. **Run autofixer** after every component change
4. **Keep dev server running** to catch errors fast

---

## 📊 EXPECTED OUTCOMES

### **Code Metrics:**

| Metric | Current | Target | Reduction |
|--------|---------|--------|-----------|
| Files (sitemap) | 6,222 lines | <3,000 lines | 50%+ |
| Dependencies | 770 | <400 | 48% |
| TypeScript Errors | 115+ | 0 | 100% |
| Framework Imports | 13+ | 0 | 100% |
| Route Colocation | 30% | 100% | +70% |
| Store Lines (avg) | 280 | 80 | 71% |

### **Performance Metrics:**

| Metric | Current | Target |
|--------|---------|--------|
| CI Build (cold) | >5min | <5min |
| CI Build (cached) | N/A | <2min |
| Turbo Cache Hit | N/A | >80% |
| Lighthouse Score | Unknown | >90 |
| First Contentful Paint | Unknown | <1.5s |

### **Quality Metrics:**

| Metric | Target |
|--------|--------|
| ESLint Errors | 0 |
| Svelte Warnings | 0 |
| Test Coverage | >70% |
| E2E Tests Passing | 100% |

---

## 🎓 KEY LEARNINGS FROM MCP DOCS

### **From Svelte MCP:**

1. **Route Colocation is Official:**
   - "Any other files inside a route directory are ignored by SvelteKit"
   - Not a hack, it's the intended pattern
   - Reduces indirection

2. **$lib/server is Enforced:**
   - SvelteKit build will error on violations
   - Not just convention, it's a security feature
   - Use it confidently

3. **Layout Groups are Powerful:**
   - `(app)` and `(marketing)` can have different layouts
   - Don't affect URL structure
   - Clean separation of concerns

### **From Context7 Turborepo:**

1. **Transit Nodes for Type Checking:**
   - Allows parallel type checking
   - Faster CI builds
   - Official pattern

2. **Cache Exclusions Matter:**
   - Exclude `.svelte-kit/cache/**`
   - Avoid caching generated temp files
   - Improves cache hit rates

3. **Environment Variable Tracking:**
   - Include in cache keys
   - Prevents stale cached builds
   - Security best practice

### **From Supabase MCP:**

1. **Use Advisors:**
   - Security advisor catches missing RLS policies
   - Performance advisor suggests indexes
   - Free automated audit

2. **Migration Verification:**
   - Always list migrations before/after changes
   - Ensure migration history is clean
   - Catch drift early

---

## 🚀 READY FOR EXECUTION

**All Systems Go:**
- ✅ 3 MCP servers operational
- ✅ Official patterns documented
- ✅ Task breakdown complete (30 tasks)
- ✅ Execution order validated
- ✅ Success criteria defined
- ✅ Safety measures in place

**Estimated Timeline:**
- Pre-execution: 1 day (verification)
- Phase 1 (Foundation): 3-4 days
- Phase 2 (Colocation): 2-3 days
- Phase 3 (Svelte 5): 3-4 days
- Phase 4 (Infrastructure): 2-3 days
- Phase 5 (Validation): 2 days
- **Total: 2-3 weeks** (with testing)

**Next Steps:**
1. Review this analysis
2. Confirm understanding of all patterns
3. Create initial git checkpoint
4. Begin Task 2: Fetch official structure docs
5. Execute systematically, one task at a time

---

## 💡 FINAL NOTES

**This Will Succeed Because:**
1. **Official Patterns:** Every change backed by MCP documentation
2. **Incremental:** 30 small tasks, not 1 big bang
3. **Validated:** Test after every task
4. **Reversible:** Git checkpoints everywhere
5. **Disciplined:** Follow the process, no shortcuts

**Remember:**
- 🔥 **MCP docs first, code second**
- ✅ **One task at a time**
- ✅ **Test constantly**
- ✅ **Fix all imports**
- ✅ **Match official structure**
- ✅ **Keep it working**

**Let's build something amazing! 🎉**
