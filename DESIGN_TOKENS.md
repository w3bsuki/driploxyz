# Driplo Design Tokens System

> Tailwind CSS v4-optimized design token system for luxury fashion marketplace

## Overview

The Driplo design token system provides a comprehensive, maintainable foundation for the UI layer following **Tailwind CSS v4 best practices**. Built with **OKLCH color space** for perceptual uniformity and **fluid typography** for responsive scaling.

## 📁 Architecture

```
packages/ui/src/styles/tokens-v4/
├── tokens.css          # Main entry point
├── foundations.css     # Primitives (spacing, colors, typography)
├── semantic.css        # Purpose-driven tokens (surfaces, text, borders)
├── components.css      # Component-specific tokens (buttons, cards, etc.)
├── dark-theme.css      # Dark mode overrides
└── legacy.css          # Backward compatibility (deprecated)
```

### Token Hierarchy

```
Foundation Tokens (Primitives)
    ↓
Semantic Tokens (Purpose)
    ↓
Component Tokens (Context)
    ↓
Application Styles
```

**Best Practice:** Always use semantic or component tokens in components, never reference foundation colors directly.

## 🎨 Color System

### Naming Convention

Follows Tailwind v4 standard: `--color-{name}-{shade}`

```css
--color-charcoal-500  /* Base color */
--color-indigo-600    /* Dark variant */
--color-gold-50       /* Light variant */
```

### Color Palettes

#### Charcoal — Sophisticated Neutral
```css
--color-charcoal-0    /* Pure white */
--color-charcoal-50   /* oklch(0.98 0.005 280) */
--color-charcoal-100  /* oklch(0.95 0.008 280) */
...
--color-charcoal-900  /* oklch(0.15 0.012 280) - Luxury black */
--color-charcoal-950  /* oklch(0.10 0.010 280) - Deepest */
```

#### Indigo — Premium Denim Blue
```css
--color-indigo-50   /* Ice blue */
--color-indigo-500  /* oklch(0.55 0.14 245) - Premium */
--color-indigo-950  /* Midnight */
```

#### Burgundy — Luxury Wine Red
```css
--color-burgundy-50   /* Blush */
--color-burgundy-500  /* oklch(0.55 0.14 25) - Premium */
--color-burgundy-950  /* Bordeaux */
```

#### Gold — Champagne Elegance
```css
--color-gold-50   /* Cream */
--color-gold-500  /* oklch(0.62 0.16 85) - Premium */
--color-gold-950  /* Antique */
```

#### Emerald — Forest Luxury
```css
--color-emerald-50   /* Mint */
--color-emerald-500  /* oklch(0.60 0.18 155) - Premium */
--color-emerald-950  /* Deep evergreen */
```

### Why OKLCH?

- **Perceptually uniform**: Equal lightness values appear equally bright
- **Better color mixing**: `color-mix(in oklch, ...)` produces natural gradients
- **Accessibility**: Easier to calculate contrast ratios
- **Modern**: Wide browser support, future-proof

### Semantic Color Tokens

#### Surfaces
```css
--surface-base       /* var(--color-charcoal-0) - Main background */
--surface-subtle     /* var(--color-charcoal-50) - Subtle contrast */
--surface-muted      /* var(--color-charcoal-100) - Gentle elevation */
--surface-emphasis   /* var(--color-charcoal-200) - Elevated surfaces */
--surface-inverse    /* var(--color-charcoal-500) - Dark surfaces */

/* Premium variants */
--surface-luxury     /* Gold-tinted */
--surface-premium    /* Burgundy-tinted */
--surface-elegant    /* Indigo-tinted */
```

#### Text
```css
--text-primary       /* Deep luxury black - High emphasis */
--text-secondary     /* Elegant grey - Medium emphasis */
--text-tertiary      /* Subtle grey - Low emphasis */
--text-muted         /* Refined grey - Very low emphasis */
--text-disabled      /* Sophisticated grey - Disabled state */
--text-inverse       /* Pure white - On dark backgrounds */
--text-link          /* Premium blue - Interactive text */
--text-link-hover    /* Deep blue - Link hover state */
```

