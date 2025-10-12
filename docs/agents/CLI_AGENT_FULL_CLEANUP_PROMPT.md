# GitHub Copilot CLI Agent - Full Cleanup & Restructuring

**Mission:** Execute filesystem cleanup, restructuring, and manual validation  
**Agent Type:** GitHub Copilot CLI (NO MCP access, but now has Supabase/Svelte/Context7 MCPs!)  
**Workspace:** `K:\driplo-turbo-1`  
**Duration:** ~12-16 hours  
**Coordination:** Working in parallel with GitHub Copilot Chat (file operations)

---

## 🎯 YOUR OBJECTIVE

**PRIMARY GOAL:**  
Clean up project structure, move business logic, consolidate scripts, and validate all changes.

**YOUR RESPONSIBILITIES (You now have MCP access!):**
- ✅ Root directory cleanup (move docs/scripts)
- ✅ Business logic migration (UI → apps/web)
- ✅ Script consolidation/deletion
- ✅ Package export definitions
- ✅ Manual browser testing
- ✅ TypeScript validation
- ✅ Supabase MCP for DB verification
- ✅ Svelte MCP for component validation

**CHAT AGENT RESPONSIBILITIES (Also has MCP access):**
- ✅ Translation system fixes (hardcoded strings)
- ✅ Paraglide v2 optimization (code splitting)
- ✅ Package architecture changes
- ✅ Type definition updates

---

## 🔧 MCP TOOLS AVAILABLE TO YOU

### Supabase MCP
- `mcp_supabase_list_projects` — Get Supabase project ID
- `mcp_supabase_list_tables` — Verify schema
- `mcp_supabase_execute_sql` — Run validation queries
- `mcp_supabase_get_logs` — Check for errors

### Svelte MCP
- `mcp_svelte_list-sections` — Find relevant docs
- `mcp_svelte_get-documentation` — SvelteKit best practices
- `mcp_svelte_svelte-autofixer` — Validate Svelte code

### Context7 MCP
- `mcp_context7_resolve-library-id` — Find library docs
- `mcp_context7_get-library-docs` — Turborepo patterns

---

## 📋 EXECUTION TASKS

### **Phase 1: Root Directory Cleanup (2-3 hours) 🔴**

#### Task 1.1: Move Documentation Files
**Goal:** Organize 48 markdown files into proper structure

**Steps:**
1. Create directory structure:
   ```powershell
   New-Item -ItemType Directory -Path "docs/planning" -Force
   New-Item -ItemType Directory -Path "docs/agents" -Force
   New-Item -ItemType Directory -Path "docs/audits" -Force
   ```

2. Move PHASE_*.md files:
   ```powershell
   Move-Item -Path "PHASE_*.md" -Destination "docs/planning/"
   ```

3. Move CLAUDE_*.md and COPILOT_*.md files:
   ```powershell
   Move-Item -Path "CLAUDE_*.md" -Destination "docs/agents/"
   Move-Item -Path "COPILOT_*.md" -Destination "docs/agents/"
   ```

4. Move audit files:
   ```powershell
   Move-Item -Path "*_AUDIT*.md" -Destination "docs/audits/"
   Move-Item -Path "PROJECT_AUDIT.md" -Destination "docs/audits/"
   ```

**Expected Output:**
```
✅ docs/planning/ created (20+ files)
✅ docs/agents/ created (10+ files)
✅ docs/audits/ created (8+ files)
✅ Root directory reduced from 80+ to ~40 files
```

**ANNOUNCE TO CHAT:**
> "🔄 Documentation cleanup Phase 1 complete - root docs organized"

---

#### Task 1.2: Move Script Files
**Goal:** Organize 15+ PowerShell scripts

**Steps:**
1. Create script directories:
   ```powershell
   New-Item -ItemType Directory -Path "scripts/migration" -Force
   New-Item -ItemType Directory -Path "scripts/analysis" -Force
   ```

2. Move fix-*.ps1 and copy-*.ps1:
   ```powershell
   Move-Item -Path "fix-*.ps1" -Destination "scripts/migration/"
   Move-Item -Path "copy-*.ps1" -Destination "scripts/migration/"
   Move-Item -Path "update-*.ps1" -Destination "scripts/migration/"
   ```

