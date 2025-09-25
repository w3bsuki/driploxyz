# TailwindCSS v4 Refactor Playbook

> Full-stack remediation plan for Codex (architect) and Claude-Code (implementation engineer) to complete the Tailwind v4 migration, remove hardcoded styling, and stabilise the design system across every app in the monorepo.

---

## Purpose & Success Criteria
- Align all apps (web, admin, docs) on a single set of Tailwind v4 tokens served from @repo/ui.
- Remove hardcoded hex or rgba values and bespoke CSS in favour of semantic utilities and component tokens.
- Guarantee dark and light themes, motion preferences, and safe-areas share the same token surface.
- Produce reviewable slices for Claude with clear owners, validation steps, and rollback notes.

Success looks like: each CSS entry point imports the same token sources, component styles consume semantic variables, and Turbo quality gates pass with no Tailwind warnings or unused layer noise.

---

## Audit Snapshot (Feb 2025)
- **Hardcoded styling debt**
  - apps/web/src/lib/components/OptimizedImage.svelte:251 and apps/web/src/lib/components/VirtualProductGrid.svelte:276 ship raw hex colors for loaders, outlines, and badges.
  - packages/ui/src/lib/components/forms/DynamicContentErrorBoundary.svelte:182 and related UI primitives repeat palette literals (#3b82f6, #f3f4f6, #6b7280) instead of semantic tokens.
  - apps/web/src/app.html:43 pins PWA theme colors to #3b82f6 instead of reading the active brand token.
- **Token drift and duplication**
  - packages/ui/src/styles/tokens.css mixes foundational, semantic, component, and alias tokens in a single @theme block while packages/ui/src/styles/theme.css defines a divergent palette that is not imported by any app.
  - App-level @theme blocks (apps/admin/src/app.css, apps/docs/src/app.css, apps/web/src/app.css) reintroduce raw OKLCH values instead of aliasing shared tokens.
  - packages/ui/src/styles/base.css still references legacy alias names (--color-white, --interactive-primary) that drift from the newer semantic naming in tokens.css.
- **Tailwind config hygiene**
  - @source globs miss coverage for docs and admin specific directories (for example markdown content and server-only helpers) and need alignment with ProjectStructure.md.
  - @plugin usage is consistent, but we have duplicate imports of tailwindcss inside packages/ui/src/styles/globals.css and entry CSS, causing redundant generator passes.
- **Documentation gaps**
  - TailwindCSSv4.md and tailwindcssv4-checklist.md do not describe the outstanding component clean-up or the token unification strategy Claude must follow.

---

## Phased Taskboard
Track progress in Turbo or Linear; assign owners before Claude starts a slice. Every task ends with lint, test, and build verification.

### Phase 0 – Baseline & Instrumentation
- [ ] Confirm Node 22.12.0 via nvm use 22.12.0 and refresh dependencies with pnpm install.
- [ ] Capture current CSS bundle sizes (pnpm --filter web build && du -h apps/web/.svelte-kit/output/client/_app/immutable/assets/*.css).
- [ ] Snapshot token usage by running pnpm --filter web lint -- --rule "@tailwindcss/no-custom-colors:error" after the custom rule lands.

### Phase 1 – Token Architecture Rewrite
- [ ] Split packages/ui/src/styles/tokens.css into foundations.css (raw values), semantic.css (purpose tokens), and components.css (component maps). Re-export them through @repo/ui/styles/index.css.
- [ ] Delete or fold packages/ui/src/styles/theme.css into the new structure; ensure there is a single @theme declaration supplying Tailwind.
- [ ] Normalise naming: prefer --color-*, --surface-*, --text-*, --border-*, --radius-*, --shadow-*; drop legacy aliases like --primary once callsites migrate.
- [ ] Add OKLCH plus HEX fallbacks (where needed) via @supports (color: oklch(1 0 0)) to keep Safari 16 and 17 stable.

### Phase 2 – CSS Entry Point Alignment
- [ ] Replace raw OKLCH assignments in each app @theme block with references to the shared tokens (for example --color-primary: var(--brand-primary)).
- [ ] Reduce apps/*/src/app.css to: import shared styles, register plugins, declare app-only semantic overrides, and @source globs that match src/lib, src/routes, and any virtual modules.
- [ ] Add @source coverage for markdown or vite virtual files used by docs (apps/docs/src/routes/**/*.{svelte,md,svx}) and admin utilities.
- [ ] Ensure @repo/ui bundles export a styles.css entry pre-importing tokens and semantics so consuming apps can simply @import @repo/ui/styles.css once.

### Phase 3 – Component Layer Cleanup
- [ ] Replace inline <style> blocks in apps/web components with Tailwind utility classes or CSS variables bound via class:style, keeping only animation keyframes when necessary.
  - Prioritise: OptimizedImage.svelte, VirtualProductGrid.svelte, Toast.svelte, PaymentErrorBoundary.svelte.
- [ ] Convert UI package component styles to semantic variables. For example, map #3b82f6 to var(--brand-accent) in DynamicContentErrorBoundary.svelte and PaymentForm.svelte.
- [ ] Audit skeleton loaders and badge components for hardcoded box-shadow and rgba usage; migrate to tokens (for example --shadow-sm, --state-focus).
- [ ] Move shared keyframes (spin, fade, shimmer) into packages/ui/src/styles/animations.css and consume via Tailwind animation utilities.

### Phase 4 – Theming, Dark Mode, Motion
- [ ] Ensure data-theme="dark" overrides in tokens.css stay in sync with semantic names after the rename.
- [ ] Add @custom-variant theme-dark and theme-light definitions in one place (utilities.css) and use them in components instead of manual [data-theme="dark"] selectors.
- [ ] Centralise prefers-reduced-motion handling using a utility class or variant to avoid duplicating keyframe overrides.
- [ ] Update apps/web/src/app.html theme-color meta tags to read from a script that mirrors the active CSS variable (use getComputedStyle(document.documentElement).getPropertyValue('--brand-primary')).

### Phase 5 – QA, Budgets, Observability
- [ ] Run Turbo quality gates: pnpm -w turbo run lint check-types test build.
- [ ] Execute pnpm --filter web test:e2e for Playwright accessibility smoke coverage.
- [ ] Capture Lighthouse and performance metrics via pnpm performance-audit and compare against the baseline from Phase 0.
- [ ] Update Tailwind docs (TailwindCSSv4.md, tailwindcssv4-checklist.md) with the new structure and mark tasks complete only after Codex review.

### Endgame Cleanup Checklist
- [ ] Search for residual '#[0-9a-fA-F]{3,6}' literals in apps/** and packages/ui/**; replace or justify.
- [ ] Remove unused CSS files (packages/ui/src/styles/theme.css, redundant safe-area utilities) after verifying no importers remain.
- [ ] Delete per-component CSS variables that duplicate semantic tokens.
- [ ] Close the tracking branch tailwind-v4-perfect-refactor once main passes CI.

---

## Token & Design System Blueprint

### 1. Foundations (foundations.css)
- Keep only immutable design primitives:
  - spacing scale (--space-* and --size-*), typography (--font-* and --text-*), radii, z-index, animation timing.
  - Expand color palette using OKLCH values grouped by families (gray, sky, green, etc.) and provide SRGB fallbacks for legacy browsers.
- Export via a single @theme block. Avoid semantic naming here.

### 2. Semantics (semantic.css)
- Map components to purpose-driven tokens: --surface-*, --text-*, --border-*, --state-*, --status-*.
- Introduce light and dark overrides with attribute selectors only in this layer.
- Document each semantic value with the product rationale (tie into UI-UX.md and NAVIGATION_UX_STRATEGY.md).

### 3. Component Tokens (components.css)
- Define tokens consumed by component packages (--btn-*, --card-*, --modal-*).
- Avoid embedding colors directly; reference semantic tokens (for example --btn-primary-bg: var(--surface-brand-strong)).
- Provide slot-specific tokens for complex widgets (carousels, toasts) to prevent ad-hoc overrides in app code.

### 4. Alias Layer (alias.css)
- Keep only temporary bridges (for example --primary, --info) while migrating legacy components. Tag each alias with an owner and removal sprint.

### 5. Distribution
- Publish a consolidated stylesheet (packages/ui/styles.css) importing foundations, semantic, components, utilities, animations.
- Update @repo/ui package exports to surface helper TypeScript types (TokenName, SemanticToken) for compile-time checks inside Svelte stores.
- Add lint rules (Stylelint or custom ESLint plugin) to flag imports that bypass the shared CSS entry.

---

## Tailwind CSS v4 Implementation Standards
- **Configuration in CSS**: Only one @import 'tailwindcss' per app. Everything else (@theme, @plugin, @custom-variant, @utility) lives in CSS modules.
- **Content Scanning**: Maintain exhaustive @source globs per workspace. Include .svelte, .ts, .tsx, .md, +page.server.ts, and any generated virtual modules.
- **Utility Authoring**: Prefer @utility for repeated patterns (safe areas, line clamp). Keep naming terse and purposeful.
- **Variants**: Declare shared variants once in utilities.css; use them consistently (for example theme-dark:bg-[color:var(--surface-base-dark)]). 
- **Animations**: Register keyframes via @theme to leverage Tailwind animate-* utilities instead of custom classes.
- **Performance**: Lean on Tailwind's Oxide engine; avoid global selectors outside @layer base, components, utilities. Monitor pnpm --filter web build for unused layer warnings.
- **Design Tokens in Markup**: When a raw CSS value is unavoidable (for example inline SVG fill), read from CSS custom properties using style attributes (fill: var(--brand-primary)) rather than hardcoding hex.
- **Dark Mode & Accessibility**: Use semantic tokens for contrast changes; test with high-contrast simulation. Respect prefers-reduced-motion by wrapping animations in the reduce-motion variant.

---

## Hardcoded Styling Remediation Targets
Focus first on high-traffic components, then sweep the rest with a codemod.

| Area | Priority Components | Cleanup Notes |
| --- | --- | --- |
| Storefront (apps/web) | OptimizedImage.svelte, VirtualProductGrid.svelte, PaymentErrorBoundary.svelte, Toast.svelte | Replace loaders, outlines, and shadows with Tailwind classes referencing tokens. Move animations to shared utilities. |
| Shared UI (packages/ui) | DynamicContentErrorBoundary.svelte, PaymentForm.svelte, CategoryPill.svelte, ProductSeller.svelte, PartnerShowcase.svelte, VirtualProductGrid.svelte | Convert inline styles to use semantic tokens; ensure print styles reference --border-default. |
| Notifications & Toasts | packages/ui/src/lib/primitives/toast/*.svelte, UnifiedCookieConsent.svelte | Leverage @custom-variant theme-dark and safe-area utilities; replace rgba with token-based color-mix. |
| Skeletons | packages/ui/src/lib/components/skeleton/*.svelte | Use existing --surface-muted, --animation-shimmer tokens; swap bespoke gradients for Tailwind gradient utilities. |
| Metadata & Icons | apps/web/src/app.html, packages/ui/src/lib/components/utilities/SEOMetaTags.svelte | Drive meta theme colors from runtime tokens; ensure icons use CSS variables for fills. |

After each component refactor, diff with Percy or Chromatic (if available) and run Playwright smoke tests to ensure no regressions in focus states or loading indicators.

---

## Cross-App Implementation Notes
- **Web Storefront (apps/web)**
  - Integrate shared @repo/ui/styles.css; limit bespoke CSS to route-specific needs.
  - Move locale-specific typography overrides into language-aware CSS modules that still reference shared tokens.
- **Admin Console (apps/admin)**
  - Swap raw OKLCH values in the @theme block for alias tokens (for example --color-primary: var(--brand-primary-strong)).
  - Audit dashboard widgets for bespoke CSS (especially data visualisations) and migrate to utilities.
- **Documentation Site (apps/docs)**
  - Extend Tailwind to scan .md and .svx content. Ensure prose styles use semantic tokens for background, code blocks, and callouts.
  - Provide a doc-only theme extension using @layer components but limit overrides to typography and callout components.

---

## QA & Validation Checklist
1. pnpm -w turbo run lint – ensure ESLint and Stylelint (once added) pass.
2. pnpm -w turbo run check-types – confirm TypeScript safety after token API changes.
3. pnpm --filter web test and pnpm --filter web test:e2e – maintain unit, component, and Playwright coverage.
4. pnpm --filter web build – watch for Tailwind unused-layer warnings and confirm bundle size budget (less than 50 KB minified CSS).
5. pnpm performance-audit – capture Lighthouse metrics; compare CLS and FID to baseline.
6. Manual QA: toggle dark mode, reduced motion, and safe-area devices; verify consistent theming.

Archive all command outputs in build-validation.txt, lint-validation.txt, and update types-validation.txt as per Turbo.md.

---

## Claude Execution Guide
1. **Planning**: Before touching code, Claude reviews this playbook, updates the CLAUDE.md workflow checklist, and proposes a slice plan to Codex.
2. **Token Rewrite**: Start with packages/ui/styles. Create new CSS modules (foundations.css, semantic.css, components.css, alias.css, animations.css). Update import paths in apps/*/src/app.css and relevant TypeScript helpers.
3. **Component Sweeps**: Tackle components in small batches (maximum three files) to keep diffs reviewable. Replace inline styles with Tailwind classes using shared tokens. Confirm no Svelte 5 rune regressions.
4. **Testing**: After each batch, run lint and check-types. Before merging a phase, execute full Turbo tasks and Playwright smokes.
5. **Documentation**: Update TailwindCSSv4.md, tailwindcssv4-checklist.md, and any affected subsystem docs (Svelte5.md, UI-UX.md). Describe new tokens and migration notes.
6. **Review Loop**: Hand results to Codex for review. Address feedback, rerun tests, and only then mark checkboxes complete.
7. **Post-Merge**: Monitor analytics and error budgets. If regressions appear, roll back via Git tags noted during Phase 0 baseline capture.

---

## References & Further Reading
- TailwindCSSv4.md – existing high-level migration notes.
- UI-UX.md and NAVIGATION_UX_STRATEGY.md – design intent for tokens and theme states.
- Svelte5.md, SvelteKit2.md – component and data ownership rules to follow during refactors.
- Tailwind CSS v4 release notes and Oxide documentation for advanced configuration tips.

