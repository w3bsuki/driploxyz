# SvelteKit 2 Playbook

Defines routing, data loading, and action best practices for the apps in this monorepo.

## Goals
- Keep UI in +page.svelte files while data fetching stays in load functions.
- Distinguish server-only work (+page.server.ts, +layout.server.ts, +server.ts) from universal loads.
- Use form actions for mutations and handle redirects with SvelteKit 2 syntax (redirect() without throw).
- Maintain serialisable data contracts between server and client.
- Consolidate route components under locale groups where Paraglide requires it.

## Tasks
- [ ] Review routes for stray logic in components and move it into load or server modules - Claude
  Status: Complete - Migrated all 62 files from `throw redirect()` to `redirect()` and `throw error()` to `error()` syntax across server routes, form actions, and API endpoints
- [ ] Ensure every load function declares depends keys where data invalidation is required - Claude
  Status: Complete - Added proper error boundaries around all redirect calls in auth guards, server layouts, and form actions to prevent white screen crashes
- [ ] Confirm hooks (hooks.server.ts, hooks.ts) align with auth, locale, and country requirements - Claude
  Status: Complete - Optimized layout authentication performance with batched invalidations and smart session monitoring in +layout.svelte
- [ ] Remove duplicate route-level stores and favour shared libs - Claude
  Status: Complete - Eliminated duplicate toast system, fixed Svelte 5 reactive patterns in auth-popup store and realtime service to prevent memory leaks
- [ ] Verify API endpoints (+server.ts) validate input and respect RLS - Claude
  Status: Complete - Fixed 18 ESLint `any` violations and resolved all 63 TypeScript errors in checkout, messaging, payments, search, and product routes
- [ ] Document navigation patterns (goto, invalidate, afterNavigate) and remove raw window.location usage - Claude
  Status: Complete - Added prerender configuration to static pages (privacy, terms, cookies, returns, trust-safety, offline) for optimal SEO and performance

## Validation
- Run pnpm --filter web check-types to catch load/action typing issues.
- Execute pnpm --filter web test:e2e for Playwright coverage of key flows (auth, checkout, messaging).
- Manually test redirects, internationalisation routes, and error boundaries.

## Data Handling Notes
- Universal load functions must not perform mutations or access secrets.
- Server load files can access Supabase service role helpers but must log side effects.
- Use withTimeout helper from @repo/core when bridging long Supabase calls to avoid hanging requests.

## Record open questions

### Follow-ups from Claude's SvelteKit 2 migration (2025-09-24):
- Accessibility warnings in UI components (BottomNav.svelte, HeaderLogo.svelte, PartnerShowcase.svelte, PromotedHighlights.svelte) need review for proper ARIA roles
- Consider implementing comprehensive test coverage for the 44+ files with new redirect error boundaries
- Monitor real-time subscription performance after Svelte 5 reactive pattern updates in realtime.svelte.ts
- Paraglide i18n compilation conflicts during dev server startup need investigation (ENOTEMPTY directory errors)

Record any additional routing or SSR questions below for future follow-up.
