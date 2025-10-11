# PHASE 4A EXECUTION PROMPT - FRESH START

## 🎯 YOUR TASK

Execute **Phase 4A: UI Package Restructure** by reorganizing all 174 components in `packages/ui` into proper structure AND fixing ALL imports systematically across the entire monorepo.

## 📋 CONTEXT

You are working in a **SvelteKit 2 + Turborepo monorepo** at `K:\driplo-turbo-1\`.

**Current state:**
- 174 UI components scattered in `packages/ui/src/lib/components/`
- Need to reorganize to: `primitives/`, `compositions/`, `layouts/`
- Git repository is clean (previous Phase 4A attempt was reverted)
- Dev server currently works - DON'T BREAK IT

**Critical requirement:**
When moving components, you MUST fix ALL imports across the monorepo BEFORE claiming completion. Use systematic PowerShell scripts, not manual fixes.

## 📚 REQUIRED READING (in order)

1. **Read PHASE_4A_COMPONENT_AUDIT.md** - Complete categorization of all 174 components with target locations
2. **Read PHASE_4A_DETAILED_PLAN.md** - Execution strategy with rollback plan
3. **Read PHASE_4_EXECUTION_PROMPT.md** (lines 1-100) - Original Phase 4A requirements
4. **Read PHASE_4_COMPLETE_RESTRUCTURE.md** (Part A only) - Target structure details

## ✅ EXECUTION CHECKLIST (13 steps)

### Step 1: Verify Audit ✅ DONE
- ✅ Component audit exists in `PHASE_4A_COMPONENT_AUDIT.md`
- ✅ Directory structure created

### Step 2: Generate Import Mapping
Create `phase4a-import-map.json` documenting EVERY file move:

```json
{
  "primitives": {
    "components/ui/Button.svelte": "primitives/button/Button.svelte",
    "components/ui/Input.svelte": "primitives/input/Input.svelte",
    "components/badges/ConditionBadge.svelte": "primitives/badge/ConditionBadge.svelte"
  },
  "compositions": {
    "components/product/ProductCard.svelte": "compositions/product/ProductCard.svelte",
    "components/business/BuyBox.svelte": "compositions/business/BuyBox.svelte"
  }
}
```

**Use PHASE_4A_COMPONENT_AUDIT.md as source of truth.**

### Step 3: Copy Components (DON'T DELETE YET)
Use PowerShell to copy all 174 files to new locations:

```powershell
# Example
Copy-Item "packages/ui/src/lib/components/ui/Button.svelte" `
          "packages/ui/src/lib/primitives/button/Button.svelte"
```

**Keep old locations intact until tests pass!**

### Step 4: Update package.json Exports
Add new exports in `packages/ui/package.json`:

```json
{
  "exports": {
    "./primitives/*": {
      "types": "./dist/lib/primitives/*/index.d.ts",
      "svelte": "./src/lib/primitives/*/index.ts",
      "default": "./dist/lib/primitives/*/index.js"
    },
    "./compositions/*": {
      "types": "./dist/lib/compositions/*/index.d.ts",
      "svelte": "./src/lib/compositions/*/index.ts",
      "default": "./dist/lib/compositions/*/index.js"
    },
    "./layouts/*": {
      "types": "./dist/lib/layouts/*.d.ts",
      "svelte": "./src/lib/layouts/*.js",
      "default": "./dist/lib/layouts/*.js"
    }
  }
}
```

### Step 5: Create Import Fix Script
Generate `fix-phase4a-imports.ps1` with ALL path mappings:

```powershell
$importMap = @{
    # Within UI package - relative imports
    "from '../badges/ConditionBadge'" = "from '../../primitives/badge/ConditionBadge'"
    "from '../ui/Button'" = "from '../../primitives/button/Button'"
    
    # $lib imports from apps
    "from '\$lib/components/ui/Button'" = "from '\$lib/primitives/button/Button'"
    
    # @repo/ui imports from apps
    "from '@repo/ui'" = "from '@repo/ui/primitives'"
    
    # Extension fixes
    "from '../../utils/runtime.js'" = "from '../../utils/runtime'"
}

Get-ChildItem -Path "K:\driplo-turbo-1" -Recurse `
    -Include "*.svelte","*.ts" `
    -Exclude "node_modules","dist",".svelte-kit" | 
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
```

**Generate complete mapping using import-map.json!**

### Step 6: Run Import Fix Script
Execute script across entire monorepo:

```powershell
cd K:\driplo-turbo-1
.\fix-phase4a-imports.ps1
```

**Log all changes made.**

### Step 7: Fix Edge Cases
Handle known issues:

