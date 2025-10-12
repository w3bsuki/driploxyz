# Pre-Execution Validation Checklist

**Before starting the restructure in a new chat, verify this checklist is complete.**

---

## ✅ Documentation Preparation

- [ ] **MASTER_RESTRUCTURE_PLAN.md exists** and is complete
- [ ] **FRESH_CHAT_EXECUTION_PROMPT.md exists** and is ready to copy
- [ ] **MASTER_PLAN_ENHANCEMENTS.md exists** showing all enhancements
- [ ] All three files are in sync with MCP requirements

---

## ✅ MCP Server Verification

Test each MCP server works:

### Svelte MCP
```bash
svelte-mcp list-sections
# Expected: List of 264 documentation sections
```

- [ ] **Svelte MCP responds** with section list
- [ ] Sections include: "project-structure", "routing", "load", "svelte/$state"

### Context7 MCP
```bash
context7 resolve-library-id "turborepo"
# Expected: /vercel/turborepo
```

- [ ] **Context7 MCP responds** with library ID
- [ ] Can resolve: turborepo, @sveltejs/adapter-vercel, typescript

### Supabase MCP
```bash
supabase-mcp list-projects
# Expected: List of your Supabase projects
```

- [ ] **Supabase MCP responds** with project list
- [ ] Project ID available for use

---

## ✅ Current State Verification

### Project Builds
```bash
pnpm install
pnpm build
```

