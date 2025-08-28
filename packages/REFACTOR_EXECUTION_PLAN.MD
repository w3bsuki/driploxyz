# 🚀 PRODUCTION REFACTOR EXECUTION PLAN v2.0

*A battle-tested, incremental approach to fixing our codebase without breaking production*

## 🎯 PRIMARY OBJECTIVES

1. **Fix infinite fetching on homepage** - Critical P0 issue
2. **Remove over-engineering** - Simplify without breaking features  
3. **Enforce Svelte 5/SvelteKit 2 best practices** - Based on official docs
4. **Maintain all existing functionality** - Zero feature regression
5. **Improve performance** - Target <2s LCP on mobile

## ⚠️ ANTI-PATTERNS TO ELIMINATE

Based on our tech stack best practices:

### Svelte 5 Issues
- Old Svelte 4 syntax (`let`, `$:`, `on:click`)
- Circular reactive dependencies
- Exported state variables losing reactivity
- Side effects in `$derived`
- Missing cleanup in `$effect`

### SvelteKit 2 Issues  
- Sequential data fetching (waterfalls)
- Passing Supabase clients through load functions
- Mixing server/client data fetching
- Using `invalidateAll()` excessively
- Non-serializable returns from server loads

### Supabase SSR Issues
- Using deprecated auth-helpers
- Trusting `getSession()` for security
- Missing `path: '/'` in cookie configuration
- Creating clients on every request
- Realtime subscriptions in server code

## 📋 PRE-FLIGHT CHECKLIST

Before ANY refactoring:

```bash
# 1. Create backup branch
git checkout -b backup/pre-refactor-$(date +%Y%m%d)
git push origin backup/pre-refactor-$(date +%Y%m%d)

# 2. Capture baseline metrics
pnpm check-types > baseline-types.txt
pnpm lint > baseline-lint.txt
pnpm build:web # Ensure it builds

# 3. Document current issues
- Homepage infinite fetching: YES/NO
- TypeScript errors: COUNT
- Build time: SECONDS
- Bundle size: KB
- LCP mobile: MS
```

## 🔧 PHASE 1: CRITICAL FIX - Infinite Fetching (DAY 1)

**Goal:** Stop the homepage infinite fetch loop immediately

### 1.1 Diagnose Root Cause

```typescript
// Check these files in order:
1. apps/web/src/routes/+page.server.ts
   - Look for: invalidateAll(), depends() misuse
   - Check: Promises not awaited properly
   
2. apps/web/src/routes/+layout.svelte
   - Look for: Multiple auth listeners
   - Check: Effects triggering invalidation
   
3. apps/web/src/routes/+page.svelte
   - Look for: onMount fetches in loops
   - Check: Reactive statements with API calls
```

### 1.2 Common Fixes

```typescript
// ❌ PROBLEM: Effect triggers fetch in loop
$effect(() => {
  if (someValue) {
    fetchData(); // This retriggers effect
  }
});

// ✅ SOLUTION: Use proper dependencies
let hasFetched = false;
$effect(() => {
  if (someValue && !hasFetched) {
    hasFetched = true;
    fetchData();
  }
});

// ❌ PROBLEM: invalidateAll in auth listener
onAuthStateChange(() => {
  invalidateAll(); // Triggers all loads
});

// ✅ SOLUTION: Targeted invalidation
onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    invalidate('supabase:auth'); // Only auth-dependent
  }
});
```

### 1.3 Verification
```bash
# Test the fix
pnpm dev
# Open Network tab - verify no repeating requests
# Check Console - no errors
```

## 🔧 PHASE 2: Auth & Session Management (DAY 2)

### 2.1 Fix hooks.server.ts

```typescript
// hooks.server.ts - CORRECT PATTERN
import { createServerClient } from '@supabase/ssr' // NOT auth-helpers!

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Create Supabase client with proper cookie config
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // CRITICAL: Must set path: '/'
            event.cookies.set(name, value, { ...options, path: '/' })
          })
        }
      }
    }
  )

  // 2. Safe session helper
  event.locals.safeGetSession = async () => {
    const { data: { user }, error } = await event.locals.supabase.auth.getUser()
    if (error) return { session: null, user: null }
    
    const { data: { session } } = await event.locals.supabase.auth.getSession()
    return { session, user }
  }

  return resolve(event)
}
```

### 2.2 Fix +layout.server.ts

```typescript
// +layout.server.ts - Return ONLY serializable data
export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  
  return {
    session,
    user,
    // Only primitives - NO clients, NO functions
  }
}
```

### 2.3 Fix +layout.ts

```typescript
// +layout.ts - DO NOT create clients here
export const load: LayoutLoad = async ({ data, depends }) => {
  depends('supabase:auth')
  
  // Just pass through server data
  return {
    session: data.session,
    user: data.user
  }
}
```

### 2.4 Fix +layout.svelte

```svelte
<script>
  import { onMount } from 'svelte'
  import { createBrowserClient } from '@supabase/ssr'
  
  let { data, children } = $props()
  
  // Single client instance
  let supabase = $state(null)
  
  onMount(() => {
    // Create client ONCE
    supabase = createBrowserClient(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY
    )
    
    // Single auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Only invalidate on actual auth changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        invalidate('supabase:auth')
      }
      // Token refresh doesn't need invalidation
    })
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  })
</script>
```

## 🔧 PHASE 3: Data Loading Optimization (DAY 3)

### 3.1 Fix Homepage Load Function

