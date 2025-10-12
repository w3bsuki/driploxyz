# GitHub Copilot Chat Agent - Translation & Optimization Implementation

**Mission:** Fix translation system, optimize Paraglide v2, refactor architecture  
**Agent Type:** GitHub Copilot Chat (VS Code with **Supabase MCP + Svelte MCP + Context7 MCP**)  
**Workspace:** `K:\driplo-turbo-1`  
**Duration:** ~12-18 hours  
**Coordination:** Working in parallel with GitHub Copilot CLI (manual testing)

---

## 🎯 YOUR OBJECTIVE

**PRIMARY GOAL:**  
Fix broken translations, optimize Paraglide v2 for code splitting, refactor package architecture.

**YOUR RESPONSIBILITIES (You have MCP access!):**
- ✅ Translation system fixes (audit hardcoded strings → create keys → update components)
- ✅ Paraglide v2 optimization (locale-based code splitting, tree-shaking)
- ✅ Business logic migration (packages/ui → apps/web)
- ✅ Package export definitions
- ✅ Type definition updates
- ✅ Architecture improvements with Svelte MCP guidance

**CLI AGENT RESPONSIBILITIES (Also has MCP access now!):**
- ✅ Root directory cleanup (move docs/scripts)
- ✅ Script consolidation/deletion
- ✅ Manual browser testing
- ✅ TypeScript validation
- ✅ Database verification with Supabase MCP

---

## 🔧 MCP TOOLS AVAILABLE

### Supabase MCP
- `mcp_supabase_list_projects` — Get Supabase project ID
- `mcp_supabase_apply_migration` — Apply schema migrations
- `mcp_supabase_execute_sql` — Run SQL queries
- `mcp_supabase_list_tables` — Verify schema

### Svelte MCP
- `mcp_svelte_list-sections` — Find relevant docs
- `mcp_svelte_get-documentation` — SvelteKit best practices
- `mcp_svelte_svelte-autofixer` — Validate Svelte code

### Context7 MCP
- `mcp_context7_resolve-library-id` — Find library docs
- `mcp_context7_get-library-docs` — Paraglide, Turborepo patterns

---

## 📋 IMPLEMENTATION TASKS

### **Phase 1: Translation System Audit & Fixes (6-8 hours) 🔴 CRITICAL**

#### Task 1.1: Audit Hardcoded Strings in UI Package
**Goal:** Find ALL hardcoded English strings

**Use Svelte MCP:**
```typescript
// Get Svelte 5 component best practices
mcp_svelte_get-documentation({
  section: ["$props", "svelte/overview", "basic-markup"]
})
```

**Steps:**
1. Search for hardcoded strings:
   ```typescript
   grep_search({
     query: "Premium|Coming Soon|Verified|Pro Account|Brand Account",
     isRegexp: true,
     includePattern: "packages/ui/**/*.svelte"
   })
   ```

2. Identify files with hardcoded strings:
   - `packages/ui/src/lib/primitives/badge/ProBadge.svelte`
   - `packages/ui/src/lib/primitives/badge/PremiumBadge.svelte`
   - `packages/ui/src/lib/primitives/badge/BrandBadge.svelte`
   - `packages/ui/src/lib/compositions/product/ProductReviews.svelte`
   - `apps/web/src/routes/(protected)/settings/+page.svelte`

**Expected Output:**
```
✅ List of 15-20 hardcoded strings found
✅ Files identified for update
✅ Svelte 5 props pattern understood
```

---

#### Task 1.2: Create Translation Keys
**Goal:** Add missing keys to translation files

**Steps:**
1. Read existing translations:
   ```typescript
   read_file({
     filePath: "k:\\driplo-turbo-1\\packages\\i18n\\messages\\en.json",
     startLine: 1,
     endLine: 50
   })
   ```

