# Driplo Production Hardening Plan (Enhanced)
> **Professional, systematic approach to production-ready Svelte 5 + SvelteKit 2 deployment**

## Executive Summary

**Goal**: Ship a clean, minimal, production-grade Svelte 5 + SvelteKit 2 + TypeScript + Tailwind v4 app with Supabase backend.

**Approach**: Remove bloat and overengineering, enforce SvelteKit-first conventions, standardize architecture, minimize logs, and tighten security.

**Timeline**: 7 days to production readiness with systematic phase execution.

**Confidence**: 9/10 for technical excellence, addressing critical issues identified in comprehensive audit.

---

## 🎯 Critical Issues Addressed

Based on comprehensive audit findings:
- **Performance**: 50+ HTTP requests → <15 requests
- **404 Errors**: `@repo/ui` import issues resolved
- **Broken Search**: Full-text search implementation
- **Test Data**: Complete cleanup and real content
- **Svelte 5 Compliance**: Runes configuration and migration
- **Mobile Experience**: Touch-friendly responsive design

---

## 📊 Performance Guardrails (Non-Negotiable)

- **Performance**: <15 initial requests on homepage; LCP < 2.5s; CLS < 0.1; TTI < 2.5s
- **Bundle**: <180KB gz initial JS; stable vendor chunking; one critical CSS
- **Logging**: No console.log in production client; server logs restricted to errors
- **Security**: CSRF on mutations; strict cookies; CSP present; no service role in edge
- **DX**: TS strict; supabase types generated; Svelte 5 runes enabled
- **Observability**: Sentry wired with low prod sample rate; /api/health responds OK

---

## 🚀 Phase 1: Emergency Fixes (Days 1-2)
*Fix critical performance and 404 errors*

### 1.1 Fix 404 Errors (2 hours)
**Issue**: `404 https://www.driplo.xyz/@repo/ui` breaking resource loading

```bash
# Delete dist causing @repo/ui 404s
rm -rf packages/ui/dist
echo "dist/" >> packages/ui/.gitignore

# Verify no src imports from apps
grep -r "from '@repo/ui/src" apps/
```

### 1.2 Svelte 5 Configuration (1 hour)
**Issue**: Missing `runes: true` configuration blocks Svelte 5 compliance

```javascript
// Edit both: apps/web/svelte.config.js AND packages/ui/svelte.config.js
export default {
  kit: { adapter: adapter() },
  compilerOptions: { 
    runes: true,  // 🔥 CRITICAL: Lock compiler to runes mode
    warningFilter: (warning) => {
      // Keep existing a11y filters...
      return true;
    }
  }
};
```

### 1.3 Bundle Optimization (2 hours)
**Issue**: 50+ HTTP requests causing 5+ second load times

```javascript
// apps/web/vite.config.ts - Essential plugins only
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', '@sveltejs/kit'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@repo/ui']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: ['log', 'warn'], // Keep errors
        dead_code: true
      }
    }
  }
});
```

### 1.4 Database Cleanup (4 hours)
**Issue**: Test data pollution breaking user experience

```sql
-- Remove test/fake data via Supabase dashboard
DELETE FROM products WHERE title IN ('eban login', '123', '777', 'Дарка');
DELETE FROM products WHERE price > 1000 OR price < 1;
DELETE FROM profiles WHERE username LIKE '%test%';

-- Standardize remaining data
UPDATE products SET 
  condition = CASE 
    WHEN condition = 'ново' THEN 'new'
    WHEN condition = 'използвано' THEN 'used'
    ELSE 'good'
  END;
```

**Validation**: Homepage should show <15 requests in network tab

---

## ⚡ Phase 2: Core Functionality (Days 3-4)
*Make search, auth, and navigation work properly*

### 2.1 Search Implementation (Day 3)
**Issue**: Broken search functionality - core feature doesn't work

