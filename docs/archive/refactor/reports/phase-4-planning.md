# Phase 4 Planning Log

## Package Versions Summary
- Node: v22.12.0 (`node -p "process.version"`)
- pnpm: 8.15.6 (`pnpm -v`)

## Objective Notes
- **Objective 1 – Testing infrastructure**: Toast store updates now pass the
  provider ID back through `addToast`, and the Playwright config starts the
  storefront with `pnpm --filter web dev`. Vitest and Playwright runs have been
  validated on Node 22.12.0.
- **Objective 2 – Performance & build**: Added `apps/web/scripts/build-report.mjs`
  and rewired `build:metrics` so bundle sizes are captured in every validation
  cycle.
- **Objective 3 – Documentation & developer experience**: Authored
  `docs/testing/testing-guidelines.md` plus a “Testing & QA” section in
  `apps/web/README.md` so contributors have a single place to reference Phase 4
  workflows.
- **Objective 4 – Production readiness**: All packages now expose lint, check
  types, or test scripts. Turbo still attempts remote network calls inside this
  container, so lint/check/build runs must be documented together with any
  fallback `pnpm --filter` invocations.

## Git Status (`git status -sb`)
```
## work
 M apps/admin/package.json
 M apps/docs/package.json
 M apps/web/README.md
 M apps/web/package.json
 M apps/web/src/lib/env/validation.ts
 M apps/web/src/routes/(protected)/dashboard/upgrade/+page.svelte
 M apps/web/src/routes/(protected)/onboarding/+page.svelte
 M apps/web/src/routes/offline/+page.ts
 M apps/web/src/routes/privacy/+page.ts
 M apps/web/src/routes/privacy/cookies/+page.ts
 M apps/web/src/routes/returns/+page.ts
 M apps/web/src/routes/terms/+page.ts
 M apps/web/src/routes/trust-safety/+page.ts
 M apps/web/svelte.config.js
 M packages/database/package.json
 M packages/eslint-config/package.json
 M packages/i18n/lib/index.d.ts
 M packages/i18n/lib/index.d.ts.map
 M packages/i18n/lib/index.js
 M packages/i18n/lib/paraglide/messages/_index.js
 M packages/i18n/lib/paraglide/runtime.js
 M packages/i18n/package.json
 M packages/i18n/project.inlang/settings.json
 M packages/i18n/src/index.ts
 M packages/typescript-config/package.json
 M packages/ui/package.json
 M packages/ui/src/lib/primitives/toast/store.svelte.ts
 M pnpm-lock.yaml
?? apps/admin/eslint.config.ts
?? apps/web/playwright.config.ts
?? apps/web/scripts/
?? docs/refactor/
?? docs/testing/
?? packages/database/eslint.config.ts
?? packages/i18n/eslint.config.ts
?? packages/i18n/scripts/generate-message-exports.mjs
?? packages/i18n/src/generated/
?? packages/i18n/src/runtime.ts
```
