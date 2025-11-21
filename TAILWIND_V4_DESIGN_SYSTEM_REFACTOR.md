# Tailwind CSS v4 + Svelte 5 Design System Refactor

> **Complete** design token system with **official best practices** from Tailwind Labs, Svelte team, and Vite docs

**Created**: October 16, 2025 (Updated with v4.1.x best practices)  
**For**: Tailwind CSS v4.1.x + Svelte 5 + SvelteKit 2 + Vite 7  
**Purpose**: Fix transparent components, inconsistent colors, and establish world-class design system  
**Standards**: CSS-first configuration, `@theme` directive, Vite plugin, Svelte 5 clsx pattern

---

## 🔥 Problems We're Fixing

### Current Issues (GPT-5 Broke These)
1. ❌ **Transparent components** - Everything has transparent backgrounds
2. ❌ **Black borders everywhere** - Aggressive, non-elegant borders
3. ❌ **Blue touch targets** - Hamburger menu has blue tints instead of neutral
4. ❌ **Atrocious mobile menu** - Inconsistent styling, poor UX
5. ❌ **Misaligned tokens** - Components not using semantic tokens correctly
6. ❌ **Poor contrast** - Accessibility issues with text/background combinations

### What We Need
- ✅ **Proper backgrounds** - Solid, elegant surfaces with subtle elevation
- ✅ **Refined borders** - Subtle, sophisticated borders matching luxury aesthetic
- ✅ **Neutral interactions** - Touch targets with neutral hover states (ZERO color tints)
- ✅ **Consistent tokens** - All components use semantic tokens correctly
- ✅ **WCAG AAA compliance** - Proper contrast ratios and 44px touch targets
- ✅ **Svelte 5 best practices** - `class={}` objects/arrays with clsx pattern
- ✅ **Vite optimization** - `@tailwindcss/vite` plugin for performance

---

## 📐 Design Token Architecture

### Token Hierarchy (3 Levels) - Official v4 Pattern

```
┌─────────────────────────────────────────────────┐
│ 1. FOUNDATION TOKENS (Primitives)              │
│    Raw values: colors, spacing, typography      │
│    --color-charcoal-500, --space-4              │
│    Defined in: foundations.css via @theme {}    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. SEMANTIC TOKENS (Purpose)                    │
│    Meaning: surfaces, text, borders, states     │
│    --surface-base, --text-primary, --border-subtle │
│    Defined in: semantic.css using var() refs    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. COMPONENT TOKENS (Context)                   │
│    Usage: buttons, cards, navigation            │
│    --button-bg, --card-border, --nav-hover      │
│    Defined in: components.css using var() refs  │
└─────────────────────────────────────────────────┘
```

**⚠️ RULE**: Components MUST use semantic or component tokens, NEVER foundation colors directly.

---

## 🎨 Complete Design Token System

### File Structure

```
packages/ui/src/styles/tokens-v4/
├── tokens.css          # 📦 Main entry (imports all)
├── foundations.css     # 🔷 Primitives (colors, spacing, typography)
├── semantic.css        # 🎯 Purpose-driven (surfaces, text, borders)
├── components.css      # 🧩 Component-specific (buttons, cards, nav)
├── dark-theme.css      # 🌙 Dark mode overrides
└── legacy.css          # 🗑️ Backward compatibility (deprecated)
```

### 1️⃣ Foundation Tokens (`foundations.css`)