2. Add new keys to `packages/i18n/messages/en.json`:
   ```json
   {
     "badge_premium": "Premium",
     "badge_pro": "Pro",
     "badge_brand": "Brand",
     "badge_verified": "Verified",
     "badge_coming_soon": "Coming Soon",
     "tooltip_pro_account": "Pro Account - Verified seller with premium features",
     "tooltip_brand_account": "Brand Account - Verified business or designer brand",
     "settings_premium_tier": "Premium Tier",
     "settings_coming_soon": "Coming Soon"
   }
   ```

3. Add Bulgarian translations to `packages/i18n/messages/bg.json`:
   ```json
   {
     "badge_premium": "Премиум",
     "badge_pro": "Про",
     "badge_brand": "Марка",
     "badge_verified": "Проверен",
     "badge_coming_soon": "Скоро",
     "tooltip_pro_account": "Про акаунт - Проверен продавач с премиум функции",
     "tooltip_brand_account": "Марка - Проверен бизнес или дизайнерска марка",
     "settings_premium_tier": "Премиум ниво",
     "settings_coming_soon": "Скоро"
   }
   ```

4. Regenerate Paraglide messages:
   ```powershell
   cd packages/i18n
   pnpm build
   ```

**Expected Output:**
```
✅ 10+ new translation keys added
✅ English translations complete
✅ Bulgarian translations complete
✅ Paraglide regenerated successfully
```

---

#### Task 1.3: Update Badge Components to Accept Translation Props
**Goal:** Make badges translatable

**Use Svelte MCP for validation:**
```typescript
// After each component update:
mcp_svelte_svelte-autofixer({
  code: "[component code]",
  desired_svelte_version: 5,
  filename: "ProBadge.svelte"
})
```

**Example - ProBadge.svelte:**

**Before:**
```svelte
<script>
  let { size = 'md', tooltipText = 'Pro Account - Verified seller with premium features' } = $props();
</script>
```

**After:**
```svelte
<script>
  import * as m from '$lib/paraglide/messages';
  
  let {
    size = 'md',
    tooltipText = m.tooltip_pro_account()
  } = $props();
</script>
```

**Steps:**
1. Update `packages/ui/src/lib/primitives/badge/ProBadge.svelte`
2. Update `packages/ui/src/lib/primitives/badge/PremiumBadge.svelte`
3. Update `packages/ui/src/lib/primitives/badge/BrandBadge.svelte`
4. Validate each with `mcp_svelte_svelte-autofixer`

**Expected Output:**
```
✅ 3 badge components updated
✅ All components validated with Svelte autofixer
✅ Props accept translation overrides
```

**ANNOUNCE TO CLI:**
> "🔄 Badge components updated - ready for browser testing"

---

#### Task 1.4: Update App-Level Components
**Goal:** Pass translations to UI components

**Example - Settings page:**

**Before:**
```svelte
badge: 'Premium'  // ❌ HARDCODED
badge: 'Coming Soon'  // ❌ HARDCODED
```

**After:**
```svelte
<script>
  import * as m from '$lib/paraglide/messages';
</script>

{#if item.badge}
  <span>{m.badge_premium()}</span>
{/if}
```

**Steps:**
1. Update `apps/web/src/routes/(protected)/settings/+page.svelte`
2. Update other app pages with hardcoded badges
3. Test with TypeScript check

**Expected Output:**
```
✅ Settings page updated
✅ All app components using translations
✅ No TypeScript errors
```

---

### **Phase 2: Paraglide v2 Optimization (8-10 hours) 🔴 CRITICAL**

#### Task 2.1: Research Paraglide v2 Code Splitting
**Goal:** Understand best practices for locale-based splitting

**Use Context7 MCP:**
```typescript
mcp_context7_resolve-library-id({ libraryName: "inlang paraglide" })
// Then:
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "[found library ID]",
  topic: "code splitting tree-shaking locale optimization bundle size",
  tokens: 15000
})
```

**Use Svelte MCP:**
```typescript
mcp_svelte_get-documentation({
  section: ["kit/performance", "kit/page-options", "kit/building-your-app"]
})
```

**Expected Output:**
```
✅ Paraglide code splitting strategies documented
✅ SvelteKit performance patterns understood
✅ Bundle optimization techniques noted
```

---

