# 🚀 PHASE 4: Sitemap Restructuring & i18n URL Architecture

**Date**: 2025-01-22  
**Status**: SUPERSEDED - Use PHASE_4_REVISED.md instead!

> **⚠️ THIS FILE IS OUTDATED**
> 
> User had a brilliant insight: Instead of incremental cleanup (guessing what to keep),
> we should build the perfect structure FIRST, then NUKE everything else.
>
> **USE THIS FILE INSTEAD: `PHASE_4_REVISED.md`**
>
> The revised approach:
> 1. Phase 4A: Build perfect structure (IDEAL_STRUCTURE.md)
> 2. Phase 4B: Generate whitelist + mass delete everything else
> 
> This is WAY more efficient than incremental cleanup across phases.

---

## Original Approach (For Reference Only)

> **💡 TIP FOR USER**: Send this entire prompt to a **NEW CHAT/TASK** with GitHub Copilot.
> Starting fresh ensures no context contamination from previous phases and gives you maximum token budget.
> Just copy this whole file and paste it in a new chat with the message: "Execute Phase 4 following this prompt exactly. Use Svelte MCP for guidance."

---

## Quick Context

- ✅ **Phase 1 COMPLETE** - @repo/core is framework-agnostic (0 SvelteKit imports)
- ✅ **Phase 2 COMPLETE** - Route colocation applied, 84% reduction in lib/components clutter
- ✅ **Phase 3 COMPLETE** - Package architecture organized, zero violations
- 🎯 **Phase 4 NOW** - Restructure routes to match IDEAL_STRUCTURE.md + Fix i18n URL routing

---

## 🔴 CRITICAL ISSUE: i18n URL Structure

### Current State (BROKEN):
```
Production URLs look like: https://driplo.xyz/?locale=bg
Dev URLs look like: http://localhost:5173/?locale=bg
```

### Expected State (CORRECT):
```
https://driplo.xyz/bg     ← Bulgarian content (default)
https://driplo.xyz/en     ← English content
https://driplo.xyz        ← Should detect browser locale and redirect OR default to /bg
```

### Why This Matters:
1. **SEO**: Search engines treat query params differently than path segments
2. **UX**: Users expect path-based locales (`/en/about` not `/?locale=en&page=about`)
3. **Standards**: Industry standard is path-based routing (like `/en`, `/fr`, `/de`)
4. **Accessibility**: Screen readers announce path changes, not query param changes

### Root Cause:
Your `hooks.ts` reroute hook **strips** locale prefixes but the app still uses query params somewhere. This creates a disconnect.

---

## Mission: Fix i18n Routing + Restructure Routes

Apply **SvelteKit 2 + Paraglide best practices** for:
1. Path-based locale routing (`/bg`, `/en`)
2. Route structure matching IDEAL_STRUCTURE.md
3. Clean up dead code and bloat
4. Validate final structure

---

## Step-by-Step Plan (Estimated: 6-8 hours)

### Step 1: Audit Current i18n Setup (45 minutes)

**Goal**: Understand how locale is currently determined and where query params come from.

#### Commands:
```powershell
# Check current Paraglide setup
Get-Content packages/i18n/package.json | Select-String -Pattern "paraglide"
Get-Content packages/i18n/project.inlang/settings.json
ls packages/i18n/paraglide/

# Check how locale is set in the app
grep -r "locale=" apps/web/src/ --include="*.svelte" --include="*.ts"
grep -r "setLanguageTag" apps/web/src/
grep -r "switchLanguage" apps/web/src/

# Check URL construction
grep -r "window.location.search" apps/web/src/
grep -r "URLSearchParams" apps/web/src/
grep -r '?locale' apps/web/src/
```

#### Questions to Answer:
- [ ] Where does `?locale=bg` query param come from? (Find the source)
- [ ] Does `switchLanguage()` in language-switcher.ts use query params?
- [ ] Is Paraglide configured for path-based or query-param routing?
- [ ] Does the language switcher component add `?locale=` to links?
- [ ] Are there any cookie-based locale persistence mechanisms?

---

### Step 2: Configure Path-Based Paraglide Routing (2 hours)

**Goal**: Switch from query params to path-based locale routing.

#### SvelteKit + Paraglide Best Practice:

According to the Svelte MCP documentation fetched above, Paraglide integration with SvelteKit requires:

1. **Route Structure**: Use optional locale params `[[lang]]` in route paths
2. **Reroute Hook**: Map localized paths to canonical routes  
3. **Handle Hook**: Set locale context from path
4. **Client Navigation**: Update all navigation to include locale prefix

