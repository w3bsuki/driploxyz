# PHASE 4 EXECUTION - NEW CHAT PROMPT

Copy this into a new chat to execute Phase 4 in safe, testable increments.

---

## 🎯 CONTEXT FOR CLAUDE

I have a Turborepo monorepo with SvelteKit 2 + Svelte 5 that needs complete restructuring to match `IDEAL_STRUCTURE.md`.

**Completed phases:**
- ✅ Phase 1: Framework-agnostic @repo/core
- ✅ Phase 2: Route colocation (84% reduction)
- ✅ Phase 3: Package architecture organized

**Current state:**
- 7 packages: ui, core, domain, database, i18n, testing, eslint-config, typescript-config
- 3 apps: web, admin, docs
- 174 UI components scattered incorrectly
- 6,222 lines in PROJECT_SITEMAP.md (massive bloat)
- Many files in wrong locations

**Project location:** `K:/driplo-turbo-1`

**The plan:** Execute `PHASE_4_COMPLETE_RESTRUCTURE.md` in 5 safe phases with testing after each.

---

## 📋 PHASE 4A: PACKAGES RESTRUCTURE (8-10 hours)

### Your task:
Execute **Part A** from `PHASE_4_COMPLETE_RESTRUCTURE.md`:

1. **Read the complete plan:**
   - Read `K:/driplo-turbo-1/PHASE_4_COMPLETE_RESTRUCTURE.md` (full file)
   - Read `K:/driplo-turbo-1/IDEAL_STRUCTURE.md` (full file)
   - Use Svelte MCP for SvelteKit best practices

2. **Audit current package structures:**
   - List directories for all 7 packages
   - Identify files in wrong locations
   - Create TODO list for moves needed

3. **Execute packages restructure:**
   - **packages/ui:** Reorganize 174 components → primitives/compositions/layouts
     - Move server-only code → `lib/server/`
     - Eliminate barrel files
     - Fix type locations
     - Update package.json exports
   - **packages/core:** Audit framework-agnostic guarantees (should be stable)
   - **packages/domain:** Verify business logic boundaries
   - **packages/database:** Verify type exports (should be stable)
   - **packages/i18n:** Verify structure (NO routing logic)
   - **packages/testing, configs:** Verify minimal structure

4. **Fix package-level imports:**
   - Update imports within packages
   - Update exports in package.json files
   - Ensure TypeScript can resolve types

5. **Test Phase 4A:**
   ```powershell
   cd K:/driplo-turbo-1
   pnpm run build           # Must succeed
   pnpm run check           # Must pass
   pnpm run test            # Must pass (or show which tests need updating)
   ```

6. **Commit Phase 4A:**
   ```powershell
   git add -A
   git commit -m "Phase 4A: Packages restructure complete"
   ```

### Success criteria:
- ✅ All 7 packages match IDEAL_STRUCTURE.md structure
- ✅ package.json exports updated correctly
- ✅ No broken imports within packages
- ✅ Build passes
- ✅ TypeScript check passes
- ✅ Committed to git

### When done:
**STOP and report:**
- What you moved
- What you fixed
- Test results
- Any issues encountered

Then I'll review and tell you to proceed to Phase 4B.

---

## 📋 PHASE 4B: APPS/WEB RESTRUCTURE (8-12 hours)

**Start this in a NEW chat after Phase 4A is complete and tested.**

### Your task:
Execute **Part B (apps/web only)** from `PHASE_4_COMPLETE_RESTRUCTURE.md`:

1. **Read the complete plan again:**
   - Refresh context from `PHASE_4_COMPLETE_RESTRUCTURE.md`
   - Read `IDEAL_STRUCTURE.md` 
   - Check git log to see what Phase 4A changed

2. **Audit apps/web structure:**
   - List all routes
   - List all components in lib/
   - Identify server code not in $lib/server/
   - Identify route-specific components not colocated
   - Create TODO list for moves