```typescript
// +page.server.ts - Parallel, limited queries
export async function load({ locals, url }) {
  const { user } = await locals.safeGetSession()
  
  // PARALLEL fetching - no waterfalls
  const [products, categories, featured] = await Promise.all([
    locals.supabase
      .from('products')
      .select('id, title, price, images') // Only needed columns
      .limit(20) // ALWAYS limit
      .order('created_at', { ascending: false }),
    
    locals.supabase
      .from('categories')
      .select('id, name, slug')
      .limit(10),
    
    locals.supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(5)
  ])
  
  // Stream non-critical data
  const recommendations = user 
    ? locals.supabase
        .from('products')
        .select('*')
        .limit(10)
        .then(r => r.data)
    : Promise.resolve([])
  
  return {
    products: products.data ?? [],
    categories: categories.data ?? [],
    featured: featured.data ?? [],
    recommendations // This streams, won't block render
  }
}
```

### 3.2 Component Conversion to Svelte 5

```svelte
<!-- ✅ CORRECT Svelte 5 Component -->
<script lang="ts">
  interface Props {
    product: Product;
    variant?: 'card' | 'list';
  }
  
  let { product, variant = 'card' }: Props = $props();
  
  // Use $state for reactive values
  let isFavorited = $state(false);
  
  // Use $derived for computed values
  const displayPrice = $derived(
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(product.price)
  );
  
  // Proper event handler
  function handleFavorite() {
    isFavorited = !isFavorited;
  }
</script>

<!-- Use onclick, not on:click -->
<button onclick={handleFavorite}>
  {isFavorited ? '❤️' : '🤍'}
</button>
```

## 🔧 PHASE 4: State Management Cleanup (DAY 4)

### 4.1 Global State Pattern

```typescript
// lib/stores/auth.svelte.ts - Svelte 5 global state
let user = $state(null);
let session = $state(null);

export function getAuthStore() {
  return {
    get user() { return user },
    get session() { return session },
    setUser: (u) => { user = u },
    setSession: (s) => { session = s },
    clear: () => {
      user = null;
      session = null;
    }
  }
}
```

### 4.2 Remove Duplicate Effects

```svelte
<!-- ❌ WRONG: Multiple effects updating same thing -->
<script>
  $effect(() => {
    if (user) loadFavorites();
  });
  
  $effect(() => {
    if (session) loadFavorites(); // Duplicate!
  });
</script>

<!-- ✅ RIGHT: Single source of truth -->
<script>
  $effect(() => {
    if (user?.id) {
      loadFavorites(user.id);
    }
  });
</script>
```

## 🔧 PHASE 5: Performance & Bundle (DAY 5)

### 5.1 Static Environment Variables

```typescript
// ❌ SLOW: Dynamic imports
import { env } from '$env/dynamic/public'

// ✅ FAST: Static imports (tree-shakeable)
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
```

### 5.2 Code Splitting

```svelte
<!-- Heavy component lazy loading -->
<script>
  let QuickView = $state(null);
  
  async function openQuickView() {
    if (!QuickView) {
      const module = await import('./ProductQuickView.svelte');
      QuickView = module.default;
    }
    // Show modal
  }
</script>

{#if QuickView}
  <QuickView product={selected} />
{/if}
```

## 📊 VERIFICATION GATES

After EACH phase, verify:

```bash
# 1. Type checking passes
pnpm check-types

# 2. No infinite loops
# Open browser DevTools Network tab
# Should see NO repeating requests

# 3. Auth works
# - Can log in
# - Can log out  
# - Session persists on refresh

# 4. Data loads
# - Homepage shows products
# - Categories display
# - No console errors

# 5. Performance check
# Open DevTools Lighthouse
# Mobile score should improve or maintain
```

## 🚨 ROLLBACK PROCEDURE

If ANYTHING breaks:

```bash
# 1. Immediate rollback
git reset --hard HEAD~1

# 2. Or checkout backup
git checkout backup/pre-refactor-[date]

# 3. Push to revert prod if deployed
git push --force origin main

# 4. Document what broke
echo "Failed at: [PHASE], Issue: [DESCRIPTION]" >> REFACTOR_ISSUES.md
```

## 📈 SUCCESS METRICS

Track after each phase:

| Metric | Baseline | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|--------|----------|---------|---------|---------|---------|---------|
| Infinite fetch | YES | NO | NO | NO | NO | NO |
| TypeScript errors | X | X | X-10 | X-20 | 0 | 0 |
| Build time (s) | X | X | X | X-5 | X-10 | X-15 |
| Bundle size (KB) | X | X | X | X | X-50 | X-100 |
| LCP mobile (ms) | X | X | X | X-200 | X-400 | <2000 |
| Auth works | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Products load | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 🎯 FINAL CHECKLIST

Before considering complete:

- [ ] No infinite fetching loops
- [ ] 0 TypeScript errors
- [ ] All tests pass
- [ ] Auth flow works (login/logout/persist)
- [ ] Homepage loads in <2s on mobile
- [ ] No Supabase clients in load returns
- [ ] Single auth listener
- [ ] Parallel data fetching
- [ ] All components use Svelte 5 syntax
- [ ] Bundle size reduced
- [ ] Service worker deduplicated
- [ ] Rate limiting on actions
- [ ] No console errors in production

## 🔄 INCREMENTAL APPROACH

**IMPORTANT:** Do NOT attempt all phases at once!

1. **Fix critical issue first** (infinite fetch)
2. **Test thoroughly** after each change
3. **Commit working code** frequently  
4. **Document issues** as you find them
5. **Ask for help** if stuck more than 30 mins

Remember: **Working code > Perfect code**

---

*Last Updated: August 2025*
*Based on: Svelte 5, SvelteKit 2, Supabase SSR official documentation*