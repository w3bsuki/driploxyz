# Svelte 5 + shadcn-svelte Migration and Cleanup Plan

This playbook documents the end-to-end steps to complete the migration to Svelte 5 with shadcn-svelte UI, align configs for Tailwind CSS v4, and remove legacy UI code safely.

Use it as a checklist when touching each app/package in this monorepo.

---

## 1) Prerequisites and Versions

- Node: 20.19+ (or 22.12+) — Vite 7 requires this.
- PNPM: 8.x (repo uses `pnpm@8.15.6`).
- Svelte: 5.x (runes mode).
- Vite: 7.x.
- SvelteKit: 2.3x.
- Tailwind CSS: 4.x with `@tailwindcss/vite`.

Commands:

```bash
node -v     # should be >= v20.19
pnpm -v
```

If upgrading Node, reinstall deps:

```bash
pnpm -w i --frozen-lockfile=false
```

---

## 2) Workspace Alignment (single Svelte runtime)

- Ensure every app uses workspace sources for `@repo/ui` during dev.
- Dedupe `svelte` in Vite resolve to avoid multiple runtimes.
- Avoid prebundling Svelte component libs and force transform in SSR.

Required Vite config (example for apps):

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  resolve: {
    alias: {
      '@repo/ui': fileURLToPath(new URL('../../packages/ui/src/lib/index.ts', import.meta.url)),
      '@repo/ui/types': fileURLToPath(new URL('../../packages/ui/src/types', import.meta.url))
    },
    dedupe: ['svelte']
  },
  optimizeDeps: {
    exclude: ['@repo/ui', 'bits-ui', 'svelte-sonner', 'svelte-toolbelt']
  },
  ssr: {
    noExternal: ['@repo/ui', 'bits-ui', 'svelte-sonner', 'svelte-toolbelt']
  },
  server: {
    // Optional: keep dev overlay from blocking the screen
    hmr: { overlay: false }
  }
});
```

Svelte config (runes mode) for apps and packages:

```js
// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: { runes: true },
  kit: {
    alias: {
      '@repo/ui': '../../packages/ui/src/lib/index.ts',
      '@repo/ui/*': '../../packages/ui/src/*'
    }
  }
};
```

Why: Prevents “Unknown file extension .svelte” and “rune_outside_svelte” by ensuring the Svelte plugin transforms `.svelte` and `.svelte.js/ts` inside node_modules for Bits/shadcn-svelte.

---

## 3) Tailwind CSS v4 Setup

- Use `@tailwindcss/vite` plugin in every app and the UI package.
- Remove legacy Tailwind v3 config files (postcss config, old plugin wiring) where applicable.
- Make sure the app imports UI package CSS tokens and semantics:

```ts
// Example: apps/web/src/app.css (or layout)
import '@repo/ui/styles/tokens.css';
import '@repo/ui/styles/semantic.css';
import '@repo/ui/styles/globals.css';
```

Notes:
- v4 ignores `content` globs; relies on Vite.
- Migrate custom utilities to CSS layers or CSS variables where possible.

---

## 4) Adopt shadcn-svelte CLI for Components

The repo already includes `packages/ui/components.json`. Use the CLI to scaffold components into `packages/ui/src/lib/components/ui` and keep our wrappers/adapters thin.

Run from `packages/ui`:

```bash
pnpm dlx shadcn-svelte@latest add \
  button card dialog dropdown-menu select separator tabs tooltip toast accordion sonner
