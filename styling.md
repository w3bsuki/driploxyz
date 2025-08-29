# 🎨 Driplo Styling Guide — Simple & Fast

## The Setup (What We Actually Use)
- **Tailwind CSS v4** with **Vite Plugin** (`@tailwindcss/vite`) 
- **OKLCH colors** defined in `app.css`
- **Mobile-first** responsive design
- That's it. No PostCSS needed. Vite handles everything.

## 🚨 Quick Fixes Needed

### Performance Issues to Fix
1. **Remove `transition-all`** → Use `transition-colors` or `transition-transform`
2. **Remove `backdrop-blur` on mobile** → Gate with `md:backdrop-blur`  
3. **Reduce shadows on mobile** → Use `shadow-sm` mobile, `md:shadow-lg` desktop
4. **Optimize homepage pills** → Already fixed with snap scrolling

## 🏗️ Simple Implementation Plan

### Phase 1: Stop Hardcoding Values (1 hour)
**Just use Tailwind classes, not arbitrary values**

#### What to Fix:
```bash
# Find hardcoded values
grep -r "min-h-\[" --include="*.svelte"  # Bad: min-h-[44px]
grep -r "text-\[" --include="*.svelte"   # Bad: text-[14px]
```

#### Replace with:
```css
/* Instead of min-h-[44px] use: */
min-h-11  /* 44px - Primary CTAs */
min-h-9   /* 36px - Standard buttons */
min-h-8   /* 32px - Compact items */

/* Instead of text-[14px] use: */
text-sm   /* 14px */
text-base /* 16px */
```

### Phase 2: Use What's Already There (30 mins)
**Your app.css already has good tokens - just use them!**

```css
/* You already have in app.css: */
--radius-md: 8px;
--space-md: 16px;
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);

/* So use Tailwind's CSS variable support: */
class="rounded-[var(--radius-md)]"  /* When you need exact token */
class="rounded-lg"                   /* Or just use Tailwind's built-in */
```

### Phase 3: Component Patterns (Optional)
**Only if you have many similar components**

```css
/* Add to app.css ONLY if needed: */
.btn-primary {
  @apply min-h-11 px-6 bg-black text-white rounded-lg;
}
```

## That's It!

**What NOT to do:**
- ❌ Don't add PostCSS config complexity
- ❌ Don't create separate token files  
- ❌ Don't make CSS modules unless absolutely needed
- ❌ Don't overthink it

