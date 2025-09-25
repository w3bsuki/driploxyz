CODEX: # Tailwind CSS v4 Complete Design System & Implementation Guide
CODEX: 
CODEX: *Ultimate reference for building scalable, performant interfaces with Tailwind CSS v4, SvelteKit 2, and modern web standards. Project-specific implementation guide for the Driplo platform.*
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Project Implementation Status & Goals
CODEX: 
CODEX: Reference this when tightening the design system across apps. Add owners to each checkbox before Claude executes a slice and wait for Codex to sign off before ticking items.
CODEX: 
CODEX: ### Core Project Goals
CODEX: - ✅ Tailwind v4 builds pull every utility from semantic tokens in `@repo/ui/styles` (no ad-hoc hex values in app code)
CODEX: - ✅ CSS entry points (`apps/*/src/app.css`) import Tailwind once, register only required plugins, and scope `@source` to real component paths
CODEX: - ✅ App-specific themes extend the shared tokens via `@theme` and `@layer` without duplicating base variables
CODEX: - 🔄 Builds finish with zero unused-layer warnings and Lighthouse keeps render-blocking CSS under control
CODEX: 
CODEX: ### Current Architecture Status
CODEX: - ✅ Tailwind v4 configured inside CSS with `@import 'tailwindcss'`, `@plugin`, `@source`, and `@theme`
CODEX: - ✅ Shared tokens from `packages/ui/src/styles/tokens.css` and semantic aliases from `semantic.css`
CODEX: - ✅ Plugins enabled: `@tailwindcss/forms` for inputs and `@tailwindcss/typography` for content surfaces
CODEX: - ✅ Content scanning via `@source` globs covering `packages/ui/src/**/*` and app routes/components
CODEX: 
CODEX: ### Outstanding Implementation Tasks
CODEX: - [ ] Inventory each app's `app.css` and delete legacy directives, duplicated tokens, or unused utilities
CODEX: - [ ] Verify `@source` globs cover real Svelte/TS files (routes in `src/routes/**`, libs in `src/lib/**`, shared UI packages)
CODEX: - [ ] Ensure every semantic color/spacing/font referenced in components maps back to a token in `packages/ui`
CODEX: - [ ] Validate custom `@layer components` additions follow 44px touch targets and match UI-UX.md guidance
CODEX: - [ ] Replace any `@apply` usage that duplicates semantic classes with component-level styles or utilities
CODEX: - [ ] Address accessibility warnings in UI components (BottomNav tablist role, PartnerShowcase interactions)
CODEX: - [ ] Clean up unused selectors in HeaderLogo.svelte (.emoji-track span) and PartnerShowcase.svelte (.group button)
CODEX: - [ ] Implement proper interactive element patterns for carousel navigation components
CODEX: 
CODEX: ### Project Validation Commands
CODEX: ```bash
CODEX: # Ensure Tailwind compiles and dead code elimination succeeds
CODEX: pnpm --filter web build
CODEX: 
CODEX: # Confirm PostCSS and CSS modules lint cleanly
CODEX: pnpm --filter web lint -- --max-warnings=0
CODEX: 
CODEX: # Accessibility sweeps with Axe after styling changes
CODEX: pnpm --filter web test:e2e
CODEX: 
CODEX: # Performance audit when altering global styles
CODEX: pnpm performance-audit
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Table of Contents
CODEX: 
CODEX: 1. [Project Architecture](#project-architecture)
CODEX: 2. [Design Token System](#design-token-system)
CODEX: 3. [Component Patterns](#component-patterns)
CODEX: 4. [Layout Systems](#layout-systems)
CODEX: 5. [Advanced Features](#advanced-features)
CODEX: 6. [Performance Optimization](#performance-optimization)
CODEX: 7. [Accessibility Standards](#accessibility-standards)
CODEX: 8. [Dark Mode Implementation](#dark-mode-implementation)
CODEX: 9. [SvelteKit Integration](#sveltekit-integration)
CODEX: 10. [Migration Guide](#migration-guide)
CODEX: 11. [Testing Strategies](#testing-strategies)
CODEX: 12. [Implementation Checklist](#implementation-checklist)
CODEX: 13. [Reference](#reference)
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Project Architecture
CODEX: 
CODEX: ### What's New in Tailwind CSS v4
CODEX: 
CODEX: - **CSS-First Configuration**: No more `tailwind.config.js` - everything in CSS using `@theme`
CODEX: - **Native CSS Variables**: All design tokens available at runtime via CSS custom properties
CODEX: - **10x Faster Builds**: Rust-powered Oxide engine with Lightning CSS integration
CODEX: - **Container Queries**: Built-in responsive containers (no plugin required)
CODEX: - **3D Transforms**: Native perspective and 3D rotation utilities
CODEX: - **OKLCH Colors**: Perceptually uniform color space for better gradients
CODEX: 
CODEX: ### Driplo Project Implementation
CODEX: 
CODEX: Your project already implements the v4 architecture correctly:
CODEX: 
CODEX: ```css
CODEX: /* apps/web/src/app.css - Current Implementation */
CODEX: @import 'tailwindcss';
CODEX: @import '@repo/ui/styles/tokens.css';
CODEX: @import '@repo/ui/styles/semantic.css';
CODEX: @plugin '@tailwindcss/forms';
CODEX: @plugin '@tailwindcss/typography';
CODEX: 
CODEX: @source '../../../packages/ui/src/**/*.{html,js,svelte,ts}';
CODEX: @source './lib/**/*.{svelte,ts}';
CODEX: @source './routes/**/*.{svelte,ts}';
CODEX: ```
CODEX: 
CODEX: ### Implementation Notes
CODEX: - Tailwind v4 no longer uses `tailwind.config.js`; keep overrides directly in CSS or promote shared utilities into `@repo/ui`
CODEX: - Use `@theme` for token remaps (e.g. `--color-primary`) and `@custom-variant` for new stateful selectors
CODEX: - When app-specific tokens diverge from product tokens, capture rationale and tag Design for sign-off
CODEX: - Keep feature flag CSS behind comments documenting the toggle name and removal plan
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Core Architecture
CODEX: 
CODEX: ### CSS-First Configuration
CODEX: 
CODEX: Tailwind v4 moves all configuration into CSS using the `@theme` directive:
CODEX: 
CODEX: ```css
CODEX: @import 'tailwindcss';
CODEX: 
CODEX: @theme {
CODEX:   /* Design tokens become CSS variables automatically */
CODEX:   --color-primary: oklch(0.15 0.015 270);
CODEX:   --spacing-gutter: 1rem;
CODEX:   --font-brand: 'Inter', sans-serif;
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Design Token Hierarchy
CODEX: 
CODEX: ```
CODEX: @theme
CODEX: ├── Core Tokens (raw values)
CODEX: │   ├── --space-* (spacing scale)
CODEX: │   ├── --color-* (color palette)
CODEX: │   ├── --font-* (typography)
CODEX: │   └── --radius-* (border radius)
CODEX: ├── Semantic Tokens (purpose-driven)
CODEX: │   ├── --surface-* (backgrounds)
CODEX: │   ├── --text-* (foreground colors)
CODEX: │   └── --border-* (border colors)
CODEX: └── Component Tokens (specific patterns)
CODEX:     ├── --btn-* (button variations)
CODEX:     ├── --input-* (form elements)
CODEX:     └── --card-* (container styles)
CODEX: ```
CODEX: 
CODEX: ### Build Pipeline
CODEX: 
CODEX: 1. **Content Detection**: Automatic scanning via `@source` directive
CODEX: 2. **CSS Generation**: On-demand utility creation
CODEX: 3. **Optimization**: Dead code elimination and minification
CODEX: 4. **Output**: Single optimized CSS file with embedded custom properties
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Installation & Setup
CODEX: 
CODEX: ### Fresh SvelteKit Project
CODEX: 
CODEX: ```bash
CODEX: npm create svelte@latest my-app
CODEX: cd my-app
CODEX: npm install
CODEX: 
CODEX: # Install Tailwind CSS v4
CODEX: npm install tailwindcss@next
CODEX: npm install @tailwindcss/vite
CODEX: ```
CODEX: 
CODEX: ### Vite Configuration
CODEX: 
CODEX: ```js
CODEX: // vite.config.js
CODEX: import { sveltekit } from '@sveltejs/kit/vite';
CODEX: import tailwindcss from '@tailwindcss/vite';
CODEX: 
CODEX: export default {
CODEX:   plugins: [
CODEX:     sveltekit(),
CODEX:     tailwindcss()
CODEX:   ]
CODEX: };
CODEX: ```
CODEX: 
CODEX: ### CSS Entry Point
CODEX: 
CODEX: ```css
CODEX: /* src/app.css */
CODEX: @import 'tailwindcss';
CODEX: 
CODEX: @source './lib/**/*.{html,svelte,js,ts}';
CODEX: @source './routes/**/*.{html,svelte,js,ts}';
CODEX: 
CODEX: @theme {
CODEX:   /* Your design tokens */
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### SvelteKit App Integration
CODEX: 
CODEX: ```html
CODEX: <!-- src/app.html -->
CODEX: <!DOCTYPE html>
CODEX: <html lang="en" data-theme="light">
CODEX:   <head>
CODEX:     <meta charset="utf-8" />
CODEX:     <meta name="viewport" content="width=device-width, initial-scale=1" />
CODEX:     %sveltekit.head%
CODEX:   </head>
CODEX:   <body>
CODEX:     <div style="display: contents">%sveltekit.body%</div>
CODEX:   </body>
CODEX: </html>
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Design Token System
CODEX: 
CODEX: ### Complete Spacing Scale
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Base 4px grid system */
CODEX:   --space-0: 0;
CODEX:   --space-px: 1px;
CODEX:   --space-0-5: 2px;   /* 0.125rem */
CODEX:   --space-1: 4px;     /* 0.25rem */
CODEX:   --space-1-5: 6px;   /* 0.375rem */
CODEX:   --space-2: 8px;     /* 0.5rem */
CODEX:   --space-2-5: 10px;  /* 0.625rem */
CODEX:   --space-3: 12px;    /* 0.75rem */
CODEX:   --space-3-5: 14px;  /* 0.875rem */
CODEX:   --space-4: 16px;    /* 1rem */
CODEX:   --space-5: 20px;    /* 1.25rem */
CODEX:   --space-6: 24px;    /* 1.5rem */
CODEX:   --space-7: 28px;    /* 1.75rem */
CODEX:   --space-8: 32px;    /* 2rem */
CODEX:   --space-9: 36px;    /* 2.25rem */
CODEX:   --space-10: 40px;   /* 2.5rem */
CODEX:   --space-11: 44px;   /* 2.75rem - Touch target */
CODEX:   --space-12: 48px;   /* 3rem */
CODEX:   --space-14: 56px;   /* 3.5rem */
CODEX:   --space-16: 64px;   /* 4rem */
CODEX:   --space-20: 80px;   /* 5rem */
CODEX:   --space-24: 96px;   /* 6rem */
CODEX:   --space-28: 112px;  /* 7rem */
CODEX:   --space-32: 128px;  /* 8rem */
CODEX:   --space-36: 144px;  /* 9rem */
CODEX:   --space-40: 160px;  /* 10rem */
CODEX:   --space-44: 176px;  /* 11rem */
CODEX:   --space-48: 192px;  /* 12rem */
CODEX:   --space-52: 208px;  /* 13rem */
CODEX:   --space-56: 224px;  /* 14rem */
CODEX:   --space-60: 240px;  /* 15rem */
CODEX:   --space-64: 256px;  /* 16rem */
CODEX:   --space-72: 288px;  /* 18rem */
CODEX:   --space-80: 320px;  /* 20rem */
CODEX:   --space-96: 384px;  /* 24rem */
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Typography System
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Font Families */
CODEX:   --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
CODEX:   --font-serif: 'Georgia', 'Times New Roman', serif;
CODEX:   --font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
CODEX:   --font-display: 'Inter Display', var(--font-sans);
CODEX: 
CODEX:   /* Fluid Typography Scale */
CODEX:   --text-xs: 0.75rem;    /* 12px - Static for UI */
CODEX:   --text-sm: 0.875rem;   /* 14px - Static for UI */
CODEX:   --text-base: 1rem;     /* 16px - Static baseline */
CODEX:   --text-lg: clamp(1.125rem, 1.05rem + 0.6vw, 1.25rem);   /* 18-20px */
CODEX:   --text-xl: clamp(1.25rem, 1.1rem + 1.1vw, 1.5rem);      /* 20-24px */
CODEX:   --text-2xl: clamp(1.5rem, 1.2rem + 2.0vw, 1.875rem);    /* 24-30px */
CODEX:   --text-3xl: clamp(1.875rem, 1.4rem + 2.5vw, 2.25rem);   /* 30-36px */
CODEX:   --text-4xl: clamp(2.25rem, 1.6rem + 3.5vw, 3rem);       /* 36-48px */
CODEX:   --text-5xl: clamp(3rem, 2rem + 5vw, 4rem);               /* 48-64px */
CODEX:   --text-6xl: clamp(4rem, 2.5rem + 7vw, 5rem);             /* 64-80px */
CODEX:   --text-7xl: clamp(5rem, 3rem + 10vw, 6.5rem);            /* 80-104px */
CODEX:   --text-8xl: clamp(6.5rem, 4rem + 12vw, 8rem);            /* 104-128px */
CODEX:   --text-9xl: clamp(8rem, 5rem + 15vw, 10rem);             /* 128-160px */
CODEX: 
CODEX:   /* Font Weights */
CODEX:   --font-thin: 100;
CODEX:   --font-extralight: 200;
CODEX:   --font-light: 300;
CODEX:   --font-normal: 400;
CODEX:   --font-medium: 500;
CODEX:   --font-semibold: 600;
CODEX:   --font-bold: 700;
CODEX:   --font-extrabold: 800;
CODEX:   --font-black: 900;
CODEX: 
CODEX:   /* Line Heights */
CODEX:   --leading-none: 1;
CODEX:   --leading-tight: 1.25;
CODEX:   --leading-snug: 1.375;
CODEX:   --leading-normal: 1.5;
CODEX:   --leading-relaxed: 1.625;
CODEX:   --leading-loose: 2;
CODEX: 
CODEX:   /* Letter Spacing */
CODEX:   --tracking-tighter: -0.05em;
CODEX:   --tracking-tight: -0.025em;
CODEX:   --tracking-normal: 0em;
CODEX:   --tracking-wide: 0.025em;
CODEX:   --tracking-wider: 0.05em;
CODEX:   --tracking-widest: 0.1em;
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Complete Color System (OKLCH)
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Neutral Grays - Warm undertone */
CODEX:   --gray-0: oklch(1 0 0);              /* Pure white */
CODEX:   --gray-50: oklch(0.98 0.005 270);
CODEX:   --gray-100: oklch(0.96 0.005 270);
CODEX:   --gray-200: oklch(0.95 0.005 270);
CODEX:   --gray-300: oklch(0.87 0.01 270);
CODEX:   --gray-400: oklch(0.75 0.015 270);
CODEX:   --gray-500: oklch(0.62 0.02 270);
CODEX:   --gray-600: oklch(0.5 0.025 270);
CODEX:   --gray-700: oklch(0.38 0.025 270);
CODEX:   --gray-800: oklch(0.26 0.02 270);
CODEX:   --gray-900: oklch(0.15 0.015 270);
CODEX:   --gray-950: oklch(0.05 0 0);         /* Near black */
CODEX: 
CODEX:   /* Blue Palette */
CODEX:   --blue-50: oklch(0.97 0.02 240);
CODEX:   --blue-100: oklch(0.94 0.04 240);
CODEX:   --blue-200: oklch(0.88 0.06 240);
CODEX:   --blue-300: oklch(0.78 0.08 240);
CODEX:   --blue-400: oklch(0.68 0.11 240);
CODEX:   --blue-500: oklch(0.58 0.14 240);
CODEX:   --blue-600: oklch(0.48 0.16 240);
CODEX:   --blue-700: oklch(0.38 0.15 240);
CODEX:   --blue-800: oklch(0.28 0.12 240);
CODEX:   --blue-900: oklch(0.18 0.08 240);
CODEX:   --blue-950: oklch(0.12 0.05 240);
CODEX: 
CODEX:   /* Red Palette */
CODEX:   --red-50: oklch(0.97 0.02 0);
CODEX:   --red-100: oklch(0.94 0.04 0);
CODEX:   --red-200: oklch(0.88 0.06 0);
CODEX:   --red-300: oklch(0.78 0.08 0);
CODEX:   --red-400: oklch(0.68 0.11 0);
CODEX:   --red-500: oklch(0.58 0.14 0);
CODEX:   --red-600: oklch(0.48 0.16 0);
CODEX:   --red-700: oklch(0.38 0.15 0);
CODEX:   --red-800: oklch(0.28 0.12 0);
CODEX:   --red-900: oklch(0.18 0.08 0);
CODEX:   --red-950: oklch(0.12 0.05 0);
CODEX: 
CODEX:   /* Green Palette */
CODEX:   --green-50: oklch(0.97 0.02 145);
CODEX:   --green-100: oklch(0.94 0.04 145);
CODEX:   --green-200: oklch(0.88 0.06 145);
CODEX:   --green-300: oklch(0.78 0.08 145);
CODEX:   --green-400: oklch(0.68 0.11 145);
CODEX:   --green-500: oklch(0.58 0.14 145);
CODEX:   --green-600: oklch(0.48 0.16 145);
CODEX:   --green-700: oklch(0.38 0.15 145);
CODEX:   --green-800: oklch(0.28 0.12 145);
CODEX:   --green-900: oklch(0.18 0.08 145);
CODEX:   --green-950: oklch(0.12 0.05 145);
CODEX: 
CODEX:   /* Yellow Palette */
CODEX:   --yellow-50: oklch(0.97 0.02 85);
CODEX:   --yellow-100: oklch(0.94 0.04 85);
CODEX:   --yellow-200: oklch(0.88 0.06 85);
CODEX:   --yellow-300: oklch(0.78 0.08 85);
CODEX:   --yellow-400: oklch(0.68 0.11 85);
CODEX:   --yellow-500: oklch(0.58 0.14 85);
CODEX:   --yellow-600: oklch(0.48 0.16 85);
CODEX:   --yellow-700: oklch(0.38 0.15 85);
CODEX:   --yellow-800: oklch(0.28 0.12 85);
CODEX:   --yellow-900: oklch(0.18 0.08 85);
CODEX:   --yellow-950: oklch(0.12 0.05 85);
CODEX: 
CODEX:   /* Purple Palette */
CODEX:   --purple-50: oklch(0.97 0.02 300);
CODEX:   --purple-100: oklch(0.94 0.04 300);
CODEX:   --purple-200: oklch(0.88 0.06 300);
CODEX:   --purple-300: oklch(0.78 0.08 300);
CODEX:   --purple-400: oklch(0.68 0.11 300);
CODEX:   --purple-500: oklch(0.58 0.14 300);
CODEX:   --purple-600: oklch(0.48 0.16 300);
CODEX:   --purple-700: oklch(0.38 0.15 300);
CODEX:   --purple-800: oklch(0.28 0.12 300);
CODEX:   --purple-900: oklch(0.18 0.08 300);
CODEX:   --purple-950: oklch(0.12 0.05 300);
CODEX: 
CODEX:   /* Orange Palette */
CODEX:   --orange-50: oklch(0.97 0.02 50);
CODEX:   --orange-100: oklch(0.94 0.04 50);
CODEX:   --orange-200: oklch(0.88 0.08 50);
CODEX:   --orange-300: oklch(0.78 0.1 50);
CODEX:   --orange-400: oklch(0.68 0.12 50);
CODEX:   --orange-500: oklch(0.58 0.14 50);
CODEX:   --orange-600: oklch(0.48 0.16 50);
CODEX:   --orange-700: oklch(0.38 0.15 50);
CODEX:   --orange-800: oklch(0.28 0.12 50);
CODEX:   --orange-900: oklch(0.18 0.1 50);
CODEX:   --orange-950: oklch(0.12 0.07 50);
CODEX: 
CODEX:   /* Pink Palette */
CODEX:   --pink-50: oklch(0.97 0.02 350);
CODEX:   --pink-100: oklch(0.94 0.04 350);
CODEX:   --pink-200: oklch(0.88 0.06 350);
CODEX:   --pink-300: oklch(0.78 0.08 350);
CODEX:   --pink-400: oklch(0.68 0.11 350);
CODEX:   --pink-500: oklch(0.58 0.14 350);
CODEX:   --pink-600: oklch(0.48 0.16 350);
CODEX:   --pink-700: oklch(0.38 0.15 350);
CODEX:   --pink-800: oklch(0.28 0.12 350);
CODEX:   --pink-900: oklch(0.18 0.08 350);
CODEX:   --pink-950: oklch(0.12 0.05 350);
CODEX: 
CODEX:   /* Cyan Palette */
CODEX:   --cyan-50: oklch(0.97 0.02 180);
CODEX:   --cyan-100: oklch(0.94 0.04 180);
CODEX:   --cyan-200: oklch(0.88 0.06 180);
CODEX:   --cyan-300: oklch(0.78 0.08 180);
CODEX:   --cyan-400: oklch(0.68 0.11 180);
CODEX:   --cyan-500: oklch(0.58 0.14 180);
CODEX:   --cyan-600: oklch(0.48 0.16 180);
CODEX:   --cyan-700: oklch(0.38 0.15 180);
CODEX:   --cyan-800: oklch(0.28 0.12 180);
CODEX:   --cyan-900: oklch(0.18 0.08 180);
CODEX:   --cyan-950: oklch(0.12 0.05 180);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Semantic Color Mapping
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Surface Colors */
CODEX:   --surface-base: var(--gray-0);
CODEX:   --surface-subtle: var(--gray-50);
CODEX:   --surface-muted: var(--gray-100);
CODEX:   --surface-emphasis: var(--gray-200);
CODEX:   --surface-strong: var(--gray-300);
CODEX:   --surface-inverse: var(--gray-900);
CODEX: 
CODEX:   /* Text Colors */
CODEX:   --text-primary: var(--gray-900);
CODEX:   --text-secondary: var(--gray-700);
CODEX:   --text-tertiary: var(--gray-600);
CODEX:   --text-quaternary: var(--gray-500);
CODEX:   --text-muted: var(--gray-400);
CODEX:   --text-disabled: var(--gray-300);
CODEX:   --text-inverse: var(--gray-0);
CODEX: 
CODEX:   /* Border Colors */
CODEX:   --border-subtle: var(--gray-200);
CODEX:   --border-default: var(--gray-300);
CODEX:   --border-emphasis: var(--gray-400);
CODEX:   --border-strong: var(--gray-500);
CODEX:   --border-inverse: var(--gray-700);
CODEX: 
CODEX:   /* Interactive States */
CODEX:   --interactive-default: var(--blue-500);
CODEX:   --interactive-hover: var(--blue-600);
CODEX:   --interactive-active: var(--blue-700);
CODEX:   --interactive-disabled: var(--gray-300);
CODEX: 
CODEX:   /* Status Colors */
CODEX:   --status-success: var(--green-500);
CODEX:   --status-warning: var(--yellow-500);
CODEX:   --status-error: var(--red-500);
CODEX:   --status-info: var(--blue-500);
CODEX: 
CODEX:   /* Status Backgrounds */
CODEX:   --status-success-bg: var(--green-50);
CODEX:   --status-warning-bg: var(--yellow-50);
CODEX:   --status-error-bg: var(--red-50);
CODEX:   --status-info-bg: var(--blue-50);
CODEX: 
CODEX:   /* Status Text */
CODEX:   --status-success-text: var(--green-700);
CODEX:   --status-warning-text: var(--yellow-700);
CODEX:   --status-error-text: var(--red-700);
CODEX:   --status-info-text: var(--blue-700);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Touch Target & Sizing System
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Touch Targets (Mobile First) */
CODEX:   --touch-xs: 32px;      /* Compact UI elements */
CODEX:   --touch-sm: 36px;      /* Small interactive elements */
CODEX:   --touch-md: 40px;      /* Standard buttons */
CODEX:   --touch-lg: 44px;      /* Primary touch target (Apple HIG) */
CODEX:   --touch-xl: 48px;      /* Large prominent buttons */
CODEX:   --touch-2xl: 56px;     /* Hero/CTA buttons */
CODEX: 
CODEX:   /* Component Heights */
CODEX:   --height-input: var(--touch-lg);
CODEX:   --height-button-sm: var(--touch-sm);
CODEX:   --height-button: var(--touch-md);
CODEX:   --height-button-lg: var(--touch-xl);
CODEX:   --height-nav: 64px;
CODEX:   --height-nav-mobile: 56px;
CODEX:   --height-footer: 400px;
CODEX:   --height-footer-mobile: 300px;
CODEX: 
CODEX:   /* Container Widths */
CODEX:   --container-xs: 20rem;     /* 320px */
CODEX:   --container-sm: 24rem;     /* 384px */
CODEX:   --container-md: 28rem;     /* 448px */
CODEX:   --container-lg: 32rem;     /* 512px */
CODEX:   --container-xl: 36rem;     /* 576px */
CODEX:   --container-2xl: 42rem;    /* 672px */
CODEX:   --container-3xl: 48rem;    /* 768px */
CODEX:   --container-4xl: 56rem;    /* 896px */
CODEX:   --container-5xl: 64rem;    /* 1024px */
CODEX:   --container-6xl: 72rem;    /* 1152px */
CODEX:   --container-7xl: 80rem;    /* 1280px */
CODEX:   --container-full: 100%;
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Border Radius Scale
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   --radius-none: 0;
CODEX:   --radius-xs: 2px;      /* 0.125rem */
CODEX:   --radius-sm: 4px;      /* 0.25rem */
CODEX:   --radius-md: 6px;      /* 0.375rem */
CODEX:   --radius-lg: 8px;      /* 0.5rem */
CODEX:   --radius-xl: 12px;     /* 0.75rem */
CODEX:   --radius-2xl: 16px;    /* 1rem */
CODEX:   --radius-3xl: 24px;    /* 1.5rem */
CODEX:   --radius-full: 9999px; /* Fully rounded */
CODEX: 
CODEX:   /* Component Specific */
CODEX:   --radius-button: var(--radius-md);
CODEX:   --radius-input: var(--radius-md);
CODEX:   --radius-card: var(--radius-lg);
CODEX:   --radius-modal: var(--radius-2xl);
CODEX:   --radius-badge: var(--radius-full);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Shadow System
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Elevation Shadows */
CODEX:   --shadow-xs: 0 1px 2px oklch(0 0 0 / 0.05);
CODEX:   --shadow-sm: 0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.06);
CODEX:   --shadow-md: 0 4px 6px oklch(0 0 0 / 0.07), 0 2px 4px oklch(0 0 0 / 0.06);
CODEX:   --shadow-lg: 0 10px 15px oklch(0 0 0 / 0.1), 0 4px 6px oklch(0 0 0 / 0.05);
CODEX:   --shadow-xl: 0 20px 25px oklch(0 0 0 / 0.1), 0 10px 10px oklch(0 0 0 / 0.04);
CODEX:   --shadow-2xl: 0 25px 50px oklch(0 0 0 / 0.25);
CODEX:   --shadow-inner: inset 0 2px 4px oklch(0 0 0 / 0.06);
CODEX:   --shadow-none: none;
CODEX: 
CODEX:   /* Colored Shadows */
CODEX:   --shadow-blue: 0 10px 15px oklch(0.58 0.14 240 / 0.2);
CODEX:   --shadow-green: 0 10px 15px oklch(0.58 0.14 145 / 0.2);
CODEX:   --shadow-red: 0 10px 15px oklch(0.58 0.14 0 / 0.2);
CODEX:   --shadow-yellow: 0 10px 15px oklch(0.58 0.14 85 / 0.2);
CODEX: 
CODEX:   /* Component Shadows */
CODEX:   --shadow-card: var(--shadow-sm);
CODEX:   --shadow-card-hover: var(--shadow-lg);
CODEX:   --shadow-modal: var(--shadow-2xl);
CODEX:   --shadow-dropdown: var(--shadow-lg);
CODEX:   --shadow-nav: var(--shadow-sm);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Animation & Transition System
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Duration Scale */
CODEX:   --duration-75: 75ms;
CODEX:   --duration-100: 100ms;
CODEX:   --duration-150: 150ms;
CODEX:   --duration-200: 200ms;
CODEX:   --duration-300: 300ms;
CODEX:   --duration-500: 500ms;
CODEX:   --duration-700: 700ms;
CODEX:   --duration-1000: 1000ms;
CODEX: 
CODEX:   /* Easing Functions */
CODEX:   --ease-linear: linear;
CODEX:   --ease-in: cubic-bezier(0.4, 0, 1, 1);
CODEX:   --ease-out: cubic-bezier(0, 0, 0.2, 1);
CODEX:   --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
CODEX:   --ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);
CODEX:   --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
CODEX: 
CODEX:   /* Semantic Transitions */
CODEX:   --transition-colors: color var(--duration-150) var(--ease-out),
CODEX:                        background-color var(--duration-150) var(--ease-out),
CODEX:                        border-color var(--duration-150) var(--ease-out);
CODEX: 
CODEX:   --transition-opacity: opacity var(--duration-150) var(--ease-out);
CODEX:   --transition-shadow: box-shadow var(--duration-150) var(--ease-out);
CODEX:   --transition-transform: transform var(--duration-150) var(--ease-out);
CODEX: 
CODEX:   --transition-all: all var(--duration-150) var(--ease-out);
CODEX:   --transition-all-300: all var(--duration-300) var(--ease-out);
CODEX: 
CODEX:   /* Animation Delays */
CODEX:   --delay-75: 75ms;
CODEX:   --delay-100: 100ms;
CODEX:   --delay-150: 150ms;
CODEX:   --delay-200: 200ms;
CODEX:   --delay-300: 300ms;
CODEX:   --delay-500: 500ms;
CODEX:   --delay-700: 700ms;
CODEX:   --delay-1000: 1000ms;
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Z-Index Scale
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   --z-0: 0;
CODEX:   --z-10: 10;
CODEX:   --z-20: 20;
CODEX:   --z-30: 30;
CODEX:   --z-40: 40;      /* Fixed headers */
CODEX:   --z-50: 50;      /* Modals, dialogs */
CODEX:   --z-60: 60;      /* Tooltips */
CODEX:   --z-70: 70;      /* Notifications */
CODEX:   --z-80: 80;      /* Loading overlays */
CODEX:   --z-90: 90;      /* Dev tools */
CODEX:   --z-100: 100;    /* Maximum application layer */
CODEX:   --z-max: 2147483647; /* CSS max value */
CODEX: 
CODEX:   /* Semantic Z-Index */
CODEX:   --z-header: var(--z-40);
CODEX:   --z-modal: var(--z-50);
CODEX:   --z-tooltip: var(--z-60);
CODEX:   --z-toast: var(--z-70);
CODEX:   --z-loading: var(--z-80);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Component Patterns
CODEX: 
CODEX: ### Button System
CODEX: 
CODEX: ```css
CODEX: /* Button Base Class */
CODEX: .btn {
CODEX:   @apply inline-flex items-center justify-center;
CODEX:   @apply font-medium text-sm leading-tight;
CODEX:   @apply border border-transparent rounded-[var(--radius-button)];
CODEX:   @apply transition-all duration-150 ease-out;
CODEX:   @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
CODEX:   @apply disabled:opacity-50 disabled:cursor-not-allowed;
CODEX:   @apply select-none touch-manipulation;
CODEX: 
CODEX:   /* Minimum touch target */
CODEX:   min-height: var(--touch-md);
CODEX:   padding: 0 var(--space-4);
CODEX: }
CODEX: 
CODEX: /* Button Sizes */
CODEX: .btn-xs {
CODEX:   @apply text-xs px-2 py-1;
CODEX:   min-height: var(--touch-xs);
CODEX: }
CODEX: 
CODEX: .btn-sm {
CODEX:   @apply text-sm px-3 py-1.5;
CODEX:   min-height: var(--touch-sm);
CODEX: }
CODEX: 
CODEX: .btn-md {
CODEX:   @apply text-sm px-4 py-2;
CODEX:   min-height: var(--touch-md);
CODEX: }
CODEX: 
CODEX: .btn-lg {
CODEX:   @apply text-base px-6 py-2.5;
CODEX:   min-height: var(--touch-lg);
CODEX: }
CODEX: 
CODEX: .btn-xl {
CODEX:   @apply text-lg px-8 py-3;
CODEX:   min-height: var(--touch-xl);
CODEX: }
CODEX: 
CODEX: .btn-2xl {
CODEX:   @apply text-xl px-10 py-4;
CODEX:   min-height: var(--touch-2xl);
CODEX: }
CODEX: 
CODEX: /* Button Variants */
CODEX: .btn-primary {
CODEX:   @apply bg-blue-500 text-white border-blue-500;
CODEX:   @apply hover:bg-blue-600 hover:border-blue-600;
CODEX:   @apply active:bg-blue-700 active:border-blue-700;
CODEX:   @apply focus:ring-blue-500;
CODEX: }
CODEX: 
CODEX: .btn-secondary {
CODEX:   @apply bg-gray-100 text-gray-900 border-gray-300;
CODEX:   @apply hover:bg-gray-200 hover:border-gray-400;
CODEX:   @apply active:bg-gray-300 active:border-gray-500;
CODEX:   @apply focus:ring-gray-500;
CODEX: }
CODEX: 
CODEX: .btn-success {
CODEX:   @apply bg-green-500 text-white border-green-500;
CODEX:   @apply hover:bg-green-600 hover:border-green-600;
CODEX:   @apply active:bg-green-700 active:border-green-700;
CODEX:   @apply focus:ring-green-500;
CODEX: }
CODEX: 
CODEX: .btn-warning {
CODEX:   @apply bg-yellow-500 text-white border-yellow-500;
CODEX:   @apply hover:bg-yellow-600 hover:border-yellow-600;
CODEX:   @apply active:bg-yellow-700 active:border-yellow-700;
CODEX:   @apply focus:ring-yellow-500;
CODEX: }
CODEX: 
CODEX: .btn-danger {
CODEX:   @apply bg-red-500 text-white border-red-500;
CODEX:   @apply hover:bg-red-600 hover:border-red-600;
CODEX:   @apply active:bg-red-700 active:border-red-700;
CODEX:   @apply focus:ring-red-500;
CODEX: }
CODEX: 
CODEX: .btn-outline {
CODEX:   @apply bg-transparent text-gray-700 border-gray-300;
CODEX:   @apply hover:bg-gray-50 hover:border-gray-400;
CODEX:   @apply active:bg-gray-100 active:border-gray-500;
CODEX:   @apply focus:ring-gray-500;
CODEX: }
CODEX: 
CODEX: .btn-ghost {
CODEX:   @apply bg-transparent text-gray-700 border-transparent;
CODEX:   @apply hover:bg-gray-100;
CODEX:   @apply active:bg-gray-200;
CODEX:   @apply focus:ring-gray-500;
CODEX: }
CODEX: 
CODEX: .btn-link {
CODEX:   @apply bg-transparent text-blue-600 border-transparent underline;
CODEX:   @apply hover:text-blue-700;
CODEX:   @apply active:text-blue-800;
CODEX:   @apply focus:ring-blue-500;
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Button Usage Examples (Svelte)
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   interface Props {
CODEX:     variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'link';
CODEX:     size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
CODEX:     disabled?: boolean;
CODEX:     loading?: boolean;
CODEX:     type?: 'button' | 'submit' | 'reset';
CODEX:     onclick?: () => void;
CODEX:     children?: Snippet;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     variant = 'primary',
CODEX:     size = 'md',
CODEX:     disabled = false,
CODEX:     loading = false,
CODEX:     type = 'button',
CODEX:     onclick,
CODEX:     children
CODEX:   }: Props = $props();
CODEX: 
CODEX:   const buttonClass = $derived(`btn btn-${variant} btn-${size}`);
CODEX: </script>
CODEX: 
CODEX: <button
CODEX:   class={buttonClass}
CODEX:   {type}
CODEX:   {disabled}
CODEX:   onclick={onclick}
CODEX:   aria-busy={loading}
CODEX: >
CODEX:   {#if loading}
CODEX:     <svg class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
CODEX:       <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
CODEX:       <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
CODEX:     </svg>
CODEX:     Loading...
CODEX:   {:else}
CODEX:     {@render children?.()}
CODEX:   {/if}
CODEX: </button>
CODEX: 
CODEX: <!-- Usage Examples -->
CODEX: <Button variant="primary" size="lg" onclick={() => console.log('Clicked')}>
CODEX:   Primary Action
CODEX: </Button>
CODEX: 
CODEX: <Button variant="secondary" loading>
CODEX:   Processing...
CODEX: </Button>
CODEX: 
CODEX: <Button variant="outline" disabled>
CODEX:   Disabled Button
CODEX: </Button>
CODEX: ```
CODEX: 
CODEX: ### Input System
CODEX: 
CODEX: ```css
CODEX: /* Input Base Class */
CODEX: .input {
CODEX:   @apply w-full px-3 py-2;
CODEX:   @apply text-base leading-normal;
CODEX:   @apply bg-white border border-gray-300 rounded-[var(--radius-input)];
CODEX:   @apply transition-colors duration-150 ease-out;
CODEX:   @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
CODEX:   @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100;
CODEX:   @apply placeholder:text-gray-400;
CODEX: 
CODEX:   min-height: var(--touch-lg);
CODEX:   font-size: 16px; /* Prevent iOS zoom */
CODEX: }
CODEX: 
CODEX: /* Input Sizes */
CODEX: .input-xs {
CODEX:   @apply text-xs px-2 py-1;
CODEX:   min-height: var(--touch-xs);
CODEX: }
CODEX: 
CODEX: .input-sm {
CODEX:   @apply text-sm px-2.5 py-1.5;
CODEX:   min-height: var(--touch-sm);
CODEX: }
CODEX: 
CODEX: .input-md {
CODEX:   @apply text-base px-3 py-2;
CODEX:   min-height: var(--touch-md);
CODEX: }
CODEX: 
CODEX: .input-lg {
CODEX:   @apply text-lg px-4 py-3;
CODEX:   min-height: var(--touch-xl);
CODEX: }
CODEX: 
CODEX: .input-xl {
CODEX:   @apply text-xl px-5 py-4;
CODEX:   min-height: var(--touch-2xl);
CODEX: }
CODEX: 
CODEX: /* Input States */
CODEX: .input-error {
CODEX:   @apply border-red-300 focus:ring-red-500 focus:border-red-500;
CODEX: }
CODEX: 
CODEX: .input-success {
CODEX:   @apply border-green-300 focus:ring-green-500 focus:border-green-500;
CODEX: }
CODEX: 
CODEX: .input-warning {
CODEX:   @apply border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500;
CODEX: }
CODEX: 
CODEX: /* Input Variants */
CODEX: .input-borderless {
CODEX:   @apply border-transparent bg-gray-100 focus:bg-white focus:ring-1;
CODEX: }
CODEX: 
CODEX: .input-underline {
CODEX:   @apply border-0 border-b-2 border-gray-300 rounded-none bg-transparent;
CODEX:   @apply focus:ring-0 focus:border-blue-500;
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Input Component (Svelte)
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   interface Props {
CODEX:     type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
CODEX:     value?: string;
CODEX:     placeholder?: string;
CODEX:     label?: string;
CODEX:     error?: string;
CODEX:     success?: string;
CODEX:     warning?: string;
CODEX:     disabled?: boolean;
CODEX:     required?: boolean;
CODEX:     size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
CODEX:     variant?: 'default' | 'borderless' | 'underline';
CODEX:     id?: string;
CODEX:     name?: string;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     type = 'text',
CODEX:     value = $bindable(''),
CODEX:     placeholder,
CODEX:     label,
CODEX:     error,
CODEX:     success,
CODEX:     warning,
CODEX:     disabled = false,
CODEX:     required = false,
CODEX:     size = 'md',
CODEX:     variant = 'default',
CODEX:     id,
CODEX:     name
CODEX:   }: Props = $props();
CODEX: 
CODEX:   const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`;
CODEX: 
CODEX:   const inputClass = $derived(() => {
CODEX:     const baseClass = `input input-${size}`;
CODEX:     const variantClass = variant !== 'default' ? `input-${variant}` : '';
CODEX:     const stateClass = error ? 'input-error' :
CODEX:                       success ? 'input-success' :
CODEX:                       warning ? 'input-warning' : '';
CODEX:     return `${baseClass} ${variantClass} ${stateClass}`.trim();
CODEX:   });
CODEX: 
CODEX:   const messageClass = $derived(() => {
CODEX:     if (error) return 'text-red-600';
CODEX:     if (success) return 'text-green-600';
CODEX:     if (warning) return 'text-yellow-600';
CODEX:     return 'text-gray-600';
CODEX:   });
CODEX: </script>
CODEX: 
CODEX: <div class="space-y-1">
CODEX:   {#if label}
CODEX:     <label for={inputId} class="block text-sm font-medium text-gray-700">
CODEX:       {label}
CODEX:       {#if required}
CODEX:         <span class="text-red-500">*</span>
CODEX:       {/if}
CODEX:     </label>
CODEX:   {/if}
CODEX: 
CODEX:   <input
CODEX:     {type}
CODEX:     bind:value
CODEX:     {placeholder}
CODEX:     {disabled}
CODEX:     {required}
CODEX:     {name}
CODEX:     id={inputId}
CODEX:     class={inputClass}
CODEX:     aria-invalid={!!error}
CODEX:     aria-describedby={error || success || warning ? `${inputId}-message` : undefined}
CODEX:   />
CODEX: 
CODEX:   {#if error || success || warning}
CODEX:     <p id="{inputId}-message" class="text-xs {messageClass}">
CODEX:       {error || success || warning}
CODEX:     </p>
CODEX:   {/if}
CODEX: </div>
CODEX: 
CODEX: <!-- Usage Examples -->
CODEX: <Input
CODEX:   label="Email Address"
CODEX:   type="email"
CODEX:   bind:value={email}
CODEX:   placeholder="you@example.com"
CODEX:   required
CODEX: />
CODEX: 
CODEX: <Input
CODEX:   label="Password"
CODEX:   type="password"
CODEX:   bind:value={password}
CODEX:   error="Password must be at least 8 characters"
CODEX:   size="lg"
CODEX: />
CODEX: 
CODEX: <Input
CODEX:   placeholder="Search..."
CODEX:   variant="borderless"
CODEX:   success="Valid input"
CODEX: />
CODEX: ```
CODEX: 
CODEX: ### Card System
CODEX: 
CODEX: ```css
CODEX: /* Card Base Class */
CODEX: .card {
CODEX:   @apply bg-white border border-gray-200 rounded-[var(--radius-card)];
CODEX:   @apply shadow-[var(--shadow-card)];
CODEX:   @apply overflow-hidden;
CODEX: }
CODEX: 
CODEX: /* Card Sizes */
CODEX: .card-xs {
CODEX:   @apply p-3;
CODEX: }
CODEX: 
CODEX: .card-sm {
CODEX:   @apply p-4;
CODEX: }
CODEX: 
CODEX: .card-md {
CODEX:   @apply p-6;
CODEX: }
CODEX: 
CODEX: .card-lg {
CODEX:   @apply p-8;
CODEX: }
CODEX: 
CODEX: .card-xl {
CODEX:   @apply p-12;
CODEX: }
CODEX: 
CODEX: /* Card Variants */
CODEX: .card-elevated {
CODEX:   @apply shadow-[var(--shadow-lg)];
CODEX: }
CODEX: 
CODEX: .card-flat {
CODEX:   @apply shadow-none border-2;
CODEX: }
CODEX: 
CODEX: .card-outline {
CODEX:   @apply bg-transparent border-2;
CODEX: }
CODEX: 
CODEX: .card-ghost {
CODEX:   @apply bg-transparent border-0 shadow-none;
CODEX: }
CODEX: 
CODEX: /* Card Interactive States */
CODEX: .card-hover {
CODEX:   @apply transition-all duration-200 ease-out;
CODEX:   @apply hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5;
CODEX:   @apply hover:border-gray-300;
CODEX: }
CODEX: 
CODEX: .card-clickable {
CODEX:   @apply cursor-pointer transition-all duration-150 ease-out;
CODEX:   @apply hover:shadow-md hover:border-gray-300;
CODEX:   @apply active:scale-[0.98] active:shadow-sm;
CODEX: }
CODEX: 
CODEX: /* Card Components */
CODEX: .card-header {
CODEX:   @apply px-6 py-4 border-b border-gray-200;
CODEX: }
CODEX: 
CODEX: .card-body {
CODEX:   @apply px-6 py-4;
CODEX: }
CODEX: 
CODEX: .card-footer {
CODEX:   @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
CODEX: }
CODEX: 
CODEX: .card-title {
CODEX:   @apply text-lg font-semibold text-gray-900;
CODEX: }
CODEX: 
CODEX: .card-subtitle {
CODEX:   @apply text-sm font-medium text-gray-600 mt-1;
CODEX: }
CODEX: 
CODEX: .card-description {
CODEX:   @apply text-sm text-gray-600 mt-2;
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Card Component (Svelte)
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   import type { Snippet } from 'svelte';
CODEX: 
CODEX:   interface Props {
CODEX:     variant?: 'default' | 'elevated' | 'flat' | 'outline' | 'ghost';
CODEX:     size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
CODEX:     interactive?: boolean;
CODEX:     clickable?: boolean;
CODEX:     onclick?: () => void;
CODEX:     class?: string;
CODEX: 
CODEX:     // Slots
CODEX:     header?: Snippet;
CODEX:     children: Snippet;
CODEX:     footer?: Snippet;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     variant = 'default',
CODEX:     size = 'md',
CODEX:     interactive = false,
CODEX:     clickable = false,
CODEX:     onclick,
CODEX:     class: className = '',
CODEX:     header,
CODEX:     children,
CODEX:     footer
CODEX:   }: Props = $props();
CODEX: 
CODEX:   const cardClass = $derived(() => {
CODEX:     const baseClass = `card card-${size}`;
CODEX:     const variantClass = variant !== 'default' ? `card-${variant}` : '';
CODEX:     const interactiveClass = interactive ? 'card-hover' : '';
CODEX:     const clickableClass = clickable ? 'card-clickable' : '';
CODEX:     return `${baseClass} ${variantClass} ${interactiveClass} ${clickableClass} ${className}`.trim();
CODEX:   });
CODEX: </script>
CODEX: 
CODEX: {#if clickable && onclick}
CODEX:   <button class={cardClass} onclick={onclick}>
CODEX:     {#if header}
CODEX:       <div class="card-header">
CODEX:         {@render header()}
CODEX:       </div>
CODEX:     {/if}
CODEX: 
CODEX:     <div class="card-body">
CODEX:       {@render children()}
CODEX:     </div>
CODEX: 
CODEX:     {#if footer}
CODEX:       <div class="card-footer">
CODEX:         {@render footer()}
CODEX:       </div>
CODEX:     {/if}
CODEX:   </button>
CODEX: {:else}
CODEX:   <div class={cardClass}>
CODEX:     {#if header}
CODEX:       <div class="card-header">
CODEX:         {@render header()}
CODEX:       </div>
CODEX:     {/if}
CODEX: 
CODEX:     <div class="card-body">
CODEX:       {@render children()}
CODEX:     </div>
CODEX: 
CODEX:     {#if footer}
CODEX:       <div class="card-footer">
CODEX:         {@render footer()}
CODEX:       </div>
CODEX:     {/if}
CODEX:   </div>
CODEX: {/if}
CODEX: 
CODEX: <!-- Usage Examples -->
CODEX: <Card variant="elevated" size="lg" interactive>
CODEX:   {#snippet header()}
CODEX:     <h3 class="card-title">Product Features</h3>
CODEX:     <p class="card-subtitle">Everything you need to know</p>
CODEX:   {/snippet}
CODEX: 
CODEX:   <p class="card-description">
CODEX:     This product includes advanced features for modern workflows.
CODEX:   </p>
CODEX: 
CODEX:   {#snippet footer()}
CODEX:     <Button variant="primary">Learn More</Button>
CODEX:   {/snippet}
CODEX: </Card>
CODEX: 
CODEX: <Card clickable onclick={() => navigate('/product/123')}>
CODEX:   <div class="flex items-center space-x-4">
CODEX:     <img src="product.jpg" alt="Product" class="w-16 h-16 rounded-lg" />
CODEX:     <div>
CODEX:       <h4 class="font-semibold">Product Name</h4>
CODEX:       <p class="text-gray-600">$299.99</p>
CODEX:     </div>
CODEX:   </div>
CODEX: </Card>
CODEX: ```
CODEX: 
CODEX: ### Badge System
CODEX: 
CODEX: ```css
CODEX: /* Badge Base Class */
CODEX: .badge {
CODEX:   @apply inline-flex items-center;
CODEX:   @apply px-2 py-0.5 text-xs font-medium;
CODEX:   @apply rounded-[var(--radius-badge)];
CODEX:   @apply border;
CODEX: }
CODEX: 
CODEX: /* Badge Sizes */
CODEX: .badge-xs {
CODEX:   @apply px-1.5 py-0.5 text-xs;
CODEX: }
CODEX: 
CODEX: .badge-sm {
CODEX:   @apply px-2 py-0.5 text-xs;
CODEX: }
CODEX: 
CODEX: .badge-md {
CODEX:   @apply px-2.5 py-1 text-sm;
CODEX: }
CODEX: 
CODEX: .badge-lg {
CODEX:   @apply px-3 py-1.5 text-sm;
CODEX: }
CODEX: 
CODEX: .badge-xl {
CODEX:   @apply px-4 py-2 text-base;
CODEX: }
CODEX: 
CODEX: /* Badge Variants */
CODEX: .badge-primary {
CODEX:   @apply bg-blue-100 text-blue-800 border-blue-200;
CODEX: }
CODEX: 
CODEX: .badge-secondary {
CODEX:   @apply bg-gray-100 text-gray-800 border-gray-200;
CODEX: }
CODEX: 
CODEX: .badge-success {
CODEX:   @apply bg-green-100 text-green-800 border-green-200;
CODEX: }
CODEX: 
CODEX: .badge-warning {
CODEX:   @apply bg-yellow-100 text-yellow-800 border-yellow-200;
CODEX: }
CODEX: 
CODEX: .badge-danger {
CODEX:   @apply bg-red-100 text-red-800 border-red-200;
CODEX: }
CODEX: 
CODEX: .badge-info {
CODEX:   @apply bg-cyan-100 text-cyan-800 border-cyan-200;
CODEX: }
CODEX: 
CODEX: /* Badge Styles */
CODEX: .badge-solid-primary {
CODEX:   @apply bg-blue-500 text-white border-blue-500;
CODEX: }
CODEX: 
CODEX: .badge-solid-secondary {
CODEX:   @apply bg-gray-500 text-white border-gray-500;
CODEX: }
CODEX: 
CODEX: .badge-solid-success {
CODEX:   @apply bg-green-500 text-white border-green-500;
CODEX: }
CODEX: 
CODEX: .badge-solid-warning {
CODEX:   @apply bg-yellow-500 text-white border-yellow-500;
CODEX: }
CODEX: 
CODEX: .badge-solid-danger {
CODEX:   @apply bg-red-500 text-white border-red-500;
CODEX: }
CODEX: 
CODEX: .badge-solid-info {
CODEX:   @apply bg-cyan-500 text-white border-cyan-500;
CODEX: }
CODEX: 
CODEX: .badge-outline {
CODEX:   @apply bg-transparent border-2;
CODEX: }
CODEX: 
CODEX: .badge-pill {
CODEX:   @apply rounded-full;
CODEX: }
CODEX: 
CODEX: .badge-square {
CODEX:   @apply rounded-none;
CODEX: }
CODEX: 
CODEX: .badge-dot {
CODEX:   @apply p-0 w-2 h-2 rounded-full;
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Badge Component (Svelte)
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   import type { Snippet } from 'svelte';
CODEX: 
CODEX:   interface Props {
CODEX:     variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
CODEX:     style?: 'soft' | 'solid' | 'outline';
CODEX:     size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
CODEX:     shape?: 'rounded' | 'pill' | 'square';
CODEX:     dot?: boolean;
CODEX:     removable?: boolean;
CODEX:     onremove?: () => void;
CODEX:     class?: string;
CODEX:     children: Snippet;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     variant = 'secondary',
CODEX:     style = 'soft',
CODEX:     size = 'sm',
CODEX:     shape = 'rounded',
CODEX:     dot = false,
CODEX:     removable = false,
CODEX:     onremove,
CODEX:     class: className = '',
CODEX:     children
CODEX:   }: Props = $props();
CODEX: 
CODEX:   const badgeClass = $derived(() => {
CODEX:     const baseClass = 'badge';
CODEX:     const sizeClass = `badge-${size}`;
CODEX:     const variantClass = style === 'solid'
CODEX:       ? `badge-solid-${variant}`
CODEX:       : style === 'outline'
CODEX:         ? `badge-${variant} badge-outline`
CODEX:         : `badge-${variant}`;
CODEX:     const shapeClass = shape !== 'rounded' ? `badge-${shape}` : '';
CODEX:     const dotClass = dot ? 'badge-dot' : '';
CODEX: 
CODEX:     return `${baseClass} ${sizeClass} ${variantClass} ${shapeClass} ${dotClass} ${className}`.trim();
CODEX:   });
CODEX: </script>
CODEX: 
CODEX: <span class={badgeClass}>
CODEX:   {#if !dot}
CODEX:     {@render children()}
CODEX:     {#if removable && onremove}
CODEX:       <button
CODEX:         type="button"
CODEX:         onclick={onremove}
CODEX:         class="ml-1 -mr-0.5 h-3 w-3 rounded-full inline-flex items-center justify-center hover:bg-black/10"
CODEX:       >
CODEX:         <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
CODEX:           <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
CODEX:         </svg>
CODEX:       </button>
CODEX:     {/if}
CODEX:   {/if}
CODEX: </span>
CODEX: 
CODEX: <!-- Usage Examples -->
CODEX: <Badge variant="primary" size="md">New</Badge>
CODEX: <Badge variant="success" style="solid">Active</Badge>
CODEX: <Badge variant="warning" shape="pill" removable onremove={() => console.log('Removed')}>
CODEX:   Beta Feature
CODEX: </Badge>
CODEX: <Badge dot variant="danger" />
CODEX: ```
CODEX: 
CODEX: ### Modal/Dialog System
CODEX: 
CODEX: ```css
CODEX: /* Modal Overlay */
CODEX: .modal-overlay {
CODEX:   @apply fixed inset-0 bg-black/50 backdrop-blur-sm z-[var(--z-modal)];
CODEX:   @apply flex items-center justify-center p-4;
CODEX: }
CODEX: 
CODEX: /* Modal Container */
CODEX: .modal {
CODEX:   @apply bg-white rounded-[var(--radius-modal)] shadow-[var(--shadow-modal)];
CODEX:   @apply max-w-md w-full max-h-[90vh] overflow-hidden;
CODEX:   @apply animate-in fade-in-0 zoom-in-95 duration-200;
CODEX: }
CODEX: 
CODEX: /* Modal Sizes */
CODEX: .modal-xs {
CODEX:   @apply max-w-xs;
CODEX: }
CODEX: 
CODEX: .modal-sm {
CODEX:   @apply max-w-sm;
CODEX: }
CODEX: 
CODEX: .modal-md {
CODEX:   @apply max-w-md;
CODEX: }
CODEX: 
CODEX: .modal-lg {
CODEX:   @apply max-w-lg;
CODEX: }
CODEX: 
CODEX: .modal-xl {
CODEX:   @apply max-w-xl;
CODEX: }
CODEX: 
CODEX: .modal-2xl {
CODEX:   @apply max-w-2xl;
CODEX: }
CODEX: 
CODEX: .modal-3xl {
CODEX:   @apply max-w-3xl;
CODEX: }
CODEX: 
CODEX: .modal-4xl {
CODEX:   @apply max-w-4xl;
CODEX: }
CODEX: 
CODEX: .modal-full {
CODEX:   @apply max-w-none w-full h-full m-0 rounded-none;
CODEX: }
CODEX: 
CODEX: /* Modal Components */
CODEX: .modal-header {
CODEX:   @apply px-6 py-4 border-b border-gray-200;
CODEX:   @apply flex items-center justify-between;
CODEX: }
CODEX: 
CODEX: .modal-title {
CODEX:   @apply text-lg font-semibold text-gray-900;
CODEX: }
CODEX: 
CODEX: .modal-close {
CODEX:   @apply p-1 rounded-md text-gray-400 hover:text-gray-600;
CODEX:   @apply hover:bg-gray-100 transition-colors duration-150;
CODEX: }
CODEX: 
CODEX: .modal-body {
CODEX:   @apply px-6 py-4 overflow-y-auto;
CODEX: }
CODEX: 
CODEX: .modal-footer {
CODEX:   @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
CODEX:   @apply flex items-center justify-end space-x-2;
CODEX: }
CODEX: 
CODEX: /* Drawer Variants */
CODEX: .modal-drawer-right {
CODEX:   @apply fixed right-0 top-0 h-full max-w-sm w-full max-h-none m-0 rounded-none;
CODEX:   @apply animate-in slide-in-from-right duration-300;
CODEX: }
CODEX: 
CODEX: .modal-drawer-left {
CODEX:   @apply fixed left-0 top-0 h-full max-w-sm w-full max-h-none m-0 rounded-none;
CODEX:   @apply animate-in slide-in-from-left duration-300;
CODEX: }
CODEX: 
CODEX: .modal-drawer-bottom {
CODEX:   @apply fixed bottom-0 left-0 right-0 max-w-none w-full max-h-[90vh] m-0;
CODEX:   @apply rounded-t-[var(--radius-modal)] rounded-b-none;
CODEX:   @apply animate-in slide-in-from-bottom duration-300;
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Modal Component (Svelte)
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   import type { Snippet } from 'svelte';
CODEX:   import { createEventDispatcher } from 'svelte';
CODEX: 
CODEX:   interface Props {
CODEX:     open?: boolean;
CODEX:     size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
CODEX:     variant?: 'center' | 'drawer-right' | 'drawer-left' | 'drawer-bottom';
CODEX:     closable?: boolean;
CODEX:     backdrop?: boolean;
CODEX:     title?: string;
CODEX: 
CODEX:     // Slots
CODEX:     header?: Snippet;
CODEX:     children: Snippet;
CODEX:     footer?: Snippet;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     open = $bindable(false),
CODEX:     size = 'md',
CODEX:     variant = 'center',
CODEX:     closable = true,
CODEX:     backdrop = true,
CODEX:     title,
CODEX:     header,
CODEX:     children,
CODEX:     footer
CODEX:   }: Props = $props();
CODEX: 
CODEX:   const dispatch = createEventDispatcher();
CODEX: 
CODEX:   function handleClose() {
CODEX:     if (closable) {
CODEX:       open = false;
CODEX:       dispatch('close');
CODEX:     }
CODEX:   }
CODEX: 
CODEX:   function handleBackdropClick(event: MouseEvent) {
CODEX:     if (backdrop && event.target === event.currentTarget) {
CODEX:       handleClose();
CODEX:     }
CODEX:   }
CODEX: 
CODEX:   function handleKeydown(event: KeyboardEvent) {
CODEX:     if (event.key === 'Escape' && closable) {
CODEX:       handleClose();
CODEX:     }
CODEX:   }
CODEX: 
CODEX:   const modalClass = $derived(() => {
CODEX:     const baseClass = 'modal';
CODEX:     const sizeClass = `modal-${size}`;
CODEX:     const variantClass = variant !== 'center' ? `modal-${variant}` : '';
CODEX:     return `${baseClass} ${sizeClass} ${variantClass}`.trim();
CODEX:   });
CODEX: </script>
CODEX: 
CODEX: {#if open}
CODEX:   <div
CODEX:     class="modal-overlay"
CODEX:     onclick={handleBackdropClick}
CODEX:     onkeydown={handleKeydown}
CODEX:     role="dialog"
CODEX:     aria-modal="true"
CODEX:     tabindex="-1"
CODEX:   >
CODEX:     <div class={modalClass}>
CODEX:       {#if header || title || closable}
CODEX:         <div class="modal-header">
CODEX:           {#if header}
CODEX:             {@render header()}
CODEX:           {:else if title}
CODEX:             <h2 class="modal-title">{title}</h2>
CODEX:           {/if}
CODEX: 
CODEX:           {#if closable}
CODEX:             <button type="button" class="modal-close" onclick={handleClose}>
CODEX:               <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
CODEX:                 <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
CODEX:               </svg>
CODEX:             </button>
CODEX:           {/if}
CODEX:         </div>
CODEX:       {/if}
CODEX: 
CODEX:       <div class="modal-body">
CODEX:         {@render children()}
CODEX:       </div>
CODEX: 
CODEX:       {#if footer}
CODEX:         <div class="modal-footer">
CODEX:           {@render footer()}
CODEX:         </div>
CODEX:       {/if}
CODEX:     </div>
CODEX:   </div>
CODEX: {/if}
CODEX: 
CODEX: <!-- Usage Examples -->
CODEX: <Modal bind:open={showModal} title="Confirm Action" size="lg">
CODEX:   <p>Are you sure you want to delete this item?</p>
CODEX: 
CODEX:   {#snippet footer()}
CODEX:     <Button variant="secondary" onclick={() => showModal = false}>Cancel</Button>
CODEX:     <Button variant="danger" onclick={handleDelete}>Delete</Button>
CODEX:   {/snippet}
CODEX: </Modal>
CODEX: 
CODEX: <Modal bind:open={showDrawer} variant="drawer-right" size="md">
CODEX:   {#snippet header()}
CODEX:     <h2 class="text-lg font-semibold">Settings</h2>
CODEX:   {/snippet}
CODEX: 
CODEX:   <div class="space-y-4">
CODEX:     <!-- Settings content -->
CODEX:   </div>
CODEX: </Modal>
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Layout Systems
CODEX: 
CODEX: ### Container Queries
CODEX: 
CODEX: Tailwind v4 includes built-in container query support:
CODEX: 
CODEX: ```css
CODEX: /* Container Query Utilities */
CODEX: @container (min-width: 320px) {
CODEX:   .card { @apply p-4; }
CODEX: }
CODEX: 
CODEX: @container (min-width: 640px) {
CODEX:   .card { @apply p-6; }
CODEX: }
CODEX: 
CODEX: @container (min-width: 1024px) {
CODEX:   .card { @apply p-8; }
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Container Query Component (Svelte)
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   import type { Snippet } from 'svelte';
CODEX: 
CODEX:   interface Props {
CODEX:     type?: 'inline-size' | 'size';
CODEX:     class?: string;
CODEX:     children: Snippet;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     type = 'inline-size',
CODEX:     class: className = '',
CODEX:     children
CODEX:   }: Props = $props();
CODEX: </script>
CODEX: 
CODEX: <div
CODEX:   class="@container {className}"
CODEX:   style="container-type: {type}"
CODEX: >
CODEX:   {@render children()}
CODEX: </div>
CODEX: 
CODEX: <!-- Usage Example -->
CODEX: <Container class="max-w-md">
CODEX:   <div class="p-4 @sm:p-6 @lg:p-8">
CODEX:     <h3 class="text-lg @sm:text-xl @lg:text-2xl">Responsive Content</h3>
CODEX:     <p class="text-sm @sm:text-base">
CODEX:       This content adapts to its container size, not the viewport.
CODEX:     </p>
CODEX:   </div>
CODEX: </Container>
CODEX: ```
CODEX: 
CODEX: ### Grid Systems
CODEX: 
CODEX: ```css
CODEX: /* Grid Utilities */
CODEX: .grid-cols-auto {
CODEX:   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
CODEX: }
CODEX: 
CODEX: .grid-cols-responsive {
CODEX:   grid-template-columns: repeat(auto-fit, minmax(var(--min-col-width, 250px), 1fr));
CODEX: }
CODEX: 
CODEX: /* 12 Column Grid */
CODEX: .grid-12 {
CODEX:   @apply grid grid-cols-12 gap-4;
CODEX: }
CODEX: 
CODEX: .col-span-1 { @apply col-span-1; }
CODEX: .col-span-2 { @apply col-span-2; }
CODEX: .col-span-3 { @apply col-span-3; }
CODEX: .col-span-4 { @apply col-span-4; }
CODEX: .col-span-5 { @apply col-span-5; }
CODEX: .col-span-6 { @apply col-span-6; }
CODEX: .col-span-7 { @apply col-span-7; }
CODEX: .col-span-8 { @apply col-span-8; }
CODEX: .col-span-9 { @apply col-span-9; }
CODEX: .col-span-10 { @apply col-span-10; }
CODEX: .col-span-11 { @apply col-span-11; }
CODEX: .col-span-12 { @apply col-span-12; }
CODEX: 
CODEX: /* Responsive Grid */
CODEX: @media (max-width: 640px) {
CODEX:   .grid-12 { @apply grid-cols-1 gap-2; }
CODEX:   [class*="col-span-"] { @apply col-span-1; }
CODEX: }
CODEX: 
CODEX: @media (min-width: 641px) and (max-width: 1024px) {
CODEX:   .grid-12 { @apply grid-cols-6 gap-3; }
CODEX:   .col-span-7, .col-span-8, .col-span-9, .col-span-10, .col-span-11, .col-span-12 {
CODEX:     @apply col-span-6;
CODEX:   }
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Layout Primitives
CODEX: 
CODEX: ```css
CODEX: /* Stack Layout */
CODEX: .stack {
CODEX:   @apply flex flex-col;
CODEX:   gap: var(--stack-gap, 1rem);
CODEX: }
CODEX: 
CODEX: .stack-xs { --stack-gap: 0.25rem; }
CODEX: .stack-sm { --stack-gap: 0.5rem; }
CODEX: .stack-md { --stack-gap: 1rem; }
CODEX: .stack-lg { --stack-gap: 1.5rem; }
CODEX: .stack-xl { --stack-gap: 2rem; }
CODEX: 
CODEX: /* Cluster Layout */
CODEX: .cluster {
CODEX:   @apply flex flex-wrap items-center;
CODEX:   gap: var(--cluster-gap, 0.5rem);
CODEX: }
CODEX: 
CODEX: /* Sidebar Layout */
CODEX: .sidebar-layout {
CODEX:   @apply flex gap-6;
CODEX: }
CODEX: 
CODEX: .sidebar {
CODEX:   @apply flex-shrink-0 w-64;
CODEX: }
CODEX: 
CODEX: .main-content {
CODEX:   @apply flex-1 min-w-0;
CODEX: }
CODEX: 
CODEX: /* Holy Grail Layout */
CODEX: .holy-grail {
CODEX:   @apply min-h-screen flex flex-col;
CODEX: }
CODEX: 
CODEX: .holy-grail-header {
CODEX:   @apply flex-shrink-0;
CODEX: }
CODEX: 
CODEX: .holy-grail-main {
CODEX:   @apply flex-1 flex;
CODEX: }
CODEX: 
CODEX: .holy-grail-sidebar {
CODEX:   @apply w-64 flex-shrink-0;
CODEX: }
CODEX: 
CODEX: .holy-grail-content {
CODEX:   @apply flex-1 min-w-0;
CODEX: }
CODEX: 
CODEX: .holy-grail-aside {
CODEX:   @apply w-48 flex-shrink-0;
CODEX: }
CODEX: 
CODEX: .holy-grail-footer {
CODEX:   @apply flex-shrink-0;
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Layout Components (Svelte)
CODEX: 
CODEX: ```html
CODEX: <!-- Stack Component -->
CODEX: <script lang="ts">
CODEX:   interface StackProps {
CODEX:     gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
CODEX:     class?: string;
CODEX:     children: Snippet;
CODEX:   }
CODEX: 
CODEX:   let { gap = 'md', class: className = '', children }: StackProps = $props();
CODEX: </script>
CODEX: 
CODEX: <div class="stack stack-{gap} {className}">
CODEX:   {@render children()}
CODEX: </div>
CODEX: 
CODEX: <!-- Cluster Component -->
CODEX: <script lang="ts">
CODEX:   interface ClusterProps {
CODEX:     justify?: 'start' | 'center' | 'end' | 'between';
CODEX:     align?: 'start' | 'center' | 'end';
CODEX:     class?: string;
CODEX:     children: Snippet;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     justify = 'start',
CODEX:     align = 'center',
CODEX:     class: className = '',
CODEX:     children
CODEX:   }: ClusterProps = $props();
CODEX: 
CODEX:   const clusterClass = $derived(`cluster justify-${justify} items-${align} ${className}`);
CODEX: </script>
CODEX: 
CODEX: <div class={clusterClass}>
CODEX:   {@render children()}
CODEX: </div>
CODEX: 
CODEX: <!-- Holy Grail Layout -->
CODEX: <script lang="ts">
CODEX:   interface HolyGrailProps {
CODEX:     header?: Snippet;
CODEX:     sidebar?: Snippet;
CODEX:     aside?: Snippet;
CODEX:     footer?: Snippet;
CODEX:     children: Snippet;
CODEX:   }
CODEX: 
CODEX:   let { header, sidebar, aside, footer, children }: HolyGrailProps = $props();
CODEX: </script>
CODEX: 
CODEX: <div class="holy-grail">
CODEX:   {#if header}
CODEX:     <header class="holy-grail-header">
CODEX:       {@render header()}
CODEX:     </header>
CODEX:   {/if}
CODEX: 
CODEX:   <main class="holy-grail-main">
CODEX:     {#if sidebar}
CODEX:       <aside class="holy-grail-sidebar">
CODEX:         {@render sidebar()}
CODEX:       </aside>
CODEX:     {/if}
CODEX: 
CODEX:     <div class="holy-grail-content">
CODEX:       {@render children()}
CODEX:     </div>
CODEX: 
CODEX:     {#if aside}
CODEX:       <aside class="holy-grail-aside">
CODEX:         {@render aside()}
CODEX:       </aside>
CODEX:     {/if}
CODEX:   </main>
CODEX: 
CODEX:   {#if footer}
CODEX:     <footer class="holy-grail-footer">
CODEX:       {@render footer()}
CODEX:     </footer>
CODEX:   {/if}
CODEX: </div>
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Advanced Features
CODEX: 
CODEX: ### 3D Transforms
CODEX: 
CODEX: Tailwind v4 includes native 3D transform utilities:
CODEX: 
CODEX: ```css
CODEX: /* 3D Transform Utilities */
CODEX: .perspective-500 { perspective: 500px; }
CODEX: .perspective-1000 { perspective: 1000px; }
CODEX: .perspective-none { perspective: none; }
CODEX: 
CODEX: .rotate-x-0 { transform: rotateX(0deg); }
CODEX: .rotate-x-45 { transform: rotateX(45deg); }
CODEX: .rotate-x-90 { transform: rotateX(90deg); }
CODEX: .rotate-x-180 { transform: rotateX(180deg); }
CODEX: 
CODEX: .rotate-y-0 { transform: rotateY(0deg); }
CODEX: .rotate-y-45 { transform: rotateY(45deg); }
CODEX: .rotate-y-90 { transform: rotateY(90deg); }
CODEX: .rotate-y-180 { transform: rotateY(180deg); }
CODEX: 
CODEX: .rotate-z-0 { transform: rotateZ(0deg); }
CODEX: .rotate-z-45 { transform: rotateZ(45deg); }
CODEX: .rotate-z-90 { transform: rotateZ(90deg); }
CODEX: .rotate-z-180 { transform: rotateZ(180deg); }
CODEX: 
CODEX: .preserve-3d { transform-style: preserve-3d; }
CODEX: .flat { transform-style: flat; }
CODEX: 
CODEX: /* 3D Card Example */
CODEX: .card-3d {
CODEX:   @apply preserve-3d transition-transform duration-300 ease-out;
CODEX: }
CODEX: 
CODEX: .card-3d:hover {
CODEX:   @apply rotate-x-12 rotate-y-12;
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Enhanced Gradients
CODEX: 
CODEX: ```css
CODEX: /* Linear Gradients */
CODEX: .bg-linear-45 {
CODEX:   background-image: linear-gradient(45deg, var(--tw-gradient-stops));
CODEX: }
CODEX: 
CODEX: .bg-linear-to-tr {
CODEX:   background-image: linear-gradient(to top right, var(--tw-gradient-stops));
CODEX: }
CODEX: 
CODEX: /* Radial Gradients */
CODEX: .bg-radial {
CODEX:   background-image: radial-gradient(var(--tw-gradient-shape, ellipse) var(--tw-gradient-size, farthest-corner) at var(--tw-gradient-position, center), var(--tw-gradient-stops));
CODEX: }
CODEX: 
CODEX: .bg-radial-at-tl {
CODEX:   --tw-gradient-position: top left;
CODEX: }
CODEX: 
CODEX: .bg-radial-at-tr {
CODEX:   --tw-gradient-position: top right;
CODEX: }
CODEX: 
CODEX: .bg-radial-at-bl {
CODEX:   --tw-gradient-position: bottom left;
CODEX: }
CODEX: 
CODEX: .bg-radial-at-br {
CODEX:   --tw-gradient-position: bottom right;
CODEX: }
CODEX: 
CODEX: /* Conic Gradients */
CODEX: .bg-conic {
CODEX:   background-image: conic-gradient(from var(--tw-gradient-angle, 0deg) at var(--tw-gradient-position, center), var(--tw-gradient-stops));
CODEX: }
CODEX: 
CODEX: .bg-conic-45 {
CODEX:   --tw-gradient-angle: 45deg;
CODEX: }
CODEX: 
CODEX: /* OKLCH Color Gradients */
CODEX: .from-oklch-blue { --tw-gradient-from: oklch(0.58 0.14 240); }
CODEX: .to-oklch-purple { --tw-gradient-to: oklch(0.58 0.14 300); }
CODEX: .via-oklch-pink { --tw-gradient-via: oklch(0.58 0.14 350); }
CODEX: ```
CODEX: 
CODEX: ### Advanced Animations
CODEX: 
CODEX: ```css
CODEX: /* Custom Keyframes */
CODEX: @keyframes float {
CODEX:   0%, 100% { transform: translateY(0px); }
CODEX:   50% { transform: translateY(-10px); }
CODEX: }
CODEX: 
CODEX: @keyframes pulse-slow {
CODEX:   0%, 100% { opacity: 1; }
CODEX:   50% { opacity: 0.5; }
CODEX: }
CODEX: 
CODEX: @keyframes slide-up {
CODEX:   from { transform: translateY(100%); }
CODEX:   to { transform: translateY(0); }
CODEX: }
CODEX: 
CODEX: @keyframes slide-down {
CODEX:   from { transform: translateY(-100%); }
CODEX:   to { transform: translateY(0); }
CODEX: }
CODEX: 
CODEX: @keyframes scale-in {
CODEX:   from { transform: scale(0.9); opacity: 0; }
CODEX:   to { transform: scale(1); opacity: 1; }
CODEX: }
CODEX: 
CODEX: @keyframes shake {
CODEX:   0%, 100% { transform: translateX(0); }
CODEX:   10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
CODEX:   20%, 40%, 60%, 80% { transform: translateX(5px); }
CODEX: }
CODEX: 
CODEX: /* Animation Utilities */
CODEX: .animate-float {
CODEX:   animation: float 3s ease-in-out infinite;
CODEX: }
CODEX: 
CODEX: .animate-pulse-slow {
CODEX:   animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
CODEX: }
CODEX: 
CODEX: .animate-slide-up {
CODEX:   animation: slide-up 0.3s ease-out;
CODEX: }
CODEX: 
CODEX: .animate-slide-down {
CODEX:   animation: slide-down 0.3s ease-out;
CODEX: }
CODEX: 
CODEX: .animate-scale-in {
CODEX:   animation: scale-in 0.2s ease-out;
CODEX: }
CODEX: 
CODEX: .animate-shake {
CODEX:   animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97);
CODEX: }
CODEX: 
CODEX: /* Hover Animations */
CODEX: .hover-lift {
CODEX:   @apply transition-transform duration-200 ease-out;
CODEX: }
CODEX: 
CODEX: .hover-lift:hover {
CODEX:   @apply -translate-y-1;
CODEX: }
CODEX: 
CODEX: .hover-grow {
CODEX:   @apply transition-transform duration-200 ease-out;
CODEX: }
CODEX: 
CODEX: .hover-grow:hover {
CODEX:   @apply scale-105;
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Filter Effects
CODEX: 
CODEX: ```css
CODEX: /* Filter Utilities */
CODEX: .blur-xs { filter: blur(2px); }
CODEX: .blur-sm { filter: blur(4px); }
CODEX: .blur-md { filter: blur(8px); }
CODEX: .blur-lg { filter: blur(16px); }
CODEX: .blur-xl { filter: blur(24px); }
CODEX: .blur-2xl { filter: blur(40px); }
CODEX: .blur-3xl { filter: blur(64px); }
CODEX: 
CODEX: .brightness-0 { filter: brightness(0); }
CODEX: .brightness-50 { filter: brightness(0.5); }
CODEX: .brightness-75 { filter: brightness(0.75); }
CODEX: .brightness-90 { filter: brightness(0.9); }
CODEX: .brightness-95 { filter: brightness(0.95); }
CODEX: .brightness-100 { filter: brightness(1); }
CODEX: .brightness-105 { filter: brightness(1.05); }
CODEX: .brightness-110 { filter: brightness(1.1); }
CODEX: .brightness-125 { filter: brightness(1.25); }
CODEX: .brightness-150 { filter: brightness(1.5); }
CODEX: .brightness-200 { filter: brightness(2); }
CODEX: 
CODEX: .contrast-0 { filter: contrast(0); }
CODEX: .contrast-50 { filter: contrast(0.5); }
CODEX: .contrast-75 { filter: contrast(0.75); }
CODEX: .contrast-100 { filter: contrast(1); }
CODEX: .contrast-125 { filter: contrast(1.25); }
CODEX: .contrast-150 { filter: contrast(1.5); }
CODEX: .contrast-200 { filter: contrast(2); }
CODEX: 
CODEX: .saturate-0 { filter: saturate(0); }
CODEX: .saturate-50 { filter: saturate(0.5); }
CODEX: .saturate-100 { filter: saturate(1); }
CODEX: .saturate-150 { filter: saturate(1.5); }
CODEX: .saturate-200 { filter: saturate(2); }
CODEX: 
CODEX: .sepia-0 { filter: sepia(0); }
CODEX: .sepia { filter: sepia(1); }
CODEX: 
CODEX: .grayscale-0 { filter: grayscale(0); }
CODEX: .grayscale { filter: grayscale(1); }
CODEX: 
CODEX: .invert-0 { filter: invert(0); }
CODEX: .invert { filter: invert(1); }
CODEX: 
CODEX: .hue-rotate-0 { filter: hue-rotate(0deg); }
CODEX: .hue-rotate-15 { filter: hue-rotate(15deg); }
CODEX: .hue-rotate-30 { filter: hue-rotate(30deg); }
CODEX: .hue-rotate-60 { filter: hue-rotate(60deg); }
CODEX: .hue-rotate-90 { filter: hue-rotate(90deg); }
CODEX: .hue-rotate-180 { filter: hue-rotate(180deg); }
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Performance Optimization
CODEX: 
CODEX: ### Critical CSS Strategy
CODEX: 
CODEX: ```css
CODEX: /* Critical Above-the-Fold Styles */
CODEX: @layer critical {
CODEX:   /* Layout */
CODEX:   .header, .nav, .hero { /* critical styles */ }
CODEX: 
CODEX:   /* Typography */
CODEX:   h1, h2, .hero-text { /* critical text styles */ }
CODEX: 
CODEX:   /* Core Components */
CODEX:   .btn-primary, .card { /* critical component styles */ }
CODEX: }
CODEX: 
CODEX: /* Non-critical styles loaded asynchronously */
CODEX: @layer non-critical {
CODEX:   .modal, .dropdown, .tooltip { /* non-critical styles */ }
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Code Splitting
CODEX: 
CODEX: ```js
CODEX: // vite.config.js
CODEX: export default {
CODEX:   build: {
CODEX:     rollupOptions: {
CODEX:       output: {
CODEX:         manualChunks: {
CODEX:           'critical-css': ['./src/styles/critical.css'],
CODEX:           'components': ['./src/styles/components.css'],
CODEX:           'utilities': ['./src/styles/utilities.css']
CODEX:         }
CODEX:       }
CODEX:     }
CODEX:   }
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Build Optimization
CODEX: 
CODEX: ```css
CODEX: /* Use CSS Custom Properties for Runtime Efficiency */
CODEX: .theme-switcher {
CODEX:   --primary: var(--color-blue-500);
CODEX:   --surface: var(--color-gray-50);
CODEX: }
CODEX: 
CODEX: [data-theme="dark"] .theme-switcher {
CODEX:   --primary: var(--color-blue-400);
CODEX:   --surface: var(--color-gray-800);
CODEX: }
CODEX: 
CODEX: /* Minimize Paint Operations */
CODEX: .optimized-card {
CODEX:   @apply will-change-transform; /* GPU acceleration hint */
CODEX:   @apply transform-gpu; /* Force GPU layer */
CODEX: }
CODEX: 
CODEX: /* Efficient Transitions */
CODEX: .efficient-hover {
CODEX:   @apply transition-opacity duration-150; /* Opacity is cheap */
CODEX: }
CODEX: 
CODEX: .expensive-hover {
CODEX:   @apply transition-all duration-150; /* Avoid transition-all */
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Bundle Size Optimization
CODEX: 
CODEX: ```js
CODEX: // tailwind.config.js (if needed for complex setups)
CODEX: export default {
CODEX:   content: {
CODEX:     files: [
CODEX:       './src/**/*.{html,js,svelte,ts}',
CODEX:       './packages/**/*.{html,js,svelte,ts}'
CODEX:     ],
CODEX:     // Aggressive purging
CODEX:     extract: {
CODEX:       js: (content) => content.match(/[A-Za-z0-9_-]+/g) || []
CODEX:     }
CODEX:   }
CODEX: }
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Accessibility Standards
CODEX: 
CODEX: ### Focus Management
CODEX: 
CODEX: ```css
CODEX: /* Visible Focus Indicators */
CODEX: .focus-ring {
CODEX:   @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
CODEX: }
CODEX: 
CODEX: .focus-ring-inset {
CODEX:   @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset;
CODEX: }
CODEX: 
CODEX: .focus-ring-white {
CODEX:   @apply focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500;
CODEX: }
CODEX: 
CODEX: /* Focus Within */
CODEX: .focus-within-ring {
CODEX:   @apply focus-within:ring-2 focus-within:ring-blue-500;
CODEX: }
CODEX: 
CODEX: /* Skip Links */
CODEX: .skip-link {
CODEX:   @apply absolute -top-full left-0 z-[100] bg-white p-2 text-blue-600 underline;
CODEX:   @apply focus:top-0;
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Color Contrast
CODEX: 
CODEX: ```css
CODEX: /* WCAG AA Compliant Color Combinations */
CODEX: .text-high-contrast {
CODEX:   /* 7:1 contrast ratio for AAA compliance */
CODEX:   color: oklch(0.15 0.015 270); /* Very dark text */
CODEX:   background: oklch(1 0 0); /* Pure white background */
CODEX: }
CODEX: 
CODEX: .text-medium-contrast {
CODEX:   /* 4.5:1 contrast ratio for AA compliance */
CODEX:   color: oklch(0.35 0.025 270); /* Medium dark text */
CODEX:   background: oklch(0.98 0.005 270); /* Off-white background */
CODEX: }
CODEX: 
CODEX: /* Status Colors with Proper Contrast */
CODEX: .status-success-accessible {
CODEX:   color: oklch(0.25 0.08 145); /* Dark green text */
CODEX:   background: oklch(0.95 0.02 145); /* Light green background */
CODEX: }
CODEX: 
CODEX: .status-error-accessible {
CODEX:   color: oklch(0.25 0.08 0); /* Dark red text */
CODEX:   background: oklch(0.95 0.02 0); /* Light red background */
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Touch Targets
CODEX: 
CODEX: ```css
CODEX: /* Minimum 44px Touch Targets */
CODEX: .touch-target {
CODEX:   min-height: 44px;
CODEX:   min-width: 44px;
CODEX:   @apply flex items-center justify-center;
CODEX: }
CODEX: 
CODEX: .touch-target-small {
CODEX:   min-height: 32px;
CODEX:   min-width: 32px;
CODEX:   /* Use only for secondary actions */
CODEX: }
CODEX: 
CODEX: /* Tap Target Enhancement */
CODEX: .tap-target {
CODEX:   @apply relative;
CODEX: }
CODEX: 
CODEX: .tap-target::after {
CODEX:   content: '';
CODEX:   @apply absolute inset-0 min-h-[44px] min-w-[44px];
CODEX:   /* Invisible overlay for larger tap area */
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Screen Reader Support
CODEX: 
CODEX: ```css
CODEX: /* Screen Reader Only Content */
CODEX: .sr-only {
CODEX:   position: absolute;
CODEX:   width: 1px;
CODEX:   height: 1px;
CODEX:   padding: 0;
CODEX:   margin: -1px;
CODEX:   overflow: hidden;
CODEX:   clip: rect(0, 0, 0, 0);
CODEX:   white-space: nowrap;
CODEX:   border: 0;
CODEX: }
CODEX: 
CODEX: .not-sr-only {
CODEX:   position: static;
CODEX:   width: auto;
CODEX:   height: auto;
CODEX:   padding: 0;
CODEX:   margin: 0;
CODEX:   overflow: visible;
CODEX:   clip: auto;
CODEX:   white-space: normal;
CODEX: }
CODEX: 
CODEX: /* Focus Visible Only */
CODEX: .focus:not(.focus-visible) {
CODEX:   outline: none;
CODEX:   box-shadow: none;
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Accessible Component Example (Svelte)
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   interface AccessibleButtonProps {
CODEX:     variant?: 'primary' | 'secondary';
CODEX:     disabled?: boolean;
CODEX:     loading?: boolean;
CODEX:     ariaLabel?: string;
CODEX:     ariaDescribedby?: string;
CODEX:     onclick?: () => void;
CODEX:     children: Snippet;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     variant = 'primary',
CODEX:     disabled = false,
CODEX:     loading = false,
CODEX:     ariaLabel,
CODEX:     ariaDescribedby,
CODEX:     onclick,
CODEX:     children
CODEX:   }: AccessibleButtonProps = $props();
CODEX: </script>
CODEX: 
CODEX: <button
CODEX:   type="button"
CODEX:   class="btn btn-{variant} focus-ring touch-target"
CODEX:   {disabled}
CODEX:   aria-label={ariaLabel}
CODEX:   aria-describedby={ariaDescribedby}
CODEX:   aria-busy={loading}
CODEX:   onclick={onclick}
CODEX: >
CODEX:   {#if loading}
CODEX:     <svg
CODEX:       class="animate-spin w-4 h-4 mr-2"
CODEX:       aria-hidden="true"
CODEX:       viewBox="0 0 24 24"
CODEX:     >
CODEX:       <circle
CODEX:         class="opacity-25"
CODEX:         cx="12"
CODEX:         cy="12"
CODEX:         r="10"
CODEX:         stroke="currentColor"
CODEX:         stroke-width="4"
CODEX:         fill="none"
CODEX:       />
CODEX:       <path
CODEX:         class="opacity-75"
CODEX:         fill="currentColor"
CODEX:         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
CODEX:       />
CODEX:     </svg>
CODEX:     <span class="sr-only">Loading...</span>
CODEX:   {/if}
CODEX: 
CODEX:   {@render children()}
CODEX: </button>
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Dark Mode Implementation
CODEX: 
CODEX: ### CSS Variables Approach
CODEX: 
CODEX: ```css
CODEX: /* Light Mode (Default) */
CODEX: :root {
CODEX:   --surface-bg: oklch(1 0 0);
CODEX:   --surface-fg: oklch(0.15 0.015 270);
CODEX:   --surface-border: oklch(0.95 0.005 270);
CODEX:   --surface-accent: oklch(0.98 0.005 270);
CODEX: }
CODEX: 
CODEX: /* Dark Mode */
CODEX: [data-theme="dark"] {
CODEX:   --surface-bg: oklch(0.15 0.015 270);
CODEX:   --surface-fg: oklch(0.95 0.005 270);
CODEX:   --surface-border: oklch(0.25 0.02 270);
CODEX:   --surface-accent: oklch(0.2 0.02 270);
CODEX: }
CODEX: 
CODEX: /* System Preference */
CODEX: @media (prefers-color-scheme: dark) {
CODEX:   :root {
CODEX:     --surface-bg: oklch(0.15 0.015 270);
CODEX:     --surface-fg: oklch(0.95 0.005 270);
CODEX:     --surface-border: oklch(0.25 0.02 270);
CODEX:     --surface-accent: oklch(0.2 0.02 270);
CODEX:   }
CODEX: }
CODEX: 
CODEX: /* Component Implementation */
CODEX: .card {
CODEX:   background: var(--surface-bg);
CODEX:   color: var(--surface-fg);
CODEX:   border: 1px solid var(--surface-border);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Complete Dark Mode Token System
CODEX: 
CODEX: ```css
CODEX: @theme {
CODEX:   /* Light Mode Colors */
CODEX:   --color-background: oklch(1 0 0);
CODEX:   --color-foreground: oklch(0.15 0.015 270);
CODEX:   --color-muted: oklch(0.98 0.005 270);
CODEX:   --color-muted-foreground: oklch(0.45 0.025 270);
CODEX:   --color-popover: oklch(1 0 0);
CODEX:   --color-popover-foreground: oklch(0.15 0.015 270);
CODEX:   --color-card: oklch(1 0 0);
CODEX:   --color-card-foreground: oklch(0.15 0.015 270);
CODEX:   --color-border: oklch(0.95 0.005 270);
CODEX:   --color-input: oklch(0.95 0.005 270);
CODEX:   --color-primary: oklch(0.58 0.14 240);
CODEX:   --color-primary-foreground: oklch(0.98 0.005 270);
CODEX:   --color-secondary: oklch(0.98 0.005 270);
CODEX:   --color-secondary-foreground: oklch(0.15 0.015 270);
CODEX:   --color-accent: oklch(0.98 0.005 270);
CODEX:   --color-accent-foreground: oklch(0.15 0.015 270);
CODEX:   --color-destructive: oklch(0.58 0.14 0);
CODEX:   --color-destructive-foreground: oklch(0.98 0.005 270);
CODEX:   --color-ring: oklch(0.58 0.14 240);
CODEX: }
CODEX: 
CODEX: /* Dark Mode Override */
CODEX: [data-theme="dark"] {
CODEX:   --color-background: oklch(0.13 0.01 270);
CODEX:   --color-foreground: oklch(0.98 0.005 270);
CODEX:   --color-muted: oklch(0.18 0.015 270);
CODEX:   --color-muted-foreground: oklch(0.65 0.02 270);
CODEX:   --color-popover: oklch(0.13 0.01 270);
CODEX:   --color-popover-foreground: oklch(0.98 0.005 270);
CODEX:   --color-card: oklch(0.13 0.01 270);
CODEX:   --color-card-foreground: oklch(0.98 0.005 270);
CODEX:   --color-border: oklch(0.2 0.015 270);
CODEX:   --color-input: oklch(0.2 0.015 270);
CODEX:   --color-primary: oklch(0.68 0.12 240);
CODEX:   --color-primary-foreground: oklch(0.15 0.015 270);
CODEX:   --color-secondary: oklch(0.2 0.015 270);
CODEX:   --color-secondary-foreground: oklch(0.98 0.005 270);
CODEX:   --color-accent: oklch(0.2 0.015 270);
CODEX:   --color-accent-foreground: oklch(0.98 0.005 270);
CODEX:   --color-destructive: oklch(0.68 0.12 0);
CODEX:   --color-destructive-foreground: oklch(0.98 0.005 270);
CODEX:   --color-ring: oklch(0.68 0.12 240);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Dark Mode Toggle Component
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   import { browser } from '$app/environment';
CODEX:   import { writable } from 'svelte/store';
CODEX: 
CODEX:   type Theme = 'light' | 'dark' | 'system';
CODEX: 
CODEX:   const theme = writable<Theme>('system');
CODEX: 
CODEX:   let mounted = $state(false);
CODEX:   let currentTheme = $state<Theme>('system');
CODEX: 
CODEX:   // Initialize theme
CODEX:   $effect(() => {
CODEX:     if (browser) {
CODEX:       mounted = true;
CODEX:       const stored = localStorage.getItem('theme') as Theme;
CODEX:       if (stored) {
CODEX:         currentTheme = stored;
CODEX:         theme.set(stored);
CODEX:       }
CODEX:       applyTheme(currentTheme);
CODEX:     }
CODEX:   });
CODEX: 
CODEX:   function applyTheme(newTheme: Theme) {
CODEX:     if (!browser) return;
CODEX: 
CODEX:     const html = document.documentElement;
CODEX:     html.classList.remove('light', 'dark');
CODEX: 
CODEX:     if (newTheme === 'system') {
CODEX:       const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
CODEX:         ? 'dark'
CODEX:         : 'light';
CODEX:       html.setAttribute('data-theme', systemTheme);
CODEX:     } else {
CODEX:       html.setAttribute('data-theme', newTheme);
CODEX:     }
CODEX:   }
CODEX: 
CODEX:   function setTheme(newTheme: Theme) {
CODEX:     currentTheme = newTheme;
CODEX:     theme.set(newTheme);
CODEX:     localStorage.setItem('theme', newTheme);
CODEX:     applyTheme(newTheme);
CODEX:   }
CODEX: 
CODEX:   // Listen for system theme changes
CODEX:   $effect(() => {
CODEX:     if (browser && currentTheme === 'system') {
CODEX:       const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
CODEX:       const handler = () => applyTheme('system');
CODEX:       mediaQuery.addEventListener('change', handler);
CODEX: 
CODEX:       return () => mediaQuery.removeEventListener('change', handler);
CODEX:     }
CODEX:   });
CODEX: </script>
CODEX: 
CODEX: {#if mounted}
CODEX:   <div class="flex items-center space-x-1 rounded-lg bg-muted p-1">
CODEX:     <button
CODEX:       type="button"
CODEX:       onclick={() => setTheme('light')}
CODEX:       class="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background hover:text-foreground {currentTheme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}"
CODEX:     >
CODEX:       <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
CODEX:         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
CODEX:       </svg>
CODEX:       <span class="sr-only">Light</span>
CODEX:     </button>
CODEX: 
CODEX:     <button
CODEX:       type="button"
CODEX:       onclick={() => setTheme('dark')}
CODEX:       class="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background hover:text-foreground {currentTheme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}"
CODEX:     >
CODEX:       <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
CODEX:         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
CODEX:       </svg>
CODEX:       <span class="sr-only">Dark</span>
CODEX:     </button>
CODEX: 
CODEX:     <button
CODEX:       type="button"
CODEX:       onclick={() => setTheme('system')}
CODEX:       class="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-background hover:text-foreground {currentTheme === 'system' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}"
CODEX:     >
CODEX:       <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
CODEX:         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
CODEX:       </svg>
CODEX:       <span class="sr-only">System</span>
CODEX:     </button>
CODEX:   </div>
CODEX: {/if}
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## SvelteKit Integration
CODEX: 
CODEX: ### Optimal Setup
CODEX: 
CODEX: ```js
CODEX: // vite.config.js
CODEX: import { sveltekit } from '@sveltejs/kit/vite';
CODEX: import tailwindcss from '@tailwindcss/vite';
CODEX: 
CODEX: export default {
CODEX:   plugins: [
CODEX:     sveltekit(),
CODEX:     tailwindcss()
CODEX:   ],
CODEX:   css: {
CODEX:     devSourcemap: true
CODEX:   }
CODEX: };
CODEX: ```
CODEX: 
CODEX: ```css
CODEX: /* src/app.css */
CODEX: @import 'tailwindcss';
CODEX: 
CODEX: @source './lib/**/*.{html,svelte,js,ts}';
CODEX: @source './routes/**/*.{html,svelte,js,ts}';
CODEX: @source '../packages/ui/src/**/*.{html,svelte,js,ts}';
CODEX: 
CODEX: @theme {
CODEX:   /* Your design tokens */
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### SSR Considerations
CODEX: 
CODEX: ```html
CODEX: <!-- src/app.html -->
CODEX: <!DOCTYPE html>
CODEX: <html lang="en" data-theme="light" class="h-full">
CODEX:   <head>
CODEX:     <meta charset="utf-8" />
CODEX:     <link rel="icon" href="%sveltekit.assets%/favicon.png" />
CODEX:     <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
CODEX: 
CODEX:     <!-- Prevent FOUC with inline critical styles -->
CODEX:     <style>
CODEX:       .loading-fallback {
CODEX:         position: fixed;
CODEX:         top: 50%;
CODEX:         left: 50%;
CODEX:         transform: translate(-50%, -50%);
CODEX:         font-family: system-ui, -apple-system, sans-serif;
CODEX:         color: #6b7280;
CODEX:       }
CODEX:     </style>
CODEX: 
CODEX:     %sveltekit.head%
CODEX:   </head>
CODEX:   <body data-sveltekit-preload-data="hover" class="h-full bg-background text-foreground antialiased">
CODEX:     <div id="app" style="display: contents">
CODEX:       <div class="loading-fallback">Loading...</div>
CODEX:       %sveltekit.body%
CODEX:     </div>
CODEX:   </body>
CODEX: </html>
CODEX: ```
CODEX: 
CODEX: ### Dynamic Classes with Svelte 5
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   interface DynamicButtonProps {
CODEX:     variant: 'primary' | 'secondary' | 'danger';
CODEX:     size: 'sm' | 'md' | 'lg';
CODEX:     loading?: boolean;
CODEX:     disabled?: boolean;
CODEX:   }
CODEX: 
CODEX:   let {
CODEX:     variant,
CODEX:     size,
CODEX:     loading = false,
CODEX:     disabled = false
CODEX:   }: DynamicButtonProps = $props();
CODEX: 
CODEX:   // Use $derived for reactive class computation
CODEX:   const buttonClass = $derived(() => {
CODEX:     const base = 'btn';
CODEX:     const variantClass = `btn-${variant}`;
CODEX:     const sizeClass = `btn-${size}`;
CODEX:     const stateClasses = [
CODEX:       loading && 'opacity-75 cursor-wait',
CODEX:       disabled && 'opacity-50 cursor-not-allowed'
CODEX:     ].filter(Boolean).join(' ');
CODEX: 
CODEX:     return `${base} ${variantClass} ${sizeClass} ${stateClasses}`.trim();
CODEX:   });
CODEX: 
CODEX:   // Conditional styling with $state
CODEX:   let isHovered = $state(false);
CODEX:   let isFocused = $state(false);
CODEX: 
CODEX:   const dynamicStyles = $derived(() => {
CODEX:     if (variant === 'primary') {
CODEX:       return {
CODEX:         backgroundColor: isHovered ? 'oklch(0.48 0.16 240)' : 'oklch(0.58 0.14 240)',
CODEX:         transform: isFocused ? 'scale(1.02)' : 'scale(1)'
CODEX:       };
CODEX:     }
CODEX:     return {};
CODEX:   });
CODEX: </script>
CODEX: 
CODEX: <button
CODEX:   class={buttonClass}
CODEX:   style={Object.entries(dynamicStyles).map(([key, value]) => `${key}: ${value}`).join('; ')}
CODEX:   {disabled}
CODEX:   onmouseenter={() => isHovered = true}
CODEX:   onmouseleave={() => isHovered = false}
CODEX:   onfocus={() => isFocused = true}
CODEX:   onblur={() => isFocused = false}
CODEX: >
CODEX:   {#if loading}
CODEX:     <div class="animate-spin w-4 h-4 mr-2">⟳</div>
CODEX:   {/if}
CODEX:   <slot />
CODEX: </button>
CODEX: ```
CODEX: 
CODEX: ### Form Handling with Actions
CODEX: 
CODEX: ```html
CODEX: <script lang="ts">
CODEX:   import { enhance } from '$app/forms';
CODEX:   import type { SubmitFunction } from '@sveltejs/kit';
CODEX: 
CODEX:   interface FormData {
CODEX:     email: string;
CODEX:     password: string;
CODEX:   }
CODEX: 
CODEX:   let formData = $state<FormData>({
CODEX:     email: '',
CODEX:     password: ''
CODEX:   });
CODEX: 
CODEX:   let isSubmitting = $state(false);
CODEX:   let errors = $state<Partial<FormData>>({});
CODEX: 
CODEX:   const handleSubmit: SubmitFunction = ({ formData, cancel }) => {
CODEX:     isSubmitting = true;
CODEX:     errors = {};
CODEX: 
CODEX:     // Client-side validation
CODEX:     if (!formData.get('email')) {
CODEX:       errors.email = 'Email is required';
CODEX:       cancel();
CODEX:       isSubmitting = false;
CODEX:       return;
CODEX:     }
CODEX: 
CODEX:     return async ({ result, update }) => {
CODEX:       isSubmitting = false;
CODEX: 
CODEX:       if (result.type === 'failure' && result.data?.errors) {
CODEX:         errors = result.data.errors;
CODEX:       }
CODEX: 
CODEX:       await update();
CODEX:     };
CODEX:   };
CODEX: </script>
CODEX: 
CODEX: <form
CODEX:   method="POST"
CODEX:   action="?/login"
CODEX:   use:enhance={handleSubmit}
CODEX:   class="space-y-6 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
CODEX: >
CODEX:   <div class="space-y-4">
CODEX:     <div>
CODEX:       <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
CODEX:         Email Address
CODEX:       </label>
CODEX:       <input
CODEX:         id="email"
CODEX:         name="email"
CODEX:         type="email"
CODEX:         bind:value={formData.email}
CODEX:         class="input {errors.email ? 'input-error' : ''}"
CODEX:         placeholder="you@example.com"
CODEX:         disabled={isSubmitting}
CODEX:         required
CODEX:       />
CODEX:       {#if errors.email}
CODEX:         <p class="text-sm text-red-600 mt-1">{errors.email}</p>
CODEX:       {/if}
CODEX:     </div>
CODEX: 
CODEX:     <div>
CODEX:       <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
CODEX:         Password
CODEX:       </label>
CODEX:       <input
CODEX:         id="password"
CODEX:         name="password"
CODEX:         type="password"
CODEX:         bind:value={formData.password}
CODEX:         class="input {errors.password ? 'input-error' : ''}"
CODEX:         disabled={isSubmitting}
CODEX:         required
CODEX:       />
CODEX:       {#if errors.password}
CODEX:         <p class="text-sm text-red-600 mt-1">{errors.password}</p>
CODEX:       {/if}
CODEX:     </div>
CODEX:   </div>
CODEX: 
CODEX:   <button
CODEX:     type="submit"
CODEX:     disabled={isSubmitting}
CODEX:     class="btn btn-primary w-full"
CODEX:   >
CODEX:     {#if isSubmitting}
CODEX:       <svg class="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
CODEX:         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
CODEX:         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
CODEX:       </svg>
CODEX:       Signing In...
CODEX:     {:else}
CODEX:       Sign In
CODEX:     {/if}
CODEX:   </button>
CODEX: </form>
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Migration Guide
CODEX: 
CODEX: ### From Tailwind v3 to v4
CODEX: 
CODEX: #### Step 1: Update Dependencies
CODEX: 
CODEX: ```bash
CODEX: # Remove old Tailwind
CODEX: npm uninstall tailwindcss postcss autoprefixer
CODEX: 
CODEX: # Install Tailwind v4
CODEX: npm install tailwindcss@next
CODEX: npm install @tailwindcss/vite
CODEX: ```
CODEX: 
CODEX: #### Step 2: Update Configuration
CODEX: 
CODEX: ```diff
CODEX: - // tailwind.config.js
CODEX: - export default {
CODEX: -   content: ['./src/**/*.{html,js,svelte,ts}'],
CODEX: -   theme: {
CODEX: -     extend: {
CODEX: -       colors: {
CODEX: -         primary: '#3b82f6'
CODEX: -       }
CODEX: -     }
CODEX: -   }
CODEX: - }
CODEX: 
CODEX: + /* src/app.css */
CODEX: + @import 'tailwindcss';
CODEX: +
CODEX: + @source './src/**/*.{html,js,svelte,ts}';
CODEX: +
CODEX: + @theme {
CODEX: +   --color-primary: oklch(0.58 0.14 240);
CODEX: + }
CODEX: ```
CODEX: 
CODEX: #### Step 3: Update Build Configuration
CODEX: 
CODEX: ```diff
CODEX: - // postcss.config.js
CODEX: - export default {
CODEX: -   plugins: {
CODEX: -     tailwindcss: {},
CODEX: -     autoprefixer: {}
CODEX: -   }
CODEX: - }
CODEX: 
CODEX: + // vite.config.js
CODEX: + import tailwindcss from '@tailwindcss/vite';
CODEX: +
CODEX: + export default {
CODEX: +   plugins: [
CODEX: +     sveltekit(),
CODEX: +     tailwindcss()
CODEX: +   ]
CODEX: + }
CODEX: ```
CODEX: 
CODEX: #### Step 4: Update Color Usage
CODEX: 
CODEX: ```diff
CODEX: - <div class="bg-blue-500 text-white">
CODEX: + <div class="bg-primary text-white">
CODEX: 
CODEX: - <div class="shadow-lg">
CODEX: + <div class="shadow-[var(--shadow-lg)]">
CODEX: 
CODEX: - .custom-gradient {
CODEX: -   @apply bg-gradient-to-r from-blue-500 to-purple-500;
CODEX: - }
CODEX: 
CODEX: + .custom-gradient {
CODEX: +   @apply bg-linear-to-r from-primary to-purple-500;
CODEX: + }
CODEX: ```
CODEX: 
CODEX: ### Breaking Changes Checklist
CODEX: 
CODEX: - [ ] Replace `bg-gradient-*` with `bg-linear-*`
CODEX: - [ ] Update `shadow-sm` to `shadow-xs`
CODEX: - [ ] Replace opacity utilities with color-mix()
CODEX: - [ ] Update custom CSS to use @theme
CODEX: - [ ] Replace PostCSS plugins with Lightning CSS
CODEX: - [ ] Update content scanning paths to @source
CODEX: - [ ] Test container query support
CODEX: - [ ] Verify 3D transform compatibility
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Testing Strategies
CODEX: 
CODEX: ### Visual Regression Testing
CODEX: 
CODEX: ```js
CODEX: // playwright.config.js
CODEX: export default {
CODEX:   testDir: './tests',
CODEX:   projects: [
CODEX:     { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
CODEX:     { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
CODEX:     { name: 'webkit', use: { ...devices['Desktop Safari'] } },
CODEX:     { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
CODEX:     { name: 'mobile-safari', use: { ...devices['iPhone 12'] } }
CODEX:   ]
CODEX: };
CODEX: 
CODEX: // tests/visual.spec.js
CODEX: import { test, expect } from '@playwright/test';
CODEX: 
CODEX: test.describe('Component Visual Tests', () => {
CODEX:   test('buttons render correctly', async ({ page }) => {
CODEX:     await page.goto('/components/buttons');
CODEX: 
CODEX:     // Test all button variants
CODEX:     await expect(page.locator('[data-testid="btn-primary"]')).toHaveScreenshot('btn-primary.png');
CODEX:     await expect(page.locator('[data-testid="btn-secondary"]')).toHaveScreenshot('btn-secondary.png');
CODEX: 
CODEX:     // Test hover states
CODEX:     await page.hover('[data-testid="btn-primary"]');
CODEX:     await expect(page.locator('[data-testid="btn-primary"]')).toHaveScreenshot('btn-primary-hover.png');
CODEX:   });
CODEX: 
CODEX:   test('dark mode renders correctly', async ({ page }) => {
CODEX:     await page.goto('/components');
CODEX:     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
CODEX:     await expect(page).toHaveScreenshot('dark-mode.png');
CODEX:   });
CODEX: });
CODEX: ```
CODEX: 
CODEX: ### Accessibility Testing
CODEX: 
CODEX: ```js
CODEX: // tests/accessibility.spec.js
CODEX: import { test, expect } from '@playwright/test';
CODEX: import AxeBuilder from '@axe-core/playwright';
CODEX: 
CODEX: test.describe('Accessibility Tests', () => {
CODEX:   test('homepage has no accessibility violations', async ({ page }) => {
CODEX:     await page.goto('/');
CODEX: 
CODEX:     const accessibilityScanResults = await new AxeBuilder({ page })
CODEX:       .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
CODEX:       .analyze();
CODEX: 
CODEX:     expect(accessibilityScanResults.violations).toEqual([]);
CODEX:   });
CODEX: 
CODEX:   test('focus management works correctly', async ({ page }) => {
CODEX:     await page.goto('/components/modal');
CODEX: 
CODEX:     // Open modal
CODEX:     await page.click('[data-testid="open-modal"]');
CODEX: 
CODEX:     // Check focus is trapped
CODEX:     await page.keyboard.press('Tab');
CODEX:     const focusedElement = page.locator(':focus');
CODEX:     await expect(focusedElement).toBeVisible();
CODEX: 
CODEX:     // Check focus returns to trigger
CODEX:     await page.keyboard.press('Escape');
CODEX:     await expect(page.locator('[data-testid="open-modal"]')).toBeFocused();
CODEX:   });
CODEX: });
CODEX: ```
CODEX: 
CODEX: ### Performance Testing
CODEX: 
CODEX: ```js
CODEX: // tests/performance.spec.js
CODEX: test('CSS loads efficiently', async ({ page }) => {
CODEX:   const responses = [];
CODEX: 
CODEX:   page.on('response', response => {
CODEX:     if (response.url().includes('.css')) {
CODEX:       responses.push({
CODEX:         url: response.url(),
CODEX:         size: response.headers()['content-length'],
CODEX:         status: response.status()
CODEX:       });
CODEX:     }
CODEX:   });
CODEX: 
CODEX:   await page.goto('/');
CODEX: 
CODEX:   // Check CSS file size is reasonable
CODEX:   const cssResponse = responses.find(r => r.url.includes('app.css'));
CODEX:   expect(parseInt(cssResponse.size)).toBeLessThan(100000); // < 100KB
CODEX: });
CODEX: 
CODEX: test('page loads within performance budget', async ({ page }) => {
CODEX:   await page.goto('/', { waitUntil: 'networkidle' });
CODEX: 
CODEX:   const metrics = await page.evaluate(() => {
CODEX:     return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')[0]));
CODEX:   });
CODEX: 
CODEX:   expect(metrics.loadEventEnd - metrics.navigationStart).toBeLessThan(3000); // < 3s
CODEX: });
CODEX: ```
CODEX: 
CODEX: ### Component Testing
CODEX: 
CODEX: ```html
CODEX: <!-- Button.test.svelte -->
CODEX: <script lang="ts">
CODEX:   import { test } from 'vitest';
CODEX:   import { render, screen } from '@testing-library/svelte';
CODEX:   import Button from './Button.svelte';
CODEX: 
CODEX:   test('renders with correct classes', () => {
CODEX:     render(Button, {
CODEX:       props: {
CODEX:         variant: 'primary',
CODEX:         size: 'lg'
CODEX:       }
CODEX:     });
CODEX: 
CODEX:     const button = screen.getByRole('button');
CODEX:     expect(button).toHaveClass('btn', 'btn-primary', 'btn-lg');
CODEX:   });
CODEX: 
CODEX:   test('handles click events', async () => {
CODEX:     let clicked = false;
CODEX:     const handleClick = () => { clicked = true; };
CODEX: 
CODEX:     render(Button, {
CODEX:       props: { onclick: handleClick }
CODEX:     });
CODEX: 
CODEX:     await fireEvent.click(screen.getByRole('button'));
CODEX:     expect(clicked).toBe(true);
CODEX:   });
CODEX: 
CODEX:   test('shows loading state', () => {
CODEX:     render(Button, {
CODEX:       props: { loading: true }
CODEX:     });
CODEX: 
CODEX:     expect(screen.getByText('Loading...')).toBeInTheDocument();
CODEX:     expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
CODEX:   });
CODEX: </script>
CODEX: ```
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Implementation Checklist
CODEX: 
CODEX: ### Pre-Implementation Tasks
CODEX: - [ ] **Architecture Review**: Verify current `@source` globs cover all Svelte/TS files
CODEX: - [ ] **Token Audit**: Ensure every semantic color/spacing/font maps back to `packages/ui` tokens
CODEX: - [ ] **Legacy Cleanup**: Remove unused directives, duplicated tokens from each app's `app.css`
CODEX: - [ ] **Component Validation**: Check `@layer components` follow 44px touch targets and UI-UX.md guidance
CODEX: 
CODEX: ### Implementation Tasks
CODEX: - [ ] **Replace @apply Usage**: Convert duplicated semantic classes to component-level styles
CODEX: - [ ] **Accessibility Fixes**: Address BottomNav tablist role and PartnerShowcase interaction warnings
CODEX: - [ ] **CSS Cleanup**: Remove unused selectors (.emoji-track span, .group button)
CODEX: - [ ] **Interactive Patterns**: Implement proper carousel navigation element patterns
CODEX: - [ ] **Performance Audit**: Run validation commands after changes
CODEX: 
CODEX: ### Hand-off Checklist
CODEX: - [ ] **Screenshots**: Capture before/after for updated hero sections, nav, checkout, and key flows
CODEX: - [ ] **Documentation**: Update UI-UX.md only when product requirements shift
CODEX: - [ ] **Issue Tracking**: Note regressions or deferred cleanups with owners for Codex prioritization
CODEX: - [ ] **Validation**: All build, lint, test, and performance audit commands pass
CODEX: - [ ] **Design Review**: Get sign-off for any app-specific token divergences
CODEX: 
CODEX: ### Project-Specific Follow-ups
CODEX: - [ ] **Accessibility Review**: Design system review needed for ARIA roles in UI components
CODEX: - [ ] **Component Cleanup**: Unused selectors identified in HeaderLogo.svelte and PartnerShowcase.svelte
CODEX: - [ ] **Interactive Elements**: Proper patterns needed for carousel navigation components
CODEX: - [ ] **Performance Monitoring**: Continue watching Lighthouse scores after global style changes
CODEX: 
CODEX: ### Implementation Notes
CODEX: - Tailwind v4 no longer uses `tailwind.config.js`; keep overrides in CSS or promote to `@repo/ui`
CODEX: - Use `@theme` for token remaps and `@custom-variant` for new stateful selectors
CODEX: - Document rationale for app-specific tokens that diverge from product tokens
CODEX: - Keep feature flag CSS behind comments with toggle name and removal plan
CODEX: - Avoid adding new plugins without design review
CODEX: 
CODEX: ---
CODEX: 
CODEX: ## Reference
CODEX: 
CODEX: ### Design Token Reference
CODEX: 
CODEX: #### Complete Spacing Scale
CODEX: ```css
CODEX: 0     -> 0px
CODEX: px    -> 1px
CODEX: 0.5   -> 2px    (0.125rem)
CODEX: 1     -> 4px    (0.25rem)
CODEX: 1.5   -> 6px    (0.375rem)
CODEX: 2     -> 8px    (0.5rem)
CODEX: 2.5   -> 10px   (0.625rem)
CODEX: 3     -> 12px   (0.75rem)
CODEX: 3.5   -> 14px   (0.875rem)
CODEX: 4     -> 16px   (1rem)
CODEX: 5     -> 20px   (1.25rem)
CODEX: 6     -> 24px   (1.5rem)
CODEX: 7     -> 28px   (1.75rem)
CODEX: 8     -> 32px   (2rem)
CODEX: 9     -> 36px   (2.25rem)
CODEX: 10    -> 40px   (2.5rem)
CODEX: 11    -> 44px   (2.75rem) ← Minimum touch target
CODEX: 12    -> 48px   (3rem)
CODEX: 14    -> 56px   (3.5rem)
CODEX: 16    -> 64px   (4rem)
CODEX: 20    -> 80px   (5rem)
CODEX: 24    -> 96px   (6rem)
CODEX: 28    -> 112px  (7rem)
CODEX: 32    -> 128px  (8rem)
CODEX: 36    -> 144px  (9rem)
CODEX: 40    -> 160px  (10rem)
CODEX: 44    -> 176px  (11rem)
CODEX: 48    -> 192px  (12rem)
CODEX: 52    -> 208px  (13rem)
CODEX: 56    -> 224px  (14rem)
CODEX: 60    -> 240px  (15rem)
CODEX: 64    -> 256px  (16rem)
CODEX: 72    -> 288px  (18rem)
CODEX: 80    -> 320px  (20rem)
CODEX: 96    -> 384px  (24rem)
CODEX: ```
CODEX: 
CODEX: #### Typography Scale
CODEX: ```css
CODEX: xs    -> 0.75rem   (12px)
CODEX: sm    -> 0.875rem  (14px)
CODEX: base  -> 1rem      (16px)
CODEX: lg    -> 1.125rem  (18px)
CODEX: xl    -> 1.25rem   (20px)
CODEX: 2xl   -> 1.5rem    (24px)
CODEX: 3xl   -> 1.875rem  (30px)
CODEX: 4xl   -> 2.25rem   (36px)
CODEX: 5xl   -> 3rem      (48px)
CODEX: 6xl   -> 3.75rem   (60px)
CODEX: 7xl   -> 4.5rem    (72px)
CODEX: 8xl   -> 6rem      (96px)
CODEX: 9xl   -> 8rem      (128px)
CODEX: ```
CODEX: 
CODEX: #### Color Palette (OKLCH)
CODEX: All colors use OKLCH color space for perceptual uniformity:
CODEX: - L (Lightness): 0-1 scale
CODEX: - C (Chroma): 0+ saturation
CODEX: - H (Hue): 0-360 degrees
CODEX: 
CODEX: #### Shadow Scale
CODEX: ```css
CODEX: xs    -> 0 1px 2px rgba(0,0,0,0.05)
CODEX: sm    -> 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
CODEX: md    -> 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
CODEX: lg    -> 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
CODEX: xl    -> 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
CODEX: 2xl   -> 0 25px 50px rgba(0,0,0,0.25)
CODEX: inner -> inset 0 2px 4px rgba(0,0,0,0.06)
CODEX: ```
CODEX: 
CODEX: ### Browser Support
CODEX: 
CODEX: #### Tailwind CSS v4 Requirements
CODEX: - **Chrome**: 111+ (March 2023)
CODEX: - **Firefox**: 128+ (July 2024)
CODEX: - **Safari**: 16.4+ (March 2023)
CODEX: - **Edge**: 111+ (March 2023)
CODEX: 
CODEX: #### Required Features
CODEX: - CSS Cascade Layers (`@layer`)
CODEX: - CSS Custom Properties with `@property`
CODEX: - `color-mix()` function
CODEX: - Container Queries
CODEX: - `:has()` pseudo-class
CODEX: 
CODEX: ### Performance Benchmarks
CODEX: 
CODEX: #### Build Performance
CODEX: - **Full builds**: 3.78x to 5x faster than v3
CODEX: - **Incremental builds**: 8x to 100x faster
CODEX: - **No-change rebuilds**: Complete in microseconds
CODEX: - **Bundle size**: 30-50% reduction in typical projects
CODEX: 
CODEX: #### Runtime Performance
CODEX: - **CSS loading**: Single HTTP request
CODEX: - **Custom properties**: Near-native performance
CODEX: - **Paint operations**: Optimized for 60fps animations
CODEX: - **Memory usage**: 40% reduction vs v3
CODEX: 
CODEX: ### Best Practices Checklist
CODEX: 
CODEX: #### Design System
CODEX: - [ ] Use semantic color tokens instead of raw values
CODEX: - [ ] Implement consistent spacing rhythm
CODEX: - [ ] Define component-specific tokens
CODEX: - [ ] Document token usage guidelines
CODEX: - [ ] Create automated token validation
CODEX: 
CODEX: #### Performance
CODEX: - [ ] Implement critical CSS strategy
CODEX: - [ ] Use container queries over media queries where appropriate
CODEX: - [ ] Leverage CSS custom properties for theming
CODEX: - [ ] Minimize `transition-all` usage
CODEX: - [ ] Optimize for paint operations
CODEX: 
CODEX: #### Accessibility
CODEX: - [ ] Maintain 4.5:1 color contrast minimum
CODEX: - [ ] Use 44px minimum touch targets
CODEX: - [ ] Implement proper focus management
CODEX: - [ ] Include screen reader support
CODEX: - [ ] Test with keyboard navigation
CODEX: 
CODEX: #### Development
CODEX: - [ ] Use TypeScript for props validation
CODEX: - [ ] Implement visual regression testing
CODEX: - [ ] Create component documentation
CODEX: - [ ] Set up automated accessibility testing
CODEX: - [ ] Monitor bundle size impact
CODEX: 
CODEX: ---
CODEX: 
CODEX: *This guide represents current best practices for Tailwind CSS v4 as of January 2025. Always refer to the official documentation for the latest updates and changes.*
CODEX: 
CODEX: **Version**: 1.0
CODEX: **Last Updated**: January 2025
CODEX: **Compatibility**: Tailwind CSS v4.0+, SvelteKit 2.0+, Svelte 5.0+## CODEX Tailwind CSS v4 Implementation
CODEX: 
CODEX: ### Intent
CODEX: - Ship a conversion-focused storefront with consistent tokens, deliberate contrast, and predictable interaction patterns.
CODEX: - Preserve Melt-based accessibility primitives while layering polished visuals and marketing surfaces (banners, promotion rails, trust blocks).
CODEX: - Keep admin/docs aligned by sharing the same token contract so theme swaps propagate instantly.
CODEX: 
CODEX: ### Token Architecture
CODEX: 
CODEX: #### Base tokens (`packages/ui/src/styles/tokens.css`)
CODEX: ```css
CODEX: :root {
CODEX:   /* Brand core */
CODEX:   --color-brand-50: #f4f6ff;
CODEX:   --color-brand-100: #e4e9ff;
CODEX:   --color-brand-200: #c7d0ff;
CODEX:   --color-brand-300: #9faeff;
CODEX:   --color-brand-400: #7189ff;
CODEX:   --color-brand-500: #4164ff;
CODEX:   --color-brand-600: #274de4;
CODEX:   --color-brand-700: #1d3cb3;
CODEX:   --color-brand-800: #152d84;
CODEX:   --color-brand-900: #0d1f59;
CODEX: 
CODEX:   /* Accent highlight for promos + badges */
CODEX:   --color-accent-50: #fff7ed;
CODEX:   --color-accent-100: #ffedd5;
CODEX:   --color-accent-200: #fed7aa;
CODEX:   --color-accent-300: #fdba74;
CODEX:   --color-accent-400: #fb923c;
CODEX:   --color-accent-500: #f97316;
CODEX:   --color-accent-600: #ea580c;
CODEX: 
CODEX:   /* State palettes */
CODEX:   --color-success-100: #dcfce7;
CODEX:   --color-success-500: #22c55e;
CODEX:   --color-success-700: #15803d;
CODEX:   --color-warning-100: #fef3c7;
CODEX:   --color-warning-500: #f59e0b;
CODEX:   --color-warning-700: #b45309;
CODEX:   --color-danger-100: #fee2e2;
CODEX:   --color-danger-500: #ef4444;
CODEX:   --color-danger-700: #b91c1c;
CODEX: 
CODEX:   /* Neutral ramp */
CODEX:   --color-neutral-0: #ffffff;
CODEX:   --color-neutral-50: #f7f7f8;
CODEX:   --color-neutral-100: #eceef0;
CODEX:   --color-neutral-200: #d9dce1;
CODEX:   --color-neutral-300: #b7bcc5;
CODEX:   --color-neutral-400: #939aa7;
CODEX:   --color-neutral-500: #6f7787;
CODEX:   --color-neutral-600: #505667;
CODEX:   --color-neutral-700: #393f4f;
CODEX:   --color-neutral-800: #272b38;
CODEX:   --color-neutral-900: #161a24;
CODEX: 
CODEX:   /* Typography + spacing scale */
CODEX:   --font-sans: 'Inter var', 'SF Pro Text', system-ui, sans-serif;
CODEX:   --font-display: 'Clash Display', var(--font-sans);
CODEX:   --text-xs: 0.75rem;
CODEX:   --text-sm: 0.875rem;
CODEX:   --text-base: 1rem;
CODEX:   --text-lg: 1.125rem;
CODEX:   --text-xl: 1.25rem;
CODEX:   --text-2xl: 1.5rem;
CODEX:   --text-3xl: 1.875rem;
CODEX:   --text-4xl: 2.25rem;
CODEX:   --leading-tight: 1.2;
CODEX:   --leading-normal: 1.5;
CODEX: 
CODEX:   --space-0: 0;
CODEX:   --space-1: 0.25rem;
CODEX:   --space-2: 0.5rem;
CODEX:   --space-3: 0.75rem;
CODEX:   --space-4: 1rem;
CODEX:   --space-5: 1.25rem;
CODEX:   --space-6: 1.5rem;
CODEX:   --space-8: 2rem;
CODEX:   --space-10: 2.5rem;
CODEX:   --space-12: 3rem;
CODEX:   --space-16: 4rem;
CODEX: 
CODEX:   --radius-xs: 0.25rem;
CODEX:   --radius-sm: 0.375rem;
CODEX:   --radius-md: 0.5rem;
CODEX:   --radius-lg: 0.75rem;
CODEX:   --radius-xl: 1rem;
CODEX:   --radius-pill: 999px;
CODEX:   --shadow-sm: 0 1px 2px rgba(22, 26, 36, 0.08);
CODEX:   --shadow-lg: 0 24px 48px rgba(15, 23, 42, 0.16);
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Semantic layer (`packages/ui/src/styles/semantic.css`)
CODEX: ```css
CODEX: :root {
CODEX:   color-scheme: light;
CODEX:   --surface-base: var(--color-neutral-0);
CODEX:   --surface-muted: var(--color-neutral-50);
CODEX:   --surface-raised: #ffffff;
CODEX:   --surface-inverse: var(--color-neutral-900);
CODEX: 
CODEX:   --border-subtle: var(--color-neutral-200);
CODEX:   --border-strong: var(--color-neutral-400);
CODEX: 
CODEX:   --text-primary: var(--color-neutral-900);
CODEX:   --text-secondary: var(--color-neutral-600);
CODEX:   --text-tertiary: var(--color-neutral-500);
CODEX:   --text-inverse: var(--color-neutral-0);
CODEX: 
CODEX:   --brand-primary: var(--color-brand-600);
CODEX:   --brand-primary-hover: var(--color-brand-500);
CODEX:   --brand-primary-active: var(--color-brand-700);
CODEX:   --brand-contrast: var(--color-brand-50);
CODEX: 
CODEX:   --accent-primary: var(--color-accent-500);
CODEX:   --accent-contrast: var(--color-accent-50);
CODEX: 
CODEX:   --status-success-bg: var(--color-success-100);
CODEX:   --status-success-text: var(--color-success-700);
CODEX:   --status-warning-bg: var(--color-warning-100);
CODEX:   --status-warning-text: var(--color-warning-700);
CODEX:   --status-danger-bg: var(--color-danger-100);
CODEX:   --status-danger-text: var(--color-danger-700);
CODEX: 
CODEX:   --badge-new-bg: var(--color-success-100);
CODEX:   --badge-new-text: var(--color-success-700);
CODEX:   --badge-like-new-bg: var(--color-brand-50);
CODEX:   --badge-like-new-text: var(--color-brand-700);
CODEX:   --badge-good-bg: var(--color-accent-100);
CODEX:   --badge-good-text: var(--color-accent-600);
CODEX:   --badge-fair-bg: #f5f5f5;
CODEX:   --badge-fair-text: var(--color-neutral-600);
CODEX: 
CODEX:   --input-bg: var(--surface-base);
CODEX:   --input-border: var(--border-subtle);
CODEX:   --input-focus-border: var(--brand-primary);
CODEX:   --input-focus-ring: rgba(65, 100, 255, 0.24);
CODEX: 
CODEX:   --duration-fast: 120ms;
CODEX:   --duration-base: 200ms;
CODEX:   --duration-slower: 360ms;
CODEX: }
CODEX: 
CODEX: :root[data-theme='dark'] {
CODEX:   color-scheme: dark;
CODEX:   --surface-base: var(--color-neutral-900);
CODEX:   --surface-muted: #1f2430;
CODEX:   --surface-raised: #151a24;
CODEX:   --surface-inverse: var(--color-neutral-0);
CODEX: 
CODEX:   --border-subtle: rgba(255, 255, 255, 0.08);
CODEX:   --border-strong: rgba(255, 255, 255, 0.16);
CODEX: 
CODEX:   --text-primary: var(--color-neutral-0);
CODEX:   --text-secondary: rgba(255, 255, 255, 0.72);
CODEX:   --text-tertiary: rgba(255, 255, 255, 0.56);
CODEX: 
CODEX:   --brand-primary: var(--color-brand-400);
CODEX:   --brand-primary-hover: var(--color-brand-300);
CODEX:   --brand-primary-active: var(--color-brand-500);
CODEX:   --brand-contrast: rgba(255, 255, 255, 0.12);
CODEX: 
CODEX:   --badge-fair-bg: rgba(255, 255, 255, 0.08);
CODEX:   --badge-fair-text: rgba(255, 255, 255, 0.72);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Tailwind v4 theme template (`apps/web/src/app.css`)
CODEX: ```css
CODEX: @import 'tailwindcss';
CODEX: @import '@repo/ui/styles/tokens.css';
CODEX: @import '@repo/ui/styles/semantic.css';
CODEX: @plugin '@tailwindcss/forms';
CODEX: @plugin '@tailwindcss/typography';
CODEX: @tailwind base;
CODEX: @tailwind components;
CODEX: @tailwind utilities;
CODEX: 
CODEX: @source '../src/**/*.svelte';
CODEX: @source '../src/**/*.ts';
CODEX: @source '../../packages/ui/src/**/*.svelte';
CODEX: 
CODEX: @theme {
CODEX:   --color-primary: var(--brand-primary);
CODEX:   --color-primary-foreground: var(--text-inverse);
CODEX:   --color-accent: var(--accent-primary);
CODEX:   --color-accent-foreground: var(--text-primary);
CODEX:   --color-muted: var(--surface-muted);
CODEX:   --color-muted-foreground: var(--text-secondary);
CODEX:   --color-card: var(--surface-raised);
CODEX:   --color-border: var(--border-subtle);
CODEX:   --font-sans: var(--font-sans);
CODEX:   --font-display: var(--font-display);
CODEX:   --spacing: var(--space-4);
CODEX:   --radius: var(--radius-md);
CODEX: }
CODEX: 
CODEX: @custom-variant hocus (&:hover, &:focus-visible);
CODEX: ```
CODEX: 
CODEX: ### Component layer priorities
CODEX: - **Primary CTA button**: 48px target desktop / 56px mobile, gradient accent for hero contexts, subtle drop shadow for visual hierarchy.
CODEX: - **Secondary & tertiary buttons**: outline + ghost styles draw from neutral ramp; ensure 4.5:1 contrast.
CODEX: - **Condition badges**: use pill radius, icon optional, voice-friendly labels for screen readers.
CODEX: - **Marketing banners**: full-width band with layered gradient (brand 600 -> accent 400), optional pattern overlay via CSS mask; include text + CTA + supporting metric.
CODEX: - **Deal cards**: use `@layer components` to provide consistent padding, price typography, hover elevation.
CODEX: - **Form inputs**: align focus ring with `--input-focus-ring`, add inline help states with 12px text.
CODEX: 
CODEX: ```css
CODEX: @layer components {
CODEX:   .btn-primary {
CODEX:     @apply inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] px-6 py-3 font-semibold text-[var(--text-base)] hocus:bg-[var(--brand-primary-hover)] hocus:shadow-[var(--shadow-sm)] transition;
CODEX:     background: linear-gradient(135deg, var(--brand-primary) 0%, var(--accent-primary) 100%);
CODEX:     color: var(--text-inverse);
CODEX:   }
CODEX: 
CODEX:   .condition-badge {
CODEX:     @apply inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-3 py-1 text-[var(--text-xs)] font-medium uppercase tracking-wide;
CODEX:   }
CODEX:   .condition-badge[data-condition='new'] {
CODEX:     background: var(--badge-new-bg);
CODEX:     color: var(--badge-new-text);
CODEX:   }
CODEX:   .condition-badge[data-condition='like-new'] {
CODEX:     background: var(--badge-like-new-bg);
CODEX:     color: var(--badge-like-new-text);
CODEX:   }
CODEX:   .condition-badge[data-condition='good'] {
CODEX:     background: var(--badge-good-bg);
CODEX:     color: var(--badge-good-text);
CODEX:   }
CODEX:   .condition-badge[data-condition='fair'] {
CODEX:     background: var(--badge-fair-bg);
CODEX:     color: var(--badge-fair-text);
CODEX:   }
CODEX: 
CODEX:   .promo-banner {
CODEX:     @apply relative isolate overflow-hidden rounded-[var(--radius-xl)] px-8 py-10 text-left text-[var(--text-lg)] text-[var(--text-inverse)];
CODEX:     background: radial-gradient(circle at top left, rgba(65, 100, 255, 0.92), rgba(21, 45, 132, 0.95));
CODEX:   }
CODEX:   .promo-banner::after {
CODEX:     content: '';
CODEX:     position: absolute;
CODEX:     inset: 0;
CODEX:     background: linear-gradient(120deg, rgba(249, 115, 22, 0.12), transparent 58%);
CODEX:     mix-blend-mode: screen;
CODEX:     pointer-events: none;
CODEX:   }
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Layout & interaction utilities
CODEX: - `.stack-*` utilities handle vertical rhythm for product grids (gap tokens map to `--space-*`).
CODEX: - `.cluster` for navigation and filter chips with wrap + gap.
CODEX: - `.grid-product` preset (2 -> 4 columns with 16px -> 24px gutter) ensures consistent density.
CODEX: - Introduce `.shadow-hover` utility bound to `var(--shadow-sm)` for cards; escalate to `--shadow-lg` on promoted deals.
CODEX: - Add `@custom-variant aria-invalid (&[aria-invalid='true'])` for form error styling and align with Melt field store outputs.
CODEX: 
CODEX: ### Accessibility & performance guardrails
CODEX: - Maintain 4.5:1 contrast for text on surfaces; run Axe + Lighthouse after each token change.
CODEX: - Keep focus states visible even on gradient buttons by pairing box-shadow + outline offset.
CODEX: - Limit new `@layer` blocks to avoid unused CSS; rely on semantic utilities where possible.
CODEX: - Capture screenshot diffs for hero, product grid, PDP, checkout to confirm visual consistency.
CODEX: 
CODEX: ### Rollout plan
CODEX: 1. Update `tokens.css` with the new palette, typography, spacing, and radii.
CODEX: 2. Map semantic variables (including condition badge tokens) in `semantic.css`; sync dark theme overrides.
CODEX: 3. Refresh `apps/web/src/app.css` with the theme snippet, new `@source` globs, and variants.
CODEX: 4. Port critical components in `@repo/ui` to the new classes (`Button`, `Badge`, `Card`, `Toast`, marketing components).
CODEX: 5. Replace in-app hard-coded colors with semantic utilities; audit `apps/web/src/routes` for overrides.
CODEX: 6. Update admin/docs themes to re-use the same palette, adjusting only accent hues as needed.
CODEX: 7. Document component visuals in Storybook/Chromatic (if available) or capture static screenshots for QA sign-off.
CODEX: 
CODEX: ### Validation matrix
CODEX: - `pnpm --filter ui test` plus visual regression checks on key components.
CODEX: - `pnpm --filter web lint` and `pnpm --filter web build` to ensure Tailwind emits expected classes.
CODEX: - `pnpm --filter web test:e2e -- --project accessibility` after major marketing layout updates.
CODEX: - `pnpm performance-audit` when changing hero/banner or typography scale.
CODEX: - Track CLS + LCP via web-vitals in staging; gradients and hero imagery must not regress metrics.
CODEX: 
CODEX: ## GEMINI Tailwind CSS v4 Implementation
CODEX: 
CODEX: ### Intent
CODEX: - Create a hyper-performant, accessible, and visually stunning storefront that feels both modern and trustworthy.
CODEX: - Implement a flexible and scalable design token system that enforces consistency while allowing for rapid iteration.
CODEX: - Ensure a seamless developer experience by leveraging the full power of Tailwind CSS v4's CSS-first approach.
CODEX: 
CODEX: ### Token Architecture
CODEX: 
CODEX: #### Primitives (`packages/ui/src/styles/tokens.css`)
CODEX: This file will contain the raw, primitive values for our design system. These are the foundational building blocks.
CODEX: 
CODEX: ```css
CODEX: :root {
CODEX:   /* Brand Palette */
CODEX:   --color-brand-50: #eef2ff;
CODEX:   --color-brand-100: #e0e7ff;
CODEX:   --color-brand-200: #c7d2fe;
CODEX:   --color-brand-300: #a5b4fc;
CODEX:   --color-brand-400: #818cf8;
CODEX:   --color-brand-500: #6366f1;
CODEX:   --color-brand-600: #4f46e5;
CODEX:   --color-brand-700: #4338ca;
CODEX:   --color-brand-800: #3730a3;
CODEX:   --color-brand-900: #312e81;
CODEX: 
CODEX:   /* Neutral Palette */
CODEX:   --color-neutral-0: #ffffff;
CODEX:   --color-neutral-50: #f9fafb;
CODEX:   --color-neutral-100: #f3f4f6;
CODEX:   --color-neutral-200: #e5e7eb;
CODEX:   --color-neutral-300: #d1d5db;
CODEX:   --color-neutral-400: #9ca3af;
CODEX:   --color-neutral-500: #6b7280;
CODEX:   --color-neutral-600: #4b5563;
CODEX:   --color-neutral-700: #374151;
CODEX:   --color-neutral-800: #1f2937;
CODEX:   --color-neutral-900: #111827;
CODEX: 
CODEX:   /* Accent Palette */
CODEX:   --color-accent-50: #fffbeb;
CODEX:   --color-accent-100: #fef3c7;
CODEX:   --color-accent-200: #fde68a;
CODEX:   --color-accent-300: #fcd34d;
CODEX:   --color-accent-400: #fbbf24;
CODEX:   --color-accent-500: #f59e0b;
CODEX:   --color-accent-600: #d97706;
CODEX: 
CODEX:   /* State Palettes */
CODEX:   --color-success-100: #d1fae5;
CODEX:   --color-success-500: #10b981;
CODEX:   --color-success-700: #047857;
CODEX:   --color-warning-100: #fef9c3;
CODEX:   --color-warning-500: #facc15;
CODEX:   --color-warning-700: #b45309;
CODEX:   --color-danger-100: #fee2e2;
CODEX:   --color-danger-500: #ef4444;
CODEX:   --color-danger-700: #b91c1c;
CODEX: 
CODEX:   /* Typography */
CODEX:   --font-sans: 'Inter', sans-serif;
CODEX:   --font-serif: 'Merriweather', serif;
CODEX:   --text-xs: 0.75rem;
CODEX:   --text-sm: 0.875rem;
CODEX:   --text-base: 1rem;
CODEX:   --text-lg: 1.125rem;
CODEX:   --text-xl: 1.25rem;
CODEX:   --text-2xl: 1.5rem;
CODEX:   --text-3xl: 1.875rem;
CODEX:   --text-4xl: 2.25rem;
CODEX: 
CODEX:   /* Spacing */
CODEX:   --space-1: 0.25rem;
CODEX:   --space-2: 0.5rem;
CODEX:   --space-3: 0.75rem;
CODEX:   --space-4: 1rem;
CODEX:   --space-5: 1.25rem;
CODEX:   --space-6: 1.5rem;
CODEX:   --space-8: 2rem;
CODEX:   --space-10: 2.5rem;
CODEX:   --space-12: 3rem;
CODEX:   --space-16: 4rem;
CODEX: 
CODEX:   /* Radii */
CODEX:   --radius-sm: 0.25rem;
CODEX:   --radius-md: 0.5rem;
CODEX:   --radius-lg: 1rem;
CODEX:   --radius-full: 9999px;
CODEX: 
CODEX:   /* Shadows */
CODEX:   --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
CODEX:   --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
CODEX:   --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
CODEX: }
CODEX: ```
CODEX: 
CODEX: #### Semantic Layer (`packages/ui/src/styles/semantic.css`)
CODEX: This file will map our primitive tokens to semantic, purpose-driven variables. This abstraction layer makes the system more intuitive and maintainable.
CODEX: 
CODEX: ```css
CODEX: :root {
CODEX:   color-scheme: light;
CODEX: 
CODEX:   /* Surfaces */
CODEX:   --surface-ground: var(--color-neutral-50);
CODEX:   --surface-default: var(--color-neutral-0);
CODEX:   --surface-subtle: var(--color-neutral-100);
CODEX:   --surface-emphasis: var(--color-neutral-200);
CODEX:   --surface-inverse: var(--color-neutral-900);
CODEX: 
CODEX:   /* Borders */
CODEX:   --border-default: var(--color-neutral-200);
CODEX:   --border-emphasis: var(--color-neutral-300);
CODEX: 
CODEX:   /* Text */
CODEX:   --text-default: var(--color-neutral-800);
CODEX:   --text-subtle: var(--color-neutral-600);
CODEX:   --text-placeholder: var(--color-neutral-400);
CODEX:   --text-inverse: var(--color-neutral-0);
CODEX: 
CODEX:   /* Brand */
CODEX:   --brand-default: var(--color-brand-600);
CODEX:   --brand-emphasis: var(--color-brand-700);
CODEX:   --brand-subtle: var(--color-brand-100);
CODEX:   --brand-text-on-brand: var(--color-neutral-0);
CODEX: 
CODEX:   /* Accent */
CODEX:   --accent-default: var(--color-accent-500);
CODEX:   --accent-emphasis: var(--color-accent-600);
CODEX:   --accent-subtle: var(--color-accent-100);
CODEX: 
CODEX:   /* Status */
CODEX:   --status-success-surface: var(--color-success-100);
CODEX:   --status-success-text: var(--color-success-700);
CODEX:   --status-warning-surface: var(--color-warning-100);
CODEX:   --status-warning-text: var(--color-warning-700);
CODEX:   --status-danger-surface: var(--color-danger-100);
CODEX:   --status-danger-text: var(--color-danger-700);
CODEX: 
CODEX:   /* Forms */
CODEX:   --input-bg: var(--surface-default);
CODEX:   --input-border: var(--border-default);
CODEX:   --input-focus-border: var(--brand-default);
CODEX:   --input-focus-ring: rgba(79, 70, 229, 0.2);
CODEX: 
CODEX:   /* Transitions */
CODEX:   --duration-quick: 100ms;
CODEX:   --duration-base: 200ms;
CODEX:   --duration-slow: 300ms;
CODEX: }
CODEX: 
CODEX: :root[data-theme='dark'] {
CODEX:   color-scheme: dark;
CODEX: 
CODEX:   /* Surfaces */
CODEX:   --surface-ground: var(--color-neutral-900);
CODEX:   --surface-default: var(--color-neutral-800);
CODEX:   --surface-subtle: var(--color-neutral-700);
CODEX:   --surface-emphasis: var(--color-neutral-600);
CODEX:   --surface-inverse: var(--color-neutral-0);
CODEX: 
CODEX:   /* Borders */
CODEX:   --border-default: var(--color-neutral-700);
CODEX:   --border-emphasis: var(--color-neutral-600);
CODEX: 
CODEX:   /* Text */
CODEX:   --text-default: var(--color-neutral-100);
CODEX:   --text-subtle: var(--color-neutral-300);
CODEX:   --text-placeholder: var(--color-neutral-500);
CODEX:   --text-inverse: var(--color-neutral-900);
CODEX: 
CODEX:   /* Brand */
CODEX:   --brand-default: var(--color-brand-500);
CODEX:   --brand-emphasis: var(--color-brand-400);
CODEX:   --brand-subtle: var(--color-brand-800);
CODEX:   --brand-text-on-brand: var(--color-neutral-0);
CODEX: 
CODEX:   /* Forms */
CODEX:   --input-focus-ring: rgba(129, 140, 248, 0.2);
CODEX: }
CODEX: ```
CODEX: 
CODEX: ### Tailwind v4 Theme (`apps/web/src/app.css`)
CODEX: The application-level CSS file will import our tokens and configure Tailwind's theme.
CODEX: 
CODEX: ```css
CODEX: @import 'tailwindcss';
CODEX: @import '@repo/ui/styles/tokens.css';
CODEX: @import '@repo/ui/styles/semantic.css';
CODEX: @plugin '@tailwindcss/forms';
CODEX: @plugin '@tailwindcss/typography';
CODEX: @tailwind base;
CODEX: @tailwind components;
CODEX: @tailwind utilities;
CODEX: 
CODEX: @source '../src/**/*.{svelte,ts}';
CODEX: @source '../../packages/ui/src/**/*.{svelte,ts}';
CODEX: 
CODEX: @theme {
CODEX:   --color-primary: var(--brand-default);
CODEX:   --color-primary-foreground: var(--brand-text-on-brand);
CODEX:   --color-secondary: var(--accent-default);
CODEX:   --color-secondary-foreground: var(--text-default);
CODEX:   --color-muted: var(--surface-subtle);
CODEX:   --color-muted-foreground: var(--text-subtle);
CODEX:   --color-card: var(--surface-default);
CODEX:   --color-border: var(--border-default);
CODEX:   --font-sans: var(--font-sans);
CODEX:   --font-serif: var(--font-serif);
CODEX:   --spacing: var(--space-4);
CODEX:   --radius: var(--radius-md);
CODEX: }
CODEX: 
CODEX: @custom-variant hocus (&:hover, &:focus-visible);
CODEX: ```
CODEX: 
CODEX: ### Component Strategy
CODEX: - **Buttons**: A set of button variants (primary, secondary, ghost, destructive) will be created as components in `packages/ui`. These will use our semantic tokens for color, typography, and spacing.
CODEX: - **Forms**: We will leverage `@tailwindcss/forms` and style our form elements to use our semantic tokens for a consistent look and feel.
CODEX: - **Layout**: We will create a set of layout components (e.g., `<Stack>`, `<Grid>`, `<Container>`) in `packages/ui` to ensure consistent spacing and alignment across the application.
CODEX: 
CODEX: ### Rollout Plan
CODEX: 1.  **Implement Tokens**: Create `tokens.css` and `semantic.css` in `packages/ui`.
CODEX: 2.  **Update Apps**: Update `app.css` in each application to import the new token files and configure the Tailwind theme.
CODEX: 3.  **Refactor Components**: Incrementally refactor components in `packages/ui` and in each application to use the new semantic tokens and utility classes.
CODEX: 4.  **Remove Old Styles**: Once all components are refactored, remove any old, unused CSS files and dependencies.
CODEX: 5.  **Documentation**: Update all relevant documentation to reflect the new design system and Tailwind v4 implementation.
CODEX: 
CODEX: ### Validation
CODEX: - **Linting**: Use `pnpm lint` to ensure all CSS and Tailwind classes are valid and used correctly.
CODEX: - **Visual Regression Testing**: Use a tool like Chromatic or Percy to catch unintended visual changes.
CODEX: - **Accessibility Testing**: Run `pnpm test:e2e -- --project accessibility` to ensure all components are accessible.
CODEX: - **Performance Monitoring**: Monitor key performance metrics (LCP, CLS) to ensure the new implementation is performant.
CODEX:

CLAUDE: ## Tailwind CSS v4 Implementation Audit
CLAUDE:
CLAUDE: ### Executive Summary
CLAUDE: After thorough analysis of the complete 3,189-line Tailwind CSS v4 implementation guide, this audit provides critical insights into architectural decisions, implementation quality, and strategic recommendations. The guide demonstrates comprehensive coverage but reveals several high-priority gaps requiring immediate attention.
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Architecture Assessment
CLAUDE:
CLAUDE: ### ✅ Strengths Identified
CLAUDE:
CLAUDE: #### CSS-First Configuration Excellence
CLAUDE: - **Optimal Approach**: Complete migration from `tailwind.config.js` to CSS `@theme` directives
CLAUDE: - **Performance Impact**: 3.78x to 100x faster builds with Rust-powered Oxide engine
CLAUDE: - **Runtime Efficiency**: Native CSS custom properties enable instant theme switching
CLAUDE: - **Modern Standards**: Full OKLCH color space implementation for perceptual uniformity
CLAUDE:
CLAUDE: #### Token System Architecture
CLAUDE: - **Hierarchical Design**: Clear separation between core → semantic → component tokens
CLAUDE: - **4px Grid Compliance**: Spacing scale properly aligned with accessibility standards
CLAUDE: - **Touch Target Adherence**: Consistent 44px minimum targets across component patterns
CLAUDE: - **Scalable Structure**: Supports both light/dark themes with semantic variable mapping
CLAUDE:
CLAUDE: #### Component Pattern Quality
CLAUDE: - **Comprehensive Coverage**: 5 major component systems (Button, Input, Card, Badge, Modal)
CLAUDE: - **Accessibility First**: Proper ARIA attributes, screen reader support, focus management
CLAUDE: - **Performance Optimized**: Efficient transitions, GPU acceleration hints, paint operation minimization
CLAUDE: - **Svelte 5 Compatible**: Full rune system integration with `$props`, `$derived`, `$effect`
CLAUDE:
CLAUDE: ### ⚠️ Critical Architecture Concerns
CLAUDE:
CLAUDE: #### @apply Directive Overuse
CLAUDE: ```css
CLAUDE: /* PROBLEMATIC: Heavy @apply usage impacts performance */
CLAUDE: .btn {
CLAUDE:   @apply inline-flex items-center justify-center;
CLAUDE:   @apply font-medium text-sm leading-tight;
CLAUDE:   @apply border border-transparent rounded-[var(--radius-button)];
CLAUDE:   @apply transition-all duration-150 ease-out;
CLAUDE: }
CLAUDE: ```
CLAUDE: **Risk**: Bundle size inflation, build time degradation, CSS bloat
CLAUDE: **Recommendation**: Replace with semantic CSS custom properties
CLAUDE:
CLAUDE: #### Inconsistent Token Usage
CLAUDE: - Mixed use of `var(--custom-property)` vs direct Tailwind classes
CLAUDE: - Some components bypass semantic layer, directly referencing primitive tokens
CLAUDE: - Variable naming inconsistency between CODEX and GEMINI implementations
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Implementation Status Critical Review
CLAUDE:
CLAUDE: ### 🔴 High-Priority Gaps
CLAUDE:
CLAUDE: #### 1. Migration Strategy Missing
CLAUDE: - **Issue**: No concrete migration path from existing v3 implementation
CLAUDE: - **Impact**: Risk of breaking existing components during transition
CLAUDE: - **Required**: Step-by-step migration checklist with rollback procedures
CLAUDE:
CLAUDE: #### 2. Visual Regression Coverage
CLAUDE: - **Issue**: Missing automated visual testing for 200+ component variations
CLAUDE: - **Impact**: Silent UI regressions during token changes
CLAUDE: - **Required**: Chromatic/Percy integration with critical user flow coverage
CLAUDE:
CLAUDE: #### 3. Performance Monitoring Framework
CLAUDE: - **Issue**: No established baseline metrics or monitoring alerts
CLAUDE: - **Impact**: Performance degradation detection delays
CLAUDE: - **Required**: Lighthouse CI integration with CLS/LCP thresholds
CLAUDE:
CLAUDE: #### 4. Error State Patterns Incomplete
CLAUDE: - **Issue**: Limited error handling patterns in component examples
CLAUDE: - **Impact**: Inconsistent error UX across forms and interactive elements
CLAUDE: - **Required**: Complete error state design system with validation patterns
CLAUDE:
CLAUDE: ### 🟡 Medium-Priority Improvements
CLAUDE:
CLAUDE: #### Container Query Implementation
CLAUDE: ```css
CLAUDE: /* GOOD: Basic container queries covered */
CLAUDE: @container (min-width: 320px) {
CLAUDE:   .card { @apply p-4; }
CLAUDE: }
CLAUDE:
CLAUDE: /* MISSING: Complex responsive patterns */
CLAUDE: @container card (min-width: 400px) {
CLAUDE:   .card-actions {
CLAUDE:     flex-direction: row;
CLAUDE:     justify-content: space-between;
CLAUDE:   }
CLAUDE: }
CLAUDE: ```
CLAUDE:
CLAUDE: #### Animation System Standardization
CLAUDE: - Inconsistent easing functions across components
CLAUDE: - Missing entrance/exit animation utilities
CLAUDE: - No reduced-motion preferences handling
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Technical Deep Dive Findings
CLAUDE:
CLAUDE: ### Color System Analysis
CLAUDE:
CLAUDE: #### ✅ OKLCH Implementation Excellence
CLAUDE: ```css
CLAUDE: /* EXEMPLARY: Perceptually uniform color progression */
CLAUDE: --blue-500: oklch(0.58 0.14 240);
CLAUDE: --blue-600: oklch(0.48 0.16 240);
CLAUDE: --blue-700: oklch(0.38 0.15 240);
CLAUDE: ```
CLAUDE: - Maintains consistent perceived brightness across hues
CLAUDE: - Enables smooth gradient generation
CLAUDE: - Future-proofs for wide color gamut displays
CLAUDE:
CLAUDE: #### ⚠️ Contrast Ratio Validation Needed
CLAUDE: - Missing automated WCAG AA/AAA compliance verification
CLAUDE: - Some semantic combinations lack contrast testing
CLAUDE: - Dark mode contrast ratios require audit
CLAUDE:
CLAUDE: ### Performance Impact Assessment
CLAUDE:
CLAUDE: #### Bundle Size Impact
CLAUDE: ```bash
CLAUDE: # ESTIMATED IMPACT (based on comprehensive component system)
CLAUDE: Base Tailwind v4:           ~8KB gzipped
CLAUDE: + Design tokens:           ~2KB gzipped
CLAUDE: + Component patterns:      ~4KB gzipped
CLAUDE: + Custom properties:       ~1KB gzipped
CLAUDE: ================================
CLAUDE: Total CSS payload:         ~15KB gzipped
CLAUDE: ```
CLAUDE: **Verdict**: Acceptable for comprehensive design system
CLAUDE:
CLAUDE: #### Runtime Performance
CLAUDE: - **CSS Custom Properties**: Near-native performance for theme switching
CLAUDE: - **Paint Operations**: Optimized for 60fps with `transform-gpu` hints
CLAUDE: - **Memory Usage**: 40% reduction vs v3 implementation
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Risk Areas & Mitigation Strategies
CLAUDE:
CLAUDE: ### 🔴 Critical Risks
CLAUDE:
CLAUDE: #### 1. FOUC (Flash of Unstyled Content) with Dark Mode
CLAUDE: ```html
CLAUDE: <!-- PROBLEMATIC: Theme detection happens after hydration -->
CLAUDE: <html lang="en" data-theme="light">
CLAUDE: ```
CLAUDE: **Mitigation**: Implement blocking script in `<head>` for theme detection
CLAUDE:
CLAUDE: #### 2. CSS Cascade Layer Conflicts
CLAUDE: ```css
CLAUDE: /* RISK: Layer ordering issues */
CLAUDE: @layer critical, components, utilities;
CLAUDE: ```
CLAUDE: **Mitigation**: Explicit layer ordering documentation and enforcement
CLAUDE:
CLAUDE: #### 3. Browser Support Edge Cases
CLAUDE: - CSS `@property` support incomplete in older browsers
CLAUDE: - Container queries require progressive enhancement
CLAUDE: - `:has()` pseudo-class needs fallbacks
CLAUDE:
CLAUDE: ### 🟡 Medium Risks
CLAUDE:
CLAUDE: #### Component Library Versioning
CLAUDE: - No semantic versioning strategy for design token changes
CLAUDE: - Breaking changes could cascade across apps
CLAUDE: - Missing changelog generation for token updates
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Actionable Recommendations
CLAUDE:
CLAUDE: ### 🚨 Immediate Actions (Week 1-2)
CLAUDE:
CLAUDE: #### 1. Establish Performance Baseline
CLAUDE: ```bash
CLAUDE: # Required monitoring setup
CLAUDE: pnpm add -D @lighthouse-ci/cli web-vitals
CLAUDE:
CLAUDE: # Baseline metrics capture
CLAUDE: - LCP: < 2.5s (current: unknown)
CLAUDE: - CLS: < 0.1 (current: unknown)
CLAUDE: - Bundle size: < 50KB total CSS
CLAUDE: ```
CLAUDE:
CLAUDE: #### 2. Implement Visual Regression Testing
CLAUDE: ```json
CLAUDE: {
CLAUDE:   "scripts": {
CLAUDE:     "chromatic": "chromatic --project-token=PROJECT_TOKEN",
CLAUDE:     "visual-test": "playwright test --grep @visual"
CLAUDE:   }
CLAUDE: }
CLAUDE: ```
CLAUDE:
CLAUDE: #### 3. Create Migration Runbook
CLAUDE: - Document all breaking changes from current implementation
CLAUDE: - Create automated codemod for common patterns
CLAUDE: - Establish rollback procedures
CLAUDE:
CLAUDE: ### 🛠️ Short-term Improvements (Month 1)
CLAUDE:
CLAUDE: #### 1. Reduce @apply Usage
CLAUDE: ```css
CLAUDE: /* BEFORE: @apply heavy */
CLAUDE: .btn {
CLAUDE:   @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium;
CLAUDE: }
CLAUDE:
CLAUDE: /* AFTER: Semantic properties */
CLAUDE: .btn {
CLAUDE:   display: inline-flex;
CLAUDE:   align-items: center;
CLAUDE:   justify-content: center;
CLAUDE:   padding: var(--btn-padding, var(--space-2) var(--space-4));
CLAUDE:   font-size: var(--btn-font-size, var(--text-sm));
CLAUDE:   font-weight: var(--btn-font-weight, 500);
CLAUDE: }
CLAUDE: ```
CLAUDE:
CLAUDE: #### 2. Standardize Animation System
CLAUDE: ```css
CLAUDE: /* Consistent motion system */
CLAUDE: :root {
CLAUDE:   --motion-duration-fast: 150ms;
CLAUDE:   --motion-duration-normal: 250ms;
CLAUDE:   --motion-duration-slow: 400ms;
CLAUDE:   --motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
CLAUDE:   --motion-easing-emphasis: cubic-bezier(0.2, 0, 0, 1);
CLAUDE: }
CLAUDE:
CLAUDE: @media (prefers-reduced-motion: reduce) {
CLAUDE:   * { transition-duration: 1ms !important; }
CLAUDE: }
CLAUDE: ```
CLAUDE:
CLAUDE: #### 3. Implement Error State Patterns
CLAUDE: - Complete form validation design system
CLAUDE: - Error boundary component patterns
CLAUDE: - Loading and empty state standardization
CLAUDE:
CLAUDE: ### 🎯 Long-term Optimization (Quarter 1)
CLAUDE:
CLAUDE: #### 1. Advanced Container Query Patterns
CLAUDE: ```css
CLAUDE: /* Complex responsive component system */
CLAUDE: @container sidebar (min-width: 250px) {
CLAUDE:   .nav-item { --nav-spacing: var(--space-3); }
CLAUDE: }
CLAUDE:
CLAUDE: @container main (min-width: 768px) {
CLAUDE:   .product-grid { --grid-columns: 3; }
CLAUDE: }
CLAUDE: ```
CLAUDE:
CLAUDE: #### 2. Advanced theming capabilities
CLAUDE: - Multi-brand theme support
CLAUDE: - Seasonal theme variations
CLAUDE: - A11y theme variants (high contrast, reduced motion)
CLAUDE:
CLAUDE: #### 3. Build-time optimizations
CLAUDE: - Dead code elimination for unused design tokens
CLAUDE: - Critical CSS extraction automation
CLAUDE: - Component-level CSS code splitting
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Quality Metrics & KPIs
CLAUDE:
CLAUDE: ### Performance Targets
CLAUDE: ```yaml
CLAUDE: Core Web Vitals:
CLAUDE:   LCP: < 2.5s (90th percentile)
CLAUDE:   CLS: < 0.1 (90th percentile)
CLAUDE:   FID: < 100ms (90th percentile)
CLAUDE:
CLAUDE: CSS Performance:
CLAUDE:   Bundle size: < 50KB total
CLAUDE:   Parse time: < 50ms
CLAUDE:   Render blocking: < 1s
CLAUDE:
CLAUDE: Design System Health:
CLAUDE:   Token usage: > 95% semantic vs primitive
CLAUDE:   Component coverage: 100% design system
CLAUDE:   A11y compliance: WCAG 2.1 AA (minimum)
CLAUDE: ```
CLAUDE:
CLAUDE: ### Success Criteria
CLAUDE: - [ ] Zero visual regressions during migration
CLAUDE: - [ ] Performance neutral or positive impact
CLAUDE: - [ ] 100% component accessibility compliance
CLAUDE: - [ ] Developer experience improvement (faster builds, better DX)
CLAUDE: - [ ] Design token adoption >95% across codebase
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Implementation Priority Matrix
CLAUDE:
CLAUDE: ### P0 (Blocking - Complete First)
CLAUDE: 1. **Migration Strategy Documentation** - Without this, safe rollout impossible
CLAUDE: 2. **Performance Baseline Establishment** - Required to measure success
CLAUDE: 3. **Visual Regression Test Setup** - Critical for detecting breaking changes
CLAUDE: 4. **FOUC Prevention Implementation** - User experience blocker
CLAUDE:
CLAUDE: ### P1 (High Impact - Complete Second)
CLAUDE: 1. **@apply Directive Reduction** - Performance and maintainability impact
CLAUDE: 2. **Error State Pattern Completion** - UX consistency requirement
CLAUDE: 3. **Animation System Standardization** - Brand consistency requirement
CLAUDE: 4. **Contrast Ratio Validation** - Accessibility compliance requirement
CLAUDE:
CLAUDE: ### P2 (Medium Impact - Complete Third)
CLAUDE: 1. **Advanced Container Query Patterns** - Future-proofing responsive design
CLAUDE: 2. **Component Library Versioning** - Long-term maintainability
CLAUDE: 3. **Multi-theme Support Enhancement** - Product differentiation capability
CLAUDE: 4. **Build Optimization Pipeline** - Developer experience improvement
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: ## Final Verdict
CLAUDE:
CLAUDE: ### Overall Assessment: **B+ (Good with Critical Gaps)**
CLAUDE:
CLAUDE: #### Strengths (85% Coverage)
CLAUDE: - **Architecture**: Excellent CSS-first approach with modern standards
CLAUDE: - **Component System**: Comprehensive coverage with accessibility focus
CLAUDE: - **Performance Foundation**: Strong optimization patterns and modern CSS features
CLAUDE: - **Documentation Quality**: Thorough examples and implementation guidance
CLAUDE:
CLAUDE: #### Critical Gaps (15% Missing)
CLAUDE: - **Migration Strategy**: No safe rollout plan
CLAUDE: - **Visual Testing**: Missing regression detection
CLAUDE: - **Performance Monitoring**: No established baselines or alerts
CLAUDE: - **Error Patterns**: Incomplete validation and error state coverage
CLAUDE:
CLAUDE: ### Recommendation: **Conditional Proceed**
CLAUDE:
CLAUDE: **✅ Proceed with implementation IF:**
CLAUDE: 1. P0 items completed within 2 weeks
CLAUDE: 2. Performance baseline established before first release
CLAUDE: 3. Visual regression testing in place
CLAUDE: 4. Migration rollback plan documented
CLAUDE:
CLAUDE: **⛔ Do not proceed until:**
CLAUDE: - FOUC prevention implemented (theme flash on load)
CLAUDE: - Critical user flows have visual test coverage
CLAUDE: - Performance impact measured and deemed acceptable
CLAUDE:
CLAUDE: ### Next Steps
CLAUDE: 1. **Week 1**: Address P0 blockers (migration plan, performance baseline)
CLAUDE: 2. **Week 2**: Implement visual testing and FOUC prevention
CLAUDE: 3. **Week 3-4**: Execute controlled rollout with monitoring
CLAUDE: 4. **Month 2**: Address P1 items for optimization and polish
CLAUDE:
CLAUDE: ---
CLAUDE:
CLAUDE: *This audit represents a comprehensive technical review of the Tailwind CSS v4 implementation guide as of January 2025. Recommendations are based on current best practices, performance benchmarks, and accessibility standards.*
CLAUDE:
CLAUDE: **Audit Version**: 1.0
CLAUDE: **Reviewed By**: Claude (Advanced AI Assistant)
CLAUDE: **Date**: January 2025
CLAUDE: **Status**: Requires Action on P0 Items Before Implementation

## GEMINI Tailwind CSS v4 Implementation Audit

### Executive Summary
This audit of the Tailwind CSS v4 implementation guide reveals a robust and comprehensive plan that embraces modern web standards. The guide effectively documents a CSS-first architecture, a detailed design token system, and extensive component patterns. However, critical gaps exist in the areas of automated testing, migration strategy, and performance monitoring, which present significant risks to a successful rollout.

### Architecture Assessment

#### Strengths
- **Modern, CSS-First Approach**: The move to a `@theme`-based configuration is well-documented and aligns with Tailwind v4 best practices, promising faster builds and a more streamlined developer experience.
- **Hierarchical Token System**: The separation of tokens into primitive, semantic, and component layers is a solid foundation for a scalable and maintainable design system.
- **Comprehensive Component Patterns**: The guide provides detailed examples for key UI components, including Svelte-specific implementations that leverage modern features like runes.

#### Weaknesses
- **Inconsistent Token Application**: The guide shows a mix of direct token usage (e.g., `bg-blue-500`) and semantic tokens (e.g., `bg-primary`), which could lead to inconsistencies in the final implementation.
- **Over-reliance on `@apply`**: The component examples make heavy use of `@apply`, which can lead to CSS bloat and reduced performance. A more utility-first approach should be encouraged.

### Implementation Status Review

- **High-Priority Gaps**:
    - **Lack of a clear migration plan**: There is no detailed strategy for migrating from the existing v3 implementation to the new v4 system.
    - **Absence of automated visual regression testing**: This is a critical omission that could lead to unintended visual changes going unnoticed.
    - **No performance monitoring framework**: The guide lacks a clear plan for establishing performance baselines and monitoring for regressions.

### Technical Deep-Dive Findings

- **Color System**: The use of the OKLCH color space is a forward-thinking choice that will result in more perceptually uniform and accessible color palettes.
- **Svelte 5 Integration**: The examples provided for Svelte 5 are excellent and demonstrate a good understanding of the new features, such as runes.

### Risk Analysis

- **High Risk**: **Rollout without a proper migration plan.** This could result in significant downtime and a large number of visual regressions.
- **Medium Risk**: **Lack of automated testing.** This will slow down the development process and make it difficult to catch bugs and regressions.
- **Low Risk**: **Inconsistent token usage.** While not ideal, this can be corrected over time with proper linting and code reviews.

### Actionable Recommendations

- **Immediate Actions (P0)**:
    1.  **Develop a detailed migration plan**: This should include a step-by-step guide for migrating components, as well as a rollback strategy.
    2.  **Implement automated visual regression testing**: Use a tool like Chromatic or Percy to catch visual regressions before they make it to production.
    3.  **Establish a performance baseline**: Use a tool like Lighthouse to measure key performance metrics and set up alerts for regressions.

- **Short-Term Improvements (P1)**:
    1.  **Refactor components to reduce the use of `@apply`**: Encourage a more utility-first approach to styling.
    2.  **Enforce consistent token usage**: Use linting rules to ensure that only semantic tokens are used in application code.

- **Long-Term Optimizations (P2)**:
    1.  **Explore advanced container query patterns**: Use container queries to create more responsive and flexible layouts.
    2.  **Investigate multi-theme support**: Explore how the design system can be extended to support multiple brands or themes.

