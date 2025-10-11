# Driplo Execution Roadmap

Track active work here and link to matching log entries in `02_LOG.md` when items move to "Done". Perform work in order, checking off items only when completed. Every completed item must receive a matching entry in `docs/02_LOG.md`.

## Legend
- ☐ Not started
- ⟳ In progress
- ☑ Complete

---

## Immediate Refactor Plan

### 0.1 · Fix Project Structure (single blocking step)

- ⟳ Align the repository with the finalized sitemap in `docs/sitemap.md`:
	- ☑ Remove committed build artifacts (`apps/*/.svelte-kit`, `apps/*/output`, cached assets) and enforce `.gitignore` coverage — **DONE 2025-10-11**: No build artifacts tracked in git, .svelte-kit cleaned from all apps, .turbo cache cleared.
	- ☐ Relocate diagnostics tooling into `/scripts/diagnostics/` and delete `apps/web/src/routes/api/_debug`.
	- ☐ Ensure remote functions live under `apps/web/src/routes/(api)` using `.remote.ts` modules with Standard Schema validation and Supabase server guards.
	- ☐ Promote shared UI from `apps/admin/src/lib` into `/packages/ui/src/lib/admin` and update imports accordingly.
	- ☐ Keep Supabase generated types exclusively in `/packages/database/generated`; verify Turbo `supabase:types` pipeline sync.
	- ☑ Centralize Paraglide assets inside `/packages/i18n/paraglide/` and update consumers in apps — **VERIFIED 2025-10-11**: Single source confirmed, no duplicates found.
	- ⟳ Document the outcome in `docs/02_LOG.md` and refresh this checklist once structural parity is confirmed — **IN PROGRESS**: Created BASELINE_ANALYSIS.md, CORE_DOMAIN_CONTAMINATION.md, SESSION_SUMMARY_2025-01-21.md.

### 0.2 · UI lint cleanup (`packages/ui`)

- ☑ Normalize `PromotedHighlights` seller data, add keyed loops, and clear unused imports (see log entry `2025-10-10 · GitHub Copilot · UI lint cleanup`).
- ⟳ Continue sweeping remaining lint warnings (`ProductCard`, `ProductHighlight`, `QuickActions`) and document progress per session.

---

## Agent Workflow Guardrails (always-on)

- ☐ Keep `.cursor/mcp.json`, `.vscode/mcp.json`, and `CLAUDE.md` aligned with the Svelte MCP instructions: call `list-sections` first, fetch all relevant docs with `get-documentation`, and run `svelte-autofixer` until clean before committing Svelte code.
- ☐ Configure Supabase MCP with project-scoped, read-only tokens and document the PAT location; log every MCP tool invocation that touches Supabase data in `02_LOG.md`.
- ☐ Review MCP security guidance quarterly (prompt injection, feature-group restrictions) and confirm non-production environments are used for agent-assisted Supabase operations.

## Completed Foundations (historical reference)

- ☑ Purged legacy build artifacts and sensitive files (`apps/web/.vercel`, `.mcp.json`, `.env.local`, `*.backup`).
- ☑ Removed the legacy `apps/web/src/lib/*` junk drawer directories to prepare the rebuild surface.
- ☑ Regenerated the Paraglide v2 bundle and locked down environment access patterns in shared services.
- ☑ Hardened email environment access to eliminate dynamic `import.meta.env` usage during SSR.
- ☑ Enforced rune migrations (`$props`, `$state`, `$derived`, snippets) across existing components.
- ☑ Normalized SvelteKit configuration (`runes: true`, shared TypeScript config chain, alias hygiene).

---

## Phase 1 · Stabilize & Modernize the Platform

### 1.0 · Comprehensive Baseline & Critical Issues (NEW - 2025-10-11)

**Status**: ⟳ Foundation complete, critical blocker identified

- ☑ **Task 1**: Analyze current project state and document issues
	- Created `docs/BASELINE_ANALYSIS.md` (comprehensive 13-section audit)
	- TypeScript errors: 115+ total (apps/web: 57, packages/core: 57, @repo/testing: 1)
	- Git tracking: ✅ Clean (no build artifacts committed)
	- i18n setup: ✅ Correct (single source in packages/i18n)
	- $lib/server separation: ✅ Implemented correctly
	- Route colocation: ⚠️ Partial (~30% complete)

- ☑ **Task 2**: Audit and clean build artifacts & cache directories
	- Removed .svelte-kit from apps/admin, apps/docs, apps/web
	- Cleaned .turbo cache directories
	- Fixed @repo/testing blocker (installed @testing-library/jest-dom)
	- Testing package now passes type checks ✅

- ☑ **Task 3**: Verify i18n single source of truth
	- Confirmed packages/i18n is ONLY source (no duplicates)
	- All imports use '@repo/i18n' (30+ files verified)
	- No hardcoded i18n paths in svelte.config.js

