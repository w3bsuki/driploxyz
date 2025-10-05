# Phase 7 Production Push – Audit & Execution Map

> Use this document as the high-level command center for the production hardening sprint. Every checklist referenced below is designed for Claude-Code. Claude will not perform repository-wide searches, so keep paths explicit when you hand off tasks.

## Mission Objectives

- Achieve production readiness across the full stack: SvelteKit 2/Svelte 5 apps, shared packages, Supabase backend, Tailwind CSS v4 theming, Paraglide i18n, and mono-repo tooling.
- Eliminate lint debt, dead code, duplication, and half-migrated patterns that block clean builds or CI automation.
- Lock in observability, security, DX reliability, and localization defaults ahead of the public launch (UK + BG first, global rollout planned).

## Execution Boards

| Area | Checklist | Primary Owner |
| --- | --- | --- |
| Frontend (SvelteKit 2/Svelte 5) | [`CLAUDE-SVELTEKIT-CHECKLIST.md`](./CLAUDE-SVELTEKIT-CHECKLIST.md) | Claude-Code (frontend) |
| Supabase (DB, Functions, RLS, RPC) | [`CLAUDE-SUPABASE-CHECKLIST.md`](./CLAUDE-SUPABASE-CHECKLIST.md) | Claude-Code (Supabase MCP) |
| Tailwind CSS v4 Theme & Styling Debt | [`CLAUDE-TAILWIND-CHECKLIST.md`](./CLAUDE-TAILWIND-CHECKLIST.md) | Claude-Code (frontend) |
| Paraglide i18n & Locale Detection | [`CLAUDE-PARAGLIDE-I18N-CHECKLIST.md`](./CLAUDE-PARAGLIDE-I18N-CHECKLIST.md) | Claude-Code (i18n MCP) |
| TypeScript, Lint & Build Reliability | [`CLAUDE-TYPESCRIPT-CHECKLIST.md`](./CLAUDE-TYPESCRIPT-CHECKLIST.md) | Claude-Code (tooling) |
| Code Hygiene, Duplicates & Dead Code | [`CLAUDE-CODE-HYGIENE.md`](./CLAUDE-CODE-HYGIENE.md) | Claude-Code (sweeper) |

## Fast Status Snapshot (2025-10-05)

### Tooling Signals

- `pnpm --filter web lint` ❌ – 166 blocking errors (see `lint-output.txt`, `unused_vars_inventory.txt`).
- `pnpm --filter web check-types` ✅ (latest run), but `types-validation.txt` logs historic TypeScript errors in critical services (Stripe, messaging). Treat as regression to revalidate.
- No automated regression for `apps/admin` or `apps/docs` beyond placeholder scripts.

### Risk Hotspots

1. **SvelteKit UI debt** – `apps/web/src/routes/+page.svelte` and related runes files contain extensive unused state, duplicate keys, and `any` types. Dashboard, onboarding flows, modular messaging require full review.
2. **Localization gaps** – `packages/i18n` only ships `en` + `bg` JSON files; defaults to `bg` and lacks 0kb bundle or country-first detection. README promises EN/FR/DE/ES.
3. **Tailwind drift** – Heavy custom CSS in `app.css`, lack of tokenized theme, duplicates in utility layers, missing dark/light strategy. Need migration guide from Tailwind v4 best practices.
4. **Supabase edge function** – `supabase/functions/send-message/index.ts` uses in-memory rate limit and service role mixing. Migrations from 2025 contain high-risk schema changes that need verification.
5. **Shared packages** – `packages/ui`, `packages/core`, `packages/domain` require tree-shaking, contract review, and elimination of unused exports before global expansion.

## Delivery Order (Recommended)

1. **Stabilize Tooling:** Run through [`CLAUDE-TYPESCRIPT-CHECKLIST.md`](./CLAUDE-TYPESCRIPT-CHECKLIST.md) to restore lint + type parity. Blocks every other track.
2. **SvelteKit parity check:** Execute the Svelte MCP comparison and implement actions from [`CLAUDE-SVELTEKIT-CHECKLIST.md`](./CLAUDE-SVELTEKIT-CHECKLIST.md).
3. **Tailwind theme + tokens:** Apply modern Tailwind v4 patterns per [`CLAUDE-TAILWIND-CHECKLIST.md`](./CLAUDE-TAILWIND-CHECKLIST.md).
4. **Paraglide i18n hardening:** Implement 0kb locale + geo detection, expand baseline locales, per [`CLAUDE-PARAGLIDE-I18N-CHECKLIST.md`](./CLAUDE-PARAGLIDE-I18N-CHECKLIST.md).
5. **Supabase verification:** Use Supabase MCP to validate migrations, functions, RLS, per [`CLAUDE-SUPABASE-CHECKLIST.md`](./CLAUDE-SUPABASE-CHECKLIST.md).
6. **Repo hygiene sweep:** Apply [`CLAUDE-CODE-HYGIENE.md`](./CLAUDE-CODE-HYGIENE.md) to eradicate dead code, duplicates, and archive deprecated flows.

## Cross-Cutting Requirements

- **Documentation parity:** Update README/ARCHITECTURE after major changes. Each checklist includes explicit doc tasks.
- **Testing coverage:** Maintain baseline thresholds (see `README.md`). Add missing unit/e2e coverage when refactoring flows (especially onboarding, messaging, orders).
- **Observability:** Ensure Sentry/Analytics instrumentation remain intact post refactor.
- **Accessibility:** Validate with `@axe-core/playwright` when modifying templates.

## Handoff Notes for Claude-Code

- Claude should stick to explicit file paths given in each checklist. Directory roots: `apps/web`, `packages/*`, `supabase/*`.
- Claude must run `pnpm install` after dependency changes and keep lockfile in sync.
- When applying Supabase changes, always run via MCP’s Supabase integration (migration diff, policy audit).
- For Svelte/Tailwind tasks, Claude should consult Svelte MCP best-practice bundles first, then adapt local code.
- Always re-run `pnpm --filter web lint && pnpm --filter web check-types && pnpm --filter web test:unit` before closing a task chunk.

Stay disciplined: treat this document as the single source of truth for production launch readiness.