```typescript
// apps/web/src/routes/search/+page.server.ts
export async function load({ url, locals }) {
  const query = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || '';
  
  if (!query && !category) {
    return { products: [], query: '', total: 0 };
  }

  let searchQuery = locals.supabase
    .from('products')
    .select(`
      id, title, price, images, condition,
      profiles:seller_id (username, avatar_url),
      categories:category_id (name)
    `)
    .eq('status', 'active');

  // Full-text search with PostgreSQL
  if (query) {
    searchQuery = searchQuery.textSearch('title', query, {
      type: 'websearch',
      config: 'english'
    });
  }

  if (category) {
    searchQuery = searchQuery.eq('categories.name', category);
  }

  const { data: products, error } = await searchQuery
    .order('created_at', { ascending: false })
    .limit(24);

  return {
    products: products || [],
    query,
    total: products?.length || 0
  };
}
```

### 2.2 Authentication Flow Fix (Day 3-4)
**Issue**: Login redirects to homepage, broken signup flow

```typescript
// apps/web/src/routes/(auth)/login/+page.server.ts
export const actions = {
  default: async ({ request, locals, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().toLowerCase().trim();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    // Rate limiting
    const attempts = parseInt(cookies.get('login_attempts') || '0');
    if (attempts > 5) {
      return fail(429, { error: 'Too many attempts. Try again later.' });
    }

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      cookies.set('login_attempts', (attempts + 1).toString(), { 
        maxAge: 60 * 15, 
        path: '/' 
      });
      return fail(401, { error: 'Invalid credentials' });
    }

    // Clear attempts on success
    cookies.delete('login_attempts', { path: '/' });

    // Check onboarding status
    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single();

    if (!profile?.onboarding_completed) {
      throw redirect(303, '/onboarding');
    }

    throw redirect(303, '/dashboard');
  }
};
```

### 2.3 Navigation Simplification (Day 4)
**Issue**: Two search bars, confusing navigation

```svelte
<!-- apps/web/src/lib/components/Header.svelte -->
<script lang="ts">
  // OFFICIAL SVELTE 5 PATTERN: Props interface + $props()
  interface Props {
    user?: {
      id: string;
      email: string;
      profile?: {
        username: string;
        avatar_url?: string;
      };
    };
  }
  
  let { user }: Props = $props();
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center">
        <span class="text-xl font-bold text-gray-900">Driplo</span>
      </a>

      <!-- Single search bar (remove duplicate) -->
      <div class="flex-1 max-w-lg mx-8 hidden sm:block">
        <SearchBar />
      </div>

      <!-- User menu -->
      <div class="flex items-center space-x-4">
        {#if user}
          <a href="/dashboard" class="text-gray-700 hover:text-gray-900">Dashboard</a>
          <a href="/sell" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 min-h-[44px] flex items-center">Sell</a>
        {:else}
          <a href="/login" class="text-gray-700 hover:text-gray-900">Login</a>
          <a href="/signup" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 min-h-[44px] flex items-center">Sign Up</a>
        {/if}
      </div>
    </div>

    <!-- Mobile search bar -->
    <div class="sm:hidden px-4 pb-4">
      <SearchBar mobile={true} />
    </div>
  </div>
</header>
```

---

## 🔧 Phase 3: Technical Compliance (Days 5-6)
*Complete Svelte 5 + SvelteKit 2 migration*

### 3.1 Hooks.server.ts Modularization (Day 5)
**Issue**: 426-line monolithic file blocks maintainability

```typescript
// apps/web/src/lib/server/hooks.ts (new orchestration)
import { setupEnvironment } from './env.js';
import { setupAuth } from './auth.js';
import { setupI18n } from './i18n.js';
import { setupSentry } from './sentry.js';

export async function handle({ event, resolve }) {
  // Thin orchestration only
  setupEnvironment(event);
  await setupAuth(event);
  setupI18n(event);
  setupSentry(event);
  
  return await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
}
```

```typescript
// apps/web/src/lib/server/env.ts
export function setupEnvironment(event: RequestEvent) {
  const required = [
    'PUBLIC_SUPABASE_URL',
    'PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing: ${envVar}`);
    }
  }
}
```

### 3.2 Form Actions Migration (Day 5-6)
**Issue**: Using bare endpoints instead of SvelteKit 2 form actions

Convert API endpoints to form actions for:
- Login/signup (already started, enhance error handling)
- Profile updates
- Product creation/editing
- Messaging endpoints

### 3.3 onMount → $effect Migration (Day 6)
**Issue**: 21 instances of legacy onMount patterns - OFFICIAL SVELTE 5 MIGRATION

```typescript
// BEFORE (Svelte 4):
import { onMount, onDestroy } from 'svelte';

