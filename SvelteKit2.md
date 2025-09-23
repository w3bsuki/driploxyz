# SvelteKit 2 Playbook

Defines routing, data loading, and action best practices for the apps in this monorepo.

## Goals
- Keep UI in +page.svelte files while data fetching stays in load functions.
- Distinguish server-only work (+page.server.ts, +layout.server.ts, +server.ts) from universal loads.
- Use form actions for mutations and handle redirects with throw redirect.
- Maintain serialisable data contracts between server and client.
- Consolidate route components under locale groups where Paraglide requires it.

## Tasks
- [ ] Review routes for stray logic in components and move it into load or server modules.
- [ ] Ensure every load function declares depends keys where data invalidation is required.
- [ ] Confirm hooks (hooks.server.ts, hooks.ts) align with auth, locale, and country requirements.
- [ ] Remove duplicate route-level stores and favour shared libs.
- [ ] Verify API endpoints (+server.ts) validate input and respect RLS.
- [ ] Document navigation patterns (goto, invalidate, afterNavigate) and remove raw window.location usage.

## Validation
- Run pnpm --filter web check-types to catch load/action typing issues.
- Execute pnpm --filter web test:e2e for Playwright coverage of key flows (auth, checkout, messaging).
- Manually test redirects, internationalisation routes, and error boundaries.

## Data Handling Notes
- Universal load functions must not perform mutations or access secrets.
- Server load files can access Supabase service role helpers but must log side effects.
- Use withTimeout helper from @repo/core when bridging long Supabase calls to avoid hanging requests.

Record any open routing or SSR questions at the end of this file for future follow-up.
