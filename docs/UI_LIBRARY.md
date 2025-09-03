# UI Library — @repo/ui

Single source of truth for shared components. Prevent duplication by following these rules and workflow.

What belongs in @repo/ui:
- Presentational components, primitives (Melt wrappers), and domain overlays (e.g., BuyBox) that are shared across views/apps
- Accessibility-first, mobile-first, token-based styling (Tailwind v4 + semantic.css)

Import rules:
- Prefer named imports from `@repo/ui`
- Allowed deep imports: `@repo/ui/types`, `@repo/ui/primitives`, `@repo/ui/styles/*`
- Do not import components from `apps/web/src/lib/components/**` when an equivalent exists in `@repo/ui`

Promotion workflow (Rule of 2):
1) Move component to `packages/ui/src/lib/YourComponent.svelte`
2) Export it in `packages/ui/src/lib/index.ts`
3) Update all imports in apps to `@repo/ui`
4) Delete the app-local duplicate(s)
5) Add a short entry to `docs/CODEX_TASKLIST.md` describing the promotion

File structure:
- `src/lib/*.svelte` — Shared components (barreled in `src/lib/index.ts`)
- `src/lib/primitives/*` — Melt wrappers and system primitives
- `src/styles/{tokens,semantic}.css` — Design tokens and semantic utilities
- `src/types/*` — Reusable TS types/interfaces

Testing & validation:
- Component props/events typed strictly; no `any`
- Keyboard/focus behavior covered for interactive components
- Visual sanity via Stories or Story-like demo (optional for now)

Publishing/consuming:
- Dev apps resolve `@repo/ui` to `src/lib/index.ts`
- Styles are available via `@repo/ui/styles/{tokens,semantic}.css`

