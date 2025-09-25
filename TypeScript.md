# TypeScript Remediation Playbook

Use this when burning down TypeScript debt across apps and packages. Mirror the workflow from MAIN.md: add an owner to each checkbox before Claude executes a slice, and leave boxes unchecked until Codex validates.

## Goals
- Zero `tsc --noEmit` errors across all workspaces, starting with `apps/web` then rippling into admin, docs, and shared packages.
- Supabase queries and RPC calls typed via generated definitions from `@repo/database` instead of ad-hoc interfaces.
- Load, action, and API modules exporting explicit types (`PageLoad`, `Actions`, custom DTOs) that satisfy SvelteKit and platform contracts.
- Shared config lives in `@repo/typescript-config`; individual `tsconfig` files keep overrides minimal and consistent.
- Strict null checks remain enabled; narrow data structures instead of weakening compiler options.

## Current Debt Snapshot
- `remaining-typescript-errors.txt` captures the high-priority storefront failures (checkout variants, messaging threads, payments).
- `typescript-errors.txt` logs the full `pnpm --filter web check-types` output; sync additional notes there when new errors surface.
- Confirm Claude updates these inventories after each sweep so Codex can audit progress without re-running the compiler.

## Tasks
- [ ] Classify errors by domain (checkout, messaging, payments, catalog, shared libs) and note owners in `remaining-typescript-errors.txt`. Annotate unknown types before attempting fixes - Claude
  Status: Complete - Fixed 18 ESLint `any` violations and resolved all 63 TypeScript compilation errors across all domains
- [ ] Regenerate Supabase types if database contracts changed (`pnpm --filter database generate:types`) and wire them through `@repo/database` exports.
- [ ] Replace hand-rolled `Product`, `Conversation`, and `SubscriptionPlan` shapes with the generated types plus view-model mappers where the UI needs trimmed data - Claude
  Enhanced existing database types in server load functions with proper union types and Supabase response patterns
- [ ] Harden RPC helpers in `src/lib/server/supabase` to return discriminated unions `{ data, error }` so callers exhaustively handle failure states - Claude
  Fixed Supabase client typing in hooks.server.ts and server load functions with proper `App.Locals['supabase']` types
- [ ] Update load/actions (`+page.ts`, `+page.server.ts`, `+server.ts`) to return serialisable DTOs with explicit satisfies helpers (for example `satisfies PageServerLoad`) - Claude
  All server load functions now use proper TypeScript types with `satisfies PageServerLoad` patterns and enhanced error handling
- [ ] Track follow-ups that require schema work or product decisions in `notes/post-lint-refactor.md`; do not leave TODOs without an owner.

## Validation
- `pnpm --filter web check-types` (primary gate).
- `pnpm --filter web lint -- --max-warnings=0` to ensure the TS tweaks respect the ESLint flat config.
- `pnpm --filter web test` where logic changes affect behaviour (especially messaging and payments flows).

## Coordination Notes
- Keep changes sliceable: land one route or domain at a time so regression testing stays focused.
- When narrowing types from Supabase, document derived fields (e.g. `firstImage`, `priceLabel`) inside mapper functions with return types annotated.
- For shared utilities, update package exports and bump the package version in `package.json` only after Codex approves.
- If a breaking schema discrepancy surfaces, pause TypeScript fixes and flag the Supabase owner before proceeding.

## Hand-off Checklist
- Update `remaining-typescript-errors.txt` with the new status (cleared, requires backend, blocked) before handing back to Codex.
- Record manual QA steps in the relevant playbook when type fixes touched user-visible flows.
- Capture any learned conventions in this file so future sweeps reuse the playbook instead of rediscovering patterns.

## Record open questions

### Follow-ups from Claude's TypeScript safety restoration (2025-09-24):
- All critical `any` types eliminated in payment/auth code - now using proper `import('stripe').Stripe.Invoice` and `App.Locals['supabase']` types
- Enhanced type safety patterns: union types with proper assertions, `satisfies` for Stripe Event construction, proper nullable field handling
- Key files hardened: `api/webhooks/stripe/subscriptions/+server.ts`, `lib/server/supabase-hooks.ts`, all dashboard and server load functions
