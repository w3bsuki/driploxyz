# Driplo Monorepo — Svelte + TypeScript Error Inventory (2025-10-15)

This report captures the current TypeScript and Svelte diagnostics across the workspace, without applying any fixes. It will guide the upcoming MCP-assisted remediation plan.

Generated on: 2025-10-15
Node/Tooling: pnpm, Turbo, svelte-check, tsc

## How checks were run

- Monorepo TypeScript: `pnpm -w run check-types` (Turbo task)
- Web app TypeScript: `pnpm --filter web run check-types` (runs `svelte-kit sync && tsc --noEmit`)
- Web app Svelte check: `pnpm --filter web run check` (runs `svelte-kit sync && svelte-check`)
- UI package Svelte check: `pnpm --filter @repo/ui run check` (runs `svelte-check`)
- Additional per-package TypeScript checks ran where applicable

No code changes were made. Svelte MCP autofixer was NOT used to mutate files; it was only invoked to assess a single component for validation of integration, as requested to use MCP servers before fixing.

---

## Summary

- TypeScript (monorepo via Turbo): FAILED due to invalid tsconfig settings in several packages
- Web app TypeScript: 36 errors in 24 files
- Web app svelte-check: 603 errors, 8 warnings in 96 files
- UI package svelte-check: 52 errors, 8 warnings in 36 files

High-level themes:
- Invalid tsconfig option `ignoreDeprecations` with current TS (TS5103)
- Missing .d.ts for internal packages (`@repo/core`, `@repo/domain`), implicit any modules
- Numerous Svelte 5 runes typing issues in components (props typing, event props, `Promise` misuse in `{#if}`, generics)
- Strictness issues (nullability, union narrowing, `never`, incorrect inferred types from Supabase `Json`)
- Mismatched prop names and invalid props for components in `@repo/ui` and `apps/web`

---

## Monorepo TypeScript (Turbo)

Command: `pnpm -w run check-types`

Observed failures (representative):

- packages/domain/tsconfig.json:3:3 — TS5103 Invalid value for '--ignoreDeprecations'
- packages/core/tsconfig.json:3:3 — TS5103 Invalid value for '--ignoreDeprecations'
- packages/testing/tsconfig.json:3:3 — TS5103 Invalid value for '--ignoreDeprecations'

Root cause: The shared `@repo/typescript-config/base.json` sets `"ignoreDeprecations": "6.0"`. Current TS (5.8.x) rejects this value. Downstream packages that extend base inherit it and fail tsc.

Affected packages: @repo/core, @repo/domain, @repo/testing (at least). `packages/mobile-shared` also has `ignoreDeprecations` directly set to "6.0".

---

## Web app — TypeScript (`apps/web`)

Command: `pnpm --filter web run check-types`

Errors found: 36 errors in 24 files. Highlights:

- Missing types for internal workspace packages (TS7016):
  - '@repo/core', '@repo/core/services', '@repo/core/utils', '@repo/core/stripe', '@repo/core/stripe/server'
  - '@repo/domain/conversations'
  Impact: Many +page.server.ts and API routes fail because imports resolve to JS in dist without .d.ts

- Implicit any and parameter typing:
  - Filter callbacks and `.then((result) => ...)` params untyped

- Incorrect union handling / nullability:
  - Comparing promise to boolean (`hasOauth: Promise<boolean>` used in `{#if}`)
  - `{#each}` over `Promise<OAuthProvider[]>`
  - Accessing `.length` on `string | true`
  - Passing `string | null` to APIs expecting `string`
  - Multiple `never` property access errors from narrow types

- Wrong prop shapes to internal components:
  - Using props that don't exist (e.g. `"isNavigating"`, `"translations"`, `"class"` on certain components expecting strict props)
  - Mismatched function prop signatures

- Data shape mismatches in domain models (e.g., `OrderUI`, `ProductUI`) vs UI uses

