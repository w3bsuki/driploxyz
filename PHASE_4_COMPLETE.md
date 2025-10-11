# 🚀 PHASE 4: Build Perfect Structure + Nuclear Cleanup

**Date**: 2025-01-22  
**Status**: Ready to Execute  
**Duration**: 8-10 hours (complete restructure + cleanup)  
**Prerequisites**: Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅

> **💡 SEND THIS TO A NEW CHAT**
> Copy this entire file and paste in a new GitHub Copilot chat with:
> "Execute Phase 4: Build perfect structure from IDEAL_STRUCTURE.md, then nuclear cleanup. Use Svelte MCP for guidance."

---

## Mission: Two-Part Nuclear Restructure

### Part A (6-8 hours): Build Perfect Structure
- Fix i18n routing (path-based `/bg`, `/en`)
- Create structure matching IDEAL_STRUCTURE.md
- Move all needed files to new structure
- Update all imports
- **DON'T DELETE anything yet**

### Part B (2 hours): Nuclear Cleanup
- Generate whitelist (files IN new structure)
- Generate delete list (files NOT in whitelist)
- Review for false positives
- Git backup
- **MASS DELETE everything not whitelisted**

---

## Part A: Build Perfect Structure (Steps 1-6)

### Step 1: Understand IDEAL_STRUCTURE.md (30 min)

**Read and internalize the target structure:**

```
apps/web/src/
├── lib/
│   ├── server/                 # Server-only code ($lib/server alias)
│   │   ├── auth/               # Auth services (server-only)
│   │   ├── db/                 # Database clients (server-only)
│   │   └── utils/              # Server utilities
│   ├── components/             # SHARED components ONLY
│   │   ├── layout/             # Header, Footer, Nav
│   │   ├── forms/              # Form components
│   │   └── ui/                 # Generic UI (if not in @repo/ui)
│   ├── stores/                 # Svelte stores (if needed)
│   ├── utils/                  # Client utilities
│   └── types/                  # Shared TypeScript types
├── params/                     # Route parameter matchers
├── routes/
│   ├── [[lang]]/               # Optional locale segment
│   │   ├── (auth)/             # Auth layout group
│   │   │   ├── login/
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.server.ts
│   │   │   │   └── LoginForm.svelte    # COLOCATED
│   │   │   └── +layout.svelte
│   │   ├── (app)/              # App layout group
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

**Key Principles:**
1. **Route Colocation**: Components used in ONE route live WITH that route
2. **Shared Components**: Only truly shared components in `lib/components/`
3. **Layout Groups**: Use `(groupName)` for shared layouts without URL changes
4. **$lib/server**: Server-only code to prevent client leaks
5. **Path-based i18n**: `/bg/about` not `/?locale=bg`

---

### Step 2: Fix i18n Routing (2 hours)

**Problem**: URLs show `?locale=bg` instead of `/bg`

#### A. Update Route Structure:

Create the new route directory:
```powershell
# Create new locale-aware structure
New-Item -ItemType Directory -Force -Path "apps/web/src/routes/[[lang]]"
```

#### B. Update `hooks.ts`:

```typescript
/// file: apps/web/src/hooks.ts
import type { Reroute } from '@sveltejs/kit';

/**
 * Reroute hook for path-based i18n
 * Maps: /bg/about -> /[[lang]]/about with lang='bg'
 * Maps: /en/about -> /[[lang]]/about with lang='en'
 * Maps: /about -> /[[lang]]/about with lang='bg' (default)
 */
export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;
  
  // Match locale prefix: /bg or /en
  const match = pathname.match(/^\/(en|bg)(\/.*)?$/);
  
  if (match) {
    const locale = match[1];
    const rest = match[2] || '/';
    return `/${locale}${rest}`;
  }
  
  // No locale prefix = default to Bulgarian
  return `/bg${pathname}`;
};

export const transport = {};
```

#### C. Update `hooks.server.ts`:

```typescript
/// file: apps/web/src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';

