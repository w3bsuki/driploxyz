# Component Migration Plan — apps/web → @repo/ui

Goal: Eliminate duplicates by moving shared components into `@repo/ui` with minimal disruption.

Scope identification
- Search `apps/web/src/lib/components` for candidates used in multiple routes
- Cross-check if an equivalent exists in `packages/ui/src/lib/index.ts`

Migration steps (per component)
1) Move file(s) to `packages/ui/src/lib/` (keep filename; adjust imports)
2) Export in `packages/ui/src/lib/index.ts`
3) Update app imports to use `@repo/ui`
4) Delete the original from `apps/web/src/lib/components`
5) Validate: types, lint, build, quick visual
6) Log the change in `docs/CODEX_TASKLIST.md`

Priorities (examples)
- `UnifiedCookieConsent` → fold into `CookieConsentBanner` if overlapping
- `Header` subparts → ensure primitives (Menu/Dialog/Tabs) are used; extract shared pieces where reasonable
- `SEOMetaTags` → consider server/helpers vs UI if mostly functional

Guardrails
- No breaking prop changes without deprecation shim
- Preserve a11y behavior; verify focus/keyboard navigation

