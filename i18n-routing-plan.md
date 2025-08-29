# i18n Path Routing + Adapter Plan

## Objective

- Finalize path‑based i18n using SvelteKit’s `reroute` with our existing `@repo/i18n` for launch stability.
- Prepare a safe, optional track to add an i18n adapter (Paraglide) immediately after launch or today if desired, without disrupting routes, SEO, or translations.

## Current State (Audit)

- Server `reroute`: Implemented in `apps/web/src/hooks.reroute.ts` and exported from `hooks.server.ts`.
- Client `reroute`: Not yet exported from `hooks.client.ts` (needed for client‑side navs to respect locale prefixes).
- Locale detection: `apps/web/src/lib/server/i18n.ts` parses the first path segment, maps `/uk` → `en`, defaults root to `bg`, and persists based on consent.
- Link building/SEO: Canonical tag present via `SEOMetaTags.svelte`; no global `hreflang` links yet; link helpers don’t uniformly add locale prefixes.

## Decision Options

- Option A — Minimal Ship‑Now (Recommended for launch)
  - Keep SvelteKit `reroute` + `@repo/i18n`.
  - Export `reroute` on the client; add redirects and SEO polish; validate nav flows.

- Option B — Add Paraglide Adapter Today (Type‑safe i18n)
  - Add `@inlang/paraglide-sveltekit` (and peers), export its `reroute` in both hooks, bridge locales to `@repo/i18n` temporarily, and run smoke tests.

## Option A — Tasks (Launch‑Ready)

- Client reroute export: Export `reroute` from `apps/web/src/hooks.client.ts` to ensure path prefixes are honored on client navs.
- Unknown prefix handling: If path begins with an unknown two‑letter segment, 308 redirect to default (`/`), or strip and continue.
- Redirect normalization: Optional — collapse double slashes and remove trailing slash (except `/`).
- SEO polish:
  - Canonical: Ensure canonical reflects locale (root for `bg`, prefixed for others if you add `/en/`).
  - Hreflang: Add per‑page `hreflang` links for `bg-BG` and `en-GB` with correct URLs.
- Link helpers:
  - Provide a small util that returns `/${prefix}${path}` where `prefix` is `''` for `bg` and `'en'` for English (or keep `/uk` → `en` mapping for path aesthetics).
- QA checklist:
  - SSR + client nav between `/` ↔ `/uk/` pages keeps language.
  - Locale persists with consent (cookie set) and respects `?locale=` param.
  - Canonical/hreflang render expected pairs on product pages.

## Option B — Paraglide Adapter (Add Today, Safe Track)

- Dependencies: Add `@inlang/paraglide-sveltekit` and `@inlang/paraglide-js`.
- Hooks export:
  - `apps/web/src/hooks.server.ts`: `export { reroute } from '@inlang/paraglide-sveltekit/reroute';`
  - `apps/web/src/hooks.client.ts`: same export on client.
- Config (paraglide):
  - `locales`: `['bg', 'en']` (alias path `/uk` → `en` if desired).
  - `defaultLocale`: `'bg'`.
  - `prefixDefaultLocale`: `false` (so root stays `/`).
  - Optional: localized route segments if you want `/bg/продукт` vs `/uk/product`.
- Locale bridge:
  - On each request, set `@repo/i18n` locale to adapter’s current locale (single source of truth).
- Link & SEO:
  - Use adapter helpers (if provided) to generate localized paths.
  - Ensure canonical/hreflang reflect the adapter’s routing.
- Tests:
  - Smoke: server render of `/`, `/uk/…`, and client nav between them.
  - Search params & trailing slashes preserved.
- Rollback plan: Keep current `hooks.reroute.ts` and quickly re‑export it in both hooks if needed.

## URL & SEO Strategy

- Default locale: Root path (`/`) is `bg` (no prefix); English uses prefix (`/uk` path alias to locale `en`).
- Canonical:
  - Default locale → canonical without prefix.
  - Non‑default locales → canonical with prefix.
- Hreflang pairs: Emit `bg-BG` and `en-GB` with corresponding URLs on product and key landing pages.

## Acceptance Criteria

- Client navigations honor locale prefixes (no content language flicker).
- SSR and hydration produce the same locale.
- Canonical/hreflang tags are correct per locale.
- Unknown prefixes do not 404; handled by redirect or stripping.

## Risks & Mitigation

- Risk: Client route mismatch without client `reroute` export.
  - Mitigation: Export `reroute` on client; e2e nav tests.
- Risk: SEO duplication across locales.
  - Mitigation: Canonical + hreflang; verify in HTML.
- Risk: Adapter integration touching routing close to launch.
  - Mitigation: Defer to post‑launch (Option A) or implement with rollback switches.

## Timeline & Effort

- Option A: 30–60 minutes (client export, redirects, hreflang, quick QA).
- Option B: 2–4 hours (deps, hook exports, config, bridging, tests, and verification).

## Rollout Plan

- Staging deploy → verify SSR/CSR routing, cookies, canonical/hreflang.
- Production deploy during low‑traffic window.
- Monitor error logs and 404s for locale paths; prepare instant rollback by reverting hook exports.

## Open Questions

- Keep `/uk` as the English path prefix, or switch to `/en` for clarity?
- Do we want to prefix the default locale later (e.g., `/bg/…`) for symmetry? If yes, schedule redirects.
- Should we add localized slugs for SEO (requires a translation map)?

