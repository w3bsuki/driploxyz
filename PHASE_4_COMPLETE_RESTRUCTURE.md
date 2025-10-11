# PHASE 4: COMPLETE MONOREPO RESTRUCTURE

## OBJECTIVE
Restructure the ENTIRE monorepo (all packages + all apps) to match `IDEAL_STRUCTURE.md`. This is NOT just an i18n routing fix - this is a comprehensive reorganization of ALL code in the codebase to align with SvelteKit 2 best practices and optimal Turborepo architecture.

## SCOPE
- ✅ ALL 7 packages (ui, core, domain, database, i18n, testing, eslint-config, typescript-config)
- ✅ ALL 3 apps (web, admin, docs)
- ✅ Move UI components to correct locations
- ✅ Move hooks to correct packages/locations
- ✅ Organize server code in `$lib/server/`
- ✅ Route colocation with layout groups
- ✅ Fix ALL imports across the entire codebase
- ✅ Then: Whitelist + Nuclear cleanup (delete 6,222 lines of bloat)

## STRATEGY
This is the "BUILD PERFECT STRUCTURE FIRST, THEN NUKE BLOAT" approach:

1. **Build perfect structure** according to IDEAL_STRUCTURE.md
2. **Move every file** to its correct location
3. **Update all imports** across the monorepo
4. **Generate whitelist** of correct files
5. **Nuclear cleanup** - delete everything NOT in whitelist

---

## PART A: PACKAGES RESTRUCTURE

### 1. packages/ui - Complete UI Library Restructure

#### Current problems:
- 174 components scattered across lib/
- Types in wrong locations
- Utils not properly organized
- Server-only code not in $lib/server/
- Barrel files creating bloat

#### Target structure (from IDEAL_STRUCTURE.md):
```
packages/ui/
├── src/
│   ├── lib/
│   │   ├── primitives/        # Base components (Button, Input, etc.)
│   │   ├── compositions/       # Composite components
│   │   ├── layouts/            # Layout components
│   │   ├── server/             # ⚠️ Server-only utilities
│   │   └── utils/              # Client-safe utilities
│   ├── styles/                 # Global styles
│   └── types/                  # ⚠️ Root-level types only
├── package.json
└── tsconfig.json
```

#### Actions:
1. **Audit all 174 components** - categorize as primitives/compositions/layouts
2. **Move components** to correct categories:
   ```powershell
   # Example structure
   lib/primitives/button/
   ├── Button.svelte
   ├── types.ts
   └── index.ts           # NO barrel exports, just re-export Button
   
   lib/compositions/search-bar/
   ├── SearchBar.svelte
   ├── SearchBarInput.svelte
   ├── types.ts
   └── index.ts
   ```

3. **Move server-only utilities** to `$lib/server/`:
   - Any code that accesses env vars
   - Any code that does server-side validation
   - Any code that shouldn't run in browser

4. **Eliminate barrel files**:
   - Remove `lib/utils/index.ts` if it just re-exports
   - Keep only specific exports in index files

5. **Fix type locations**:
   - Component-specific types → stay with component
   - Shared types → `src/types/` (root level)
   - Database types → import from `@repo/database`

6. **Update package.json exports**:
   ```json
   {
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "svelte": "./dist/index.js"
       },
       "./primitives/*": {
         "types": "./dist/lib/primitives/*/index.d.ts",
         "svelte": "./dist/lib/primitives/*/index.js"
       },
       "./compositions/*": {
         "types": "./dist/lib/compositions/*/index.d.ts",
         "svelte": "./dist/lib/compositions/*/index.js"
       },
       "./utils": {
         "types": "./dist/lib/utils/index.d.ts",
         "default": "./dist/lib/utils/index.js"
       },
       "./styles/*": "./dist/styles/*"
     }
   }
   ```

### 2. packages/core - Framework-Agnostic Core

#### Current state:
- Already Phase 1 complete (framework-agnostic)
- Should be stable

#### Actions:
1. **Verify structure**:
   ```
   packages/core/
   ├── src/
   │   ├── utils/         # Pure functions only
   │   ├── validation/    # Zod schemas
   │   └── types/         # TypeScript types
   ├── package.json
   └── tsconfig.json
   ```

