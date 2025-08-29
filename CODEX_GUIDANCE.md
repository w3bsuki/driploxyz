# Codex Guidance — Refactor + Ship Playbook (Claude‑Ready)

Purpose
- Give Claude-Code precise, low-risk steps to debloat, align SSR/auth, trim i18n, and ship web + admin.
- Keep PRs small, measurable, and reversible.

Operating Mode
- One logical change per PR; attach before/after bundle and TS error counts.
- Favor deletion and simplification over new abstractions.
- Never serialize Supabase clients; keep server/client separation strict.

Read These First
- `PRODUCTION_PLAYBOOK.md`
- `REFACTOR_EXECUTION_PLAN.md`
- `DEBLOAT_PLAN.md`
- `SAFE_DELETE.md`
- `SUPABASE_SSR_CHECKLIST.md`
- `FRONTEND_SIMPLIFICATION_CHECKLIST.md`
- `OVER_ENGINEERING_AUDIT.md`
- `reference/CLAUDE_OPERATIONS.md`
- `.claude/commands/debloat-ui.md`, `.claude/commands/ship-now.md`

Baselines (always start a PR with this)
- `pnpm check-types > baseline-types.txt`
- `pnpm -C packages/ui build > ui-build.txt`
- `pnpm -C apps/web build > web-build.txt`
- Summarize: TS errors, build status, blockers.

Supabase SSR/Auth
- Server: `hooks.server.ts` -> `$lib/server/hooks` sequence sets env, auth, i18n, country, guard, sentry.
- Server client: `@supabase/ssr` with cookie `path: '/'`; expose `locals.supabase` and `locals.safeGetSession()`.
- Client: Create one browser client in `+layout.svelte` or a module-level singleton; do NOT create clients per component.
- Invalidation: `depends('supabase:auth')` where auth affects data; replace `invalidateAll()` with targeted `invalidate()` calls.
- References: `apps/web/src/lib/supabase/client.ts`, `apps/web/src/lib/server/supabase.server.ts`, `apps/web/src/routes/+layout.server.ts`, `apps/web/src/routes/+layout.ts`.

i18n and Domains — What’s Possible
- Yes, domain/subdomain-based locale is valid and implemented.
  - `apps/web/src/lib/country/detection.ts`: `getCountryFromDomain('uk.driplo.xyz'|'bg.driplo.xyz')` is accurate.
  - `apps/web/src/lib/server/country-redirect.ts`: redirects authenticated users to the correct subdomain if mismatched.
- Paraglide reality: The generated `messages.js` tends to import all configured locales into a single module.
  - Your change to limit locales to EN+BG is correct for launch budgets:
    - `packages/i18n/project.inlang/settings.json` now has `languageTags: ["en","bg"]`.
  - For stricter per-locale loading later, use a thin adapter module (e.g. `getI18n`), not edits to generated files, and dynamically import the active locale only. Do this in a follow-up if needed.
- Bottom line: With EN+BG configured, builds only include EN+BG messages; domain detection still works. UK/BG subdomains are supported.

Debloat Priorities (per DEBLOAT_PLAN.md)
- Images: keep `ImageOptimized.svelte`; delete `OptimizedImage.svelte` and `LazyImage.svelte`. Run `rg -n "OptimizedImage|LazyImage"` to catch leftovers.
- Search: converge to `SearchBar` (+ variants). Temporarily keep `HeroSearchDropdown`/`SmartStickySearch` if actively used; attach `rg` use sites; plan the fold-in.
- Toasts: use `ToastContainer` + `toasts` store; remove per-event toast components.
- Badges: single `Badge` with variant props; remove specialized badges.
- Perf utils: delete `packages/ui/src/lib/utils/performance.ts` and `web-vitals.ts` after removing exports/usages.
- Thin services: drop wrapper files (categories/favorites/profiles); call Supabase directly in server load or focused server utils.

Data Loading Hygiene
- Add `.range()` or `.limit()` to all queries; select minimal columns.
- Parallelize with `Promise.all` to avoid waterfalls.
- Keep private data on server (`+page.server.ts`); let RLS handle auth.

Admin Tailwind v4
- Use `@tailwindcss/vite`, CSS-first `@import 'tailwindcss';` entry file.
- Remove PostCSS config; ensure plugin wired in `svelte.config.js`.

Supabase Policies (MCP)
- Audit RLS for products/categories/users/orders/order_items/profiles/favorites.
- Propose SQL in blocks; do not apply without approval. Export final SQL under `supabase/policies/DATE.sql` and sync `SUPABASE_POLICIES.sql`.

Budgets and CI
- Interim budgets: JS <200KB, CSS <50KB per PR; iterate down later.
- Ensure `.github/workflows/ci-simple.yml` runs green on PRs.

Claude-Ready Commands
- Baseline: see `reference/CLAUDE_OPERATIONS.md` step 1.
- Debloat UI: `.claude/commands/debloat-ui.md`
- Ship sequence: `.claude/commands/ship-now.md`

PR Template (copy/paste)
- Summary: What and why (one paragraph).
- Evidence: TS error counts delta, bundle sizes before/after.
- Changes: File list and high-level notes.
- Risk/rollback: any user-facing risk and quick rollback path.
- Screenshots: key pages at 375px.

Next Actions (suggested)
- Run baseline and confirm EN+BG i18n build is green.
- Complete Debloat Group C (Toasts) + Group D (Badges); update exports/imports, then delete files.
- Plan Search consolidation: collect import sites, add `variant` props to `SearchBar`, switch imports, then delete duplicates.
- Prep admin Tailwind v4 PR with `@tailwindcss/vite` plugin and CSS entry.

FAQ
- Q: Can UK/BG subdomains load only their language?
  - A: Yes for configured languages. Today you’ve limited locales to EN+BG, and domain detection/redirects are correct. For strict per-locale code-splitting at runtime, use an adapter and dynamic imports — a follow-up task, not required to ship.
- Q: Should components create Supabase clients?
  - A: No. Use a single browser client (layout/singleton) to avoid duplicate listeners and churn.

