# claude-code Playbook: Svelte 5 + shadcn-svelte (Direct Usage) and Full Cleanup

This guide tells Claude exactly how to finish the shadcn-svelte migration with direct imports (no adapters), then perform a full repo cleanup. Do not modify code unless explicitly instructed by the user; verify and propose diffs first when in doubt.

---

## Principles
- Direct usage: Import shadcn-svelte components directly; avoid adapters/wrappers.
- Single source: All UI lives under `@repo/ui` so apps don’t duplicate components.
- Minimal surface: Avoid mega re-export barrels to preserve tree-shaking.
- One runtime: Ensure a single Svelte runtime across apps.

---

## Pre-Flight
- Node: 20.19+ (or 22.12+)
- PNPM: 8.x
- Svelte: 5.x (runes mode)
- Tailwind: 4.x with `@tailwindcss/vite`

Verify:
```
node -v
pnpm -v
```

---

## Repo Conventions
- UI home: `packages/ui/src/lib/components/ui/*`
- Styles: `packages/ui/src/styles/{tokens.css,semantic.css,globals.css}`
- App imports (target):
  - Good: `import { Button } from '@repo/ui/components/ui/button'`
  - Avoid: `import { Button } from '@repo/ui'` (global barrel)
  - Avoid: any `adapters/shadcn/*`

---

## Vite/Svelte Settings (Claude: verify; only change with approval)
- `resolve.dedupe: ['svelte']` in all app `vite.config.*`.
- `optimizeDeps.exclude`: `['@repo/ui','bits-ui','svelte-sonner','svelte-toolbelt']`
- `ssr.noExternal`: `['@repo/ui','bits-ui','svelte-sonner','svelte-toolbelt']`
- Svelte runes on everywhere: `compilerOptions: { runes: true }`.
- App aliases during dev should point to lib root to support direct component imports:
  - `'@repo/ui': '../../packages/ui/src/lib'`
  - `'@repo/ui/*': '../../packages/ui/src/lib/*'`

Rationale: Ensures `.svelte` from shadcn/bits paths are transformed by the Svelte plugin and prevents multi-Svelte runtime issues.

---

## Phase 1 — Install shadcn Components (in `packages/ui`)
Run from `packages/ui` (confirm with the user before installing):
```
pnpm dlx shadcn-svelte@latest add \
  button card dialog dropdown-menu select separator tabs tooltip toast accordion sonner
```
Expected: components land under `packages/ui/src/lib/components/ui/<name>` with `index.ts` exports.

---

## Phase 2 — Replace Imports (Direct Usage)
Migrate app code from legacy/barrel imports to direct shadcn usage via `@repo/ui/components/ui/*`.

Examples:
```
- import { Button, Card } from '@repo/ui'
+ import { Button } from '@repo/ui/components/ui/button'
+ import { Card } from '@repo/ui/components/ui/card'
```
Adjust props to shadcn API:
```
- <Button variant="primary" loading />
+ <Button variant="default" disabled={loading}>
+   {#if loading}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{/if}
+ </Button>
```

---

## Phase 3 — Tailwind v4 Wiring
Ensure each app imports UI CSS once (layout or entry):
```
import '@repo/ui/styles/tokens.css';
import '@repo/ui/styles/semantic.css';
import '@repo/ui/styles/globals.css';
```
Keep `@tailwindcss/vite` enabled in all apps and in `@repo/ui`.

---

## Phase 4 — Remove Adapters and Barrels (after usages replaced)
- Delete adapter wrappers only after all usages are migrated:
  - `packages/ui/src/lib/adapters/shadcn/*`
- Avoid re-exporting every UI component through a global barrel (`packages/ui/src/lib/index.ts`).
  - Rule: Apps import from `@repo/ui/components/ui/<name>`.

---

## Phase 5 — Purge Legacy UI
- Remove legacy components in `packages/ui/src/lib/*` that have shadcn equivalents.
- Find usages before deleting:
```
grep -RIn "from '@repo/ui'" apps | sed -n '1,200p'
# For each legacy component name, search usages in apps and migrate first.
```

---

## Phase 6 — Remove Melt UI and Direct Bits Usage in Apps
- Melt should not exist:
```
grep -RIn "@melt-ui\|melt-ui" . || true
```
- Bits is allowed only inside shadcn component implementations within `packages/ui/src/lib/components/ui/*`.
```
# No direct bits-ui in apps
grep -RIn "from 'bits-ui'\|from \"bits-ui\"" apps || true
```

Note: shadcn-svelte depends on Bits UI primitives. Do not attempt to remove `bits-ui` from the UI package unless you plan to reimplement primitives.

---

## Phase 7 — Dependency Hygiene
- Remove unused libs (Flowbite, etc.) once confirmed unused.
- Keep `bits-ui` only in `@repo/ui`.
- Unify versions across packages.

Tools:
```
pnpm -w dlx depcheck apps/web
pnpm -w dlx depcheck apps/admin
pnpm -w dlx depcheck packages/ui
pnpm store prune
```

Optional broader sweep:
```
pnpm -w dlx knip --production
```

---

## Phase 8 — Type Safety & Linting
Run checks:
```
pnpm -F @repo/ui check
pnpm -F web check
pnpm -F @repo/admin check
```
Consolidate ESLint configuration; ensure TS configs extend `@repo/typescript-config` where possible.

---

## Phase 9 — Build & Verification
```
pnpm -F @repo/ui build
pnpm -F web build
pnpm -F @repo/admin build
```
If you see `.svelte`/SSR transform errors, re-check `optimizeDeps.exclude` and `ssr.noExternal` and Node version.

---

## Phase 10 — Cleanup Artifacts
Candidates to trim/remove if not production-critical (ask user for approval):
- `apps/docs/` (if not part of prod)
- Performance test results under `performance-tests*/`
- Unused skeleton/demo components: `packages/ui/src/lib/skeleton/*`
- Any “experimental” or “unused” folders flagged by comments

Cache reset when needed:
```
pnpm -w dlx rimraf .turbo node_modules .pnpm-store && pnpm -w i
```

---

## Final Checklist
- [ ] No `@melt-ui/*` imports anywhere
- [ ] No direct `bits-ui` imports outside shadcn components
- [ ] All app imports use `@repo/ui/components/ui/*`
- [ ] Tailwind v4 + tokens/semantic/globals imported once per app
- [ ] `compilerOptions.runes = true` everywhere
- [ ] Apps build/preview OK on Node ≥ 20.19
- [ ] Unused dependencies removed; bundle size checked

---

## Operating Rules for Claude
- Do not delete or move files without confirming there are zero usages.
- When making repo-wide refactors, propose a small PR per component/folder to keep diff reviewable.
- Surface a list of found duplicates/unreferenced files before deleting.
- Confirm with the user before removing `apps/docs` or performance tooling.