2. **Audit imports** - ensure NO framework-specific code:
   - ❌ No `$app/*` imports
   - ❌ No Svelte imports
   - ❌ No SvelteKit imports
   - ✅ Only: TypeScript, Zod, pure JS

3. **Fix exports in package.json** if needed:
   ```json
   {
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "default": "./dist/index.js"
       },
       "./utils": {
         "types": "./dist/utils/index.d.ts",
         "default": "./dist/utils/index.js"
       },
       "./validation": {
         "types": "./dist/validation/index.d.ts",
         "default": "./dist/validation/index.js"
       }
     }
   }
   ```

### 3. packages/domain - Business Logic

#### Current state:
- Phase 3 complete (package organization)
- Verify no contamination from core

#### Target structure:
```
packages/domain/
├── src/
│   ├── cart/              # Cart domain logic
│   ├── products/          # Product domain logic
│   ├── auth/              # Auth domain logic (business rules only)
│   ├── orders/            # Order domain logic
│   └── types/             # Domain-specific types
├── package.json
└── tsconfig.json
```

#### Actions:
1. **Audit domain boundaries** - ensure proper separation
2. **Move domain types** from ui/types to domain/types
3. **Fix exports**:
   ```json
   {
     "exports": {
       "./cart": {
         "types": "./dist/cart/index.d.ts",
         "default": "./dist/cart/index.js"
       },
       "./products": {
         "types": "./dist/products/index.d.ts",
         "default": "./dist/products/index.js"
       }
     }
   }
   ```

### 4. packages/database - Database Layer

#### Actions:
1. **Verify structure**:
   ```
   packages/database/
   ├── src/
   │   ├── types.ts       # Generated Supabase types
   │   └── index.ts       # Re-export types
   ├── package.json
   └── tsconfig.json
   ```

2. **No changes needed** if already just exporting types

### 5. packages/i18n - Internationalization

#### Current state:
- Paraglide setup
- Messages in messages/

#### Actions:
1. **Verify structure**:
   ```
   packages/i18n/
   ├── messages/
   │   ├── en.json
   │   ├── de.json
   │   └── fr.json
   ├── lib/
   │   └── runtime.ts     # Runtime code
   ├── package.json
   └── README.md
   ```

2. **NO routing logic here** - routing belongs in apps/web

### 6. packages/testing, eslint-config, typescript-config

#### Actions:
1. **Verify minimal structure** - these should be simple config packages
2. **No major changes** unless configs are outdated

---

## PART B: APPS RESTRUCTURE

### 1. apps/web - Main SvelteKit App

#### Current problems (based on IDEAL_STRUCTURE.md violations):
- Routes not properly colocated
- Server code not in $lib/server/
- Components mixed with routes
- Hooks not organized
- Types scattered