#### Implementation:

##### A. Update Route Structure (Option 1 - Recommended):
```
apps/web/src/routes/
├── [[lang]]/              ← Optional locale segment (defaults to 'bg')
│   ├── (auth)/            ← Auth layout group
│   │   ├── login/
│   │   └── +layout.svelte
│   ├── (app)/             ← App layout group
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── +layout.svelte
│   ├── category/
│   │   └── [...segments]/
│   ├── product/
│   │   └── [id]/
│   ├── api/               ← API routes (no i18n needed)
│   ├── +layout.svelte     ← Root layout
│   ├── +layout.ts         ← Extract locale from params
│   ├── +page.svelte       ← Homepage
│   └── +error.svelte
├── +layout.svelte         ← OUTER root layout (optional)
└── +error.svelte          ← OUTER error page
```

**OR** (Option 2 - More Explicit):
```
apps/web/src/routes/
├── (i18n)/                ← Group for i18n routes
│   ├── [lang]/            ← Required locale segment
│   │   ├── (auth)/
│   │   ├── (app)/
│   │   ├── category/
│   │   ├── product/
│   │   ├── +layout.svelte
│   │   ├── +layout.ts
│   │   ├── +page.svelte
│   │   └── +error.svelte
│   └── +layout.svelte     ← i18n root layout
├── api/                   ← API routes outside i18n
└── +layout.svelte         ← Outer root layout
```

##### B. Update `hooks.ts` (Universal):
```typescript
/// file: apps/web/src/hooks.ts
import type { Reroute } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';

/**
 * Reroute hook for path-based i18n
 * Maps: /en/about -> /[[lang]]/about with lang='en'
 * Maps: /bg/about -> /[[lang]]/about with lang='bg'
 * Maps: /about -> /[[lang]]/about with lang='bg' (default)
 */
export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;
  
  // Match locale prefix: /en, /bg, etc.
  const match = pathname.match(/^\/(en|bg)(\/.*)?$/);
  
  if (match) {
    const locale = match[1];
    const rest = match[2] || '/';
    // Return path with [[lang]] param
    return `/${locale}${rest}`;
  }
  
  // No locale prefix = default to Bulgarian
  return `/bg${pathname}`;
};

export const transport = {};
```

##### C. Update `hooks.server.ts`:
```typescript
/// file: apps/web/src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';

export const handle: Handle = async ({ event, resolve }) => {
  // Extract locale from URL params (set by reroute)
  const lang = event.params.lang || 'bg'; // Default to Bulgarian
  
  // Validate locale
  if (!i18n.isLocale(lang)) {
    // Invalid locale, redirect to default
    return new Response(null, {
      status: 302,
      headers: { Location: '/bg' + event.url.pathname }
    });
  }
  
  // Set locale for Paraglide
  i18n.setLanguageTag(lang);
  
  // Store in locals for server load functions
  event.locals.locale = lang;
  
  // Set lang attribute in HTML
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('%lang%', lang);
    }
  });
  
  return response;
};
```

##### D. Update `apps/web/src/app.html`:
```html
<!DOCTYPE html>
<html lang="%lang%">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

##### E. Update Language Switcher:
```typescript
/// file: apps/web/src/lib/utils/language-switcher.ts
import * as i18n from '@repo/i18n';
import { goto } from '$app/navigation';

export function switchLanguage(newLocale: i18n.Locale) {
  const currentPath = window.location.pathname;
  
  // Strip current locale prefix if exists
  const pathWithoutLocale = currentPath.replace(/^\/(en|bg)/, '') || '/';
  
  // Navigate to new locale path
  goto(`/${newLocale}${pathWithoutLocale}`, { replaceState: false });
}

export function initializeLanguage() {
  // Language is now determined by URL path, not query params
  // This function can be simplified or removed
  const path = window.location.pathname;
  const match = path.match(/^\/(en|bg)/);
  const locale = match ? match[1] : 'bg';
  
  if (i18n.isLocale(locale)) {
    i18n.setLanguageTag(locale);
  }
}
```

##### F. Update All Internal Links:
```svelte
<!-- BEFORE (relative links) -->
<a href="/about">About</a>
<a href="/category/fashion">Fashion</a>

<!-- AFTER (use $page.params.lang or helper) -->
<script>
  import { page } from '$app/state';
  const lang = $page.params.lang || 'bg';
</script>

<a href="/{lang}/about">About</a>
<a href="/{lang}/category/fashion">Fashion</a>

<!-- OR create a helper -->
<script>
  import { localePath } from '$lib/utils/i18n';
