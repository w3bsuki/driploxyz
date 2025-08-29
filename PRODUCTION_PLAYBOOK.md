# Production Playbook (Claude-Ready)

Purpose: Debloat, align best practices, and ship web + admin with a stable Supabase backend. This is the short, actionable track for Claude-Code to execute now.

Targets
- 0 TypeScript errors in web + ui
- Stable SSR auth with @supabase/ssr
- Single-language bundles per domain, or acceptable budget with caching
- JS <200KB initial, CSS <50KB (iterate down later)
- CI green builds for web, ui

Guardrails
- No over-engineering; prefer deletion and simplification
- One change per PR; verify and measure each step
- Server-only code stays server-only; never leak service keys

Day 1–2: Backend Hardening (Supabase)
- Audit RLS + policies and propose fixes: reference/SUPABASE_CLEANUP_PLAN.md
- Verify cookie config across domains; ensure session cookie path: '/'
- Confirm RPCs actually used by code; avoid speculative DB changes
- Export final SQL under supabase/policies and sync SUPABASE_POLICIES.sql

Day 2–3: SSR/Auth Hygiene
- hooks.server.ts uses our modular handlers (already present):
  - Auth via @supabase/ssr with cookie path '/'
  - i18n and country setup in lib/server
  - No client passthrough in +layout.server.ts
- +layout.ts returns only serializable data; components create browser client as needed
- Replace invalidateAll with targeted invalidation + depends('supabase:auth')

Day 3–5: UI Debloat and Import Discipline
- Collapse duplicate components in packages/ui (images, search, toasts, badges)
- Keep one of each; update packages/ui/src/lib/index.ts exports
- Remove unused performance utils and background jobs
- Ensure server-only deps are not included in client bundles

Day 5–6: Type Zero and Perf Pass
- Fix types in packages/ui first, then apps/web
- Add .limit() and minimal select columns for all queries
- Lazy load non-critical UI (modals/wizards)

Day 6–7: Admin Tailwind v4 Align
- Upgrade apps/admin to Tailwind v4 with @tailwindcss/vite
- Remove postcss config and ensure CSS-first config

Validation Gates
- pnpm -C packages/ui build passes
- pnpm -C apps/web build passes with budgets (JS <200KB, CSS <50KB)
- E2E smokes pass (login/logout/search/product/view basic)

Pointers
- Use: REFACTOR_EXECUTION_PLAN.md for sequencing and constraints
- Use: REFACTOR_GUIDE.md and OVER_ENGINEERING_AUDIT.md for patterns + deletions
- Use: reference/CLAUDE_OPERATIONS.md for ready-to-run prompts

