# Safe-to-Delete Inventory (Bloat & Duplication)

> Source-of-truth UI is `@repo/ui`. App-local components should only exist for app-specific composition. This list enumerates files and directories that can be safely deleted or archived with zero product impact, based on current imports and docs.

## High-confidence: Remove now

- Demo routes (not linked in app shell; only self-link inside demo):
  - `apps/web/src/routes/demo/`
- Performance run artifacts and reports (outputs, not code):
  - `performance-test-results/`
  - `performance-test-data/`
  - `performance-homepage.json`
  - `performance-test-results.json`
  - `bundle-analysis-results.json`
- Performance helper config if not actively used (keep only if running perf CI locally):
  - `playwright.config.performance.ts`
  - `performance-tests/`

## Duplicates and legacy variants in UI library

- Accordion duplicate (keep the Melt primitive wrapper and exported component):
  - Keep: `packages/ui/src/lib/primitives/accordion/Accordion.svelte`
  - Keep: `packages/ui/src/lib/Accordion.svelte`
  - Remove any other ad-hoc accordion copies (none currently referenced)
- Toast system legacy aliasing (modern system exported; legacy kept only for back-compat):
  - Keep: `packages/ui/src/lib/primitives/toast/*` and `MeltToastContainer`
  - If not needed, remove legacy shim after confirming no imports use `legacyToasts`:
    - `packages/ui/src/lib/ToastContainer.svelte`
    - `packages/ui/src/lib/toast-store.ts`

## App-local components that appear unused

Checked via repo-wide grep for imports. If you plan to use them later, move to a `playground/` dir; otherwise delete:

- `apps/web/src/lib/components/ConversationList.svelte`
- `apps/web/src/lib/components/EarlyBirdBanner.svelte`
- `apps/web/src/lib/components/HeroSearch.svelte`
- `apps/web/src/lib/components/LocaleDetector.svelte` (comment in layout references it, but no usage)
- `apps/web/src/lib/components/MessageInput.svelte`
- `apps/web/src/lib/components/MessageThread.svelte`
- `apps/web/src/lib/components/PageLoader.svelte`
- `apps/web/src/lib/components/RealtimeManager.svelte`
- `apps/web/src/lib/components/modular/*` (ChatWindow, ConnectionStatus, ConversationSidebar)

Caveat: keep these if you intend to wire the messaging feature imminently. They have no current imports.

## Product page legacy

- Monolithic `ProductPage` has been split into PDP sections inside `@repo/ui`. Confirm no route renders a legacy `ProductPage` (none found). Remove any stray legacy PDP demo files under:
  - `packages/ui/src/lib/demo/`

## Redundant or archived docs (keep only the canonical ones)

Move these to `docs/archive/` if not already there, or delete if already captured in canonical docs:

- Completed plans/reports superseded by `docs/00-PROJECT.md`, `docs/10-ARCHITECTURE.md`, `PRODUCTION_REFACTOR_PLAN.md`:
  - `docs/archive/PHASE1_EXECUTION_PLAN.md`
  - `docs/archive/PHASE1_COMPLETION_REPORT.md`
  - `docs/archive/COMPLETE_IMPROVEMENT_ROADMAP.md`
  - `docs/archive/COMPONENT_MIGRATION_PLAN.md`
  - `docs/archive/SHADCN_MIGRATION_COMPONENTS.md`
  - `docs/product-page-finalization-plan.md` (archive after PDP complete)
  - `docs/product-page-supabase-refactor.md` (archive after PDP complete)

## Generated/build outputs (ensure .gitignore covers these)

- `packages/ui/dist/`
- `packages/utils/dist/`
- `node_modules/.cache/`
- `packages/i18n/src/generated-*.js`
- `packages/ui/src/types.d.ts.map`

## Confirmed duplicates replaced by @repo/ui

- App should not import from `apps/web/src/lib/components/**` when an equivalent exists in `@repo/ui`. Current layout/home use `@repo/ui` for UI except:
  - `apps/web/src/lib/components/Header.svelte` (app wrapper)
  - `apps/web/src/lib/components/RegionSwitchModal.svelte` (app-specific)

These two are in use; keep them.

---

## How this list was validated

- Grepped repo for imports of each candidate; none found for items marked unused.
- Confirmed canonical exports in `packages/ui/src/lib/index.ts` for PDP sections, toasts, and primitives.
- Verified product routes use `/product/[seller]/[slug]` only; legacy `/product/[id]` not present.

## Pre-delete checklist

- Search references one more time before deletion:
  - `rg -n "ConversationList|EarlyBirdBanner|HeroSearch|LocaleDetector|Message(Input|Thread)|PageLoader|RealtimeManager"`
  - `rg -n "apps/web/src/routes/demo"`
- Run typecheck/lint/build after removal.

## If you must keep something

- Move to `apps/web/src/playground/` or `packages/ui/src/lib/experimental/` and add a note in `docs/CONTEXT.md`.

---

Owner: Frontend
Last reviewed: 2025-09-08

