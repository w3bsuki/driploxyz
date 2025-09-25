# Tailwind CSS v4 Complete Design System & Implementation Guide

*Ultimate reference for building scalable, performant interfaces with Tailwind CSS v4, SvelteKit 2, and modern web standards. Project-specific implementation guide for the Driplo platform.*

---

## Project Implementation Status & Goals

Reference this when tightening the design system across apps. Add owners to each checkbox before Claude executes a slice and wait for Codex to sign off before ticking items.

### Core Project Goals
- ✅ Tailwind v4 builds pull every utility from semantic tokens in `@repo/ui/styles` (no ad-hoc hex values in app code)
- ✅ CSS entry points (`apps/*/src/app.css`) import Tailwind once, register only required plugins, and scope `@source` to real component paths
- ✅ App-specific themes extend the shared tokens via `@theme` and `@layer` without duplicating base variables
- 🔄 Builds finish with zero unused-layer warnings and Lighthouse keeps render-blocking CSS under control

### Current Architecture Status
- ✅ Tailwind v4 configured inside CSS with `@import 'tailwindcss'`, `@plugin`, `@source`, and `@theme`
- ✅ Shared tokens from `packages/ui/src/styles/tokens.css` and semantic aliases from `semantic.css`
- ✅ Plugins enabled: `@tailwindcss/forms` for inputs and `@tailwindcss/typography` for content surfaces
- ✅ Content scanning via `@source` globs covering `packages/ui/src/**/*` and app routes/components

### Outstanding Implementation Tasks
- [ ] Inventory each app's `app.css` and delete legacy directives, duplicated tokens, or unused utilities
- [ ] Verify `@source` globs cover real Svelte/TS files (routes in `src/routes/**`, libs in `src/lib/**`, shared UI packages)
- [ ] Ensure every semantic color/spacing/font referenced in components maps back to a token in `packages/ui`
- [ ] Validate custom `@layer components` additions follow 44px touch targets and match UI-UX.md guidance
- [ ] Replace any `@apply` usage that duplicates semantic classes with component-level styles or utilities
- [ ] Address accessibility warnings in UI components (BottomNav tablist role, PartnerShowcase interactions)
- [ ] Clean up unused selectors in HeaderLogo.svelte (.emoji-track span) and PartnerShowcase.svelte (.group button)
- [ ] Implement proper interactive element patterns for carousel navigation components

