# CODEX Bloat Prune Checklist

Date: 2025-08-21
Goal: Remove dead/duplicated/untracked artifacts and unused code while preserving exact UI and functionality. This is a planning document — no code changes applied.

## Summary

- Focus areas: build/test artifacts, debug/test routes, unused components/modules, duplicated env/migrations/config, generated files in VCS, and doc sprawl.
- Each item includes a validation note to confirm safety before deletion.

## High‑Confidence Deletes (Artifacts)

- [ ] `apps/web/.svelte-kit/` — build output; ensure listed in `.gitignore`.
- [ ] `apps/web/playwright-report/`, `apps/web/test-results/` — Playwright artifacts.
- [ ] `.turbo/`, `apps/web/.turbo/` — Turborepo cache directories.
- [ ] `.vercel/`, `apps/web/.vercel/` — local Vercel linking metadata (retain `vercel.json`).
- [ ] Any `node_modules/` — never in VCS; local cleanup only.

Validation: These are reproducible. Delete safely after confirming CI can build from scratch.

## High‑Confidence Deletes (Stray/Sensitive)

- [ ] `.env.local` at repo root and app-level `.env.local` — secrets belong in env store (Vercel/Supabase). Keep `.env.example` only.
- [ ] `nul` (root) — stray file.
- [ ] `test-image.jpg` (root) — dummy asset.

Validation: Grep for references to `test-image.jpg` (none found). Never commit real secrets.

## Routes To Remove From Production

- [ ] `apps/web/src/routes/test/` — test route and specs; keep tests under `src/test` only.
- [ ] `apps/web/src/routes/test-lang/+page.svelte` — debug page.

Validation: Not part of product. Confirm no links drive users here (none found).

## Likely Unused Components (Safe Wins)

- [ ] `apps/web/src/lib/components/HeroSearch.svelte`
- [ ] `apps/web/src/lib/components/LocaleDetector.svelte`
- [ ] `apps/web/src/lib/components/LazySearchResults.svelte`
- [ ] `apps/web/src/lib/components/VirtualProductGrid.svelte`

Validation: No imports detected. Confirm by grepping before deletion.

## Unused Client/Remote Modules

- [ ] `apps/web/src/lib/client/auth.ts` — no references found.
- [ ] `apps/web/src/lib/remote/products.remote.ts` — tied to `LazySearchResults`; if removing that, remove this too.

Validation: Grep for imports; ensure no dynamic imports exist.

## Env Validation Duplication (Choose One)

- [ ] Keep: `apps/web/src/lib/env/validation.ts` (recommended canonical).
- [ ] Delete: `apps/web/src/lib/env/server.ts` (duplicate responsibilities).

Validation: Currently, neither is imported. After choosing one, wire into server entry points as needed; then delete the other.

## Vercel Config Duplication (Choose One)

- [ ] Keep one monorepo deploy config. Recommendation: Keep root `vercel.json`.
- [ ] Delete: `apps/web/vercel.json` after moving its headers to root config to avoid drift.

Validation: Confirm preview deploy still functions and headers are preserved at the edge.

## Migrations Consolidation

- [ ] Consolidate into `supabase/migrations/` (Supabase CLI standard).
- [ ] Merge root `migrations/` SQL into `supabase/migrations/` then delete root `migrations/`.
- [ ] Fold `SUPABASE_POLICIES.sql` into a dated migration and delete the standalone file.

Validation: Run migrations on a throwaway DB; check drift and RLS behavior with tests.

## UI Package Generated Noise

- [ ] Delete committed generated types: `packages/ui/src/*.d.ts` (declarations should live in `dist/` or be generated on build).

Validation: Ensure `packages/ui` still builds. Add `.gitignore` for generated declarations in `src`.

## i18n Package Build Outputs

- [ ] Consider removing `packages/i18n/lib/**` from VCS and generating on build.

Validation: Decide based on CI speed vs convenience. If removed, ensure build steps compile `paraglide` outputs.

## Email Templates (Unreferenced duplicates)

- [ ] Delete `apps/web/email-templates/` (`confirm.html`, `magic_link.html`, `otp.html`, `recovery.html`).

Validation: Not referenced; `$lib/email` provides code templates.

## Docs Consolidation (Reduce Sprawl)

