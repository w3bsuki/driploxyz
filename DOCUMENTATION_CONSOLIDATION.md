# Documentation Consolidation Plan
**Date:** 2025-09-29
**Purpose:** Reduce cognitive load by consolidating 23 root markdown files into essential documentation

---

## Problem Statement

### Current Chaos
- **23 markdown files** at repository root
- Multiple files covering same topics (e.g., 5 Tailwind-related docs)
- Obsolete completion reports cluttering root
- Hard to find canonical information
- New contributors overwhelmed

### Impact
- Analysis paralysis - too much to read
- Outdated information not removed
- Inconsistent guidance across files
- Time wasted searching for answers

---

## Target State

### Essential Documentation (<10 files)

**Root Level (User-Facing):**
1. `README.md` - Project overview, quick start
2. `ARCHITECTURE.md` - System design, package structure
3. `DEVELOPMENT.md` - Setup, workflow, commands
4. `FRAMEWORKS.md` - SvelteKit, Svelte 5, Tailwind, Paraglide guides
5. `SUPABASE.md` - Database, auth, RLS policies
6. `TESTING.md` - Testing strategy, patterns, coverage
7. `CONTRIBUTING.md` - How to contribute, code review
8. `ROADMAP.md` - Current priorities (Kanban style)

**docs/ Folder (Reference):**
- `docs/deployment.md` - Production deployment guide
- `docs/troubleshooting.md` - Common issues and solutions
- `docs/archive/` - Historical documents (read-only)

---

## File Inventory & Actions

### ✅ Keep & Update

#### README.md (CREATE)
**Current:** Missing!
**Action:** Create comprehensive README
**Content:**
- Project description (what is Driplo?)
- Key features
- Tech stack summary
- Quick start (Node version, pnpm install, pnpm dev)
- Project structure overview
- Links to other docs
- License

#### ARCHITECTURE.md (CONSOLIDATE)
**Sources:** AGENTS.md + ProjectStructure.md + package structure
**Action:** Merge into single architecture document
**Content:**
- System architecture diagram
- Package hierarchy and responsibilities
- Data flow (client → services → database)
- Deployment architecture (Vercel + Supabase)
- Technology choices and rationale
- Package ownership matrix

#### DEVELOPMENT.md (CONSOLIDATE)
**Sources:** Turbo.md + CLAUDE.md workflow
**Action:** Merge into developer workflow guide
**Content:**
- Environment setup (Node, pnpm, nvm)
- Development commands (dev, build, lint, test)
- Turborepo pipeline explanation
- Git workflow (branches, commits, PRs)
- Code style and conventions
- Debugging tips
- Common tasks (add package, create component)

#### FRAMEWORKS.md (CONSOLIDATE)
**Sources:** SvelteKit2.md + Svelte5.md + TailwindCSS.md + Paraglide.md
**Action:** Merge into unified framework guide
**Content:**
- SvelteKit 2 conventions (load, actions, routing)
- Svelte 5 patterns (runes, components, state)
- Tailwind CSS usage (tokens, utilities, semantic classes)
- Paraglide i18n (translation workflow, adding locales)
- Best practices for each framework
- Migration guides (if needed)

#### SUPABASE.md (SIMPLIFY)
**Current:** Exists but verbose
**Action:** Simplify, focus on essentials
**Content:**
- Database schema overview
- Running migrations
- RLS policies (critical tables)
- Auth configuration
- Storage setup
- Local development (Docker)
- Troubleshooting database issues

#### TESTING.md (CREATE)
**Current:** Missing
**Action:** Create comprehensive testing guide
**Content:**
- Testing philosophy
- Test structure (unit, integration, e2e)
- Running tests (commands, CI)
- Writing tests (patterns, mocks)
- Coverage requirements
- Continuous testing workflow
- Debugging tests

#### CONTRIBUTING.md (CREATE)
**Current:** Guidance scattered in CLAUDE.md, AGENTS.md
**Action:** Create contributor guide
**Content:**
- How to contribute (issues, PRs)
- Development workflow
- Code review process
- Commit message conventions
- Documentation standards
- Getting help

#### ROADMAP.md (KEEP)
**Current:** Created today
**Action:** Keep as-is, update regularly
**Content:**
- Simple Kanban (Critical, High Priority, Backlog)
- Current priorities
- Completed work log

---

### 📦 Archive to docs/archive/

