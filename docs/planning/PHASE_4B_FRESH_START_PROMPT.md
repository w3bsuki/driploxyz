# PHASE 4B EXECUTION PROMPT - DOMAIN PACKAGE RESTRUCTURE

## 🎯 YOUR TASK

Execute **Phase 4B: Domain Package Restructure** by reorganizing the `packages/domain` package to proper business logic boundaries AND fixing ALL imports systematically across the entire monorepo.

## 📋 CONTEXT

You are working in a **SvelteKit 2 + Turborepo monorepo** at `K:\driplo-turbo-1\`.

**Current state:**
- ✅ Phase 4A complete: UI package restructured (174 components organized)
- ❌ Domain package has mixed concerns and unclear boundaries
- ❌ Business logic scattered across packages
- ✅ Git repository is clean
- ✅ Dev server currently works - DON'T BREAK IT

**Critical requirement:**
When moving domain logic, you MUST fix ALL imports across the monorepo BEFORE claiming completion. Use systematic PowerShell scripts, not manual fixes.

## 📚 REQUIRED READING (in order)

1. **Read PHASE_4_COMPLETE_RESTRUCTURE.md** (lines 150-300) - Domain package requirements
2. **Read packages/domain/src/** - Current domain package structure
3. **Read PHASE_4A_FRESH_START_PROMPT.md** - Learn from successful Phase 4A execution pattern

## 🎓 LESSONS FROM PHASE 4A

**What worked:**
- ✅ Creating import mapping JSON FIRST before moving files
- ✅ Copying files to new locations (keeping old as backup)
- ✅ Using PowerShell scripts for systematic import fixes
- ✅ Testing dev server BEFORE deleting old files
- ✅ Only committing when everything works

**What to avoid:**
- ❌ Manual import fixes (error-prone, incomplete)
- ❌ Deleting old files before testing
- ❌ Claiming completion without running dev server
- ❌ Moving files without mapping their imports

## ✅ EXECUTION CHECKLIST (13 steps)

### Step 1: Audit Domain Package Structure ⏳
**Goal:** Understand current state and identify all files to reorganize.

**Actions:**
1. Read entire `packages/domain/src/` directory
2. List all files with their current locations
3. Identify business logic boundaries (cart, products, auth, orders, users, payments, etc.)
4. Check for any domain logic currently in wrong packages (ui, core, apps)

**Output:** Create `PHASE_4B_DOMAIN_AUDIT.md` with:
- Complete file inventory
- Current vs. target locations
- Business domain categories identified
- Cross-package contamination findings

### Step 2: Design Target Structure ⏳
**Goal:** Define the ideal domain package structure.

**Target structure (from IDEAL_STRUCTURE.md):**
```
packages/domain/
├── src/
│   ├── cart/                  # Cart domain
│   │   ├── services.ts       # Cart business logic
│   │   ├── validation.ts     # Cart validation rules
│   │   ├── types.ts          # Cart types
│   │   └── index.ts          # Public exports
│   ├── products/              # Product domain
│   │   ├── services.ts       # Product business logic
│   │   ├── validation.ts     # Product validation
│   │   ├── types.ts          # Product types
│   │   └── index.ts
│   ├── auth/                  # Auth domain (business rules only)
│   │   ├── services.ts
│   │   ├── validation.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── orders/                # Order domain
│   │   ├── services.ts
│   │   ├── validation.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── users/                 # User domain
│   │   ├── services.ts
│   │   ├── validation.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── payments/              # Payment domain
│   │   ├── services.ts
│   │   ├── validation.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── shared/                # Shared domain utilities
│       ├── types.ts
│       └── index.ts
├── package.json
└── tsconfig.json
```

**Design principles:**
- Each domain is self-contained
- Types stay with their domain
- Validation stays with domain logic
- Services contain business rules only
- No framework-specific code (no Svelte, no SvelteKit)
- No server-specific code (no Supabase client initialization)

### Step 3: Generate Import Mapping ⏳
**Goal:** Document EVERY file move before making changes.

**Actions:**
1. Create `phase4b-import-map.json` mapping all file moves
2. Include current path → target path for every file
3. Document which files will be created vs. moved

**Example mapping:**
```json
{
  "cart": {
    "src/cart-service.ts": "src/cart/services.ts",
    "src/cart-types.ts": "src/cart/types.ts",
    "src/cart-validation.ts": "src/cart/validation.ts"
  },
  "products": {
    "src/product-service.ts": "src/products/services.ts",
    "src/product-types.ts": "src/products/types.ts"
  },
  "new_files": [
    "src/cart/index.ts",
    "src/products/index.ts"
  ]
}
```

### Step 4: Copy Files to New Structure ⏳
**Goal:** Create new structure while keeping old files as backup.

**Actions:**
1. Create PowerShell script `copy-phase4b-files.ps1`
2. Copy all files from old locations to new locations
3. Create new index.ts files for each domain
4. DO NOT DELETE old files yet

**Example script:**
```powershell
$importMap = Get-Content "phase4b-import-map.json" | ConvertFrom-Json
$baseDir = "K:\driplo-turbo-1\packages\domain"

