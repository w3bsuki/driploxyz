# Fresh Chat Execution Prompt - Driplo Turbo Restructure

Copy and paste this entire prompt into a new chat to execute the master restructure plan.

---

## Context

I need you to execute a comprehensive restructure of the Driplo Turbo monorepo following the authoritative **MASTER_RESTRUCTURE_PLAN.md** file in the project root.

### Project Overview

**Stack:**
- SvelteKit 2.43.7 + Svelte 5.39.8 (runes mode)
- Turborepo monorepo with pnpm workspaces
- Supabase backend
- Tailwind CSS v4 (Vite plugin)
- Vercel deployment

**Current State:**
- PROJECT_SITEMAP.md shows 6,222 lines of files (massive bloat)
- 770 dependencies (over-engineered)
- 115+ TypeScript errors
- 13 illegal SvelteKit imports in @repo/core (breaks framework-agnostic principle)
- ~30% route colocation (should be 100%)
- Duplicate components across apps/web and packages/ui
- Over-engineered stores (305+ lines)
- Mixed legacy Svelte 4 patterns with Svelte 5 runes

**Goal:**
Reduce codebase by 30-50% while maintaining full functionality, following official best practices from:
- ✅ SvelteKit 2 (route colocation, $lib/server separation, SSR patterns)
- ✅ Svelte 5 (runes, reactive patterns, component composition)
- ✅ Turborepo (task pipelines, caching, workspace boundaries)
- ✅ Vercel (optimal adapter configuration)

### Critical Constraints

1. **Test after EVERY major phase** - Use `pnpm dev --filter web` to verify app still works
2. **Small commits** - Git commit after completing each sub-task
3. **Use MCP tools** - Validate against official docs:
   - `svelte-mcp` for component patterns and validation
   - `context7` for Turborepo/framework best practices
   - `supabase-mcp` for database operations
4. **Don't break working features** - This project is "really close", don't fuck it up
5. **Create rollback points** - Git branch before each phase

### Project Location

Working directory: `k:\driplo-turbo-1`

Key files:
- `MASTER_RESTRUCTURE_PLAN.md` - **The authoritative execution plan (read this first!)**
- `docs/IDEAL_STRUCTURE.md` - Target structure specification
- `docs/PROJECT_SITEMAP.md` - Current bloated state (6,222 lines)
- `docs/ARCHITECTURE.md` - System architecture
- `turbo.json` - Turborepo configuration (needs optimization)

---

## Your Task

Execute the 6-phase restructure plan defined in `MASTER_RESTRUCTURE_PLAN.md`.

**🚨 CRITICAL FIRST STEPS:**

1. **Create full task breakdown** (30 tasks minimum) - See "MANDATORY TASK BREAKDOWN" section in master plan
2. **Use MCPs BEFORE every action** - Fetch official docs first, code second
3. **Verify structure with Svelte MCP** - Get official SvelteKit 2 structure before starting
4. **ALL IMPORTS MUST WORK** - This is #1 priority throughout execution

Execute the phases:

### Phase 1: Structure Audit & Baseline (Week 1)
- Generate comprehensive audit using grep and MCP tools
- Document all structure violations
- Record baseline metrics (TS errors, build time, etc.)
- **Output:** Create audit files in `docs/audit/`

### Phase 2: Critical Structure Fixes (Week 1-2)
- Fix framework leakage (@repo/core has 13 SvelteKit imports)
- Remove package aliasing (apps importing from `../../packages/*/src`)
- Enforce $lib/server separation (server-only code in correct place)
- Implement route colocation (100% single-use components with routes)
- **Test:** `pnpm build` and `pnpm dev --filter web` must work

### Phase 3: Svelte 5 + SvelteKit 2 Best Practices (Week 2-3)
- Runes migration (`export let` → `$props()`, `on:` → `onclick`, `$:` → `$derived`)
- SSR safety audit (wrap browser APIs with `browser` checks)
- State management cleanup (simplify stores from 305 → 100 lines)
- **Validate:** Use `svelte-mcp svelte-autofixer` to check all components

### Phase 4: Turborepo Optimization (Week 3-4)
- Update turbo.json with proper task pipeline
- Add ESLint rules for workspace boundaries
- Configure caching with inputs/outputs/env vars
- **Target:** CI builds <2min with cache hit rate >80%

### Phase 5: Vercel Optimization (Week 4)
- Simplify adapter config to defaults
- Implement performance patterns (image optimization, font preloading, lazy loading)
- **Validate:** Deploy preview and check Lighthouse score >90