**Migration & Completion Reports:**
- BINDABLE_OPTIMIZATION_PLAN.md → docs/archive/
- BINDABLE_OPTIMIZATION_COMPLETION_REPORT.md → docs/archive/
- SVELTEKIT2_FIX_PLAN.md → docs/archive/
- SVELTE5_COMPLIANCE_FIX_PLAN.md → docs/archive/
- MIGRATION_APPLIED.md → docs/archive/

**Tailwind Redundancy:**
- TailwindCSSv4.md → docs/archive/ (duplicate of TailwindCSS.md)
- tailwindcss-v4-guide.md → docs/archive/ (merge into FRAMEWORKS.md)
- tailwindcssv4-checklist.md → docs/archive/
- tailwindcssv4-refactor.md → docs/archive/
- finalv4.md → docs/archive/

**Strategy & UX Docs:**
- NAVIGATION_UX_STRATEGY.md → docs/archive/ (or move to docs/design/)
- UI-UX.md → docs/archive/ (or move to docs/design/)
- ux-enhancements-backlog.md → docs/archive/ (move to GitHub issues)

**Security & Audit:**
- driplo-security-audit-report.md → docs/archive/

**Generic Guides:**
- TypeScript.md → docs/archive/ (merge essentials into DEVELOPMENT.md)

