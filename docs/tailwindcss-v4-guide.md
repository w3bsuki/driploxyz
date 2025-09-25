# Tailwind CSS v4 Field Guide

Claude, use this as the definitive reference while you clean up styling after the SvelteKit/Svelte 5 refactors. Tailwind v4 moves all configuration into CSS files-keep this doc open when you touch any `app.css` or shared token file.

## What Changed from v3
- No `tailwind.config.js`: directives live alongside your CSS via `@import`, `@plugin`, `@theme`, and `@source`.
- Design tokens are plain CSS custom properties. We import them from `@repo/ui/styles/tokens.css` and layer semantic aliases in `semantic.css`.
- The build scans files listed in `@source` (globs) instead of `content` arrays. Miss a directory and utilities disappear; include too much and you bloat CSS.
- Plugins register inside CSS with `@plugin`. They run in order, so keep `forms` before `typography` unless you have a specific override.

## Repository Layout
- `packages/ui/src/styles/tokens.css`: raw design tokens sourced from Design (colors, spacing, typography, radii).
- `packages/ui/src/styles/semantic.css`: semantic aliases (`--surface-muted`, `--text-primary`, etc.) that map tokens to product language.
- `apps/web/src/app.css`: imports Tailwind, tokens, plugins, and defines the storefront-specific `@theme` and `@layer` customisations.
- `apps/admin/src/app.css` and `apps/docs/src/app.css`: mirror the same pattern; update them when the shared tokens change.

## Working in app.css
1. **Imports at the top**
   ```css
   @import 'tailwindcss';
   @import '@repo/ui/styles/tokens.css';
   @import '@repo/ui/styles/semantic.css';
   @plugin '@tailwindcss/forms';
   @plugin '@tailwindcss/typography';
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   @source '../../packages/ui/src/**/*.{svelte,ts}';
   ```
   Adjust `@source` paths per app so the glob actually reaches your Svelte/TS files. Keep it minimal-do not point at `node_modules` or `.svelte-kit`.
2. **Extend with `@theme`** - remap tokens so Tailwind utilities resolve to semantic values (`--color-primary`, typography scale, spacing aliases). Reassign by reference, not literal hex, so a token swap updates every utility automatically.
3. **Custom layers** - wrap bespoke classes in `@layer components` or `@layer utilities`. Keep these short and point to token variables for colors, spacing, borders, etc.
4. **Structure helpers** - utilities such as `.stack`, `.cluster`, `.link` already exist. Update or add new primitives in `packages/ui` if multiple apps need them.

## Editing Workflow
- Start a slice by cleaning the checklist in `TailwindCSS.md`; add '-- Claude' after the task you are about to tackle.
- When you delete unused classes, search the repo (`pnpm exec ssgrep "class=".*your-class""`) to confirm nothing breaks.
- If you introduce a new semantic variable, add it to `semantic.css`, then expose it in app themes. Avoid inventing tokens directly in app code.
- Keep 44px hit areas by default. Hard exceptions need a comment explaining the product rationale.

## Validating Changes
- `pnpm --filter web build` - fails fast if the Tailwind pipeline misreads sources.
- `pnpm --filter web lint -- --max-warnings=0` - catches unused `@source` globs or invalid CSS directives.
- `pnpm --filter web test:e2e` - run the accessibility suite when altering navigation, buttons, or form controls.
- Optional: `pnpm performance-audit` if you touch global typography, container widths, or remove critical CSS.

## Debugging Tips
- Missing utility? Inspect the generated stylesheet during `pnpm --filter web dev` to verify the token is present. If not, the `@source` glob likely missed your file or the class name is dynamic.
- Unexpected color? Trace the custom property: find it in `semantic.css`, confirm it references a base token, and ensure you did not override it inside `@theme`.
- Plugin conflict? Temporarily comment a plugin block and rebuild. Plugins execute sequentially; the last one wins conflicting rules.

## Hand-off Checklist
- Document before/after screenshots or short Loom clips in the PR when you adjust hero, nav, or checkout styling.
- Update this guide with anything you discover (new tokens, plugin gotchas, performance notes).
- Log unresolved issues in `notes/post-lint-refactor.md` with owner + next step so Codex can queue follow-up work.

Keep this page updated-Tailwind v4 evolves quickly and we want future maintainers to stand on your shoulders, not restart from docs on tailwindcss.com.
## CODEX Tailwind CSS v4 Implementation

### Intent
- Ship a conversion-focused storefront with consistent tokens, deliberate contrast, and predictable interaction patterns.
- Preserve Melt-based accessibility primitives while layering polished visuals and marketing surfaces (banners, promotion rails, trust blocks).
- Keep admin/docs aligned by sharing the same token contract so theme swaps propagate instantly.

### Token Architecture