3. **Execute apps/web restructure:**
   - **Create layout groups:** `(app)/(shop)`, `(app)/(account)`, `(auth)`, `(marketing)`
   - **Move routes** to appropriate layout groups
   - **Colocate route-specific components** with their routes
   - **Move server code** to `$lib/server/`
   - **Reorganize $lib/components/** (keep only truly shared)
   - **Fix i18n integration** (use handle hook, not over-engineered routing)

4. **Update apps/web imports:**
   - Fix imports for moved routes
   - Fix imports for colocated components
   - Fix imports for server code
   - Update any broken `@repo/*` imports

5. **Test Phase 4B:**
   ```powershell
   cd K:/driplo-turbo-1/apps/web
   pnpm run dev             # Must start successfully
   # Test major routes in browser:
   # - Homepage (/)
   # - Search (/search)
   # - Product page (/products/[slug])
   # - Cart (/cart)
   # - Login (/login)
   
   pnpm run build           # Must succeed
   pnpm run check           # Must pass
   ```

6. **Commit Phase 4B:**
   ```powershell
   git add -A
   git commit -m "Phase 4B: apps/web restructure complete"
   ```

### Success criteria:
- ✅ apps/web matches IDEAL_STRUCTURE.md
- ✅ Layout groups properly structured
- ✅ Route-specific components colocated
- ✅ Server code in $lib/server/
- ✅ All routes accessible
- ✅ Build passes
- ✅ Dev server runs
- ✅ Committed to git

### When done:
**STOP and report:**
- What you restructured
- What you moved
- Test results
- Any issues

Then I'll review and tell you to proceed to Phase 4C.

---

## 📋 PHASE 4C: APPS/ADMIN + GLOBAL IMPORTS (3-5 hours)

**Start this in a NEW chat after Phase 4B is complete and tested.**

### Your task:
Execute **Part B (apps/admin)** + **Part C** from `PHASE_4_COMPLETE_RESTRUCTURE.md`:

1. **Restructure apps/admin:**
   - Apply same patterns as apps/web
   - Create layout groups for dashboard
   - Move server code to $lib/server/
   - Update imports

2. **Global import fixes:**
   - Search for broken imports across entire monorepo
   - Fix all `@repo/*` imports
   - Fix all `$lib/*` imports
   - Fix all relative imports
   - Use search patterns from Part C

3. **Test Phase 4C:**
   ```powershell
   cd K:/driplo-turbo-1
   pnpm run build           # ALL apps must build
   pnpm run check           # Must pass
   pnpm run test            # Must pass
   
   # Test both apps:
   cd apps/web
   pnpm run dev
   # (test in browser)
   
   cd apps/admin
   pnpm run dev
   # (test in browser)
   ```

4. **Commit Phase 4C:**
   ```powershell
   git add -A
   git commit -m "Phase 4C: apps/admin restructure + global import fixes"
   ```

### Success criteria:
- ✅ apps/admin matches IDEAL_STRUCTURE.md
- ✅ ALL imports resolve across monorepo
- ✅ No TypeScript errors
- ✅ Both apps build successfully
- ✅ Both apps run in dev mode
- ✅ Committed to git

### When done:
**STOP and report:**
- Import fixes made
- Test results
- Any remaining issues

Then I'll review and tell you to proceed to Phase 4D.

---

## 📋 PHASE 4D: WHITELIST + NUCLEAR CLEANUP (2-3 hours)

**Start this in a NEW chat after Phase 4C is complete and tested.**

⚠️ **THIS IS THE NUCLEAR PHASE - BACKUP FIRST!**

### Your task:
Execute **Part D** from `PHASE_4_COMPLETE_RESTRUCTURE.md`:

1. **BACKUP FIRST:**
   ```powershell
   # Create backup
   Copy-Item -Path "K:/driplo-turbo-1" -Destination "K:/driplo-turbo-1-backup-before-nuke" -Recurse
   
   # Verify backup exists
   Test-Path "K:/driplo-turbo-1-backup-before-nuke"
   ```

2. **Generate whitelist:**
   - Create PowerShell script to list all files in correct locations
   - Include all packages/* correct files
   - Include all apps/* correct files
   - Save to `whitelist.txt`

3. **Identify bloat:**
   - Find all source files NOT in whitelist
   - Exclude node_modules, dist, .svelte-kit
   - Save to `bloat-to-delete.txt`
   - **Show me the list BEFORE deleting**

4. **Review together:**
   - I'll review the bloat list
   - Confirm it's safe to delete
   - Then you proceed

5. **Nuclear cleanup:**
   - Delete files in bloat list
   - Remove empty directories
   - Clean up

6. **Test Phase 4D:**
   ```powershell
   cd K:/driplo-turbo-1
   pnpm run build           # Must succeed
   pnpm run check           # Must pass
   pnpm run test            # Must pass
   
   # Test both apps
   cd apps/web
   pnpm run dev
   
   cd apps/admin
   pnpm run dev
   ```

7. **Commit Phase 4D:**
   ```powershell
   git add -A
   git commit -m "Phase 4D: Nuclear cleanup - removed bloat"
   ```

### Success criteria:
- ✅ Bloat identified and deleted
- ✅ PROJECT_SITEMAP.md reduced by 70%+ (6,222 → ~1,500-2,000)
- ✅ Everything still builds
- ✅ Everything still works
- ✅ Clean minimal structure
- ✅ Committed to git

### When done:
**STOP and report:**
- How many files deleted
- Before/after line counts
- Test results

Then I'll review and tell you to proceed to Phase 4E.

---

## 📋 PHASE 4E: FINAL VERIFICATION (1-2 hours)

**Start this in a NEW chat after Phase 4D is complete.**

### Your task:
Execute **Part E** from `PHASE_4_COMPLETE_RESTRUCTURE.md`:

1. **Structure verification:**
   - Check all packages match IDEAL_STRUCTURE.md
   - Check all apps match IDEAL_STRUCTURE.md
   - Verify server-only code locations
   - Verify route colocation
   - Verify layout groups

2. **Import verification:**
   - Search for broken imports
   - Verify all @repo/* imports work
   - Verify all $lib/* imports work
   - Verify TypeScript types resolve

3. **Functionality verification:**
   - Build all packages
   - Build all apps
   - Run type checking
   - Run tests
   - Test major user flows in browser

4. **Dependency verification:**
   - Check dependency graph follows rules
   - No circular dependencies
   - No forbidden imports (core importing ui, etc.)

5. **Generate new PROJECT_SITEMAP.md:**
   ```powershell
   # Re-generate sitemap to see size reduction
   # Should be ~1,500-2,000 lines instead of 6,222
   ```

6. **Create Phase 4 summary document:**
   - What was moved
   - What was deleted
   - Before/after metrics
   - Known issues (if any)
   - Next steps (Phase 5)

7. **Final commit:**
   ```powershell
   git add -A
   git commit -m "Phase 4E: Final verification and documentation"
   git tag "phase-4-complete"
   ```

### Success criteria:
- ✅ ALL structure verification checks pass
- ✅ ALL import verification checks pass
- ✅ ALL functionality tests pass
- ✅ ALL dependency rules followed
- ✅ PROJECT_SITEMAP.md reduced 70%+
- ✅ Documentation complete
- ✅ Tagged in git

### When done:
**REPORT PHASE 4 COMPLETE!**
- Summary of changes
- Metrics (files moved, deleted, reduced)
- Test results
- Ready for Phase 5 (multi-region backend)

---

## 🎯 SUMMARY: How to Use This

1. **Phase 4A:** New chat → Copy "Phase 4A" section → Execute → Test → STOP
2. **Phase 4B:** New chat → Copy "Phase 4B" section → Execute → Test → STOP  
3. **Phase 4C:** New chat → Copy "Phase 4C" section → Execute → Test → STOP
4. **Phase 4D:** New chat → Copy "Phase 4D" section → Execute → Test → STOP (⚠️ NUCLEAR)
5. **Phase 4E:** New chat → Copy "Phase 4E" section → Verify → Document → DONE! 🎉

## Why This Approach?

- ✅ **Safe** - Test after each phase, rollback if needed
- ✅ **Efficient** - Fresh context for each phase
- ✅ **Trackable** - Git commits show progress
- ✅ **Flexible** - Can pause between phases
- ✅ **Reviewable** - You see results before next phase

## Estimated Timeline

- **Phase 4A:** 8-10 hours (packages)
- **Phase 4B:** 8-12 hours (apps/web)
- **Phase 4C:** 3-5 hours (apps/admin + imports)
- **Phase 4D:** 2-3 hours (nuclear cleanup) ⚠️
- **Phase 4E:** 1-2 hours (verification)

**Total:** 22-32 hours across 5 separate chat sessions

---

## 🚀 Ready to Start?

Copy the **Phase 4A** section above into a new chat to begin!