### Phase 6: Cleanup & Documentation (Week 5)
- Delete artifact files and tech debt
- Archive old docs to `docs/archive/`
- Update living docs (ARCHITECTURE.md, DEVELOPMENT.md)
- **Result:** Root directory <20 files, clean docs structure

### Phase 7: Validation & Testing (Week 6)
- Create validation script
- Implement essential tests (auth, search, checkout)
- Run full test suite and E2E tests
- **Success:** 0 TS errors, all tests passing, Lighthouse >90

---

## Step-by-Step Process

### Before You Start

1. **Read MASTER_RESTRUCTURE_PLAN.md** completely
2. **CREATE FULL TASK LIST** - Use the 30-task breakdown from master plan
3. **Verify MCP servers work:**
   ```bash
   svelte-mcp list-sections  # Should return 264 sections
   context7 resolve-library-id "turborepo"  # Should return /vercel/turborepo
   supabase-mcp list-projects  # Should return projects
   ```
4. **Fetch official structure FIRST:**
   ```bash
   svelte-mcp get-documentation "project-structure"
   svelte-mcp get-documentation "routing"
   context7 get-library-docs "/vercel/turborepo" --topic "monorepo structure"
   ```
5. **Verify current state:**
   ```bash
   pnpm install
   pnpm dev --filter web  # Should start on localhost:5173
   ```
6. **Create checkpoint branch:**
   ```bash
   git checkout -b refactor/mcp-driven-restructure-$(date +%Y%m%d)
   git commit --allow-empty -m "checkpoint: start MCP-driven restructure"
   ```

### Execution Rules

1. **MANDATORY: Use MCP before EVERY action** - Follow this pattern:
   ```bash
   # For EVERY task:
   # 1. Fetch official docs with appropriate MCP
   # 2. Read and understand the pattern
   # 3. Apply to your specific case
   # 4. Validate with MCP tools
   # 5. Test the change
   # 6. Commit
   ```

2. **One TASK at a time** - Complete Task N before Task N+1 (not just phases)

3. **Validate after EVERY task:**
   ```bash
   pnpm build              # Must succeed
   pnpm dev --filter web   # Must start without errors
   git add .
   git commit -m "refactor: task N - [description]"
   ```

4. **MCP-Driven Validation (Required for each task):**
   
   **For Structure/Routing tasks:**
   ```bash
   svelte-mcp get-documentation "project-structure"
   svelte-mcp get-documentation "routing"
   ```
   
   **For Component tasks:**
   ```bash
   svelte-mcp get-documentation "svelte/$state"
   svelte-mcp get-documentation "svelte/$props"
   svelte-mcp svelte-autofixer "path/to/component.svelte"
   ```
   
   **For Turborepo tasks:**
   ```bash
   context7 get-library-docs "/vercel/turborepo" --topic "[specific topic]"
   ```
   
   **For Database tasks:**
   ```bash
   supabase-mcp get-advisors --project-id "$ID" --type security
   ```

5. **Ask before destructive operations:**
   - Deleting multiple files
   - Moving entire directories
   - Changing core architecture patterns

6. **Report progress with metrics:**
   - After each task: Show what changed (files moved, imports fixed, etc.)
   - Show running totals: TS errors remaining, imports fixed, etc.
   - After each phase: Summary metrics
   - If blocked: Explain issue with MCP documentation reference

### When You Encounter Issues

- **TypeScript errors:** Fix them before moving on
- **Build failures:** Rollback the breaking change, analyze, fix incrementally
- **Test failures:** Debug and fix, or document as known issue
- **Unclear instructions:** Ask for clarification referencing the specific section in MASTER_RESTRUCTURE_PLAN.md

---

## Success Criteria (Final State)

### Code Metrics
- ✅ PROJECT_SITEMAP.md <3,000 lines (50% reduction)
- ✅ Dependencies <400 (48% reduction from 770)
- ✅ 0 TypeScript errors (currently 115+)
- ✅ 0 SvelteKit imports in @repo/core (currently 13)
- ✅ 100% route colocation (currently ~30%)

### Build & Performance
- ✅ CI builds <2min with Turborepo cache
- ✅ Local `pnpm build` <5min
- ✅ Lighthouse Performance >90
- ✅ First Contentful Paint <1.5s

### Quality Gates
- ✅ `pnpm run check-types` passes with 0 errors
- ✅ `pnpm run lint` passes with 0 errors
- ✅ `pnpm test` all tests passing
- ✅ `./scripts/validate-structure.sh` passes
- ✅ E2E tests for critical flows pass