1. **Missing analytics.js**: Create stub if needed
2. **Path depth issues**: Fix TopProgress, Accordion relative paths
3. **.js → .ts extensions**: Fix 13+ files that import .js when should be .ts
4. **Cross-category imports**: Use grep to find remaining broken imports

```powershell
# Find remaining broken imports
Get-ChildItem -Recurse -Filter "*.svelte" | 
    Select-String -Pattern "from '../components/|from '../ui/|from '../business/'" |
    Select-Object Path, LineNumber, Line
```

### Step 8: Test UI Package Build
```powershell
cd K:\driplo-turbo-1\packages\ui
pnpm run build
```

**Must succeed with no errors!**

### Step 9: Test Monorepo Build
```powershell
cd K:\driplo-turbo-1
pnpm run build
```

**ALL packages must build!**

### Step 10: Test Dev Server ⚠️ CRITICAL
```powershell
pnpm dev
```

**Server must start without errors. Test in browser:**
- Homepage (/)
- Search (/search)
- Product page (/products/[slug])

**Check browser console for import errors!**

### Step 11: Delete Old Locations
**ONLY IF TESTS PASS!**

```powershell
cd K:\driplo-turbo-1\packages\ui\src\lib
Remove-Item -Path "components" -Recurse -Force
```

### Step 12: Rebuild & Re-test
After deleting old locations:

```powershell
pnpm run build
pnpm dev
```

**Verify everything still works!**

### Step 13: Commit
**ONLY IF DEV SERVER WORKS!**

```powershell
git add -A
git commit -m "Phase 4A: UI package restructure with ALL imports fixed

- Moved 174 components to primitives/compositions/layouts
- Fixed ALL imports across monorepo (script-based)
- Updated package.json exports
- Verified build passes
- Tested dev server works

Categories reorganized:
- Primitives: 40 components (Button, Input, Avatar, Badge, etc.)
- Compositions: 120 components (Product, Business, Navigation, etc.)
- Layouts: 7 components (Footer, Container, Stacks)

All imports systematically updated via PowerShell script.
Tested: build ✓, check ✓, dev server ✓"
```

## ⚠️ CRITICAL SUCCESS FACTORS

1. **DON'T SKIP IMPORT MAPPING** - Document EVERY path change before moving files
2. **USE POWERSHELL SCRIPTS** - Manual fixing will miss files
3. **COPY, DON'T DELETE** - Keep old structure until tests pass
4. **TEST AFTER EACH PHASE** - Build after moving, dev server before committing
5. **FIX EXTENSIONS** - Handle .js → .ts separately
6. **CHECK DEV SERVER** - Not just build, actually load pages in browser
7. **DON'T COMMIT BROKEN STATE** - Only commit if dev server works

## 🚨 IF THINGS BREAK

### Rollback immediately:
```powershell
git reset --hard HEAD~1
```

### Debug broken imports:
```powershell
# Find all import errors
Get-ChildItem -Recurse -Filter "*.svelte" | 
    Select-String -Pattern "from '../components/|from '../ui/'" |
    Group-Object Path | 
    Select-Object Count, Name
```

## 📊 EXPECTED OUTCOME

After completion:
- ✅ 174 components reorganized to primitives/compositions/layouts
- ✅ ALL imports fixed across monorepo
- ✅ package.json exports updated
- ✅ Build passes
- ✅ Dev server works without errors
- ✅ Clean commit in git history

## 🤖 EXECUTION INSTRUCTIONS

1. **Read all required documents** (audit, plan, execution prompt)
2. **Use Svelte MCP** if available for validation
3. **Create TODO list** with manage_todo_list tool
4. **Execute step-by-step** - mark each TODO complete as you go
5. **Test frequently** - don't wait until the end
6. **DON'T CLAIM COMPLETION** until dev server runs successfully

## 📝 REFERENCE FILES

- `PHASE_4A_COMPONENT_AUDIT.md` - Component categorization (✅ exists)
- `PHASE_4A_DETAILED_PLAN.md` - Detailed execution strategy (✅ exists)
- `PHASE_4_EXECUTION_PROMPT.md` - Original requirements
- `PHASE_4_COMPLETE_RESTRUCTURE.md` - Target structure
- `docs/IDEAL_STRUCTURE.md` - SvelteKit 2 best practices

## 🎯 START HERE

1. Read PHASE_4A_COMPONENT_AUDIT.md
2. Create manage_todo_list with 13 steps
3. Generate phase4a-import-map.json
4. Execute systematically
5. Test at every checkpoint
6. Commit only when working

Good luck! 🚀
