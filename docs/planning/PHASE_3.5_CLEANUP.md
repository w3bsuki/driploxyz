# 🧹 PHASE 3.5: Complete Cleanup (Debt from Phases 1-3)

**Date**: 2025-01-22  
**Status**: Ready to Execute  
**Prerequisites**: Phase 1 ✅ | Phase 2 ✅ | Phase 3 ✅

---

## 🎯 Purpose

Phases 1-3 focused on **RESTRUCTURING** but left behind cleanup debt:
- Unused dependencies
- Dead imports
- TODO/FIXME markers
- Commented code
- Backup files

**This phase cleans ALL of that up before starting Phase 4.**

---

## Why Clean Up NOW?

```
Current State:
├── Phase 1-3: RESTRUCTURED but messy
├── Unused deps: 9 packages wasting space
├── TODOs: 2+ incomplete markers
└── Dead code: Unknown amount

After Phase 3.5:
├── Zero unused dependencies
├── Zero dead code
├── Zero TODOs/FIXMEs
└── Clean foundation for Phase 4
```

**You can't restructure a messy codebase in Phase 4. Clean up FIRST.**

---

## Cleanup Findings (From Audit)

### 1. Unused Dependencies (apps/web):

**Remove these from package.json:**
```json
"dependencies": {
  "@lucide/svelte": "...",           // ❌ UNUSED
  "@tailwindcss/forms": "...",       // ❌ UNUSED
  "@tailwindcss/typography": "...",  // ❌ UNUSED
  "resend": "..."                    // ❌ UNUSED
},
"devDependencies": {
  "@repo/typescript-config": "...",  // ❌ UNUSED
  "@sentry/vite-plugin": "...",      // ❌ UNUSED
  "prettier": "...",                 // ❌ UNUSED
  "prettier-plugin-svelte": "...",   // ❌ UNUSED
  "tailwindcss": "...",              // ❌ UNUSED
  "tslib": "..."                     // ❌ UNUSED
}
```

### 2. TODO/FIXME Markers:
- Found: **2 TODO/FIXME comments**
- Action: Find and resolve or remove

### 3. Dead Code:
- Commented-out imports (likely many)
- Unused utility functions
- Empty directories

---

## Step-by-Step Cleanup Plan (2-3 hours)

### Step 1: Remove Unused Dependencies (30 min)

#### A. Update apps/web/package.json:

**Remove these unused dependencies:**
```bash
cd apps/web
pnpm remove @lucide/svelte @tailwindcss/forms @tailwindcss/typography resend
pnpm remove -D @repo/typescript-config @sentry/vite-plugin prettier prettier-plugin-svelte tailwindcss tslib
```

**Why each is unused:**
- `@lucide/svelte` - You're using `lucide-svelte` instead (already in deps)
- `@tailwindcss/forms` - Not configured in tailwind.config
- `@tailwindcss/typography` - Not configured in tailwind.config
- `resend` - Email service, but not used in codebase
- `@repo/typescript-config` - Extends from root, not needed in devDeps
- `@sentry/vite-plugin` - Sentry not configured yet (Phase 6+)
- `prettier` - Using ESLint for formatting
- `prettier-plugin-svelte` - Using ESLint for formatting
- `tailwindcss` - Already in deps, not needed in devDeps
- `tslib` - TypeScript generates helpers, not needed explicitly

**Verify removal:**
```powershell
cd apps/web
pnpm install
pnpm build
# Should build successfully with 9 fewer deps
```

---

### Step 2: Find and Resolve TODOs/FIXMEs (30 min)

#### A. Find all TODOs:
```powershell
Get-ChildItem -Path "apps\web\src" -Recurse -Include "*.ts","*.svelte","*.js" | 
  Select-String -Pattern "TODO|FIXME" | 
  Select-Object Path, LineNumber, Line
```

#### B. For each TODO/FIXME:
**Option 1**: Complete the task
**Option 2**: Create GitHub issue and remove comment
**Option 3**: If no longer relevant, delete

**Example Resolutions:**
```typescript
// BEFORE
// TODO: Add error handling
function getData() { ... }

// AFTER (Option 1 - Complete it)
function getData() {
  try {
    // ...
  } catch (error) {
    handleError(error);
  }
}

// OR AFTER (Option 2 - Issue it)
// See GitHub issue #123 for error handling improvement
function getData() { ... }

// OR AFTER (Option 3 - Delete if irrelevant)
function getData() { ... }
```

