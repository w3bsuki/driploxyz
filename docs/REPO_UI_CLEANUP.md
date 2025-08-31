# Repo UI Cleanup & Usage Guide

This guide standardizes on the shared UI package (`@repo/ui`), removes app-level duplicates, and prepares for Melt UI wrappers. Hand this to Claude-code to execute.

## Canonical Decision

- Shared, reusable UI lives in `packages/ui` and is imported as `@repo/ui`.
- App-only, feature/page-specific UI stays in `apps/web/src/lib/components`.
- Rule of 2: If a component is used in 2+ places, promote it to `@repo/ui`.

## 1) Verify Exports and Structure

- Ensure `@repo/ui` re-exports primitives and components:
  - packages/ui/src/lib/index.ts:188
  - Add if missing:

```ts
// Design tokens
export * from './tokens.js';

// Melt UI Primitives (wrappers live under ./primitives)
export * from './primitives';

// Example explicit exports (add as needed)
export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';
export { default as Select } from './Select.svelte';
```

- Create primitives folder (for Melt UI wrappers):

```bash
mkdir -p packages/ui/src/lib/primitives/{dialog,menu,select,popover,tabs,tooltip,toast,switch,checkbox,slider}
```

## 2) Install Melt UI (UI Package Only)

```bash
pnpm --filter @repo/ui add @melt-ui/svelte
```

Note: Melt UI is headless; there’s no one-shot generator. Wrappers are created manually (templates in docs/MELT_UI_MIGRATION.md:1).

## 3) Replace App Duplicates With @repo/ui

- Find app-local UI imports to replace:

```bash
rg -n "from '[$]lib/components/|from \"[$]lib/components/" apps/web/src | tee /tmp/ui_dupes.txt
```

- Switch to `@repo/ui` equivalents where they exist (start with high-traffic):
  - LazySearchResults → `@repo/ui/LazySearchResults.svelte`
  - Header internals (avatar dropdown, menu) → `@repo/ui` primitives once Melt wrappers land
  - Inputs/Select/Modal/Tooltip → `@repo/ui` versions

- After replacements build, delete dead files to avoid drift:

```bash
# Example (confirm each before deleting)
git rm apps/web/src/lib/components/LazySearchResults.svelte
```

## 4) Enforce Usage (ESLint Guardrail)

- apps/web/eslint.config.js:1 — add no-restricted-imports to block shared UI under `$lib/components`:

```js
export default [
  // ...existing
  {
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        '../lib/components/*',
        '../../lib/components/*',
        '../../../lib/components/*',
        '$lib/components/*'
      ]}]
    }
  }
]
```

## 5) Tokenized Styling Discipline

- Prefer `@repo/ui` token utilities over raw colors/sizes. Optional CI guard:

```bash
rg -n "#([0-9a-fA-F]{3,8})|oklch\(|rgb\(" apps/web/src | tee /tmp/bad_colors || true
[ -s /tmp/bad_colors ] && { echo "Found raw colors. Use tokens."; exit 1; } || true
```

- Ensure apps load `@repo/ui` styles (tokens and optional semantic utilities) via the package entry.

## 6) Build & Verify

```bash
pnpm --filter @repo/ui check && pnpm --filter @repo/ui build
pnpm --filter web check-types && pnpm --filter web build
```

Smoke test pages: home, search, product, listing, header menus.

## 7) Melt UI Migration (Wrappers)

- Follow docs/MELT_UI_MIGRATION.md:1 for wrapper templates (Dialog, Menu, Select, etc.).
- Phase A: Header Menu, QuickView Dialog, Listing Select.
- Phase B: Remaining dialogs/menus/tooltips/tabs, add Toast.
- Phase C: Switch switches/checkboxes/sliders and remove legacy code.

## FAQ

- “Is manually creating wrappers right?” — Yes. Melt UI is headless; you author small Svelte wrappers that apply behavior (`use:trigger`, `use:content`, etc.) and your tokenized styles. There is no official generator.
- “Is there a command to ‘add melt ui shit’?” — Only install: `pnpm --filter @repo/ui add @melt-ui/svelte`. Components are intentionally manual to keep your API/brand stable.

---

Owner: UI Platform  
Related: docs/MELT_UI_MIGRATION.md:1