#### Task 2.2: Configure Locale-Based Code Splitting
**Goal:** Split bundles by locale (en vs bg)

**Update `packages/i18n/src/paraglide/runtime.js`:**

Research needed - Paraglide v2 supports:
1. Message-modules strategy (already used)
2. Dynamic imports per route
3. Locale-specific chunks

**Steps:**
1. Review Paraglide docs from Context7 MCP
2. Implement recommended splitting strategy
3. Update vite.config.ts if needed
4. Test bundle output

**Expected Changes:**
- Separate chunks for English vs Bulgarian
- Lazy loading of message modules
- Tree-shaking unused translations

**Expected Output:**
```
✅ Locale-based splitting configured
✅ Separate en.js and bg.js chunks
✅ Dynamic imports working
```

---

#### Task 2.3: Implement Region Detection
**Goal:** Detect UK vs BG region for smart loading

**Create `apps/web/src/lib/server/region-detection.ts`:**

```typescript
import type { RequestEvent } from '@sveltejs/kit';

export type Region = 'uk' | 'bg';

export function detectRegion(event: RequestEvent): Region {
  // Priority 1: Cookie override
  const cookieRegion = event.cookies.get('region-override');
  if (cookieRegion === 'uk' || cookieRegion === 'bg') {
    return cookieRegion;
  }

  // Priority 2: User preference (if authenticated)
  const user = event.locals.user;
  if (user?.preferred_region) {
    return user.preferred_region as Region;
  }

  // Priority 3: Vercel geolocation
  const countryCode = event.request.headers.get('x-vercel-ip-country');
  if (countryCode === 'BG') {
    return 'bg';
  }

  // Priority 4: Locale fallback
  const locale = event.locals.locale;
  if (locale === 'bg') {
    return 'bg';
  }

  return 'uk'; // Default
}
```

**Use Svelte MCP to validate:**
```typescript
mcp_svelte_get-documentation({
  section: ["kit/hooks", "kit/load"]
})
```

**Expected Output:**
```
✅ Region detection service created
✅ Validated against SvelteKit best practices
✅ Type-safe implementation
```

---

#### Task 2.4: Integrate Region Middleware
**Goal:** Add region to event.locals

**Update `apps/web/src/lib/server/hooks.ts`:**

```typescript
import { detectRegion } from './region-detection';

const regionHandler: Handle = async ({ event, resolve }) => {
  event.locals.region = detectRegion(event);
  return resolve(event);
};

export const handle: Handle = sequence(
  debugBypassHandler,
  i18nHandler,
  localeRedirectHandler,
  authHandler,
  csrfGuard,
  regionHandler, // ← ADD THIS
  countryHandler,
  authGuardHandler
);
```

**Update `apps/web/src/app.d.ts`:**

```typescript
declare global {
  namespace App {
    interface Locals {
      locale: 'en' | 'bg';
      region: 'uk' | 'bg'; // ← ADD THIS
      user?: {
        id: string;
        email: string;
        preferred_region?: 'uk' | 'bg';
      };
    }
  }
}
```

**Expected Output:**
```
✅ Region middleware integrated
✅ Type definitions updated
✅ Region available in event.locals
```

**ANNOUNCE TO CLI:**
> "🔄 Region detection implemented - ready for cookie testing"

**WAIT FOR CLI:**
> CLI will test with region-override cookies

---

#### Task 2.5: Verify Bundle Size Reduction
**Goal:** Measure improvement

**Steps:**
1. Build production:
   ```powershell
   cd apps/web
   pnpm build
   ```

2. Analyze bundle:
   ```powershell
   # Check .next/analyze or build output
   ```

3. Compare before/after:
   - Before: ~XXX KB
   - After: ~YYY KB (should be 50% smaller)

**Expected Output:**
```
✅ Bundle size reduced by 50%+
✅ Separate locale chunks confirmed
✅ Tree-shaking working
```

---

### **Phase 3: Business Logic Migration (4-6 hours) 🟡**

#### Task 3.1: Wait for CLI to Create Directory
**Goal:** Coordinate file move

