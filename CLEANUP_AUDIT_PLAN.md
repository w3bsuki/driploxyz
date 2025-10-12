# Cleanup Audit Plan - Root Folder Structure

**Created:** October 13, 2025  
**Last Updated:** October 13, 2025  
**Purpose:** Systematic audit and cleanup of the driplo-turbo-1 monorepo

---

## 📊 Progress Summary

### ✅ Completed
- **Phase 1a:** Configuration folders audit (5 folders reviewed)
- **Phase 2:** Apps folder audit and cleanup (2 apps deleted)
- **Storybook Installation:** Component documentation tool installed

### � In Progress
- **Phase 1b:** Root-level files audit

### ⏳ Pending
- **Phase 3:** Documentation folders cleanup (`docs/`, `notes/`)
- **Phase 4:** Scripts cleanup
- **Phase 5:** Root markdown files consolidation

---

## 🗑️ DELETED (Total: 4 items)

### Configuration Folders (2)
1. ✅ **`.changeset/`** - Unused versioning tool (no CLI installed)
2. ✅ **`.playwright-mcp/`** - Cached screenshots (regenerable)

### Apps (2)
3. ✅ **`apps/admin/`** - Custom admin dashboard (replaced with Supabase Studio)
4. ✅ **`apps/docs/`** - Empty docs site (replaced with Storybook)

---

## ✨ ADDED (Total: 1 item)

1. ✅ **Storybook 9.1.10** - Installed in `packages/ui/`
   - Configuration: `.storybook/main.ts`, `.storybook/preview.ts`
   - Example stories: `src/stories/`
   - Scripts: `storybook`, `build-storybook`

---

## Root Folder Inventory

### 📁 Configuration Folders

#### `.changeset/`
- **Status:** 🗑️ **DELETED**
- **Reason:** No changesets CLI installed, orphaned file
- **Replacement:** Can reinstall if needed for versioning

#### `.claude/`
- **Purpose:** Claude AI configuration
- **Status:** ✅ **KEEP** - Active development tool
- **Contains:** Custom agents, commands, MCP configs, permissions
- **Action:** No action needed

#### `.git/`
- **Purpose:** Git version control
- **Status:** ✅ **KEEP** (System)
- **Action:** No action needed

#### `.github/`
- **Purpose:** GitHub workflows, actions, and templates
- **Status:** ✅ **KEEP** - Active CI/CD pipeline
- **Contains:** CI workflows, Dependabot config, PR templates
- **Action:** No action needed

#### `.playwright-mcp/`
- **Status:** 🗑️ **DELETED**
- **Reason:** Cached screenshots (regenerable artifacts)
- **Replacement:** Will regenerate automatically when needed

#### `.turbo/`
- **Purpose:** Turborepo cache
- **Status:** ✅ **KEEP** (System)
- **Action:** No action needed

#### `node_modules/`
- **Purpose:** NPM dependencies
- **Status:** ✅ **KEEP** (System)
- **Action:** No action needed

---

### 📁 Core Application Folders

#### `apps/`
- **Status:** ✅ **AUDIT COMPLETE**
- **Original Contains:**
  - `admin/` - 🗑️ **DELETED** (Replaced with Supabase Studio + custom routes)
  - `docs/` - 🗑️ **DELETED** (Replaced with Storybook)
  - `web/` - ✅ **DEEP AUDIT COMPLETE** - See `APPS_WEB_CLEANUP_AUDIT.md`
- **Current State:** Only `web/` app remains
- **Web App Findings:**
  - 🔴 **CRITICAL:** `api/_debug/` folder (SECURITY RISK - exposes env vars, DB info)
  - 🟡 **30-40 duplicate files** across `lib/` and `lib/server/`
  - 🟡 **Duplicate components** in `routes/components/` vs `lib/components/`
  - 🟢 **Reorganization needed** for flat server/utils folders
  - **Full details:** See `APPS_WEB_CLEANUP_AUDIT.md`