**Phase Reports:**
- docs/refactor/reports/*.md → docs/archive/refactor/
- docs/refactor/cleanup-checklist.md → docs/archive/
- docs/refactor/dependency-audit.md → docs/archive/
- docs/refactor/task-board.md → delete (use ROADMAP.md)

---

### 🗑️ Delete Completely

**Failed Phase System:**
- MAIN.md - Complex phase system that didn't work, replaced by ROADMAP.md
- notes/post-lint-refactor.md - Superseded by ROADMAP.md

**Obsolete Reports:**
- notes/error-inventory.md - Errors should be in GitHub issues
- notes/sql-functions-regeneration.md - One-time task, not needed

**Reason:** These documents are historical and unlikely to be referenced. Archive preserves them if needed.

---

## Consolidation Process

### Step 1: Create New Essential Docs (2 hours)

1. **README.md** - Brand new, ~200 lines
```bash
touch README.md
# Write content
```

2. **ARCHITECTURE.md** - Merge 3 docs, ~300 lines
```bash
# Read and extract key sections:
# - AGENTS.md (ownership, conventions)
# - ProjectStructure.md (package layout)
# - Add new architecture diagrams
cat AGENTS.md ProjectStructure.md > ARCHITECTURE.md.draft
# Edit and consolidate
```

3. **DEVELOPMENT.md** - Merge 2 docs, ~400 lines
```bash
cat Turbo.md CLAUDE.md > DEVELOPMENT.md.draft
# Extract workflow sections, remove agent-specific content
```

4. **FRAMEWORKS.md** - Merge 4 docs, ~500 lines
```bash
cat SvelteKit2.md Svelte5.md TailwindCSS.md Paraglide.md > FRAMEWORKS.md.draft
# Organize by framework, simplify checklists
```

5. **TESTING.md** - Brand new, ~300 lines
```bash
touch TESTING.md
# Write testing guide from scratch
```

6. **CONTRIBUTING.md** - Extract from CLAUDE.md, ~200 lines
```bash
# Extract contributor workflow from CLAUDE.md
# Simplify and make contributor-friendly
```

### Step 2: Simplify SUPABASE.md (1 hour)
```bash
# Remove verbose checklists
# Keep essential schema and RLS guidance
# Add quick reference sections
```

### Step 3: Create Archive Structure (30 min)
```bash
mkdir -p docs/archive/{refactor,migration,tailwind}
mkdir -p docs/design
```

### Step 4: Move Files to Archive (30 min)
```bash
# Migration reports
mv BINDABLE_OPTIMIZATION_*.md docs/archive/migration/
mv SVELTEKIT2_FIX_PLAN.md docs/archive/migration/
mv SVELTE5_COMPLIANCE_FIX_PLAN.md docs/archive/migration/
mv MIGRATION_APPLIED.md docs/archive/migration/

# Tailwind docs
mv TailwindCSSv4.md docs/archive/tailwind/
mv tailwindcss*.md docs/archive/tailwind/
mv finalv4.md docs/archive/tailwind/

# UX/Design (optional: move to docs/design instead)
mv NAVIGATION_UX_STRATEGY.md docs/archive/
mv UI-UX.md docs/archive/
mv ux-enhancements-backlog.md docs/archive/

# Security
mv driplo-security-audit-report.md docs/archive/

# Refactor reports
mv docs/refactor/reports docs/archive/refactor/
mv docs/refactor/cleanup-checklist.md docs/archive/refactor/
mv docs/refactor/dependency-audit.md docs/archive/refactor/
```

### Step 5: Delete Obsolete Files (10 min)
```bash
rm MAIN.md
rm notes/post-lint-refactor.md
rm notes/error-inventory.md
rm notes/sql-functions-regeneration.md
rm docs/refactor/task-board.md
```

### Step 6: Delete Source Files After Consolidation (10 min)
```bash
# After confirming new docs are complete
rm AGENTS.md
rm ProjectStructure.md
rm Turbo.md
rm CLAUDE.md
rm SvelteKit2.md
rm Svelte5.md
rm TailwindCSS.md
rm Paraglide.md
rm TypeScript.md
```

### Step 7: Update Cross-References (1 hour)
- Search for links to deleted files
- Update to point to new consolidated docs
- Check all markdown files for broken links
```bash
# Find references to old docs
grep -r "MAIN.md\|AGENTS.md\|ProjectStructure.md" .
# Update references manually
```

### Step 8: Validate (30 min)
- [ ] All new docs are readable and well-formatted
- [ ] No broken links between docs
- [ ] Root directory has <10 markdown files
- [ ] Archive contains all historical documents
- [ ] Team can find information easily

---

## New Documentation Structure

### Root Directory
```
/
├── README.md              (NEW - project overview)
├── ARCHITECTURE.md        (CONSOLIDATED)
├── DEVELOPMENT.md         (CONSOLIDATED)
├── FRAMEWORKS.md          (CONSOLIDATED)
├── SUPABASE.md            (SIMPLIFIED)
├── TESTING.md             (NEW - testing guide)
├── CONTRIBUTING.md        (NEW - contributor guide)
├── ROADMAP.md             (KEEP - current priorities)
├── REFACTOR_MASTER_PLAN.md          (KEEP - strategic plan)
├── ARCHITECTURE_SIMPLIFICATION.md   (KEEP - Phase 2 plan)
└── DOCUMENTATION_CONSOLIDATION.md   (KEEP - this file)
```

### docs/ Directory
```
docs/
├── deployment.md          (Production deployment)
├── troubleshooting.md     (Common issues)
├── design/                (Optional: UX/design docs)
├── archive/               (Historical documents)
│   ├── migration/         (Completed migration reports)
│   ├── tailwind/          (Tailwind refactor docs)
│   └── refactor/          (Phase reports)
└── testing/               (Testing documentation)
    └── testing-guidelines.md
```

---

## Communication Plan

### Announce Changes
1. Post in team chat/Slack about documentation reorganization
2. Highlight new essential docs (README, ARCHITECTURE, DEVELOPMENT)
3. Explain archive structure (historical docs still accessible)
4. Ask for feedback on new structure

### Update Tooling
- Update any CI scripts referencing old doc paths
- Update issue/PR templates to reference new docs
- Add links to new docs in repo description

### Train Team
- Quick walkthrough of new documentation structure
- Show where to find common information
- Encourage feedback and improvements

---

## Success Metrics

### Quantitative
- [x] Root markdown files: 23 → <10 ✅
- [ ] Average time to find information: <2 minutes
- [ ] New contributor onboarding time: <1 hour

### Qualitative
- [ ] Team can find answers without asking
- [ ] Documentation is kept up-to-date
- [ ] No duplicate or conflicting information
- [ ] New contributors feel confident getting started

---

## Timeline

| Task | Duration | Owner |
|------|----------|-------|
| Create new essential docs | 2 hours | Claude |
| Simplify SUPABASE.md | 1 hour | Claude |
| Create archive structure | 30 min | Claude |
| Move files to archive | 30 min | Claude |
| Delete obsolete files | 10 min | Claude |
| Update cross-references | 1 hour | Claude |
| Validate structure | 30 min | Claude |

**Total:** ~5-6 hours

---

## Rollback Plan

If consolidation causes confusion:
1. Restore archived files from `docs/archive/` to root
2. Delete new consolidated files
3. Revert commit
4. Reassess and try smaller consolidation

---

## Next Steps

1. Get approval to proceed with consolidation
2. Create new essential documents (README, ARCHITECTURE, DEVELOPMENT, etc.)
3. Move files to archive
4. Delete obsolete files
5. Validate and announce changes
6. Monitor team feedback and adjust

---

**Remember:** Documentation should help, not overwhelm. Less is more.