**WAIT FOR CLI:**
> "🔄 Business components directory ready - Chat can move files"

---

#### Task 3.2: Move Business Components
**Goal:** Relocate files from packages/ui to apps/web

**Steps:**
1. Move `SocialLinksEditor.svelte`:
   ```typescript
   // From: packages/ui/src/lib/compositions/business/SocialLinksEditor.svelte
   // To: apps/web/src/lib/components/business/SocialLinksEditor.svelte
   ```

2. Move `PayoutMethodSelector.svelte`:
   ```typescript
   // From: packages/ui/src/lib/compositions/business/PayoutMethodSelector.svelte
   // To: apps/web/src/lib/components/business/PayoutMethodSelector.svelte
   ```

**Use `grep_search` to find all imports:**
```typescript
grep_search({
  query: "SocialLinksEditor|PayoutMethodSelector",
  isRegexp: true,
  includePattern: "apps/web/**/*.svelte"
})
```

**Expected Output:**
```
✅ 2 components moved
✅ List of 5-10 files with imports to update
```

---

#### Task 3.3: Update All Imports
**Goal:** Fix broken import paths

**Example Update:**

**Before:**
```svelte
import SocialLinksEditor from '@repo/ui/compositions/business/SocialLinksEditor.svelte';
```

**After:**
```svelte
import SocialLinksEditor from '$lib/components/business/SocialLinksEditor.svelte';
```

**Steps:**
1. Use `replace_string_in_file` for each importing file
2. Update ALL imports found in Task 3.2
3. Run TypeScript check

**Expected Output:**
```
✅ All imports updated (5-10 files)
✅ No TypeScript errors
✅ No Svelte errors
```

**ANNOUNCE TO CLI:**
> "🔄 Business components migrated - ready for testing"

---

### **Phase 4: Package Export Definitions (2-3 hours) 🟡**

#### Task 4.1: Define UI Package Exports
**Goal:** Create clean import API

**Use Context7 MCP for Turborepo patterns:**
```typescript
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/vercel/turborepo",
  topic: "package exports internal packages clean imports",
  tokens: 10000
})
```

**Update `packages/ui/package.json`:**

**Add exports field:**
```json
{
  "name": "@repo/ui",
  "exports": {
    "./button": {
      "types": "./src/lib/primitives/button/Button.svelte.d.ts",
      "svelte": "./src/lib/primitives/button/Button.svelte"
    },
    "./input": {
      "types": "./src/lib/primitives/input/Input.svelte.d.ts",
      "svelte": "./src/lib/primitives/input/Input.svelte"
    },
    "./select": {
      "types": "./src/lib/primitives/select/Select.svelte.d.ts",
      "svelte": "./src/lib/primitives/select/Select.svelte"
    },
    "./avatar": {
      "types": "./src/lib/primitives/avatar/Avatar.svelte.d.ts",
      "svelte": "./src/lib/primitives/avatar/Avatar.svelte"
    }
    // Add all primitives...
  }
}
```

**Expected Output:**
```
✅ Exports field defined for 20+ primitives
✅ Type definitions included
✅ Svelte condition specified
```

**ANNOUNCE TO CLI:**
> "🔄 UI package exports defined - ready for import path updates"

---

#### Task 4.2: Update App Imports to Use Clean Paths
**Goal:** Modernize import syntax

**Example Update:**

**Before:**
```svelte
import Button from '@repo/ui/src/lib/primitives/button/Button.svelte';
```

**After:**
```svelte
import Button from '@repo/ui/button';
```

**Steps:**
1. Find all UI imports:
   ```typescript
   grep_search({
     query: "@repo/ui/src/lib/primitives",
     isRegexp: false,
     includePattern: "apps/web/**/*.svelte"
   })
   ```

2. Update each import with `replace_string_in_file`
3. Run TypeScript check

**Expected Output:**
```
✅ 50+ imports updated to clean paths
✅ No TypeScript errors
✅ Cleaner codebase
```

**ANNOUNCE TO CLI:**
> "🔄 Import paths modernized - ready for testing"