---

### Step 3: Remove Commented Code (45 min)

#### A. Find commented imports:
```powershell
Get-ChildItem -Path "apps\web\src" -Recurse -Include "*.ts","*.svelte" | 
  Select-String -Pattern "^\s*//\s*import" |
  Select-Object Path, LineNumber, Line
```

#### B. Find large comment blocks:
```powershell
Get-ChildItem -Path "apps\web\src" -Recurse -Include "*.ts","*.svelte" |
  Select-String -Pattern "^\s*//.*\n\s*//.*\n\s*//" -Context 0,3
```

#### C. Removal Strategy:
**For each commented code block:**
1. Check git history: `git log -p -- <file>` to see when commented
2. If > 6 months old AND no clear reason → DELETE
3. If < 6 months AND has reason comment → Keep (e.g., "// Disabled for migration")
4. If unclear → Ask team or delete (git has the history)

**Example Cleanup:**
```typescript
// BEFORE - Dead commented code
// import { OldService } from './old-service';
// import { LegacyComponent } from './legacy';
import { NewService } from './new-service';

function doThing() {
  // const old = new OldService();
  // old.doStuff();
  const service = new NewService();
  service.doStuff();
}

// AFTER - Clean
import { NewService } from './new-service';

function doThing() {
  const service = new NewService();
  service.doStuff();
}
```

---

### Step 4: Remove Backup/Old Files (15 min)

#### A. Find backup files:
```powershell
Get-ChildItem -Path "apps\web\src" -Recurse -Include "*.old","*.backup","*.bak","*_old.*","*_backup.*" |
  Select-Object FullName
```

#### B. Find files with "old" or "backup" in name:
```powershell
Get-ChildItem -Path "apps\web\src" -Recurse | 
  Where-Object { $_.Name -match "old|backup|bak|deprecated|legacy|temp" } |
  Select-Object FullName
```

#### C. Delete if found:
```powershell
# Review list first, then:
Get-ChildItem -Path "apps\web\src" -Recurse -Include "*.old","*.backup","*.bak" |
  Remove-Item -Verbose
```

---

### Step 5: Find and Remove Dead Utility Functions (45 min)

#### A. List all utility files:
```powershell
Get-ChildItem -Path "apps\web\src\lib\utils" -Recurse -Filter "*.ts" |
  Select-Object Name, FullName
```

#### B. For each utility file, check usage:
```powershell
# Example: Check if language-switcher.ts is used
$file = "language-switcher"
Get-ChildItem -Path "apps\web\src" -Recurse -Include "*.ts","*.svelte" |
  Select-String -Pattern "from.*$file|import.*$file" |
  Measure-Object
```

#### C. Common Dead Utilities to Check:
- Old validation functions (replaced by schemas)
- Old API helpers (replaced by @repo/core services)
- Old type guards (replaced by Zod/Valibot)
- Old formatting functions (replaced by libraries)

**If Count = 0 (only the file itself), DELETE IT.**

---

### Step 6: Remove Empty Directories (10 min)

```powershell
# Find empty directories
Get-ChildItem -Path "apps\web\src" -Recurse -Directory |
  Where-Object { (Get-ChildItem $_.FullName -File).Count -eq 0 } |
  Select-Object FullName

# Delete empty directories
Get-ChildItem -Path "apps\web\src" -Recurse -Directory |
  Where-Object { (Get-ChildItem $_.FullName -File).Count -eq 0 } |
  Remove-Item -Verbose
```

---

### Step 7: Clean Package Dependencies (Other Apps) (20 min)

**Check admin and docs apps too:**

```powershell
# Check apps/admin
cd apps/admin
npx depcheck --ignores="@sveltejs/*,svelte,vite,@types/*,eslint*,typescript"

# Check apps/docs
cd apps/docs
npx depcheck --ignores="@sveltejs/*,svelte,vite,@types/*,eslint*,typescript"

# Remove any unused deps found
```

---

### Step 8: Final Validation (20 min)

#### A. Build Everything:
```powershell
cd K:\driplo-turbo-1
pnpm turbo clean
pnpm install
pnpm turbo build
```

