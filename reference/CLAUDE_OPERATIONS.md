# Claude Operations — Refactor Execution Prompts

Use these prompts with Claude-Code (with Supabase MCP). Execute in order, one PR at a time. Mark checkboxes when done.

## 1) Baseline Metrics (Repo)
"""
Run:
- pnpm check-types > baseline-types.txt
- pnpm lint > baseline-lint.txt
- For each app (web, admin, docs): pnpm -C apps/<app> build
Attach build results and TS error counts.
"""

- [ ] Completed and artifacts attached

## 2) Version Alignment (Repo)
"""
Align `svelte` and `@sveltejs/kit` versions across apps. Standardize Tailwind on v4; upgrade `apps/admin` to v4 using `@tailwindcss/vite`. Point all app tsconfigs to `packages/typescript-config/svelte.json`. Open PR: "chore(alignment): svelte/kit + tailwind v4 + tsconfig".
"""

- [ ] PR opened
- [ ] PR merged

## 3) Type Zero: packages/ui First (Repo)
"""
Fix TypeScript errors in `packages/ui` without widening to `any`. Update exports, types, and consumers. Ensure `pnpm -C packages/ui build` passes. Provide a summary of changes and remaining risks.
"""

- [ ] PR opened
- [ ] PR merged

## 4) Supabase SSR/Auth Pattern (Repo + Supabase)
"""
Implement the `@supabase/ssr` server client in `hooks.server.ts` with cookie `path: '/'`. Ensure `+layout.server.ts` returns only serializable data, and `+layout.svelte` creates one browser client and a single auth listener. Replace any `invalidateAll()` with targeted invalidation and `depends('supabase:auth')`.
Verify Supabase project cookie domain/session settings for staging/prod domains.
"""

- [ ] PR opened
- [ ] PR merged
- [ ] Supabase settings verified

## 5) Data Loading Hygiene (Repo)
"""
Audit and refactor `load` functions: parallelize with `Promise.all`, add `.limit()` to all queries, select minimal columns, and stream non-critical data. Ensure client code uses `$env/static/*` only. Provide a diff per route.
"""

- [ ] PR opened
- [ ] PR merged

## 6) Tailwind Tokens and Purge (Repo)
"""
Define OKLCH CSS variables in `packages/ui` and map to Tailwind theme. Remove custom CSS/`@apply` usages (except resets). Confirm CSS bundle <50KB in web after build.
"""

- [ ] PR opened
- [ ] PR merged

## 7) Policies Audit (Supabase MCP)
"""
Using Supabase MCP, list RLS and policies for products, categories, users, orders, order_items, profiles, favorites. Verify least-privilege. Propose SQL fixes as separate blocks and await manual approval before applying.
"""

- [ ] Audit report added to repo
- [ ] Fix SQL proposed
- [ ] Fixes applied (after approval)

## 8) Bundle & Import Discipline (Repo)
"""
Ensure server-only deps (`stripe`, `sharp`, `resend`) exist only in server code. Add dynamic imports for heavy UI (modals/wizards). Review `apps/web/build-analysis.log` and remove unused deps. Confirm initial JS <200KB.
"""

- [ ] PR opened
- [ ] PR merged

## 9) E2E Smokes & Budgets (Repo)
"""
Add/ensure Playwright smokes: login, logout, search, product view, add-to-cart/checkout-intent, admin login. Add Lighthouse CI budgets for web (LCP, TBT, CLS). CI must pass on PR.
"""

- [ ] PR opened
- [ ] PR merged

## 10) Release & Rollback (Ops)
"""
Deploy off-peak, monitor Sentry 30–60 minutes. If regressions, rollback the PR and document in REFACTOR_ISSUES.md.
"""

- [ ] Deployed
- [ ] Monitored
- [ ] Rolled back (if needed) and documented

