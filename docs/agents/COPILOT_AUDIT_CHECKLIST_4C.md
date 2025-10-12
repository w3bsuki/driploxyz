# COPILOT AUDIT CHECKLIST: Phase 4C - Apps/Web Restructure

> **Your Role**: You are GitHub Copilot auditing Claude CLI Agent's execution of Phase 4C.  
> **Objective**: Score the apps/web restructure work based on this 120-point checklist.

---

## 📊 SCORING SYSTEM

**Total Points: 120**

- **110-120**: EXCELLENT - Approve and proceed to Phase 4D
- **90-109**: GOOD - Minor issues, fix before proceeding
- **70-89**: ACCEPTABLE - Several issues, requires fixes
- **< 70**: NEEDS REWORK - Major issues, redo phase

---

## ✅ AUDIT CHECKLIST

### 1. LAYOUT GROUPS STRUCTURE (20 points)

#### 1.1 Layout Group Creation (10 points)
- [ ] **`(app)/+layout.svelte` exists** (2 pts)
- [ ] **`(app)/(shop)/+layout.svelte` exists** (2 pts)
- [ ] **`(app)/(account)/+layout.svelte` exists** (2 pts)
- [ ] **`(marketing)/+layout.svelte` exists** (2 pts)
- [ ] **All layout files have valid Svelte 5 syntax** (2 pts)

#### 1.2 Route Organization (10 points)
Check `phase4c-route-map.json`:
- [ ] **All shop routes moved to `(app)/(shop)/`** (3 pts)
  - search, product, category, brands, collection, designer, wishlist, sellers
- [ ] **All account routes moved to `(app)/(account)/`** (3 pts)
  - profile, pro
- [ ] **All marketing routes moved to `(marketing)/`** (3 pts)
  - about, blog, careers, help, privacy, terms, returns, trust-safety
- [ ] **No loose routes at root level (except homepage, error, api/)** (1 pt)

**Score: ___ / 20**

---

### 2. ROUTE COLOCATION (25 points)