#### Borders
```css
--border-subtle      /* Subtle elegance */
--border-default     /* Standard borders */
--border-emphasis    /* Emphasized borders */
--border-inverse     /* Dark borders on light backgrounds */

/* Premium variants */
--border-luxury      /* Gold accent */
--border-premium     /* Burgundy accent */
--border-elegant     /* Indigo accent */
```

#### Interactive States
```css
--state-hover        /* Hover feedback */
--state-active       /* Active/pressed state */
--state-focus        /* Keyboard focus indicator */
--state-disabled     /* Disabled state */

/* Premium hover states */
--state-hover-luxury   /* Gold hover */
--state-hover-premium  /* Burgundy hover */
--state-hover-elegant  /* Indigo hover */
```

#### Status Colors
```css
/* Success (Emerald) */
--status-success-bg     /* Background */
--status-success-border /* Border */
--status-success-text   /* Text */
--status-success-solid  /* Solid fill */

/* Error (Burgundy) */
--status-error-bg
--status-error-border
--status-error-text
--status-error-solid

/* Warning (Gold) */
--status-warning-bg
--status-warning-border
--status-warning-text
--status-warning-solid

/* Info (Indigo) */
--status-info-bg
--status-info-border
--status-info-text
--status-info-solid
```

## 📐 Spacing Scale

### 4px Rhythm System

```css
--spacing: 0.25rem; /* 4px base unit */

--space-0: 0;
--space-1: 4px;    /* calc(var(--spacing) * 1) */
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;   /* Most common spacing */
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-96: 384px;
```

### Touch Targets (WCAG AAA)

```css
--touch-primary: 44px;   /* Primary interactive elements */
--touch-standard: 36px;  /* Standard buttons */
--touch-compact: 32px;   /* Compact controls */
--touch-minimum: 24px;   /* Absolute minimum */
```

### Safe Area Insets (iOS)

```css
--safe-area-top: env(safe-area-inset-top);
--safe-area-right: env(safe-area-inset-right);
--safe-area-bottom: env(safe-area-inset-bottom);
--safe-area-left: env(safe-area-inset-left);
```

## 📝 Typography System

### Fluid Typography with clamp()

Automatically scales between mobile and desktop viewports:

```css
/* Base text (15-16px) */
--text-base: clamp(0.9375rem, 0.85rem + 0.6vw, 1rem);
--text-base--line-height: 1.5;

/* Large heading (34-36px) */
--text-4xl: clamp(2.125rem, 1.8rem + 2.17vw, 2.25rem);
--text-4xl--line-height: 1.11;

/* Hero text (96-128px) */
--text-9xl: clamp(6rem, 4.9rem + 7.33vw, 8rem);
--text-9xl--line-height: 1;
```

### Typography Scale

| Token | Min | Max | Use Case |
|-------|-----|-----|----------|
| `--text-xs` | 11px | 12px | Labels, captions |
| `--text-sm` | 13px | 14px | Small body text |
| `--text-base` | 15px | 16px | Body text |
| `--text-lg` | 17px | 18px | Large body text |
| `--text-xl` | 19px | 20px | Small headings |
| `--text-2xl` | 22px | 24px | Section headings |
| `--text-3xl` | 28px | 30px | Page headings |
| `--text-4xl` | 34px | 36px | Major headings |
| `--text-5xl` | 42px | 48px | Display headings |
| `--text-6xl` | 52px | 60px | Hero text |
| `--text-7xl` | 64px | 72px | Large hero |
| `--text-8xl` | 76px | 96px | Extra large hero |
| `--text-9xl` | 96px | 128px | Massive hero |

### Font System

```css
--font-sans: 'Inter Variable', 'SF Pro Text', system-ui, sans-serif;
--font-serif: 'Playfair Display Variable', Georgia, serif;
--font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
```

### Font Weights

