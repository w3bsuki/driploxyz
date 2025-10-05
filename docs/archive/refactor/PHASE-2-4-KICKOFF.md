<!-- DEPRECATED: This documentation has been archived and is no longer maintained. -->
<!-- For current documentation, see: https://github.com/w3bsuki/driploxyz/blob/main/docs/refactor/phase-7/ -->
<!-- Archived on: 2025-10-05 -->

# Phase 2-4 Refactor Kickoff - Supabase MCP Integration

**Date:** October 1, 2025  
**Status:** 🚀 **ACTIVE**  
**MCP Status:** ✅ **CONNECTED & VALIDATED**

## Environment Validation

### Local Environment
- **Node:** v22.20.0 (⚠️ Note: Phase 4 docs referenced v22.12.0, but v22.20.0 is installed)
- **pnpm:** 9.15.4 (⚠️ Note: Phase 4 docs referenced 8.15.6, but 9.15.4 is installed)
- **Git Branch:** `codex/audit-codebase-and-create-documentation`

### Supabase MCP Connection ✅
- **Status:** OPERATIONAL
- **Project Ref:** `koowfhsaqmarfdkwsfiz`
- **Database Tables:** 45 tables in `public` schema
- **Total Migrations:** 312 migrations applied
- **Latest Migration:** `20250929082641_add_order_items_table`

### Security Advisors Report (from MCP)
⚠️ **3 Security Warnings Detected:**