#### Target structure (SvelteKit 2 best practices):
```
apps/web/
├── src/
│   ├── lib/
│   │   ├── server/                    # ⚠️ Server-only code
│   │   │   ├── auth/                  # Auth utilities (server)
│   │   │   ├── database/              # DB queries (server)
│   │   │   ├── email/                 # Email sending (server)
│   │   │   └── api/                   # API utilities (server)
│   │   ├── components/                # Shared app components
│   │   │   ├── layout/               # Header, Footer, Nav
│   │   │   └── shared/               # Shared within app
│   │   ├── stores/                    # Client stores
│   │   ├── utils/                     # Client-safe utilities
│   │   └── config/                    # App configuration
│   │
│   ├── routes/                        # ⚠️ Route colocation
│   │   ├── (app)/                     # Layout group: authenticated
│   │   │   ├── (shop)/               # Layout group: shop pages
│   │   │   │   ├── search/
│   │   │   │   │   ├── +page.svelte
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   └── components/   # Route-specific components
│   │   │   │   │       └── SearchFilters.svelte
│   │   │   │   ├── products/
│   │   │   │   │   ├── [slug]/
│   │   │   │   │   │   ├── +page.svelte
│   │   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   │   └── components/
│   │   │   │   │   │       ├── ProductGallery.svelte
│   │   │   │   │   │       └── ProductDetails.svelte
│   │   │   │   │   └── +layout.svelte
│   │   │   │   ├── cart/
│   │   │   │   │   ├── +page.svelte
│   │   │   │   │   ├── +page.server.ts
│   │   │   │   │   └── components/
│   │   │   │   │       └── CartItem.svelte
│   │   │   │   └── +layout.svelte
│   │   │   │
│   │   │   ├── (account)/            # Layout group: account pages
│   │   │   │   ├── profile/
│   │   │   │   ├── orders/
│   │   │   │   └── +layout.svelte
│   │   │   │
│   │   │   └── +layout.svelte        # Main app layout
│   │   │
│   │   ├── (auth)/                    # Layout group: auth pages
│   │   │   ├── login/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.server.ts
│   │   │   ├── signup/
│   │   │   └── +layout.svelte
│   │   │
│   │   ├── (marketing)/               # Layout group: public pages
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── +layout.svelte
│   │   │
│   │   ├── api/                       # API routes
│   │   │   └── products/
│   │   │       └── +server.ts
│   │   │
│   │   ├── +layout.svelte             # Root layout
│   │   ├── +layout.server.ts
│   │   ├── +page.svelte               # Homepage
│   │   └── +error.svelte
│   │
│   ├── params/                        # Param matchers
│   ├── app.html
│   ├── app.css
│   ├── hooks.client.ts
│   ├── hooks.server.ts
│   └── service-worker.ts
│
├── static/                            # Static assets
├── tests/                             # E2E tests
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

#### Critical Actions:

##### 1. **Organize routes with layout groups**
```powershell
# Move routes to layout groups
Move-Item -Path "src/routes/search/*" -Destination "src/routes/(app)/(shop)/search/"
Move-Item -Path "src/routes/products/*" -Destination "src/routes/(app)/(shop)/products/"
Move-Item -Path "src/routes/cart/*" -Destination "src/routes/(app)/(shop)/cart/"
Move-Item -Path "src/routes/profile/*" -Destination "src/routes/(app)/(account)/profile/"
Move-Item -Path "src/routes/login/*" -Destination "src/routes/(auth)/login/"
Move-Item -Path "src/routes/signup/*" -Destination "src/routes/(auth)/signup/"
```

##### 2. **Colocate route-specific components**
```powershell
# Example: Move search page components
New-Item -Path "src/routes/(app)/(shop)/search/components" -ItemType Directory
Move-Item -Path "src/lib/components/search/SearchFilters.svelte" -Destination "src/routes/(app)/(shop)/search/components/"

# Do this for ALL route-specific components
```

##### 3. **Move server code to $lib/server/**
```powershell
# Move auth utilities
New-Item -Path "src/lib/server/auth" -ItemType Directory
Move-Item -Path "src/lib/auth/*.server.ts" -Destination "src/lib/server/auth/"

# Move database queries
New-Item -Path "src/lib/server/database" -ItemType Directory
Move-Item -Path "src/lib/database/queries/*.server.ts" -Destination "src/lib/server/database/"

# Move email utilities
New-Item -Path "src/lib/server/email" -ItemType Directory
Move-Item -Path "src/lib/email/*.server.ts" -Destination "src/lib/server/email/"
```

##### 4. **Reorganize $lib/ structure**
```powershell
# Keep only shared app components in lib/components/
Move-Item -Path "src/lib/components/layout/*" -Destination "src/lib/components/layout/"  # Header, Footer, Nav
Move-Item -Path "src/lib/components/shared/*" -Destination "src/lib/components/shared/"  # Truly shared

# Remove route-specific components (already moved)
```

##### 5. **Update imports across the app**
```typescript
// ❌ Old (before restructure)
import SearchFilters from '$lib/components/search/SearchFilters.svelte';

// ✅ New (after restructure)
import SearchFilters from './components/SearchFilters.svelte';  // Route colocation

// ❌ Old (server code)
import { getUser } from '$lib/auth/user';

// ✅ New (server code)
import { getUser } from '$lib/server/auth/user';
```

##### 6. **Fix i18n routing integration**
Instead of complex routing logic, use SvelteKit's `handle` hook:

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '@repo/i18n';

export const handle = sequence(
  i18n.handle(),  // Paraglide's handle hook
  async ({ event, resolve }) => {
    // Your custom logic
    return resolve(event);
  }
);
```