---

### **Phase 5: Type Definition Updates (1-2 hours) 🟢**

#### Task 5.1: Generate Type Definitions
**Goal:** Ensure proper TypeScript support

**Steps:**
1. Run type generation:
   ```powershell
   cd packages/ui
   pnpm exec svelte-package --watch=false
   ```

2. Verify `.d.ts` files generated
3. Check types work in apps

**Expected Output:**
```
✅ Type definitions generated
✅ Apps have proper intellisense
✅ No type errors
```

---

#### Task 5.2: Update Package Types
**Goal:** Ensure package.json types field correct

**Update `packages/ui/package.json`:**

```json
{
  "types": "./dist/index.d.ts",
  "svelte": "./dist/index.js"
}
```

**Expected Output:**
```
✅ Types field configured
✅ Svelte field configured
✅ Package consumable by apps
```

---

## 🔄 Coordination with CLI Agent

### Communication Protocol:

**When You Announce:**
```
🔄 [What you did]
✅ [Expected CLI action]
```

**Example Announcements:**
1. **After badge updates:** "🔄 Badge components updated - ready for browser testing"
2. **After region detection:** "🔄 Region detection implemented - ready for cookie testing"
3. **After business migration:** "🔄 Business components migrated - ready for testing"
4. **After import updates:** "🔄 Import paths modernized - ready for testing"

**Wait for CLI Confirmation:**
- CLI will test in browser
- CLI will report rendering issues
- CLI will verify import paths work
- CLI will check TypeScript

---

## 📊 Success Criteria

### Phase 1 Complete When:
- ✅ Zero hardcoded strings in UI components
- ✅ 10+ new translation keys added
- ✅ Badge components accept translation props
- ✅ Bulgarian translations complete
- ✅ Components validated with Svelte autofixer

### Phase 2 Complete When:
- ✅ Locale-based code splitting configured
- ✅ Region detection middleware working
- ✅ Bundle size reduced 50%+
- ✅ UK users load only English
- ✅ BG users load only Bulgarian

### Phase 3 Complete When:
- ✅ Business components moved to apps/web
- ✅ All imports updated
- ✅ No TypeScript errors
- ✅ CLI confirms components render

### Phase 4 Complete When:
- ✅ UI package exports defined
- ✅ 50+ imports updated to clean paths
- ✅ TypeScript recognizes new imports
- ✅ CLI confirms dev server works

### Phase 5 Complete When:
- ✅ Type definitions generated
- ✅ Apps have proper intellisense
- ✅ No type errors

---

## 📝 Final Deliverable

**Create:** `CHAT_AGENT_IMPLEMENTATION_SUMMARY.md`

**Contents:**
```markdown
# Chat Agent Implementation Summary

## Translation System Fixes
- Hardcoded strings audited: 20+ found
- Translation keys added: 10+ (en + bg)
- Components updated: 3 badge components + 5 app pages
- Validation: All components passed Svelte autofixer

## Paraglide v2 Optimization
- Code splitting: Locale-based chunks implemented
- Region detection: UK vs BG detection added
- Bundle size: Reduced from XXX KB to YYY KB (50% reduction)
- Tree-shaking: Unused translations removed

## Business Logic Migration
- Components moved: 2 (SocialLinksEditor, PayoutMethodSelector)
- Imports updated: 10 files
- Architecture: Business logic now in apps/web

## Package Exports
- Exports defined: 20+ primitives
- Imports modernized: 50+ files
- Import paths: Clean `@repo/ui/button` syntax

## Type Definitions
- Type generation: ✅ Complete
- Intellisense: ✅ Working
- Type safety: ✅ No errors

## Known Issues
- [List any remaining issues]

## Next Steps
- Deploy to staging for testing
- Monitor bundle sizes in production
- Verify region detection with real traffic
```

---

**🎯 READY TO START!**

**First Step:** Use `mcp_svelte_get-documentation` to understand Svelte 5 props patterns

**Then:** Proceed through phases systematically, coordinating with CLI at each checkpoint.

**Good luck! 🚀**