#### Base tokens (`packages/ui/src/styles/tokens.css`)
```css
:root {
  /* Brand core */
  --color-brand-50: #f4f6ff;
  --color-brand-100: #e4e9ff;
  --color-brand-200: #c7d0ff;
  --color-brand-300: #9faeff;
  --color-brand-400: #7189ff;
  --color-brand-500: #4164ff;
  --color-brand-600: #274de4;
  --color-brand-700: #1d3cb3;
  --color-brand-800: #152d84;
  --color-brand-900: #0d1f59;

  /* Accent highlight for promos + badges */
  --color-accent-50: #fff7ed;
  --color-accent-100: #ffedd5;
  --color-accent-200: #fed7aa;
  --color-accent-300: #fdba74;
  --color-accent-400: #fb923c;
  --color-accent-500: #f97316;
  --color-accent-600: #ea580c;

  /* State palettes */
  --color-success-100: #dcfce7;
  --color-success-500: #22c55e;
  --color-success-700: #15803d;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-700: #b45309;
  --color-danger-100: #fee2e2;
  --color-danger-500: #ef4444;
  --color-danger-700: #b91c1c;

  /* Neutral ramp */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #f7f7f8;
  --color-neutral-100: #eceef0;
  --color-neutral-200: #d9dce1;
  --color-neutral-300: #b7bcc5;
  --color-neutral-400: #939aa7;
  --color-neutral-500: #6f7787;
  --color-neutral-600: #505667;
  --color-neutral-700: #393f4f;
  --color-neutral-800: #272b38;
  --color-neutral-900: #161a24;

  /* Typography + spacing scale */
  --font-sans: 'Inter var', 'SF Pro Text', system-ui, sans-serif;
  --font-display: 'Clash Display', var(--font-sans);
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --leading-tight: 1.2;
  --leading-normal: 1.5;

  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-pill: 999px;
  --shadow-sm: 0 1px 2px rgba(22, 26, 36, 0.08);
  --shadow-lg: 0 24px 48px rgba(15, 23, 42, 0.16);
}
```

#### Semantic layer (`packages/ui/src/styles/semantic.css`)
```css
:root {
  color-scheme: light;
  --surface-base: var(--color-neutral-0);
  --surface-muted: var(--color-neutral-50);
  --surface-raised: #ffffff;
  --surface-inverse: var(--color-neutral-900);

  --border-subtle: var(--color-neutral-200);
  --border-strong: var(--color-neutral-400);

  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --text-tertiary: var(--color-neutral-500);
  --text-inverse: var(--color-neutral-0);

  --brand-primary: var(--color-brand-600);
  --brand-primary-hover: var(--color-brand-500);
  --brand-primary-active: var(--color-brand-700);
  --brand-contrast: var(--color-brand-50);

  --accent-primary: var(--color-accent-500);
  --accent-contrast: var(--color-accent-50);

  --status-success-bg: var(--color-success-100);
  --status-success-text: var(--color-success-700);
  --status-warning-bg: var(--color-warning-100);
  --status-warning-text: var(--color-warning-700);
  --status-danger-bg: var(--color-danger-100);
  --status-danger-text: var(--color-danger-700);

  --badge-new-bg: var(--color-success-100);
  --badge-new-text: var(--color-success-700);
  --badge-like-new-bg: var(--color-brand-50);
  --badge-like-new-text: var(--color-brand-700);
  --badge-good-bg: var(--color-accent-100);
  --badge-good-text: var(--color-accent-600);
  --badge-fair-bg: #f5f5f5;
  --badge-fair-text: var(--color-neutral-600);

  --input-bg: var(--surface-base);
  --input-border: var(--border-subtle);
  --input-focus-border: var(--brand-primary);
  --input-focus-ring: rgba(65, 100, 255, 0.24);

  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slower: 360ms;
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --surface-base: var(--color-neutral-900);
  --surface-muted: #1f2430;
  --surface-raised: #151a24;
  --surface-inverse: var(--color-neutral-0);

  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);

  --text-primary: var(--color-neutral-0);
  --text-secondary: rgba(255, 255, 255, 0.72);
  --text-tertiary: rgba(255, 255, 255, 0.56);

  --brand-primary: var(--color-brand-400);
  --brand-primary-hover: var(--color-brand-300);
  --brand-primary-active: var(--color-brand-500);
  --brand-contrast: rgba(255, 255, 255, 0.12);

  --badge-fair-bg: rgba(255, 255, 255, 0.08);
  --badge-fair-text: rgba(255, 255, 255, 0.72);
}
```