```

Guidelines:
- Keep shadcn-svelte components colocated under `packages/ui/src/lib/components/ui/*`.
- Wrap them with adapters under `packages/ui/src/lib/adapters/shadcn/*` if you need custom props/behaviors to match our prior APIs.
- Prefer composition over forking where possible.

Important: shadcn-svelte uses Bits UI primitives internally. It is expected to keep a Bits dependency unless you reimplement primitives yourself.

---

## 5) Component Migration Strategy

Target: replace legacy UI with shadcn-svelte equivalents while preserving app-level APIs.

Steps per component:
1. Add the matching shadcn component via CLI.
2. Build an adapter in `lib/adapters/shadcn/` that maps old props/events to new ones.
3. Update usages in apps to import from `@repo/ui` instead of local implementations.
4. Verify visuals align with our tokens. Adjust classes using Tailwind v4 and our semantic tokens.
5. Remove the legacy component from `lib` once all usages are migrated.

Examples:
- Modal → shadcn `Dialog` (adapter: `Dialog.svelte`).
- Menu / Dropdown → shadcn `DropdownMenu` (adapter: `Menu.svelte`).
- Select → shadcn `Select` (adapter exists: `adapters/shadcn/Select.svelte`).
- Tabs, Accordion, Tooltip, Toast → use shadcn components and our tokens.

---

## 6) Cleanup: Remove Legacy/Migration Debris

Search for legacy imports:

```bash
# Melt UI (should be gone)
rg -n "@melt-ui|melt-ui" packages apps || true

# Direct Bits UI usage in our own code (should only exist inside shadcn components)
rg -n "from 'bits-ui'|from \"bits-ui\"" packages/ui/src || true
```

Then:
- If a component is fully replaced by a shadcn equivalent, remove the legacy component file.
- When all direct `bits-ui` imports are confined to shadcn components only, consider leaving Bits as a dev dep of `@repo/ui`. Removing Bits entirely is not feasible unless you reimplement primitives.
- Delete unused utilities/variants that were specific to old components.

Package.json hygiene:
- In each app/package, remove unused UI libs once migration is done.
- Keep `bits-ui` only in `packages/ui` if shadcn components are used there.

---

## 7) Build, Dev, Test

Reinstall after Node upgrade and config changes:

```bash
pnpm -w i

# Build UI first if needed
pnpm -F @repo/ui build

# Run apps
pnpm -F web dev
pnpm -F @repo/admin dev
```

Troubleshooting:
- “Unknown file extension .svelte”: check `ssr.noExternal` and `optimizeDeps.exclude` include `bits-ui` and `svelte-toolbelt`, ensure Node ≥ 20.19.
- “rune_outside_svelte”: same as above; ensure `.svelte.js/ts` from deps go through the Svelte plugin.
- Rollup native errors: usually Node 18; upgrade Node and reinstall.

---

## 8) Tailwind v4 Theming with Tokens

- Use `packages/ui/src/styles/tokens.css` to define design tokens.
- Use `semantic.css` to map tokens to semantic roles/classes (buttons, inputs, surfaces).
- Enforce usage in shadcn components: prefer adding classes via `class` props composed with our tokens (e.g., `bg-surface`, `text-muted`, `border-subtle`).

---

## 9) Linting/Type Safety

- `svelte-check` should run with `--tsconfig` in apps and `@repo/ui`.
- Keep `compilerOptions.runes: true` everywhere.
- Ensure TypeScript paths don’t resolve to compiled dist during dev.

---

## 10) Final Removal Checklist

- [ ] All components consuming legacy UI replaced by shadcn variants or adapters.
- [ ] All direct `bits-ui` imports outside shadcn component directories removed.
- [ ] No `@melt-ui/*` imports remain.
- [ ] Apps build and run on Node ≥ 20.19.
- [ ] Vite configs: alias, dedupe, optimizeDeps.exclude, ssr.noExternal updated.
- [ ] Tailwind v4 active with `@tailwindcss/vite` everywhere.
- [ ] Tokens and semantic CSS imported by apps.
- [ ] UI package builds (`svelte-package`) and types emit cleanly.

---

## Appendix: Commands

Common maintenance:

```bash
# Clean caches when weirdness happens
pnpm -w dlx rimraf node_modules .pnpm-store .turbo && pnpm -w i

# Rebuild UI
pnpm -F @repo/ui build

# Add new shadcn component
pnpm -C packages/ui dlx shadcn-svelte@latest add tooltip
```