3. Move analysis scripts:
   ```powershell
   Move-Item -Path "analyze-*.ps1" -Destination "scripts/analysis/"
   Move-Item -Path "generate-*.ps1" -Destination "scripts/analysis/"
   ```

**Expected Output:**
```
✅ scripts/migration/ created (12+ files)
✅ scripts/analysis/ created (3+ files)
✅ Root directory reduced to ~25 files
```

**ANNOUNCE TO CHAT:**
> "🔄 Script cleanup complete - organized into migration/analysis folders"

---

#### Task 1.3: Move Artifact Files
**Goal:** Organize JSON map files

**Steps:**
1. Create artifacts directory (gitignore):
   ```powershell
   New-Item -ItemType Directory -Path ".artifacts" -Force
   Add-Content -Path ".gitignore" -Value "`n.artifacts/"
   ```

2. Move phase4*-map.json files:
   ```powershell
   Move-Item -Path "phase4*.json" -Destination ".artifacts/"
   ```

**Expected Output:**
```
✅ .artifacts/ created (gitignored)
✅ 7 JSON map files moved
✅ Root directory reduced to ~18 core files
```

**ANNOUNCE TO CHAT:**
> "🔄 Root directory cleanup COMPLETE - 80+ files → 18 files"

---

### **Phase 2: Business Logic Migration (4-6 hours) 🔴**

#### Task 2.1: Verify Current Import Usage
**Goal:** Understand what imports `SocialLinksEditor` and `PayoutMethodSelector`

**Use Svelte MCP:**
```typescript
// Use mcp_svelte_get-documentation with section: "kit/project-structure"
// to understand proper component organization
```

**Steps:**
1. Search for imports:
   ```powershell
   Select-String -Path "apps\web\src\**\*.svelte" -Pattern "SocialLinksEditor|PayoutMethodSelector" -Recurse
   ```

2. Document ALL files that import these components

**Expected Output:**
```
✅ List of 5-10 files importing business components
✅ Understanding of usage patterns
```

---

#### Task 2.2: Create Business Components Directory
**Goal:** Prepare destination for business logic

**Steps:**
1. Create directory:
   ```powershell
   New-Item -ItemType Directory -Path "apps\web\src\lib\components\business" -Force
   ```

2. **ANNOUNCE TO CHAT:**
   > "🔄 Business components directory created - ready for migration"

3. **WAIT FOR CHAT:**
   > Chat will move the files and update imports

---

#### Task 2.3: Verify Migration Success
**Goal:** Ensure no broken imports

**Steps:**
1. Run TypeScript check:
   ```powershell
   cd apps/web
   pnpm exec tsc --noEmit
   ```

2. Check for import errors:
   ```powershell
   # Should see ZERO errors related to SocialLinksEditor or PayoutMethodSelector
   ```

3. Use Svelte MCP to validate components:
   ```typescript
   // Use mcp_svelte_svelte-autofixer to validate moved components
   // Check for any Svelte-specific issues
   ```

**Expected Output:**
```
✅ No TypeScript errors
✅ All imports resolved correctly
✅ Components validate with Svelte autofixer
```

---

### **Phase 3: Package Export Definitions (2-3 hours) 🟡**

#### Task 3.1: Define UI Package Exports
**Goal:** Create clean import paths

**Use Context7 MCP:**
```typescript
// Use mcp_context7_get-library-docs for /vercel/turborepo
// Topic: "package exports internal packages best practices"
```

**Steps:**
1. Read Turborepo docs for package exports pattern
2. **ANNOUNCE TO CHAT:**
   > "🔄 Ready to update UI package exports - need Chat to edit package.json"

3. **WAIT FOR CHAT:**
   > Chat will update `packages/ui/package.json` with exports field

4. Verify exports work:
   ```powershell
   # Test import resolution
   cd apps/web
   pnpm exec tsc --noEmit
   ```

**Expected Output:**
```
✅ Turborepo pattern understood
✅ Clean import paths work
✅ No TypeScript errors
```

---

#### Task 3.2: Test Clean Imports
**Goal:** Verify new import syntax

**Steps:**
1. **WAIT FOR CHAT:**
   > Chat will update app imports to use: `import { Button } from '@repo/ui/button';`

2. Test dev server:
   ```powershell
   cd apps/web
   pnpm dev
   ```

3. Check browser console for errors

4. Verify components render correctly

**Expected Output:**
```
✅ Dev server starts successfully
✅ No console errors
✅ UI components render correctly
```

---

### **Phase 4: Script Consolidation (1-2 hours) 🟡**

#### Task 4.1: Identify Obsolete Scripts
**Goal:** Determine which scripts are no longer needed

**Steps:**
1. Review scripts in `scripts/migration/`:
   ```powershell
   Get-ChildItem -Path "scripts\migration\" -Filter "*.ps1"
   ```

2. For each script, check:
   - Last modified date
   - Is it phase-specific? (phase4a, phase4b, etc.)
   - Does it reference files that no longer exist?

3. Create list of scripts to delete

**Expected Output:**
```
✅ List of 8-10 obsolete scripts identified
```

---

#### Task 4.2: Delete Obsolete Scripts
**Goal:** Remove unused scripts

**Steps:**
1. **ASK USER FIRST:**
   > "Found 10 obsolete phase-specific scripts. Delete them? (They're in git history if needed)"

2. If user confirms:
   ```powershell
   Remove-Item -Path "scripts\migration\fix-phase4a-*.ps1"
   Remove-Item -Path "scripts\migration\fix-phase4b-*.ps1"
   Remove-Item -Path "scripts\migration\fix-phase4c-*.ps1"
   Remove-Item -Path "scripts\migration\copy-phase*.ps1"
   ```

**Expected Output:**
```
✅ 10 obsolete scripts deleted
✅ scripts/migration/ reduced to essential scripts only
```

---

### **Phase 5: Database Verification (30 min) 🟢**

#### Task 5.1: Verify Database Schema
**Goal:** Ensure DB is in expected state

**Use Supabase MCP:**
```typescript
// Use mcp_supabase_list_projects to get project ID
// Use mcp_supabase_list_tables to verify schema
```

**Steps:**
1. Get project ID:
   ```typescript
   mcp_supabase_list_projects
   ```

2. List tables:
   ```typescript
   mcp_supabase_list_tables({ project_id: "..." })
   ```

3. Verify expected tables exist:
   - listings
   - users
   - profiles
   - etc.

**Expected Output:**
```
✅ Supabase project accessible
✅ All expected tables present
✅ Schema matches expectations
```

---

### **Phase 6: Manual Testing (2-3 hours) 🟢**

#### Task 6.1: Component Rendering Test
**Goal:** Verify all UI components still work

**Steps:**
1. Start dev server:
   ```powershell
   cd apps/web
   pnpm dev
   ```

2. Open browser to `http://localhost:5173/en`

