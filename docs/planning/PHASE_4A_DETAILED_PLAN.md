# PHASE 4A EXECUTION PLAN - COMPLETE WITH IMPORT FIXES

## GOAL
Reorganize packages/ui with 174 components into proper structure AND fix ALL imports systematically.

## STRATEGY
1. **Audit & Map** - Document current locations and target locations
2. **Create Structure** - Build new directory tree
3. **Move Files** - Copy files to new locations (don't delete yet)
4. **Generate Import Map** - Map old paths → new paths
5. **Fix Imports** - Use PowerShell to update ALL imports across monorepo
6. **Test** - Build & verify everything works
7. **Clean** - Delete old locations
8. **Commit**

---

## STEP 1: AUDIT CURRENT STATE

### Current ui package structure:
```
packages/ui/src/lib/
├── ui/                  # ~50 primitive components (WRONG LOCATION)
├── business/            # ~30 business components (WRONG LOCATION) 
├── navigation/          # ~20 navigation components (WRONG LOCATION)
├── product/             # ~25 product components (WRONG LOCATION)
├── search/              # ~15 search components (WRONG LOCATION)
├── utilities/           # ~20 utilities (WRONG LOCATION)
├── types/               # Types (OK LOCATION)
└── index.ts             # Barrel file (REMOVE LATER)
```

### Target ui package structure:
```
packages/ui/src/lib/
├── primitives/          # Base atomic components
│   ├── button/
│   │   ├── Button.svelte
│   │   ├── types.ts
│   │   └── index.ts     # Just re-export Button
│   ├── input/
│   ├── avatar/
│   ├── badge/
│   └── ...
├── compositions/        # Combined components
│   ├── product/
│   │   ├── ProductCard.svelte
│   │   ├── ProductGallery.svelte
│   │   └── types.ts
│   ├── navigation/
│   ├── forms/
│   └── ...
├── layouts/             # Page-level layouts
│   ├── Header.svelte
│   ├── Footer.svelte
│   └── ...
├── utils/               # Client-safe utilities
│   ├── formatters.ts
│   └── validators.ts
├── server/              # Server-only code (NEW)
│   └── validators.ts
└── types/               # Shared types
```

---

## STEP 2: CREATE IMPORT MAPPING

### Mapping file: `phase4a-import-map.json`
```json
{
  "primitives": {
    "lib/ui/Button.svelte": "lib/primitives/button/Button.svelte",
    "lib/ui/Input.svelte": "lib/primitives/input/Input.svelte",
    "lib/ui/Avatar.svelte": "lib/primitives/avatar/Avatar.svelte"
  },
  "compositions": {
    "lib/product/ProductCard.svelte": "lib/compositions/product/ProductCard.svelte",
    "lib/business/BuyBox.svelte": "lib/compositions/business/BuyBox.svelte"
  },
  "layouts": {
    "lib/navigation/Header.svelte": "lib/layouts/Header.svelte"
  }
}
```

---

## STEP 3: POWERSHELL SCRIPT TO FIX IMPORTS

### Script: `fix-phase4a-imports.ps1`

```powershell
# Phase 4A: Fix ALL imports after UI package restructure

$importMap = @{
    # Primitives
    "from '\$lib/ui/Button.svelte'" = "from '\$lib/primitives/button/Button.svelte'"
    "from '\$lib/ui/Input.svelte'" = "from '\$lib/primitives/input/Input.svelte'"
    "from '\$lib/ui/Avatar.svelte'" = "from '\$lib/primitives/avatar/Avatar.svelte'"
    
    # Within UI package - relative imports
    "from '../ui/Button.svelte'" = "from '../../primitives/button/Button.svelte'"
    "from '../ui/Input.svelte'" = "from '../../primitives/input/Input.svelte'"
    
    # Compositions
    "from '\$lib/product/ProductCard.svelte'" = "from '\$lib/compositions/product/ProductCard.svelte'"
    "from '\$lib/business/BuyBox.svelte'" = "from '\$lib/compositions/business/BuyBox.svelte'"
    
    # Within UI package - relative
    "from '../product/ProductCard.svelte'" = "from '../product/ProductCard.svelte'"  # Stays same (already in compositions/)
    
    # Layouts
    "from '\$lib/navigation/Header.svelte'" = "from '\$lib/layouts/Header.svelte'"
    
    # From @repo/ui imports in apps
    "from '@repo/ui/Button'" = "from '@repo/ui/primitives/button/Button'"
    "from '@repo/ui'" = "from '@repo/ui/primitives'"  # Update main exports
}

# Get all Svelte/TS files in monorepo (exclude node_modules)
$files = Get-ChildItem -Path "K:\driplo-turbo-1" -Recurse -Include "*.svelte","*.ts" -Exclude "node_modules","dist",".turbo",".svelte-kit"

Write-Host "Found $($files.Count) files to process"
Write-Host ""

$fixedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Apply all mappings
    foreach ($old in $importMap.Keys) {
        $new = $importMap[$old]
        $content = $content -replace [regex]::Escape($old), $new
    }
    
    # Save if changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
        $fixedCount++
    }
}

Write-Host ""
Write-Host "=== Fixed $fixedCount files ==="
```

---

## STEP 4: EXECUTION CHECKLIST

### Phase 4A.1: Audit (15 min)
- [ ] List all 174 components in ui package
- [ ] Categorize as primitives/compositions/layouts
- [ ] Create import mapping document

### Phase 4A.2: Create Structure (10 min)
```powershell
cd K:\driplo-turbo-1\packages\ui\src\lib

# Create new directories
New-Item -ItemType Directory -Path "primitives/button"
New-Item -ItemType Directory -Path "primitives/input"
New-Item -ItemType Directory -Path "compositions/product"
New-Item -ItemType Directory -Path "compositions/business"
New-Item -ItemType Directory -Path "layouts"
New-Item -ItemType Directory -Path "server"
```

### Phase 4A.3: Move Components (30 min)
```powershell
# Move primitives
Move-Item -Path "ui/Button.svelte" -Destination "primitives/button/Button.svelte"
Move-Item -Path "ui/Input.svelte" -Destination "primitives/input/Input.svelte"

# Move compositions
Move-Item -Path "product/*.svelte" -Destination "compositions/product/"
Move-Item -Path "business/*.svelte" -Destination "compositions/business/"

# Move layouts
Move-Item -Path "navigation/Header.svelte" -Destination "layouts/Header.svelte"
Move-Item -Path "navigation/Footer.svelte" -Destination "layouts/Footer.svelte"
```

### Phase 4A.4: Generate Complete Import Map (20 min)
- [ ] Document EVERY file that moved
- [ ] Create comprehensive mapping for script
- [ ] Include relative paths within ui package
- [ ] Include $lib paths from apps
- [ ] Include @repo/ui paths from apps

### Phase 4A.5: Run Import Fix Script (10 min)
```powershell
cd K:\driplo-turbo-1
.\fix-phase4a-imports.ps1
```

### Phase 4A.6: Fix .js vs .ts Extensions (5 min)
```powershell
# Fix any .js imports that should be .ts
Get-ChildItem -Recurse -Filter "*.svelte" | 
    ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $content = $content -replace "from '(.+?)\.js'", "from '`$1.ts'"
        Set-Content -Path $_.FullName -Value $content -NoNewline
    }