### Tailwind v4 theme template (`apps/web/src/app.css`)
```css
@import 'tailwindcss';
@import '@repo/ui/styles/tokens.css';
@import '@repo/ui/styles/semantic.css';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';
@tailwind base;
@tailwind components;
@tailwind utilities;

@source '../src/**/*.svelte';
@source '../src/**/*.ts';
@source '../../packages/ui/src/**/*.svelte';

@theme {
  --color-primary: var(--brand-primary);
  --color-primary-foreground: var(--text-inverse);
  --color-accent: var(--accent-primary);
  --color-accent-foreground: var(--text-primary);
  --color-muted: var(--surface-muted);
  --color-muted-foreground: var(--text-secondary);
  --color-card: var(--surface-raised);
  --color-border: var(--border-subtle);
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
  --spacing: var(--space-4);
  --radius: var(--radius-md);
}

@custom-variant hocus (&:hover, &:focus-visible);
```

### Component layer priorities
- **Primary CTA button**: 48px target desktop / 56px mobile, gradient accent for hero contexts, subtle drop shadow for visual hierarchy.
- **Secondary & tertiary buttons**: outline + ghost styles draw from neutral ramp; ensure 4.5:1 contrast.
- **Condition badges**: use pill radius, icon optional, voice-friendly labels for screen readers.
- **Marketing banners**: full-width band with layered gradient (brand 600 -> accent 400), optional pattern overlay via CSS mask; include text + CTA + supporting metric.
- **Deal cards**: use `@layer components` to provide consistent padding, price typography, hover elevation.
- **Form inputs**: align focus ring with `--input-focus-ring`, add inline help states with 12px text.

```css
@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] px-6 py-3 font-semibold text-[var(--text-base)] hocus:bg-[var(--brand-primary-hover)] hocus:shadow-[var(--shadow-sm)] transition;
    background: linear-gradient(135deg, var(--brand-primary) 0%, var(--accent-primary) 100%);
    color: var(--text-inverse);
  }

  .condition-badge {
    @apply inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-3 py-1 text-[var(--text-xs)] font-medium uppercase tracking-wide;
  }
  .condition-badge[data-condition='new'] {
    background: var(--badge-new-bg);
    color: var(--badge-new-text);
  }
  .condition-badge[data-condition='like-new'] {
    background: var(--badge-like-new-bg);
    color: var(--badge-like-new-text);
  }
  .condition-badge[data-condition='good'] {
    background: var(--badge-good-bg);
    color: var(--badge-good-text);
  }
  .condition-badge[data-condition='fair'] {
    background: var(--badge-fair-bg);
    color: var(--badge-fair-text);
  }

  .promo-banner {
    @apply relative isolate overflow-hidden rounded-[var(--radius-xl)] px-8 py-10 text-left text-[var(--text-lg)] text-[var(--text-inverse)];
    background: radial-gradient(circle at top left, rgba(65, 100, 255, 0.92), rgba(21, 45, 132, 0.95));
  }
  .promo-banner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(249, 115, 22, 0.12), transparent 58%);
    mix-blend-mode: screen;
    pointer-events: none;
  }
}
```

### Layout & interaction utilities
- `.stack-*` utilities handle vertical rhythm for product grids (gap tokens map to `--space-*`).
- `.cluster` for navigation and filter chips with wrap + gap.
- `.grid-product` preset (2 -> 4 columns with 16px -> 24px gutter) ensures consistent density.
- Introduce `.shadow-hover` utility bound to `var(--shadow-sm)` for cards; escalate to `--shadow-lg` on promoted deals.
- Add `@custom-variant aria-invalid (&[aria-invalid='true'])` for form error styling and align with Melt field store outputs.

### Accessibility & performance guardrails
- Maintain 4.5:1 contrast for text on surfaces; run Axe + Lighthouse after each token change.
- Keep focus states visible even on gradient buttons by pairing box-shadow + outline offset.
- Limit new `@layer` blocks to avoid unused CSS; rely on semantic utilities where possible.
- Capture screenshot diffs for hero, product grid, PDP, checkout to confirm visual consistency.

### Rollout plan
1. Update `tokens.css` with the new palette, typography, spacing, and radii.
2. Map semantic variables (including condition badge tokens) in `semantic.css`; sync dark theme overrides.
3. Refresh `apps/web/src/app.css` with the theme snippet, new `@source` globs, and variants.
4. Port critical components in `@repo/ui` to the new classes (`Button`, `Badge`, `Card`, `Toast`, marketing components).
5. Replace in-app hard-coded colors with semantic utilities; audit `apps/web/src/routes` for overrides.
6. Update admin/docs themes to re-use the same palette, adjusting only accent hues as needed.
7. Document component visuals in Storybook/Chromatic (if available) or capture static screenshots for QA sign-off.

### Validation matrix
- `pnpm --filter ui test` plus visual regression checks on key components.
- `pnpm --filter web lint` and `pnpm --filter web build` to ensure Tailwind emits expected classes.
- `pnpm --filter web test:e2e -- --project accessibility` after major marketing layout updates.
- `pnpm performance-audit` when changing hero/banner or typography scale.
- Track CLS + LCP via web-vitals in staging; gradients and hero imagery must not regress metrics.