```css
/*
  FOUNDATION TOKENS — Raw Design Primitives
  These are the building blocks, never use directly in components
*/

@theme {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SPACING SCALE — 4px Rhythm (Tailwind v4 convention)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --spacing: 0.25rem; /* 4px base */
  
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-11: 44px;  /* WCAG AAA touch target */
  --space-12: 48px;
  --space-14: 56px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  --space-40: 160px;
  --space-48: 192px;
  --space-56: 224px;
  --space-64: 256px;

  /* Touch Targets (WCAG AAA) */
  --touch-primary: 44px;   /* Primary (WCAG AAA) */
  --touch-standard: 36px;  /* Standard */
  --touch-compact: 32px;   /* Compact */
  --touch-minimum: 24px;   /* Minimum */

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     LUXURY FASHION COLOR PALETTE — OKLCH
     Perceptually uniform, accessible, modern
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  /* Charcoal — Sophisticated neutral */
  --color-charcoal-0: oklch(1 0 0);                /* Pure white */
  --color-charcoal-50: oklch(0.98 0.005 280);      /* Subtle warmth */
  --color-charcoal-100: oklch(0.95 0.008 280);     /* Light grey */
  --color-charcoal-200: oklch(0.90 0.01 280);      /* Soft grey */
  --color-charcoal-300: oklch(0.82 0.012 280);     /* Medium light */
  --color-charcoal-400: oklch(0.70 0.014 280);     /* Medium */
  --color-charcoal-500: oklch(0.55 0.015 280);     /* Base charcoal */
  --color-charcoal-600: oklch(0.40 0.016 280);     /* Dark */
  --color-charcoal-700: oklch(0.30 0.014 280);     /* Deeper */
  --color-charcoal-800: oklch(0.20 0.012 280);     /* Very dark */
  --color-charcoal-900: oklch(0.15 0.012 280);     /* Luxury black */
  --color-charcoal-950: oklch(0.10 0.010 280);     /* Deepest */

  /* Indigo — Premium denim blue */
  --color-indigo-50: oklch(0.98 0.01 245);         /* Ice blue */
  --color-indigo-100: oklch(0.95 0.02 245);        /* Light */
  --color-indigo-200: oklch(0.90 0.04 245);        /* Soft */
  --color-indigo-300: oklch(0.82 0.06 245);        /* Medium light */
  --color-indigo-400: oklch(0.70 0.10 245);        /* Classic */
  --color-indigo-500: oklch(0.55 0.14 245);        /* Premium */
  --color-indigo-600: oklch(0.45 0.16 245);        /* Deep */
  --color-indigo-700: oklch(0.35 0.14 245);        /* Dark */
  --color-indigo-800: oklch(0.25 0.12 245);        /* Navy */
  --color-indigo-900: oklch(0.18 0.10 245);        /* Deep navy */
  --color-indigo-950: oklch(0.12 0.08 245);        /* Midnight */

  /* Burgundy — Luxury wine red */
  --color-burgundy-50: oklch(0.98 0.015 25);       /* Blush */
  --color-burgundy-100: oklch(0.95 0.025 25);      /* Light */
  --color-burgundy-200: oklch(0.90 0.04 25);       /* Soft */
  --color-burgundy-300: oklch(0.82 0.06 25);       /* Medium light */
  --color-burgundy-400: oklch(0.70 0.10 25);       /* Classic */
  --color-burgundy-500: oklch(0.55 0.14 25);       /* Premium */
  --color-burgundy-600: oklch(0.45 0.16 25);       /* Deep */
  --color-burgundy-700: oklch(0.35 0.14 25);       /* Dark */
  --color-burgundy-800: oklch(0.25 0.12 25);       /* Wine */
  --color-burgundy-900: oklch(0.18 0.10 25);       /* Deep wine */
  --color-burgundy-950: oklch(0.12 0.08 25);       /* Bordeaux */

  /* Gold — Champagne elegance */
  --color-gold-50: oklch(0.98 0.02 85);            /* Cream */
  --color-gold-100: oklch(0.95 0.03 85);           /* Light */
  --color-gold-200: oklch(0.90 0.05 85);           /* Soft */
  --color-gold-300: oklch(0.82 0.08 85);           /* Medium light */
  --color-gold-400: oklch(0.72 0.12 85);           /* Classic */
  --color-gold-500: oklch(0.62 0.16 85);           /* Premium */
  --color-gold-600: oklch(0.52 0.18 85);           /* Deep */
  --color-gold-700: oklch(0.42 0.16 85);           /* Dark */
  --color-gold-800: oklch(0.32 0.12 85);           /* Bronze */
  --color-gold-900: oklch(0.24 0.10 85);           /* Deep bronze */
  --color-gold-950: oklch(0.16 0.08 85);           /* Antique */

  /* Emerald — Forest luxury */
  --color-emerald-50: oklch(0.98 0.02 155);        /* Mint */
  --color-emerald-100: oklch(0.95 0.04 155);       /* Light */
  --color-emerald-200: oklch(0.90 0.06 155);       /* Soft */
  --color-emerald-300: oklch(0.82 0.10 155);       /* Medium light */
  --color-emerald-400: oklch(0.72 0.14 155);       /* Classic */
  --color-emerald-500: oklch(0.60 0.18 155);       /* Premium */
  --color-emerald-600: oklch(0.48 0.16 155);       /* Deep */
  --color-emerald-700: oklch(0.38 0.14 155);       /* Forest */
  --color-emerald-800: oklch(0.28 0.12 155);       /* Deep forest */
  --color-emerald-900: oklch(0.20 0.10 155);       /* Evergreen */
  --color-emerald-950: oklch(0.14 0.08 155);       /* Deep evergreen */

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TYPOGRAPHY — Fluid Scale with Clamp
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --font-sans: 'Inter Variable', system-ui, -apple-system, sans-serif;
  --font-serif: 'Playfair Display Variable', Georgia, serif;
  --font-mono: 'SF Mono', 'Monaco', 'Courier New', monospace;

  --text-xs: clamp(0.6875rem, 0.65rem + 0.25vw, 0.75rem);    /* 11-12px */
  --text-sm: clamp(0.8125rem, 0.75rem + 0.4vw, 0.875rem);    /* 13-14px */
  --text-base: clamp(0.9375rem, 0.85rem + 0.6vw, 1rem);      /* 15-16px */
  --text-lg: clamp(1.0625rem, 0.95rem + 0.75vw, 1.125rem);   /* 17-18px */
  --text-xl: clamp(1.1875rem, 1.05rem + 0.9vw, 1.25rem);     /* 19-20px */
  --text-2xl: clamp(1.375rem, 1.2rem + 1.2vw, 1.5rem);       /* 22-24px */
  --text-3xl: clamp(1.75rem, 1.5rem + 1.67vw, 1.875rem);     /* 28-30px */
  --text-4xl: clamp(2.125rem, 1.8rem + 2.17vw, 2.25rem);     /* 34-36px */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SHADOWS — Elegant Elevation System
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --shadow-xs: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.25);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BORDER RADIUS — Refined Shapes
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;   /* Circular */

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     Z-INDEX LAYERS — Stacking Order
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --z-base: 0;
  --z-elevated: 10;
  --z-sticky: 100;
  --z-fixed: 200;
  --z-dropdown: 300;
  --z-overlay: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-toast: 700;
  --z-tooltip: 800;
}
```

