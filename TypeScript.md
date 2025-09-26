# TypeScript Refactor Playbook

> **Claude execution prompt**  
> Copy the instructions below into Claude-Code before running any changes. Claude must work through the checklist in order, pause after each milestone for Codex review, and paste command outputs back into this file where noted.  
> ```
> You are assisting with the Driplo TypeScript refactor. Follow the "Execution Steps" section verbatim. After each step:
>  1. Run the required commands.
>  2. Paste the exact terminal output into the "Progress Log" code blocks.
>  3. Stop and ask Codex to validate before continuing.
> Never mark a checkbox yourself—Codex will do that once the change is reviewed. If a step requires backend changes (Supabase migrations, config updates) that you cannot perform, document the requirement in `docs/supabase-handoff.md` using the provided template.
> ```

## Current state snapshot
- `types-validation.txt` captures the latest `pnpm --filter web check-types` failure. The compiler is blocking on:
  - `ProductService.getPromotedProducts` reducing `ProductWithJoinedData` rows into a narrower shape before mapping, causing TS2345.【F:types-validation.txt†L5-L14】
  - Stripe webhook helpers reading properties (`current_period_start`, `invoice.subscription`) that the installed SDK typings do not expose.【F:types-validation.txt†L14-L21】
  - Supabase realtime subscriptions using the string overload instead of the structured payload overload, triggering TS2769.【F:types-validation.txt†L21-L26】
  - Favorites and messaging loaders coercing RPC results through `any`, so the generated database client rejects the calls.【F:types-validation.txt†L27-L44】
- `lint-output.txt` shows companion ESLint failures (`no-explicit-any`, undefined variables, `svelte/no-object-in-text-mustaches`) in the same areas, so TypeScript fixes must ship alongside lint cleanup.【F:lint-output.txt†L6-L74】

## Objectives
1. Drive `pnpm --filter web check-types` to zero errors for `apps/web`, then apply the same patterns to remaining apps/packages.
2. Remove all explicit `any` casts introduced in the Stripe, realtime, favorites, messaging, and onboarding flows.
3. Ensure Supabase helpers return typed DTOs that match the generated `@repo/database` interfaces without unsafe casting.
4. Keep strict settings (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) enabled; never weaken tsconfig rules to make errors disappear.

## Execution steps
1. **Reset telemetry**  
   - Delete stale status lines from `remaining-typescript-errors.txt` and create a fresh inventory grouped by domain.  
   - Command: `pnpm --filter web check-types > types-validation.txt` (ensure the log reflects the current tree).  
   - Record the top 20 unique error signatures in the log section below.
2. **Product & promotion services**  
   - Align `getPromotedProducts`, `getNewestProducts`, and `getFeaturedProducts` to the generated Supabase shapes.  
   - Replace all `as ProductWithImages` casts with mapper functions that guard nullable relations.  
   - Re-run `pnpm --filter web check-types` and update the Progress Log.
3. **Stripe webhook layer**  
   - Add type predicates for subscription and invoice payloads, moving Unix date conversion into helpers that accept `number | null`.  
   - Ensure no `any` remains in `stripe.ts` and server routes.  
   - Run both `pnpm --filter web check-types` and `pnpm --filter web lint -- --max-warnings=0`.
4. **Realtime subscriptions**  
   - Switch order/favorite realtime listeners to the typed `.on({ event, schema, table, filter }, handler)` overload.  
   - Type handlers with `RealtimePostgresChangesPayload<Database['public']['Tables']['orders']['Row']>` or domain equivalents.  
   - Confirm type and lint commands stay green.
5. **Favorites & messaging loaders**  
   - Import the generated RPC result types, eliminate `any`, and ensure mapped DTOs treat nullable relations safely.  
   - Add regression unit tests or server-side assertions where data is transformed.  
   - Run `pnpm --filter web check-types`, `pnpm --filter web lint`, and any impacted vitest suites (`pnpm --filter web test -- favorites messaging`).
6. **Sweep remaining errors**  
   - Work through the refreshed `remaining-typescript-errors.txt` inventory until the command exits with status 0.  
   - Update the checklist below and capture any blocked items in `notes/post-typescript-refactor.md` with owners and next steps.

## Deliverables
- Updated service modules with typed mappers and guards (products, stripe, realtime, favorites, messaging).
- Refreshed test coverage where data transformations changed.
- Clean `types-validation.txt` showing `tsc --noEmit` success.
- Updated `remaining-typescript-errors.txt` describing residual work (should be empty at completion).

## Validation checklist
- [ ] `pnpm --filter web check-types`
- [ ] `pnpm --filter web lint -- --max-warnings=0`
- [ ] `pnpm --filter web test` (targeted suites documented in the Progress Log)
- [ ] `pnpm -w turbo run check-types --filter=!web` (other packages/apps)

## Progress log
Paste command outputs after each step so Codex can review:
```text
# Step 1 – baseline compiler output

```
```text
# Step 2 – products services rerun

```
```text
# Step 3 – stripe rerun

```
```text
# Step 4 – realtime rerun

```
```text
# Step 5 – favorites/messaging rerun

```
```text
# Step 6 – final verification

```

## Notes & blocked items
Use this table to capture work Claude cannot finish (migrations, product decisions, etc.). Codex will review and assign owners.

| Date | Blocked item | Owner | Next action |
| ---- | ------------ | ----- | ----------- |