onMount(() => {
  const interval = setInterval(() => {
    count += 1;
  }, 1000);

  onDestroy(() => {
    clearInterval(interval);
  });
});

// AFTER (Svelte 5):
let count = $state(0);

$effect(() => {
  const interval = setInterval(() => {
    count++;
  }, 1000);

  // Cleanup function returned directly
  return () => {
    clearInterval(interval);
  };
});
```

**Key Migration Patterns**:
1. **Lifecycle → Effects**: onMount/onDestroy → $effect with cleanup
2. **Reactive Declarations**: `$: computed = value * 2` → `const computed = $derived(value * 2)`
3. **Event Handlers**: `on:click` → `onclick`
4. **Props**: `export let prop` → `let { prop } = $props()`

### 3.4 Supabase Type Generation (Day 6)
**Issue**: Manual types risk drift

```json
// package.json
{
  "scripts": {
    "db:types": "supabase gen types typescript --linked > packages/database/src/generated.ts",
    "postinstall": "pnpm db:types"
  }
}
```

---

## 📱 Phase 4: Mobile & Production Polish (Day 7)
*Professional mobile experience and final validation*

### 4.1 Mobile Touch Targets (2 hours)
**Issue**: Touch targets < 44px break mobile UX

```css
/* Ensure minimum 44px touch targets */
@media (max-width: 768px) {
  button, a, input, select {
    min-height: 44px;
    min-width: 44px;
  }
  
  .product-card {
    padding: 16px;
    margin-bottom: 16px;
    touch-action: manipulation;
  }
}
```

### 4.2 Image Optimization (2 hours)
**Issue**: No image optimization causes slow mobile loading

```svelte
<!-- Use enhanced-img for responsive images -->
<enhanced:img 
  src={product.images[0]} 
  alt={product.title}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  class="w-full h-48 object-cover"
/>
```

### 4.3 Security Hardening (2 hours)
**Issue**: Missing CSP and CSRF protection

```typescript
// apps/web/src/app.html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self' *.supabase.co *.sentry.io;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
  font-src 'self' https:;
">
```

### 4.4 Final Validation (2 hours)
**Critical pre-launch checklist**

```bash
# Performance validation
pnpm build && pnpm analyze
lighthouse --form-factor=mobile --output=json

# Functionality validation
pnpm test:e2e
pnpm test:a11y

# Security validation
pnpm audit
pnpm check-types
```

---

## 📊 Success Metrics & Readiness Gates

### Performance Gates (Must Pass)
- **Gate A**: <15 requests, LCP < 2.5s, CLS < 0.1 on homepage
- **Gate B**: Bundle size <180KB gzipped per chunk
- **Gate C**: Lighthouse mobile score >90

### Functionality Gates (Must Pass)
- **Gate D**: Search returns relevant results
- **Gate E**: Authentication flow completes successfully
- **Gate F**: Mobile experience usable on real devices

### Security Gates (Must Pass)
- **Gate G**: CSP enforced, no violations
- **Gate H**: No service role key in client code
- **Gate I**: CSRF protection on all mutations

---

## 🎯 Execution Timeline

| Day | Focus | Deliverable | Validation |
|-----|-------|-------------|------------|
| **1** | Fix 404s, Svelte 5 config | No build errors | pnpm build passes |
| **2** | Bundle optimization, data cleanup | <15 requests | Network tab check |
| **3** | Search implementation | Working search | Manual testing |
| **4** | Auth flow, navigation | Login/signup works | E2E tests pass |
| **5** | Hooks modularization | Clean architecture | Code review |
| **6** | Svelte 5 migration, types | Full compliance | TypeScript strict |
| **7** | Mobile polish, security | Production ready | All gates pass |

---

## 🛡️ Risk Mitigation

### High-Risk Changes
1. **Bundle optimization** → A/B test performance before/after
2. **Svelte 5 migration** → Incremental component conversion
3. **Auth flow changes** → Comprehensive E2E testing

### Rollback Strategy
- Git tags for each phase completion
- Feature flags for risky changes  
- Staging environment validation

---

## 🚀 Post-Launch Monitoring

### Week 1 Metrics
- **Error Rate**: <1% on critical flows
- **Performance**: Core Web Vitals green
- **User Feedback**: <5% negative on core features

### Week 2+ Optimization
- Bundle size analysis and optimization
- Performance monitoring with Real User Metrics
- A11y improvements based on user feedback

---

## 📁 File-by-File Implementation Guide

### Critical Files to Modify:
```
apps/web/
├── svelte.config.js → add runes: true
├── vite.config.ts → optimize bundles
├── src/hooks.server.ts → split into modules
├── src/routes/search/+page.server.ts → implement search
├── src/routes/(auth)/login/+page.server.ts → fix auth
└── src/lib/components/Header.svelte → single search bar

