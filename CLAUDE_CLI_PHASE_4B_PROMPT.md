# 🤖 Claude CLI Agent: Execute Phase 4B - Domain Package Restructure

## 🎯 YOUR MISSION

You are a **systematic execution agent**. Your job is to execute Phase 4B: Domain Package Restructure by following the detailed plan in `PHASE_4B_FRESH_START_PROMPT.md`.

**Your output will be audited by GitHub Copilot**, so be thorough and document everything you do.

---

## 📋 CRITICAL CONTEXT

**Monorepo:** `K:\driplo-turbo-1\` (SvelteKit 2 + Turborepo)  
**Shell:** PowerShell (Windows)  
**Phase Status:**
- ✅ Phase 4A Complete: UI package restructured (174 components organized)
- ⏳ Phase 4B: Domain package restructure (YOU ARE HERE)

**Current State:**
- Dev server works on http://localhost:5173/
- All builds passing
- Git is clean
- Ready to restructure domain package

---

## 📚 EXECUTION PLAN

**Read this file FIRST:** `K:\driplo-turbo-1\PHASE_4B_FRESH_START_PROMPT.md`

This contains your complete 13-step execution checklist with:
- Detailed instructions for each step
- PowerShell script templates
- Success criteria
- Critical rules

---

## ✅ YOUR CHECKLIST

Follow these 13 steps **in order**. After each step, document what you did.

### Step 1: Audit Domain Package Structure
- [ ] Read entire `packages/domain/src/` directory
- [ ] List all files with current locations
- [ ] Identify business domain boundaries
- [ ] Check for domain logic in wrong packages
- [ ] **OUTPUT:** Create `PHASE_4B_DOMAIN_AUDIT.md`

### Step 2: Design Target Structure
- [ ] Define domain categories (cart, products, auth, orders, users, payments, shared)
- [ ] Plan file organization for each domain
- [ ] Ensure no framework-specific code in domain logic
- [ ] **OUTPUT:** Document target structure in audit file

### Step 3: Generate Import Mapping
- [ ] Create `phase4b-import-map.json`
- [ ] Map every file: current path → target path
- [ ] Include new files that need to be created
- [ ] **OUTPUT:** Complete JSON mapping file

### Step 4: Copy Files to New Structure
- [ ] Create PowerShell script `copy-phase4b-files.ps1`
- [ ] Copy all files to new locations
- [ ] Create index.ts for each domain
- [ ] **DO NOT DELETE old files yet**
- [ ] **OUTPUT:** Log which files were copied

### Step 5: Update package.json Exports
- [ ] Update `packages/domain/package.json`
- [ ] Add exports for each domain (./cart, ./products, etc.)
- [ ] **OUTPUT:** Show the exports section

### Step 6: Create Import Fix Scripts
- [ ] Create `fix-phase4b-domain-imports.ps1` (internal domain imports)
- [ ] Create `fix-phase4b-app-imports.ps1` (@repo/domain imports from apps)
- [ ] Create `fix-phase4b-package-imports.ps1` (imports from other packages)
- [ ] Create `fix-phase4b-index.ps1` (main index.ts exports)
- [ ] **OUTPUT:** Show script contents

### Step 7: Run Import Fix Scripts
- [ ] Execute `.\fix-phase4b-domain-imports.ps1`
- [ ] Execute `.\fix-phase4b-app-imports.ps1`
- [ ] Execute `.\fix-phase4b-package-imports.ps1`
- [ ] Execute `.\fix-phase4b-index.ps1`
- [ ] **OUTPUT:** Log all files changed by each script

### Step 8: Fix Edge Cases
- [ ] Search for remaining broken imports
- [ ] Fix any patterns the scripts missed
- [ ] Check for circular dependencies
- [ ] **OUTPUT:** Document edge cases found and fixed

### Step 9: Test Domain Package Build
- [ ] Run `cd K:\driplo-turbo-1\packages\domain && pnpm run build`
- [ ] **OUTPUT:** Build result (success/failure)
- [ ] If failure: show errors and fix them

### Step 10: Test Monorepo Build
- [ ] Run `cd K:\driplo-turbo-1 && pnpm run build`
- [ ] **OUTPUT:** Build result
- [ ] Ignore pre-existing cyclic dependency warnings

### Step 11: Test Dev Server ⚠️ CRITICAL
- [ ] Run `cd K:\driplo-turbo-1 && pnpm --filter @repo/web dev`
- [ ] Verify server starts on http://localhost:5173/
- [ ] Check for console errors related to domain imports
- [ ] **OUTPUT:** Server status (working/broken)
- [ ] **⚠️ IF BROKEN: STOP and fix issues before proceeding**

### Step 12: Delete Old Files
- [ ] **ONLY after Step 11 passes!**
- [ ] Delete old domain files from packages/domain/src/
- [ ] **OUTPUT:** List all files deleted

### Step 13: Rebuild, Re-test, Commit
- [ ] Run `pnpm run build` again
- [ ] Test dev server again
- [ ] Stage changes: `git add .`
- [ ] Commit with descriptive message
- [ ] **OUTPUT:** Commit hash and summary

---

## 🚨 CRITICAL RULES

**NEVER:**
- ❌ Delete old files before Step 11 (dev server test) passes
- ❌ Use manual find/replace for imports (use PowerShell scripts)
- ❌ Skip dev server testing
- ❌ Commit broken state
- ❌ Make multiple commits (one commit at the end)

**ALWAYS:**
- ✅ Use PowerShell scripts for systematic import fixes
- ✅ Keep old files as backup until testing passes
- ✅ Document what you do in each step
- ✅ Test builds before deleting files
- ✅ Test dev server before cleanup

---

## 📊 OUTPUT FORMAT

After completing ALL 13 steps, provide a summary:

```markdown
# Phase 4B Execution Report