And in routes, use layout groups for locale-aware routing:
```
src/routes/
├── [[lang]]/              # Optional lang parameter
│   ├── (app)/
│   │   └── search/
│   └── +layout.svelte     # Load locale here
```

### 2. apps/admin - Admin Dashboard

#### Target structure (similar to web):
```
apps/admin/
├── src/
│   ├── lib/
│   │   ├── server/              # Admin server utilities
│   │   ├── components/          # Admin-specific components
│   │   └── utils/
│   ├── routes/
│   │   ├── (dashboard)/         # Layout group
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── +layout.svelte
│   │   └── +layout.svelte
│   ├── app.html
│   └── hooks.server.ts
├── package.json
└── svelte.config.js
```

#### Actions:
1. **Apply same patterns as apps/web**
2. **Use layout groups** for dashboard organization
3. **Move server code** to `$lib/server/`

### 3. apps/docs - Documentation Site

#### Actions:
1. **Verify structure** (if docs app exists)
2. **Apply same patterns** if applicable

---

## PART C: GLOBAL IMPORT FIXES

After moving files, update ALL imports across the monorepo:

### 1. Search and replace patterns:

```powershell
# Find all imports that need updating
Get-ChildItem -Recurse -Include *.ts,*.svelte,*.js | Select-String "from '\$lib/" | Group-Object Path

# Update package imports
# Old: import { Button } from '@repo/ui';
# New: import { Button } from '@repo/ui/primitives/button';

# Update server imports
# Old: from '$lib/auth/user'
# New: from '$lib/server/auth/user'

# Update route component imports
# Old: from '$lib/components/search/SearchFilters.svelte'
# New: from './components/SearchFilters.svelte'  # Route colocation
```

### 2. TypeScript errors audit:
```powershell
# Check for type errors after moves
cd k:/driplo-turbo-1
pnpm run check
```

### 3. Fix all broken imports:
- Use VSCode's "Find in Files" to locate old import paths
- Update systematically by package/app
- Test after each major group of changes

---

## PART D: WHITELIST + NUCLEAR CLEANUP

After perfect structure is built and all imports fixed:

### 1. Generate whitelist of correct files:

```powershell
# Create whitelist script
# whitelist-generator.ps1
$correctFiles = @()

# Add all files in correct locations
$correctFiles += Get-ChildItem -Recurse -Path "packages/ui/src/lib/primitives" -File
$correctFiles += Get-ChildItem -Recurse -Path "packages/ui/src/lib/compositions" -File
$correctFiles += Get-ChildItem -Recurse -Path "packages/ui/src/lib/layouts" -File
$correctFiles += Get-ChildItem -Recurse -Path "packages/ui/src/lib/server" -File
$correctFiles += Get-ChildItem -Recurse -Path "packages/core/src" -File
$correctFiles += Get-ChildItem -Recurse -Path "packages/domain/src" -File
$correctFiles += Get-ChildItem -Recurse -Path "apps/web/src/lib/server" -File
$correctFiles += Get-ChildItem -Recurse -Path "apps/web/src/routes" -File
# ... continue for all correct locations

# Save whitelist
$correctFiles | ForEach-Object { $_.FullName } | Out-File "whitelist.txt"
```

### 2. Find bloat (everything NOT in whitelist):

```powershell
# Find all source files
$allFiles = Get-ChildItem -Recurse -Path "apps","packages" -Include *.ts,*.svelte,*.js -Exclude node_modules,dist,.svelte-kit

# Load whitelist
$whitelist = Get-Content "whitelist.txt"

# Find files NOT in whitelist
$bloat = $allFiles | Where-Object { $whitelist -notcontains $_.FullName }

# Save bloat list for review
$bloat | ForEach-Object { $_.FullName } | Out-File "bloat-to-delete.txt"

Write-Host "Found $($bloat.Count) bloat files to delete"
```

### 3. Nuclear cleanup (AFTER BACKUP):

```powershell
# BACKUP FIRST!!!
Copy-Item -Path "k:/driplo-turbo-1" -Destination "k:/driplo-turbo-1-backup" -Recurse

# Review bloat list
Get-Content "bloat-to-delete.txt"

# If confident, delete bloat
$bloatFiles = Get-Content "bloat-to-delete.txt"
foreach ($file in $bloatFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted: $file"
    }
}

# Remove empty directories
Get-ChildItem -Recurse -Directory | Where-Object { (Get-ChildItem $_.FullName).Count -eq 0 } | Remove-Item -Force
```