3. Test each page:
   - Homepage (badges, buttons)
   - Settings page (forms, inputs)
   - Profile page (avatars, badges)
   - Shop page (product cards)

4. Check browser console for:
   - Import errors
   - Component errors
   - Missing assets

**Expected Output:**
```
✅ All pages load successfully
✅ No console errors
✅ All components render correctly
```

---

#### Task 6.2: Language Switching Test
**Goal:** Verify translations still work

**Steps:**
1. Navigate to `/en` (English)
2. Check UI elements are in English
3. Navigate to `/bg` (Bulgarian)
4. Check UI elements switch to Bulgarian
5. Note any hardcoded strings still visible

**Expected Output:**
```
✅ Language switching works
✅ Most UI translated
⚠️ Some badges/tooltips still hardcoded (Chat will fix)
```

---

#### Task 6.3: Import Path Test
**Goal:** Verify new clean import paths work

**Steps:**
1. Open browser DevTools → Network tab
2. Reload page
3. Check for 404 errors on module imports
4. Verify all chunks load successfully

**Expected Output:**
```
✅ No 404 errors
✅ All modules load correctly
✅ Clean import paths working
```

---

### **Phase 7: TypeScript Validation (30 min) 🟢**

#### Task 7.1: Full Type Check
**Goal:** Ensure no type errors after refactor

