# Post-Lint Refactor Tracker

This tracker activates once `pnpm --filter web check-types` and `pnpm --filter web lint -- --max-warnings=0` both return 0 errors. Each checklist ties back to the existing playbooks in the repo so we can drive the codebase to production-ready quality in a structured pass.

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
- [ ] Align documentation across playbooks—cross-link updates and note deprecations.

## 8. Testing & QA
- [ ] Unit/integration: `pnpm --filter web test`, `pnpm --filter @repo/core test` (add missing tests noted during lint fixes).
- [ ] E2E: `pnpm --filter web test:e2e`.
- [ ] Capture manual QA notes for high-risk flows (checkout, messaging, onboarding).

---

**Execution Notes**
- Update this tracker and the relevant playbook after each slice.
- If new gaps are uncovered, log them in `notes/error-inventory.md` or create dedicated issues.
- Only consider the refactor complete when every checkbox above is checked and supporting docs/tests reflect the final state.
