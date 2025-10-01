# Codex Web: Phase 2-4 Refactor Execution Prompt

**Date:** October 1, 2025  
**Repository:** driploxyz (w3bsuki/driploxyz)  
**Branch:** `codex/audit-codebase-and-create-documentation`  
**Workspace Root:** `k:\driplo-turbo-1`

---

## 🎯 MISSION BRIEFING

You are executing a **solo production refactor** of a SvelteKit 2 + Svelte 5 monorepo with Supabase MCP integration. This is a **5-ticket sprint** focused on eliminating technical debt, hardening security, and establishing testing infrastructure.

**Current Status:**
- ✅ Ticket 1 (Toast Consolidation) - **COMPLETE** (478 lines removed, 7 components migrated)
- ⏸️ Tickets 2-6 - **READY TO START**

**Your Role:**
- Execute tickets 2-6 following documented workflow
- Use Supabase MCP for backend validation
- Maintain production-ready quality (Svelte 5 runes, TypeScript strict)
- Document all changes and validation results

---

## 📚 CRITICAL CONTEXT - READ FIRST

### Repository Structure
```
k:\driplo-turbo-1/
├── apps/
│   ├── web/          # Main SvelteKit storefront (Svelte 5 runes)
│   ├── admin/        # Admin dashboard
│   └── docs/         # Documentation site
├── packages/
│   ├── ui/           # @repo/ui - Shared components (Melt UI + Svelte 5)
│   ├── core/         # @repo/core - Business logic
│   ├── database/     # @repo/database - Supabase types
│   ├── i18n/         # @repo/i18n - Internationalization
│   └── testing/      # @repo/testing - Shared test utilities
└── docs/refactor/    # **YOUR COMMAND CENTER** ⬅️ START HERE
    ├── PHASE-2-4-KICKOFF.md      # Full ticket specs & context
    ├── QUICK-REFERENCE.md         # Commands & workflow
    ├── task-board.md              # Sprint tracker (update this!)
    └── reports/
        └── phase-4-validation-log.md  # Document results here
```

### Technology Stack
- **Frontend:** SvelteKit 2.36.2, Svelte 5.36.12 (runes mode), Tailwind v4
- **Backend:** Supabase (45 tables, 312 migrations)
- **Testing:** Vitest, Playwright, @testing-library/svelte
- **Build:** Turbo monorepo, pnpm workspaces
- **Node:** v22.20.0, pnpm 9.15.4

### Supabase MCP Integration
- **Status:** ✅ CONNECTED & VALIDATED
- **Project Ref:** `koowfhsaqmarfdkwsfiz`
- **Connection:** Configured in `.vscode/mcp.json`
- **Commands:** Available via GitHub Copilot Chat with `@supabase` prefix

---

## 🎫 REMAINING TICKETS (Priority Order)

### 🟡 TICKET 2: Supabase Service-Role Hardening (BE)
**Priority:** HIGH  
**Owner:** BE Team (YOU)  
**Status:** 🔄 Ready to Start

**📖 Full Spec:** `docs/refactor/PHASE-2-4-KICKOFF.md:L107-L142`

**Problem:**
- Service-role clients not lazily loaded (security risk)
- No audit logging for privileged operations
- Missing connection pooling and error handling

**Files to Modify:**
1. `packages/core/src/lib/supabase-server.ts` - Add lazy loading + audit logging
2. `packages/core/src/lib/supabase-admin.ts` - Add connection pooling
3. Create `packages/core/src/lib/audit-logger.ts` - New audit logging utility

**Implementation Steps:**
1. **Lazy Loading Pattern:**
   ```typescript
   // BEFORE (bad):
   export const supabaseAdmin = createClient(url, serviceRoleKey);
   
   // AFTER (good):
   let _supabaseAdmin: SupabaseClient | null = null;
   export function getSupabaseAdmin() {
     if (!_supabaseAdmin) {
       _supabaseAdmin = createClient(url, serviceRoleKey);
     }
     return _supabaseAdmin;
   }
   ```

2. **Audit Logging Pattern:**
   ```typescript
   export async function auditLog(action: string, metadata: Record<string, any>) {
     // Log to Supabase audit table using MCP validation
     await supabaseAdmin.from('audit_logs').insert({
       action,
       metadata,
       timestamp: new Date().toISOString(),
       user_id: metadata.user_id
     });
   }
   ```

3. **Connection Pooling:**
   - Configure `db.poolSize` in createClient options
   - Add connection retry logic with exponential backoff
   - Document pooling limits in comments

