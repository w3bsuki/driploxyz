# Phase 0 – Critical Fix Plan (2025-09-24)

## Objectives
- Resolve lint/type/build blockers for the `apps/web` workspace.
- Provide clear next steps for Supabase type alignment and env validation.

## Action Items
1. **Alias Restoration** – Update `apps/web/svelte.config.js` and `vite.config.ts` to include `@repo/core` and re-run `svelte-kit sync`.
2. **Env Typings** – Extend `app.d.ts` (or `env.d.ts`) to declare required `$env/static/public` and `$env/static/private` exports (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `RATE_LIMIT_SECRET`, etc.).
3. **Lint Hygiene** – Remove unused stub parameters in onboarding/subscription services; replace the remaining `any` cast in auth hooks with typed fallback.
4. **Supabase Types** – Regenerate or handcraft missing entries for `order_items` and RPC signatures referenced by messaging flows.
5. **Stripe Service Review** – Either remove dormant helpers (`getOrCreateCustomer`) or re-enable call sites to avoid unused member errors once TypeScript runs clean.
6. **Paraglide Offline Strategy** – Document approach to mirror jsDelivr plugins locally to prevent build warnings in CI (follow-up task).

Track completion in `docs/refactor/task-board.md` and update this plan as fixes land.