</script>
<a href={localePath('/about')}>About</a>
```

**Helper Implementation**:
```typescript
/// file: apps/web/src/lib/utils/i18n.ts
import { page } from '$app/state';

export function localePath(path: string): string {
  const lang = page.params?.lang || 'bg';
  return `/${lang}${path}`;
}
```

##### G. Update Root Layout:
```svelte
<!--- file: apps/web/src/routes/[[lang]]/+layout.svelte --->
<script lang="ts">
  import { setLanguageTag } from '@repo/i18n';
  import { page } from '$app/state';
  
  // Ensure client-side language tag matches URL
  $effect(() => {
    const lang = $page.params.lang || 'bg';
    setLanguageTag(lang);
  });
  
  let { data, children } = $props();
</script>

{@render children()}
```

```typescript
/// file: apps/web/src/routes/[[lang]]/+layout.ts
import type { LayoutLoad } from './$types';
import * as i18n from '@repo/i18n';

export const load: LayoutLoad = ({ params }) => {
  const lang = params.lang || 'bg';
  
  // Validate and set language
  if (i18n.isLocale(lang)) {
    i18n.setLanguageTag(lang);
  }
  
  return {
    locale: lang
  };
};
```

#### Testing:
```powershell
# After implementation, test these URLs:
# http://localhost:5173/bg        ← Bulgarian homepage
# http://localhost:5173/en        ← English homepage
# http://localhost:5173           ← Should redirect to /bg
# http://localhost:5173/bg/about  ← Bulgarian about page
# http://localhost:5173/en/about  ← English about page
```

---

### Step 3: Restructure Routes to Match IDEAL_STRUCTURE.md (2 hours)

**Goal**: Move remaining non-colocated components and match ideal structure.

#### Commands:
```powershell
# Check what's still in lib/components
ls -R apps/web/src/lib/components/

# Find all route-specific components that aren't colocated
# (these should move to their route directories)
grep -r "from '\$lib/components/" apps/web/src/routes/ | Select-String -Pattern "(?!layout|forms|ui)"

# Check for dead components (0 imports)
$components = Get-ChildItem -Path apps/web/src/lib/components/ -Recurse -Filter "*.svelte"
foreach ($comp in $components) {
  $name = $comp.BaseName
  $count = (grep -r "import.*$name" apps/web/src/ --include="*.svelte" --include="*.ts" | Measure-Object).Count
  if ($count -eq 0) {
    Write-Host "Dead component: $($comp.FullName)"
  }
}
```

#### Actions:
- [ ] Move route-specific components from `lib/components/` to their routes
- [ ] Keep only shared components in `lib/components/`:
  - `layout/` - Header, Footer, Nav
  - `forms/` - Generic form components
  - `ui/` - Generic UI (if not in @repo/ui)
- [ ] Delete dead components (after confirming zero imports)
- [ ] Verify layout groups match IDEAL_STRUCTURE.md:
  - `(auth)/` - login, register, forgot-password
  - `(app)/` - dashboard, profile, settings
  - Public routes outside groups

#### Expected Final Structure:
```
apps/web/src/
├── lib/
│   ├── server/                 # Server-only code
│   │   ├── auth/               # Auth services
│   │   ├── db/                 # Database clients
│   │   └── utils/              # Server utils
│   ├── components/             # SHARED components only
│   │   ├── layout/             # Header, Footer, Nav
│   │   ├── forms/              # Generic forms
│   │   └── ui/                 # Generic UI
│   ├── stores/                 # Svelte stores
│   ├── utils/                  # Client utils
│   └── types/                  # Shared types
├── params/                     # Route matchers
├── routes/
│   ├── [[lang]]/               # Locale-aware routes
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.server.ts
│   │   │   │   └── LoginForm.svelte    # COLOCATED
│   │   │   └── +layout.svelte
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── DashboardWidget.svelte  # COLOCATED
│   │   │   ├── profile/
│   │   │   └── +layout.svelte
│   │   ├── category/
│   │   │   └── [...segments]/
│   │   │       ├── +page.svelte
│   │   │       ├── +page.server.ts
│   │   │       └── CategoryGrid.svelte     # COLOCATED
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       ├── +page.svelte
│   │   │       ├── +page.server.ts
│   │   │       └── ProductDetails.svelte   # COLOCATED
│   │   ├── +layout.svelte
│   │   ├── +layout.ts
│   │   ├── +page.svelte
│   │   └── +error.svelte
│   └── api/                    # API routes (no i18n)
├── app.html
├── error.html
├── hooks.client.ts
├── hooks.server.ts
└── hooks.ts
```

---

### Step 4: Remove Dead Code & Bloat (1 hour)

**Goal**: Clean up after restructuring is complete.

#### Commands:
```powershell
# Find unused imports
pnpm exec depcheck apps/web