#### B. Type Check:
```powershell
pnpm turbo check-types
```

#### C. Lint:
```powershell
pnpm turbo lint
```

#### D. Verify Cleanup:
```powershell
# Should return 0 unused deps
cd apps/web
npx depcheck

# Should return 0 TODOs (or only intentional ones)
Get-ChildItem -Path "apps\web\src" -Recurse -Include "*.ts","*.svelte" |
  Select-String -Pattern "TODO|FIXME" |
  Measure-Object
```

---

## Expected Results

### Before Phase 3.5:
```
apps/web/package.json:
├── 9 unused dependencies
├── ~40-50 total dependencies

apps/web/src/:
├── 2+ TODO/FIXME comments
├── Unknown commented code
├── Possible backup files
└── Unknown dead utilities
```

### After Phase 3.5:
```
apps/web/package.json:
├── 0 unused dependencies ✅
├── ~31-41 total dependencies (9 fewer)

apps/web/src/:
├── 0 TODO/FIXME comments ✅
├── 0 commented code ✅
├── 0 backup files ✅
└── 0 dead utilities ✅
```

---

## Success Criteria

- [ ] **9 dependencies removed** from apps/web
- [ ] **All TODOs resolved** (completed, issued, or removed)
- [ ] **All commented code removed** (git history preserves it)
- [ ] **No backup files** (.old, .bak, etc.)
- [ ] **No dead utilities** (verified with usage checks)
- [ ] **No empty directories**
- [ ] **All builds pass** (turbo build succeeds)
- [ ] **All type checks pass** (turbo check-types succeeds)
- [ ] **All lint checks pass** (turbo lint succeeds)

---

## Why This Matters for Phase 4

**Phase 4 will:**
1. Move components to routes (creating many file moves)
2. Update imports across entire codebase
3. Restructure directory layouts

**If we have:**
- ❌ Unused deps → Harder to see what's actually used
- ❌ Commented code → Confusing what's active vs dead
- ❌ Dead utilities → Unclear what to move/keep
- ❌ TODOs → Incomplete work gets restructured

**Clean codebase = Easy restructuring. Messy codebase = Painful restructuring.**

---

## Timeline

| Task | Duration |
|------|----------|
| Step 1: Remove unused deps | 30 min |
| Step 2: Resolve TODOs | 30 min |
| Step 3: Remove commented code | 45 min |
| Step 4: Remove backup files | 15 min |
| Step 5: Remove dead utilities | 45 min |
| Step 6: Remove empty dirs | 10 min |
| Step 7: Clean other apps | 20 min |
| Step 8: Final validation | 20 min |
| **TOTAL** | **3h 15min** |

---

## Git Workflow

```powershell
# Before starting
git checkout -b phase-3.5-cleanup
git add .
git commit -m "Checkpoint before Phase 3.5 cleanup"

# After Step 1 (deps)
git add apps/web/package.json pnpm-lock.yaml
git commit -m "Phase 3.5: Remove 9 unused dependencies"

# After Step 2-3 (code cleanup)
git add .
git commit -m "Phase 3.5: Remove TODOs and commented code"

# After Step 4-6 (files)
git add .
git commit -m "Phase 3.5: Remove backup files and empty dirs"

# After validation
git add .
git commit -m "Phase 3.5: Complete cleanup - ready for Phase 4"

# Merge to main
git checkout main
git merge phase-3.5-cleanup
git push origin main
```

---

## Ready to Execute?

**Run Phase 3.5 BEFORE Phase 4!**

Checklist:
- [ ] Phase 1-3 complete (framework-agnostic core, route colocation, package organization)
- [ ] Git working tree is clean
- [ ] All current builds passing
- [ ] Ready to spend 3 hours on cleanup

**Once Phase 3.5 is done, THEN start Phase 4 in a new chat.**

---

## Phase Sequence

```
✅ Phase 1: Framework-agnostic @repo/core
✅ Phase 2: Route colocation
✅ Phase 3: Package organization
🎯 Phase 3.5: Cleanup (YOU ARE HERE) ← DO THIS NOW
→ Phase 4: i18n routing + structure
→ Phase 5: Multi-region backend
→ Phase 6+: Performance, SEO, etc.
```

<function_calls>
<invoke name="read_file">
<parameter name="filePath">k:/driplo-turbo-1/apps/web/package.json