```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;      /* Body emphasis */
--font-semibold: 600;    /* Headings */
--font-bold: 700;        /* Strong emphasis */
--font-extrabold: 800;
--font-black: 900;
```

### Line Heights

```css
--leading-none: 1;         /* Tight headlines */
--leading-display: 1.1;    /* Large display text */
--leading-tight: 1.25;     /* Headings */
--leading-snug: 1.375;     /* Subheadings */
--leading-normal: 1.5;     /* Body text */
--leading-relaxed: 1.625;  /* Comfortable reading */
--leading-loose: 2;        /* Maximum readability */
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;   /* Display headings */
--tracking-tight: -0.025em;    /* Large headings */
--tracking-normal: 0em;        /* Body text */
--tracking-wide: 0.025em;      /* Labels */
--tracking-wider: 0.05em;      /* Buttons */
--tracking-widest: 0.1em;      /* Small caps */
--tracking-luxury: 0.15em;     /* Luxury all-caps */
```

## 🎭 Dark Mode

### Implementation

Dark theme supports both system preference and manual toggle:

```css
/* Automatic dark mode */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --surface-base: var(--color-charcoal-900);
    --text-primary: var(--color-charcoal-50);
    /* ... */
  }
}

/* Manual toggle */
[data-theme="dark"] {
  --surface-base: var(--color-charcoal-900);
  --text-primary: var(--color-charcoal-50);
  /* ... */
}
```

### Usage in HTML

```svelte
<!-- Respect system preference -->
<html>

<!-- Force light mode -->
<html data-theme="light">

<!-- Force dark mode -->
<html data-theme="dark">
```

### Dark Mode Tokens

All semantic tokens automatically adapt:

```css
/* Light mode */
--surface-base: var(--color-charcoal-0);      /* White */
--text-primary: var(--color-charcoal-900);    /* Black */

/* Dark mode */
--surface-base: var(--color-charcoal-900);    /* Near black */
--text-primary: var(--color-charcoal-50);     /* Near white */
```

## 🧩 Component Tokens

### Buttons

```css
/* Dimensions */
--btn-height-sm: 32px;
--btn-height-md: 36px;
--btn-height-lg: 44px;
--btn-height-xl: 48px;

/* Primary button */
--btn-primary-bg: var(--brand-primary-strong);
--btn-primary-hover: var(--color-indigo-600);
--btn-primary-text: var(--text-inverse);
--btn-primary-border: var(--color-indigo-500);

/* Luxury button */
--btn-luxury-bg: var(--color-gold-500);
--btn-luxury-hover: var(--color-gold-600);
--btn-luxury-text: var(--color-charcoal-900);
```

### Cards

```css
/* Padding */
--card-padding-sm: var(--space-3);
--card-padding-md: var(--space-4);
--card-padding-lg: var(--space-6);
--card-padding-xl: var(--space-8);

/* Styling */
--card-radius: var(--radius-sm);
--card-shadow: var(--shadow-sm);
--card-border: var(--border-subtle);
--card-bg: var(--surface-base);

/* Premium variants */
--card-luxury-bg: var(--surface-luxury);
--card-premium-bg: var(--surface-premium);
--card-elegant-bg: var(--surface-elegant);
```

### Inputs

```css
--input-height: var(--touch-primary);
--input-padding: var(--space-3);
--input-radius: var(--radius-sm);
--input-border: var(--border-default);
--input-bg: var(--surface-base);
--input-focus-border: var(--state-focus);
```

## 🎯 Usage Examples

### Basic Component

```svelte
<button class="
  h-[var(--btn-height-lg)]
  px-[var(--btn-padding-md)]
  bg-[var(--btn-primary-bg)]
  text-[var(--btn-primary-text)]
  rounded-[var(--btn-radius)]
  shadow-[var(--btn-shadow)]
  hover:bg-[var(--btn-primary-hover)]
">
  Shop Now
</button>
```

### Custom Component with Semantic Tokens

