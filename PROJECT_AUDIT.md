# PROJECT STRUCTURE AUDIT - The Brutal Truth

**Date**: 2025-10-11  
**Current State**: 🔥 DISASTER ZONE 🔥

## Root Directory Chaos

### ❌ Random Scripts That Don't Belong at Root

```
batch-fix-warnings.mjs          ← Move to /scripts or DELETE
final-verification.js           ← Move to /scripts or DELETE  
fix-final-warnings.mjs          ← Move to /scripts or DELETE
fix-remaining-lint.js           ← Move to /scripts or DELETE
fix-remaining-specific.mjs      ← Move to /scripts or DELETE
jsconfig.json                   ← Why is this here? Root doesn't have JS code
lint-ui.json                    ← Move to /packages/ui or DELETE
```

### ❌ Documentation Explosion (11 MD files at root!)

```
CLAUDE.md                       ← Move to /docs
CLI_AGENT_AUDIT_PROMPT.md       ← Move to /docs  
CLI_AGENT_TASKS.md              ← Move to /docs
PARAGLIDE_I18N_MCP_REFACTOR.md  ← Move to /docs
REFACTOR_STATUS.md              ← Move to /docs (just created this)
REFACTOR_SUMMARY.md             ← Move to /docs
SUPABASE_MCP_REFACTOR.md        ← Move to /docs
SVELTE5_MCP_REFACTOR.md         ← Move to /docs
TAILWINDCSS_V4_MCP_REFACTOR.md  ← Move to /docs
TYPESCRIPT_MCP_REFACTOR.md      ← Move to /docs
ROADMAP.md                      ← Move to /docs
CLEANUP-DELETE-MANIFEST.json    ← Move to /docs or DELETE
```

### ✅ What SHOULD Be at Root

```
.env.example                    ✅ Correct
.gitignore                      ✅ Correct
.prettierrc                     ✅ Correct
package.json                    ✅ Correct (workspace root)
pnpm-workspace.yaml             ✅ Correct
turbo.json                      ✅ Correct
vercel.json                     ✅ Correct (if deploying)
README.md                       ✅ Correct
apps/                           ✅ Correct
packages/                       ✅ Correct
supabase/                       ✅ Correct
docs/                           ✅ Correct
scripts/                        ✅ Correct
```

## Apps Structure Issues

Let me check the actual bloat in apps...

### apps/web Issues (needs deep dive)

Looking at the 2026 errors, main issues:
1. **Type safety broken** - 1800+ type errors
2. **Missing i18n keys** - 200+ missing translations
3. **Improper imports** - Likely mixing client/server code

Need to audit:
- `src/lib/` - What's actually shared vs route-specific?
- `src/routes/` - Are route-specific components colocated?
- `src/lib/server/` - Is server code properly isolated?

### apps/admin Issues

Need to check:
- Does it duplicate code from apps/web?
- Does it properly import from packages/ui?
- Server-role auth properly in $lib/server?

### apps/docs Issues

Probably fine if it's just docs.

## Packages Structure Issues

Need to verify:
- `/packages/ui` - Is this following @sveltejs/package pattern?
- `/packages/core` - Does it have SvelteKit deps (shouldn't)?
- `/packages/domain` - Just types, right?
- `/packages/database` - Just generated types?
- `/packages/i18n` - Already confirmed correct structure

## The Real Problem

**PROJECT_SITEMAP.md is 6222 LINES** documenting every single file including:
- Build artifacts (.turbo cache)
- Generated files (.svelte-kit)
- node_modules
- All the random scripts

This sitemap is DOCUMENTING THE MESS, not the ideal structure!

## Action Plan

### Phase 1: Root Cleanup 🔥 URGENT

1. **Move all docs to /docs/**
   ```bash
   git mv *.md docs/ (except README.md)
   ```

2. **Move or delete random scripts**
   ```bash
   git mv batch-fix-warnings.mjs scripts/
   git mv fix-*.js scripts/
   git mv fix-*.mjs scripts/
   git rm lint-ui.json  # or move to packages/ui
   git rm jsconfig.json  # shouldn't be at root
   ```

3. **Update references**
   - Update any scripts that reference moved files
   - Update docs index

### Phase 2: Apps Audit 🔥 CRITICAL

1. **apps/web/src/lib audit**
   - What components are used by only one route? → Move to route folder
   - What's truly shared? → Keep or move to packages/ui
   - What's server-only? → Must be in src/lib/server

2. **Fix type errors**
   - Add missing i18n keys
   - Fix nullable types
   - Fix component prop types

3. **apps/admin audit**
   - Check for duplicated code
   - Verify proper package imports

### Phase 3: Packages Audit 📋 IMPORTANT

1. **Verify package.json exports**
   - Each package has proper "exports" field
   - Types are properly generated

2. **Verify no improper dependencies**
   - packages/core should NOT import from SvelteKit
   - packages/ui should export as library

3. **Verify no duplicated code across packages**

## Success Metrics

The project is FIXED when:

1. ✅ Root directory has <10 files
2. ✅ All docs in /docs folder
3. ✅ All scripts in /scripts folder
4. ✅ Zero TypeScript errors
5. ✅ All builds succeed
6. ✅ Clear separation of concerns
7. ✅ No duplicated code
8. ✅ All packages follow official patterns

## Current State Summary

```
Root files: 30+ files (should be ~10)
Documentation: 11 MD files at root (should be 1: README)
Type errors: 2026 errors
Build status: Failing
Structure: Chaotic
```

**Next Steps**: Start with Phase 1 root cleanup - it's the most visible mess and easiest to fix.
