# 🤖 Claude CLI Agent: Execute Phase 4C - Core Package Audit & Verification

## 🎯 YOUR MISSION

You are a **systematic execution agent**. Your job is to audit and verify the `packages/core` package to ensure it remains **framework-agnostic** and properly structured.

**Your output will be audited by GitHub Copilot**, so be thorough and document everything you do.

---

## 📋 CRITICAL CONTEXT

**Monorepo:** `K:\driplo-turbo-1\` (SvelteKit 2 + Turborepo)  
**Shell:** PowerShell (Windows)  
**Phase Status:**
- ✅ Phase 4A Complete: UI package restructured (174 components)
- ✅ Phase 4B Complete: Domain package restructured (7 domains)
- ⏳ Phase 4C: Core package audit (YOU ARE HERE)

**Current State:**
- Core package is framework-agnostic (Phase 1 complete)
- Need to verify NO framework contamination
- Need to ensure proper exports
- Dev server works on http://localhost:5173/

---

## 📚 EXECUTION PLAN

**Primary reference:** This file contains your complete checklist below.

**For additional context, read:** `K:\driplo-turbo-1\PHASE_4_COMPLETE_RESTRUCTURE.md` (lines 100-150)
- Core package requirements
- Framework independence rules
- Export structure expectations

**You can execute from this file alone**, but reading the detailed plan will help you understand the "why" behind each step.

---

## 🎓 LESSONS FROM PHASE 4A & 4B

**What worked perfectly:**
- Systematic audit before making changes
- Creating import mapping JSON for tracking
- Using PowerShell scripts for systematic fixes
- Testing builds before claiming completion
- Testing dev server to ensure nothing broke
- Single commit at the end with excellent message

**What to avoid:**
- ❌ Manual import fixes (error-prone)
- ❌ Making changes without audit first
- ❌ Skipping verification steps
- ❌ Multiple commits during execution

---

## ✅ YOUR CHECKLIST (10 Steps)

Follow these 10 steps **in order**. After each step, document what you found.

### Step 1: Audit Core Package Structure ⏳
**Goal:** Understand current state and verify framework independence.

**Actions:**
- [ ] Read entire `packages/core/src/` directory
- [ ] List all files with their purposes
- [ ] Check directory structure matches requirements:
  ```
  packages/core/
  ├── src/
  │   ├── utils/         # Pure functions only
  │   ├── services/      # Framework-agnostic services
  │   ├── validation/    # Zod schemas
  │   └── types/         # TypeScript types
  ├── package.json
  └── tsconfig.json
  ```
- [ ] **OUTPUT:** Create `PHASE_4C_CORE_AUDIT.md`

### Step 2: Check Framework Independence ⏳
**Goal:** Verify NO framework-specific code exists.

**Actions:**
- [ ] Search for Svelte imports: `from 'svelte'`
- [ ] Search for SvelteKit imports: `from '$app/*'`, `from '$env/*'`
- [ ] Search for @sveltejs imports: `from '@sveltejs/*'`
- [ ] Search for Supabase client usage: `createClient(`, `new SupabaseClient`
- [ ] Search for browser-specific code: `window.`, `document.`, `localStorage`
- [ ] **CRITICAL:** Core must be 100% framework-agnostic!
- [ ] **OUTPUT:** Document all findings in audit file

**Expected result:** ZERO matches for any framework-specific code.

### Step 3: Verify Export Structure ⏳
**Goal:** Ensure package.json exports are properly configured.

**Actions:**
- [ ] Check `packages/core/package.json` exports section
- [ ] Verify main export points to correct files
- [ ] Verify utils, services, validation, types exports
- [ ] Check if any exports are missing or incorrect

**Target exports structure:**
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
    "./services": {
      "types": "./dist/services/index.d.ts",
      "default": "./dist/services/index.js"
    },
    "./validation": {
      "types": "./dist/validation/index.d.ts",
      "default": "./dist/validation/index.js"
    },
    "./types": {
      "types": "./dist/types/index.d.ts",
      "default": "./dist/types/index.js"
    }
  }
}
```

- [ ] **OUTPUT:** Document current vs. target exports

### Step 4: Check Dependencies ⏳
**Goal:** Verify dependencies are framework-agnostic.

**Actions:**
- [ ] Check `packages/core/package.json` dependencies
- [ ] Verify NO Svelte or SvelteKit in dependencies
- [ ] Verify NO Supabase client in dependencies (types OK)
- [ ] Allowed dependencies: TypeScript, Zod, pure JS libraries
- [ ] **OUTPUT:** List all dependencies and verify each is appropriate

### Step 5: Audit Import Usage Across Monorepo ⏳
**Goal:** See how core package is being used.

**Actions:**
- [ ] Search for `@repo/core` imports across apps/
- [ ] Search for `@repo/core` imports across packages/
- [ ] Check if imports are using correct paths:
  - ✅ `from '@repo/core/utils'`
  - ✅ `from '@repo/core/services'`
  - ❌ `from '@repo/core/src/utils'`
- [ ] **OUTPUT:** Document import patterns and any issues

### Step 6: Test Core Package Build ⏳
**Goal:** Verify core package builds successfully.

**Actions:**
```powershell
cd K:\driplo-turbo-1\packages\core
pnpm run build
```

- [ ] Verify build completes without errors
- [ ] Check TypeScript compilation: `pnpm run check-types`
- [ ] **OUTPUT:** Build result (success/failure)

### Step 7: Check for Type Errors ⏳
**Goal:** Ensure no TypeScript errors in core package.

**Actions:**
- [ ] Run TypeScript compiler on core package
- [ ] Check for any `any` types that should be properly typed
- [ ] Verify type exports are correct
- [ ] **OUTPUT:** TypeScript error count (should be 0)

### Step 8: Verify No Circular Dependencies ⏳
**Goal:** Ensure core doesn't depend on domain or ui.

**Actions:**
- [ ] Check imports in core package
- [ ] Verify core DOES NOT import from @repo/ui
- [ ] Verify core DOES NOT import from @repo/domain
- [ ] Core can only import from @repo/database (types only)
- [ ] **OUTPUT:** Document any violations

**Dependency rules:**
```
core → database (types only) ✅
core → ui ❌ FORBIDDEN
core → domain ❌ FORBIDDEN
```

### Step 9: Update Exports if Needed ⏳
**Goal:** Fix any export issues found in Step 3.

**Actions:**
- [ ] If exports are incorrect, update `packages/core/package.json`
- [ ] If files are missing index.ts, create them
- [ ] Test exports work: Try importing from each export path
- [ ] **OUTPUT:** List any changes made

**Only if changes needed!** If exports are already correct, skip to Step 10.

### Step 10: Create Summary & Commit ⏳
**Goal:** Document findings and commit any changes.

**Actions:**
- [ ] Complete `PHASE_4C_CORE_AUDIT.md` with:
  - Current structure analysis
  - Framework independence verification
  - Export structure verification
  - Dependency audit
  - Import usage patterns
  - Issues found (if any)
  - Recommendations
- [ ] If changes were made: Rebuild core package
- [ ] If changes were made: Test monorepo build
- [ ] Commit changes (if any) OR document "no changes needed"
- [ ] **OUTPUT:** Commit hash OR "No changes required" message

**Commit message format (if changes made):**
```
Phase 4C: Core package audit and verification

## Summary
Audited packages/core for framework independence and proper structure.

## Findings
- Framework independence: [PASS/FAIL]
- Export structure: [CORRECT/FIXED]
- Dependencies: [CLEAN/ISSUES FOUND]
- Type safety: [X errors found and fixed]

## Changes Made (if any)
- [List changes]

## Verification
✅ Core package builds successfully
✅ No framework-specific code
✅ Exports properly configured
✅ Dependencies are framework-agnostic
✅ No circular dependencies
```

---

## 🚨 CRITICAL RULES

**NEVER:**
- ❌ Add framework-specific code to core package
- ❌ Import from @repo/ui or @repo/domain in core
- ❌ Add Svelte or SvelteKit dependencies
- ❌ Skip framework independence checks
- ❌ Claim success without verifying builds

**ALWAYS:**
- ✅ Verify framework independence thoroughly
- ✅ Document all findings in audit file
- ✅ Test builds before claiming completion
- ✅ Keep core package pure and framework-agnostic

---

## 📊 OUTPUT FORMAT

After completing ALL 10 steps, provide a summary:

```markdown
# Phase 4C Execution Report

## Status: [✅ AUDIT COMPLETE / ⚠️ ISSUES FOUND / ❌ FAILED]

## Summary
[Brief overview of what was found]

## Framework Independence Check
- Svelte imports: [0 found ✅]
- SvelteKit imports: [0 found ✅]
- Browser-specific code: [0 found ✅]
- Supabase client usage: [0 found ✅]
- **Result:** [PASS/FAIL]

## Export Structure
- Current exports: [list]
- Required exports: [list]
- **Status:** [CORRECT / NEEDS FIXING]
- Changes made: [list if any]

## Dependencies Audit
- Total dependencies: X
- Framework-agnostic: [YES/NO]
- Issues found: [list if any]

## Import Usage
- Apps using @repo/core: [count]
- Packages using @repo/core: [count]
- Correct import paths: [YES/NO]
- Issues found: [list if any]

## Build Verification
- Core package build: [✅ PASS / ❌ FAIL]
- TypeScript errors: [0]
- Type exports: [WORKING]

## Circular Dependencies
- Core → UI: [NONE ✅]
- Core → Domain: [NONE ✅]
- Core → Database: [Types only ✅]

## Step-by-Step Execution

### Step 1: Audit Structure
[What you found]

### Step 2: Framework Independence
[Results of searches]

[... continue for all 10 steps ...]

## Files Created
1. PHASE_4C_CORE_AUDIT.md

## Changes Made
- [List changes if any]
- [OR: "No changes required - core package already properly structured"]

## Issues Encountered
- [Any problems found]
- [How you addressed them]

## Recommendations
- [Suggestions for improvement]
- [Or: "Core package follows all best practices"]

## Verification Checklist
- [ ] Framework independence verified
- [ ] Exports properly configured
- [ ] Dependencies are clean
- [ ] No TypeScript errors
- [ ] No circular dependencies
- [ ] Builds successfully
- [ ] Documentation complete

## Ready for Copilot Audit
This audit is ready for GitHub Copilot to review and verify.
```

---

## 🎯 SUCCESS CRITERIA

Your audit passes if:
- ✅ Zero framework-specific imports found
- ✅ Exports properly configured
- ✅ Dependencies are framework-agnostic only
- ✅ Core package builds successfully
- ✅ No TypeScript errors
- ✅ No circular dependencies with ui/domain
- ✅ Documentation complete

---

## 💡 TIPS FOR SUCCESS

**This is primarily an AUDIT, not a restructure:**
- Focus on verification and documentation
- Only make changes if issues are found
- If core is already correct, document that
- Be thorough in your searches

**Framework Independence Searches:**
```powershell
# Search for Svelte imports
rg "from ['\"]svelte" packages/core/src/

# Search for SvelteKit imports
rg "from ['\"]\\$app" packages/core/src/
rg "from ['\"]\\$env" packages/core/src/

# Search for browser APIs
rg "(window\.|document\.|localStorage)" packages/core/src/

# Search for Supabase client
rg "createClient|new SupabaseClient" packages/core/src/
```

---

## 🔍 WHAT GITHUB COPILOT WILL AUDIT

After you finish, Copilot will verify:
1. ✅ Is core truly framework-agnostic?
2. ✅ Are exports properly configured?
3. ✅ Are dependencies clean?
4. ✅ Did you document findings thoroughly?
5. ✅ Were any changes needed? If so, were they correct?
6. ✅ Does core package build?
7. ✅ Is audit documentation complete?

**Be thorough!** This is a verification phase, so accuracy matters more than speed.

---

## 🚀 BEGIN EXECUTION

Start with Step 1: Audit the `packages/core/src/` directory structure and create `PHASE_4C_CORE_AUDIT.md`.

Document your findings as you go. Good luck! 🤖

---

## 📝 NOTES

- Phase 4C is primarily an **audit and verification phase**
- You may find core is already perfect (that's OK!)
- Document everything, even if no changes are needed
- This ensures core package foundation is solid for future phases
- Typical execution time: ~20-30 minutes

**Remember:** Your work will be audited by Copilot. Make them proud! 💚