### 2️⃣ Semantic Tokens (`semantic.css`)

```css
/*
  SEMANTIC TOKENS — Purpose-Driven Abstraction
  These map foundation tokens to meaning and purpose
*/

@theme {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SURFACES — Background Layers
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --surface-base: var(--color-charcoal-0);          /* Main background */
  --surface-subtle: var(--color-charcoal-50);       /* Subtle contrast */
  --surface-muted: var(--color-charcoal-100);       /* Gentle elevation */
  --surface-emphasis: var(--color-charcoal-200);    /* Elevated surfaces */
  --surface-inverse: var(--color-charcoal-900);     /* Dark surfaces */

  /* Premium surface variants */
  --surface-luxury: var(--color-gold-50);           /* Gold tinted */
  --surface-premium: var(--color-burgundy-50);      /* Burgundy tinted */
  --surface-elegant: var(--color-indigo-50);        /* Indigo tinted */

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TEXT — Typography Colors
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --text-primary: var(--color-charcoal-900);        /* High emphasis */
  --text-secondary: var(--color-charcoal-700);      /* Medium emphasis */
  --text-tertiary: var(--color-charcoal-600);       /* Low emphasis */
  --text-muted: var(--color-charcoal-500);          /* Very low emphasis */
  --text-disabled: var(--color-charcoal-400);       /* Disabled state */
  --text-inverse: var(--color-charcoal-0);          /* On dark backgrounds */
  --text-link: var(--color-indigo-600);             /* Interactive text */
  --text-link-hover: var(--color-indigo-700);       /* Link hover */

  /* Brand text */
  --text-brand: var(--color-indigo-600);
  --text-brand-hover: var(--color-indigo-700);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BORDERS — Separation & Definition
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --border-subtle: var(--color-charcoal-100);       /* Minimal separation */
  --border-default: var(--color-charcoal-200);      /* Standard borders */
  --border-emphasis: var(--color-charcoal-300);     /* Emphasized borders */
  --border-strong: var(--color-charcoal-400);       /* Strong borders */
  --border-inverse: var(--color-charcoal-700);      /* On light backgrounds */

  /* Premium borders */
  --border-luxury: var(--color-gold-300);
  --border-premium: var(--color-burgundy-300);
  --border-elegant: var(--color-indigo-300);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     INTERACTIVE STATES — Neutral Feedback (FIX!)
     NO BLUE TINTS - Only neutral charcoal overlays
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Neutral states (NO COLOR TINT) */
  --state-hover: oklch(0 0 0 / 0.04);               /* Neutral hover - 4% black */
  --state-active: oklch(0 0 0 / 0.08);              /* Neutral active - 8% black */
  --state-focus: var(--color-indigo-500);           /* Only focus ring uses color */
  --state-disabled: var(--color-charcoal-300);      /* Disabled bg */
  --state-disabled-text: var(--color-charcoal-400); /* Disabled text */

  /* Premium hover (for branded elements ONLY) */
  --state-hover-brand: oklch(0.98 0.01 245 / 0.1);  /* Subtle indigo tint */
  --state-hover-luxury: oklch(0.98 0.02 85 / 0.1);  /* Subtle gold tint */

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     STATUS COLORS — Feedback & Alerts
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Success */
  --status-success-bg: var(--color-emerald-50);
  --status-success-border: var(--color-emerald-200);
  --status-success-text: var(--color-emerald-700);
  --status-success-solid: var(--color-emerald-500);

  /* Error */
  --status-error-bg: var(--color-burgundy-50);
  --status-error-border: var(--color-burgundy-200);
  --status-error-text: var(--color-burgundy-700);
  --status-error-solid: var(--color-burgundy-500);

  /* Warning */
  --status-warning-bg: var(--color-gold-50);
  --status-warning-border: var(--color-gold-200);
  --status-warning-text: var(--color-gold-700);
  --status-warning-solid: var(--color-gold-500);

  /* Info */
  --status-info-bg: var(--color-indigo-50);
  --status-info-border: var(--color-indigo-200);
  --status-info-text: var(--color-indigo-700);
  --status-info-solid: var(--color-indigo-500);
}
```