- ☑ **Task 4**: Document @repo/core domain layer contamination (**CRITICAL P0 BLOCKER**)
	- Created `docs/CORE_DOMAIN_CONTAMINATION.md` with detailed analysis
	- **13 violations found**: SvelteKit imports ($env, $lib, $app) in shared package
	- **Blocks production builds**: Cannot resolve framework-specific imports
	- **4-phase refactor plan**: 7-10 hours estimated
	- Must complete before resuming other work

- ⟳ **Task 5**: Fix TypeScript errors - apps/web (PAUSED)
	- Fixed 3 errors: hooks.client.ts types, oauth.ts env imports, web-vitals install
	- 56 errors remain (down from 57)
	- Blocked by @repo/core refactor - resume after Task 4 complete
	- Session summary: `docs/SESSION_SUMMARY_2025-01-21.md`

**Next Critical Action**: Complete @repo/core domain layer refactor (Phases 1-4) before continuing

---

### 1.1 · Baseline validation

- ☑ Audit build/test pipelines (`pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build`) and capture failures as issues — **DONE 2025-10-11**: 115+ TS errors documented, @repo/core build failures identified.
- ☐ Run `pnpm dev --filter apps/web` with restored Supabase `.env` to confirm login flows succeed locally.
- ☐ Inventory critical Supabase migrations, indexes, and pending RLS updates; log blockers in `02_LOG.md`.
- ☐ Document MCP tool usage patterns and smoke-test procedures in `docs/03_RULES.md` appendix.

### 1.2 · SvelteKit best practices adoption

- ☑ Replace every `export let` with `$props()` destructuring in `.svelte` files.
- ☑ Convert legacy `$:` statements to `$derived` or `$derived.by` where appropriate.
- ☑ Swap `svelte/store` usage with rune-based state or server-provided data.
- ☑ Replace `<slot>` composition with `{#snippet}`/`{@render}`.
- ☑ Migrate `on:event` directives to DOM-level attribute handlers (e.g. `onclick`).
- ☐ Confirm `kit.experimental.remoteFunctions` remains enabled only when server guards, Standard Schema validation, and query refresh patterns are in place.
- ☐ Enforce `$state.snapshot` usage before passing complex objects to third-party libraries.
- ☐ Document component state ownership expectations per `03_RULES.md` in the contributing guide.

### 1.3 · Routing, loads, and actions

- ☑ Audit every `+page(.server).`/`+layout(.server).` load for purity and shared state safety.
- ☑ Split database access into server-only loads; ensure universal loads remain serialization-safe.
- ☑ Adopt `parent()` where needed to avoid waterfalls while preserving dependency tracking.
- ☑ Remove orphaned client fetches in favor of centralized Supabase service helpers.
- ☐ Ship first-class remote function examples (`query`, `form`, `command`, `prerender`) with validation schemas, optimistic update guidance, and documentation linking back to `docs/sitemap.md`.
- ☐ Ensure every form uses SvelteKit actions with progressive enhancement (`use:enhance`) and Standard Schema validation.
- ☐ Wire `handleFetch` to route Supabase requests through service-role configuration where required and document the pattern in `packages/core` README.

### 1.4 · Configuration & build hardening

- ☑ Normalize `vite.config.ts` for modulepreload strategy and alias consistency.
- ☑ Ensure all workspace `tsconfig.json` files extend `@repo/typescript-config` chain.
- ⟳ Run `pnpm build` and eliminate all compile/type errors without introducing dead code — **BLOCKED 2025-10-11**: @repo/core has SvelteKit imports preventing build. 113 TS errors remain (down from 115+).
- ☐ Run `pnpm lint` / `pnpm check --filter ...` across apps and packages; convert failures into tasks.
- ☐ Add README snippets documenting environment variables and Supabase smoke tests.
- ☐ Capture MCP usage commands (Svelte + Supabase) in `docs/03_RULES.md` appendix and cross-link from project README.

### 1.5 · i18n and content pipeline

- ☐ Restore canonical locale JSON sources under `apps/web/project.inlang` (schema-compliant per locale).
- ☐ Wire `%lang%` replacement in `src/app.html` and resolve locale in hooks prior to render.
- ☐ Update navigation helpers to use `localizeHref`/`deLocalizeUrl` patterns.
- ☐ Confirm regenerated `m` namespace covers every route key; patch missing translations before enabling strict mode.
- ☐ Ensure `/packages/i18n` pipelines are integrated into Turbo tasks and documented in `README.md`.

### 1.6 · Documentation and workflow

- ☐ Codify refactor branch template and PR checklist in `03_RULES.md` appendix.
- ☐ Backfill decision records for Supabase credential restoration and documentation resets.
- ☐ Publish `README` pointer for new documentation workflow (`docs/` overview + logging expectations).
- ☐ Embed Svelte MCP + Supabase MCP step-by-step usage (list, fetch, autofix / PAT, read-only, feature groups) into documentation landing page.

---

## Phase 2 · Core Domain Services (Supabase-first)

### 2.1 · Auth & session layer

