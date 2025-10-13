# UI Package

**Purpose**: Shared component library and design system for all Driplo applications.

**Owner**: Design System Team
**Backup Contact**: Development Team

## Overview

The UI package provides reusable components, tokens, and utilities:
- Svelte 5 components with TypeScript support
- Design tokens and CSS variables
- Tailwind CSS utilities and semantic layers
- Icon components and assets

## Exports

- `/` - Main component library
- `/types` - TypeScript definitions
- `/primitives` - Low-level UI primitives
- `/styles/tokens-v4/tokens.css` - **Tailwind v4 optimized design tokens** ⭐
  - `foundations.css` - Primitives (spacing, colors, typography)
  - `semantic.css` - Purpose-driven tokens (surfaces, text, borders)
  - `components.css` - Component-specific tokens
  - `dark-theme.css` - Dark mode support
  - `legacy.css` - Backward compatibility (deprecated)
- `/styles/base.css` - Base styles
- `/styles/components.css` - Component styles
- `/styles/utilities.css` - Utility classes

## Development

```bash
pnpm dev --filter ui      # Watch mode
pnpm build --filter ui    # Build package
pnpm test --filter ui     # Run tests
```

## Architecture

- Svelte 5 rune conventions (`$state`, `$props`, `$derived`)
- TypeScript-first development
- Melt UI and Bits UI foundations
- **Tailwind CSS v4** with optimized @theme directives
- **OKLCH color space** for perceptual uniformity
- **Fluid typography** with clamp() for responsive scaling
- **4px spacing rhythm** with WCAG AAA touch targets
- Comprehensive test coverage

## Design Token System

The UI package uses a **Tailwind v4-optimized token system** with hierarchical organization:

```
Foundation Tokens (Primitives)
    ↓ Maps to
Semantic Tokens (Purpose)
    ↓ Maps to
Component Tokens (Context)
    ↓ Used in
Application Styles
```

### Key Features

- **OKLCH Colors**: All fashion palettes (charcoal, indigo, burgundy, gold, emerald) use OKLCH for:
  - Perceptually uniform lightness
  - Better color mixing with `color-mix()`
  - Accessibility-friendly contrast
  - Complete shade ranges (50-950)

- **Fluid Typography**: Responsive text sizes using `clamp()`:
  ```css
  --text-base: clamp(0.9375rem, 0.85rem + 0.6vw, 1rem); /* 15-16px */
  --text-9xl: clamp(6rem, 4.9rem + 7.33vw, 8rem); /* 96-128px hero */
  ```

- **Spacing Scale**: 4px rhythm with touch targets:
  ```css
  --spacing: 0.25rem; /* 4px base */
  --space-4: 16px; /* Most common */
  --touch-primary: 44px; /* WCAG AAA */
  ```

- **Dark Mode**: Supports both system preference and manual toggle:
  ```css
  @media (prefers-color-scheme: dark) { ... }
  [data-theme="dark"] { ... }
  ```

### Usage

```svelte
<!-- Use semantic tokens, not foundation colors -->
<button class="
  h-[var(--btn-height-lg)]
  bg-[var(--btn-primary-bg)]
  text-[var(--btn-primary-text)]
  hover:bg-[var(--btn-primary-hover)]
">
  Shop Now
</button>
```

### Documentation

See **[DESIGN_TOKENS.md](../../DESIGN_TOKENS.md)** for comprehensive guide including:
- Complete color palettes with OKLCH values
- Typography scale usage
- Spacing guidelines
- Component token reference
- Dark mode implementation
- Migration guide
- Best practices

### Migration from Old Tokens

```diff
- var(--fashion-charcoal-500) → var(--color-charcoal-500)
- var(--denim-indigo-600) → var(--color-indigo-600)
- var(--burgundy-luxury-500) → var(--color-burgundy-500)
- var(--champagne-gold-400) → var(--color-gold-400)
- var(--forest-emerald-500) → var(--color-emerald-500)
```

Legacy aliases are provided for backward compatibility but are deprecated.