1. **Auth OTP Long Expiry** (WARN)
   - OTP expiry exceeds recommended threshold (>1 hour)
   - **Action Required:** Configure to <1 hour
   - [Remediation Guide](https://supabase.com/docs/guides/platform/going-into-prod#security)

2. **Leaked Password Protection Disabled** (WARN)
   - HaveIBeenPwned.org integration disabled
   - **Action Required:** Enable in Auth settings
   - [Remediation Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

3. **Postgres Version Security Patches** (WARN)
   - Current: `supabase-postgres-17.4.1.074`
   - Security patches available
   - **Action Required:** Schedule database upgrade
   - [Upgrade Guide](https://supabase.com/docs/guides/platform/upgrading)

## Reference Documentation Stack

| Document | Purpose | Status |
|----------|---------|--------|
| `refactor-plans/refactor-roadmap.md` | Phase roadmap + ownership matrix | ✅ Read |
| `docs/refactor/cleanup-checklist.md` | Toast dedupe, Svelte 5 audit, testing gaps | ✅ Read |
| `docs/refactor/dependency-audit.md` | Dependency + tooling status | ✅ Read |
| `docs/refactor/task-board.md` | Daily command log & validation notes | ✅ Read |
| `docs/refactor/reports/phase-4-planning.md` | Latest planning/validation context | ✅ Read |
| `docs/refactor/reports/phase-4-validation-log.md` | Validation command outputs | ✅ Read |

## Team Ownership Matrix

| Role | Responsibilities | Primary Focus Areas |
|------|-----------------|---------------------|
| **FE** | Storefront/frontend team | `apps/web`, shared UI, docs site |
| **BE** | Backend/data team | Supabase schema, edge functions, `@repo/core` |
| **PLAT** | Platform/DevOps | Build tooling, CI/CD, observability |
| **QA** | Quality engineering | Test automation, release gates |

## Priority Ticket Backlog

### 🔴 CRITICAL - Toast System Consolidation (FE)
**Owner:** FE Team  
**Status:** 🔄 Ready to Start  
**Doc Ref:** `docs/refactor/cleanup-checklist.md:L11-L31`

**Problem:**
- 3 duplicate toast implementations causing memory leaks
- Inconsistent behavior across apps
- Maintenance burden and bundle bloat

**Files:**
- ✅ KEEP: `packages/ui/src/lib/primitives/toast/store.svelte.ts` (Melt UI + Svelte 5)
- ❌ REMOVE: `packages/ui/src/lib/stores/toast-store.svelte.ts` (legacy bridge)
- ❌ MIGRATE: `apps/web/src/lib/stores/toast.svelte.ts` (app duplicate)

**Tasks:**
1. Audit all import locations across codebase
2. Update imports to `@repo/ui/primitives/toast`
3. Remove legacy files
4. Test toast functionality in all apps
5. Update documentation

**Validation:**
```bash
pnpm --filter @repo/ui test
pnpm --filter web test
pnpm --filter web build
```

---

### 🟡 HIGH - Supabase Service-Role Hardening (BE)
**Owner:** BE Team  
**Status:** 🔄 Ready to Start  
**Doc Ref:** `refactor-plans/refactor-roadmap.md:L36-L39`

**Problem:**
- Service-role clients not lazily loaded
- No audit logging for privileged operations
- Risk of accidental RLS bypass

**Files:**
- `apps/web/src/lib/server/supabase.server.ts`
- `supabase/functions/send-message/index.ts`

**MCP Integration:**
- Use `mcp_supabase_execute_sql` to validate RLS policies
- Use `mcp_supabase_get_advisors` for security audits
- Use `mcp_supabase_get_logs` for debugging

**Tasks:**
1. Implement lazy-loading for service-role clients
2. Add audit logging wrapper for privileged operations
3. Review all service-role usage across codebase
4. Document service-role usage patterns
5. Add MCP-backed validation scripts

**Validation:**
```bash
# MCP validation
Use mcp_supabase_get_advisors to check security
Use mcp_supabase_get_logs to verify audit logging

# Code validation
pnpm --filter web test
pnpm --filter web build
```

---

### 🟡 HIGH - @repo/ui Package Cleanup (FE)
**Owner:** FE Team  
**Status:** 🔄 Ready to Start  
**Doc Ref:** `docs/refactor/cleanup-checklist.md:L67-L79`

**Problem:**
- Demo/test files in production package
- Service modules incorrectly placed in UI package
- Unclear export surface

**Files to Review:**
- ❌ REMOVE: `packages/ui/src/lib/my-counter-class.svelte.ts` (demo)
- 🔍 AUDIT: `packages/ui/src/lib/services/CategoryNavigationService.ts` (move to core?)
- ✅ KEEP: `packages/ui/src/lib/primitives/select/example.md` (documentation)

**Tasks:**
1. Remove demo/example files
2. Audit service modules for correct placement
3. Clean up export surface in package.json
4. Document public API surface
5. Add package README

**Validation:**
```bash
pnpm --filter @repo/ui test
pnpm --filter @repo/ui build
pnpm --filter web build
```

---

### 🟡 HIGH - Testing Infrastructure Setup (QA)
**Owner:** QA Team  
**Status:** 🔄 Ready to Start  
**Doc Ref:** `docs/refactor/cleanup-checklist.md:L81-L99`

**Problem:**
- Missing vitest configs in packages
- No test coverage for critical paths
- Testing infrastructure incomplete

**Packages Missing Tests:**
- ❌ `packages/ui` - No vitest.config.ts or tests
- ❌ `apps/web` - No vitest.config.ts or tests

**Tasks:**
1. Create shared vitest configuration in `@repo/testing`
2. Add vitest.config.ts to `packages/ui`
3. Add vitest.config.ts to `apps/web`
4. Backfill critical tests:
   - Auth stores/services
   - Toast system
   - Theme management
   - UI components (sample coverage)
5. Configure Playwright for E2E with Supabase seeding

**Validation:**
```bash
pnpm --filter @repo/ui test
pnpm --filter web test
pnpm --filter web test:e2e
```

---

### 🟢 MEDIUM - Environment Validation & Documentation (PLAT)
**Owner:** PLAT Team  
**Status:** 🔄 Ready to Start  
**Doc Ref:** `refactor-plans/refactor-roadmap.md:L16-L19`

**Problem:**
- Missing env validation for rate limit secrets
- No CI checks for required vars
- Incomplete .env.example documentation

**Files:**
- `apps/web/src/lib/server/rate-limiter.ts`
- `turbo.json`
- `.env.example` (needs creation/update)

**Tasks:**
1. Document all env vars in `.env.example`
2. Add runtime env validation
3. Create CI script to verify required vars
4. Update Turbo config with env var requirements
5. Document Supabase MCP env vars

**Validation:**
```bash
pnpm -w turbo run lint
pnpm -w turbo run check-types
# CI env validation script
```

---

### 🟢 MEDIUM - Svelte 5 Compliance Audit (FE)
**Owner:** FE Team  
**Status:** 🔄 Ready to Start  
**Doc Ref:** `docs/refactor/cleanup-checklist.md:L47-L65`

**Problem:**
- Mixed Svelte 5 compliance across codebase
- Legacy reactive patterns may exist
- Inconsistent rune usage

**Files to Audit:**
- ✅ VERIFIED: `packages/ui/src/lib/hooks/is-mobile.svelte.ts`
- 🔍 AUDIT: `apps/web/src/lib/services/realtime.svelte.ts`
- 🔍 AUDIT: `apps/web/src/lib/utils/error-handling.svelte.ts`
- 🔍 AUDIT: `apps/web/src/lib/stores/*.svelte.ts`

**Patterns to Verify:**
- Proper `$state`, `$derived`, `$effect` usage
- No legacy reactive patterns
- Context/factory patterns follow Svelte 5 best practices
- No module-scope mutations

**Tasks:**
1. Create Svelte 5 compliance checklist
2. Audit all `.svelte.ts` files
3. Refactor legacy patterns to runes
4. Document Svelte 5 patterns for team
5. Add linting rules to catch legacy patterns

**Validation:**
```bash
pnpm --filter web lint
pnpm --filter web check-types
pnpm --filter web test
```

---

### 🔵 LOW - Dependency Version Alignment (PLAT)
**Owner:** PLAT Team  
**Status:** ⏸️ Phase 2 Deferred  
**Doc Ref:** `docs/refactor/dependency-audit.md:L1-L100`

**Problem:**
- Version mismatches across packages
- Duplicate dependencies in lockfile
- Inconsistent tooling versions

**Blocked By:** Phase 1 completion

**Tasks:**
1. Align SvelteKit versions to `^2.36.2`
2. Align Svelte versions to `^5.36.12`
3. Deduplicate testing tools
4. Clean pnpm-lock.yaml
5. Update all package.json files

---

## Implementation Workflow (Every Ticket)

### 1. Planning Phase
- [ ] Read relevant doc sections
- [ ] Document what/why/blast radius in ticket
- [ ] Identify MCP checks needed (for BE tickets)
- [ ] Review with cross-discipline partner if boundary-crossing

### 2. Implementation Phase
- [ ] Create feature branch: `refactor/{ticket-name}`
- [ ] Make scoped changes with `refactor(scope):` commits
- [ ] Pair MCP backend checks with frontend refactor
- [ ] Keep commits atomic and reviewable

### 3. Validation Gate (REQUIRED BEFORE PUSH)
```bash
# Core validation suite
pnpm --filter @repo/i18n build
pnpm --filter @repo/ui test
pnpm --filter web test
pnpm --filter web test:e2e
pnpm --filter web build
pnpm --filter web build:metrics

# Full workspace validation (document quirks)
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run build
```

**Known Quirks (from Phase 4 validation):**
- ⚠️ Turbo network issues in some environments - use fallback `pnpm --filter` commands
- ⚠️ Document any sandbox/network limitations encountered

### 4. Documentation Phase
- [ ] Add notes to relevant Phase report file
- [ ] Record MCP findings in `phase-4-validation-log.md`
- [ ] Update `task-board.md` with completion status
- [ ] Flag blockers in Slack with doc link

### 5. PR Phase
- [ ] Open PR only when validation is green
- [ ] Include validation log snippet in PR description
- [ ] Request cross-discipline review if boundary-crossing
- [ ] Link to relevant doc sections

## MCP Command Reference

### Database Status & Validation
```bash
# List all tables
mcp_supabase_list_tables

# List migrations
mcp_supabase_list_migrations

# Execute SQL queries (for testing)
mcp_supabase_execute_sql --query "SELECT ..."

# Get security advisors
mcp_supabase_get_advisors --type security
mcp_supabase_get_advisors --type performance

# Get logs (last 1 minute only)
mcp_supabase_get_logs --service api
mcp_supabase_get_logs --service postgres
mcp_supabase_get_logs --service auth
```

### Schema Operations
```bash
# Apply migration (DDL operations)
mcp_supabase_apply_migration --name "migration_name" --query "SQL"

# Generate TypeScript types
mcp_supabase_generate_typescript_types

# List extensions
mcp_supabase_list_extensions
```

### Documentation
```bash
# Search Supabase docs
mcp_supabase_search_docs --graphql_query "{...}"
```

## Daily Standup Format

Post in Slack when starting a ticket:

```
🎫 Starting: [Ticket Name]
👤 Owner: [Your Name/Role]
📄 Doc Link: [Link to doc section]
🎯 Goal: [One-line description]
⏱️ ETA: [Expected completion]
```

Post when completing:

```
✅ Completed: [Ticket Name]
📊 Validation: [Green/Issues]
📝 Doc Update: [Link to report section]
🔍 MCP Findings: [New tables/policies/issues]
🚫 Blockers: [None or link to blocker doc]
```

## Current Sprint Focus

### Week 1 (Oct 1-7)
- Toast system consolidation (FE)
- Service-role hardening (BE)
- Testing infrastructure (QA)
- Env validation (PLAT)

### Week 2 (Oct 8-14)
- @repo/ui cleanup (FE)
- Svelte 5 compliance audit (FE)
- Supabase MCP auditing scripts (BE)
- Turbo pipeline docs (PLAT)

### Week 3+ (Oct 15+)
- Domain logic extraction (FE/BE)
- E2E test backfill (QA)
- Performance monitoring (PLAT)

## Git Workflow

### Branch Naming
```
refactor/toast-consolidation
refactor/service-role-hardening
refactor/ui-cleanup
test/vitest-setup
docs/mcp-integration
```

### Commit Format
```
refactor(toast): consolidate duplicate implementations
refactor(supabase): add service-role audit logging
test(ui): add vitest configuration
docs(mcp): document backend validation workflow
```

### PR Title Format
```
refactor: Toast system consolidation [BREAKING]
refactor: Service-role hardening + MCP integration
test: Add vitest configs for ui and web packages
docs: MCP integration workflow and validation
```

## Blocked Items & Dependencies

| Ticket | Blocked By | ETA |
|--------|-----------|-----|
| Dependency Version Alignment | Phase 1 completion | TBD |
| Domain Logic Extraction | Toast consolidation | Week 2 |
| E2E Test Backfill | Testing infrastructure | Week 2 |

## Success Metrics

### Code Quality
- [ ] All toast duplicates removed
- [ ] Zero service-role operations without audit logging
- [ ] @repo/ui exports only production-ready components
- [ ] All `.svelte.ts` files Svelte 5 compliant

### Testing
- [ ] `packages/ui` has vitest config + tests
- [ ] `apps/web` has vitest config + tests
- [ ] E2E smoke tests passing
- [ ] Coverage thresholds enforced

### Documentation
- [ ] All MCP findings documented
- [ ] Task board updated daily
- [ ] Validation logs complete
- [ ] Team workflow documented

### Security
- [ ] All 3 Supabase security advisors addressed
- [ ] Service-role usage audited
- [ ] RLS policies validated with MCP

## Emergency Contacts & Resources

### Documentation
- Main roadmap: `refactor-plans/refactor-roadmap.md`
- Current checklist: `docs/refactor/cleanup-checklist.md`
- Validation log: `docs/refactor/reports/phase-4-validation-log.md`

### Supabase
- Project: `koowfhsaqmarfdkwsfiz`
- [Security Remediation](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Database Upgrade Guide](https://supabase.com/docs/guides/platform/upgrading)

### Slack Channels
- Post ticket updates with doc links
- Flag blockers immediately with doc section reference

---

**Last Updated:** October 1, 2025  
**Next Review:** Daily standup  
**Status Dashboard:** `docs/refactor/task-board.md`