export const handle: Handle = async ({ event, resolve }) => {
  // Extract locale from URL params (set by reroute)
  const lang = event.params.lang || 'bg';
  
  // Validate locale
  if (!i18n.isLocale(lang)) {
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

#### D. Update `app.html`:

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

#### E. Create Root Layout for [[lang]]:

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
  
  if (i18n.isLocale(lang)) {
    i18n.setLanguageTag(lang);
  }
  
  return {
    locale: lang
  };
};
```

#### F. Update Language Switcher:

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
```

---

### Step 3: Move Routes to New Structure (2 hours)

#### A. Identify All Current Routes:

```powershell
# List all current route directories
Get-ChildItem -Path "apps/web/src/routes" -Directory -Recurse |
  Where-Object { $_.Name -notlike "[[lang]]" } |
  Select-Object FullName
```

#### B. Move Each Route to [[lang]]/:

**For each route directory:**

```powershell
# Example: Move category routes
Move-Item -Path "apps/web/src/routes/category" -Destination "apps/web/src/routes/[[lang]]/category"

# Example: Move product routes
Move-Item -Path "apps/web/src/routes/product" -Destination "apps/web/src/routes/[[lang]]/product"

# Example: Move auth routes (if not already in group)
Move-Item -Path "apps/web/src/routes/(auth)" -Destination "apps/web/src/routes/[[lang]]/(auth)"
```

#### C. Create Layout Groups:

```powershell
# Create (auth) group if doesn't exist
New-Item -ItemType Directory -Force -Path "apps/web/src/routes/[[lang]]/(auth)"

# Create (app) group if doesn't exist
New-Item -ItemType Directory -Force -Path "apps/web/src/routes/[[lang]]/(app)"
```

#### D. Move Routes into Groups:

**Auth routes** → `[[lang]]/(auth)/`:
- login
- register
- forgot-password
- reset-password

**App routes** → `[[lang]]/(app)/`:
- dashboard
- profile
- settings
- messages
- orders

**Public routes** → `[[lang]]/` (root):
- category
- product
- search
- about
- contact

---

### Step 4: Colocate Route Components (2 hours)

**Move components FROM `lib/components/` TO their routes.**

#### A. Find Route-Specific Components:

```powershell
# Find all components in lib/components
Get-ChildItem -Path "apps/web/src/lib/components" -Recurse -Filter "*.svelte" |
  Select-Object Name, Directory
```

#### B. For Each Component, Determine if Shared or Route-Specific:

**Route-specific** = Used in only ONE route → MOVE to that route  
**Shared** = Used in MULTIPLE routes → KEEP in lib/components

```powershell
# Check usage of a component (example: ProductCard.svelte)
$componentName = "ProductCard"
Get-ChildItem -Path "apps/web/src/routes" -Recurse -Include "*.svelte","*.ts" |
  Select-String -Pattern $componentName |
  Select-Object Path
```

**If used in only ONE route:** MOVE it there
**If used in MULTIPLE routes:** KEEP in lib/components

#### C. Move Route-Specific Components:

**Example: Product components**
```powershell
# ProductCard used only in /product/[id]/+page.svelte
Move-Item -Path "apps/web/src/lib/components/product/ProductCard.svelte" `
  -Destination "apps/web/src/routes/[[lang]]/product/[id]/ProductCard.svelte"

# ProductGrid used only in /category/[...segments]/+page.svelte
Move-Item -Path "apps/web/src/lib/components/product/ProductGrid.svelte" `
  -Destination "apps/web/src/routes/[[lang]]/category/[...segments]/ProductGrid.svelte"
```

#### D. Update Imports in Route Files:

**Before:**
```svelte
<script>
  import ProductCard from '$lib/components/product/ProductCard.svelte';
</script>
```

**After:**
```svelte
<script>
  import ProductCard from './ProductCard.svelte';
</script>
```

---

### Step 5: Keep Only Shared Components in lib/ (1 hour)

#### A. Define What's Truly Shared:

**Keep in `lib/components/`:**
- `layout/` - Header, Footer, Nav (used on ALL pages)
- `forms/` - Generic form components (Input, Select, Button if not in @repo/ui)
- `ui/` - Generic UI components (Modal, Toast, etc. if not in @repo/ui)

**Everything else** should have been moved to routes in Step 4.

#### B. Verify Shared Components:

```powershell
# For each component in lib/components, verify it's used in multiple places
Get-ChildItem -Path "apps/web/src/lib/components" -Recurse -Filter "*.svelte" |
  ForEach-Object {
    $name = $_.BaseName
    $count = (Get-ChildItem -Path "apps/web/src/routes" -Recurse | 
      Select-String -Pattern $name -List).Count
    
    Write-Host "$name used in $count places"
    
    if ($count -le 1) {
      Write-Host "  ⚠️ WARNING: $name might not be shared!" -ForegroundColor Yellow
    }
  }
```

#### C. Expected lib/components/ Structure After Cleanup:

```
apps/web/src/lib/components/
├── layout/
│   ├── Header.svelte           # Used on all pages
│   ├── Footer.svelte           # Used on all pages
│   └── Nav.svelte              # Used on all pages
├── forms/
│   ├── FormField.svelte        # Used in multiple forms
│   └── FormError.svelte        # Used in multiple forms
└── ui/
    └── LoadingSpinner.svelte   # Used in multiple places
```

---

### Step 6: Update All Internal Links (1 hour)

**All links must now include locale prefix.**

#### A. Create Helper Function:

```typescript
/// file: apps/web/src/lib/utils/i18n-helpers.ts
import { page } from '$app/state';

/**
 * Generate path with current locale prefix
 */
export function localePath(path: string): string {
  const lang = page.params?.lang || 'bg';
  return `/${lang}${path}`;
}
```

#### B. Update Links to Use Helper:

**Before:**
```svelte
<a href="/category/fashion">Fashion</a>
<a href="/product/123">Product</a>
```

**After:**
```svelte
<script>
  import { localePath } from '$lib/utils/i18n-helpers';
</script>

<a href={localePath('/category/fashion')}>Fashion</a>
<a href={localePath('/product/123')}>Product</a>
```

**OR use page.params directly:**
```svelte
<script>
  import { page } from '$app/state';
  const lang = $page.params.lang || 'bg';
</script>

<a href="/{lang}/category/fashion">Fashion</a>
<a href="/{lang}/product/123">Product</a>
```

---

### Step 7: Verify Part A Complete (30 min)

#### Build & Test:

```powershell
# Clean rebuild
pnpm turbo clean
pnpm install
pnpm turbo build

# Type check
pnpm turbo check-types

# Start dev server
cd apps/web
pnpm dev
```

#### Manual Testing Checklist:

- [ ] Visit `http://localhost:5173` → redirects to `/bg`
- [ ] Visit `/bg` → Bulgarian homepage loads
- [ ] Visit `/en` → English homepage loads
- [ ] Click language switcher → URL changes to new locale
- [ ] Navigate to category page → URL maintains locale
- [ ] Navigate to product page → URL maintains locale
- [ ] All imports resolve correctly (no 404s in console)
- [ ] `<html lang="bg">` or `<html lang="en">` in source

**If all pass, Part A is COMPLETE! ✅**

---

## Part B: Nuclear Cleanup (Steps 8-13)

### Step 8: Generate Whitelist (30 min)

**Create list of ALL files in the new perfect structure.**

```powershell
# File: apps/web/generate-whitelist.ps1

# Define the new structure patterns (what we KEEP)
$keepPatterns = @(
  # Core files
  "apps/web/src/app.html",
  "apps/web/src/app.css",
  "apps/web/src/app.d.ts",
  "apps/web/src/error.html",
  "apps/web/src/hooks.ts",
  "apps/web/src/hooks.client.ts",
  "apps/web/src/hooks.server.ts",
  "apps/web/src/service-worker.ts",
  
  # lib/ - ONLY these directories
  "apps/web/src/lib/server/**/*",
  "apps/web/src/lib/components/layout/*",
  "apps/web/src/lib/components/forms/*",
  "apps/web/src/lib/components/ui/*",
  "apps/web/src/lib/stores/*",
  "apps/web/src/lib/utils/*",
  "apps/web/src/lib/types/*",
  "apps/web/src/lib/auth/*",
  
  # routes/ - NEW structure only
  "apps/web/src/routes/[[lang]]/**/*",
  "apps/web/src/routes/api/**/*",
  
  # params/
  "apps/web/src/params/*",
  
  # Config files (root of app)
  "apps/web/package.json",
  "apps/web/tsconfig.json",
  "apps/web/vite.config.ts",
  "apps/web/svelte.config.js",
  "apps/web/playwright.config.ts",
  "apps/web/vitest.config.ts"
)

# Generate whitelist
$whitelistFiles = @()
foreach ($pattern in $keepPatterns) {
  $files = Get-ChildItem -Path $pattern -File -Recurse -ErrorAction SilentlyContinue
  $whitelistFiles += $files.FullName
}

# Save whitelist
$whitelistFiles | Sort-Object | Get-Unique | Out-File "apps/web/WHITELIST.txt"

Write-Host "✅ Whitelist generated: $($whitelistFiles.Count) files"
Write-Host "📄 Saved to: apps/web/WHITELIST.txt"
```

**Run it:**
```powershell
cd K:\driplo-turbo-1
.\apps\web\generate-whitelist.ps1
```

---

### Step 9: Generate Delete List (30 min)

**Find everything NOT in the whitelist.**

```powershell
# File: apps/web/generate-delete-list.ps1

# Load whitelist
$whitelist = Get-Content "apps/web/WHITELIST.txt"

# Get ALL files in src/ and root config
$allFiles = @()
$allFiles += Get-ChildItem -Path "apps/web/src" -File -Recurse | Select-Object -ExpandProperty FullName
$allFiles += Get-ChildItem -Path "apps/web" -File -Depth 0 | Select-Object -ExpandProperty FullName

# Find files NOT in whitelist
$deleteFiles = $allFiles | Where-Object { $whitelist -notcontains $_ }

# Exclude certain files that should never be deleted
$safePatterns = @(
  "*.md",          # README, etc.
  ".gitignore",
  ".env*",
  "pnpm-lock.yaml"
)

$deleteFiles = $deleteFiles | Where-Object {
  $file = $_
  $shouldExclude = $false
  foreach ($pattern in $safePatterns) {
    if ($file -like "*$pattern") {
      $shouldExclude = $true
      break
    }
  }
  -not $shouldExclude
}

# Save delete list
$deleteFiles | Sort-Object | Out-File "apps/web/DELETE_LIST.txt"

Write-Host "⚠️  Delete list generated: $($deleteFiles.Count) files"
Write-Host "📄 Saved to: apps/web/DELETE_LIST.txt"
Write-Host ""
Write-Host "🔴 REVIEW THIS CAREFULLY before proceeding!"
```

**Run it:**
```powershell
.\apps\web\generate-delete-list.ps1
```

---

### Step 10: Review Delete List (30 min)

**CRITICAL: Manual review before deletion!**

```powershell
# Open delete list in editor
code apps/web/DELETE_LIST.txt
```

#### Review Checklist:

- [ ] Check for any **config files** that should stay (vite.config, etc.)
- [ ] Check for any **test files** that should stay
- [ ] Check for **.env** files (should not be deleted)
- [ ] Check for **generated files** (.svelte-kit, .turbo - already excluded)
- [ ] Check for any **documentation** (README.md - already excluded)

#### If You Find False Positives:

```powershell
# Add to whitelist patterns in generate-whitelist.ps1
# Example: Add "apps/web/src/lib/legacy-util.ts" if needed

# Regenerate whitelist
.\apps\web\generate-whitelist.ps1

# Regenerate delete list
.\apps\web\generate-delete-list.ps1

# Review again
code apps/web/DELETE_LIST.txt
```

**ONLY PROCEED when you're 100% confident the delete list is correct!**

---

### Step 11: Git Backup (10 min)

**CRITICAL: Backup before mass delete!**

```powershell
# Commit current state
git add .
git commit -m "Phase 4 Part A complete: Perfect structure built"

# Create backup branch
git branch backup-before-mass-delete

# Create delete branch
git checkout -b phase-4-mass-delete

Write-Host "✅ Backup created: backup-before-mass-delete"
Write-Host "✅ Working on: phase-4-mass-delete"
Write-Host ""
Write-Host "If anything goes wrong, run:"
Write-Host "  git checkout backup-before-mass-delete"
```

---

### Step 12: Nuclear Delete (10 min)

**THE BIG MOMENT: Delete everything not whitelisted.**

```powershell
# File: apps/web/execute-delete.ps1

Write-Host "🔴 FINAL WARNING: About to delete files!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel, or any key to proceed..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Load delete list
$deleteFiles = Get-Content "apps/web/DELETE_LIST.txt"

Write-Host ""
Write-Host "Deleting $($deleteFiles.Count) files..." -ForegroundColor Yellow

$deletedCount = 0
foreach ($file in $deleteFiles) {
  if (Test-Path $file) {
    Remove-Item $file -Force -Verbose
    $deletedCount++
  }
}

Write-Host ""
Write-Host "✅ Deleted $deletedCount files" -ForegroundColor Green

# Remove empty directories
Write-Host ""
Write-Host "Removing empty directories..."

Get-ChildItem -Path "apps/web/src" -Directory -Recurse |
  Sort-Object -Property FullName -Descending |
  Where-Object { (Get-ChildItem $_.FullName -File -Recurse).Count -eq 0 } |
  ForEach-Object {
    Write-Host "  Removing: $($_.FullName)"
    Remove-Item $_.FullName -Force
  }

Write-Host ""
Write-Host "🎉 NUCLEAR CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run: pnpm turbo build"
Write-Host "2. If build succeeds, commit: git commit -am 'Phase 4: Nuclear cleanup complete'"
Write-Host "3. If build fails, rollback: git checkout backup-before-mass-delete"
```

**Run it:**
```powershell
cd K:\driplo-turbo-1
.\apps\web\execute-delete.ps1
```

---

### Step 13: Verify Everything Still Works (30 min)

**CRITICAL: Ensure nothing broke!**

#### A. Clean Rebuild:

```powershell
# Clean everything
pnpm turbo clean
rm -rf node_modules
rm -rf apps/web/.svelte-kit
rm -rf apps/web/build

# Fresh install
pnpm install

# Build all packages
pnpm turbo build
```

**Expected:** ✅ All builds succeed

#### B. Type Check:

```powershell
pnpm turbo check-types
```

**Expected:** ✅ Zero TypeScript errors

#### C. Lint:

```powershell
pnpm turbo lint
```

**Expected:** ✅ Zero ESLint errors (or only warnings)

#### D. Start Dev Server:

```powershell
cd apps/web
pnpm dev
```

**Expected:** ✅ Server starts without errors

#### E. Manual Testing:

- [ ] Homepage loads (`/bg`, `/en`)
- [ ] Category pages load
- [ ] Product pages load
- [ ] Auth pages load (if you have them)
- [ ] Navigation works
- [ ] Language switching works
- [ ] No 404s in browser console
- [ ] No import errors in terminal

---

### Step 14: Celebrate & Commit (10 min)

**If everything works:**

```powershell
# Commit the victory
git add .
git commit -m "Phase 4 complete: Perfect structure + nuclear cleanup

- Built IDEAL_STRUCTURE.md layout
- Fixed i18n routing (path-based /bg, /en)
- Colocated route components
- Generated whitelist (X files)
- Deleted Y files of bloat
- Zero errors, all tests pass

Ready for Phase 5 (multi-region backend)"

# Merge to main
git checkout main
git merge phase-4-mass-delete

# Delete backup branch (optional)
git branch -d backup-before-mass-delete

Write-Host ""
Write-Host "🎉🎉🎉 PHASE 4 COMPLETE! 🎉🎉🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Your codebase is now:"
Write-Host "✅ Structured according to IDEAL_STRUCTURE.md"
Write-Host "✅ Using path-based i18n (/bg, /en)"
Write-Host "✅ Zero bloat (everything cleaned)"
Write-Host "✅ Ready for Phase 5 (multi-region backend)"
```

**If something broke:**

```powershell
# Rollback
git checkout backup-before-mass-delete

Write-Host "⚠️  Rolled back to before mass delete"
Write-Host ""
Write-Host "Debug steps:"
Write-Host "1. Check what file was deleted that shouldn't have been"
Write-Host "2. Add to whitelist in generate-whitelist.ps1"
Write-Host "3. Regenerate delete list"
Write-Host "4. Try again"
```

---

## Success Criteria

### Part A Complete:
- [ ] New structure matches IDEAL_STRUCTURE.md
- [ ] i18n routing is path-based (`/bg`, `/en`)
- [ ] Route components colocated
- [ ] Only shared components in lib/components
- [ ] All imports updated
- [ ] All builds succeed
- [ ] Manual testing passes

### Part B Complete:
- [ ] Whitelist generated (all files in new structure)
- [ ] Delete list generated (all files NOT in whitelist)
- [ ] Delete list reviewed (no false positives)
- [ ] Git backup created
- [ ] Mass delete executed
- [ ] Empty directories removed
- [ ] **All builds still succeed**
- [ ] **All manual tests still pass**

### Final Result:
```
Before Phase 4:
├── PROJECT_SITEMAP.md: 6,222 lines of stuff
├── Messy structure
├── Query param i18n (?locale=bg)
└── Bloat everywhere

After Phase 4:
├── Perfect structure (IDEAL_STRUCTURE.md)
├── Path-based i18n (/bg, /en)
├── Zero bloat (whitelisted only)
└── Ready for Phase 5
```

---

## Timeline

| Step | Duration | What |
|------|----------|------|
| **PART A: Build Perfect Structure** |
| 1. Understand IDEAL_STRUCTURE | 30 min | Read and internalize |
| 2. Fix i18n routing | 2 hours | Path-based /bg, /en |
| 3. Move routes to [[lang]] | 2 hours | New structure |
| 4. Colocate components | 2 hours | Move to routes |
| 5. Clean lib/components | 1 hour | Keep only shared |
| 6. Update links | 1 hour | Add locale prefix |
| 7. Verify Part A | 30 min | Build & test |
| **PART B: Nuclear Cleanup** |
| 8. Generate whitelist | 30 min | List all kept files |
| 9. Generate delete list | 30 min | Find bloat |
| 10. Review delete list | 30 min | Manual review |
| 11. Git backup | 10 min | Safety first |
| 12. Nuclear delete | 10 min | Mass delete |
| 13. Verify still works | 30 min | Build & test |
| 14. Celebrate | 10 min | Commit & merge |
| **TOTAL** | **10 hours** | Complete restructure |

---

## PowerShell Scripts Summary

Create these 3 scripts in `apps/web/`:

### 1. generate-whitelist.ps1
```powershell
# (Code from Step 8 above)
```

### 2. generate-delete-list.ps1
```powershell
# (Code from Step 9 above)
```

### 3. execute-delete.ps1
```powershell
# (Code from Step 12 above)
```

---

## Rollback Plan

If anything goes wrong at ANY point:

```powershell
# Return to state before mass delete
git checkout backup-before-mass-delete

# Or if you need to go further back
git log --oneline  # Find the commit before Phase 4
git checkout <commit-hash>

# Or use reflog to find any state
git reflog
git checkout HEAD@{N}
```

---

## Next Steps After Phase 4

Once Phase 4 is complete, you'll have a **perfect foundation** for:

### Phase 5: Multi-Region Backend (15 hours)
- Supabase MCP integration
- Add `region` column to tables
- Geolocation detection
- Region switcher modal
- RLS policies for data isolation

### Phase 6+: Polish & Scale
- Performance optimization
- SEO improvements
- Analytics
- Error tracking (Sentry)
- A/B testing

---

## Ready to Execute?

Checklist before starting:

- [ ] Phase 1-3 complete
- [ ] Git working tree clean
- [ ] Have read IDEAL_STRUCTURE.md
- [ ] Understand whitelist approach
- [ ] Have 10 hours available
- [ ] Coffee/tea ready ☕
- [ ] Music playlist queued 🎵

**Send this entire file to a NEW CHAT with GitHub Copilot and say:**

> "Execute Phase 4: Build perfect structure from IDEAL_STRUCTURE.md, then nuclear cleanup. Follow all steps. Use Svelte MCP for i18n guidance."

**LET'S BUILD THE PERFECT STRUCTURE! 🚀**
