# Testing Guidelines

These notes cover how to run the Phase 4 quality gates for the monorepo. The
commands below assume you are using **Node 22.12.0** (`nvm use 22.12.0`) and
have installed dependencies with `pnpm install`.

## Unit & component tests (Vitest)
- **UI primitives** – run `pnpm --filter @repo/ui test` to execute the Melt UI
  toast store suite. We added provider-aware deduplication logic, so make sure
  the tests confirm duplicate toast IDs are not emitted twice.
- **Web storefront** – run `pnpm --filter web test` to execute SvelteKit sync,
  Vitest component checks, and the Playwright smoke suite in one pass. This
  uses the new `playwright.config.ts` which boots the site through
  `pnpm --filter web dev` so that local Playwright runs line up with the Turbo
  tasks.

## End-to-end smoke tests (Playwright)
- Run `pnpm --filter web test:e2e` for a standalone Playwright pass when you
  only want browser coverage. The script now includes `--pass-with-no-tests`
  so local smoke runs do not fail when no specs are present. Update
  `apps/web/tests` whenever new flows are introduced.

## Build validation & bundle metrics
- Run the production build with `pnpm --filter web build` to generate the
  `.svelte-kit/output` artifacts and catch accessibility warnings early.
- Run `pnpm --filter web build:metrics` to invoke
  `apps/web/scripts/build-report.mjs`. The script performs a full Vite build and
  prints the top bundle assets plus total client/server sizes so you can track
  regressions. Capture the output in the Phase 4 validation log.

## Turbo / workspace wide checks
- `pnpm -w turbo run lint`
- `pnpm -w turbo run check-types`
- `pnpm -w turbo run build`

In the current containerised environment, Turbo’s invocation for the shared
config packages (`@repo/eslint-config`, `@repo/typescript-config`,
`@repo/i18n`) may emit `ENETUNREACH` network errors even though the underlying
package scripts succeed individually. If that happens, re-run the relevant
package scripts with `pnpm --filter` and record the failure plus manual
fallback in the validation log.

## Environment variables & prerendering
The onboarding and upgrade routes now read the Stripe publishable key from a
runtime-safe helper. Any route that requires dynamic environment access must
export `prerender = false`; all legal/offline pages (including
`privacy/cookies`) have been updated accordingly. Confirm that new routes follow
this pattern so the production build remains stable.