### 3️⃣ Component Tokens (`components.css`)

```css
/*
  COMPONENT TOKENS — Context-Specific Styles
  Maps semantic tokens to specific component patterns
*/

@theme {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NAVIGATION — Header, Mobile Menu, Footer
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Header/Nav Bar */
  --nav-bg: var(--surface-base);
  --nav-border: var(--border-subtle);
  --nav-text: var(--text-primary);
  --nav-text-secondary: var(--text-secondary);
  
  /* Nav Item States (NEUTRAL ONLY!) */
  --nav-item-hover: var(--state-hover);             /* NO BLUE TINT */
  --nav-item-active: var(--state-active);           /* NO BLUE TINT */
  --nav-item-current: var(--surface-emphasis);      /* Current page */

  /* Mobile Menu */
  --mobile-menu-bg: var(--surface-base);            /* Solid white bg */
  --mobile-menu-overlay: oklch(0 0 0 / 0.4);       /* Dark overlay */
  --mobile-menu-item-hover: var(--state-hover);    /* Neutral hover */
  --mobile-menu-separator: var(--border-subtle);   /* Subtle dividers */

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BUTTONS — Primary, Secondary, Ghost, etc.
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Primary Button (Brand) */
  --button-primary-bg: var(--color-indigo-600);
  --button-primary-hover: var(--color-indigo-700);
  --button-primary-active: var(--color-indigo-800);
  --button-primary-text: var(--text-inverse);
  --button-primary-border: transparent;

  /* Secondary Button (Outline) */
  --button-secondary-bg: transparent;
  --button-secondary-hover: var(--surface-subtle);
  --button-secondary-active: var(--surface-muted);
  --button-secondary-text: var(--text-primary);
  --button-secondary-border: var(--border-default);

  /* Ghost Button (Minimal) */
  --button-ghost-bg: transparent;
  --button-ghost-hover: var(--state-hover);        /* Neutral */
  --button-ghost-active: var(--state-active);      /* Neutral */
  --button-ghost-text: var(--text-primary);
  --button-ghost-border: transparent;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CARDS & SURFACES
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Product Card */
  --card-bg: var(--surface-base);
  --card-border: var(--border-subtle);
  --card-hover-border: var(--border-default);
  --card-hover-shadow: var(--shadow-md);
  --card-image-bg: var(--surface-subtle);

  /* Panel/Modal */
  --panel-bg: var(--surface-base);
  --panel-border: var(--border-subtle);
  --panel-shadow: var(--shadow-lg);
  --panel-overlay: oklch(0 0 0 / 0.5);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     FORMS — Inputs, Selects, Checkboxes
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Input Base */
  --input-bg: var(--surface-base);
  --input-border: var(--border-default);
  --input-hover-border: var(--border-emphasis);
  --input-focus-border: var(--color-indigo-500);
  --input-focus-ring: oklch(0.55 0.14 245 / 0.2);
  --input-text: var(--text-primary);
  --input-placeholder: var(--text-muted);
  --input-disabled-bg: var(--surface-subtle);
  --input-disabled-border: var(--border-subtle);
  --input-disabled-text: var(--text-disabled);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODAL & DIALOG
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --modal-overlay-bg: oklch(0 0 0 / 0.4);          /* Dark overlay */
  --modal-bg: var(--surface-base);                 /* Solid white */
  --modal-border: var(--border-subtle);
  --modal-shadow: var(--shadow-2xl);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DROPDOWN & MENU
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --dropdown-bg: var(--surface-base);
  --dropdown-border: var(--border-subtle);
  --dropdown-shadow: var(--shadow-lg);
  --dropdown-item-hover: var(--state-hover);       /* Neutral */
  --dropdown-item-active: var(--surface-subtle);
  --dropdown-divider: var(--border-subtle);
}
```