```svelte
<div class="
  bg-[var(--surface-base)]
  border border-[var(--border-subtle)]
  rounded-[var(--card-radius)]
  p-[var(--card-padding-md)]
  shadow-[var(--card-shadow)]
">
  <h3 class="
    text-[var(--text-base)]
    font-[var(--font-semibold)]
    text-[var(--text-primary)]
  ">
    Product Title
  </h3>
  <p class="
    text-[var(--text-sm)]
    text-[var(--text-secondary)]
    mt-[var(--space-2)]
  ">
    Description text
  </p>
</div>
```

### Dark Mode Aware Component

```svelte
<div class="
  bg-[var(--surface-base)]
  text-[var(--text-primary)]
">
  <!-- Automatically adapts to dark mode -->
  This text is always readable
</div>
```

## 🔄 Migration Guide

### From Old Tokens to v4

```diff
- var(--fashion-charcoal-500)
+ var(--color-charcoal-500)

- var(--denim-indigo-600)
+ var(--color-indigo-600)

- var(--burgundy-luxury-500)
+ var(--color-burgundy-500)

- var(--champagne-gold-400)
+ var(--color-gold-400)

- var(--forest-emerald-500)
+ var(--color-emerald-500)
```

### Legacy Aliases (Deprecated)

For backward compatibility, old tokens still work but will be removed:

```css
--primary → --brand-primary-strong
--success → --status-success-solid
--error → --status-error-solid
```

**Action Required:** Update components to use semantic tokens.

## ✅ Best Practices

### DO ✅

```css
/* Use semantic tokens */
color: var(--text-primary);
background: var(--surface-base);
border: 1px solid var(--border-default);

/* Use component tokens */
height: var(--btn-height-lg);
padding: var(--card-padding-md);

/* Use spacing scale */
margin-bottom: var(--space-4);
gap: var(--space-6);
```

### DON'T ❌

```css
/* Don't use foundation colors directly */
color: var(--color-charcoal-900);  /* ❌ Use --text-primary */
background: var(--color-charcoal-0);  /* ❌ Use --surface-base */

/* Don't use arbitrary values when tokens exist */
height: 44px;  /* ❌ Use var(--touch-primary) */
padding: 16px;  /* ❌ Use var(--space-4) */

/* Don't hardcode colors */
color: #000;  /* ❌ Use --text-primary */
```

## 🔧 Customization

### Adding New Colors

```css
/* In foundations.css */
@theme {
  /* Add new color scale */
  --color-custom-50: oklch(0.98 0.01 300);
  --color-custom-500: oklch(0.60 0.15 300);
  --color-custom-950: oklch(0.12 0.08 300);
}

/* In semantic.css */
@theme {
  /* Map to semantic usage */
  --surface-special: var(--color-custom-50);
  --text-special: var(--color-custom-700);
}
```

### Extending Components

```css
/* In components.css */
@theme {
  --btn-special-bg: var(--color-custom-500);
  --btn-special-hover: var(--color-custom-600);
  --btn-special-text: var(--text-inverse);
}
```

## 📚 References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/theme)
- [OKLCH Color Space](https://oklch.com/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Variable Fonts Guide](https://web.dev/variable-fonts/)

## 🤝 Contributing

When adding new tokens:

1. **Foundation tokens** → Add to `foundations.css`
2. **Semantic meaning** → Map in `semantic.css`
3. **Component usage** → Define in `components.css`
4. **Dark mode** → Override in `dark-theme.css`
5. **Document** → Update this guide

## 📝 Changelog

### v4.0.0 (2025-01-XX)

- ✨ Migrated to Tailwind CSS v4 naming conventions
- ✨ Added OKLCH color space for all fashion palettes
- ✨ Enhanced dark mode with system preference support
- ✨ Added --text-8xl and --text-9xl for hero sections
- ✨ Completed all color shades (50-950)
- 🔄 Renamed fashion-specific colors to standard format
- 📚 Comprehensive documentation created
- ⚡ Optimized token hierarchy for better maintainability

---

**Need help?** Check out examples in `packages/ui/src/lib` or ask the team!
