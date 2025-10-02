# Phase 5 Execution Prompt

**Use this prompt to start Phase 5 work with an AI assistant**

---

## Context Setup Prompt

```
I'm starting Phase 5 of our monorepo refactor: Business Logic Consolidation & Architecture Rationalization.

PHASES COMPLETED:
✅ Phase 1: Environment & Schema Stabilization (95%)
✅ Phase 2: Dependency & Tooling Simplification (95%) 
✅ Phase 3: Code Cleanup & Testing Infrastructure (100%)
✅ Phase 4: Production Readiness & Build Optimization (100%)

PROJECT CONTEXT:
- Monorepo: Turborepo + pnpm workspaces
- Apps: web (SvelteKit), admin (SvelteKit), docs (SvelteKit)
- Packages: @repo/core, @repo/ui, @repo/database, @repo/i18n, @repo/testing
- Tech Stack: SvelteKit 2, Svelte 5, TypeScript, Supabase, Stripe, Tailwind 4
- Node: v22.20.0, pnpm: 9.15.4

CURRENT ISSUE:
Business logic is scattered across apps/web/src/lib/services (40+ files) and needs to be 
extracted into shared packages for reuse across all apps.

PHASE 5 GOALS:
1. Create new @repo/domain package for business logic
2. Extract services from apps/web to @repo/core and @repo/domain
3. Move Stripe logic to @repo/core/stripe
4. Move email services to @repo/core/email  
5. Clean up @repo/ui package (remove service modules)
6. Implement service-role hardening for security
7. Complete Phase 1 cleanup items (Supabase SDK upgrade, rate limiter)

DOCUMENTATION:
- Full kickoff doc: docs/refactor/PHASE-5-KICKOFF.md
- Phase 1-4 reports: docs/refactor/reports/
- Architecture: ARCHITECTURE.md
- Development: DEVELOPMENT.md

CONSTRAINTS:
- Zero breaking changes to production functionality
- Maintain or improve test coverage
- Full TypeScript type safety
- All changes must pass: lint, check-types, test, build
- Use Supabase MCP tools for validation

Please review docs/refactor/PHASE-5-KICKOFF.md and help me execute the tasks in order.
Start with Task 11 (Phase 1 cleanup) followed by Task 1 (domain package setup).
```

---

## Task-Specific Prompts

### Task 11: Phase 1 Cleanup
```
Let's start Phase 5 with Task 11 - completing Phase 1 cleanup items:

1. Upgrade @supabase/supabase-js in apps/web from 2.51.0 to ^2.56.0
2. Regenerate Supabase types after upgrade
3. Fix rate limiter environment validation (add RATE_LIMIT_SECRET properly)
4. Update .env.example with required env vars
5. Add CI checks for env validation

Files to modify:
- apps/web/package.json (Supabase version)
- apps/web/src/lib/server/rate-limiter.ts (env validation)
- .env.example (documentation)

After changes, validate:
- pnpm install
- pnpm --filter @repo/database generate-types
- pnpm --filter web check-types
- pnpm --filter web test
- pnpm --filter web build

Refer to: docs/refactor/PHASE-5-KICKOFF.md Task 11
```

### Task 1: Domain Package Setup
```
Now let's create the @repo/domain package foundation:

Create packages/domain/ with:
- package.json (with proper exports for services, validation, types)
- tsconfig.json (extending @repo/typescript-config/base.json)
- eslint.config.ts (using @repo/eslint-config)
- tsup.config.ts (for building)
- README.md (documenting purpose and usage)
- src/ directory structure:
  - services/ (business services)
    - products/
    - orders/
    - profiles/
    - messaging/
    - payments/
  - validation/ (business rules)
  - types/ (domain types)

Dependencies needed:
- @repo/database (workspace)
- @repo/core (workspace)
- @supabase/supabase-js
- zod (for validation)

Validate:
- pnpm --filter @repo/domain build
- pnpm --filter @repo/domain check-types
- pnpm --filter @repo/domain lint

Refer to: docs/refactor/PHASE-5-KICKOFF.md Task 1
```