---

## 🔧 Tailwind CSS v4 Configuration

### `apps/web/src/app.css` (Main Entry)

```css
/* 
  Driplo Web App — Tailwind CSS v4 Entry Point
  Vite plugin handles processing automatically
*/

@import 'tailwindcss';

/* Design Tokens (our custom system) */
@import '@repo/ui/styles/tokens-v4/tokens.css';

/* Base styles & utilities */
@import '@repo/ui/styles/base.css';
@import '@repo/ui/styles/components.css';
@import '@repo/ui/styles/utilities.css';

/* Tailwind plugins */
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

/* Source paths for Tailwind to scan */
@source '../../../packages/ui/src/**/*.{svelte,ts}';
@source './lib/**/*.{svelte,ts}';
@source './routes/**/*.{svelte,ts}';

/* App-specific theme extensions (if needed) */
@theme {
  /* Override tokens here if needed for web-app specific styles */
}
```

### `vite.config.ts` (SvelteKit + Tailwind v4) - Official Best Practice

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Best practice: tailwindcss() BEFORE sveltekit() for proper CSS processing
export default defineConfig({
  plugins: [
    tailwindcss(),    // ⚠️ Must come first per Tailwind v4 docs
    sveltekit(),      // Then SvelteKit plugin
  ],
  
  css: {
    transformer: 'lightningcss',  // v4 recommendation for performance
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      overlay: true,  // Show errors in browser overlay
    },
  },

  build: {
    target: 'esnext',
    cssMinify: 'lightningcss',  // Consistent with transformer
  },
});
```

### Custom Utilities with `@utility` (v4 Best Practice)

Tailwind v4 replaces `@layer components` with `@utility` directive for better composability:

```css
/* packages/ui/src/styles/utilities.css */

/* ✅ CORRECT: v4 @utility directive */
@utility btn {
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: all 150ms ease;
}

/* ✅ Functional utilities with arguments */
@utility tab-* {
  tab-size: --value(--tab-size-*);
}

/* Define in @theme first */
@theme {
  --tab-size-2: 2;
  --tab-size-4: 4;
  --tab-size-8: 8;
}

/* ❌ WRONG: Old v3 @layer components pattern */
@layer components {
  .btn {
    /* Don't use this anymore */
  }
}
```

Usage in Svelte:

```svelte
<!-- Automatically supports variants -->
<button class="btn hover:opacity-90 focus:ring-2">
  Click Me