```

### Phase 4A.7: Update package.json Exports (10 min)
```json
{
  "exports": {
    "./primitives/*": {
      "types": "./dist/lib/primitives/*/index.d.ts",
      "svelte": "./dist/lib/primitives/*/index.js"
    },
    "./compositions/*": {
      "types": "./dist/lib/compositions/*/index.d.ts",
      "svelte": "./dist/lib/compositions/*/index.js"
    },
    "./layouts/*": {
      "types": "./dist/lib/layouts/*.d.ts",
      "svelte": "./dist/lib/layouts/*.js"
    }
  }
}
```

### Phase 4A.8: Test Everything (15 min)
```powershell
cd K:\driplo-turbo-1

# Test UI package builds
cd packages/ui
pnpm run build

# Test full monorepo
cd ../..
pnpm run build

# Test dev server
pnpm dev
```

### Phase 4A.9: Clean Old Structure (5 min)
```powershell
# Only after tests pass!
cd packages/ui/src/lib
Remove-Item -Path "ui" -Recurse
Remove-Item -Path "business" -Recurse  
Remove-Item -Path "product" -Recurse
# etc.
```

### Phase 4A.10: Commit (5 min)
```powershell
git add -A
git commit -m "Phase 4A: UI package restructure with ALL imports fixed

- Moved 174 components to primitives/compositions/layouts
- Fixed ALL imports across monorepo (script-based)
- Updated package.json exports
- Verified build passes
- Tested dev server works"
```

---

## CRITICAL SUCCESS FACTORS

1. **Don't skip the import mapping** - Document EVERY path change
2. **Test at each step** - Build after moving, before cleaning
3. **Use PowerShell for imports** - Manual fixing will miss files
4. **Include relative imports** - Both $lib and ../ paths
5. **Fix .js → .ts** - Separate pass for extension fixes
6. **Test dev server** - Not just build, actually load pages
7. **Commit only when working** - Don't commit broken state

---

## IF THINGS BREAK

### Rollback plan:
```powershell
git reset --hard HEAD~1  # Undo last commit
```

### Debug broken imports:
```powershell
# Find remaining broken imports
cd packages/ui/src/lib
Get-ChildItem -Recurse -Filter "*.svelte" | 
    Select-String -Pattern "from '../ui/|from '../business/'" |
    Select-Object Path, LineNumber, Line
```

---

## ESTIMATED TIME
- Total: 2-3 hours (with testing)
- Audit: 15 min
- Structure: 10 min
- Move: 30 min
- Mapping: 20 min
- Script: 10 min
- Extensions: 5 min
- Exports: 10 min
- Test: 15 min
- Clean: 5 min
- Commit: 5 min

## PREREQUISITES
- ✅ Git commit current state (clean working tree)
- ✅ All tests passing currently
- ✅ Dev server working currently
- ✅ Backup created