Files with errors (sample excerpt):
- src/lib/server/utils/payments.ts, src/lib/utils/payments.ts — TS7016 for '@repo/core/stripe'
- multiple +page.server.ts across shop and protected routes — TS7016 for '@repo/core'
- src/routes/(protected)/messages — TS7016 for '@repo/domain/conversations'
- src/routes/(auth)/signup/+page.svelte — numerous prop and union issues
- src/routes/(protected)/dashboard/* — numerous nullability and type mismatch issues

Full file list and counts were printed by tsc (24 files, 36 errors).

---

## Web app — Svelte check (`apps/web`)

Command: `pnpm --filter web run check`

Result: 603 errors, 8 warnings in 96 files. Representative issues:

- Signup page:
  - Accessing missing keys in discriminated union of `form.errors` (`_form`, `terms`, `fullName`)
  - Using `Promise` values directly in `{#if}` and `{#each}`
  - Type of checkbox value handling (`string | boolean`)
  - Toast options include non-existent props (e.g., `important`)

- Protected pages (account, orders, settings, onboarding):
  - Nullability for dates and usernames; passing `null` to functions expecting `string`
  - Union/object types inferred to `never` then property accessed
  - Many UI prop mismatches to `@repo/ui` components

- Sell flow components:
  - Index signatures and array types for steps and categories
  - Passing numbers where inputs expect strings
  - Custom component `Props` don’t allow given attributes (`onchange`, `class`, `items`)

- Messages module:
  - Missing d.ts for `@repo/domain/conversations`
  - Filtering with implicit `any`

- Profile edit:
  - Treating `Json`-typed fields as arrays/objects without narrowing, causing `string | number | true | ...` unions to be used in `filter`, spread, etc

Warning examples:
- Empty CSS rulesets
- CSS vendor-specific properties without standard alternative

Note: Many of these will collapse once domain/Core package types are available and UI components’ prop typings are aligned.

---

## UI package — Svelte check (`packages/ui`)

Command: `pnpm --filter @repo/ui run check`

Result: 52 errors, 8 warnings in 36 files. Representative issues:

- Wrong Svelte DOM typings usage:
  - `HTMLDivAttributes` (should be `HTMLAttributes` with generic)
  - Props composed from `HTMLButtonAttributes` and `HTMLAnchorAttributes` causing conflicts in union/extend
  - Passing `aria-*` and other HTML props to custom components not allowing them

- Timeout typing in Node/JSDOM:
  - `Timeout` vs `number`: `setTimeout` typing — should use `ReturnType<typeof setTimeout>` or `number` in browser context

- CategorySearchBar.svelte (current file):
  - Errors like "This expression is not callable" when using `currentCategoryDisplay().breadcrumb[...]` due to function vs value typing

- Missing internal modules:
  - Importing `../../utils/runtime.js`, `../../primitives/toast/store` types
  - Importing `$app/environment` and `$app/navigation` from inside a library package (should avoid depending on app-only kit modules)

- Component prop mismatches:
  - Supplying props that are not declared in `Props` interfaces (`items`, `userType`, `aria-describedby`, etc)
  - Event handlers/functions type mismatches (`SearchFunction` types)

Warnings:
- Empty CSS rulesets
- Non-standard CSS property usage (e.g., `ring`) or missing standard equivalents

---

## Additional context fetched (MCP docs)

- Svelte 5 runes, $props typing, wrapper component typings (`svelte/elements`) and migration notes: OK
- SvelteKit CLI `svelte-kit sync` and generated types guidance: OK
- Svelte `$app/*` module docs: OK for app usage; not for library packages

We did not apply MCP fixes yet per instructions. Svelte MCP autofixer was used to validate the integration on `CategorySearchBar.svelte` only and returned suggestions to add keys on `#each`, confirming MCP connectivity.

---

## Initial remediation plan (no execution yet)

1) TypeScript config unblock
- Remove or gate `ignoreDeprecations` in `@repo/typescript-config/base.json` and any per-package tsconfig that sets it.
- Re-run monorepo typecheck to surface real code errors in `@repo/core`, `@repo/domain`, `@repo/testing`.

2) Publish or generate types for internal packages
- Ensure `@repo/core` and `@repo/domain` emit .d.ts to `dist` or provide `types` pointing to source `.d.ts`.
- If temporary, add ambient module declarations in `apps/web/src/types/ambient.d.ts` for blocking imports.
- Re-run `web` typecheck; expect large reduction of TS7016 errors.

3) SvelteKit sync hygiene
- Always run `svelte-kit sync` before checks and builds for `apps/web`.
- Ensure `apps/web/tsconfig.json` extends `.svelte-kit/tsconfig.json` (it does), and generated types are present.

4) UI library prop typing and DOM attributes
- Refactor component prop typings to use `svelte/elements` (`HTMLButtonAttributes`, `HTMLAnchorAttributes`, `SvelteHTMLElements['div']`) patterns without conflicting intersections; consider discriminated props to pick `<a>` vs `<button>` props.
- Fix Timeout typings with `ReturnType<typeof setTimeout>`.
- Remove `$app/*` imports from `packages/ui` (replace with environment-agnostic helpers or optional injection from app).

5) Web app component fixes (guided by MCP Svelte autofixer)
- Correct union usage in templates: don’t use `Promise` in `{#if}`/`{#each}`, null-checks, and explicit type guards.
- Align prop names with UI components, remove invalid props.
- Normalize data shapes from Supabase queries to expected UI types (derive mappers where needed), avoid `never` by properly typing API results.

6) Supabase types refresh
- Run `pnpm run db:types` to refresh generated types if schema drift; update usage sites accordingly.

7) Verification
- `pnpm -w run check-types`
- `pnpm --filter web run check`
- `pnpm --filter @repo/ui run check`

We will use Svelte MCP autofixer iteratively component-by-component and Context7 docs for Svelte 5/Kit 2 nuances. Supabase MCP can assist in validating query shapes against schema.

---

## Next steps (pending approval)

- Approve running MCP-guided fixes per plan
- Start with tsconfig cleanup, then internal package types, then UI prop typings, then app pages
- Iterate until checks pass