</button>

<!-- Functional utilities -->
<pre class="tab-4">
  Code here
</pre>
```

---

## 📝 Svelte 5 Advanced Patterns

### Using `@reference` for Theme Variables in `<style>` Blocks

```svelte
<script>
  let { variant = 'primary' } = $props();
</script>

<button class:variant-{variant}>
  <slot />
</button>

<style lang="postcss">
  /* Best practice: @reference to access design tokens */
  @reference "../../../app.css";
  
  button {
    /* Can now use theme() function and @apply */
    background-color: var(--button-primary-bg);
    
    &:hover {
      background-color: var(--button-primary-hover);
    }
  }
  
  .variant-secondary {
    background-color: var(--button-secondary-bg);
    border: 1px solid var(--button-secondary-border);
  }
</style>
```

### Performance: Direct CSS Variables > `@apply`

```svelte
<!-- ✅ BEST: Direct CSS variables (no Tailwind processing needed) -->
<style scoped>
  button {
    background-color: var(--color-indigo-600);
    color: var(--color-white);
  }
  
  button:hover {
    background-color: var(--color-indigo-700);
  }
</style>

<!-- ⚠️ OK but slower: @apply requires Tailwind processing -->
<style>
  @reference "../../../app.css";
  
  button {
    @apply bg-indigo-600 text-white hover:bg-indigo-700;
  }
</style>
```

  server: {
    port: 5173,
    strictPort: false
  }
});
```

---

## 🎯 Component Usage Examples

### ✅ CORRECT: Using Semantic Tokens (Svelte 5 Best Practices)

```svelte
<script>
  // Svelte 5: $props() for component props
  let { isActive, disabled } = $props();
  
  // Svelte 5: $state() for reactive state
  let isHovered = $state(false);
</script>

<!-- OPTION 1: Svelte 5.16+ class object/array pattern (RECOMMENDED) -->
<button 
  class={{
    // Base styles - always applied
    'rounded-lg px-4 py-2': true,
    'min-h-[var(--touch-primary)]': true,
    
    // Conditional styles using token variables
    'bg-[color:var(--button-primary-bg)]': !disabled,
    'hover:bg-[color:var(--button-primary-hover)]': !disabled,
    'text-[color:var(--button-primary-text)]': !disabled,
    
    // Disabled state
    'bg-[color:var(--surface-subtle)] text-[color:var(--text-disabled)]': disabled,
    'cursor-not-allowed opacity-60': disabled,
  }}
  {disabled}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  Click Me
</button>

<!-- OPTION 2: class array with conditional tokens (for complex logic) -->
<div 
  class={[
    'bg-[color:var(--mobile-menu-bg)]',
    'border-[color:var(--mobile-menu-separator)]',
    isActive && 'shadow-lg',
    isHovered && 'bg-[color:var(--state-hover)]',
  ]}
>
  <!-- Menu Item (NEUTRAL HOVER - ZERO color tints) -->
  <button class={{
    'bg-transparent': true,
    'hover:bg-[color:var(--state-hover)]': true,       /* Neutral grey */
    'active:bg-[color:var(--state-active)]': true,     /* Neutral grey */
    'text-[color:var(--text-primary)]': true,
    'border-[color:var(--border-subtle)] border': true,
    'rounded-lg px-4 py-2': true,
    'min-h-[var(--touch-primary)]': true,              /* WCAG AAA = 44px */
  }}>
    Menu Item
  </button>

  <!-- Profile Section -->
  <div class="
    bg-[color:var(--surface-subtle)] 
    border-[color:var(--border-subtle)] 
    border rounded-lg p-3
  ">
    <p class="text-[color:var(--text-primary)] font-semibold">User Name</p>
    <p class="text-[color:var(--text-muted)] text-sm">@username</p>
  </div>
</div>

<!-- Component Composability: Passing classes to child components -->
<script>
  import Button from './Button.svelte';
  import type { ClassValue } from 'svelte/elements';  // v5.19+
  
  let { class: className }: { class?: ClassValue } = $props();
</script>

<Button class={['cool-button', className]}>
  Accept
</Button>
```

### ❌ WRONG: Direct Colors & Blue Tints

