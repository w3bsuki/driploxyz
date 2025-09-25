# Tailwind CSS v4 Migration Checklist (Lean)

Fast-path checklist for upgrading each app to Tailwind v4 while keeping the zero-config philosophy intact. Assign owners per item; do not tick until merged.

- [x] Import `@import 'tailwindcss';` at the top of every entry CSS file (e.g. `apps/*/src/app.css`).
- [x] Define a minimal `@theme { � }` block (6�8 tokens max: primary/accent colors, surface, font family, touch spacing).
- [x] Delete legacy config files (`tailwind.config.js`, `postcss.config.js`, old plugin wiring) unless other tooling requires them.
- [x] Remove `@apply` usage; replace with utilities or component classes that compose Tailwind tokens.
- [x] Confirm Lightning CSS/Oxide is active by checking the build output (should log `oxide` during `pnpm --filter web build`).
- [x] Add responsive breakpoints + `env(safe-area-inset-*)` padding where needed for mobile notch devices.
- [x] Enable SvelteKit view transitions or `document.startViewTransition?.()` hook in `+layout.svelte` for smoother navigation.
- [x] Ensure primary CTAs meet the 44px touch target (use tokens from the theme block).
- [x] Include the lightweight no-FOUC script in the root layout to lock theme/dark mode before hydration.
- [x] Run `pnpm --filter web build`, `pnpm --filter web lint`, and smoke tests to confirm the upgrade.
- [ ] Verify CSS bundle size stays under 50KB on staging after minification.
- [ ] Deploy/ship and monitor once for regressions.
