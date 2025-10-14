# Phase 2 — i18n & Localization Execution

**Status:** Draft
**Last Updated:** 2025-10-13

This checklist tracks Phase 2 tasks from `PRODUCTION_PLAN.md` while we execute the work.

## TODO
- [x] 2.1 Location detection & locale suggestion banner
- [x] 2.2 URL structure validation for localized routes
- [x] 2.3 Message completeness audit & formatting fixes

## Notes
- Use Svelte MCP documentation for hooks/routing questions.
- Use Context7 (Paraglide docs) for locale strategy details.
- Use Supabase MCP for Cloudflare header expectations (`cf-ipcountry`).
- Locale banner implemented in `apps/web/src/routes/+layout.svelte` with cookie persistence via `api/locale/banner`.
- Added Playwright spec `apps/web/tests/localization.spec.ts` to exercise `/en` and `/bg` route prefixes.
- Regenerated `@repo/i18n` message exports after adding banner strings to `packages/i18n/messages/{en,bg}.json`.
