# Driplo V1 — Production Cleanup & Debloat Audit

Status: production-ready. This audit lists final cleanup, debloating, and safety hardening to ship a crisp production repo and runtime. Each item includes rationale and the exact file references to review.

Lean defaults (to avoid over‑engineering)
- No new dependencies, tools, or build steps.
- Only remove true duplicates and fix broken links.
- Keep UI aliasing as-is for now; defer “use dist in prod” to later if needed.
- Don’t change public routes or APIs; do not restructure packages.
- Single‑commit reversibility for every change.

## High-Impact Cleanups (Do First)

- Remove duplicate static SEO files in favor of dynamic routes
  - Keep dynamic routes and delete static duplicates to avoid divergence.
  - Keep: `apps/web/src/routes/robots.txt/+server.ts:1`
  - Keep: `apps/web/src/routes/sitemap.xml/+server.ts:1`
  - Remove: `apps/web/static/robots.txt:1`
  - Remove: `apps/web/static/sitemap.xml:1`

- Gate any debug API endpoints in production (done)
  - `apps/web/src/routes/api/stripe-debug/+server.ts:7` guards with `dev` and `ENABLE_DEBUG_ENDPOINTS`.
  - Behavior: 404 in production unless `ENABLE_DEBUG_ENDPOINTS=true`.

- UI alias strategy (defer by default)
  - Today, the web app aliases to UI source files:
    - `apps/web/vite.config.ts:23` and `:27` → `../../packages/ui/src/...`
    - `apps/web/svelte.config.js:16` → `../../packages/ui/src/...`
  - Lean default: keep as‑is to avoid churn. Revisit post‑launch if build times or isolation become a problem.
  - If/when needed: gate the alias change behind a simple env check in vite only (no svelte.config change), so it’s a 1‑line toggle.

## Root Repository Hygiene

- Root Markdown files (minimize surface)
  - Current root .md files (subset): `README.md`, `CLAUDE.md`, `ADMIN_SECURITY_AUDIT.md`, `DEV_TROUBLESHOOTING.md`, `DEV_TURBOREPO_GUIDE.md`, `PERFORMANCE_OPTIMIZATION_PLAN.md`, `PRODUCTION_DEPLOYMENT_SUMMARY.md`, `PRODUCTION_IMPROVEMENTS.md`, `PRODUCTION_PUSH.md`, `RLS_SECURITY_AUDIT.md`, `STRIPE_WEBHOOK_CONFIG.md`, `VISION.md`, `WORK.md`, `auth.md`, `codebase_audit.md`, `i18n-routing-plan.md`, `messages*.md`, `onboarding+management.md`, `production.md`, `socials.md`, `stripe.md`, `styling.md`.
  - Recommendation (lean):
    - Keep: `README.md`.
    - Move to `docs/` (or `docs/archive/`): design notes/audits/plans to reduce root clutter.
    - Optional: move `CLAUDE.md` to `docs/engineering/CLAUDE.md` (don’t delete).

- README link fixes (broken internal links)
  - `README.md:25` links to `PROJECT.md`, `DEVELOPMENT.md`, `ROADMAP.md`, `OPERATIONS.md` which do not exist at root; equivalents live in `docs/` (e.g., `docs/00-PROJECT.md`, `docs/40-OPERATIONS.md`).
  - Action: update links to point into `docs/` or remove the table (keep Quick Start + Deploy + Docs link).

## App-Level Cleanups (Web)

- Auth/session logs are dev-gated (keep)
  - `apps/web/src/routes/+layout.server.ts:14` and `:21–28` log only when `dev` is true. Keep as-is.

- Client performance logs are localhost-only (keep)
  - `apps/web/src/app.html:32` and `:52` log LCP/FID only on localhost — acceptable for dev.

- Tailwind HMR duplication fixed (keep)
  - `apps/web/src/app.css:7` only sources `packages/ui/src/**` (no `dist/**`). This reduces HMR churn — keep.

- Robots and Sitemap duplication (remove static)
  - See “High-Impact Cleanups”. Delete static duplicates to ensure a single source of truth.

- Security headers
  - `vercel.json:1` sets baseline security headers. Optional: add a CSP header later if required by compliance; for now, keep as-is to avoid breakage.

## Packages & Tooling

- UI package build toolchain
  - Ensure `@sveltejs/package` is available and `pnpm --filter @repo/ui build` runs in CI before web’s production build. This enables the “use dist in prod” option above.

- i18n
  - `packages/i18n` compiles during build via vite plugin; keep. Consider caching artifacts in CI to speed up builds.

## Security & Ops Hardening

- Debug API gating (done)
  - `apps/web/src/routes/api/stripe-debug/+server.ts:7–11` returns 404 in prod by default.

- Token logging (optional)
  - `apps/web/src/lib/server/auth-guard.ts:90–114` logs session metadata in dev. This is acceptable, but you can remove token‑derived substrings as a low‑risk later polish.

- Admin app excluded from deploy (keep)
  - `.vercelignore:1–4` excludes `apps/admin`. Keep.

## Optional Debloat (Safe to Tackle Later)

- Remove `.claude/` and `.playwright-mcp/` from the repo if you want a pristine OSS/public footprint. They’re already non-shipped and gitignored but still visible to contributors.
- Consolidate docs: move tactical playbooks under `docs/playbooks/` and archive older planning docs under `docs/archive/`.

## Actionable Checklist (Lean)

1) Remove static SEO duplicates (keep dynamic)
   - Delete: `apps/web/static/robots.txt`, `apps/web/static/sitemap.xml`.

2) UI alias — defer
   - Keep current alias now. Revisit after launch only if needed.

3) README links
   - Update or delete “Documentation” table; point to `docs/`.

4) Move root .md to `docs/` (or `docs/archive/`)
   - Keep `README.md`; move others to `docs/`.

5) (Optional) Remove token substr logging
   - In `apps/web/src/lib/server/auth-guard.ts`, remove access_token substring fields even under `dev`.

## Quick Commands

Dev-only preview of what will be removed or changed:

```bash
# Remove static duplicates (dry-run: list only)
git ls-files apps/web/static/robots.txt apps/web/static/sitemap.xml

# Build UI then web (prod flow)
pnpm --filter @repo/ui build && pnpm --filter web build

# Type/lint passes
pnpm -w check-types && pnpm -w lint
```

## References

- HMR source glob: `apps/web/src/app.css:7`
- Auth listener (no spam): `apps/web/src/routes/+layout.svelte:126`
- Dev-only auth logs: `apps/web/src/routes/+layout.server.ts:21`
- Localhost perf logs: `apps/web/src/app.html:32`, `apps/web/src/app.html:52`
- Vite alias to UI source: `apps/web/vite.config.ts:23`
- Svelte config alias to UI source: `apps/web/svelte.config.js:16`
- Dynamic robots: `apps/web/src/routes/robots.txt/+server.ts:1`
- Static robots (duplicate): `apps/web/static/robots.txt:1`
- Dynamic sitemap: `apps/web/src/routes/sitemap.xml/+server.ts:1`
- Static sitemap (duplicate): `apps/web/static/sitemap.xml:1`
- Gated debug endpoint: `apps/web/src/routes/api/stripe-debug/+server.ts:7`
- Token logging (dev): `apps/web/src/lib/server/auth-guard.ts:104`

---

Outcome: After the items above, the repo root is minimal, SEO has a single source of truth, debug surfaces are closed by default in production, and builds are leaner by resolving the UI package correctly per environment.