**MCP Validation Commands:**
```bash
# Via GitHub Copilot Chat:
"@supabase list tables"  # Verify audit_logs table exists
"@supabase execute sql 'SELECT COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 hour''"
"@supabase get advisors for security"  # Re-check security warnings
```

**Validation Gate:**
```bash
pnpm --filter @repo/core test
pnpm --filter web test
pnpm -w turbo run check-types
```

**Success Criteria:**
- All service-role clients use lazy loading pattern
- Audit logs written for privileged operations (user creation, deletion, role changes)
- Connection pooling configured with documented limits
- MCP security advisors show no new warnings
- All tests pass

---

### 🟡 TICKET 3: @repo/ui Package Cleanup (FE)
**Priority:** HIGH  
**Owner:** FE Team (YOU)  
**Status:** 🔄 Ready to Start

**📖 Full Spec:** `docs/refactor/PHASE-2-4-KICKOFF.md:L144-L192`

**Problem:**
- Demo/test files in production package
- Service layer modules mixed with UI components
- Unclear public API surface

**Files to Remove:**
```
packages/ui/src/lib/demo/               # All demo files
packages/ui/src/lib/test/                # Test files (move to __tests__)
packages/ui/src/lib/services/api-client.ts  # Move to @repo/core
packages/ui/src/lib/services/supabase-client.ts  # Move to @repo/core
```

**Implementation Steps:**
1. **Audit Current Structure:**
   ```bash
   # Find all demo/test files
   Get-ChildItem -Path "K:\driplo-turbo-1\packages\ui\src\lib" -Recurse -Include "*demo*","*test*","*.test.*","*.spec.*"
   ```

2. **Move Service Files to @repo/core:**
   ```bash
   # Move api-client.ts
   Move-Item "packages/ui/src/lib/services/api-client.ts" "packages/core/src/lib/api-client.ts"
   
   # Update all imports across codebase
   # OLD: import { apiClient } from '@repo/ui'
   # NEW: import { apiClient } from '@repo/core'
   ```

3. **Update index.ts Exports:**
   - Remove demo/test exports
   - Document remaining public API with JSDoc
   - Group exports by category (components, utilities, types)

4. **Verify No Breaking Changes:**
   ```bash
   # Search for any remaining imports
   grep -r "from '@repo/ui/demo'" apps/
   grep -r "from '@repo/ui/services'" apps/
   ```

**Validation Gate:**
```bash
pnpm --filter @repo/ui build
pnpm --filter @repo/ui test
pnpm --filter web build
pnpm --filter admin build
pnpm -w turbo run lint
```

**Success Criteria:**
- No demo/test files in `packages/ui/src/lib/`
- Service modules moved to `@repo/core`
- All import paths updated across apps
- Package builds successfully
- Bundle size reduced (check with `build:metrics`)

---

### 🟡 TICKET 4: Testing Infrastructure Setup (QA)
**Priority:** HIGH  
**Owner:** QA Team (YOU)  
**Status:** 🔄 Ready to Start

**📖 Full Spec:** `docs/refactor/PHASE-2-4-KICKOFF.md:L194-L250`

**Problem:**
- Missing vitest configs in key packages
- No test coverage for critical paths
- Playwright not integrated with CI

**Implementation Steps:**

1. **Add vitest.config.ts to Missing Packages:**
   Create in: `packages/core/`, `packages/database/`, `apps/admin/`
   
   ```typescript
   // packages/core/vitest.config.ts
   import { defineConfig } from 'vitest/config';
   
   export default defineConfig({
     test: {
       environment: 'node',
       globals: true,
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
         exclude: ['**/*.test.ts', '**/node_modules/**']
       }
     }
   });
   ```

2. **Create Backfill Tests for Critical Paths:**
   
   **@repo/core Critical Paths:**
   - `packages/core/src/lib/__tests__/supabase-admin.test.ts` - Lazy loading logic
   - `packages/core/src/lib/__tests__/audit-logger.test.ts` - Audit log validation
   - `packages/core/src/lib/__tests__/api-client.test.ts` - Error handling
   
   **apps/web Critical Paths:**
   - `apps/web/src/lib/__tests__/utils/error-handling.test.ts` - parseError function
   - `apps/web/src/lib/__tests__/auth/AuthProvider.test.ts` - Auth state management

3. **Playwright CI Integration:**
   ```yaml
   # Add to .github/workflows/test.yml (create if missing)
   name: Test Suite
   on: [push, pull_request]
   jobs:
     e2e:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: pnpm/action-setup@v2
         - run: pnpm install
         - run: pnpm --filter web test:e2e
   ```