# Copy files for each domain
foreach ($domain in $importMap.PSObject.Properties) {
    foreach ($move in $domain.Value.PSObject.Properties) {
        $source = Join-Path $baseDir $move.Name
        $target = Join-Path $baseDir $move.Value
        
        # Create target directory
        $targetDir = Split-Path $target -Parent
        New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        
        # Copy file
        Copy-Item $source $target -Force
        Write-Host "Copied: $($move.Name) -> $($move.Value)"
    }
}
```

### Step 5: Update package.json Exports ⏳
**Goal:** Add proper exports for new domain structure.

**Actions:**
1. Update `packages/domain/package.json` exports
2. Add exports for each domain (cart, products, auth, orders, users, payments)
3. Test that exports resolve correctly

**Target exports:**
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./cart": {
      "types": "./dist/cart/index.d.ts",
      "default": "./dist/cart/index.js"
    },
    "./products": {
      "types": "./dist/products/index.d.ts",
      "default": "./dist/products/index.js"
    },
    "./auth": {
      "types": "./dist/auth/index.d.ts",
      "default": "./dist/auth/index.js"
    },
    "./orders": {
      "types": "./dist/orders/index.d.ts",
      "default": "./dist/orders/index.js"
    },
    "./users": {
      "types": "./dist/users/index.d.ts",
      "default": "./dist/users/index.js"
    },
    "./payments": {
      "types": "./dist/payments/index.d.ts",
      "default": "./dist/payments/index.js"
    },
    "./shared": {
      "types": "./dist/shared/index.d.ts",
      "default": "./dist/shared/index.js"
    }
  }
}
```

### Step 6: Create Comprehensive Import Fix Scripts ⏳
**Goal:** Fix ALL imports across the monorepo systematically.

**Actions:**
1. Create `fix-phase4b-domain-imports.ps1` - Fix relative imports within domain package
2. Create `fix-phase4b-app-imports.ps1` - Fix @repo/domain imports from apps
3. Create `fix-phase4b-package-imports.ps1` - Fix @repo/domain imports from other packages
4. Create `fix-phase4b-index.ps1` - Update main index.ts exports

**Example: fix-phase4b-domain-imports.ps1**
```powershell
# Fix relative imports within packages/domain/src/
$importMap = @{
    # Old relative imports → New relative imports
    "from '../cart-service'" = "from '../cart/services'"
    "from './cart-types'" = "from './types'"
    "from '../product-service'" = "from '../products/services'"
    "from '../auth-service'" = "from '../auth/services'"
}

Get-ChildItem -Path "K:\driplo-turbo-1\packages\domain\src" -Recurse `
    -Include "*.ts","*.js" `
    -Exclude "node_modules","dist" | 
    ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $originalContent = $content
        
        foreach ($old in $importMap.Keys) {
            $new = $importMap[$old]
            $content = $content -replace [regex]::Escape($old), $new
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $_.FullName -Value $content -NoNewline
            Write-Host "Fixed: $($_.FullName)"
        }
    }

Write-Host "`nDomain internal imports fixed!"
```

**Example: fix-phase4b-app-imports.ps1**
```powershell
# Fix @repo/domain imports in apps/
$importMap = @{
    # Old package imports → New package imports
    "from '@repo/domain'" = "from '@repo/domain/shared'"
    "from '@repo/domain/cart-service'" = "from '@repo/domain/cart'"
    "from '@repo/domain/product-service'" = "from '@repo/domain/products'"
    "from '@repo/domain/auth-service'" = "from '@repo/domain/auth'"
}

Get-ChildItem -Path "K:\driplo-turbo-1\apps" -Recurse `
    -Include "*.svelte","*.ts","*.js" `
    -Exclude "node_modules","dist",".svelte-kit","build" | 
    ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $originalContent = $content
        
        foreach ($old in $importMap.Keys) {
            $new = $importMap[$old]
            $content = $content -replace [regex]::Escape($old), $new
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $_.FullName -Value $content -NoNewline
            Write-Host "Fixed: $($_.FullName)"
        }
    }

Write-Host "`nApp imports fixed!"
```

### Step 7: Run Import Fix Scripts ⏳
**Goal:** Execute all import fix scripts across monorepo.

**Actions:**
```powershell
cd K:\driplo-turbo-1

# Fix domain internal imports
.\fix-phase4b-domain-imports.ps1

# Fix app imports
.\fix-phase4b-app-imports.ps1

# Fix other package imports
.\fix-phase4b-package-imports.ps1

# Fix main index.ts
.\fix-phase4b-index.ps1
```

**Log all changes made by each script.**

### Step 8: Fix Edge Cases ⏳
**Goal:** Handle any imports that automated scripts missed.

**Actions:**
1. Search for remaining broken imports:
```powershell
# Find any remaining old import patterns
Get-ChildItem -Path "K:\driplo-turbo-1" -Recurse `
    -Include "*.svelte","*.ts","*.js" `
    -Exclude "node_modules","dist",".svelte-kit" | 
    Select-String -Pattern "@repo/domain/(?!cart|products|auth|orders|users|payments|shared)" |
    Select-Object Path, LineNumber, Line
