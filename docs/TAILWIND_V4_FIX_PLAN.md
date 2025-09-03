# Tailwind v4 — Fix Plan and Guardrails

Status: Adopted. This plan locks usage and prevents regressions.

Must-do setup per app (web/admin):
- In `src/app.css`:
  - `@import 'tailwindcss';`
  - `@import '@repo/ui/styles/tokens.css';`
  - `@import '@repo/ui/styles/semantic.css';`
  - `@theme { /* app-specific color maps to tokens */ }`
  - `@tailwind base; @tailwind components; @tailwind utilities;`
  - `@source '../../packages/ui/src/**/*.{svelte,ts,js}';` (for dev scanning)

Rules:
- Use tokens and semantic utilities; avoid raw hex/rgb/oklch in app code
- Replace `outline-hidden` with `outline-none`
- Tap targets: 44px primary actions, 36–40px standard controls
- Prefer component-layer utilities (`.btn`, `.menu`, `.dialog-*`, `.banner-*`) from `semantic.css`

Refactor tasks:
- [ ] Verify semantic.css loaded exactly once (either via app.css or barrel side-effect)
- [ ] Repo-wide replacement of invalid utilities (none expected now)
- [ ] Ensure all banners/alerts use `.banner-*` utilities or `<Banner />` from `@repo/ui`

Snippets:
```css
.btn { @apply h-[--touch-standard] rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-fg)]; }
.input { @apply h-[--touch-standard] w-full rounded-lg border border-[color:var(--gray-200)]; }
.menu { @apply z-50 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-base)] p-1 shadow-lg; }
.banner { @apply w-full rounded-lg border p-3 sm:p-4 flex gap-3 items-start; }
.banner-info { @apply bg-[color:var(--info-soft)] border-[color:var(--info)] text-[color:var(--info-text)]; }
```

Validation:
- `pnpm -w turbo run check-types && pnpm -w turbo run lint && pnpm -w turbo run test`
- Visual spot-check: header menus, dialogs, toasts, mobile forms