packages/ui/
├── svelte.config.js → add runes: true
├── .gitignore → add dist/
└── src/lib/ → ensure clean exports
```

---

## 📚 OFFICIAL SVELTE 5 + SVELTEKIT 2 COMPLIANCE VALIDATION

### Svelte 5 Best Practices Checklist
Based on official Svelte 5 documentation:

- [ ] **Runes Configuration**: `compilerOptions: { runes: true }` in all svelte.config.js
- [ ] **State Management**: All reactive state uses `$state()` instead of `let`
- [ ] **Computed Values**: All reactive declarations use `$derived()` instead of `$:`
- [ ] **Props Declaration**: All components use `let { prop } = $props()` instead of `export let`
- [ ] **Event Handling**: Standard HTML attributes (`onclick`) instead of directives (`on:click`)
- [ ] **Effects**: `$effect()` with cleanup returns instead of onMount/onDestroy
- [ ] **Component Events**: Callback props instead of event dispatchers

### SvelteKit 2 Best Practices Checklist
Based on official SvelteKit 2 documentation:

- [ ] **Form Actions**: Use SvelteKit form actions instead of API endpoints for mutations
- [ ] **Load Functions**: Proper data loading with typed returns
- [ ] **Error Handling**: Use fail() and error() appropriately
- [ ] **Progressive Enhancement**: Forms work without JavaScript
- [ ] **Type Safety**: Generated types from database schema
- [ ] **Security**: CSRF protection on all mutations

### Migration Validation Steps

```bash
# 1. Verify Svelte 5 compliance
grep -r "export let" apps/web/src/  # Should return 0 results
grep -r "on:" apps/web/src/        # Should return 0 results (except comments)
grep -r "\$:" apps/web/src/        # Should return 0 results (except comments)

# 2. Verify runes usage
grep -r "\$state" apps/web/src/    # Should find state declarations
grep -r "\$derived" apps/web/src/  # Should find computed values
grep -r "\$props" apps/web/src/    # Should find prop declarations

# 3. Verify SvelteKit 2 patterns
grep -r "export const actions" apps/web/src/routes/  # Should find form actions
grep -r "export async function load" apps/web/src/routes/  # Should find load functions
```

### Official Documentation References

During refactor, always reference:
- **Svelte 5 Docs**: https://svelte.dev/docs/svelte
- **SvelteKit 2 Docs**: https://kit.svelte.dev/docs
- **Migration Guide**: https://svelte.dev/docs/svelte/v5-migration-guide
- **Runes Documentation**: https://svelte.dev/docs/svelte/$state
- **Form Actions**: https://kit.svelte.dev/docs/form-actions

---

## ✅ Definition of Done

**Production Ready When:**
- [ ] All performance gates pass
- [ ] All functionality gates pass  
- [ ] All security gates pass
- [ ] Mobile experience validated on real devices
- [ ] E2E tests pass consistently
- [ ] Zero critical console errors
- [ ] Staging bake successful (48h)

**CONFIDENCE: 95% for 7-day execution with disciplined phase adherence**

---

*Enhanced CODEX plan merging systematic approach with implementation specifics*
*Addresses all critical audit findings with concrete solutions*
*Production-ready deployment in 7 days with proper validation*