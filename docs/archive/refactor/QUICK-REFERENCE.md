<!-- DEPRECATED: This documentation has been archived and is no longer maintained. -->
<!-- For current documentation, see: https://github.com/w3bsuki/driploxyz/blob/main/docs/refactor/phase-7/ -->
<!-- Archived on: 2025-10-05 -->

# Phase 2-4 Quick Reference Card

**Kickoff Date:** October 1, 2025  
**Full Doc:** `docs/refactor/PHASE-2-4-KICKOFF.md`

## 🚀 Getting Started

### 1. Environment Check
```bash
# Verify versions
node -v    # Expected: v22.20.0
pnpm -v    # Expected: 9.15.4

# Sync with remote
git pull origin main
pnpm install
```

### 2. Supabase MCP Quick Test
```bash
# MCP is configured in .vscode/mcp.json
# Test via GitHub Copilot Chat:
"@supabase list tables"
"@supabase get advisors for security"
```

### 3. Claim Your Ticket
- Read the full ticket in `docs/refactor/PHASE-2-4-KICKOFF.md`
- Update `docs/refactor/task-board.md` with your name
- Post in Slack: "🎫 Starting: [Ticket Name] | Owner: [You] | Doc: [Link]"

## 🎯 Current Sprint Priorities (Week 1)

| Priority | Ticket | Owner | Status |
|----------|--------|-------|--------|
| 🔴 CRITICAL | Toast System Consolidation | FE | 🔄 Ready |
| 🟡 HIGH | Service-Role Hardening + MCP | BE | 🔄 Ready |
| 🟡 HIGH | @repo/ui Cleanup | FE | 🔄 Ready |
| 🟡 HIGH | Testing Infrastructure | QA | 🔄 Ready |
| 🟢 MEDIUM | Env Validation | PLAT | 🔄 Ready |
| 🟢 MEDIUM | Svelte 5 Compliance | FE | 🔄 Ready |

## ✅ Validation Commands (Run Before Every PR)

```bash
# Core validation (always required)
pnpm --filter @repo/i18n build
pnpm --filter @repo/ui test
pnpm --filter web test
pnpm --filter web test:e2e
pnpm --filter web build
pnpm --filter web build:metrics

# Workspace validation (document any quirks)
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run build
```

## 🔧 MCP Commands Cheat Sheet

### Database Inspection
```bash
# List all tables
@supabase list tables

# List migrations
@supabase list migrations

# Execute SQL query
@supabase execute sql: "SELECT * FROM profiles LIMIT 5"
```

### Security & Monitoring
```bash
# Get security advisors
@supabase get advisors for security

# Get performance advisors
@supabase get advisors for performance

# Get logs (last 1 minute only!)
@supabase get logs for api
@supabase get logs for postgres
@supabase get logs for auth
```

### Schema Operations
```bash
# Apply migration (DDL only)
@supabase apply migration: "migration_name" with query: "SQL"

# Generate TypeScript types
@supabase generate typescript types

# List extensions
@supabase list extensions
```

## 📝 Commit & PR Format

### Branch Naming
```
refactor/toast-consolidation
refactor/service-role-hardening
test/vitest-setup
docs/mcp-integration
```

### Commit Messages
```
refactor(toast): consolidate duplicate implementations
refactor(supabase): add service-role audit logging
test(ui): add vitest configuration
docs(mcp): document backend validation workflow
```

### PR Template
```markdown
## What
[One-line description]

## Why
[Reference to doc section]

## Validation
- [x] pnpm --filter @repo/i18n build
- [x] pnpm --filter @repo/ui test
- [x] pnpm --filter web test
- [x] pnpm --filter web test:e2e
- [x] pnpm --filter web build
- [x] pnpm --filter web build:metrics

## MCP Findings (if applicable)
- Security: [any new advisors]
- Tables: [any schema changes]
- Logs: [any errors/warnings]

## Doc Updates
- [x] Updated `docs/refactor/task-board.md`
- [x] Updated `docs/refactor/reports/phase-4-validation-log.md`
- [x] Added notes to [relevant phase report]

## Blockers
[None or link to blocker doc section]
```

## 🚨 Known Issues & Quirks

### Network Issues
- ⚠️ Turbo may fail with `ENETUNREACH` in some environments
- **Fallback:** Use direct `pnpm --filter` commands
- **Document:** Add note in validation log about your environment

### Version Mismatches
- ⚠️ Node upgraded from v22.12.0 → v22.20.0
- ⚠️ pnpm upgraded from 8.15.6 → 9.15.4
- **Action:** Update if you encounter issues

### Supabase Security Advisors (3 Active)
1. **Auth OTP Long Expiry** - Configure to <1 hour
2. **Leaked Password Protection Disabled** - Enable HaveIBeenPwned
3. **Postgres Version Patches** - Schedule upgrade

## 📚 Documentation Quick Links

### Core Docs
- **Kickoff Doc:** `docs/refactor/PHASE-2-4-KICKOFF.md`
- **Task Board:** `docs/refactor/task-board.md`
- **Validation Log:** `docs/refactor/reports/phase-4-validation-log.md`
- **Cleanup Checklist:** `docs/refactor/cleanup-checklist.md`

### Reference Docs
- **Roadmap:** `refactor-plans/refactor-roadmap.md`
- **Dependency Audit:** `docs/refactor/dependency-audit.md`
- **Testing Guidelines:** `docs/testing/testing-guidelines.md`

### Supabase
- **Project ID:** `koowfhsaqmarfdkwsfiz`
- **Tables:** 45 in public schema
- **Migrations:** 312 applied

## 🎤 Daily Standup Format

### Starting a Ticket
```
🎫 Starting: [Ticket Name]
👤 Owner: [Your Name/Role]
📄 Doc Link: [Link to kickoff doc section]
🎯 Goal: [One-line description]
⏱️ ETA: [Expected completion]
```

### Completing a Ticket
```
✅ Completed: [Ticket Name]
📊 Validation: [Green/Issues]
📝 Doc Update: [Link to report section]
🔍 MCP Findings: [New tables/policies/issues]
🚫 Blockers: [None or link to blocker doc]
```

## 🆘 Emergency Contacts

### Stuck on Validation?
1. Check `docs/refactor/reports/phase-4-validation-log.md` for known issues
2. Try fallback `pnpm --filter` commands if Turbo fails
3. Document your environment quirks in validation log

### Stuck on MCP?
1. Verify MCP config in `.vscode/mcp.json`
2. Check connection: `@supabase list tables`
3. Refer to MCP commands in kickoff doc

### Stuck on Implementation?
1. Re-read the relevant doc section
2. Check if ticket is blocked by another
3. Post in Slack with doc link to specific blocker

---

**Remember:** MCP is the source of truth for backend state. Always validate with MCP before and after schema changes!

**Last Updated:** October 1, 2025
