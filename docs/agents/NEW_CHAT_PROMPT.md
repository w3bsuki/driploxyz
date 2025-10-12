# PROMPT FOR NEW CHAT - Phase 4A Execution

Execute **Phase 4A: UI Package Restructure** for the driplo-turbo-1 monorepo.

## Context
Working directory: `K:\driplo-turbo-1\`
SvelteKit 2 + Turborepo monorepo with 174 UI components that need reorganization.

## Your Task
1. **Read these files first:**
   - `PHASE_4A_FRESH_START_PROMPT.md` - Complete execution instructions
   - `PHASE_4A_COMPONENT_AUDIT.md` - All 174 components categorized
   - `PHASE_4A_DETAILED_PLAN.md` - Execution strategy

2. **Execute the 13-step plan:**
   - Generate import mapping JSON
   - Copy components to new structure (primitives/compositions/layouts)
   - Update package.json exports
   - Create PowerShell script to fix ALL imports
   - Run script across monorepo
   - Fix edge cases (.js→.ts, path depths, missing files)
   - Test build + dev server
   - Delete old locations only after tests pass
   - Commit

3. **Critical requirements:**
   - Use PowerShell scripts for systematic import fixes (NOT manual)
   - Test dev server BEFORE claiming completion
   - Don't commit if anything is broken
   - Use manage_todo_list to track progress

4. **Success criteria:**
   - `pnpm run build` succeeds
   - `pnpm dev` starts without errors
   - Browser loads /, /search, /products/[slug] with no console errors
   - All 174 components moved and imports fixed

## Key Principle
**When you move files, you MUST fix ALL imports BEFORE claiming completion.**

Use Svelte MCP if available. Start by reading PHASE_4A_FRESH_START_PROMPT.md for full details.
