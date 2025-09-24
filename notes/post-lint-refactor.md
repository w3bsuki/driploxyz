# Post-Lint Refactor Tracker

This tracker activates once `pnpm --filter web check-types` and `pnpm --filter web lint -- --max-warnings=0` both return 0 errors. Each checklist ties back to the existing playbooks in the repo so we can drive the codebase to production-ready quality in a structured pass.

## Current Lint Cleanup Progress (Phase 13)

**Latest Session Progress - 2025-09-23:**
- **Lint Errors:** 95 → 59 (-36 errors, 38% improvement in single session!)
- **TypeScript Errors:** 0 → 0 (maintained throughout) ✅
- **Original Baseline:** 966 lint errors, 79 TypeScript errors
- **Total Progress:** -907 lint errors since start 🚀

**Previous Session:** 332 → 248 (-84 errors, 25% improvement)
**Overall Phase 13:** 332 → 59 (-273 errors, 82% improvement)

### Work Completed - Latest Session (95 → 59 errors):

**Phase 1: Core Layout & Infrastructure (8 errors fixed)**
- `+layout.server.ts`: Fixed 3 any types with proper Session/User typing
- `+layout.svelte`: Removed 5 unused catch parameters and function args
- `+error.svelte`: Fixed undefined 'App' global + unused catch variable

**Phase 2: Protected Routes (12 errors fixed)**
- `onboarding/+page.svelte`: Fixed 4 undefined '_completionInProgress' variables + removed redundant state
- `onboarding/+page.server.ts`: Fixed any type in social links filtering
- `sell/+page.server.ts`: Fixed unused catch variable + targeted any type for boost result
- `sell/components/*`: Fixed 3 unused variables + 3 false-positive mustache interpolation errors

**Phase 3: API Handlers (16 errors fixed)**
- `api/search/+server.ts`: Fixed 5 any types with proper Database types + 1 unused variable
- `api/subscriptions/*`: Fixed 3 any types with proper validation result typing
- `api/webhooks/stripe/subscriptions/+server.ts`: Fixed 2 Stripe event object types
- Various endpoints: Fixed 5 unused catch parameters

**Previous Session:** Fixed auth pages, payment flows, admin panels, unused variables (-84 errors)
**Overall Approach:** Prioritized production-critical areas, maintained TypeScript zero errors

### Files Fixed:
- `lib/supabase/storage.ts` - Catch parameters, any types
- `lib/tutorial/manager.ts` - Catch parameters
- `lib/utils/date.ts` - Catch parameters
- `lib/utils/form-accessibility.ts` - Destructured variables
- `lib/utils/imageAnalysis.ts` - Function parameters with eslint-disable
- `lib/utils/language-switcher.ts` - Catch parameters
- `routes/api/payments/create-intent/+server.ts` - Currency any type → Currency union
- `routes/api/orders/[id]/status/+server.ts` - RequestEvent parameter type

### Next Phase Targets (248 lint errors remaining):
- Continue any type elimination in API routes and components
- Address remaining unused variables in Svelte components
- Fix empty blocks and case declarations
- Resolve import restrictions (component imports from $lib → @repo/ui)

---

## 1. Supabase Platform (See `supabase.md`)
- [ ] Regenerate database types (`pnpm --filter @repo/database db:generate`) and commit updated `packages/database/src/generated.ts`.
- [ ] Audit migrations for parity with current schema; remove superseded scripts and re-run `supabase db diff` to confirm clean state.
- [ ] Verify RLS policies for profiles, products, orders, messaging (check against Supabase docs: https://supabase.com/docs/guides/auth/row-level-security).
- [ ] Exercise RPC and REST endpoints with real data; ensure types align with the simplified query surface.
- [ ] Update monitoring hooks (log drains, audit function) and document validation runs in `supabase.md`.

## 2. SvelteKit & Routing (See `SvelteKit2.md`)
- [ ] Confirm every `+page(.server).ts` / `+layout(.server).ts` exports use `satisfies` with the correct type.
- [ ] Ensure data loading happens only in load/route modules; remove leftover module-scope state.
- [ ] Revisit route-level caching, invalidation, and streaming patterns per SvelteKit 2 docs (https://kit.svelte.dev/docs/load). Capture findings in the playbook.
- [ ] Validate server-only utilities live under `src/lib/server` with shared clients in `@repo/core`.

## 3. Svelte 5 Runes & Components (See `Svelte5.md`)
- [ ] Replace any remaining store factories using `writable` with `$state`/`$derived`. Confirm bind-forwarding is correct.
- [ ] Audit snippets/error boundaries for proper `$props()` usage and no renamed exports.
- [ ] Check shared factories/context modules for runtime reactivity (https://svelte.dev/docs/svelte-components#state-management). Update doc with edge cases discovered.

## 4. Styling & Tokens (See `TailwindCSS.md`)
- [ ] Sync Tailwind config with documented tokens, ensuring semantic class usage across apps.
- [ ] Run Tailwind build + visual regression suite; capture results.
- [ ] Verify accessibility targets (44px tap areas, colour contrast) and note changes in the playbook.

## 5. Localisation Workflow (See `Paraglide.md`)
- [ ] Regenerate bundles via Paraglide CLI; confirm language routing still passes smoke tests (reference https://inlang.com/m/ink/paraglide).
- [ ] Validate locale negotiation, fallback strings, and translated routes for storefront & admin.
- [ ] Update documentation with new locales or copy guidelines.

## 6. Turbo & Tooling (See `Turbo.md`)
- [ ] Re-run baseline: `pnpm -w turbo run lint check-types test build` and record timings.
- [ ] Ensure pipelines skip deleted performance scripts; update Turbo configuration if new tasks are required.
- [ ] Confirm caching strategy and CI matrix align with the latest repo layout.

## 7. Project Structure & Docs (See `ProjectStructure.md` and `MAIN.md`)
- [ ] Verify folder ownerships, README coverage, and removal of stale automation artefacts.
- [ ] Align documentation across playbooks�cross-link updates and note deprecations.

## 8. Testing & QA
- [ ] Unit/integration: `pnpm --filter web test`, `pnpm --filter @repo/core test` (add missing tests noted during lint fixes).
- [ ] E2E: `pnpm --filter web test:e2e`.
- [ ] Capture manual QA notes for high-risk flows (checkout, messaging, onboarding).

---

**Execution Notes**
- Update this tracker and the relevant playbook after each slice.
- If new gaps are uncovered, log them in `notes/error-inventory.md` or create dedicated issues.
- Only consider the refactor complete when every checkbox above is checked and supporting docs/tests reflect the final state.
