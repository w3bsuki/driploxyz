# Phase 0 – Pipeline Health (2025-09-24)

## Commands Executed
1. `pnpm --filter web lint`
   - **Result:** ✅ Passed after removing unused stub parameters and eliminating the final `any` cast. Latest run: chunk `0f8fb3`.
2. `pnpm --filter web check-types`
   - **Result:** ❌ Failed. Latest run reports 22 errors focused on Supabase auth helpers, Stripe order item types, and Vite plugin typing mismatches. See chunk `529453`.
3. `pnpm --filter web build`
   - **Result:** ❌ Failed. Paraglide plugin downloads warn (offline), then Vite aborts because several modules import `PUBLIC_SUPABASE_URL` from `$env/static/public` without a generated export. See chunk `b74ac6`.

## Immediate Fixes Identified
- Restore `@repo/core` alias in SvelteKit and Vite configs.
- Augment `$env/static/public` / `$env/static/private` declarations to unblock TypeScript.
- Regenerate Supabase types to add `order_items` and RPC definitions (`get_conversation_messages`, etc.).
- Address lint errors by removing unused stub parameters and eliminating `any` casts.

Document further remediation steps in `phase-0-critical-fix-plan.md` once scoped.