#### 2.1 Component Moves (15 points)
Check `phase4c-component-map.json`:
- [ ] **Route-specific components moved to route `components/` folders** (10 pts)
  - modular/* → (protected)/messages/components/
  - Other route-specific components colocated
- [ ] **No route-specific components remain in `lib/components/`** (5 pts)
  - Scan lib/components/ for any that should be colocated

#### 2.2 Shared Components Preserved (10 points)
Verify these STAY in `lib/components/`:
- [ ] **Header.svelte** (2 pts)
- [ ] **layout/** directory (2 pts)
- [ ] **error/** directory (2 pts)
- [ ] **ErrorBoundary.svelte, FormErrorBoundary.svelte, etc.** (2 pts)
- [ ] **OptimizedImage.svelte, PageLoader.svelte, etc.** (2 pts)

**Score: ___ / 25**

---

### 3. $lib/server/ SEPARATION (25 points)

#### 3.1 Server Code Moved (20 points)
Check `phase4c-server-code-map.json`:
- [ ] **Auth server code in `lib/server/auth/`** (5 pts)
  - No *.server.ts files in lib/auth/
- [ ] **Supabase admin client in `lib/server/supabase/`** (5 pts)
  - serviceRole usage is server-only
- [ ] **Stripe code in `lib/server/stripe/`** (5 pts)
  - All Stripe SDK usage is server-only
- [ ] **Analytics/monitoring in `lib/server/`** (5 pts)

#### 3.2 No Server Leaks (5 points)
Verify NO private env vars or secrets in non-server code:
- [ ] **No `$env/static/private` imports outside `lib/server/`** (2 pts)
- [ ] **No `$env/dynamic/private` imports outside `lib/server/`** (2 pts)
- [ ] **No `PRIVATE_` or `SECRET_` vars outside `lib/server/`** (1 pt)

**Score: ___ / 25**

---

### 4. IMPORT UPDATES (25 points)

#### 4.1 Route Component Imports (10 points)
- [ ] **Colocated components use relative imports** (5 pts)
  - Example: `from './components/Component.svelte'` (not $lib/components/)
- [ ] **No broken component imports** (5 pts)
  - Search for old modular/ imports

#### 4.2 Server Code Imports (10 points)
- [ ] **All server imports use `$lib/server/` path** (5 pts)
  - Check for `from '$lib/auth/*.server'` (should be `$lib/server/auth/`)
  - Check for `from '$lib/stripe/'` (should be `$lib/server/stripe/`)
- [ ] **No circular imports introduced** (5 pts)

#### 4.3 Import Mapping Documented (5 points)
- [ ] **`phase4c-import-map.json` exists and complete** (3 pts)
- [ ] **All import patterns documented** (2 pts)

**Score: ___ / 25**

---

### 5. VERIFICATION (15 points)

#### 5.1 Build Success (8 points)
- [ ] **`pnpm run check` passes** (4 pts)
  - Or minimal errors (not import-related)
- [ ] **`pnpm run build` succeeds** (4 pts)

#### 5.2 Dev Server Works (7 points)
- [ ] **Dev server starts on http://localhost:5173/** (2 pts)
- [ ] **Homepage loads** (1 pt)
- [ ] **Shop routes work** (e.g., /search, /products) (1 pt)
- [ ] **Account routes work** (e.g., /profile) (1 pt)
- [ ] **Marketing routes work** (e.g., /about) (1 pt)
- [ ] **No console errors related to imports** (1 pt)

**Score: ___ / 15**

---

### 6. DOCUMENTATION (10 points)

#### 6.1 Required Files (8 points)
- [ ] **`PHASE_4C_RESTRUCTURE_SUMMARY.md` exists** (2 pts)
- [ ] **`phase4c-route-map.json` exists** (1 pt)
- [ ] **`phase4c-component-map.json` exists** (1 pt)
- [ ] **`phase4c-server-code-map.json` exists** (1 pt)
- [ ] **`phase4c-import-map.json` exists** (1 pt)
- [ ] **`phase4c-final-routes-tree.txt` exists** (1 pt)
- [ ] **All docs are complete and accurate** (1 pt)

#### 6.2 Summary Quality (2 points)
- [ ] **Summary includes counts** (routes moved, components colocated, etc.) (1 pt)
- [ ] **Summary includes verification results** (1 pt)

**Score: ___ / 10**

---

## 📝 AUDIT PROCEDURE

### Step 1: Read Summary
```powershell
cat K:\driplo-turbo-1\PHASE_4C_RESTRUCTURE_SUMMARY.md
```

### Step 2: Check Layout Groups
```powershell
# Verify layout files exist
Test-Path "K:\driplo-turbo-1\apps\web\src\routes\(app)\+layout.svelte"
Test-Path "K:\driplo-turbo-1\apps\web\src\routes\(app)\(shop)\+layout.svelte"
Test-Path "K:\driplo-turbo-1\apps\web\src\routes\(app)\(account)\+layout.svelte"
Test-Path "K:\driplo-turbo-1\apps\web\src\routes\(marketing)\+layout.svelte"

# List routes to verify organization
tree /F "K:\driplo-turbo-1\apps\web\src\routes" | more
```

### Step 3: Verify Route Colocation
```powershell
# Check component map
cat K:\driplo-turbo-1\phase4c-component-map.json | ConvertFrom-Json | Format-Table

# Verify modular components moved
Test-Path "K:\driplo-turbo-1\apps\web\src\routes\(protected)\messages\components"
!(Test-Path "K:\driplo-turbo-1\apps\web\src\lib\components\modular")

# Check lib/components for any remaining route-specific components
ls K:\driplo-turbo-1\apps\web\src\lib\components
```

### Step 4: Verify $lib/server/ Separation
```powershell
# Check server code map
cat K:\driplo-turbo-1\phase4c-server-code-map.json | ConvertFrom-Json | Format-Table

# Verify server directories exist
Test-Path "K:\driplo-turbo-1\apps\web\src\lib\server\auth"
Test-Path "K:\driplo-turbo-1\apps\web\src\lib\server\supabase"
Test-Path "K:\driplo-turbo-1\apps\web\src\lib\server\stripe"

# Search for private env vars outside server/
Select-String -Path "K:\driplo-turbo-1\apps\web\src\lib" -Pattern "\$env/static/private|\$env/dynamic/private" -Recurse | Where-Object { $_.Path -notlike "*\server\*" }
# Should return ZERO results
```

### Step 5: Check Import Updates
```powershell
# Check import map
cat K:\driplo-turbo-1\phase4c-import-map.json | ConvertFrom-Json

# Search for old import patterns (should find NONE)
Select-String -Path "K:\driplo-turbo-1\apps\web\src" -Pattern "from ['\`"]\$lib/components/modular" -Recurse
Select-String -Path "K:\driplo-turbo-1\apps\web\src" -Pattern "from ['\`"]\$lib/auth/.*\.server" -Recurse
Select-String -Path "K:\driplo-turbo-1\apps\web\src" -Pattern "from ['\`"]\$lib/stripe/" -Recurse -Exclude *server*

# Search for colocated component imports (should use relative paths)
Select-String -Path "K:\driplo-turbo-1\apps\web\src\routes\(protected)\messages" -Pattern "from '\./components/" -Recurse
```

### Step 6: Test Build
```powershell
cd K:\driplo-turbo-1\apps\web

# TypeScript check
pnpm run check
# Note number of errors

# Build
pnpm run build
# Should succeed

# Dev server (background)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd K:\driplo-turbo-1\apps\web; pnpm run dev"
# Wait 10 seconds, then test http://localhost:5173/ in browser
```

### Step 7: Review Git Commit
```powershell
cd K:\driplo-turbo-1
git log -1 --stat
git show --name-status | head -50
```

Check:
- [ ] Commit message is detailed
- [ ] Includes all file moves
- [ ] Commit is atomic (one commit for Phase 4C)

---

## 📊 FINAL SCORE CALCULATION

| Category | Points Earned | Points Possible |
|----------|---------------|-----------------|
| 1. Layout Groups Structure | ___ | 20 |
| 2. Route Colocation | ___ | 25 |
| 3. $lib/server/ Separation | ___ | 25 |
| 4. Import Updates | ___ | 25 |
| 5. Verification | ___ | 15 |
| 6. Documentation | ___ | 10 |
| **TOTAL** | **___** | **120** |

---

## 🎯 AUDIT REPORT TEMPLATE

```markdown
# Phase 4C Audit Report

**Auditor:** GitHub Copilot  
**Date:** [DATE]  
**Commit:** [HASH]

## Overall Score: ___ / 120

**Rating:** [EXCELLENT / GOOD / ACCEPTABLE / NEEDS REWORK]

## Category Breakdown

### 1. Layout Groups Structure: ___ / 20
- ✅ / ❌ Layout files created
- ✅ / ❌ Routes properly organized
- **Issues:** [list any]

### 2. Route Colocation: ___ / 25
- ✅ / ❌ Route-specific components colocated
- ✅ / ❌ Shared components preserved
- **Issues:** [list any]

### 3. $lib/server/ Separation: ___ / 25
- ✅ / ❌ Server code moved to server/
- ✅ / ❌ No server leaks
- **Issues:** [list any]

### 4. Import Updates: ___ / 25
- ✅ / ❌ Component imports updated
- ✅ / ❌ Server imports updated
- **Issues:** [list any]

### 5. Verification: ___ / 15
- ✅ / ❌ Build succeeds
- ✅ / ❌ Dev server works
- **Issues:** [list any]

### 6. Documentation: ___ / 10
- ✅ / ❌ All docs generated
- ✅ / ❌ Docs are complete
- **Issues:** [list any]

## Detailed Findings

### Critical Issues (Blockers)
[List any issues that MUST be fixed before proceeding]

### Non-Critical Issues (Suggestions)
[List any minor improvements]

### Exemplary Work
[Highlight anything done exceptionally well]

## Recommendation
- [ ] ✅ APPROVE - Proceed to Phase 4D
- [ ] ⚠️ CONDITIONAL APPROVE - Fix minor issues first
- [ ] ❌ REJECT - Rework required

## Action Items
1. [If conditional/reject, list required fixes]

---

**Audit Complete**
```

---

## 🚀 NEXT STEPS

**If score ≥ 110:**
✅ Phase 4C APPROVED → Proceed to Phase 4D (Core Package Audit)

**If score 90-109:**
⚠️ Fix minor issues, then re-audit

**If score < 90:**
❌ Significant rework needed - identify and fix issues

---

## 💡 COMMON ISSUES TO WATCH FOR

### Issue: Routes not fully organized
- Some routes still at root level (should be in layout groups)
- Check `phase4c-route-map.json` for completeness

### Issue: Components not fully colocated
- Route-specific components still in lib/components/
- Check component usage count

### Issue: Server code still exposed
- *.server.ts files outside lib/server/
- Private env var imports in client code

### Issue: Broken imports
- Old import paths not updated
- Relative paths incorrect after moves

### Issue: Build failures
- TypeScript errors from missing imports
- Module resolution issues

### Issue: Incomplete documentation
- JSON maps missing or incomplete
- Summary lacks details

---

**Remember:** This is THE BIG restructure. Be thorough in your audit. The goal is apps/web following SvelteKit 2 best practices perfectly. 🎯