- [ ] **pnpm install completes** without errors
- [ ] **pnpm build completes** (may have TS errors, that's OK)
- [ ] Build time recorded as baseline

### Dev Server Works
```bash
pnpm dev --filter web
```

- [ ] **Dev server starts** on localhost:5173
- [ ] Homepage loads in browser
- [ ] Basic navigation works
- [ ] Styling works (Tailwind CSS rendering)

### TypeScript Errors
```bash
pnpm run check-types
```

- [ ] **TS errors counted** - Currently 115+ expected
- [ ] Error count recorded as baseline

### Current Structure
```bash
ls -la | wc -l
```

- [ ] **Root file count** recorded (baseline)
- [ ] PROJECT_SITEMAP.md shows 6,222 lines (baseline)

---

## ✅ Git Setup

### Clean Working Directory
```bash
git status
```

- [ ] **No uncommitted changes** in working directory
- [ ] On `main` branch (or appropriate branch)

### Checkpoint Branch Ready
```bash
git checkout -b refactor/mcp-driven-restructure-$(date +%Y%m%d)
git commit --allow-empty -m "checkpoint: start MCP-driven restructure"
```

- [ ] **New branch created** with date stamp
- [ ] Checkpoint commit created
- [ ] Ready to start making changes

---

## ✅ Environment Variables

### Required Variables
```bash
echo $PROJECT_ID
echo $SUPABASE_URL
echo $DATABASE_URL
```

- [ ] **PROJECT_ID set** (for Supabase MCP)
- [ ] **SUPABASE_URL available** in .env
- [ ] **DATABASE_URL available** in .env

---

## ✅ Task List Prepared

### 30-Task Breakdown
Review the task list in MASTER_RESTRUCTURE_PLAN.md:

- [ ] **Pre-Execution (1-5)** - MCP verification, fetch docs, baseline
- [ ] **Structure Foundation (6-10)** - Framework leakage, aliasing, $lib/server
- [ ] **Route Colocation (11-13)** - Component usage, colocation, layout groups
- [ ] **Svelte 5 Migration (14-17)** - Runes, autofixer
- [ ] **State Management (18-19)** - Stores, SSR safety
- [ ] **Turborepo (20-22)** - turbo.json, boundaries, cache
- [ ] **Vercel & Performance (23-25)** - Adapter, optimizations, preview
- [ ] **Database (26-27)** - Advisors, migrations
- [ ] **Validation (28-30)** - TS check, imports, structure

### Priority Order Understood
- [ ] **Foundation first** (tasks 6-10) - Fix core structure
- [ ] **Routes second** (tasks 11-13) - Colocation
- [ ] **Svelte 5 third** (tasks 14-19) - Runes and patterns
- [ ] **Infrastructure fourth** (tasks 20-27) - Turbo/Vercel/DB
- [ ] **Validation last** (tasks 28-30) - Final checks

---

## ✅ MCP Command Reference Ready

### Svelte MCP Commands
```bash
# List sections
svelte-mcp list-sections

# Get documentation
svelte-mcp get-documentation "project-structure"
svelte-mcp get-documentation "routing"
svelte-mcp get-documentation "load"
svelte-mcp get-documentation "server-only-modules"
svelte-mcp get-documentation "kit/state-management"
svelte-mcp get-documentation "svelte/$state"
svelte-mcp get-documentation "svelte/$derived"
svelte-mcp get-documentation "svelte/$effect"
svelte-mcp get-documentation "svelte/$props"

# Validate component
svelte-mcp svelte-autofixer "path/to/component.svelte"
```

- [ ] **Commands tested** and work
- [ ] Documentation sections accessible

### Context7 Commands
```bash
# Resolve library
context7 resolve-library-id "turborepo"
context7 resolve-library-id "@sveltejs/adapter-vercel"
context7 resolve-library-id "typescript"

# Get docs
context7 get-library-docs "/vercel/turborepo" --topic "configuration"
context7 get-library-docs "/vercel/turborepo" --topic "caching"
context7 get-library-docs "/vercel/turborepo" --topic "workspace packages"
```

- [ ] **Library resolution works**
- [ ] Documentation fetch works

### Supabase Commands
```bash
# List projects
supabase-mcp list-projects

# Get advisors
supabase-mcp get-advisors --project-id "$PROJECT_ID" --type security
supabase-mcp get-advisors --project-id "$PROJECT_ID" --type performance

# List migrations
supabase-mcp list-migrations --project-id "$PROJECT_ID"

# Search docs
supabase-mcp search-docs '{
  searchDocs(query: "server-side rendering") {
    nodes { title href content }
  }
}'
```

- [ ] **Project listing works**
- [ ] Advisor queries work
- [ ] Migration listing works

---

## ✅ Execution Pattern Understood

### For Every Task:
1. [ ] **Identify task type** (Structure/Component/Turbo/DB)
2. [ ] **Fetch official docs** using appropriate MCP
3. [ ] **Read and understand** the official pattern
4. [ ] **Plan implementation** - how pattern applies here
5. [ ] **Execute change** - make the code modification
6. [ ] **Validate with MCP** - run autofixer or check docs again
7. [ ] **Test** - `pnpm dev --filter web` must work
8. [ ] **Commit** - git commit with clear message

### Pattern Example:
```bash
# Task: Fix package aliasing

# 1. Identify: Structure task
# 2. Fetch docs:
svelte-mcp get-documentation "kit/packaging"
context7 get-library-docs "/vercel/turborepo" --topic "workspace"

# 3. Read: Understand proper package exports pattern
# 4. Plan: Remove aliases, update package.json exports
# 5. Execute: Edit vite.config.ts, package.json
# 6. Validate: Check imports still resolve
# 7. Test: pnpm dev --filter web
# 8. Commit: git commit -m "fix: remove package src aliasing"
```

- [ ] **Pattern understood** and will be followed for every task

---

## ✅ Success Criteria Clear

### Immediate Goals (Per Task)
- [ ] MCP verification completed before coding
- [ ] Code change matches official pattern
- [ ] Imports work after change
- [ ] Tests pass after change
- [ ] Commit made with clear message

### Phase Goals
- [ ] All tasks in phase complete
- [ ] `pnpm build` succeeds
- [ ] `pnpm dev --filter web` works
- [ ] No regressions in functionality

### Final Goals
- [ ] PROJECT_SITEMAP.md <3,000 lines (50% reduction)
- [ ] Dependencies <400 (48% reduction from 770)
- [ ] 0 TypeScript errors (down from 115+)
- [ ] 0 illegal SvelteKit imports in @repo/core
- [ ] 100% route colocation (up from 30%)
- [ ] CI builds <2min with cache
- [ ] Lighthouse Performance >90

---

## ✅ Rollback Plan Ready

### If Something Breaks:
```bash
# Option 1: Revert last commit
git revert HEAD

# Option 2: Reset to checkpoint
git reset --hard refactor/mcp-driven-restructure-$(date +%Y%m%d)^

# Option 3: Return to main
git checkout main
```

- [ ] **Rollback commands** understood
- [ ] Git checkpoints will be created regularly

---

## ✅ Communication Plan

### Progress Reporting
- [ ] Report after each task completion
- [ ] Show metrics: files changed, imports fixed, TS errors reduced
- [ ] Request confirmation before destructive operations
- [ ] Ask for help if blocked with MCP documentation reference

### Milestone Reporting
After each phase:
- [ ] Summary of changes
- [ ] Metrics comparison (before/after)
- [ ] Verification steps completed
- [ ] Next phase preview

---

## 🚀 Ready to Execute

All items above checked? **You're ready!**

### Final Steps:

1. **Copy FRESH_CHAT_EXECUTION_PROMPT.md** content
2. **Open a NEW CHAT**
3. **Paste the prompt**
4. **Confirm you've read the master plan**
5. **Begin Task 1: Validate MCP availability**

---

## 📋 Quick Reference

**Master Plan:** `MASTER_RESTRUCTURE_PLAN.md`  
**Execution Prompt:** `FRESH_CHAT_EXECUTION_PROMPT.md`  
**Enhancements Doc:** `MASTER_PLAN_ENHANCEMENTS.md`  
**This Checklist:** `PRE_EXECUTION_CHECKLIST.md`

**Project Root:** `k:\driplo-turbo-1`  
**Dev Server:** `pnpm dev --filter web` → `localhost:5173`  
**Build:** `pnpm build`  
**Type Check:** `pnpm run check-types`

---

**Trust the process. Follow the MCPs. Test frequently. You will succeed!** 🎉