```svelte
<!-- DON'T DO THIS -->
<div class="bg-transparent border-black">  <!-- ❌ Transparent + black border -->
  
  <!-- ❌ Blue tint on hover -->
  <button class="
    hover:bg-blue-50
    active:bg-blue-100
  ">
    Menu Item
  </button>

  <!-- ❌ Direct foundation color -->
  <div class="bg-charcoal-50">
    Content
  </div>
</div>
```

---

## � Official Documentation References

This refactor follows **official best practices** from:

1. **Tailwind CSS v4 Documentation**
   - `@theme` directive for design tokens (replaces `tailwind.config.js`)
   - `@utility` for custom components (replaces `@layer components`)
   - `@tailwindcss/vite` plugin for optimal performance
   - Direct CSS variable usage: `var(--color-indigo-600)` > `theme(colors.indigo.600)`
   - Source: https://tailwindcss.com/docs/upgrade-guide

2. **Svelte 5 Documentation**
   - `class={}` objects/arrays with clsx pattern (Svelte 5.16+)
   - `$props()`, `$state()`, `$derived()` runes-based reactivity
   - `type { ClassValue } from 'svelte/elements'` for type-safe class props
   - `@reference` directive for accessing theme in `<style>` blocks
   - Performance: Direct CSS variables > `@apply` in scoped styles
   - Source: https://svelte.dev/docs (official Svelte 5 docs)

3. **Vite Configuration**
   - Plugin order: `tailwindcss()` BEFORE `sveltekit()` for proper CSS processing
   - Lightning CSS transformer for v4 performance (`css.transformer: 'lightningcss'`)
   - CSS Modules with `localsConvention: 'camelCaseOnly'`
   - HMR overlay for error visibility
   - Source: https://vitejs.dev/config/

4. **WCAG Accessibility Standards**
   - AAA touch targets: 44px minimum (`--touch-primary`)
   - AA contrast ratios: 4.5:1 for text, 3:1 for UI components
   - Neutral interaction states (no color tints that reduce contrast)

---

## 🎯 Success Criteria

After this refactor, we will have:

### Code Quality
- ✅ **Zero hardcoded colors** - All colors via semantic tokens
- ✅ **Zero `@layer components`** - Migrated to v4 `@utility` pattern
- ✅ **Zero blue-tinted neutral states** - Pure grey overlays only
- ✅ **Single token system** - Only `/tokens-v4/` directory exists
- ✅ **Proper component props** - `class` prop accepts `ClassValue` type

### Visual Quality
- ✅ **Solid elegant backgrounds** - No inappropriate transparency
- ✅ **Refined borders** - Subtle, sophisticated, consistent
- ✅ **Neutral hover states** - Grey overlays, no color tints
- ✅ **Luxury aesthetic** - Charcoal, indigo, burgundy palette
- ✅ **Consistent shadows** - Elevation system

### Performance
- ✅ **Vite plugin optimization** - `@tailwindcss/vite` with Lightning CSS
- ✅ **Fast HMR** - Instant token updates in browser
- ✅ **Minimal CSS** - Only used utilities compiled
- ✅ **Type-safe** - Full TypeScript support

### Accessibility
- ✅ **WCAG AAA touch targets** - 44px minimum on all interactive elements
- ✅ **WCAG AA contrast** - 4.5:1 text, 3:1 UI components
- ✅ **Focus indicators** - Visible focus rings on all focusable elements
- ✅ **Semantic HTML** - Proper ARIA labels and roles

---

## �🚀 Implementation Plan

### Phase 1: Update Token Files ✅

1. Update `packages/ui/src/styles/tokens-v4/semantic.css`:
   - Fix `--state-hover` to neutral: `oklch(0 0 0 / 0.04)`
   - Fix `--state-active` to neutral: `oklch(0 0 0 / 0.08)`
   - Remove blue tints from neutral states

2. Update `packages/ui/src/styles/tokens-v4/components.css`:
   - Add complete navigation tokens
   - Add mobile menu tokens
   - Ensure all components use semantic tokens

3. Verify `foundations.css` has all needed primitives

### Phase 2: Fix Mobile Navigation ✅

File: `packages/ui/src/lib/compositions/navigation/MobileNavigationDialog.svelte`

**Problems to fix:**
- Transparent backgrounds
- Blue-tinted hover states
- Black borders
- Poor contrast