### Project Validation Commands
```bash
# Ensure Tailwind compiles and dead code elimination succeeds
pnpm --filter web build

# Confirm PostCSS and CSS modules lint cleanly
pnpm --filter web lint -- --max-warnings=0

# Accessibility sweeps with Axe after styling changes
pnpm --filter web test:e2e

# Performance audit when altering global styles
pnpm performance-audit
```

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Design Token System](#design-token-system)
3. [Component Patterns](#component-patterns)
4. [Layout Systems](#layout-systems)
5. [Advanced Features](#advanced-features)
6. [Performance Optimization](#performance-optimization)
7. [Accessibility Standards](#accessibility-standards)
8. [Dark Mode Implementation](#dark-mode-implementation)
9. [SvelteKit Integration](#sveltekit-integration)
10. [Migration Guide](#migration-guide)
11. [Testing Strategies](#testing-strategies)
12. [Implementation Checklist](#implementation-checklist)
13. [Reference](#reference)

---

## Project Architecture

### What's New in Tailwind CSS v4

- **CSS-First Configuration**: No more `tailwind.config.js` - everything in CSS using `@theme`
- **Native CSS Variables**: All design tokens available at runtime via CSS custom properties
- **10x Faster Builds**: Rust-powered Oxide engine with Lightning CSS integration
- **Container Queries**: Built-in responsive containers (no plugin required)
- **3D Transforms**: Native perspective and 3D rotation utilities
- **OKLCH Colors**: Perceptually uniform color space for better gradients

### Driplo Project Implementation

Your project already implements the v4 architecture correctly:

```css
/* apps/web/src/app.css - Current Implementation */
@import 'tailwindcss';
@import '@repo/ui/styles/tokens.css';
@import '@repo/ui/styles/semantic.css';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

@source '../../../packages/ui/src/**/*.{html,js,svelte,ts}';
@source './lib/**/*.{svelte,ts}';
@source './routes/**/*.{svelte,ts}';
```

### Implementation Notes
- Tailwind v4 no longer uses `tailwind.config.js`; keep overrides directly in CSS or promote shared utilities into `@repo/ui`
- Use `@theme` for token remaps (e.g. `--color-primary`) and `@custom-variant` for new stateful selectors
- When app-specific tokens diverge from product tokens, capture rationale and tag Design for sign-off
- Keep feature flag CSS behind comments documenting the toggle name and removal plan

---

## Core Architecture

### CSS-First Configuration

Tailwind v4 moves all configuration into CSS using the `@theme` directive:

```css
@import 'tailwindcss';

@theme {
  /* Design tokens become CSS variables automatically */
  --color-primary: oklch(0.15 0.015 270);
  --spacing-gutter: 1rem;
  --font-brand: 'Inter', sans-serif;
}
```

### Design Token Hierarchy

```
@theme
├── Core Tokens (raw values)
│   ├── --space-* (spacing scale)
│   ├── --color-* (color palette)
│   ├── --font-* (typography)
│   └── --radius-* (border radius)
├── Semantic Tokens (purpose-driven)
│   ├── --surface-* (backgrounds)
│   ├── --text-* (foreground colors)
│   └── --border-* (border colors)
└── Component Tokens (specific patterns)
    ├── --btn-* (button variations)
    ├── --input-* (form elements)
    └── --card-* (container styles)
```

### Build Pipeline

1. **Content Detection**: Automatic scanning via `@source` directive
2. **CSS Generation**: On-demand utility creation
3. **Optimization**: Dead code elimination and minification
4. **Output**: Single optimized CSS file with embedded custom properties

---

## Installation & Setup

### Fresh SvelteKit Project

```bash
npm create svelte@latest my-app
cd my-app
npm install

# Install Tailwind CSS v4
npm install tailwindcss@next
npm install @tailwindcss/vite
```

### Vite Configuration

```js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [
    sveltekit(),
    tailwindcss()
  ]
};
```

### CSS Entry Point

```css
/* src/app.css */
@import 'tailwindcss';

@source './lib/**/*.{html,svelte,js,ts}';
@source './routes/**/*.{html,svelte,js,ts}';

@theme {
  /* Your design tokens */
}
```

### SvelteKit App Integration

```html
<!-- src/app.html -->
<!DOCTYPE html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body>
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

---

## Design Token System

### Complete Spacing Scale

```css
@theme {
  /* Base 4px grid system */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 2px;   /* 0.125rem */
  --space-1: 4px;     /* 0.25rem */
  --space-1-5: 6px;   /* 0.375rem */
  --space-2: 8px;     /* 0.5rem */
  --space-2-5: 10px;  /* 0.625rem */
  --space-3: 12px;    /* 0.75rem */
  --space-3-5: 14px;  /* 0.875rem */
  --space-4: 16px;    /* 1rem */
  --space-5: 20px;    /* 1.25rem */
  --space-6: 24px;    /* 1.5rem */
  --space-7: 28px;    /* 1.75rem */
  --space-8: 32px;    /* 2rem */
  --space-9: 36px;    /* 2.25rem */
  --space-10: 40px;   /* 2.5rem */
  --space-11: 44px;   /* 2.75rem - Touch target */
  --space-12: 48px;   /* 3rem */
  --space-14: 56px;   /* 3.5rem */
  --space-16: 64px;   /* 4rem */
  --space-20: 80px;   /* 5rem */
  --space-24: 96px;   /* 6rem */
  --space-28: 112px;  /* 7rem */
  --space-32: 128px;  /* 8rem */
  --space-36: 144px;  /* 9rem */
  --space-40: 160px;  /* 10rem */
  --space-44: 176px;  /* 11rem */
  --space-48: 192px;  /* 12rem */
  --space-52: 208px;  /* 13rem */
  --space-56: 224px;  /* 14rem */
  --space-60: 240px;  /* 15rem */
  --space-64: 256px;  /* 16rem */
  --space-72: 288px;  /* 18rem */
  --space-80: 320px;  /* 20rem */
  --space-96: 384px;  /* 24rem */
}
```

### Typography System

```css
@theme {
  /* Font Families */
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Georgia', 'Times New Roman', serif;
  --font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  --font-display: 'Inter Display', var(--font-sans);

  /* Fluid Typography Scale */
  --text-xs: 0.75rem;    /* 12px - Static for UI */
  --text-sm: 0.875rem;   /* 14px - Static for UI */
  --text-base: 1rem;     /* 16px - Static baseline */
  --text-lg: clamp(1.125rem, 1.05rem + 0.6vw, 1.25rem);   /* 18-20px */
  --text-xl: clamp(1.25rem, 1.1rem + 1.1vw, 1.5rem);      /* 20-24px */
  --text-2xl: clamp(1.5rem, 1.2rem + 2.0vw, 1.875rem);    /* 24-30px */
  --text-3xl: clamp(1.875rem, 1.4rem + 2.5vw, 2.25rem);   /* 30-36px */
  --text-4xl: clamp(2.25rem, 1.6rem + 3.5vw, 3rem);       /* 36-48px */
  --text-5xl: clamp(3rem, 2rem + 5vw, 4rem);               /* 48-64px */
  --text-6xl: clamp(4rem, 2.5rem + 7vw, 5rem);             /* 64-80px */
  --text-7xl: clamp(5rem, 3rem + 10vw, 6.5rem);            /* 80-104px */
  --text-8xl: clamp(6.5rem, 4rem + 12vw, 8rem);            /* 104-128px */
  --text-9xl: clamp(8rem, 5rem + 15vw, 10rem);             /* 128-160px */

  /* Font Weights */
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### Complete Color System (OKLCH)

```css
@theme {
  /* Neutral Grays - Warm undertone */
  --gray-0: oklch(1 0 0);              /* Pure white */
  --gray-50: oklch(0.98 0.005 270);
  --gray-100: oklch(0.96 0.005 270);
  --gray-200: oklch(0.95 0.005 270);
  --gray-300: oklch(0.87 0.01 270);
  --gray-400: oklch(0.75 0.015 270);
  --gray-500: oklch(0.62 0.02 270);
  --gray-600: oklch(0.5 0.025 270);
  --gray-700: oklch(0.38 0.025 270);
  --gray-800: oklch(0.26 0.02 270);
  --gray-900: oklch(0.15 0.015 270);
  --gray-950: oklch(0.05 0 0);         /* Near black */

  /* Blue Palette */
  --blue-50: oklch(0.97 0.02 240);
  --blue-100: oklch(0.94 0.04 240);
  --blue-200: oklch(0.88 0.06 240);
  --blue-300: oklch(0.78 0.08 240);
  --blue-400: oklch(0.68 0.11 240);
  --blue-500: oklch(0.58 0.14 240);
  --blue-600: oklch(0.48 0.16 240);
  --blue-700: oklch(0.38 0.15 240);
  --blue-800: oklch(0.28 0.12 240);
  --blue-900: oklch(0.18 0.08 240);
  --blue-950: oklch(0.12 0.05 240);

  /* Red Palette */
  --red-50: oklch(0.97 0.02 0);
  --red-100: oklch(0.94 0.04 0);
  --red-200: oklch(0.88 0.06 0);
  --red-300: oklch(0.78 0.08 0);
  --red-400: oklch(0.68 0.11 0);
  --red-500: oklch(0.58 0.14 0);
  --red-600: oklch(0.48 0.16 0);
  --red-700: oklch(0.38 0.15 0);
  --red-800: oklch(0.28 0.12 0);
  --red-900: oklch(0.18 0.08 0);
  --red-950: oklch(0.12 0.05 0);

  /* Green Palette */
  --green-50: oklch(0.97 0.02 145);
  --green-100: oklch(0.94 0.04 145);
  --green-200: oklch(0.88 0.06 145);
  --green-300: oklch(0.78 0.08 145);
  --green-400: oklch(0.68 0.11 145);
  --green-500: oklch(0.58 0.14 145);
  --green-600: oklch(0.48 0.16 145);
  --green-700: oklch(0.38 0.15 145);
  --green-800: oklch(0.28 0.12 145);
  --green-900: oklch(0.18 0.08 145);
  --green-950: oklch(0.12 0.05 145);

  /* Yellow Palette */
  --yellow-50: oklch(0.97 0.02 85);
  --yellow-100: oklch(0.94 0.04 85);
  --yellow-200: oklch(0.88 0.06 85);
  --yellow-300: oklch(0.78 0.08 85);
  --yellow-400: oklch(0.68 0.11 85);
  --yellow-500: oklch(0.58 0.14 85);
  --yellow-600: oklch(0.48 0.16 85);
  --yellow-700: oklch(0.38 0.15 85);
  --yellow-800: oklch(0.28 0.12 85);
  --yellow-900: oklch(0.18 0.08 85);
  --yellow-950: oklch(0.12 0.05 85);

  /* Purple Palette */
  --purple-50: oklch(0.97 0.02 300);
  --purple-100: oklch(0.94 0.04 300);
  --purple-200: oklch(0.88 0.06 300);
  --purple-300: oklch(0.78 0.08 300);
  --purple-400: oklch(0.68 0.11 300);
  --purple-500: oklch(0.58 0.14 300);
  --purple-600: oklch(0.48 0.16 300);
  --purple-700: oklch(0.38 0.15 300);
  --purple-800: oklch(0.28 0.12 300);
  --purple-900: oklch(0.18 0.08 300);
  --purple-950: oklch(0.12 0.05 300);

  /* Orange Palette */
  --orange-50: oklch(0.97 0.02 50);
  --orange-100: oklch(0.94 0.04 50);
  --orange-200: oklch(0.88 0.08 50);
  --orange-300: oklch(0.78 0.1 50);
  --orange-400: oklch(0.68 0.12 50);
  --orange-500: oklch(0.58 0.14 50);
  --orange-600: oklch(0.48 0.16 50);
  --orange-700: oklch(0.38 0.15 50);
  --orange-800: oklch(0.28 0.12 50);
  --orange-900: oklch(0.18 0.1 50);
  --orange-950: oklch(0.12 0.07 50);

  /* Pink Palette */
  --pink-50: oklch(0.97 0.02 350);
  --pink-100: oklch(0.94 0.04 350);
  --pink-200: oklch(0.88 0.06 350);
  --pink-300: oklch(0.78 0.08 350);
  --pink-400: oklch(0.68 0.11 350);
  --pink-500: oklch(0.58 0.14 350);
  --pink-600: oklch(0.48 0.16 350);
  --pink-700: oklch(0.38 0.15 350);
  --pink-800: oklch(0.28 0.12 350);
  --pink-900: oklch(0.18 0.08 350);
  --pink-950: oklch(0.12 0.05 350);

  /* Cyan Palette */
  --cyan-50: oklch(0.97 0.02 180);
  --cyan-100: oklch(0.94 0.04 180);
  --cyan-200: oklch(0.88 0.06 180);
  --cyan-300: oklch(0.78 0.08 180);
  --cyan-400: oklch(0.68 0.11 180);
  --cyan-500: oklch(0.58 0.14 180);
  --cyan-600: oklch(0.48 0.16 180);
  --cyan-700: oklch(0.38 0.15 180);
  --cyan-800: oklch(0.28 0.12 180);
  --cyan-900: oklch(0.18 0.08 180);
  --cyan-950: oklch(0.12 0.05 180);
}
```

### Semantic Color Mapping

```css
@theme {
  /* Surface Colors */
  --surface-base: var(--gray-0);
  --surface-subtle: var(--gray-50);
  --surface-muted: var(--gray-100);
  --surface-emphasis: var(--gray-200);
  --surface-strong: var(--gray-300);
  --surface-inverse: var(--gray-900);

  /* Text Colors */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-700);
  --text-tertiary: var(--gray-600);
  --text-quaternary: var(--gray-500);
  --text-muted: var(--gray-400);
  --text-disabled: var(--gray-300);
  --text-inverse: var(--gray-0);

  /* Border Colors */
  --border-subtle: var(--gray-200);
  --border-default: var(--gray-300);
  --border-emphasis: var(--gray-400);
  --border-strong: var(--gray-500);
  --border-inverse: var(--gray-700);

  /* Interactive States */
  --interactive-default: var(--blue-500);
  --interactive-hover: var(--blue-600);
  --interactive-active: var(--blue-700);
  --interactive-disabled: var(--gray-300);

  /* Status Colors */
  --status-success: var(--green-500);
  --status-warning: var(--yellow-500);
  --status-error: var(--red-500);
  --status-info: var(--blue-500);

  /* Status Backgrounds */
  --status-success-bg: var(--green-50);
  --status-warning-bg: var(--yellow-50);
  --status-error-bg: var(--red-50);
  --status-info-bg: var(--blue-50);

  /* Status Text */
  --status-success-text: var(--green-700);
  --status-warning-text: var(--yellow-700);
  --status-error-text: var(--red-700);
  --status-info-text: var(--blue-700);
}
```

### Touch Target & Sizing System

```css
@theme {
  /* Touch Targets (Mobile First) */
  --touch-xs: 32px;      /* Compact UI elements */
  --touch-sm: 36px;      /* Small interactive elements */
  --touch-md: 40px;      /* Standard buttons */
  --touch-lg: 44px;      /* Primary touch target (Apple HIG) */
  --touch-xl: 48px;      /* Large prominent buttons */
  --touch-2xl: 56px;     /* Hero/CTA buttons */

  /* Component Heights */
  --height-input: var(--touch-lg);
  --height-button-sm: var(--touch-sm);
  --height-button: var(--touch-md);
  --height-button-lg: var(--touch-xl);
  --height-nav: 64px;
  --height-nav-mobile: 56px;
  --height-footer: 400px;
  --height-footer-mobile: 300px;

  /* Container Widths */
  --container-xs: 20rem;     /* 320px */
  --container-sm: 24rem;     /* 384px */
  --container-md: 28rem;     /* 448px */
  --container-lg: 32rem;     /* 512px */
  --container-xl: 36rem;     /* 576px */
  --container-2xl: 42rem;    /* 672px */
  --container-3xl: 48rem;    /* 768px */
  --container-4xl: 56rem;    /* 896px */
  --container-5xl: 64rem;    /* 1024px */
  --container-6xl: 72rem;    /* 1152px */
  --container-7xl: 80rem;    /* 1280px */
  --container-full: 100%;
}
```

### Border Radius Scale

```css
@theme {
  --radius-none: 0;
  --radius-xs: 2px;      /* 0.125rem */
  --radius-sm: 4px;      /* 0.25rem */
  --radius-md: 6px;      /* 0.375rem */
  --radius-lg: 8px;      /* 0.5rem */
  --radius-xl: 12px;     /* 0.75rem */
  --radius-2xl: 16px;    /* 1rem */
  --radius-3xl: 24px;    /* 1.5rem */
  --radius-full: 9999px; /* Fully rounded */

  /* Component Specific */
  --radius-button: var(--radius-md);
  --radius-input: var(--radius-md);
  --radius-card: var(--radius-lg);
  --radius-modal: var(--radius-2xl);
  --radius-badge: var(--radius-full);
}
```

### Shadow System

```css
@theme {
  /* Elevation Shadows */
  --shadow-xs: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.06);
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.07), 0 2px 4px oklch(0 0 0 / 0.06);
  --shadow-lg: 0 10px 15px oklch(0 0 0 / 0.1), 0 4px 6px oklch(0 0 0 / 0.05);
  --shadow-xl: 0 20px 25px oklch(0 0 0 / 0.1), 0 10px 10px oklch(0 0 0 / 0.04);
  --shadow-2xl: 0 25px 50px oklch(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px oklch(0 0 0 / 0.06);
  --shadow-none: none;

  /* Colored Shadows */
  --shadow-blue: 0 10px 15px oklch(0.58 0.14 240 / 0.2);
  --shadow-green: 0 10px 15px oklch(0.58 0.14 145 / 0.2);
  --shadow-red: 0 10px 15px oklch(0.58 0.14 0 / 0.2);
  --shadow-yellow: 0 10px 15px oklch(0.58 0.14 85 / 0.2);

  /* Component Shadows */
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-lg);
  --shadow-modal: var(--shadow-2xl);
  --shadow-dropdown: var(--shadow-lg);
  --shadow-nav: var(--shadow-sm);
}
```

### Animation & Transition System

```css
@theme {
  /* Duration Scale */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  /* Easing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Semantic Transitions */
  --transition-colors: color var(--duration-150) var(--ease-out),
                       background-color var(--duration-150) var(--ease-out),
                       border-color var(--duration-150) var(--ease-out);

  --transition-opacity: opacity var(--duration-150) var(--ease-out);
  --transition-shadow: box-shadow var(--duration-150) var(--ease-out);
  --transition-transform: transform var(--duration-150) var(--ease-out);

  --transition-all: all var(--duration-150) var(--ease-out);
  --transition-all-300: all var(--duration-300) var(--ease-out);

  /* Animation Delays */
  --delay-75: 75ms;
  --delay-100: 100ms;
  --delay-150: 150ms;
  --delay-200: 200ms;
  --delay-300: 300ms;
  --delay-500: 500ms;
  --delay-700: 700ms;
  --delay-1000: 1000ms;
}
```

### Z-Index Scale

```css
@theme {
  --z-0: 0;
  --z-10: 10;
  --z-20: 20;
  --z-30: 30;
  --z-40: 40;      /* Fixed headers */
  --z-50: 50;      /* Modals, dialogs */
  --z-60: 60;      /* Tooltips */
  --z-70: 70;      /* Notifications */
  --z-80: 80;      /* Loading overlays */
  --z-90: 90;      /* Dev tools */
  --z-100: 100;    /* Maximum application layer */
  --z-max: 2147483647; /* CSS max value */

  /* Semantic Z-Index */
  --z-header: var(--z-40);
  --z-modal: var(--z-50);
  --z-tooltip: var(--z-60);
  --z-toast: var(--z-70);
  --z-loading: var(--z-80);
}
```

---

## Component Patterns

### Button System

```css
/* Button Base Class */
.btn {
  @apply inline-flex items-center justify-center;
  @apply font-medium text-sm leading-tight;
  @apply border border-transparent rounded-[var(--radius-button)];
  @apply transition-all duration-150 ease-out;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply select-none touch-manipulation;

  /* Minimum touch target */
  min-height: var(--touch-md);
  padding: 0 var(--space-4);
}

/* Button Sizes */
.btn-xs {
  @apply text-xs px-2 py-1;
  min-height: var(--touch-xs);
}

.btn-sm {
  @apply text-sm px-3 py-1.5;
  min-height: var(--touch-sm);
}

.btn-md {
  @apply text-sm px-4 py-2;
  min-height: var(--touch-md);
}

.btn-lg {
  @apply text-base px-6 py-2.5;
  min-height: var(--touch-lg);
}

.btn-xl {
  @apply text-lg px-8 py-3;
  min-height: var(--touch-xl);
}

.btn-2xl {
  @apply text-xl px-10 py-4;
  min-height: var(--touch-2xl);
}

/* Button Variants */
.btn-primary {
  @apply bg-blue-500 text-white border-blue-500;
  @apply hover:bg-blue-600 hover:border-blue-600;
  @apply active:bg-blue-700 active:border-blue-700;
  @apply focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-900 border-gray-300;
  @apply hover:bg-gray-200 hover:border-gray-400;
  @apply active:bg-gray-300 active:border-gray-500;
  @apply focus:ring-gray-500;
}

.btn-success {
  @apply bg-green-500 text-white border-green-500;
  @apply hover:bg-green-600 hover:border-green-600;
  @apply active:bg-green-700 active:border-green-700;
  @apply focus:ring-green-500;
}

.btn-warning {
  @apply bg-yellow-500 text-white border-yellow-500;
  @apply hover:bg-yellow-600 hover:border-yellow-600;
  @apply active:bg-yellow-700 active:border-yellow-700;
  @apply focus:ring-yellow-500;
}

.btn-danger {
  @apply bg-red-500 text-white border-red-500;
  @apply hover:bg-red-600 hover:border-red-600;
  @apply active:bg-red-700 active:border-red-700;
  @apply focus:ring-red-500;
}

.btn-outline {
  @apply bg-transparent text-gray-700 border-gray-300;
  @apply hover:bg-gray-50 hover:border-gray-400;
  @apply active:bg-gray-100 active:border-gray-500;
  @apply focus:ring-gray-500;
}

.btn-ghost {
  @apply bg-transparent text-gray-700 border-transparent;
  @apply hover:bg-gray-100;
  @apply active:bg-gray-200;
  @apply focus:ring-gray-500;
}

.btn-link {
  @apply bg-transparent text-blue-600 border-transparent underline;
  @apply hover:text-blue-700;
  @apply active:text-blue-800;
  @apply focus:ring-blue-500;
}
```

#### Button Usage Examples (Svelte)

```html
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'link';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: () => void;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    children
  }: Props = $props();

  const buttonClass = $derived(`btn btn-${variant} btn-${size}`);
</script>

<button
  class={buttonClass}
  {type}
  {disabled}
  onclick={onclick}
  aria-busy={loading}
>
  {#if loading}
    <svg class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
    Loading...
  {:else}
    {@render children?.()}
  {/if}
</button>

<!-- Usage Examples -->
<Button variant="primary" size="lg" onclick={() => console.log('Clicked')}>
  Primary Action
</Button>

<Button variant="secondary" loading>
  Processing...
</Button>

<Button variant="outline" disabled>
  Disabled Button
</Button>
```

### Input System

```css
/* Input Base Class */
.input {
  @apply w-full px-3 py-2;
  @apply text-base leading-normal;
  @apply bg-white border border-gray-300 rounded-[var(--radius-input)];
  @apply transition-colors duration-150 ease-out;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100;
  @apply placeholder:text-gray-400;

  min-height: var(--touch-lg);
  font-size: 16px; /* Prevent iOS zoom */
}

/* Input Sizes */
.input-xs {
  @apply text-xs px-2 py-1;
  min-height: var(--touch-xs);
}

.input-sm {
  @apply text-sm px-2.5 py-1.5;
  min-height: var(--touch-sm);
}

.input-md {
  @apply text-base px-3 py-2;
  min-height: var(--touch-md);
}

.input-lg {
  @apply text-lg px-4 py-3;
  min-height: var(--touch-xl);
}

.input-xl {
  @apply text-xl px-5 py-4;
  min-height: var(--touch-2xl);
}

/* Input States */
.input-error {
  @apply border-red-300 focus:ring-red-500 focus:border-red-500;
}

.input-success {
  @apply border-green-300 focus:ring-green-500 focus:border-green-500;
}

.input-warning {
  @apply border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500;
}

/* Input Variants */
.input-borderless {
  @apply border-transparent bg-gray-100 focus:bg-white focus:ring-1;
}

.input-underline {
  @apply border-0 border-b-2 border-gray-300 rounded-none bg-transparent;
  @apply focus:ring-0 focus:border-blue-500;
}
```

#### Input Component (Svelte)

```html
<script lang="ts">
  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    value?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    success?: string;
    warning?: string;
    disabled?: boolean;
    required?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'borderless' | 'underline';
    id?: string;
    name?: string;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder,
    label,
    error,
    success,
    warning,
    disabled = false,
    required = false,
    size = 'md',
    variant = 'default',
    id,
    name
  }: Props = $props();

  const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`;

  const inputClass = $derived(() => {
    const baseClass = `input input-${size}`;
    const variantClass = variant !== 'default' ? `input-${variant}` : '';
    const stateClass = error ? 'input-error' :
                      success ? 'input-success' :
                      warning ? 'input-warning' : '';
    return `${baseClass} ${variantClass} ${stateClass}`.trim();
  });

  const messageClass = $derived(() => {
    if (error) return 'text-red-600';
    if (success) return 'text-green-600';
    if (warning) return 'text-yellow-600';
    return 'text-gray-600';
  });
</script>

<div class="space-y-1">
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <input
    {type}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {name}
    id={inputId}
    class={inputClass}
    aria-invalid={!!error}
    aria-describedby={error || success || warning ? `${inputId}-message` : undefined}
  />

  {#if error || success || warning}
    <p id="{inputId}-message" class="text-xs {messageClass}">
      {error || success || warning}
    </p>
  {/if}
</div>

<!-- Usage Examples -->
<Input
  label="Email Address"
  type="email"
  bind:value={email}
  placeholder="you@example.com"
  required
/>

<Input
  label="Password"
  type="password"
  bind:value={password}
  error="Password must be at least 8 characters"
  size="lg"
/>

<Input
  placeholder="Search..."
  variant="borderless"
  success="Valid input"
/>
```

### Card System

```css
/* Card Base Class */
.card {
  @apply bg-white border border-gray-200 rounded-[var(--radius-card)];
  @apply shadow-[var(--shadow-card)];
  @apply overflow-hidden;
}

/* Card Sizes */
.card-xs {
  @apply p-3;
}

.card-sm {
  @apply p-4;
}

.card-md {
  @apply p-6;
}

.card-lg {
  @apply p-8;
}

.card-xl {
  @apply p-12;
}

/* Card Variants */
.card-elevated {
  @apply shadow-[var(--shadow-lg)];
}

.card-flat {
  @apply shadow-none border-2;
}

.card-outline {
  @apply bg-transparent border-2;
}

.card-ghost {
  @apply bg-transparent border-0 shadow-none;
}

/* Card Interactive States */
.card-hover {
  @apply transition-all duration-200 ease-out;
  @apply hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5;
  @apply hover:border-gray-300;
}

.card-clickable {
  @apply cursor-pointer transition-all duration-150 ease-out;
  @apply hover:shadow-md hover:border-gray-300;
  @apply active:scale-[0.98] active:shadow-sm;
}

/* Card Components */
.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-body {
  @apply px-6 py-4;
}

.card-footer {
  @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
}

.card-title {
  @apply text-lg font-semibold text-gray-900;
}

.card-subtitle {
  @apply text-sm font-medium text-gray-600 mt-1;
}

.card-description {
  @apply text-sm text-gray-600 mt-2;
}
```

#### Card Component (Svelte)

```html
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'elevated' | 'flat' | 'outline' | 'ghost';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    interactive?: boolean;
    clickable?: boolean;
    onclick?: () => void;
    class?: string;

    // Slots
    header?: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    variant = 'default',
    size = 'md',
    interactive = false,
    clickable = false,
    onclick,
    class: className = '',
    header,
    children,
    footer
  }: Props = $props();

  const cardClass = $derived(() => {
    const baseClass = `card card-${size}`;
    const variantClass = variant !== 'default' ? `card-${variant}` : '';
    const interactiveClass = interactive ? 'card-hover' : '';
    const clickableClass = clickable ? 'card-clickable' : '';
    return `${baseClass} ${variantClass} ${interactiveClass} ${clickableClass} ${className}`.trim();
  });
</script>

{#if clickable && onclick}
  <button class={cardClass} onclick={onclick}>
    {#if header}
      <div class="card-header">
        {@render header()}
      </div>
    {/if}

    <div class="card-body">
      {@render children()}
    </div>

    {#if footer}
      <div class="card-footer">
        {@render footer()}
      </div>
    {/if}
  </button>
{:else}
  <div class={cardClass}>
    {#if header}
      <div class="card-header">
        {@render header()}
      </div>
    {/if}

    <div class="card-body">
      {@render children()}
    </div>

    {#if footer}
      <div class="card-footer">
        {@render footer()}
      </div>
    {/if}
  </div>
{/if}

<!-- Usage Examples -->
<Card variant="elevated" size="lg" interactive>
  {#snippet header()}
    <h3 class="card-title">Product Features</h3>
    <p class="card-subtitle">Everything you need to know</p>
  {/snippet}

  <p class="card-description">
    This product includes advanced features for modern workflows.
  </p>

  {#snippet footer()}
    <Button variant="primary">Learn More</Button>
  {/snippet}
</Card>

<Card clickable onclick={() => navigate('/product/123')}>
  <div class="flex items-center space-x-4">
    <img src="product.jpg" alt="Product" class="w-16 h-16 rounded-lg" />
    <div>
      <h4 class="font-semibold">Product Name</h4>
      <p class="text-gray-600">$299.99</p>
    </div>
  </div>
</Card>
```

### Badge System

```css
/* Badge Base Class */
.badge {
  @apply inline-flex items-center;
  @apply px-2 py-0.5 text-xs font-medium;
  @apply rounded-[var(--radius-badge)];
  @apply border;
}

/* Badge Sizes */
.badge-xs {
  @apply px-1.5 py-0.5 text-xs;
}

.badge-sm {
  @apply px-2 py-0.5 text-xs;
}

.badge-md {
  @apply px-2.5 py-1 text-sm;
}

.badge-lg {
  @apply px-3 py-1.5 text-sm;
}

.badge-xl {
  @apply px-4 py-2 text-base;
}

/* Badge Variants */
.badge-primary {
  @apply bg-blue-100 text-blue-800 border-blue-200;
}

.badge-secondary {
  @apply bg-gray-100 text-gray-800 border-gray-200;
}

.badge-success {
  @apply bg-green-100 text-green-800 border-green-200;
}

.badge-warning {
  @apply bg-yellow-100 text-yellow-800 border-yellow-200;
}

.badge-danger {
  @apply bg-red-100 text-red-800 border-red-200;
}

.badge-info {
  @apply bg-cyan-100 text-cyan-800 border-cyan-200;
}

/* Badge Styles */
.badge-solid-primary {
  @apply bg-blue-500 text-white border-blue-500;
}

.badge-solid-secondary {
  @apply bg-gray-500 text-white border-gray-500;
}

.badge-solid-success {
  @apply bg-green-500 text-white border-green-500;
}

.badge-solid-warning {
  @apply bg-yellow-500 text-white border-yellow-500;
}

.badge-solid-danger {
  @apply bg-red-500 text-white border-red-500;
}

.badge-solid-info {
  @apply bg-cyan-500 text-white border-cyan-500;
}

.badge-outline {
  @apply bg-transparent border-2;
}

.badge-pill {
  @apply rounded-full;
}

.badge-square {
  @apply rounded-none;
}

.badge-dot {
  @apply p-0 w-2 h-2 rounded-full;
}
```

#### Badge Component (Svelte)

```html
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
    style?: 'soft' | 'solid' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'rounded' | 'pill' | 'square';
    dot?: boolean;
    removable?: boolean;
    onremove?: () => void;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'secondary',
    style = 'soft',
    size = 'sm',
    shape = 'rounded',
    dot = false,
    removable = false,
    onremove,
    class: className = '',
    children
  }: Props = $props();

  const badgeClass = $derived(() => {
    const baseClass = 'badge';
    const sizeClass = `badge-${size}`;
    const variantClass = style === 'solid'
      ? `badge-solid-${variant}`
      : style === 'outline'
        ? `badge-${variant} badge-outline`
        : `badge-${variant}`;
    const shapeClass = shape !== 'rounded' ? `badge-${shape}` : '';
    const dotClass = dot ? 'badge-dot' : '';

    return `${baseClass} ${sizeClass} ${variantClass} ${shapeClass} ${dotClass} ${className}`.trim();
  });
</script>

<span class={badgeClass}>
  {#if !dot}
    {@render children()}
    {#if removable && onremove}
      <button
        type="button"
        onclick={onremove}
        class="ml-1 -mr-0.5 h-3 w-3 rounded-full inline-flex items-center justify-center hover:bg-black/10"
      >
        <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
        </svg>
      </button>
    {/if}
  {/if}
</span>

<!-- Usage Examples -->
<Badge variant="primary" size="md">New</Badge>
<Badge variant="success" style="solid">Active</Badge>
<Badge variant="warning" shape="pill" removable onremove={() => console.log('Removed')}>
  Beta Feature
</Badge>
<Badge dot variant="danger" />
```

### Modal/Dialog System

```css
/* Modal Overlay */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm z-[var(--z-modal)];
  @apply flex items-center justify-center p-4;
}

/* Modal Container */
.modal {
  @apply bg-white rounded-[var(--radius-modal)] shadow-[var(--shadow-modal)];
  @apply max-w-md w-full max-h-[90vh] overflow-hidden;
  @apply animate-in fade-in-0 zoom-in-95 duration-200;
}

/* Modal Sizes */
.modal-xs {
  @apply max-w-xs;
}

.modal-sm {
  @apply max-w-sm;
}

.modal-md {
  @apply max-w-md;
}

.modal-lg {
  @apply max-w-lg;
}

.modal-xl {
  @apply max-w-xl;
}

.modal-2xl {
  @apply max-w-2xl;
}

.modal-3xl {
  @apply max-w-3xl;
}

.modal-4xl {
  @apply max-w-4xl;
}

.modal-full {
  @apply max-w-none w-full h-full m-0 rounded-none;
}

/* Modal Components */
.modal-header {
  @apply px-6 py-4 border-b border-gray-200;
  @apply flex items-center justify-between;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
}

.modal-close {
  @apply p-1 rounded-md text-gray-400 hover:text-gray-600;
  @apply hover:bg-gray-100 transition-colors duration-150;
}

.modal-body {
  @apply px-6 py-4 overflow-y-auto;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
  @apply flex items-center justify-end space-x-2;
}

/* Drawer Variants */
.modal-drawer-right {
  @apply fixed right-0 top-0 h-full max-w-sm w-full max-h-none m-0 rounded-none;
  @apply animate-in slide-in-from-right duration-300;
}

.modal-drawer-left {
  @apply fixed left-0 top-0 h-full max-w-sm w-full max-h-none m-0 rounded-none;
  @apply animate-in slide-in-from-left duration-300;
}

.modal-drawer-bottom {
  @apply fixed bottom-0 left-0 right-0 max-w-none w-full max-h-[90vh] m-0;
  @apply rounded-t-[var(--radius-modal)] rounded-b-none;
  @apply animate-in slide-in-from-bottom duration-300;
}
```

#### Modal Component (Svelte)

```html
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    open?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
    variant?: 'center' | 'drawer-right' | 'drawer-left' | 'drawer-bottom';
    closable?: boolean;
    backdrop?: boolean;
    title?: string;

    // Slots
    header?: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(false),
    size = 'md',
    variant = 'center',
    closable = true,
    backdrop = true,
    title,
    header,
    children,
    footer
  }: Props = $props();

  const dispatch = createEventDispatcher();

  function handleClose() {
    if (closable) {
      open = false;
      dispatch('close');
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (backdrop && event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closable) {
      handleClose();
    }
  }

  const modalClass = $derived(() => {
    const baseClass = 'modal';
    const sizeClass = `modal-${size}`;
    const variantClass = variant !== 'center' ? `modal-${variant}` : '';
    return `${baseClass} ${sizeClass} ${variantClass}`.trim();
  });
</script>

{#if open}
  <div
    class="modal-overlay"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class={modalClass}>
      {#if header || title || closable}
        <div class="modal-header">
          {#if header}
            {@render header()}
          {:else if title}
            <h2 class="modal-title">{title}</h2>
          {/if}

          {#if closable}
            <button type="button" class="modal-close" onclick={handleClose}>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <div class="modal-body">
        {@render children()}
      </div>

      {#if footer}
        <div class="modal-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Usage Examples -->
<Modal bind:open={showModal} title="Confirm Action" size="lg">
  <p>Are you sure you want to delete this item?</p>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => showModal = false}>Cancel</Button>
    <Button variant="danger" onclick={handleDelete}>Delete</Button>
  {/snippet}
</Modal>

<Modal bind:open={showDrawer} variant="drawer-right" size="md">
  {#snippet header()}
    <h2 class="text-lg font-semibold">Settings</h2>
  {/snippet}

  <div class="space-y-4">
    <!-- Settings content -->
  </div>
</Modal>
```

---

## Layout Systems

### Container Queries

Tailwind v4 includes built-in container query support:

```css
/* Container Query Utilities */
@container (min-width: 320px) {
  .card { @apply p-4; }
}

@container (min-width: 640px) {
  .card { @apply p-6; }
}

@container (min-width: 1024px) {
  .card { @apply p-8; }
}
```

#### Container Query Component (Svelte)

```html
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    type?: 'inline-size' | 'size';
    class?: string;
    children: Snippet;
  }

  let {
    type = 'inline-size',
    class: className = '',
    children
  }: Props = $props();
</script>

<div
  class="@container {className}"
  style="container-type: {type}"
>
  {@render children()}
</div>

<!-- Usage Example -->
<Container class="max-w-md">
  <div class="p-4 @sm:p-6 @lg:p-8">
    <h3 class="text-lg @sm:text-xl @lg:text-2xl">Responsive Content</h3>
    <p class="text-sm @sm:text-base">
      This content adapts to its container size, not the viewport.
    </p>
  </div>
</Container>
```

### Grid Systems

```css
/* Grid Utilities */
.grid-cols-auto {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.grid-cols-responsive {
  grid-template-columns: repeat(auto-fit, minmax(var(--min-col-width, 250px), 1fr));
}

/* 12 Column Grid */
.grid-12 {
  @apply grid grid-cols-12 gap-4;
}

.col-span-1 { @apply col-span-1; }
.col-span-2 { @apply col-span-2; }
.col-span-3 { @apply col-span-3; }
.col-span-4 { @apply col-span-4; }
.col-span-5 { @apply col-span-5; }
.col-span-6 { @apply col-span-6; }
.col-span-7 { @apply col-span-7; }
.col-span-8 { @apply col-span-8; }
.col-span-9 { @apply col-span-9; }
.col-span-10 { @apply col-span-10; }
.col-span-11 { @apply col-span-11; }
.col-span-12 { @apply col-span-12; }

/* Responsive Grid */
@media (max-width: 640px) {
  .grid-12 { @apply grid-cols-1 gap-2; }
  [class*="col-span-"] { @apply col-span-1; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid-12 { @apply grid-cols-6 gap-3; }
  .col-span-7, .col-span-8, .col-span-9, .col-span-10, .col-span-11, .col-span-12 {
    @apply col-span-6;
  }
}
```

### Layout Primitives

```css
/* Stack Layout */
.stack {
  @apply flex flex-col;
  gap: var(--stack-gap, 1rem);
}

.stack-xs { --stack-gap: 0.25rem; }
.stack-sm { --stack-gap: 0.5rem; }
.stack-md { --stack-gap: 1rem; }
.stack-lg { --stack-gap: 1.5rem; }
.stack-xl { --stack-gap: 2rem; }

/* Cluster Layout */
.cluster {
  @apply flex flex-wrap items-center;
  gap: var(--cluster-gap, 0.5rem);
}

/* Sidebar Layout */
.sidebar-layout {
  @apply flex gap-6;
}

.sidebar {
  @apply flex-shrink-0 w-64;
}

.main-content {
  @apply flex-1 min-w-0;
}

/* Holy Grail Layout */
.holy-grail {
  @apply min-h-screen flex flex-col;
}

.holy-grail-header {
  @apply flex-shrink-0;
}

.holy-grail-main {
  @apply flex-1 flex;
}

.holy-grail-sidebar {
  @apply w-64 flex-shrink-0;
}

.holy-grail-content {
  @apply flex-1 min-w-0;
}

.holy-grail-aside {
  @apply w-48 flex-shrink-0;
}

.holy-grail-footer {
  @apply flex-shrink-0;
}
```

#### Layout Components (Svelte)

```html
<!-- Stack Component -->
<script lang="ts">
  interface StackProps {
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    class?: string;
    children: Snippet;
  }

  let { gap = 'md', class: className = '', children }: StackProps = $props();
</script>

<div class="stack stack-{gap} {className}">
  {@render children()}
</div>

<!-- Cluster Component -->
<script lang="ts">
  interface ClusterProps {
    justify?: 'start' | 'center' | 'end' | 'between';
    align?: 'start' | 'center' | 'end';
    class?: string;
    children: Snippet;
  }

  let {
    justify = 'start',
    align = 'center',
    class: className = '',
    children
  }: ClusterProps = $props();

  const clusterClass = $derived(`cluster justify-${justify} items-${align} ${className}`);
</script>

<div class={clusterClass}>
  {@render children()}
</div>

<!-- Holy Grail Layout -->
<script lang="ts">
  interface HolyGrailProps {
    header?: Snippet;
    sidebar?: Snippet;
    aside?: Snippet;
    footer?: Snippet;
    children: Snippet;
  }

  let { header, sidebar, aside, footer, children }: HolyGrailProps = $props();
</script>

<div class="holy-grail">
  {#if header}
    <header class="holy-grail-header">
      {@render header()}
    </header>
  {/if}

  <main class="holy-grail-main">
    {#if sidebar}
      <aside class="holy-grail-sidebar">
        {@render sidebar()}
      </aside>
    {/if}

    <div class="holy-grail-content">
      {@render children()}
    </div>

    {#if aside}
      <aside class="holy-grail-aside">
        {@render aside()}
      </aside>
    {/if}
  </main>

  {#if footer}
    <footer class="holy-grail-footer">
      {@render footer()}
    </footer>
  {/if}
</div>
```

---

## Advanced Features

### 3D Transforms

Tailwind v4 includes native 3D transform utilities:

```css
/* 3D Transform Utilities */
.perspective-500 { perspective: 500px; }
.perspective-1000 { perspective: 1000px; }
.perspective-none { perspective: none; }

.rotate-x-0 { transform: rotateX(0deg); }
.rotate-x-45 { transform: rotateX(45deg); }
.rotate-x-90 { transform: rotateX(90deg); }
.rotate-x-180 { transform: rotateX(180deg); }

.rotate-y-0 { transform: rotateY(0deg); }
.rotate-y-45 { transform: rotateY(45deg); }
.rotate-y-90 { transform: rotateY(90deg); }
.rotate-y-180 { transform: rotateY(180deg); }

.rotate-z-0 { transform: rotateZ(0deg); }
.rotate-z-45 { transform: rotateZ(45deg); }
.rotate-z-90 { transform: rotateZ(90deg); }
.rotate-z-180 { transform: rotateZ(180deg); }

.preserve-3d { transform-style: preserve-3d; }
.flat { transform-style: flat; }

/* 3D Card Example */
.card-3d {
  @apply preserve-3d transition-transform duration-300 ease-out;
}

.card-3d:hover {
  @apply rotate-x-12 rotate-y-12;
}
```

### Enhanced Gradients

```css
/* Linear Gradients */
.bg-linear-45 {
  background-image: linear-gradient(45deg, var(--tw-gradient-stops));
}

.bg-linear-to-tr {
  background-image: linear-gradient(to top right, var(--tw-gradient-stops));
}

/* Radial Gradients */
.bg-radial {
  background-image: radial-gradient(var(--tw-gradient-shape, ellipse) var(--tw-gradient-size, farthest-corner) at var(--tw-gradient-position, center), var(--tw-gradient-stops));
}

.bg-radial-at-tl {
  --tw-gradient-position: top left;
}

.bg-radial-at-tr {
  --tw-gradient-position: top right;
}

.bg-radial-at-bl {
  --tw-gradient-position: bottom left;
}

.bg-radial-at-br {
  --tw-gradient-position: bottom right;
}

/* Conic Gradients */
.bg-conic {
  background-image: conic-gradient(from var(--tw-gradient-angle, 0deg) at var(--tw-gradient-position, center), var(--tw-gradient-stops));
}

.bg-conic-45 {
  --tw-gradient-angle: 45deg;
}

/* OKLCH Color Gradients */
.from-oklch-blue { --tw-gradient-from: oklch(0.58 0.14 240); }
.to-oklch-purple { --tw-gradient-to: oklch(0.58 0.14 300); }
.via-oklch-pink { --tw-gradient-via: oklch(0.58 0.14 350); }
```

### Advanced Animations

```css
/* Custom Keyframes */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slide-down {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Animation Utilities */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

.animate-shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

/* Hover Animations */
.hover-lift {
  @apply transition-transform duration-200 ease-out;
}

.hover-lift:hover {
  @apply -translate-y-1;
}

.hover-grow {
  @apply transition-transform duration-200 ease-out;
}

.hover-grow:hover {
  @apply scale-105;
}
```

### Filter Effects

```css
/* Filter Utilities */
.blur-xs { filter: blur(2px); }
.blur-sm { filter: blur(4px); }
.blur-md { filter: blur(8px); }
.blur-lg { filter: blur(16px); }
.blur-xl { filter: blur(24px); }
.blur-2xl { filter: blur(40px); }
.blur-3xl { filter: blur(64px); }

.brightness-0 { filter: brightness(0); }
.brightness-50 { filter: brightness(0.5); }
.brightness-75 { filter: brightness(0.75); }
.brightness-90 { filter: brightness(0.9); }
.brightness-95 { filter: brightness(0.95); }
.brightness-100 { filter: brightness(1); }
.brightness-105 { filter: brightness(1.05); }
.brightness-110 { filter: brightness(1.1); }
.brightness-125 { filter: brightness(1.25); }
.brightness-150 { filter: brightness(1.5); }
.brightness-200 { filter: brightness(2); }

.contrast-0 { filter: contrast(0); }
.contrast-50 { filter: contrast(0.5); }
.contrast-75 { filter: contrast(0.75); }
.contrast-100 { filter: contrast(1); }
.contrast-125 { filter: contrast(1.25); }
.contrast-150 { filter: contrast(1.5); }
.contrast-200 { filter: contrast(2); }

.saturate-0 { filter: saturate(0); }
.saturate-50 { filter: saturate(0.5); }
.saturate-100 { filter: saturate(1); }
.saturate-150 { filter: saturate(1.5); }
.saturate-200 { filter: saturate(2); }

.sepia-0 { filter: sepia(0); }
.sepia { filter: sepia(1); }

.grayscale-0 { filter: grayscale(0); }
.grayscale { filter: grayscale(1); }

.invert-0 { filter: invert(0); }
.invert { filter: invert(1); }

.hue-rotate-0 { filter: hue-rotate(0deg); }
.hue-rotate-15 { filter: hue-rotate(15deg); }
.hue-rotate-30 { filter: hue-rotate(30deg); }
.hue-rotate-60 { filter: hue-rotate(60deg); }
.hue-rotate-90 { filter: hue-rotate(90deg); }
.hue-rotate-180 { filter: hue-rotate(180deg); }
```

---

## Performance Optimization

### Critical CSS Strategy

```css
/* Critical Above-the-Fold Styles */
@layer critical {
  /* Layout */
  .header, .nav, .hero { /* critical styles */ }

  /* Typography */
  h1, h2, .hero-text { /* critical text styles */ }

  /* Core Components */
  .btn-primary, .card { /* critical component styles */ }
}

/* Non-critical styles loaded asynchronously */
@layer non-critical {
  .modal, .dropdown, .tooltip { /* non-critical styles */ }
}
```

### Code Splitting

```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'critical-css': ['./src/styles/critical.css'],
          'components': ['./src/styles/components.css'],
          'utilities': ['./src/styles/utilities.css']
        }
      }
    }
  }
}
```

### Build Optimization

```css
/* Use CSS Custom Properties for Runtime Efficiency */
.theme-switcher {
  --primary: var(--color-blue-500);
  --surface: var(--color-gray-50);
}

[data-theme="dark"] .theme-switcher {
  --primary: var(--color-blue-400);
  --surface: var(--color-gray-800);
}

/* Minimize Paint Operations */
.optimized-card {
  @apply will-change-transform; /* GPU acceleration hint */
  @apply transform-gpu; /* Force GPU layer */
}

/* Efficient Transitions */
.efficient-hover {
  @apply transition-opacity duration-150; /* Opacity is cheap */
}

.expensive-hover {
  @apply transition-all duration-150; /* Avoid transition-all */
}
```

### Bundle Size Optimization

```js
// tailwind.config.js (if needed for complex setups)
export default {
  content: {
    files: [
      './src/**/*.{html,js,svelte,ts}',
      './packages/**/*.{html,js,svelte,ts}'
    ],
    // Aggressive purging
    extract: {
      js: (content) => content.match(/[A-Za-z0-9_-]+/g) || []
    }
  }
}
```

---

## Accessibility Standards

### Focus Management

```css
/* Visible Focus Indicators */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset;
}

.focus-ring-white {
  @apply focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500;
}

/* Focus Within */
.focus-within-ring {
  @apply focus-within:ring-2 focus-within:ring-blue-500;
}

/* Skip Links */
.skip-link {
  @apply absolute -top-full left-0 z-[100] bg-white p-2 text-blue-600 underline;
  @apply focus:top-0;
}
```

### Color Contrast

```css
/* WCAG AA Compliant Color Combinations */
.text-high-contrast {
  /* 7:1 contrast ratio for AAA compliance */
  color: oklch(0.15 0.015 270); /* Very dark text */
  background: oklch(1 0 0); /* Pure white background */
}

.text-medium-contrast {
  /* 4.5:1 contrast ratio for AA compliance */
  color: oklch(0.35 0.025 270); /* Medium dark text */
  background: oklch(0.98 0.005 270); /* Off-white background */
}

/* Status Colors with Proper Contrast */
.status-success-accessible {
  color: oklch(0.25 0.08 145); /* Dark green text */
  background: oklch(0.95 0.02 145); /* Light green background */
}

.status-error-accessible {
  color: oklch(0.25 0.08 0); /* Dark red text */
  background: oklch(0.95 0.02 0); /* Light red background */
}
```

### Touch Targets

```css
/* Minimum 44px Touch Targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  @apply flex items-center justify-center;
}

.touch-target-small {
  min-height: 32px;
  min-width: 32px;
  /* Use only for secondary actions */
}

/* Tap Target Enhancement */
.tap-target {
  @apply relative;
}

.tap-target::after {
  content: '';
  @apply absolute inset-0 min-h-[44px] min-w-[44px];
  /* Invisible overlay for larger tap area */
}
```

### Screen Reader Support

```css
/* Screen Reader Only Content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Focus Visible Only */
.focus:not(.focus-visible) {
  outline: none;
  box-shadow: none;
}
```

#### Accessible Component Example (Svelte)

```html
<script lang="ts">
  interface AccessibleButtonProps {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    loading?: boolean;
    ariaLabel?: string;
    ariaDescribedby?: string;
    onclick?: () => void;
    children: Snippet;
  }

  let {
    variant = 'primary',
    disabled = false,
    loading = false,
    ariaLabel,
    ariaDescribedby,
    onclick,
    children
  }: AccessibleButtonProps = $props();
</script>

<button
  type="button"
  class="btn btn-{variant} focus-ring touch-target"
  {disabled}
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedby}
  aria-busy={loading}
  onclick={onclick}
>
  {#if loading}
    <svg
      class="animate-spin w-4 h-4 mr-2"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
        fill="none"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span class="sr-only">Loading...</span>
  {/if}

  {@render children()}
</button>
```

---

## Dark Mode Implementation

### CSS Variables Approach

```css
/* Light Mode (Default) */
:root {
  --surface-bg: oklch(1 0 0);
  --surface-fg: oklch(0.15 0.015 270);
  --surface-border: oklch(0.95 0.005 270);
  --surface-accent: oklch(0.98 0.005 270);
}

/* Dark Mode */
[data-theme="dark"] {
  --surface-bg: oklch(0.15 0.015 270);
  --surface-fg: oklch(0.95 0.005 270);
  --surface-border: oklch(0.25 0.02 270);
  --surface-accent: oklch(0.2 0.02 270);
}

/* System Preference */
@media (prefers-color-scheme: dark) {
  :root {
    --surface-bg: oklch(0.15 0.015 270);
    --surface-fg: oklch(0.95 0.005 270);
    --surface-border: oklch(0.25 0.02 270);
    --surface-accent: oklch(0.2 0.02 270);
  }
}

/* Component Implementation */
.card {
  background: var(--surface-bg);
  color: var(--surface-fg);
  border: 1px solid var(--surface-border);
}
```

### Complete Dark Mode Token System

```css
@theme {
  /* Light Mode Colors */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0.015 270);
  --color-muted: oklch(0.98 0.005 270);
  --color-muted-foreground: oklch(0.45 0.025 270);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.15 0.015 270);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.15 0.015 270);
  --color-border: oklch(0.95 0.005 270);
  --color-input: oklch(0.95 0.005 270);
  --color-primary: oklch(0.58 0.14 240);
  --color-primary-foreground: oklch(0.98 0.005 270);
  --color-secondary: oklch(0.98 0.005 270);
  --color-secondary-foreground: oklch(0.15 0.015 270);
  --color-accent: oklch(0.98 0.005 270);
  --color-accent-foreground: oklch(0.15 0.015 270);
  --color-destructive: oklch(0.58 0.14 0);
  --color-destructive-foreground: oklch(0.98 0.005 270);
  --color-ring: oklch(0.58 0.14 240);
}

/* Dark Mode Override */
[data-theme="dark"] {
  --color-background: oklch(0.13 0.01 270);
  --color-foreground: oklch(0.98 0.005 270);
  --color-muted: oklch(0.18 0.015 270);
  --color-muted-foreground: oklch(0.65 0.02 270);
  --color-popover: oklch(0.13 0.01 270);
  --color-popover-foreground: oklch(0.98 0.005 270);
  --color-card: oklch(0.13 0.01 270);
  --color-card-foreground: oklch(0.98 0.005 270);
  --color-border: oklch(0.2 0.015 270);
  --color-input: oklch(0.2 0.015 270);
  --color-primary: oklch(0.68 0.12 240);
  --color-primary-foreground: oklch(0.15 0.015 270);
  --color-secondary: oklch(0.2 0.015 270);
  --color-secondary-foreground: oklch(0.98 0.005 270);
  --color-accent: oklch(0.2 0.015 270);
  --color-accent-foreground: oklch(0.98 0.005 270);
  --color-destructive: oklch(0.68 0.12 0);
  --color-destructive-foreground: oklch(0.98 0.005 270);
  --color-ring: oklch(0.68 0.12 240);
}
```

### Dark Mode Toggle Component

```html
<script lang="ts">
  import { browser } from '$app/environment';
  import { writable } from 'svelte/store';

  type Theme = 'light' | 'dark' | 'system';

  const theme = writable<Theme>('system');

  let mounted = $state(false);
  let currentTheme = $state<Theme>('system');

  // Initialize theme
  $effect(() => {
    if (browser) {
      mounted = true;
      const stored = localStorage.getItem('theme') as Theme;
      if (stored) {
        currentTheme = stored;
        theme.set(stored);
      }
      applyTheme(currentTheme);
    }
  });

  function applyTheme(newTheme: Theme) {
    if (!browser) return;

    const html = document.documentElement;
    html.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      html.setAttribute('data-theme', systemTheme);
    } else {
      html.setAttribute('data-theme', newTheme);
    }
  }

  function setTheme(newTheme: Theme) {
    currentTheme = newTheme;
    theme.set(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }

  // Listen for system theme changes
  $effect(() => {
    if (browser && currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);

      return () => mediaQuery.removeEventListener('change', handler);
    }
  });
</script>

{#if mounted}
  <div class="flex items-center space-x-1 rounded-lg bg-muted p-1">
    <button
      type="button"
      onclick={() => setTheme('light')}
      class="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background hover:text-foreground {currentTheme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span class="sr-only">Light</span>
    </button>

    <button
      type="button"
      onclick={() => setTheme('dark')}
      class="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background hover:text-foreground {currentTheme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <span class="sr-only">Dark</span>
    </button>

    <button
      type="button"
      onclick={() => setTheme('system')}
      class="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background hover:text-foreground {currentTheme === 'system' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span class="sr-only">System</span>
    </button>
  </div>
{/if}
```

---

## SvelteKit Integration

### Optimal Setup

```js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [
    sveltekit(),
    tailwindcss()
  ],
  css: {
    devSourcemap: true
  }
};
```

```css
/* src/app.css */
@import 'tailwindcss';

@source './lib/**/*.{html,svelte,js,ts}';
@source './routes/**/*.{html,svelte,js,ts}';
@source '../packages/ui/src/**/*.{html,svelte,js,ts}';

@theme {
  /* Your design tokens */
}
```

### SSR Considerations

```html
<!-- src/app.html -->
<!DOCTYPE html>
<html lang="en" data-theme="light" class="h-full">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

    <!-- Prevent FOUC with inline critical styles -->
    <style>
      .loading-fallback {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: system-ui, -apple-system, sans-serif;
        color: #6b7280;
      }
    </style>

    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" class="h-full bg-background text-foreground antialiased">
    <div id="app" style="display: contents">
      <div class="loading-fallback">Loading...</div>
      %sveltekit.body%
    </div>
  </body>
</html>
```

### Dynamic Classes with Svelte 5

```html
<script lang="ts">
  interface DynamicButtonProps {
    variant: 'primary' | 'secondary' | 'danger';
    size: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
  }

  let {
    variant,
    size,
    loading = false,
    disabled = false
  }: DynamicButtonProps = $props();

  // Use $derived for reactive class computation
  const buttonClass = $derived(() => {
    const base = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const stateClasses = [
      loading && 'opacity-75 cursor-wait',
      disabled && 'opacity-50 cursor-not-allowed'
    ].filter(Boolean).join(' ');

    return `${base} ${variantClass} ${sizeClass} ${stateClasses}`.trim();
  });

  // Conditional styling with $state
  let isHovered = $state(false);
  let isFocused = $state(false);

  const dynamicStyles = $derived(() => {
    if (variant === 'primary') {
      return {
        backgroundColor: isHovered ? 'oklch(0.48 0.16 240)' : 'oklch(0.58 0.14 240)',
        transform: isFocused ? 'scale(1.02)' : 'scale(1)'
      };
    }
    return {};
  });
</script>

<button
  class={buttonClass}
  style={Object.entries(dynamicStyles).map(([key, value]) => `${key}: ${value}`).join('; ')}
  {disabled}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
  onfocus={() => isFocused = true}
  onblur={() => isFocused = false}
>
  {#if loading}
    <div class="animate-spin w-4 h-4 mr-2">⟳</div>
  {/if}
  <slot />
</button>
```

### Form Handling with Actions

```html
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  interface FormData {
    email: string;
    password: string;
  }

  let formData = $state<FormData>({
    email: '',
    password: ''
  });

  let isSubmitting = $state(false);
  let errors = $state<Partial<FormData>>({});

  const handleSubmit: SubmitFunction = ({ formData, cancel }) => {
    isSubmitting = true;
    errors = {};

    // Client-side validation
    if (!formData.get('email')) {
      errors.email = 'Email is required';
      cancel();
      isSubmitting = false;
      return;
    }

    return async ({ result, update }) => {
      isSubmitting = false;

      if (result.type === 'failure' && result.data?.errors) {
        errors = result.data.errors;
      }

      await update();
    };
  };
</script>

<form
  method="POST"
  action="?/login"
  use:enhance={handleSubmit}
  class="space-y-6 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
>
  <div class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Email Address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        bind:value={formData.email}
        class="input {errors.email ? 'input-error' : ''}"
        placeholder="you@example.com"
        disabled={isSubmitting}
        required
      />
      {#if errors.email}
        <p class="text-sm text-red-600 mt-1">{errors.email}</p>
      {/if}
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        bind:value={formData.password}
        class="input {errors.password ? 'input-error' : ''}"
        disabled={isSubmitting}
        required
      />
      {#if errors.password}
        <p class="text-sm text-red-600 mt-1">{errors.password}</p>
      {/if}
    </div>
  </div>

  <button
    type="submit"
    disabled={isSubmitting}
    class="btn btn-primary w-full"
  >
    {#if isSubmitting}
      <svg class="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      Signing In...
    {:else}
      Sign In
    {/if}
  </button>
</form>
```

---

## Migration Guide

### From Tailwind v3 to v4

#### Step 1: Update Dependencies

```bash
# Remove old Tailwind
npm uninstall tailwindcss postcss autoprefixer

# Install Tailwind v4
npm install tailwindcss@next
npm install @tailwindcss/vite
```

#### Step 2: Update Configuration

```diff
- // tailwind.config.js
- export default {
-   content: ['./src/**/*.{html,js,svelte,ts}'],
-   theme: {
-     extend: {
-       colors: {
-         primary: '#3b82f6'
-       }
-     }
-   }
- }

+ /* src/app.css */
+ @import 'tailwindcss';
+
+ @source './src/**/*.{html,js,svelte,ts}';
+
+ @theme {
+   --color-primary: oklch(0.58 0.14 240);
+ }
```

#### Step 3: Update Build Configuration

```diff
- // postcss.config.js
- export default {
-   plugins: {
-     tailwindcss: {},
-     autoprefixer: {}
-   }
- }

+ // vite.config.js
+ import tailwindcss from '@tailwindcss/vite';
+
+ export default {
+   plugins: [
+     sveltekit(),
+     tailwindcss()
+   ]
+ }
```

#### Step 4: Update Color Usage

```diff
- <div class="bg-blue-500 text-white">
+ <div class="bg-primary text-white">

- <div class="shadow-lg">
+ <div class="shadow-[var(--shadow-lg)]">

- .custom-gradient {
-   @apply bg-gradient-to-r from-blue-500 to-purple-500;
- }

+ .custom-gradient {
+   @apply bg-linear-to-r from-primary to-purple-500;
+ }
```

### Breaking Changes Checklist

- [ ] Replace `bg-gradient-*` with `bg-linear-*`
- [ ] Update `shadow-sm` to `shadow-xs`
- [ ] Replace opacity utilities with color-mix()
- [ ] Update custom CSS to use @theme
- [ ] Replace PostCSS plugins with Lightning CSS
- [ ] Update content scanning paths to @source
- [ ] Test container query support
- [ ] Verify 3D transform compatibility

---

## Testing Strategies

### Visual Regression Testing

```js
// playwright.config.js
export default {
  testDir: './tests',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } }
  ]
};

// tests/visual.spec.js
import { test, expect } from '@playwright/test';

test.describe('Component Visual Tests', () => {
  test('buttons render correctly', async ({ page }) => {
    await page.goto('/components/buttons');

    // Test all button variants
    await expect(page.locator('[data-testid="btn-primary"]')).toHaveScreenshot('btn-primary.png');
    await expect(page.locator('[data-testid="btn-secondary"]')).toHaveScreenshot('btn-secondary.png');

    // Test hover states
    await page.hover('[data-testid="btn-primary"]');
    await expect(page.locator('[data-testid="btn-primary"]')).toHaveScreenshot('btn-primary-hover.png');
  });

  test('dark mode renders correctly', async ({ page }) => {
    await page.goto('/components');
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page).toHaveScreenshot('dark-mode.png');
  });
});
```

### Accessibility Testing

```js
// tests/accessibility.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('focus management works correctly', async ({ page }) => {
    await page.goto('/components/modal');

    // Open modal
    await page.click('[data-testid="open-modal"]');

    // Check focus is trapped
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check focus returns to trigger
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="open-modal"]')).toBeFocused();
  });
});
```

### Performance Testing

```js
// tests/performance.spec.js
test('CSS loads efficiently', async ({ page }) => {
  const responses = [];

  page.on('response', response => {
    if (response.url().includes('.css')) {
      responses.push({
        url: response.url(),
        size: response.headers()['content-length'],
        status: response.status()
      });
    }
  });

  await page.goto('/');

  // Check CSS file size is reasonable
  const cssResponse = responses.find(r => r.url.includes('app.css'));
  expect(parseInt(cssResponse.size)).toBeLessThan(100000); // < 100KB
});

test('page loads within performance budget', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => {
    return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]));
  });

  expect(metrics.loadEventEnd - metrics.navigationStart).toBeLessThan(3000); // < 3s
});
```

### Component Testing

```html
<!-- Button.test.svelte -->
<script lang="ts">
  import { test } from 'vitest';
  import { render, screen } from '@testing-library/svelte';
  import Button from './Button.svelte';

  test('renders with correct classes', () => {
    render(Button, {
      props: {
        variant: 'primary',
        size: 'lg'
      }
    });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn', 'btn-primary', 'btn-lg');
  });

  test('handles click events', async () => {
    let clicked = false;
    const handleClick = () => { clicked = true; };

    render(Button, {
      props: { onclick: handleClick }
    });

    await fireEvent.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });

  test('shows loading state', () => {
    render(Button, {
      props: { loading: true }
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
</script>
```

---

## Implementation Checklist

### Pre-Implementation Tasks
- [ ] **Architecture Review**: Verify current `@source` globs cover all Svelte/TS files
- [ ] **Token Audit**: Ensure every semantic color/spacing/font maps back to `packages/ui` tokens
- [ ] **Legacy Cleanup**: Remove unused directives, duplicated tokens from each app's `app.css`
- [ ] **Component Validation**: Check `@layer components` follow 44px touch targets and UI-UX.md guidance

### Implementation Tasks
- [ ] **Replace @apply Usage**: Convert duplicated semantic classes to component-level styles
- [ ] **Accessibility Fixes**: Address BottomNav tablist role and PartnerShowcase interaction warnings
- [ ] **CSS Cleanup**: Remove unused selectors (.emoji-track span, .group button)
- [ ] **Interactive Patterns**: Implement proper carousel navigation element patterns
- [ ] **Performance Audit**: Run validation commands after changes

### Hand-off Checklist
- [ ] **Screenshots**: Capture before/after for updated hero sections, nav, checkout, and key flows
- [ ] **Documentation**: Update UI-UX.md only when product requirements shift
- [ ] **Issue Tracking**: Note regressions or deferred cleanups with owners for Codex prioritization
- [ ] **Validation**: All build, lint, test, and performance audit commands pass
- [ ] **Design Review**: Get sign-off for any app-specific token divergences

### Project-Specific Follow-ups
- [ ] **Accessibility Review**: Design system review needed for ARIA roles in UI components
- [ ] **Component Cleanup**: Unused selectors identified in HeaderLogo.svelte and PartnerShowcase.svelte
- [ ] **Interactive Elements**: Proper patterns needed for carousel navigation components
- [ ] **Performance Monitoring**: Continue watching Lighthouse scores after global style changes

### Implementation Notes
- Tailwind v4 no longer uses `tailwind.config.js`; keep overrides in CSS or promote to `@repo/ui`
- Use `@theme` for token remaps and `@custom-variant` for new stateful selectors
- Document rationale for app-specific tokens that diverge from product tokens
- Keep feature flag CSS behind comments with toggle name and removal plan
- Avoid adding new plugins without design review

---

## Reference

### Design Token Reference

#### Complete Spacing Scale
```css
0     -> 0px
px    -> 1px
0.5   -> 2px    (0.125rem)
1     -> 4px    (0.25rem)
1.5   -> 6px    (0.375rem)
2     -> 8px    (0.5rem)
2.5   -> 10px   (0.625rem)
3     -> 12px   (0.75rem)
3.5   -> 14px   (0.875rem)
4     -> 16px   (1rem)
5     -> 20px   (1.25rem)
6     -> 24px   (1.5rem)
7     -> 28px   (1.75rem)
8     -> 32px   (2rem)
9     -> 36px   (2.25rem)
10    -> 40px   (2.5rem)
11    -> 44px   (2.75rem) ← Minimum touch target
12    -> 48px   (3rem)
14    -> 56px   (3.5rem)
16    -> 64px   (4rem)
20    -> 80px   (5rem)
24    -> 96px   (6rem)
28    -> 112px  (7rem)
32    -> 128px  (8rem)
36    -> 144px  (9rem)
40    -> 160px  (10rem)
44    -> 176px  (11rem)
48    -> 192px  (12rem)
52    -> 208px  (13rem)
56    -> 224px  (14rem)
60    -> 240px  (15rem)
64    -> 256px  (16rem)
72    -> 288px  (18rem)
80    -> 320px  (20rem)
96    -> 384px  (24rem)
```

#### Typography Scale
```css
xs    -> 0.75rem   (12px)
sm    -> 0.875rem  (14px)
base  -> 1rem      (16px)
lg    -> 1.125rem  (18px)
xl    -> 1.25rem   (20px)
2xl   -> 1.5rem    (24px)
3xl   -> 1.875rem  (30px)
4xl   -> 2.25rem   (36px)
5xl   -> 3rem      (48px)
6xl   -> 3.75rem   (60px)
7xl   -> 4.5rem    (72px)
8xl   -> 6rem      (96px)
9xl   -> 8rem      (128px)
```

#### Color Palette (OKLCH)
All colors use OKLCH color space for perceptual uniformity:
- L (Lightness): 0-1 scale
- C (Chroma): 0+ saturation
- H (Hue): 0-360 degrees

#### Shadow Scale
```css
xs    -> 0 1px 2px rgba(0,0,0,0.05)
sm    -> 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
md    -> 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
lg    -> 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
xl    -> 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
2xl   -> 0 25px 50px rgba(0,0,0,0.25)
inner -> inset 0 2px 4px rgba(0,0,0,0.06)
```

### Browser Support

#### Tailwind CSS v4 Requirements
- **Chrome**: 111+ (March 2023)
- **Firefox**: 128+ (July 2024)
- **Safari**: 16.4+ (March 2023)
- **Edge**: 111+ (March 2023)

#### Required Features
- CSS Cascade Layers (`@layer`)
- CSS Custom Properties with `@property`
- `color-mix()` function
- Container Queries
- `:has()` pseudo-class

### Performance Benchmarks

#### Build Performance
- **Full builds**: 3.78x to 5x faster than v3
- **Incremental builds**: 8x to 100x faster
- **No-change rebuilds**: Complete in microseconds
- **Bundle size**: 30-50% reduction in typical projects

#### Runtime Performance
- **CSS loading**: Single HTTP request
- **Custom properties**: Near-native performance
- **Paint operations**: Optimized for 60fps animations
- **Memory usage**: 40% reduction vs v3

### Best Practices Checklist

#### Design System
- [ ] Use semantic color tokens instead of raw values
- [ ] Implement consistent spacing rhythm
- [ ] Define component-specific tokens
- [ ] Document token usage guidelines
- [ ] Create automated token validation

#### Performance
- [ ] Implement critical CSS strategy
- [ ] Use container queries over media queries where appropriate
- [ ] Leverage CSS custom properties for theming
- [ ] Minimize `transition-all` usage
- [ ] Optimize for paint operations

#### Accessibility
- [ ] Maintain 4.5:1 color contrast minimum
- [ ] Use 44px minimum touch targets
- [ ] Implement proper focus management
- [ ] Include screen reader support
- [ ] Test with keyboard navigation

#### Development
- [ ] Use TypeScript for props validation
- [ ] Implement visual regression testing
- [ ] Create component documentation
- [ ] Set up automated accessibility testing
- [ ] Monitor bundle size impact

---

*This guide represents current best practices for Tailwind CSS v4 as of January 2025. Always refer to the official documentation for the latest updates and changes.*

**Version**: 1.0
**Last Updated**: January 2025
**Compatibility**: Tailwind CSS v4.0+, SvelteKit 2.0+, Svelte 5.0+## CODEX Tailwind CSS v4 Implementation

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

## GEMINI Tailwind CSS v4 Implementation

### Intent
- Create a hyper-performant, accessible, and visually stunning storefront that feels both modern and trustworthy.
- Implement a flexible and scalable design token system that enforces consistency while allowing for rapid iteration.
- Ensure a seamless developer experience by leveraging the full power of Tailwind CSS v4's CSS-first approach.

### Token Architecture

#### Primitives (`packages/ui/src/styles/tokens.css`)
This file will contain the raw, primitive values for our design system. These are the foundational building blocks.

```css
:root {
  /* Brand Palette */
  --color-brand-50: #eef2ff;
  --color-brand-100: #e0e7ff;
  --color-brand-200: #c7d2fe;
  --color-brand-300: #a5b4fc;
  --color-brand-400: #818cf8;
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
  --color-brand-800: #3730a3;
  --color-brand-900: #312e81;

  /* Neutral Palette */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;

  /* Accent Palette */
  --color-accent-50: #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;

  /* State Palettes */
  --color-success-100: #d1fae5;
  --color-success-500: #10b981;
  --color-success-700: #047857;
  --color-warning-100: #fef9c3;
  --color-warning-500: #facc15;
  --color-warning-700: #b45309;
  --color-danger-100: #fee2e2;
  --color-danger-500: #ef4444;
  --color-danger-700: #b91c1c;

  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Merriweather', serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* Spacing */
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

  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

#### Semantic Layer (`packages/ui/src/styles/semantic.css`)
This file will map our primitive tokens to semantic, purpose-driven variables. This abstraction layer makes the system more intuitive and maintainable.

```css
:root {
  color-scheme: light;

  /* Surfaces */
  --surface-ground: var(--color-neutral-50);
  --surface-default: var(--color-neutral-0);
  --surface-subtle: var(--color-neutral-100);
  --surface-emphasis: var(--color-neutral-200);
  --surface-inverse: var(--color-neutral-900);

  /* Borders */
  --border-default: var(--color-neutral-200);
  --border-emphasis: var(--color-neutral-300);

  /* Text */
  --text-default: var(--color-neutral-800);
  --text-subtle: var(--color-neutral-600);
  --text-placeholder: var(--color-neutral-400);
  --text-inverse: var(--color-neutral-0);

  /* Brand */
  --brand-default: var(--color-brand-600);
  --brand-emphasis: var(--color-brand-700);
  --brand-subtle: var(--color-brand-100);
  --brand-text-on-brand: var(--color-neutral-0);

  /* Accent */
  --accent-default: var(--color-accent-500);
  --accent-emphasis: var(--color-accent-600);
  --accent-subtle: var(--color-accent-100);

  /* Status */
  --status-success-surface: var(--color-success-100);
  --status-success-text: var(--color-success-700);
  --status-warning-surface: var(--color-warning-100);
  --status-warning-text: var(--color-warning-700);
  --status-danger-surface: var(--color-danger-100);
  --status-danger-text: var(--color-danger-700);

  /* Forms */
  --input-bg: var(--surface-default);
  --input-border: var(--border-default);
  --input-focus-border: var(--brand-default);
  --input-focus-ring: rgba(79, 70, 229, 0.2);

  /* Transitions */
  --duration-quick: 100ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
}

:root[data-theme='dark'] {
  color-scheme: dark;

  /* Surfaces */
  --surface-ground: var(--color-neutral-900);
  --surface-default: var(--color-neutral-800);
  --surface-subtle: var(--color-neutral-700);
  --surface-emphasis: var(--color-neutral-600);
  --surface-inverse: var(--color-neutral-0);

  /* Borders */
  --border-default: var(--color-neutral-700);
  --border-emphasis: var(--color-neutral-600);

  /* Text */
  --text-default: var(--color-neutral-100);
  --text-subtle: var(--color-neutral-300);
  --text-placeholder: var(--color-neutral-500);
  --text-inverse: var(--color-neutral-900);

  /* Brand */
  --brand-default: var(--color-brand-500);
  --brand-emphasis: var(--color-brand-400);
  --brand-subtle: var(--color-brand-800);
  --brand-text-on-brand: var(--color-neutral-0);

  /* Forms */
  --input-focus-ring: rgba(129, 140, 248, 0.2);
}
```

### Tailwind v4 Theme (`apps/web/src/app.css`)
The application-level CSS file will import our tokens and configure Tailwind's theme.

```css
@import 'tailwindcss';
@import '@repo/ui/styles/tokens.css';
@import '@repo/ui/styles/semantic.css';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';
@tailwind base;
@tailwind components;
@tailwind utilities;

@source '../src/**/*.{svelte,ts}';
@source '../../packages/ui/src/**/*.{svelte,ts}';

@theme {
  --color-primary: var(--brand-default);
  --color-primary-foreground: var(--brand-text-on-brand);
  --color-secondary: var(--accent-default);
  --color-secondary-foreground: var(--text-default);
  --color-muted: var(--surface-subtle);
  --color-muted-foreground: var(--text-subtle);
  --color-card: var(--surface-default);
  --color-border: var(--border-default);
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
  --spacing: var(--space-4);
  --radius: var(--radius-md);
}

@custom-variant hocus (&:hover, &:focus-visible);
```

### Component Strategy
- **Buttons**: A set of button variants (primary, secondary, ghost, destructive) will be created as components in `packages/ui`. These will use our semantic tokens for color, typography, and spacing.
- **Forms**: We will leverage `@tailwindcss/forms` and style our form elements to use our semantic tokens for a consistent look and feel.
- **Layout**: We will create a set of layout components (e.g., `<Stack>`, `<Grid>`, `<Container>`) in `packages/ui` to ensure consistent spacing and alignment across the application.

### Rollout Plan
1.  **Implement Tokens**: Create `tokens.css` and `semantic.css` in `packages/ui`.
2.  **Update Apps**: Update `app.css` in each application to import the new token files and configure the Tailwind theme.
3.  **Refactor Components**: Incrementally refactor components in `packages/ui` and in each application to use the new semantic tokens and utility classes.
4.  **Remove Old Styles**: Once all components are refactored, remove any old, unused CSS files and dependencies.
5.  **Documentation**: Update all relevant documentation to reflect the new design system and Tailwind v4 implementation.

### Validation
- **Linting**: Use `pnpm lint` to ensure all CSS and Tailwind classes are valid and used correctly.
- **Visual Regression Testing**: Use a tool like Chromatic or Percy to catch unintended visual changes.
- **Accessibility Testing**: Run `pnpm test:e2e -- --project accessibility` to ensure all components are accessible.
- **Performance Monitoring**: Monitor key performance metrics (LCP, CLS) to ensure the new implementation is performant.

