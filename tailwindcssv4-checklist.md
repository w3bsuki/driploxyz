# Tailwind CSS v4 Hybrid Execution Checklist (CODEX Plan)

Blends Gemini's shippable structure, Codex's OKLCH token system, and Claude's UX/accessibility safeguards. Assign owners before starting each slice; do not tick boxes until code is merged and validated.

## Phase 0 – Alignment & Safety Nets
- [ ] Confirm Tailwind v4 is active in each app (`@import 'tailwindcss'` present, `tailwind.config.js` removed).
- [ ] Capture baseline metrics (Lighthouse, Web Vitals, bundle size) before any CSS changes.
- [ ] Stand up automated visual regression (Chromatic, Percy, or Playwright screenshots) targeting hero, PLP, PDP, checkout.
- [ ] Add the no-FOUC inline script Claude flagged (set `data-theme` before render, preload critical CSS, hydrate class attribute).
- [ ] Inventory current `@apply` usage and classify each instance (keep, extract to semantic class, move into component stylesheet) with owners.
- [ ] Snapshot key pages manually for additional qualitative comparison after the refactor.

## Phase 1 – Token Source of Truth (Codex Palette)
- [ ] Update `packages/ui/src/styles/tokens.css` with the OKLCH palette plus typography/spacing scales and motion tokens.
- [ ] Refresh `packages/ui/src/styles/semantic.css` to map storefront semantics (surfaces, text, badges, states) including dark mode overrides and motion defaults (`prefers-reduced-motion`).
- [ ] Document token fallbacks for legacy code and add deprecation notes in affected files.
- [ ] Regenerate consuming theme files (`apps/*/src/app.css`) to import only the revised tokens and semantic layers.

## Phase 2 – Gemini Structure in app.css
- [ ] Replace per-app `app.css` directives with the lean Gemini block (imports, plugins, `@theme`, tight `@source` globs).
- [ ] Add Codex custom variants (`hocus`, `aria-invalid`, `data-open`, etc.) where they improve ergonomics.
- [ ] Ensure plugin order matches Claude's audit (`@tailwindcss/forms` before `@tailwindcss/typography`) and strip unused plugins.
- [ ] Enable Tailwind's Oxide engine/Lightning CSS integration to optimize `@import` handling and build speed.

## Phase 3 – Component & Utility Refactor
- [ ] Port Codex component layer patterns (`.btn-primary`, condition badges, promo banners) into `@layer components` using tokens—not raw `@apply`.
- [ ] Rebuild product cards, navigation, and form controls to consume the new semantic classes; eliminate remaining `@apply` chains.
- [ ] Implement Gemini layout primitives (stack, grid, container, cluster) with tokenized gaps and responsive rules.
- [ ] Standardize touch targets (>= 44px) and focus states; verify via keyboard walkthroughs and screen reader smoke tests.
- [ ] Define animation utilities sourced from motion tokens with `prefers-reduced-motion` fallbacks baked in.

## Phase 4 – Progressive Enhancements & Performance
- [ ] Integrate container queries or viewport units; provide progressive enhancement fallbacks for browsers without `@container` or `:has()` support.
- [ ] Audit gradients/OKLCH usage for contrast and performance; ensure color stops reference tokens and have dark-mode equivalents.
- [ ] Install Claude's hydration safeguards in the Svelte layout root (no-FOUC script, class swap) if not already present.
- [ ] Validate Oxide engine output for dead-code stripping and CSS nesting compatibility.

## Phase 5 – Testing, Baselines, and Rollback Readiness
- [ ] Run `pnpm --filter web build`, `pnpm --filter web lint`, and `pnpm --filter web check-types` to confirm the pipeline passes.
- [ ] Execute `pnpm --filter web test:e2e -- --project accessibility` plus Axe scans on hero/product flows.
- [ ] Re-run Lighthouse and Web Vitals to compare against Phase 0 baselines; document deltas.
- [ ] Review automated visual regression diffs and resolve or approve changes.
- [ ] Prepare a rollback plan (git tag, feature flag, or environment toggle) with clear instructions if production metrics regress.

## Phase 6 – Rollout, Versioning, and Documentation
- [ ] Publish migration notes, token tables, and component snapshots back into `TailwindCSSv4.md` (trimmed to essentials) and `docs/tailwindcss-v4-guide.md`.
- [ ] Version tokens/components in `@repo/ui` (semver bump or changelog entry) and communicate breaking changes to app teams.
- [ ] Update admin/docs apps to consume the shared tokens; track any intentional divergences explicitly.
- [ ] Hand off a maintenance checklist (adding tokens, running audits, refreshing baselines) so future updates stay controlled.

## Dependencies & Follow-ups
- [ ] Finish outstanding Svelte 5 compliance tasks (auth popup store fix, rune audit) before landing large styling diffs.
- [ ] Regenerate Supabase types per `MIGRATION_APPLIED.md` so type guards stay accurate during refactors.
- [ ] Kick off the Paraglide localisation checklist to avoid regressing locale-specific styling.
- [ ] Align the animation/motion token strategy with Product and Accessibility sign-off before final rollout.