**Changes needed:**

```svelte
<!-- Before (❌ Bad) -->
<div class="bg-surface-base"> <!-- might be transparent -->
  <button class="hover:bg-blue-50 active:bg-blue-100">
    Item
  </button>
</div>

<!-- After (✅ Good) -->
<div class="bg-[color:var(--mobile-menu-bg)]"> <!-- Solid white -->
  <button class="
    bg-transparent
    hover:bg-[color:var(--state-hover)]
    active:bg-[color:var(--state-active)]
    text-[color:var(--text-primary)]
    rounded-lg
    min-h-[var(--touch-primary)]
  ">
    Item
  </button>
</div>
```

### Phase 3: Fix All Components 🔄

Audit and fix:
1. `MobileNavigationDialog.svelte` — Mobile menu
2. `Header.svelte` — Main navigation
3. `ProductCard.svelte` — Product cards
4. `Button.svelte` — Button variants
5. All form inputs
6. All modals/dialogs

**Search for antipatterns:**
- `bg-transparent` (without explicit reasoning)
- `border-black`, `border-gray-*` (direct colors)
- `hover:bg-blue-*` (blue tints on neutral elements)
- Direct foundation colors in components

### Phase 4: Dark Mode 🌙

Update `packages/ui/src/styles/tokens-v4/dark-theme.css`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Surfaces */
    --surface-base: var(--color-charcoal-900);
    --surface-subtle: var(--color-charcoal-800);
    --surface-muted: var(--color-charcoal-700);
    
    /* Text */
    --text-primary: var(--color-charcoal-0);
    --text-secondary: var(--color-charcoal-200);
    
    /* Borders */
    --border-subtle: var(--color-charcoal-700);
    --border-default: var(--color-charcoal-600);
    
    /* States (still neutral!) */
    --state-hover: oklch(1 0 0 / 0.08);  /* White overlay in dark mode */
    --state-active: oklch(1 0 0 / 0.12);
  }
}
```

---

## ✅ Checklist

### Design Token System
- [ ] Update `semantic.css` with neutral states
- [ ] Complete `components.css` with all component tokens
- [ ] Add missing foundation colors if needed
- [ ] Document all tokens in `DESIGN_TOKENS.md`

### Components
- [ ] Fix `MobileNavigationDialog.svelte`
- [ ] Audit `Header.svelte`
- [ ] Check all buttons for proper token usage
- [ ] Verify all cards use semantic tokens
- [ ] Test all form inputs

### Configuration
- [ ] Verify `app.css` imports correct tokens
- [ ] Test Vite/Tailwind v4 integration
- [ ] Check for any leftover v3 patterns

### Testing
- [ ] Light mode: All components have proper backgrounds
- [ ] Light mode: No unwanted blue tints
- [ ] Light mode: Proper contrast (WCAG AA minimum)
- [ ] Dark mode: All tokens override correctly
- [ ] Touch targets: 44px minimum (WCAG AAA)
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

---

## 📚 Resources

### Official Documentation
- **Tailwind CSS v4**: https://tailwindcss.com/docs/theme
- **Svelte 5**: https://svelte.dev/docs/svelte/overview
- **SvelteKit**: https://svelte.dev/docs/kit/introduction
- **Vite**: https://vite.dev/

### Design System
- **OKLCH Color Space**: https://oklch.com/
- **WCAG Contrast**: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- **Touch Targets**: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

### Inspiration
- **Vinted**: Neutral, elegant interactions
- **Vestiaire Collective**: Luxury aesthetic
- **The RealReal**: Premium marketplace UX

---

## 🎉 Success Criteria

When complete, the design system will have:

1. ✅ **Solid backgrounds** - No more transparent components
2. ✅ **Elegant borders** - Subtle, refined separation
3. ✅ **Neutral interactions** - No blue tints on touch targets
4. ✅ **Consistent tokens** - All components use semantic layer
5. ✅ **WCAG AAA compliance** - Proper contrast and touch targets
6. ✅ **Dark mode ready** - All tokens work in both modes
7. ✅ **Documented** - Complete token reference
8. ✅ **Type-safe** - TypeScript support for all tokens

---

**Let's build a world-class luxury fashion marketplace! 🚀**