## Status: [✅ SUCCESS / ❌ FAILED]

## Summary
- Files moved: X
- Imports fixed: Y
- Domains created: Z
- Build status: [PASS/FAIL]
- Dev server status: [WORKING/BROKEN]
- Commit hash: [hash]

## Step-by-Step Execution

### Step 1: Audit
- [What you did]
- [Files found]
- [Domains identified]

### Step 2: Design
- [Target structure]
- [Domain boundaries]

[... continue for all 13 steps ...]

## Files Created
1. PHASE_4B_DOMAIN_AUDIT.md
2. phase4b-import-map.json
3. copy-phase4b-files.ps1
4. fix-phase4b-domain-imports.ps1
5. fix-phase4b-app-imports.ps1
6. fix-phase4b-package-imports.ps1
7. fix-phase4b-index.ps1

## Changes Made
- [List major changes]

## Issues Encountered
- [Any problems and how you fixed them]

## Verification Checklist
- [ ] Domain package builds
- [ ] Monorepo builds
- [ ] Dev server runs
- [ ] No broken imports
- [ ] Old files deleted
- [ ] Changes committed

## Ready for Copilot Audit
This implementation is ready for GitHub Copilot to review and audit.
```

---

## 🎯 SUCCESS CRITERIA

Your implementation passes if:
- ✅ All 13 steps completed
- ✅ Domain package organized by boundaries
- ✅ All imports fixed (0 broken imports)
- ✅ package.json exports updated
- ✅ Domain package builds successfully
- ✅ Monorepo builds successfully
- ✅ **Dev server runs without errors** ← MOST CRITICAL
- ✅ Old files deleted after testing
- ✅ Changes committed to git with good message

---

## 💡 TIPS FOR SUCCESS

**From Phase 4A success:**
1. Create complete import mapping BEFORE moving files
2. Use PowerShell for all import fixes (systematic, repeatable)
3. Test early, test often
4. Keep old files until dev server confirms everything works
5. One clean commit at the end

**PowerShell patterns that worked:**
```powershell
# File copying
$importMap = Get-Content "phase4b-import-map.json" | ConvertFrom-Json
Copy-Item -Path $source -Destination $target -Force

# Import fixing with regex
$content = Get-Content $file -Raw
$content = $content -replace [regex]::Escape($old), $new
Set-Content -Path $file -Value $content -NoNewline

# Finding broken imports
Get-ChildItem -Recurse -Include "*.ts","*.svelte" |
    Select-String -Pattern "broken-import-pattern"
```

---

## 🔍 WHAT GITHUB COPILOT WILL AUDIT

After you finish, Copilot will verify:
1. ✅ Did you follow all 13 steps?
2. ✅ Is the domain structure correct?
3. ✅ Are all imports fixed?
4. ✅ Does the dev server work?
5. ✅ Is the code quality good?
6. ✅ Are domain boundaries clean?
7. ✅ Did you test thoroughly?
8. ✅ Is the commit message descriptive?

**Be thorough!** Document everything you do so Copilot can audit your work.

---

## 🚀 BEGIN EXECUTION

Start with Step 1: Read `PHASE_4B_FRESH_START_PROMPT.md` and audit the domain package.

Document your progress as you go. Good luck! 🤖

---

## 📝 NOTES

- You have unlimited tokens, so be thorough
- Don't rush - quality over speed
- If something breaks, stop and fix it
- Test frequently throughout execution
- The goal is a working monorepo, not just moved files

**Remember:** Your work will be audited by Copilot. Make them proud! 💚