# Find unused components
# (Run this after Step 3 moves are complete)
Get-ChildItem -Path apps/web/src/lib/components/ -Recurse -Filter "*.svelte" | ForEach-Object {
  $name = $_.BaseName
  $imports = (grep -r "import.*$name" apps/web/src/ --include="*.svelte" --include="*.ts").Count
  if ($imports -eq 0) {
    Write-Host "Unused: $($_.FullName)"
  }
}

# Find unused utility files
Get-ChildItem -Path apps/web/src/lib/utils/ -Recurse -Filter "*.ts" | ForEach-Object {
  $name = $_.BaseName
  $imports = (grep -r "from.*$name" apps/web/src/ --include="*.svelte" --include="*.ts").Count
  if ($imports -eq 0) {
    Write-Host "Unused: $($_.FullName)"
  }
}
```

#### Checklist:
- [ ] Delete unused components (confirmed 0 imports)
- [ ] Delete unused utility files (confirmed 0 imports)
- [ ] Remove commented-out code from all files
- [ ] Remove unused dependencies from package.json
- [ ] Delete any `.old`, `.backup`, `.bak` files
- [ ] Verify no TODOs or FIXMEs remain

---

### Step 5: Final Validation & Testing (1 hour)

**Goal**: Ensure everything works correctly.

#### Build & Type Check:
```powershell
# Clean build all packages
pnpm turbo clean
pnpm install

# Build all packages
pnpm turbo build

# Type check
pnpm turbo check-types

# Lint
pnpm turbo lint

# Test
pnpm turbo test
```

#### Manual Testing:
- [ ] Navigate to `http://localhost:5173` → should redirect to `/bg`
- [ ] Navigate to `/bg` → Bulgarian content
- [ ] Navigate to `/en` → English content
- [ ] Switch language using language switcher → URL changes
- [ ] Navigate between pages → URLs maintain locale prefix
- [ ] Check SEO: `<html lang="bg">` on Bulgarian pages, `<html lang="en">` on English
- [ ] Check hreflang tags in `<head>` for each language
- [ ] Test all major routes: category pages, product pages, auth pages

#### Production Validation:
```powershell
# Build for production
pnpm turbo build

# Preview production build
cd apps/web
pnpm preview

# Test production URLs
# http://localhost:4173/bg
# http://localhost:4173/en
```

---

## Expected Outcomes

### ✅ Success Criteria:

1. **i18n Routing Fixed**:
   - URLs are path-based: `/bg/about`, `/en/about`
   - No query params: NO `?locale=bg`
   - Language switcher updates URL path
   - `<html lang="...">` matches current locale

2. **Route Structure Matches IDEAL_STRUCTURE.md**:
   - Route colocation in place (components with their routes)
   - Shared components only in `lib/components/`
   - Layout groups organized: `(auth)/`, `(app)/`
   - No dead/unused components

3. **Zero Errors**:
   - All packages build successfully
   - Zero TypeScript errors
   - Zero ESLint errors
   - All tests pass

4. **Production Ready**:
   - SEO-friendly URLs
   - Proper hreflang tags
   - Fast navigation (no unnecessary rerenders)
   - Locale persists across navigation

---

## Rollback Plan

If issues arise, you can rollback using Git:

```powershell
# Stash current changes
git stash save "WIP: Phase 4 i18n routing"

# Return to Phase 3 complete state
git checkout main  # or your stable branch

# If you committed Phase 4 work
git revert HEAD~1  # revert last commit
```

---

## Documentation Updates

After Phase 4 completion, update:

- [ ] `packages/README.md` - Add i18n routing architecture
- [ ] `apps/web/README.md` - Document route structure
- [ ] `docs/REFACTOR_PLAN.md` - Mark Phase 4 complete
- [ ] Create `docs/I18N_ARCHITECTURE.md` - Document i18n setup

---

## Important: What Phase 4 Does NOT Include

**Phase 4 is FRONTEND ONLY** - focused on structure and client-side i18n routing.

### Out of Scope (Reserved for Phase 5+):
- ❌ Backend/Supabase schema changes
- ❌ Multi-region data filtering (UK products only for UK users)
- ❌ Geolocation detection & region switching
- ❌ Database queries for region-specific content
- ❌ Supabase MCP integration

