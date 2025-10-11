# 🔍 COPILOT AUDIT CHECKLIST - Phase 4B Verification

## 📋 Purpose

This checklist helps **GitHub Copilot** audit Claude CLI's Phase 4B execution systematically.

After Claude CLI completes Phase 4B, use this checklist to verify the implementation quality.

---

## ✅ AUDIT SECTIONS

### 1. EXECUTION COMPLETENESS (25 points)

**Did Claude follow all 13 steps?**

- [ ] Step 1: Domain audit completed with `PHASE_4B_DOMAIN_AUDIT.md` created
- [ ] Step 2: Target structure designed and documented
- [ ] Step 3: Import mapping JSON created (`phase4b-import-map.json`)
- [ ] Step 4: Files copied to new structure (old files kept)
- [ ] Step 5: package.json exports updated
- [ ] Step 6: Import fix scripts created (4 scripts)
- [ ] Step 7: Import fix scripts executed
- [ ] Step 8: Edge cases identified and fixed
- [ ] Step 9: Domain package build tested
- [ ] Step 10: Monorepo build tested
- [ ] Step 11: Dev server tested (CRITICAL)
- [ ] Step 12: Old files deleted after testing
- [ ] Step 13: Rebuilt, re-tested, committed

**Score: ___/13**

---

### 2. DOMAIN STRUCTURE QUALITY (20 points)

**Is the domain package properly organized?**

#### File Structure (10 points)
- [ ] Each domain has its own directory (cart/, products/, auth/, etc.)
- [ ] Each domain has: services.ts, validation.ts, types.ts, index.ts
- [ ] Shared utilities in shared/ directory
- [ ] No leftover files in wrong locations
- [ ] Clean directory structure

**Score: ___/10**

#### Domain Boundaries (10 points)
- [ ] Cart logic separated from products
- [ ] Auth logic separated from users
- [ ] Orders logic separated from payments
- [ ] No circular dependencies between domains
- [ ] Clear separation of concerns

**Score: ___/10**

**Section Total: ___/20**

---

### 3. CODE QUALITY (20 points)