### 4. Verify cleanup:

```powershell
# Test build
pnpm run build

# Test type checking
pnpm run check

# Run tests
pnpm run test

# If all pass, commit:
git add -A
git commit -m "Phase 4: Complete monorepo restructure + nuclear cleanup"
```

---

## PART E: VERIFICATION CHECKLIST

After restructure + cleanup, verify:

### 1. Structure verification:
- [ ] All packages match IDEAL_STRUCTURE.md
- [ ] All apps match IDEAL_STRUCTURE.md
- [ ] Server-only code in `$lib/server/` or `.server.ts` files
- [ ] Routes use layout groups properly
- [ ] Components colocated with routes when route-specific
- [ ] Shared components in `$lib/components/`
- [ ] No barrel files (or minimal)

### 2. Import verification:
- [ ] All imports resolve correctly
- [ ] No broken `@repo/*` imports
- [ ] No broken `$lib/*` imports
- [ ] No broken relative imports
- [ ] TypeScript compiles without errors

### 3. Functionality verification:
- [ ] `pnpm run dev` works for all apps
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run check` passes
- [ ] `pnpm run test` passes
- [ ] All routes accessible
- [ ] All features working

### 4. Dependency verification:
- [ ] Dependency graph follows rules from IDEAL_STRUCTURE.md:
  ```
  apps/web → packages/ui → packages/core
  apps/web → packages/domain → packages/core
  apps/web → packages/i18n
  apps/web → packages/database
  ```
- [ ] No circular dependencies
- [ ] No forbidden imports (e.g., core importing from ui)

### 5. Bloat verification:
- [ ] PROJECT_SITEMAP.md reduced from 6,222 lines to ~1,000-2,000 lines
- [ ] No duplicate code
- [ ] No unused files
- [ ] No orphaned components
- [ ] Clean and minimal structure

---

## EXECUTION PLAN

### Time estimate: 20-30 hours

### Phase breakdown:

1. **Part A: Packages (8-10 hours)**
   - packages/ui restructure: 4-5 hours
   - packages/core audit: 1 hour
   - packages/domain audit: 2 hours
   - Other packages: 1-2 hours

2. **Part B: Apps (8-12 hours)**
   - apps/web layout groups: 2 hours
   - apps/web route colocation: 3-4 hours
   - apps/web server code moves: 2-3 hours
   - apps/admin restructure: 1-2 hours

3. **Part C: Import fixes (3-5 hours)**
   - Search and replace: 1-2 hours
   - Manual fixes: 2-3 hours

4. **Part D: Cleanup (2-3 hours)**
   - Whitelist generation: 30 min
   - Bloat identification: 30 min
   - Nuclear cleanup: 1 hour
   - Verification: 30 min - 1 hour

5. **Part E: Final verification (1-2 hours)**
   - Build/test: 30 min
   - Manual testing: 30 min - 1 hour
   - Documentation: 30 min

---

## SUCCESS CRITERIA

✅ **Complete restructure** when:
1. ALL packages match IDEAL_STRUCTURE.md
2. ALL apps match IDEAL_STRUCTURE.md
3. ALL imports resolve correctly
4. All builds pass
5. All tests pass
6. PROJECT_SITEMAP.md reduced by 70%+ (from 6,222 to ~1,500-2,000 lines)
7. Clean, minimal, maintainable structure
8. No circular dependencies
9. No forbidden imports
10. Documentation updated

---

## NOTES

- This is a COMPREHENSIVE restructure, not an incremental fix
- Follow SvelteKit 2 + Svelte 5 best practices throughout
- Use Svelte MCP for guidance on any SvelteKit-specific patterns
- Backup before nuclear cleanup
- Test frequently during restructure
- Commit after each major section (Part A, B, C, D, E)
- This sets up the codebase for Phase 5 (multi-region backend)

---

## REFERENCE DOCUMENTS
- `IDEAL_STRUCTURE.md` - Target structure specification
- SvelteKit 2 docs - Routing, layout groups, $lib/server
- Turborepo docs - Package dependencies
- `docs/PROJECT_SITEMAP.md` - Current bloat inventory (6,222 lines)
