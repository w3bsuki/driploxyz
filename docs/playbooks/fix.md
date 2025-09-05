# Fix Plan: Restore Apps After shadcn-svelte Migration

This plan audits current errors and lays out precise, minimal steps to restore dev/build, finalize shadcn-svelte direct usage, and prevent regressions. No code has been changed by this document.

---

## Summary of Symptoms
- Node 18 detected; Vite 7 requires Node 20.19+ or 22.12+.
- Unknown file extension “.svelte” for `bits-ui` modules during dev/SSR.
- `rune_outside_svelte` ($derived) thrown from `bits-ui`/`svelte-toolbelt` internals in SSR.
- Automated refactor replaced direct shadcn imports back to `@repo/ui` barrel.
- Aliases in `svelte.config.js` point `@repo/ui` to `src/lib/index.ts` and wildcard to `src/*`, breaking direct component imports.

---

## Root Causes
- Node version mismatch (18.x) with Vite 7 / Rollup 4 native bindings.
- Svelte component libraries (bits-ui, svelte-toolbelt, svelte-sonner) were externalized or prebundled, so Node tried to execute `.svelte`/`.svelte.js` outside Svelte’s compiler pipeline.
- Aliases do not map `@repo/ui/*` to `packages/ui/src/lib/*`, so `@repo/ui/components/ui/...` fails to resolve correctly.
- Direct shadcn usage was reverted to a global barrel, defeating the migration approach.

---

## Fix, Step by Step

1) Upgrade Node and reinstall deps
- Install Node 20.19+ (or 22.12+). Reinstall:
```
pnpm -w i --frozen-lockfile=false
```
- Optional: enforce in root `package.json` → `"engines.node": ">=20.19"`.

2) Align Vite for Svelte component libs (both apps)
- File: `apps/web/vite.config.ts` and `apps/admin/vite.config.ts`
- Ensure:
```
resolve: {
  alias: {
    '@repo/ui': fileURLToPath(new URL('../../packages/ui/src/lib', import.meta.url)),
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
```
- Optional DX: `server.hmr.overlay = false` to keep the overlay from blocking.

3) Svelte runes + alias corrections (both apps)
- File: `apps/web/svelte.config.js` and `apps/admin/svelte.config.js`
- Ensure:
```
preprocess: vitePreprocess(),
compilerOptions: { runes: true },
kit: {
  alias: {
    '@repo/ui': '../../packages/ui/src/lib',
    '@repo/ui/*': '../../packages/ui/src/lib/*',
    '@repo/database': '../../packages/database/src/index.ts',
    '@repo/i18n': '../../packages/i18n/src/index.ts'
  }
}
```

4) Restore direct shadcn imports (apps)
- Replace barrel imports with direct shadcn imports under `@repo/ui/components/ui/*`.
- Examples:
```
- import { Button, Card } from '@repo/ui'
+ import { Button } from '@repo/ui/components/ui/button'
+ import { Card } from '@repo/ui/components/ui/card'
```
- Adjust props to shadcn API:
```
- <Button variant="primary" loading />
+ <Button variant="default" disabled={loading}>
+   {#if loading}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{/if}
+ </Button>
```
- Quick codemod (preview before applying):
  - Linux/macOS:
```
rg -l "from '@repo/ui'" apps | xargs -I{} sed -i "s/from '@repo\/ui'/from '@repo\/ui\/components\/ui\/button'/g" {}
# Repeat with correct component paths per file; do not mass-replace blindly.
```
  - Windows PowerShell (example for Button only):
```
Get-ChildItem apps -Recurse -Include *.svelte,*.ts,*.js | \
  ForEach-Object { (Get-Content $_.FullName) -replace "from '@repo/ui'","from '@repo/ui/components/ui/button'" | Set-Content $_.FullName }
```
- Recommendation: do this per-component (Button, Card, Dialog, Tabs, Select, Tooltip, DropdownMenu, Accordion, Toaster/Sonner).

5) Verify shadcn components in `@repo/ui`
- They should exist under `packages/ui/src/lib/components/ui/*` including `button`, `card`, `dialog`, `dropdown-menu`, `select`, `separator`, `tabs`, `tooltip`, `sonner`.

6) Re-run checks and builds
```
pnpm -F @repo/ui build
pnpm -F web check && pnpm -F web build
pnpm -F @repo/admin check && pnpm -F @repo/admin build
```
- If you still see `.svelte`/`$derived` errors: re-check `optimizeDeps.exclude` and `ssr.noExternal` contain `bits-ui` and `svelte-toolbelt`, and confirm Node ≥ 20.19.

7) Cleanup after successful builds
- Remove adapters once no usages remain:
  - `packages/ui/src/lib/adapters/shadcn/*`
- Avoid re-exporting shadcn components from `packages/ui/src/lib/index.ts`; prefer direct imports from `components/ui/*`.
- Remove legacy components that have shadcn equivalents; confirm zero usages first.

8) Dependency hygiene
```
pnpm -w dlx depcheck apps/web
pnpm -w dlx depcheck apps/admin
pnpm -w dlx depcheck packages/ui
pnpm store prune
```
- Remove unused UI libs (e.g., Flowbite) and keep `bits-ui` only in `@repo/ui`.

9) Optional artifacts slimming
- If non-production: consider archiving/removing `apps/docs` or large performance results folders.
- Clear caches if things get weird:
```
pnpm -w dlx rimraf .turbo node_modules .pnpm-store && pnpm -w i
```

---

## Validation Checklist
- Node ≥ 20.19 installed and used.
- `apps/web` and `apps/admin` build without `.svelte` / `$derived` errors.
- Imports in apps use `@repo/ui/components/ui/*` for shadcn components.
- No direct `bits-ui` imports in apps.
- `compilerOptions.runes = true` across apps and UI package.
- Tailwind v4 in use with `@tailwindcss/vite`.
- `@repo/ui` builds (`svelte-package`) successfully.

---

## Notes
- shadcn-svelte depends on Bits UI primitives; fully removing `bits-ui` is not supported unless you reimplement primitives. Keep `bits-ui` scoped to `packages/ui` only.
- The biggest production blockers were Node 18 and Vite SSR/externalization of Svelte component libs. The alias and SSR settings above address both.