Move core docs into `docs/` and archive/delete redundant top-level files:

- Keep: `docs/DEPLOYMENT.md`, `PRD.md`, `README.md`, `CODEX_Audit.md`.
- Review/Archive (choose 1–2 to keep, delete others):
  - `DRIPLO_AUDIT.md`, `production_refactor_plan.md`, `PRODUCTION_DEPLOYMENT_PLAN.md`,
  - `AUTH.md`, `auth-migration-plan.md`, `auth-security-analysis.md`,
  - `SELL_FORM_UX_IMPROVEMENTS.md`, `TESTING.md`, `INTERNATIONALIZATION_GUIDE.md`,
  - `svelte5+kit2.md`, `UX_GUIDELINES.md`, `driplo.md`.

Validation: Merge overlapping content into a single, up-to-date source before removal.

## AI/Tooling Artifacts (Optional)

- [ ] `.claude/`, `CLAUDE.md`, `.playwright-mcp/`, `.mcp.json` — move to `docs/internal/` or delete if not part of process.

Validation: Confirm team no longer uses these locally or in CI.

---

## Validation Steps (before deleting)

- [ ] Grep references for each target (imports, dynamic imports, route links, tests).
- [ ] Run `pnpm build && pnpm test` after each batch removal.
- [ ] Smoke flows: homepage, search, product page, login/signup, checkout.
- [ ] Confirm deploy headers intact after Vercel config consolidation.
- [ ] Confirm Supabase RLS/storage policies unaffected after migration consolidation.

Handy commands (read-only checks):

```
# Find imports of a component/module
grep -RIn "<ComponentName>|\$lib/segment/name" apps/web/src

# Find routes linking to test pages
grep -RIn "/test\b|test-lang" apps/web/src

# Confirm no references to a file before deletion
grep -RIn "filename.ext" .
```

---

## Phased Pruning Plan

Phase 0 — Prep (backups + ignores)
- [ ] Ensure `.gitignore` covers: `.svelte-kit/`, `.turbo/`, `.vercel/`, `node_modules/`, `playwright-report/`, `test-results/`.
- [ ] Back up current `vercel.json` and migrations.

Phase 1 — Artifacts + Test Routes (no-risk)
- [ ] Delete build/test artifacts and stray files.
- [ ] Remove `routes/test` and `routes/test-lang`.
- [ ] Remove root `.env.local` (and any app-level), keep `.env.example`.

Phase 2 — Unused Components/Modules (low-risk)
- [ ] Remove unused components (`HeroSearch`, `LocaleDetector`, `LazySearchResults`, `VirtualProductGrid`).
- [ ] Remove `lib/client/auth.ts` and `lib/remote/products.remote.ts` (if components relying on them are gone).

Phase 3 — Config/Migrations/Docs (medium-risk, coordinate)
- [ ] Consolidate to single `vercel.json`; migrate headers; validate preview.
- [ ] Consolidate migrations into `supabase/migrations/`; convert `SUPABASE_POLICIES.sql` to dated migration.
- [ ] Choose a single env validation module; wire it; remove duplicate.
- [ ] Clean generated `packages/ui/src/*.d.ts` and consider removing `packages/i18n/lib/**`.
- [ ] Consolidate docs under `docs/` and archive duplicates.

Acceptance per phase: build + tests pass; smoke flows OK; deploy preview (for config changes) OK; migrations verified on a non‑prod DB.

---

## Optional Footguns To Avoid

- Do not delete `apps/web/src/lib/server/supabase.server.ts` or Stripe server utils; they are used by API routes.
- Keep `apps/web/src/lib/components/{Header,BottomNav,PromotedHighlights,FeaturedProducts,QuickViewDialog,UnifiedCookieConsent,NavigationLoader,EarlyBirdBanner}.svelte` (in use).
- Keep `apps/web/src/lib/stores/*` (referenced by `Header.svelte` and layout).

---

## Size Reduction Expectations

- Removing artifacts and generated files from VCS: large cut (thousands of lines).
- Dropping unused components/modules: moderate cut with zero UX change.
- Consolidating docs: reduces repo noise and cognitive load without runtime impact.

Proceeding through these phases will reduce code footprint substantially while preserving exact behavior and look.

