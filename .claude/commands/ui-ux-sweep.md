# /ui-ux-sweep — Tailwind v4 + Svelte 5 pass

Goal: Small, high-impact UI/UX cleanup to keep bundles lean and UX consistent.

Steps
1) Tailwind v4 hygiene (apps/web)
- Ensure `@tailwindcss/vite` is present in `vite.config.ts` plugins.
- Keep CSS-first entry (e.g., `app.css`) with `@import 'tailwindcss';`.
- Remove heavy @apply patterns and overlapping utilities; prefer tokens/util classes.

2) Tokens & Accessibility
- Confirm OKLCH color tokens and 44px minimum primary touch targets.
- Audit buttons/inputs: consistent sizes (`lg` 44px, `md` 36px, `sm` 32px) as per CLAUDE.md.

3) Svelte 5 runes sweep
- Convert legacy `$:` to `$derived()` where trivial.
- Move side effects into `$effect()` with cleanup.
- Prefer `onevent` over `on:event`.

4) @repo/ui usage
- Ensure all UI imports come from `@repo/ui`; remove local duplicates.
- If a feature needs a variant, extend the component props instead of creating a new component.

5) Build & snapshot
- `pnpm -C apps/web build > ui-ux-sweep-build.txt`
- Attach notable bundle deltas and screenshots at 375px.

Acceptance
- Builds green; no TS regressions.
- No heavy @apply or duplicate UI components reintroduced.