### Task 2: Extract Product Services
```
Extract product-related services from apps/web to @repo/domain:

Files to migrate:
- apps/web/src/lib/services/products.ts → packages/domain/src/services/products/index.ts
- apps/web/src/lib/services/category.ts → packages/domain/src/services/products/category.ts
- apps/web/src/lib/services/categories.ts → packages/domain/src/services/products/categories.ts
- apps/web/src/lib/services/brandService.ts → packages/domain/src/services/products/brands.ts
- apps/web/src/lib/services/collections.ts → packages/domain/src/services/products/collections.ts

For each file:
1. Copy to new location in domain package
2. Update imports to use @repo/database, @repo/core
3. Add unit tests in __tests__ directory
4. Update all consumers in apps/web to import from @repo/domain
5. Remove old file after validation
6. Update exports in packages/domain/package.json

Validate after each migration:
- pnpm --filter @repo/domain test
- pnpm --filter web check-types
- pnpm --filter web build

Refer to: docs/refactor/PHASE-5-KICKOFF.md Task 2
```

### Task 5: Extract Stripe Services
```
Extract Stripe and payment logic to @repo/core:

Files to migrate:
- apps/web/src/lib/stripe/server.ts → packages/core/src/stripe/server.ts
- apps/web/src/lib/stripe/client.ts → packages/core/src/stripe/client.ts
- apps/web/src/lib/services/stripe.ts → packages/core/src/stripe/services.ts

CRITICAL: This handles payment processing - test thoroughly!

Steps:
1. Create packages/core/src/stripe/ directory
2. Move Stripe configuration and initialization
3. Extract webhook verification logic
4. Add comprehensive tests for payment flows
5. Update environment variable documentation
6. Ensure proper error handling and logging
7. Update all import references in apps/web

Test with Stripe test mode:
- pnpm --filter @repo/core test
- pnpm --filter web test
- pnpm --filter web test:e2e (test payment flows)

Refer to: docs/refactor/PHASE-5-KICKOFF.md Task 5
```

### Task 10: Service-Role Hardening
```
Implement service-role security hardening:

Files to update:
- apps/web/src/lib/server/supabase.server.ts
- supabase/functions/send-message/index.ts

Changes:
1. Implement lazy-loading for service-role clients
2. Add audit logging wrapper for privileged operations
3. Review all service-role usage across codebase
4. Add MCP-backed validation scripts
5. Document service-role usage patterns

Security requirements:
- Log all service-role operations
- Implement rate limiting for privileged operations
- Add environment variable validation
- Test RLS bypass scenarios

Use Supabase MCP tools for validation:
- mcp_supabase_get_advisors --type security
- mcp_supabase_get_logs --service api

Validate:
- pnpm --filter web test
- pnpm --filter web build

Refer to: docs/refactor/PHASE-5-KICKOFF.md Task 10
```

---

## Validation Checklist

After completing any task:

```
Run these validation commands and document results:

✅ Lint check:
pnpm --filter [package] lint

✅ Type check:
pnpm --filter [package] check-types

✅ Unit tests:
pnpm --filter [package] test

✅ Build:
pnpm --filter [package] build

✅ Web app validation:
pnpm --filter web check-types
pnpm --filter web test
pnpm --filter web build

✅ Full workspace (at phase completion):
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run test
pnpm -w turbo run build

Document results in: docs/refactor/reports/phase-5-validation-log.md
```

---

## Progress Tracking

Update these files as you work:

1. **docs/refactor/task-board.md**
   - Add Phase 5 section
   - Mark completed tasks
   - Note any blockers

2. **docs/refactor/reports/phase-5-validation-log.md**
   - Log all validation command outputs
   - Document any issues encountered
   - Track resolution steps

3. **docs/refactor/reports/phase-5-completion-report.md**
   - Final summary at phase completion
   - Metrics and achievements
   - Outstanding items for next phase

---

## Quick Commands Reference

```bash
# Install dependencies after package.json changes
pnpm install

# Generate Supabase types
pnpm --filter @repo/database generate-types

# Run specific package commands
pnpm --filter @repo/domain build
pnpm --filter @repo/core test
pnpm --filter web dev

# Run Turbo commands (all packages)
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run build

# Test specific app
pnpm --filter web test
pnpm --filter web test:e2e

# Check for import usage
grep -r "from '@repo/domain'" apps/
grep -r "getServiceRoleClient" apps/ packages/
```

---

## Tips for Success

1. **Work incrementally** - Complete one task fully before moving to next
2. **Test frequently** - Run validation after every significant change
3. **Document issues** - Keep validation log up-to-date
4. **Use TypeScript** - Let the compiler catch import errors
5. **Git commits** - Commit after each successful task
6. **Ask questions** - If unsure, check with team leads

---

**Ready to start? Use the Context Setup Prompt above to begin Phase 5! 🚀**