#### Framework Independence (10 points)
- [ ] No Svelte imports in domain package
- [ ] No SvelteKit imports ($app/*, $env/*)
- [ ] No Supabase client initialization (types OK)
- [ ] Pure TypeScript/JavaScript only
- [ ] No browser-specific code

**Score: ___/10**

#### Type Safety (10 points)
- [ ] All types properly defined
- [ ] No `any` types (or justified if present)
- [ ] Proper export of types
- [ ] Type imports work correctly
- [ ] No type errors in domain package

**Score: ___/10**

**Section Total: ___/20**

---

### 4. IMPORT FIX QUALITY (20 points)

#### Import Scripts (10 points)
- [ ] All 4 import fix scripts created
- [ ] Scripts use systematic regex replacement
- [ ] Scripts target correct file patterns
- [ ] Scripts log changes made
- [ ] Scripts are reusable/documented

**Score: ___/10**

#### Import Correctness (10 points)
- [ ] All @repo/domain imports updated
- [ ] Relative imports within domain package fixed
- [ ] No broken imports in apps/
- [ ] No broken imports in packages/
- [ ] Import paths use new domain structure

**Score: ___/10**

**Section Total: ___/20**

---

### 5. TESTING & VERIFICATION (15 points)

#### Build Tests (7 points)
- [ ] Domain package builds successfully
- [ ] Monorepo builds successfully
- [ ] No new build errors introduced
- [ ] No new TypeScript errors
- [ ] Build output is clean

**Score: ___/7**

#### Dev Server Test (8 points) ← MOST CRITICAL
- [ ] Dev server starts without errors
- [ ] No runtime errors in console
- [ ] No domain import errors
- [ ] App loads successfully
- [ ] Verified server works before cleanup

**Score: ___/8**

**Section Total: ___/15**

---

## 6. GIT HYGIENE (10 points)

#### Commit Quality (10 points)
- [ ] Single commit at the end (not multiple)
- [ ] Descriptive commit message
- [ ] Commit message lists major changes
- [ ] Old files deleted before commit
- [ ] No uncommitted changes left

**Score: ___/10**

**Section Total: ___/10**

---

## 7. DOCUMENTATION (10 points)

#### Execution Report (5 points)
- [ ] Clear execution report provided
- [ ] Each step documented
- [ ] Issues/solutions documented
- [ ] File counts provided
- [ ] Summary is accurate

**Score: ___/5**

#### Artifacts Created (5 points)
- [ ] PHASE_4B_DOMAIN_AUDIT.md exists and is thorough
- [ ] phase4b-import-map.json is complete
- [ ] PowerShell scripts are well-commented
- [ ] README or documentation updated if needed
- [ ] Audit trail is clear

**Score: ___/5**

**Section Total: ___/10**

---

## 📊 SCORING SUMMARY

| Section | Points | Score |
|---------|--------|-------|
| 1. Execution Completeness | 25 | ___ |
| 2. Domain Structure Quality | 20 | ___ |
| 3. Code Quality | 20 | ___ |
| 4. Import Fix Quality | 20 | ___ |
| 5. Testing & Verification | 15 | ___ |
| 6. Git Hygiene | 10 | ___ |
| 7. Documentation | 10 | ___ |
| **TOTAL** | **120** | **___** |

---

## 🎯 GRADE SCALE

- **110-120**: 🌟 **EXCELLENT** - Claude nailed it! No issues found.
- **90-109**: ✅ **GOOD** - Solid execution with minor issues to fix.
- **70-89**: ⚠️ **ACCEPTABLE** - Works but needs improvements.
- **50-69**: ❌ **NEEDS WORK** - Significant issues to address.
- **0-49**: 🚨 **FAILED** - Major problems, consider re-execution.

---

## 🔍 DETAILED VERIFICATION STEPS

### Step 1: Check File Structure
```powershell
# Verify domain structure exists
cd K:\driplo-turbo-1\packages\domain\src
ls

# Expected directories: cart, products, auth, orders, users, payments, shared
# Each should have: services.ts, validation.ts, types.ts, index.ts
```

### Step 2: Verify package.json Exports
```powershell
# Check exports are updated
cat K:\driplo-turbo-1\packages\domain\package.json | Select-String -Pattern "exports" -Context 0,20
```

Expected:
```json
"exports": {
  "./cart": {...},
  "./products": {...},
  "./auth": {...},
  ...
}
```

### Step 3: Check for Broken Imports
```powershell
# Search for old import patterns
cd K:\driplo-turbo-1
rg "@repo/domain/[^/]+-service" --type ts --type svelte

# Should return 0 results (all fixed)
```

### Step 4: Test Domain Build
```powershell
cd K:\driplo-turbo-1\packages\domain
pnpm run build

# Should complete without errors
```

### Step 5: Test Dev Server
```powershell
cd K:\driplo-turbo-1
pnpm --filter @repo/web dev

# Should start on http://localhost:5173/
# Open browser and check console for errors
```

### Step 6: Check Git Status
```powershell
git log -1 --oneline
git diff HEAD~1 --stat

# Should show Phase 4B commit with file changes
```

---

## 📝 AUDIT REPORT TEMPLATE

After completing the audit, provide this report:

```markdown
# Phase 4B Audit Report

**Auditor:** GitHub Copilot  
**Date:** [Date]  
**Claude CLI Execution:** Phase 4B - Domain Package Restructure

## Overall Grade: ___/120 ([EXCELLENT/GOOD/ACCEPTABLE/NEEDS WORK/FAILED])

## Summary
[Brief summary of Claude's execution quality]

## Strengths
- ✅ [What Claude did well]
- ✅ [Good patterns followed]
- ✅ [Quality aspects]

## Issues Found
- ❌ [Issue 1] - Severity: [HIGH/MEDIUM/LOW]
- ❌ [Issue 2] - Severity: [HIGH/MEDIUM/LOW]

## Required Fixes
1. [Fix needed]
2. [Fix needed]

## Optional Improvements
1. [Nice to have]
2. [Nice to have]

## Verification Results
- Domain package build: [✅ PASS / ❌ FAIL]
- Monorepo build: [✅ PASS / ❌ FAIL]
- Dev server: [✅ WORKING / ❌ BROKEN]
- Imports: [✅ ALL FIXED / ❌ SOME BROKEN]

## Recommendations
[What should be done next]

## Approval Status
- [ ] ✅ APPROVED - Ready for Phase 4C
- [ ] ⚠️ APPROVED WITH CONDITIONS - Fix minor issues first
- [ ] ❌ REJECTED - Needs significant rework

## Notes
[Any additional observations]
```

---

## 🚀 USAGE INSTRUCTIONS

1. **After Claude CLI finishes**, they will provide an execution report
2. **Read their report** to understand what they did
3. **Use this checklist** to systematically verify their work
4. **Run verification commands** to test the implementation
5. **Score each section** based on findings
6. **Calculate total score** and assign grade
7. **Provide audit report** with strengths, issues, and recommendations
8. **Decide:** Approve, Approve with conditions, or Reject

---

## 💡 TIPS FOR AUDITING

- **Be thorough but fair** - Claude is doing complex work
- **Test everything** - Don't just read code, run it
- **Check edge cases** - Look for what might break
- **Verify dev server** - This is the most critical test
- **Document findings** - Help Claude (and user) understand issues
- **Be constructive** - Suggest fixes, not just criticism

---

## 🎯 CRITICAL CHECKS

**These MUST pass for approval:**

1. ✅ Dev server runs without errors
2. ✅ No broken imports anywhere in monorepo
3. ✅ Domain package builds successfully
4. ✅ Changes committed to git
5. ✅ Domain boundaries are clean (no circular deps)

**If any critical check fails → REJECT and request fixes**

---

## 📞 IF CLAUDE FAILS

**If score < 70 or critical checks fail:**

1. Document all issues clearly
2. Provide specific fix instructions
3. Let user decide: Fix manually or give Claude another chance
4. If manual fix needed, guide user through corrections

**If score >= 70:**
- Minor issues can be fixed by user or in Phase 4C
- Approve with conditions and document improvements needed

---

Good luck auditing! Be thorough and help Claude improve! 🔍💚