### Structure Compliance
- ✅ No `../../packages/*/src` aliases in apps
- ✅ No `$app`, `$env`, `$lib` imports in @repo/core
- ✅ All server-only code in `$lib/server/`
- ✅ Single-use components colocated with routes
- ✅ Clean root directory (<20 files)

---

## Available MCP Tools

### Svelte MCP
```bash
svelte-mcp list-sections                          # List all doc sections
svelte-mcp get-documentation "routing"            # Get specific docs
svelte-mcp svelte-autofixer "path/to/file.svelte" # Validate component
svelte-mcp playground-link --code "..."           # Generate playground
```

### Context7 MCP
```bash
context7 resolve-library-id "turborepo"
context7 get-library-docs "/vercel/turborepo" --topic "caching"
context7 get-library-docs "/vercel/next-forge"  # For monorepo patterns
```

### Supabase MCP
```bash
supabase-mcp list-projects
supabase-mcp list-migrations --project-id "$ID"
supabase-mcp get-advisors --project-id "$ID" --type security
supabase-mcp execute-sql --project-id "$ID" --query "..."
```

---

## Important Notes

### What NOT to Do
- ❌ Don't delete files without verifying they're unused
- ❌ Don't change the database schema without migration
- ❌ Don't modify Supabase edge functions (out of scope)
- ❌ Don't break the Tailwind CSS setup (it was just fixed!)
- ❌ Don't rush - test thoroughly after each phase

### What TO Do
- ✅ Read the relevant MCP docs before making changes
- ✅ Run `svelte-autofixer` after every component change
- ✅ Test the app in browser frequently (`pnpm dev --filter web`)
- ✅ Commit small, atomic changes with clear messages
- ✅ Keep MASTER_RESTRUCTURE_PLAN.md as your source of truth
- ✅ Update docs as you make changes (don't defer to end)

---

## Expected Deliverables

At the end of execution:

1. **Restructured codebase:**
   - Clean package boundaries
   - 100% route colocation
   - Framework-agnostic core
   - Optimized Turborepo pipeline
   - Simplified adapters

2. **Documentation:**
   - Updated ARCHITECTURE.md
   - Updated DEVELOPMENT.md
   - Updated README.md
   - Audit reports in docs/audit/
   - Archived old docs in docs/archive/

3. **Validation:**
   - All tests passing
   - Zero TypeScript errors
   - Green CI pipeline
   - Lighthouse score >90
   - Deployed preview working

4. **Git history:**
   - Clear commit messages per phase
   - Rollback points at each phase boundary
   - Final PR ready for review

---

## Start Command

When you're ready to begin, confirm you've read MASTER_RESTRUCTURE_PLAN.md and then say:

**"I've read the master plan. I will now:**
1. **Create the full 30-task breakdown**
2. **Verify all 3 MCP servers work**
3. **Fetch official SvelteKit 2 + Turborepo structure docs**
4. **Begin Task 1: Validate MCP availability**

**I will use the appropriate MCP (svelte-mcp, context7, or supabase-mcp) BEFORE every action to verify the official pattern. All imports will be fixed and structure will match perfect SvelteKit 2 standards."**

Then proceed systematically through each task, using MCPs for verification, testing after each change, and maintaining atomic commits.

**Remember:** 
- This project is close to production - be careful
- **USE MCPs BEFORE CODING** - Fetch docs first, code second
- Test after EVERY task (not just phases)
- All imports MUST work - #1 priority
- Structure must match official SvelteKit 2 patterns
- Commit after each task completion

---

## Quick Reference: MCP Commands

```bash
# Svelte MCP (for SvelteKit 2 + Svelte 5)
svelte-mcp list-sections
svelte-mcp get-documentation "project-structure"
svelte-mcp get-documentation "routing"
svelte-mcp get-documentation "svelte/$state"
svelte-mcp svelte-autofixer "component.svelte"

# Context7 MCP (for Turborepo, TypeScript, etc.)
context7 resolve-library-id "turborepo"
context7 get-library-docs "/vercel/turborepo" --topic "configuration"
context7 resolve-library-id "@sveltejs/adapter-vercel"

# Supabase MCP (for database operations)
supabase-mcp list-projects
supabase-mcp get-advisors --project-id "$ID" --type security
supabase-mcp list-migrations --project-id "$ID"
```

---

**Success Formula:**
1. 🔥 **MCP docs first** - Always fetch official patterns before coding
2. ✅ **One task at a time** - Complete and commit before next
3. ✅ **Test constantly** - `pnpm dev --filter web` after each change
4. ✅ **Fix all imports** - #1 priority throughout
5. ✅ **Match official structure** - Verify with svelte-mcp

**Follow this pattern and you WILL succeed with 30-50% less code and perfect structure!**