```

2. Manually fix any edge cases found
3. Check for circular dependencies
4. Verify no domain logic leaked into wrong packages

### Step 9: Test Domain Package Build ⏳
**Goal:** Verify domain package builds without errors.

**Actions:**
```powershell
cd K:\driplo-turbo-1\packages\domain
pnpm run build
```

**Expected:** Clean build with no errors.

### Step 10: Test Monorepo Build ⏳
**Goal:** Verify entire monorepo builds.

**Actions:**
```powershell
cd K:\driplo-turbo-1
pnpm run build
```

**Expected:** All packages build successfully (ignore pre-existing cyclic dependency warnings if they're not from your changes).

### Step 11: Test Dev Server (CRITICAL) ⏳
**Goal:** Ensure the app actually runs, not just builds.

**Actions:**
```powershell
cd K:\driplo-turbo-1
pnpm --filter @repo/web dev
```

**Expected:** 
- Dev server starts on http://localhost:5173/
- No console errors related to domain imports
- App loads successfully

**⚠️ CRITICAL: If dev server fails, DO NOT proceed. Fix issues first.**

### Step 12: Delete Old Files ⏳
**Goal:** Clean up old domain structure after successful testing.

**Actions:**
```powershell
# Only run after Step 11 passes!
cd K:\driplo-turbo-1\packages\domain\src

# Delete old files (example - adjust based on your actual structure)
Remove-Item "cart-service.ts" -Force
Remove-Item "product-service.ts" -Force
Remove-Item "auth-service.ts" -Force
# ... etc for all old files
```

**List all files deleted.**

### Step 13: Rebuild, Re-test, and Commit ⏳
**Goal:** Final verification and commit changes.

**Actions:**
1. Rebuild everything:
```powershell
cd K:\driplo-turbo-1
pnpm run build
```

2. Re-test dev server:
```powershell
pnpm --filter @repo/web dev
```

3. Commit with descriptive message:
```powershell
git add .
git commit -m "Phase 4B: Domain package restructure - Organize business logic by domain boundaries

- Restructured packages/domain into domain-driven design
- Created separate domains: cart, products, auth, orders, users, payments
- Each domain has services, validation, types, and public exports
- Fixed all @repo/domain imports across monorepo
- Updated package.json exports for new structure
- All builds passing, dev server working
- X files moved, Y imports fixed"
```

## 🚨 CRITICAL RULES

1. **NEVER delete old files until Step 11 (dev server test) passes**
2. **ALWAYS use PowerShell scripts for import fixes, NEVER manual edits**
3. **TEST dev server before claiming completion**
4. **Keep git history clean - one commit for entire phase**
5. **Document all changes in commit message**
6. **If something breaks, use git to revert and try again**

## 📊 SUCCESS CRITERIA

- ✅ Domain package organized by business boundaries
- ✅ Each domain has services, validation, types, index
- ✅ All imports fixed across monorepo (0 broken imports)
- ✅ package.json exports updated and working
- ✅ Domain package builds successfully
- ✅ Monorepo builds successfully
- ✅ Dev server runs without errors
- ✅ Old files deleted after successful testing
- ✅ Changes committed to git

## 🎯 EXPECTED OUTCOME

After Phase 4B completion:

```
packages/domain/
├── src/
│   ├── cart/
│   │   ├── services.ts
│   │   ├── validation.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── products/
│   │   ├── services.ts
│   │   ├── validation.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── auth/
│   ├── orders/
│   ├── users/
│   ├── payments/
│   └── shared/
├── package.json (with updated exports)
└── tsconfig.json
```

**All domain imports:**
```typescript
// Old (BROKEN)
import { CartService } from '@repo/domain/cart-service';
import { ProductService } from '@repo/domain/product-service';

// New (WORKING)
import { CartService } from '@repo/domain/cart';
import { ProductService } from '@repo/domain/products';
import { validateCart } from '@repo/domain/cart';
import type { Cart, CartItem } from '@repo/domain/cart';
```

## 🔥 WHEN THINGS GO WRONG

If at any step something breaks:

1. **Stop immediately**
2. **Check git status**: `git status`
3. **Review what changed**: `git diff`
4. **Revert if needed**: `git restore .`
5. **Re-read the step that failed**
6. **Fix the issue**
7. **Try again**

**Remember:** The goal is a working monorepo, not speed. Take time to do it right.

---

## 📝 NOTES FOR AGENT

- This is Phase 4B of a multi-phase monorepo restructure
- Phase 4A (UI package) is complete and working
- Follow the same pattern that worked for Phase 4A
- The user trusts you to execute this properly
- Use Svelte MCP if you need Svelte-specific guidance
- Ask for clarification if anything is unclear
- Test frequently, commit once at the end

Good luck! 🚀