### Why?
**Clean house first, then build features.** You can't design proper backend architecture when the frontend structure is messy and full of bloat. Phase 4 creates a clean foundation, then Phase 5 builds the multi-region system on top.

---

## Next Phase Preview: Phase 5 - Multi-Region & Global Backend

After Phase 4, we'll tackle the **BIG FEATURE**:

### Phase 5: Global Multi-Region System (8-12 hours)

**Goal**: Make Driplo globally available with region-based content filtering.

#### Features:
1. **Geolocation Detection**
   - Detect user's country (UK, Bulgaria, etc.)
   - Show modal: "We noticed you're from the UK. Switch to Driplo UK?"
   - Persist region choice in cookie/localStorage

2. **Region-Based Data Filtering**
   - UK users see only UK products/listings
   - Bulgarian users see only BG products/listings
   - Database queries filtered by region

3. **Supabase Multi-Region Architecture**
   - Use Supabase MCP to audit current schema
   - Add `region` column to products/listings tables
   - Create RLS policies for region filtering
   - Optimize queries for region-based access

4. **Edge Routing (Vercel)**
   - Route users to nearest edge location
   - CDN optimization per region
   - Fast page loads globally

5. **Region Switcher UI**
   - Modal component for region selection
   - Header indicator showing current region
   - Persist region across sessions

#### Tech Stack:
- Supabase MCP for schema management
- Vercel Edge Config for region routing
- Geolocation API (or Vercel headers)
- Supabase RLS for data filtering

**This is a MAJOR feature and deserves its own dedicated phase after structure cleanup.**

---

## Phase 6+ Preview

After Phase 5, we'll tackle:
- Performance optimization (lazy loading, code splitting)
- SEO improvements (metadata, sitemaps, schema.org)
- Analytics integration (privacy-friendly)
- Error tracking (Sentry)
- Monitoring & observability
- A/B testing infrastructure

---

## Questions & Answers

### Q: "Will executing this workflow fix the locale issue?"
**A**: YES! The core issue is query params vs path-based routing. Step 2 switches to path-based routing following SvelteKit + Paraglide best practices.

### Q: "Shouldn't it just say driplo.xyz/bg instead of ?locale=bg?"
**A**: CORRECT! Path-based routing (`/bg`, `/en`) is the industry standard and what this phase implements.

### Q: "Will we be able to clean up all the other bloat?"
**A**: YES! Step 4 specifically targets dead code removal. After route restructuring is complete and the structure matches IDEAL_STRUCTURE.md, Step 4 will:
- Delete unused components (verified 0 imports)
- Remove unused utilities
- Clean up dependencies
- Remove commented code

### Q: "Once the structure is done, everything else must be deleted, right?"
**A**: CORRECT! The principle is: If it's not in IDEAL_STRUCTURE.md and not being used (verified by grep/depcheck), DELETE IT. No exceptions. This keeps the codebase lean and maintainable.

---

## Svelte MCP Insights

From the official Svelte/SvelteKit documentation via MCP:

### Path-Based i18n Pattern:
1. Use `[[lang]]` optional params for default locale support
2. `reroute` hook maps localized paths to canonical routes
3. `handle` hook sets locale from URL params
4. All links include locale prefix
5. Language switcher updates URL path (not query params)

### Layout Groups:
- Use `(groupName)` for shared layouts without URL changes
- Example: `(auth)/`, `(app)/`, `(marketing)/`
- Allows different layout hierarchies

### Route Colocation:
- Components used by one route live WITH that route
- Shared components go in `$lib/components/`
- Reduces cognitive load, improves maintainability

---

## Timeline Estimate

| Task | Duration | Dependencies |
|------|----------|--------------|
| Step 1: i18n Audit | 45 min | None |
| Step 2: Fix i18n Routing | 2 hours | Step 1 |
| Step 3: Route Restructure | 2 hours | Step 2 |
| Step 4: Dead Code Removal | 1 hour | Step 3 |
| Step 5: Validation | 1 hour | Step 4 |
| **TOTAL** | **6h 45min** | Sequential |

Add 1-2 hours buffer for unexpected issues = **8 hours total**

---

## Ready to Execute?

Run through the checklist:

- [ ] Phase 1 complete (framework-agnostic @repo/core)
- [ ] Phase 2 complete (route colocation)
- [ ] Phase 3 complete (package organization)
- [ ] Git commit current state (clean working tree)
- [ ] All packages building successfully
- [ ] Svelte MCP available for guidance

**If all checked, proceed with Step 1! 🚀**
