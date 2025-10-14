# TypeScript Production Audit

Date: 2025-10-14
Scope: Monorepo (apps/web, apps/mobile, packages/*)
TypeScript: ^5.8.2 (per root package.json)
Node: >=22.12.0 <23 (per engines)

## Summary
- The repo is largely TS-first with strict mode enabled in most packages and moduleResolution set to Bundler.
- apps/web extends SvelteKit tsconfig and already enables several strictness flags. Good foundation.
- One small issue was fixed to unblock type checks in the testing package (removed missing jest-dom types reference).
- A full type check reveals 91 errors in apps/web across 28 files—these should be triaged and resolved to reach “green”.

## Current Configuration Inventory

Root tsconfig.json
- strict: true
- moduleResolution: Bundler; isolatedModules: true
- skipLibCheck: true; verbatimModuleSyntax: true; resolveJsonModule: true; noEmit: true

Shared configs (packages/typescript-config)
- base.json: strict true, Bundler resolution, skipLibCheck true, isolatedModules true, noEmit true
- svelte.json: suitable for Svelte/SvelteKit packages (strict true, Bundler, DOM libs, isolatedModules)

apps/web/tsconfig.json
- Extends .svelte-kit/tsconfig.json (good)
- strict: true
- noUncheckedIndexedAccess: true (good)
- exactOptionalPropertyTypes: false (consider enabling)
- noImplicitOverride: true, noUnusedLocals/Parameters: true
- module: esnext, target: es2022, lib: es2022, dom, dom.iterable
- moduleResolution: bundler

apps/mobile/tsconfig.json
- Extends expo/tsconfig.base; strict: true
- Paths mapping for @repo/* and @mobile/*

Packages
- core, domain: extend @repo/typescript-config/base.json, declaration output enabled
- database: extends @repo/typescript-config/svelte.json with composite: true (DB types build), outDir: dist
- i18n: strict: false (recommend turning on), allowJs: true (evaluate necessity)
- ui: strict: true, bundler resolution; includes Svelte files
- testing: extends base.json; now types: ["vitest/globals", "node"]

ESLint
- Multiple flat configs exist, but this audit focuses on tsc settings and results.

Vitest
- Configs present for base/ui/app; UI tests use happy-dom; App config merges UI.

## Typecheck Status

- Ran: pnpm -w check-types
- Results:
  - All packages except apps/web: PASS
  - apps/web: FAIL (91 errors in 28 files)

Examples of reported issues (non-exhaustive):
- src/lib/auth/hooks.ts: assigning null to event.locals.supabase (type mismatch)
- src/service-worker.ts: Event.waitUntil not found (service worker typing mismatch)
- Several server route files report property access errors (e.g., params/id typing)

Conclusion: apps/web requires a targeted fix pass to reach zero TS errors.

## Recommendations

Priority P0 (stabilize typecheck in apps/web)
1) Supabase locals typing and lifecycle
   - Problem: event.locals.supabase is assigned null in teardown; type likely declared as non-null.
   - Fix: avoid assigning null, or type App.Locals["supabase"] as SupabaseClient | null and adjust code paths. Prefer not setting null and letting request scope end.

2) Service worker types
   - Problem: Event.waitUntil missing; event likely typed as generic Event, not ExtendableEvent (or wrong lib).
   - Fix options:
     - Annotate event parameter as ExtendableEvent and/or use ServiceWorkerGlobalScope listeners;
     - Ensure tsconfig includes the WebWorker library for this file, or rely on SvelteKit’s generated tsconfig for service worker by importing from $service-worker.

3) Server route param types
   - Problem: Property 'id' missing on typed objects.
   - Fix: Use SvelteKit types for event.params (e.g., import type { RequestHandler } and rely on the generated ./$types), or assert/validate presence before access.

4) Keep type guards around environment usage
   - Ensure server-only code uses $env/static/private where possible; avoid dynamic when unnecessary.

Priority P1 (increase strictness safely)
- Enable exactOptionalPropertyTypes: true in apps/web/tsconfig.json after P0 is green. This catches missing handling of undefined in optionals.
- Enable noUncheckedIndexedAccess in packages that perform indexed reads (already enabled in web; recommend for core/domain/ui).
- Ensure noFallthroughCasesInSwitch via ESLint rule (TypeScript doesn’t have a flag for this).
- Consider noPropertyAccessFromIndexSignature: true to enforce safer index signature usage.

Priority P2 (consistency and speed)
- Consider project references:
  - For packages that emit types (core, domain, database, ui), set "composite": true and wire references for faster incremental builds.
- Align i18n tsconfig:
  - Turn on strict: true (fix fallout gradually), disable allowJs/checkJs unless necessary; isolate JS scripts to tools folder with separate tsconfig if needed.
- Normalize moduleResolution: Bundler across all TS projects (mobile currently inherits from Expo base—verify it aligns).

Priority P3 (tooling and CI)
- Add a CI job to run:
  - pnpm -w check-types
  - pnpm -w test (optionally)
- Add svelte-check to apps/web pre-push or CI to catch Svelte typing issues early.

## Proposed Fix Plan for apps/web (P0)
- Pass 1: Supabase locals
  - Update typing in src/app.d.ts so that event.locals.supabase is either non-null and never set to null, or explicitly nullable everywhere it’s used. Prefer non-null per request scope.
- Pass 2: Service worker
  - Adjust service-worker.ts to use correct event types; ensure WebWorker libs are in effect (SvelteKit usually manages this). If needed, add "WebWorker" to lib for that file or split a tsconfig override.
- Pass 3: Route params + return types
  - Ensure server handlers use generated ./$types imports for RequestHandler/PageServerLoad so params are correctly typed.

I can execute this plan with minimal, focused edits to bring apps/web to zero errors.

## Optional Config Tweaks (post-P0)
- apps/web/tsconfig.json
  - exactOptionalPropertyTypes: true
  - Consider removing downlevelIteration: true if not required.
- packages/*/tsconfig.json
  - Add noUncheckedIndexedAccess: true where arrays/maps are accessed by index.
  - Remove allowJs/checkJs in i18n (or isolate scripts) and enable strict.

## Commands

- Run typecheck again
```powershell
pnpm -w check-types
```

- Run Svelte diagnostics (optional)
```powershell
pnpm --filter web exec svelte-check
```

## Status
- Quick fix applied: removed invalid '@testing-library/jest-dom' types from packages/testing tsconfig (typecheck unblock).
- Typecheck across monorepo: FAIL due to apps/web (91 errors). All other packages: PASS.
- Ready to implement P0 fixes in apps/web on request.