**Steps:**
1. Run type check on entire monorepo:
   ```powershell
   cd K:\driplo-turbo-1
   pnpm exec turbo run check-types
   ```

2. Review any errors

3. If errors found related to moved files:
   **ANNOUNCE TO CHAT:**
   > "🚨 Type errors found: [paste errors]"

**Expected Output:**
```
✅ All packages type-check successfully
✅ Zero type errors
```

---

#### Task 7.2: Build Test
**Goal:** Verify production build works

**Steps:**
1. Run production build:
   ```powershell
   cd apps/web
   pnpm build
   ```

2. Check for build errors

3. Verify output size (should be smaller after cleanup)

**Expected Output:**
```
✅ Build completes successfully
✅ Bundle size acceptable
✅ No build warnings
```

---

## 🔄 Coordination with Chat Agent

### Communication Protocol:

**When You Announce:**
```
🔄 [What you did]
✅ [Expected Chat action]
```

**Example Announcements:**
1. **After directory cleanup:** "🔄 Root cleanup complete - ready for next phase"
2. **After business dir created:** "🔄 Business components directory ready - Chat can move files"
3. **After exports verified:** "🔄 Export definitions tested - all imports work"

**Wait for Chat Confirmation:**
- Chat will respond with completion status
- Chat will report any issues
- Chat will notify when dependent tasks done

---

## 📊 Success Criteria

### Phase 1 Complete When:
- ✅ Root directory reduced from 80+ to ~18 files
- ✅ All docs in `docs/` subdirectories
- ✅ All scripts in `scripts/` subdirectories
- ✅ Artifacts gitignored

### Phase 2 Complete When:
- ✅ Business components moved to `apps/web/src/lib/components/business/`
- ✅ All imports updated
- ✅ No TypeScript errors
- ✅ Components validate with Svelte MCP

### Phase 3 Complete When:
- ✅ UI package has `exports` field
- ✅ Clean import paths work: `@repo/ui/button`
- ✅ Dev server starts successfully
- ✅ No console errors

### Phase 4 Complete When:
- ✅ 10+ obsolete scripts deleted
- ✅ Essential scripts remain
- ✅ scripts/ directory organized

### Phase 5 Complete When:
- ✅ Database schema verified via Supabase MCP
- ✅ All expected tables present
- ✅ No schema issues

### Phase 6 Complete When:
- ✅ All pages render correctly
- ✅ Language switching works
- ✅ Import paths working in browser
- ✅ No console errors

### Phase 7 Complete When:
- ✅ Full type check passes
- ✅ Production build succeeds
- ✅ Bundle size acceptable

---

## 📝 Final Deliverable

**Create:** `CLEANUP_SUMMARY.md`

**Contents:**
```markdown
# Project Cleanup Summary

## What Was Done
- Root directory: 80+ files → 18 files
- Documentation organized into docs/planning, docs/agents, docs/audits
- Scripts organized into scripts/migration, scripts/analysis
- Business components moved to apps/web/src/lib/components/business/
- Package exports defined for clean imports
- 10+ obsolete scripts deleted

## Before/After Structure
[Paste directory tree comparison]

## Database Verification
- Project ID: [ID from Supabase MCP]
- Tables verified: listings, users, profiles, etc.
- Schema status: ✅ All tables present

## Testing Results
- TypeScript: ✅ Zero errors
- Build: ✅ Successful
- Dev server: ✅ Running
- Language switching: ✅ Working
- Import paths: ✅ Clean paths working

## Known Issues
- [List any remaining issues found]

## Next Steps
- Wait for Chat to complete translation fixes
- Wait for Chat to complete Paraglide optimization
```

---

**🎯 READY TO START!**

**First Step:** Create `docs/planning`, `docs/agents`, `docs/audits` directories

**Then:** Proceed through phases systematically, coordinating with Chat at each checkpoint.

**Remember:** You now have Supabase MCP, Svelte MCP, and Context7 MCP access - use them!

**Good luck! 🚀**
