# Phase 0 – Dependency Snapshot (2025-09-24)

## Root Workspace
- Node engines: `>=22.12.0 <23`
- Tooling: `turbo@2.5.4`, `prettier@3.6.0`, `typescript@5.8.2`, `@playwright/test@1.55.0`, `@lhci/cli@0.12.0`

## apps/web
- Framework: `@sveltejs/kit@2.36.2`, `svelte@5.36.12`, `vite@7.1.2`
- Styling: `tailwindcss@4.1.12`, `@tailwindcss/forms@0.5.10`, `@tailwindcss/typography@0.5.16`
- Auth/Data: `@supabase/supabase-js@2.51.0`, `@supabase/ssr@0.7.0`, `zod@3.x`
- Payments: `stripe@18.4.0`, `@stripe/stripe-js@7.8.0`
- Observability: `@sentry/sveltekit@10.5.0`
- Localisation: `@inlang/paraglide-js@2.2.0`

## apps/admin & apps/docs
- Use SvelteKit with minimal dependencies (detailed audit deferred to later phases).

## packages
- `@repo/core`: exposes auth/cookie/utils modules (tsup build expected).
- `@repo/ui`: component library relying on Tailwind tokens (build/test status unknown in this phase).
- `@repo/database`: generated Supabase types (`order_items` missing).
- `@repo/i18n`: Paraglide outputs; depends on runtime plugin downloads.

## Observations
- Shared eslint/typescript configs referenced via `workspace:*` require validation once Phase 2 begins.
- Multiple commands rely on remote plugin downloads (Paraglide); offline environments must mock or cache.
- TypeScript errors highlight gaps in env module augmentation and Supabase types.

Documented versions will serve as baseline for future upgrades.