**What TO do:**
- ✅ Use Tailwind classes (not arbitrary values)
- ✅ Keep using Vite plugin (it's fast)
- ✅ Fix performance issues (shadows, transitions)
- ✅ Ship to production

## 📐 Core Design Token System (Reference)
```css
@theme {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SPACING SYSTEM — 4px Grid
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 2px;
  --space-1: 4px;
  --space-1.5: 6px;
  --space-2: 8px;
  --space-2.5: 10px;
  --space-3: 12px;
  --space-3.5: 14px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-9: 36px;
  --space-10: 40px;
  --space-11: 44px;
  --space-12: 48px;
  --space-14: 56px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-28: 112px;
  --space-32: 128px;
  --space-36: 144px;
  --space-40: 160px;
  --space-44: 176px;
  --space-48: 192px;
  --space-52: 208px;
  --space-56: 224px;
  --space-60: 240px;
  --space-64: 256px;
  --space-72: 288px;
  --space-80: 320px;
  --space-96: 384px;

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SIZING SYSTEM — Component Dimensions
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  --size-xs: 20px;
  --size-sm: 24px;
  --size-md: 28px;
  --size-lg: 32px;
  --size-xl: 36px;
  --size-2xl: 40px;
  --size-3xl: 44px;  /* Primary touch target */
  --size-4xl: 48px;
  --size-5xl: 56px;
  --size-6xl: 64px;
  
  /* Touch Targets (Mobile-First) */
  --touch-primary: 44px;    /* Buy, Sell, Checkout */
  --touch-standard: 36px;   /* Pills, Filters */
  --touch-compact: 32px;    /* Tags, Chips */
  --touch-icon: 40px;       /* Icon buttons */
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     COLOR SYSTEM — OKLCH Color Space
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Grayscale Palette */
  --gray-0: oklch(1 0 0);          /* Pure white */
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
  --gray-950: oklch(0.05 0 0);     /* Near black */
  
  /* Brand Colors */
  --brand-primary: oklch(0.58 0.14 240);     /* Blue */
  --brand-secondary: oklch(0.58 0.14 300);   /* Purple */
  --brand-accent: oklch(0.75 0.15 50);       /* Orange */
  
  /* Functional Colors */
  --color-success: oklch(0.75 0.15 145);
  --color-warning: oklch(0.8 0.12 85);
  --color-error: oklch(0.58 0.14 0);
  --color-info: oklch(0.7 0.15 240);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TYPOGRAPHY SYSTEM — Fluid Scaling
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Font Families */
  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Consolas, monospace;
  
  /* Font Sizes — Mobile First */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px — Prevents zoom */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  
  /* Font Weights */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
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
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     EFFECTS — Shadows, Radius, Transitions
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows — Performance Optimized */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.12);
  --shadow-2xl: 0 25px 50px rgba(0,0,0,0.15);
  --shadow-inner: inset 0 2px 4px rgba(0,0,0,0.06);
  
  /* Transitions — Consistent Timing */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Z-Index Scale */
  --z-0: 0;
  --z-10: 10;
  --z-20: 20;
  --z-30: 30;
  --z-40: 40;
  --z-50: 50;
  --z-60: 60;
  --z-70: 70;
  --z-80: 80;
  --z-90: 90;
  --z-100: 100;
  --z-max: 999999;
}
```

### 2. Semantic Tokens (Context-Aware)
```css
@theme {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEMANTIC COLORS — Purpose-Driven
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Surface Colors */
  --surface-base: var(--gray-0);
  --surface-subtle: var(--gray-50);
  --surface-muted: var(--gray-100);
  --surface-emphasis: var(--gray-200);
  --surface-inverse: var(--gray-900);
  
  /* Text Colors */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-700);
  --text-tertiary: var(--gray-600);
  --text-muted: var(--gray-500);
  --text-disabled: var(--gray-400);
  --text-inverse: var(--gray-0);
  --text-link: var(--brand-primary);
  --text-link-hover: oklch(0.48 0.16 240);
  
  /* Border Colors */
  --border-subtle: var(--gray-200);
  --border-default: var(--gray-300);
  --border-emphasis: var(--gray-400);
  --border-inverse: var(--gray-700);
  
  /* Interactive States */
  --state-hover: oklch(0.98 0.005 270 / 0.5);
  --state-active: oklch(0.96 0.005 270 / 0.7);
  --state-focus: var(--brand-primary);
  --state-disabled: var(--gray-300);
  
  /* Status Colors */
  --status-success-bg: oklch(0.97 0.02 145);
  --status-success-border: oklch(0.88 0.06 145);
  --status-success-text: oklch(0.38 0.15 145);
  
  --status-error-bg: oklch(0.97 0.02 0);
  --status-error-border: oklch(0.88 0.06 0);
  --status-error-text: oklch(0.38 0.15 0);
  
  --status-warning-bg: oklch(0.97 0.02 85);
  --status-warning-border: oklch(0.88 0.06 85);
  --status-warning-text: oklch(0.38 0.12 85);
  
  --status-info-bg: oklch(0.97 0.02 240);
  --status-info-border: oklch(0.88 0.06 240);
  --status-info-text: oklch(0.38 0.15 240);
}
```

### 3. Component Tokens (Specific)
```css
@layer components {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BUTTON SYSTEM — Standardized Sizes & Variants
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .btn {
    /* Base */
    @apply inline-flex items-center justify-center font-medium;
    @apply transition-colors duration-base ease-out;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    @apply touch-manipulation;
    
    /* Default size (medium) */
    min-height: var(--touch-standard);
    padding-inline: var(--space-4);
    font-size: var(--text-sm);
    border-radius: var(--radius-md);
  }
  
  /* Sizes */
  .btn-xs {
    min-height: var(--size-md);
    padding-inline: var(--space-2);
    font-size: var(--text-xs);
  }
  
  .btn-sm {
    min-height: var(--touch-compact);
    padding-inline: var(--space-3);
    font-size: var(--text-xs);
  }
  
  .btn-lg {
    min-height: var(--touch-primary);
    padding-inline: var(--space-6);
    font-size: var(--text-base);
  }
  
  .btn-xl {
    min-height: var(--size-4xl);
    padding-inline: var(--space-8);
    font-size: var(--text-lg);
  }
  
  /* Variants */
  .btn-primary {
    background: var(--brand-primary);
    color: var(--text-inverse);
    
    &:hover:not(:disabled) {
      background: oklch(0.48 0.16 240);
    }
    
    &:active:not(:disabled) {
      background: oklch(0.38 0.15 240);
    }
  }
  
  .btn-secondary {
    background: var(--surface-muted);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
    
    &:hover:not(:disabled) {
      background: var(--surface-emphasis);
      border-color: var(--border-emphasis);
    }
  }
  
  .btn-ghost {
    background: transparent;
    color: var(--text-primary);
    
    &:hover:not(:disabled) {
      background: var(--state-hover);
    }
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CARD SYSTEM — Consistent Container Styling
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .card {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    
    &.card-hover {
      transition: all var(--duration-base) var(--ease-out);
      
      @media (hover: hover) {
        &:hover {
          border-color: var(--border-default);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
      }
    }
  }
  
  .card-sm {
    padding: var(--space-3);
    border-radius: var(--radius-md);
  }
  
  .card-lg {
    padding: var(--space-6);
    border-radius: var(--radius-xl);
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     INPUT SYSTEM — Form Control Standards
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .input {
    width: 100%;
    min-height: var(--touch-primary);
    padding-inline: var(--space-3);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-base); /* Prevents zoom */
    background: var(--surface-base);
    color: var(--text-primary);
    transition: border-color var(--duration-fast) var(--ease-out);
    
    &:hover:not(:focus):not(:disabled) {
      border-color: var(--border-emphasis);
    }
    
    &:focus {
      outline: none;
      border-color: var(--state-focus);
      ring: 2px solid oklch(0.58 0.14 240 / 0.2);
    }
    
    &:disabled {
      background: var(--surface-muted);
      color: var(--text-disabled);
      cursor: not-allowed;
    }
    
    &[aria-invalid="true"] {
      border-color: var(--color-error);
      
      &:focus {
        ring-color: oklch(0.58 0.14 0 / 0.2);
      }
    }
  }
  
  .input-sm {
    min-height: var(--touch-compact);
    padding-inline: var(--space-2);
    font-size: var(--text-sm);
  }
  
  .input-lg {
    min-height: var(--size-4xl);
    padding-inline: var(--space-4);
    font-size: var(--text-lg);
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BADGE SYSTEM — Status & Category Indicators
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .badge {
    display: inline-flex;
    align-items: center;
    padding-inline: var(--space-2);
    padding-block: var(--space-1);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    line-height: var(--leading-tight);
    white-space: nowrap;
  }
  
  .badge-success {
    background: var(--status-success-bg);
    color: var(--status-success-text);
    border: 1px solid var(--status-success-border);
  }
  
  .badge-error {
    background: var(--status-error-bg);
    color: var(--status-error-text);
    border: 1px solid var(--status-error-border);
  }
  
  .badge-warning {
    background: var(--status-warning-bg);
    color: var(--status-warning-text);
    border: 1px solid var(--status-warning-border);
  }
  
  .badge-info {
    background: var(--status-info-bg);
    color: var(--status-info-text);
    border: 1px solid var(--status-info-border);
  }
}
```

## 🎯 Responsive Design System

### Breakpoint Strategy
```css
/* Mobile-First Breakpoints */
@custom-media --sm (min-width: 640px);   /* Tablet */
@custom-media --md (min-width: 768px);   /* Small laptop */
@custom-media --lg (min-width: 1024px);  /* Desktop */
@custom-media --xl (min-width: 1280px);  /* Large desktop */
@custom-media --2xl (min-width: 1536px); /* Ultra-wide */

/* Container Queries for Component-Level Responsiveness */
@container sidebar (min-width: 300px) {
  .sidebar-item { padding: var(--space-4); }
}

@container card (min-width: 400px) {
  .card-content { flex-direction: row; }
}
```

### Fluid Typography
```css
/* Clamp-based responsive sizing */
:root {
  --fluid-text-xs: clamp(0.75rem, 2vw, 0.875rem);
  --fluid-text-sm: clamp(0.875rem, 2.5vw, 1rem);
  --fluid-text-base: clamp(1rem, 3vw, 1.125rem);
  --fluid-text-lg: clamp(1.125rem, 3.5vw, 1.25rem);
  --fluid-text-xl: clamp(1.25rem, 4vw, 1.5rem);
  --fluid-text-2xl: clamp(1.5rem, 5vw, 2rem);
  --fluid-text-3xl: clamp(1.875rem, 6vw, 2.5rem);
  --fluid-text-4xl: clamp(2.25rem, 7vw, 3rem);
}
```

### Responsive Spacing
```css
/* Dynamic spacing that scales with viewport */
:root {
  --fluid-space-xs: clamp(0.25rem, 1vw, 0.5rem);
  --fluid-space-sm: clamp(0.5rem, 2vw, 1rem);
  --fluid-space-md: clamp(1rem, 3vw, 1.5rem);
  --fluid-space-lg: clamp(1.5rem, 4vw, 2rem);
  --fluid-space-xl: clamp(2rem, 5vw, 3rem);
}
```

## 🔧 Utility Classes

### Layout Utilities
```css
@utility container-mobile {
  width: 100%;
  max-width: 100vw;
  padding-inline: var(--space-4);
  margin-inline: auto;
  
  @media (--sm) {
    max-width: 640px;
  }
  
  @media (--md) {
    max-width: 768px;
    padding-inline: var(--space-6);
  }
  
  @media (--lg) {
    max-width: 1024px;
    padding-inline: var(--space-8);
  }
}

@utility stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@utility cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

@utility center {
  display: grid;
  place-items: center;
}
```

### Scroll Utilities
```css
@utility scroll-snap-x {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  & > * {
    scroll-snap-align: start;
  }
}

@utility scrollbar-thin {
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--surface-muted);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-emphasis);
    border-radius: var(--radius-full);
  }
}
```

### Performance Utilities
```css
@utility gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

@utility no-blur-scroll {
  @media (max-width: 639px) {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

@utility safe-area-padding {
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

## 📦 Component CSS Modules

### Product Card Module
```css
/* packages/ui/src/styles/ProductCard.module.css */
.productCard {
  container-type: inline-size;
  container-name: product-card;
  
  .image {
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--radius-md);
    background: var(--surface-muted);
  }
  
  .content {
    padding-top: var(--space-2);
  }
  
  .price {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }
  
  .brand {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
  }
  
  .title {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: var(--leading-snug);
    
    @supports (-webkit-line-clamp: 2) {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }
  
  @container product-card (min-width: 300px) {
    .content {
      padding-top: var(--space-3);
    }
    
    .price {
      font-size: var(--text-xl);
    }
  }
}
```

### Category Pill Module
```css
/* packages/ui/src/styles/CategoryPill.module.css */
.categoryPill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  
  min-height: var(--touch-standard);
  min-width: var(--space-16);
  padding-inline: var(--space-3);
  
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
  
  transition-property: colors, transform;
  transition-duration: var(--duration-fast);
  transition-timing-function: var(--ease-out);
  
  @media (--sm) {
    font-size: var(--text-sm);
    padding-inline: var(--space-4);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &[data-variant="primary"] {
    background: linear-gradient(135deg, var(--gray-900), var(--gray-950));
    color: var(--text-inverse);
    
    &:hover {
      box-shadow: var(--shadow-md);
    }
  }
  
  &[data-variant="secondary"] {
    background: var(--surface-muted);
    border: 1px solid var(--border-default);
    color: var(--text-primary);
    
    &:hover {
      background: var(--surface-emphasis);
      border-color: var(--border-emphasis);
    }
  }
}
```

## 🚀 Implementation Plan

### Phase 1: Foundation Setup (2 hours)
1. **Consolidate Token System**
   - Move all tokens to `packages/ui/src/styles/tokens.css`
   - Import in both web and admin apps
   - Remove duplicate color definitions

2. **Update PostCSS Configuration**
   ```js
   // apps/web/postcss.config.js
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
       'postcss-import': {},
       'postcss-nesting': {},
       autoprefixer: {}
     }
   };
   ```

### Phase 2: Component Migration (4 hours)
1. **Create CSS Modules for Core Components**
   - ProductCard.module.css
   - CategoryPill.module.css
   - Button.module.css
   - Input.module.css
   - Card.module.css

2. **Update Component Imports**
   ```svelte
   <script>
     import styles from './ProductCard.module.css';
   </script>
   
   <div class={styles.productCard}>
     <!-- Component content -->
   </div>
   ```

### Phase 3: Replace Hardcoded Values (3 hours)
1. **Search & Replace Patterns**
   ```bash
   # Find arbitrary values
   grep -r "min-h-\[" --include="*.svelte"
   grep -r "text-\[" --include="*.svelte"
   grep -r "px-\d\d" --include="*.svelte"
   
   # Replace with tokens
   min-h-[44px] → min-h-touch-primary
   text-[12px] → text-xs
   px-16 → px-space-16
   ```

2. **Update Tailwind Config**
   ```css
   @theme {
     /* Map spacing to Tailwind classes */
     --spacing-1: var(--space-1);
     --spacing-2: var(--space-2);
     /* ... etc */
   }
   ```

### Phase 4: Responsive Patterns (2 hours)
1. **Implement Container Queries**
   - Add container query support to cards
   - Make sidebar responsive to container width
   - Create fluid typography system

2. **Mobile-First Media Queries**
   - Replace max-width queries with min-width
   - Use custom media for consistency
   - Test at 375px viewport first

### Phase 5: Performance Optimization (1 hour)
1. **Remove Render-Blocking Styles**
   - Eliminate backdrop-blur on scroll
   - Replace transition-all with specific properties
   - Reduce shadow complexity on mobile

2. **Critical CSS Extraction**
   - Inline above-fold styles
   - Lazy load component styles
   - Use CSS containment for performance

## 📊 Success Metrics

### Code Quality
- ✅ Zero hardcoded pixel values in components
- ✅ All colors using OKLCH tokens
- ✅ Consistent spacing using 4px grid
- ✅ TypeScript support for CSS modules

### Performance
- ✅ CSS bundle <50KB gzipped
- ✅ No layout shift from dynamic styles
- ✅ 60fps scrolling on mobile devices
- ✅ <100ms style recalculation time

### Developer Experience
- ✅ IntelliSense for all tokens
- ✅ Component style isolation
- ✅ Hot module replacement working
- ✅ Design token documentation

### Accessibility
- ✅ All touch targets ≥36px
- ✅ Focus states visible
- ✅ Color contrast WCAG AA
- ✅ Reduced motion respected

## 🔍 Validation Checklist

```bash
# Run validation scripts
pnpm run style:audit     # Check for hardcoded values
pnpm run style:tokens    # Validate token usage
pnpm run style:contrast  # Check color contrast
pnpm run style:size      # Verify bundle size
```

## 📚 Developer Guidelines

### When to Use What
- **Tokens**: Always for colors, spacing, typography
- **Utilities**: For single-purpose modifications
- **Components**: For reusable patterns
- **Modules**: For complex component styles

### Naming Conventions
```css
/* Tokens: kebab-case with category prefix */
--color-primary
--space-md
--text-lg