- ☐ Implement `auth.service.ts` in `packages/core` using Supabase helpers and secure cookie/session strategy.
- ☐ Add guard utilities leveraging `getRequestEvent()` + hooks to enforce auth in server loads and actions.
- ☐ Document logout/session rotation flow and cover with Vitest unit tests.
- ☐ Update `hooks.server.ts` to consume the new utilities and validate service-role boundaries.

### 2.2 · Catalog & messaging services

- ☐ Build `product.service.ts` covering CRUD, search params, and Paraglide-aware slugs.
- ☐ Implement `messaging.service.ts` with realtime Supabase channels and optimistic update helpers.
- ☐ Provide validation schemas (Valibot/Zod) for all inbound service calls and share them with remote functions.
- ☐ Add contract documentation (inputs, outputs, error modes, success criteria) per service in `/packages/core/docs`.

### 2.3 · Database & RLS hardening

- ☐ Review outstanding migrations; backfill constraints and indexes for marketplace core tables.
- ☐ Regenerate Supabase TypeScript types (`pnpm --filter @repo/database db:types`).
- ☐ Audit and document RLS policies per collection with remediation steps.
- ☐ Mirror new SQL functions into `/packages/database/generated` and remote function wrappers.

---

## Phase 3 · Frontend Rebuild (Svelte 5 + Tailwind v4)

### 3.1 · Shared UI system (`packages/ui`)

- ☐ Establish design tokens and Tailwind theme parity with product brand guidelines.
- ☐ Build rune-based primitives (Button, Input, Modal, Toast) with accessibility baked in.
- ☐ Publish component API docs and Storybook/Playroom entries via `/packages/ui`.
- ☐ Integrate automated visual regression or snapshot coverage leveraging `/packages/testing`.

### 3.2 · Web app surfaces (`apps/web`)

- ☐ Rebuild auth flows with form actions, error handling, and optimistic UX wired to remote functions.
- ☐ Implement product discovery routes (home, category, search) with streamed server loads and SEO metadata from `$lib/seo`.
- ☐ Ship product listing + PDP with localized URLs and Paraglide content coverage.
- ☐ Integrate messaging UI with real-time updates and optimistic states backed by remote functions and Supabase channels.
- ☐ Add Playwright flows covering checkout and messaging via `/packages/testing` configs.

### 3.3 · Admin console (`apps/admin`)

- ☐ Scaffold admin auth + global layout with secure route guards referencing shared UI.
- ☐ Deliver product moderation, inventory, and user management views using shared services.
- ☐ Incorporate audit logging hooks surfaced in observability stack and document admin-specific workflows.

---

## Phase 4 · Quality, Observability & Performance

### 4.1 · Automated testing

- ☐ Achieve green `pnpm test`, `pnpm lint`, `pnpm check`, `pnpm build` in CI.
- ☐ Cover critical flows with Vitest unit/integration suites and Playwright E2E runs.
- ☐ Implement accessibility smoke tests (axe) for core pages and integrate into CI.

### 4.2 · Observability

- ☐ Enable OpenTelemetry tracing (`kit.experimental.tracing` + instrumentation file) with exporter wiring.
- ☐ Add structured logging and error boundaries tied to Sentry/DataDog (TBD).
- ☐ Define performance budgets and monitor Core Web Vitals in preview/production environments.

### 4.3 · Security & compliance

- ☐ Complete Supabase RLS + edge function review, document threat model.
- ☐ Run dependency vulnerability scans and remediate findings.
- ☐ Draft privacy/security documentation for stakeholders and include in `docs/`.

---

## Phase 5 · Launch Readiness

- ☐ Validate static generation/prerender strategy for marketing-critical routes.
- ☐ Finalize deployment adapters (Vercel/Supabase) with environment parity and secrets management.
- ☐ Produce operator runbooks, troubleshooting guides, and on-call playbooks.
- ☐ Coordinate release checklist, including rollback plan, smoke test script, and communication plan.
- ☐ Conduct comprehensive security audit and penetration testing.
- ☐ Perform load testing and performance validation.
- ☐ Complete accessibility audit and compliance checks.
- ☐ Set up production monitoring and alerting.
- ☐ Monitor performance metrics and user behavior post-launch; plan iterative improvements.
- ☐ Document architecture decisions and outstanding technical debt for ongoing tracking.

---

## Backlog & Future Enhancements

### International Expansion

- ☐ Multi-currency support and payment methods.
- ☐ Localized payment gateways and tax handling.
- ☐ Regional product catalogs and pricing.
- ☐ Local customer support and community features.

### Advanced Features

- ☐ AI-powered product recommendations.
- ☐ Virtual try-on and AR features.
- ☐ Social commerce integration.
- ☐ Advanced analytics and personalization.
- ☐ Mobile app development (React Native/Flutter).

### Platform Integrations

- ☐ Third-party marketplace integrations (eBay, Etsy).
- ☐ Social media selling integrations.
- ☐ Dropshipping and fulfillment partnerships.
- ☐ Shipping and logistics API integrations.
- ☐ Payment method expansions (Apple Pay, Google Pay).