4. **Update package.json Scripts:**
   ```json
   // packages/core/package.json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

**Validation Gate:**
```bash
pnpm --filter @repo/core test
pnpm --filter @repo/database test
pnpm --filter admin test
pnpm --filter web test
pnpm --filter web test:e2e
```

**Success Criteria:**
- All packages have vitest.config.ts
- At least 3 new tests per critical module
- Playwright runs in CI (mock environment)
- Test coverage >50% for @repo/core
- All tests pass

---

### 🟢 TICKET 5: Environment Validation & Documentation (PLAT)
**Priority:** MEDIUM  
**Owner:** PLAT Team (YOU)  
**Status:** 🔄 Ready to Start

**📖 Full Spec:** `docs/refactor/PHASE-2-4-KICKOFF.md:L252-L298`

**Problem:**
- Node/pnpm versions differ from Phase 4 docs
- .env.example files outdated
- Missing environment variable validation

**Implementation Steps:**

1. **Update .env.example Files:**
   ```bash
   # apps/web/.env.example
   PUBLIC_SUPABASE_URL=https://koowfhsaqmarfdkwsfiz.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # ⚠️ NEVER COMMIT
   
   # MCP Integration
   SUPABASE_ACCESS_TOKEN=your_access_token  # For MCP commands
   SUPABASE_PROJECT_REF=koowfhsaqmarfdkwsfiz
   
   # Environment
   NODE_ENV=development
   ```

2. **Create Environment Validator:**
   Create `packages/core/src/lib/env-validator.ts`:
   ```typescript
   export function validateEnv() {
     const required = [
       'PUBLIC_SUPABASE_URL',
       'PUBLIC_SUPABASE_ANON_KEY'
     ];
     
     const missing = required.filter(key => !process.env[key]);
     if (missing.length > 0) {
       throw new Error(`Missing env vars: ${missing.join(', ')}`);
     }
   }
   ```

3. **Add Version Check Script:**
   Create `scripts/check-versions.mjs`:
   ```javascript
   import { execSync } from 'child_process';
   
   const expected = {
     node: 'v22.20.0',
     pnpm: '9.15.4'
   };
   
   const actual = {
     node: execSync('node -v').toString().trim(),
     pnpm: execSync('pnpm -v').toString().trim()
   };
   
   console.log('✅ Node:', actual.node === expected.node ? 'OK' : `WARN: Expected ${expected.node}, got ${actual.node}`);
   console.log('✅ pnpm:', actual.pnpm === expected.pnpm ? 'OK' : `WARN: Expected ${expected.pnpm}, got ${actual.pnpm}`);
   ```

4. **Update Documentation:**
   - Update Phase 4 planning doc with actual versions (v22.20.0, pnpm 9.15.4)
   - Add "Environment Setup" section to main README.md
   - Document MCP setup in DEVELOPMENT.md

**Validation Gate:**
```bash
node scripts/check-versions.mjs
pnpm --filter @repo/core test  # env-validator tests
pnpm -w turbo run build
```

**Success Criteria:**
- .env.example updated in all apps
- Environment validator created and tested
- Version check script added to package.json
- Documentation updated with actual versions
- All builds succeed

---

### 🟢 TICKET 6: Svelte 5 Compliance Audit (FE)
**Priority:** MEDIUM  
**Owner:** FE Team (YOU)  
**Status:** 🔄 Ready to Start

**📖 Full Spec:** `docs/refactor/PHASE-2-4-KICKOFF.md:L300-L362`

**Problem:**
- Legacy Svelte 4 patterns in codebase
- Inconsistent use of runes ($state, $derived, $effect)
- Store subscriptions not using $state wrapper

**Implementation Steps:**

1. **Audit for Legacy Patterns:**
   ```powershell
   # Find reactive declarations (Svelte 4 style)
   Select-String -Path "apps/web/src/**/*.svelte" -Pattern '\$:' -CaseSensitive
   
   # Find store subscriptions
   Select-String -Path "apps/web/src/**/*.svelte" -Pattern '\$writable|\$readable' -CaseSensitive
   
   # Find lifecycle hooks
   Select-String -Path "apps/web/src/**/*.svelte" -Pattern 'onMount|onDestroy|beforeUpdate|afterUpdate' -CaseSensitive
   ```

2. **Migration Patterns:**
   
   **Reactive Declarations → $derived:**
   ```svelte
   <!-- BEFORE (Svelte 4): -->
   <script>
     export let count;
     $: doubled = count * 2;
   </script>
   
   <!-- AFTER (Svelte 5): -->
   <script>
     let { count } = $props();
     let doubled = $derived(count * 2);
   </script>
   ```
   
   **Store Subscriptions → $state:**
   ```svelte
   <!-- BEFORE: -->
   <script>
     import { writable } from 'svelte/store';
     const count = writable(0);
     let value;
     count.subscribe(v => value = v);
   </script>
   
   <!-- AFTER: -->
   <script>
     let count = $state(0);
   </script>
   ```
   
   **onMount → $effect:**
   ```svelte
   <!-- BEFORE: -->
   <script>
     import { onMount } from 'svelte';
     onMount(() => {
       console.log('mounted');
     });
   </script>
   
   <!-- AFTER: -->
   <script>
     $effect(() => {
       console.log('mounted');
     });
   </script>
   ```

3. **Priority Files for Migration:**
   - `apps/web/src/lib/components/ErrorBoundary.svelte` (already using runes ✅)
   - `apps/web/src/lib/components/RealtimeManager.svelte` (already using runes ✅)
   - `apps/web/src/routes/+layout.svelte` - **CHECK THIS FILE**
   - `apps/web/src/lib/components/Header.svelte` - **CHECK THIS FILE**
   - Any component with `$:` reactive declarations

4. **Create Migration Checklist:**
   Create `docs/refactor/svelte5-migration-checklist.md`:
   ```markdown
   # Svelte 5 Migration Checklist
   
   ## Pattern Reference
   - [ ] `$:` → `$derived()` or `$effect()`
   - [ ] `export let` → `let { prop } = $props()`
   - [ ] Store subscriptions → `$state()`
   - [ ] `onMount` → `$effect()`
   - [ ] Event handlers: `on:click` → `onclick`
   
   ## Files Migrated
   - [x] ErrorBoundary.svelte
   - [x] RealtimeManager.svelte
   - [ ] +layout.svelte
   - [ ] Header.svelte
   ```

**Validation Gate:**
```bash
pnpm --filter web check  # svelte-check for errors
pnpm --filter web test
pnpm --filter web build
pnpm -w turbo run check-types
```

**Success Criteria:**
- No `$:` reactive declarations remain
- All stores migrated to runes
- Event handlers use lowercase (onclick, not onClick)
- Migration checklist documented
- All type checks pass

---

## 🔄 WORKFLOW FOR EACH TICKET

### Before Starting
1. **Read Full Spec:** `docs/refactor/PHASE-2-4-KICKOFF.md` (find your ticket)
2. **Update Task Board:** `docs/refactor/task-board.md`
   - Change status: `🔄 Ready to Start` → `🏗️ IN PROGRESS`
   - Add your name as owner
   - Add start timestamp

3. **Create Feature Branch:** (if needed)
   ```bash
   git checkout -b refactor/ticket-2-service-role-hardening
   ```

### During Implementation
1. **Make Changes** following the spec exactly
2. **Run Tests Continuously:**
   ```bash
   # After each file change:
   pnpm --filter <package> test
   ```

3. **Use MCP for Backend Validation:**
   ```
   "@supabase list tables"
   "@supabase execute sql '<your query>'"
   "@supabase get advisors for security"
   ```

4. **Document as You Go:**
   - Add notes to `docs/refactor/reports/phase-4-validation-log.md`
   - Format:
     ```markdown
     ## 🎫 Ticket X: [Name]
     **Started:** [Timestamp]
     **Status:** 🏗️ IN PROGRESS
     
     ### Changes Made:
     - File 1: [description]
     - File 2: [description]
     
     ### Issues Encountered:
     - Problem: [description]
     - Solution: [description]
     ```

### Before Committing
1. **Run Full Validation Gate:**
   ```bash
   # From QUICK-REFERENCE.md:
   pnpm --filter @repo/i18n build
   pnpm --filter @repo/ui test
   pnpm --filter web test
   pnpm --filter web test:e2e
   pnpm --filter web build
   pnpm --filter web build:metrics
   pnpm -w turbo run lint
   pnpm -w turbo run check-types
   pnpm -w turbo run build
   ```

2. **Check for TypeScript Errors:**
   ```bash
   Get-ChildItem -Recurse -Include "*.svelte","*.ts" | ForEach-Object { 
     pnpm exec svelte-check --tsconfig ./tsconfig.json 
   }
   ```

3. **MCP Final Validation:**
   - Re-run security advisors
   - Verify database state unchanged
   - Check for new warnings

### After Completion
1. **Update Task Board:**
   - Change status: `🏗️ IN PROGRESS` → `✅ COMPLETE`
   - Add completion timestamp
   - Add summary of changes

2. **Update Validation Log:**
   - Add completion section with results
   - Document any deviations from spec
   - List validation command outputs

3. **Commit with Template:**
   ```bash
   git add .
   git commit -m "refactor: [TICKET-X] Brief description
   
   - Change 1
   - Change 2
   - Change 3
   
   Validation:
   - ✅ Tests pass
   - ✅ Build succeeds
   - ✅ Type checks pass
   - ✅ MCP validation clean
   
   Closes #[ticket-number]"
   ```

---

## 🚨 CRITICAL RULES

### Code Quality Standards
- **TypeScript Strict Mode:** No `any`, no `@ts-ignore` without justification
- **Svelte 5 Runes:** Use `$state`, `$derived`, `$effect` (not `$:`)
- **Event Handlers:** Lowercase only (`onclick`, not `onClick`)
- **Imports:** Absolute paths with `@repo/*` or `$lib/*`
- **Comments:** JSDoc for public APIs, inline for complex logic

### Testing Requirements
- **Unit Tests:** Every new utility function
- **Integration Tests:** Every API endpoint change
- **E2E Tests:** Critical user flows (auth, checkout, messaging)
- **Coverage Target:** >50% for new code

### MCP Integration
- **Always Validate:** Run MCP commands after backend changes
- **Security First:** Check advisors before and after
- **Document Queries:** Save MCP command outputs to validation log

### Git Workflow
- **Small Commits:** One logical change per commit
- **Descriptive Messages:** Use conventional commit format
- **Branch Strategy:** One branch per ticket (optional for solo run)
- **Never Force Push:** Preserve history

### Performance
- **Bundle Size:** Check with `build:metrics` after UI changes
- **Database Queries:** Use MCP to verify indexes
- **Image Optimization:** Verify webp/avif conversion
- **Lazy Loading:** Check dynamic imports

---

## 📊 SUCCESS METRICS

Track these in `docs/refactor/reports/phase-4-validation-log.md`:

### Code Health
- [ ] Lines of code removed: Target >1000
- [ ] Bundle size reduction: Target >10%
- [ ] Test coverage increase: Target +20%
- [ ] TypeScript errors fixed: Target -50

### Security
- [ ] Service-role clients hardened: All lazy loaded
- [ ] Audit logging implemented: All privileged ops
- [ ] MCP security warnings: Reduced to 0 (or documented)
- [ ] Environment validation: All .env files updated

### Testing
- [ ] New tests added: Target >50 tests
- [ ] E2E coverage: Critical paths covered
- [ ] CI integration: Playwright runs on push
- [ ] Test execution time: <5 min for unit tests

### Documentation
- [ ] All tickets documented: Completion notes in validation log
- [ ] API changes documented: JSDoc comments added
- [ ] Migration guides: Svelte 5 checklist complete
- [ ] Environment setup: README updated

---

## 🆘 TROUBLESHOOTING

### Common Issues

**1. MCP Connection Lost**
```bash
# Check MCP status via Copilot Chat:
"@supabase list tables"

# If fails, check .vscode/mcp.json has correct project ref
```

**2. Turbo Build Hangs**
```bash
# Kill and restart:
Get-Process -Name "node" | Where-Object { $_.Path -like "*turbo*" } | Stop-Process
pnpm -w turbo run build --force
```

**3. TypeScript Errors After Migration**
```bash
# Clear caches:
Remove-Item -Recurse -Force node_modules/.vite
Remove-Item -Recurse -Force .svelte-kit
pnpm install
```

**4. Test Failures in CI**
```bash
# Run locally first:
pnpm --filter web test:e2e
# Check Playwright trace:
npx playwright show-trace trace.zip
```

### Emergency Contacts
- **Supabase Issues:** Check MCP advisors first
- **Build Issues:** See `DEVELOPMENT.md`
- **Git Issues:** See `CONTRIBUTING.md`

---

## 📝 FINAL CHECKLIST

Before marking sprint complete:

- [ ] All 5 tickets complete (2-6)
- [ ] Task board updated with all changes
- [ ] Validation log has completion notes for each ticket
- [ ] All validation gates passed
- [ ] MCP security warnings addressed
- [ ] Git commits follow template
- [ ] README updated with environment setup
- [ ] All tests passing
- [ ] Build succeeds across all packages
- [ ] Bundle size metrics documented

---

## 🎉 YOU'RE READY!

Start with **Ticket 2 (Service-Role Hardening)** as it unblocks security improvements. Then proceed in priority order: 3 → 4 → 5 → 6.

Remember:
- Read the full ticket spec before starting
- Update task board as you progress  
- Use MCP for all backend validation
- Document everything in the validation log
- Run validation gate before committing

**Good luck! 🚀**