/* Components: PascalCase modules */
ProductCard.module.css
CategoryPill.module.css

/* Utilities: descriptive kebab-case */
.scrollbar-thin
.container-mobile
```

### Migration Example
```svelte
<!-- Before: Hardcoded values -->
<button class="min-h-[44px] px-4 bg-blue-600 text-white rounded-lg">
  Buy Now
</button>

<!-- After: Token-based -->
<button class="btn btn-primary btn-lg">
  Buy Now
</button>
```

## 🎨 Theme Customization

### Creating Theme Variants
```css
/* Light theme (default) */
:root {
  --theme-name: 'light';
  /* Token overrides */
}

/* Dark theme */
:root[data-theme="dark"] {
  --theme-name: 'dark';
  --surface-base: var(--gray-900);
  --text-primary: var(--gray-50);
  /* ... other overrides */
}

/* High contrast */
:root[data-theme="high-contrast"] {
  --border-default: var(--gray-950);
  --text-primary: var(--gray-950);
  /* ... other overrides */
}
```

---

## Summary

This professional styling structure provides:
1. **Systematic token usage** eliminating hardcoded values
2. **Component-level CSS modules** for maintainable styles
3. **Responsive design patterns** with mobile-first approach
4. **Performance optimizations** for smooth mobile experience
5. **Clear migration path** from current implementation

The architecture scales from single components to entire theme systems while maintaining consistency and performance across the platform.