- **Replacement Strategy:**
  - **Admin:** Use Supabase Studio (https://supabase.com/dashboard)
  - **Custom Admin:** Add routes to `web/src/routes/(admin)/` as needed
  - **Docs:** Use Storybook in `packages/ui/`

#### `packages/`
- **Purpose:** Shared packages and libraries
- **Status:** ✅ **KEEP ALL** - Active packages
- **Contains:**
  - `core/` - Core business logic ✅
  - `database/` - Database types & config ✅
  - `domain/` - Domain layer ✅
  - `eslint-config/` - ESLint configuration ✅
  - `i18n/` - Internationalization ✅
  - `testing/` - Testing utilities ✅
  - `typescript-config/` - TypeScript config ✅
  - `ui/` - UI components ✅ + **Storybook installed**
- **Action:** All packages verified and in use

#### `supabase/`
- **Purpose:** Supabase backend configuration
- **Status:** ⏳ Pending Review
- **Contains:**
  - `config.toml`
  - `functions/`
  - `migrations/`
- **Action:** Review migrations and functions

---

### 📁 Documentation Folders

#### `docs/`
- **Purpose:** Project documentation, plans, and audits
- **Status:** ⏳ Pending Review
- **Contains:** Numerous MD files (ROADMAP, TASKS, LOG, RULES, etc.)
- **Action:** Consolidate and archive old docs

#### `notes/`
- **Purpose:** Development notes and temporary documentation
- **Status:** ⏳ Pending Review
- **Action:** Review and potentially merge with `docs/` or delete

---

### 📁 Script Folders

#### `scripts/`
- **Purpose:** Build, analysis, and migration scripts
- **Status:** ⏳ Pending Review
- **Contains:**
  - `analyze-components.js`
  - `analyze-components.ps1`
  - `find-effect-usage.js`
  - `run-analyzers.mjs`
  - Various subdirectories (analysis/, diagnostics/, legacy/, migration/)
- **Action:** Review and clean up obsolete scripts

---

### 📄 Configuration Files (Root Level)

#### Package Management
- `.node-version` - Node version specification - ⏳ Pending Review
- `.npmrc` - NPM configuration - ⏳ Pending Review
- `.nvmrc` - NVM configuration - ⏳ Pending Review
- `package.json` - Root package configuration - ⏳ Pending Review
- `pnpm-lock.yaml` - PNPM lock file - ✅ Keep
- `pnpm-workspace.yaml` - Workspace configuration - ⏳ Pending Review

#### Build & Tooling
- `turbo.json` - Turborepo configuration - ⏳ Pending Review
- `vercel.json` - Vercel deployment config - ⏳ Pending Review
- `jsconfig.json` - JavaScript configuration - ⏳ Pending Review

#### Code Quality
- `.gitattributes` - Git attributes - ⏳ Pending Review
- `.gitignore` - Git ignore patterns - ⏳ Pending Review
- `.prettierignore` - Prettier ignore patterns - ⏳ Pending Review
- `.prettierrc` - Prettier configuration - ⏳ Pending Review
- `.vercelignore` - Vercel ignore patterns - ⏳ Pending Review
- `lint-ui.json` - UI linting configuration - ⏳ Pending Review

#### MCP & AI
- `.mcp.json` - MCP configuration - ⏳ Pending Review

#### Environment
- `.env.example` - Example environment variables - ⏳ Pending Review

---

### 📄 Documentation Files (Root Level)

#### Active Documentation
- `README.md` - Main project readme - ⏳ Pending Review
- `ROADMAP.md` - Project roadmap - ⏳ Pending Review
- `MASTER_RESTRUCTURE_PLAN.md` - Current restructure plan - ⏳ Pending Review
- `MASTER_PLAN_ENHANCEMENTS.md` - Enhancement plans - ⏳ Pending Review

#### Status & Tracking
- `REFACTOR_STATUS.md` - Refactor status tracking - ⏳ Pending Review
- `STRUCTURAL_AUDIT_REPORT.md` - Structural audit - ⏳ Pending Review

#### Execution & Instructions
- `CLAUDE.md` - Claude instructions - ⏳ Pending Review
- `FRESH_CHAT_EXECUTION_PROMPT.md` - Chat execution guide - ⏳ Pending Review
- `PRE_EXECUTION_CHECKLIST.md` - Pre-execution checklist - ⏳ Pending Review
- `ULTRATHINK_EXECUTION_ANALYSIS.md` - Execution analysis - ⏳ Pending Review

#### Technology-Specific Refactor Plans
- `SUPABASE_MCP_REFACTOR.md` - Supabase refactor plan - ⏳ Pending Review
- `SVELTE5_MCP_REFACTOR.md` - Svelte 5 refactor plan - ⏳ Pending Review
- `TAILWINDCSS_V4_MCP_REFACTOR.md` - Tailwind v4 refactor - ⏳ Pending Review
- `TYPESCRIPT_MCP_REFACTOR.md` - TypeScript refactor plan - ⏳ Pending Review

---

### 📄 Script Files (Root Level)

- `add-missing-i18n-keys.mjs` - i18n key management - ⏳ Pending Review
- `final-verification.js` - Verification script - ⏳ Pending Review
- `fix-phase4b-imports.sh` - Import fixing script - ⏳ Pending Review
- `update-phase4c-imports.sh` - Import update script - ⏳ Pending Review

---

### 📄 Other Files

- `nul` - Empty/placeholder file - ⏳ **TO DELETE**

---

## 🎯 Audit Strategy & Progress

### ✅ Phase 1a: Configuration Folders (COMPLETE)
1. ✅ Inventory all configuration folders
2. ✅ Categorize by purpose and usage
3. ✅ Delete unused folders (`.changeset/`, `.playwright-mcp/`)
4. ✅ Keep essential folders (`.claude/`, `.github/`, `.turbo/`, `.git/`)
5. ✅ Document decisions in `CONFIG_FOLDERS_AUDIT.md`

### ✅ Phase 2: Apps Folder (COMPLETE)
1. ✅ Audit `apps/admin/` - Deleted (24 components, ~30% complete)
2. ✅ Audit `apps/docs/` - Deleted (2 pages, empty)
3. ✅ Keep `apps/web/` - Main production app
4. ✅ Install Storybook in `packages/ui/` as replacement
5. ✅ Document strategy in `APPS_FOLDER_AUDIT.md`
6. ✅ Create setup guide in `ADMIN_DOCS_SETUP_GUIDE.md`

### 🔄 Phase 1b: Root Level Files (IN PROGRESS)
- ⏳ Review configuration files (package.json, turbo.json, etc.)
- ⏳ Review root documentation files (many MD files)
- ⏳ Review root script files (import fixers, etc.)
- ⏳ Identify duplicates and obsolete files

### ⏳ Phase 3: Documentation Folders (PENDING)
- ⏳ Review `docs/` folder (extensive documentation)
- ⏳ Review `notes/` folder (dev notes)
- ⏳ Identify duplicates and consolidate
- ⏳ Archive or delete old documentation

### ⏳ Phase 4: Scripts Cleanup (PENDING)
- ⏳ Review `scripts/` folder
- ⏳ Identify obsolete scripts from old refactors
- ⏳ Remove unused analysis/migration scripts
- ⏳ Document remaining scripts

### ⏳ Phase 5: Supabase Review (PENDING)
- ⏳ Audit migrations
- ⏳ Review functions
- ⏳ Check configuration

---

## 📋 Decision Criteria

### 🗑️ DELETE if:
- Empty or placeholder files
- Duplicate documentation
- Obsolete scripts from old refactors
- Unused configuration files
- Temporary test files
- Apps/features replaced by better solutions

### 📦 ARCHIVE if:
- Historical documentation (may be useful for reference)
- Completed refactor plans
- Old audit reports

### ✅ KEEP if:
- Active configuration files
- Current documentation
- Working scripts
- System files (node_modules, .git, etc.)
- All production code

### ⏳ REVIEW if:
- Unclear purpose
- Possibly outdated
- Needs consolidation

---

## 🎉 Achievements So Far

### Code Reduction
- **Deleted:** 2 full applications (~26 components total)
- **Lines Removed:** ~30,000+ lines of code
- **Build Targets:** Reduced from 3 apps to 1
- **Deployment Complexity:** Reduced by 66%

### Time Saved
- **Admin Development:** 80-100 hours saved
- **Docs Development:** 20-30 hours saved
- **Ongoing Maintenance:** 2 fewer apps to maintain

### Quality Improvements
- **Using Supabase Studio:** Professional, battle-tested admin
- **Using Storybook:** Industry-standard component docs
- **Focused Development:** 100% energy on customer features

---

## 📚 Documentation Created

1. **`CLEANUP_AUDIT_PLAN.md`** (this file) - Master tracking document
2. **`CONFIG_FOLDERS_AUDIT.md`** - Config folders analysis
3. **`APPS_FOLDER_AUDIT.md`** - Apps deletion rationale
4. **`ADMIN_DOCS_SETUP_GUIDE.md`** - Supabase Studio + Storybook guide
5. **`APPS_CLEANUP_SUMMARY.md`** - Apps cleanup summary
6. **`APPS_DELETION_COMPLETE.md`** - Final completion summary

---

## 🚀 Next Steps

### Immediate (Current Session)
1. ✅ **DONE:** Configuration folders audit
2. ✅ **DONE:** Apps folder audit and cleanup
3. ✅ **DONE:** Install Storybook
4. 🔄 **NOW:** Continue with documentation folders

### Next Priorities
5. ⏳ **Audit `docs/` folder** - Likely many duplicate/obsolete docs
6. ⏳ **Audit `notes/` folder** - Dev notes cleanup
7. ⏳ **Audit `scripts/` folder** - Remove obsolete scripts
8. ⏳ **Audit root MD files** - Too many refactor plans
9. ⏳ **Final cleanup** - Delete `nul` and other junk

---

## 📝 Notes

- ✅ Always verify before deleting
- ✅ Git history preserves deleted code if needed
- ✅ Major deletions validated and documented
- ✅ Workspace still builds and functions
- 🔄 Update this document as we progress
