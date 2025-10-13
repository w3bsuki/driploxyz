# Tailwind CSS v4 Refactor Plan

## Executive Summary

This document outlines a comprehensive migration strategy to Tailwind CSS v4, focusing on developer experience, design system consistency, and modern CSS patterns. The refactor will leverage v4's CSS-based configuration, OKLCH color spaces, improved build system, and container queries to create a more maintainable and performant styling architecture.

## Current State Analysis

### Existing Setup
- **Tailwind CSS v4.1.12** already installed with Vite plugin
- **CSS-based configuration** partially implemented in `apps/web/src/app.css`
- **Design tokens** defined in `packages/ui/src/styles/tokens/` with OKLCH colors
- **Component styles** mixed between utilities and custom CSS
- **Svelte 5** with runes-based reactivity

### Migration Opportunities
1. **Complete CSS-based configuration** - Remove any remaining JavaScript config dependencies
2. **Optimized token system** - Leverage v4's native CSS variable output
3. **Modern color system** - Fully utilize OKLCH with proper fallbacks
4. **Container queries** - Implement v4's built-in container query support
5. **Performance optimizations** - Utilize v4's improved build system and tree-shaking
6. **Updated utility patterns** - Migrate to v4's new utility syntax and patterns

## Phase 1: Foundation Migration

### 1.1 Update Configuration Architecture

**Target**: Complete CSS-based configuration using `@theme` directive

**Actions**:
- Remove any remaining `tailwind.config.js` files
- Consolidate all theme configuration in `apps/web/src/app.css`
- Update Vite configuration to use latest `@tailwindcss/vite` plugin
- Ensure PostCSS configuration uses `@tailwindcss/postcss`

**Implementation**:
```css
/* apps/web/src/app.css */
@import "tailwindcss";
@import "@repo/ui/styles/tokens.css";
@import "@repo/ui/styles/base.css";
@import "@repo/ui/styles/components.css";
@import "@repo/ui/styles/utilities.css";
@import "@repo/ui/styles/semantic.css";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/typography";

@source '../../../packages/ui/src/**/*.{html,js,svelte,ts}';
@source './lib/**/*.{svelte,ts}';
@source './routes/**/*.{svelte,ts}';

@theme {
  /* Enhanced brand color scales with OKLCH */
  --brand-primary-50: oklch(0.98 0.01 240);
  --brand-primary-100: oklch(0.95 0.02 240);
  --brand-primary-200: oklch(0.90 0.04 240);
  --brand-primary-300: oklch(0.82 0.06 240);
  --brand-primary-400: oklch(0.72 0.09 240);
  --brand-primary-500: oklch(0.62 0.12 240);
  --brand-primary-600: oklch(0.52 0.15 240);
  --brand-primary-700: oklch(0.42 0.18 240);
  --brand-primary-800: oklch(0.32 0.15 240);
  --brand-primary-900: oklch(0.22 0.10 240);
  
  --brand-secondary-50: oklch(0.98 0.01 300);
  --brand-secondary-100: oklch(0.95 0.02 300);
  --brand-secondary-200: oklch(0.90 0.04 300);
  --brand-secondary-300: oklch(0.82 0.06 300);
  --brand-secondary-400: oklch(0.72 0.09 300);
  --brand-secondary-500: oklch(0.62 0.12 300);
  --brand-secondary-600: oklch(0.52 0.15 300);
  --brand-secondary-700: oklch(0.42 0.18 300);
  --brand-secondary-800: oklch(0.32 0.15 300);
  --brand-secondary-900: oklch(0.22 0.10 300);
  
  --brand-accent-50: oklch(0.98 0.01 50);
  --brand-accent-100: oklch(0.95 0.02 50);
  --brand-accent-200: oklch(0.90 0.04 50);
  --brand-accent-300: oklch(0.82 0.08 50);
  --brand-accent-400: oklch(0.72 0.12 50);
  --brand-accent-500: oklch(0.62 0.16 50);
  --brand-accent-600: oklch(0.52 0.18 50);
  --brand-accent-700: oklch(0.42 0.16 50);
  --brand-accent-800: oklch(0.32 0.12 50);
  --brand-accent-900: oklch(0.22 0.08 50);
  
  /* Modern spacing scale with fluid values */
  --spacing: clamp(0.25rem, 0.5vw, 1rem);
  
  /* Responsive typography system */
  --text-xs: clamp(0.6875rem, 0.65rem + 0.25vw, 0.75rem);
  --text-sm: clamp(0.8125rem, 0.75rem + 0.4vw, 0.875rem);
  --text-base: clamp(0.9375rem, 0.85rem + 0.6vw, 1rem);
  --text-lg: clamp(1.125rem, 1rem + 0.9vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 1.1vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.3rem + 1.5vw, 1.875rem);
  --text-3xl: clamp(1.875rem, 1.6rem + 2vw, 2.25rem);
  --text-4xl: clamp(2.25rem, 1.9rem + 2.5vw, 3rem);
  
  /* Custom breakpoints for fashion marketplace */
  --breakpoint-xs: 20rem;
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
  --breakpoint-2xl: 96rem;
  
  /* Container query support */
  --container-xs: 20rem;
  --container-sm: 24rem;
  --container-md: 36rem;
  --container-lg: 48rem;
  --container-xl: 64rem;
  --container-2xl: 72rem;
  
  /* v4 default ring width and color */
  --default-ring-width: 3px;
  --default-ring-color: var(--color-blue-500);
  
  /* Enhanced button states */
  --btn-primary-bg: var(--brand-primary-600);
  --btn-primary-bg-hover: var(--brand-primary-700);
  --btn-primary-bg-active: var(--brand-primary-800);
  --btn-primary-text: var(--color-white);
  --btn-primary-shadow: var(--shadow-sm);
  --btn-primary-shadow-hover: var(--shadow-md);
}
```

### 1.2 Optimize Design Token System

**Target**: Leverage v4's native CSS variable output for better performance

**Actions**:
- Refactor `packages/ui/src/styles/tokens/foundations.css` to use v4 patterns
- Implement semantic tokens in `packages/ui/src/styles/tokens/semantic.css`
- Create component-specific tokens in `packages/ui/src/styles/tokens/components.css`
- Add proper SRGB fallbacks for OKLCH colors

**Implementation**:
```css
/* packages/ui/src/styles/tokens/foundations.css */
@theme {
  /* Spacing scale with 4px rhythm */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-2-5: 10px;
  --space-3: 12px;
  --space-3-5: 14px;
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
  
  /* Fashion color palette with OKLCH */
  --fashion-charcoal-50: oklch(0.985 0.002 280);
  --fashion-charcoal-100: oklch(0.97 0.003 280);
  --fashion-charcoal-200: oklch(0.94 0.004 280);
  --fashion-charcoal-300: oklch(0.89 0.006 280);
  --fashion-charcoal-400: oklch(0.78 0.008 280);
  --fashion-charcoal-500: oklch(0.15 0.012 280);
  --fashion-charcoal-600: oklch(0.12 0.010 280);
  --fashion-charcoal-700: oklch(0.09 0.008 280);
  --fashion-charcoal-800: oklch(0.06 0.006 280);
  --fashion-charcoal-900: oklch(0.03 0.004 280);
  --fashion-charcoal-950: oklch(0.01 0.002 280);
  
  --denim-indigo-50: oklch(0.995 0.008 245);
  --denim-indigo-100: oklch(0.98 0.015 245);
  --denim-indigo-200: oklch(0.95 0.025 245);
  --denim-indigo-300: oklch(0.82 0.06 245);
  --denim-indigo-400: oklch(0.68 0.09 245);
  --denim-indigo-500: oklch(0.48 0.16 240);
  --denim-indigo-600: oklch(0.38 0.15 240);
  --denim-indigo-700: oklch(0.28 0.12 240);
  --denim-indigo-800: oklch(0.18 0.08 240);
  --denim-indigo-900: oklch(0.11 0.05 240);
  --denim-indigo-950: oklch(0.07 0.03 240);
  
  --burgundy-luxury-50: oklch(0.995 0.015 20);
  --burgundy-luxury-100: oklch(0.98 0.025 20);
  --burgundy-luxury-200: oklch(0.90 0.06 20);
  --burgundy-luxury-300: oklch(0.82 0.09 20);
  --burgundy-luxury-400: oklch(0.68 0.12 20);
  --burgundy-luxury-500: oklch(0.42 0.15 25);
  --burgundy-luxury-600: oklch(0.32 0.12 25);
  --burgundy-luxury-700: oklch(0.22 0.09 25);
  --burgundy-luxury-800: oklch(0.15 0.06 25);
  --burgundy-luxury-900: oklch(0.10 0.04 25);
  --burgundy-luxury-950: oklch(0.06 0.02 25);
  
  --champagne-gold-50: oklch(0.995 0.02 85);
  --champagne-gold-100: oklch(0.98 0.04 85);
  --champagne-gold-200: oklch(0.90 0.08 85);
  --champagne-gold-300: oklch(0.82 0.11 85);
  --champagne-gold-400: oklch(0.68 0.14 85);
  --champagne-gold-500: oklch(0.85 0.08 85);
  --champagne-gold-600: oklch(0.75 0.06 85);
  --champagne-gold-700: oklch(0.65 0.04 85);
  --champagne-gold-800: oklch(0.55 0.03 85);
  --champagne-gold-900: oklch(0.45 0.02 85);
  --champagne-gold-950: oklch(0.35 0.01 85);
  
  /* Standard OKLCH palette (legacy support) */
  --gray-0: oklch(1 0 0);
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
  --gray-950: oklch(0.05 0 0);
  
  /* v4 shadow scale updates */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.12), 0 10px 10px rgba(0, 0, 0, 0.08);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1);
  
  /* v4 radius scale updates */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
}

/* SRGB fallbacks for browsers without OKLCH support */
@supports not (color: oklch(1 0 0)) {
  :root {
    --fashion-charcoal-50: #ffffff;
    --fashion-charcoal-100: #f9fafb;
    --fashion-charcoal-200: #f3f4f6;
    --fashion-charcoal-300: #e5e7eb;
    --fashion-charcoal-400: #d1d5db;
    --fashion-charcoal-500: #1f2937;
    --fashion-charcoal-600: #111827;
    --fashion-charcoal-700: #1f2937;
    --fashion-charcoal-800: #1f2937;
    --fashion-charcoal-900: #111827;
    --fashion-charcoal-950: #030712;
    
    --denim-indigo-50: #eff6ff;
    --denim-indigo-100: #dbeafe;
    --denim-indigo-200: #bfdbfe;
    --denim-indigo-300: #93c5fd;
    --denim-indigo-400: #60a5fa;
    --denim-indigo-500: #3b82f6;
    --denim-indigo-600: #2563eb;
    --denim-indigo-700: #1d4ed8;
    --denim-indigo-800: #1e40af;
    --denim-indigo-900: #1e3a8a;
    
    --burgundy-luxury-50: #fef2f2;
    --burgundy-luxury-100: #fee2e2;
    --burgundy-luxury-200: #fecaca;
    --burgundy-luxury-300: #fca5a5;
    --burgundy-luxury-400: #f87171;
    --burgundy-luxury-500: #ef4444;
    --burgundy-luxury-600: #dc2626;
    --burgundy-luxury-700: #b91c1c;
    --burgundy-luxury-800: #991b1b;
    --burgundy-luxury-900: #7f1d1d;
    
    --champagne-gold-50: #fefce8;
    --champagne-gold-100: #fef3c7;
    --champagne-gold-200: #fde68a;
    --champagne-gold-300: #fcd34d;
    --champagne-gold-400: #fbbf24;
    --champagne-gold-500: #f59e0b;
    --champagne-gold-600: #d97706;
    --champagne-gold-700: #b45309;
    --champagne-gold-800: #92400e;
    --champagne-gold-900: #78350f;
    
    --gray-0: #ffffff;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    --gray-950: #030712;
  }
}
```

## Phase 2: Component System Refactor

### 2.1 Modernize Component Styles

**Target**: Convert component styles to leverage v4's `@utility` directive

**Actions**:
- Refactor `packages/ui/src/styles/components.css` to use `@utility` instead of `@layer components`
- Implement proper component variants using v4's variant system
- Create reusable component patterns with CSS custom properties

**Implementation**:
```css
/* Convert from @layer components to @utility */
@utility btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--height-button);
  padding: 0 var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
  user-select: none;
  border: none;
  text-decoration: none;
}

@utility btn-primary {
  background-color: var(--brand-primary-600);
  color: var(--color-white);
}

@utility btn-primary-hover {
  background-color: var(--brand-primary-700);
}

@utility btn-secondary {
  background-color: var(--brand-secondary-600);
  color: var(--color-white);
}

@utility btn-secondary-hover {
  background-color: var(--brand-secondary-700);
}

@utility btn-ghost {
  background-color: var(--btn-ghost-bg);
  color: var(--btn-ghost-text);
  border: 1px solid var(--btn-ghost-border);
}

@utility btn-ghost-hover {
  background-color: var(--btn-ghost-bg-hover);
  color: var(--btn-ghost-text-hover);
  border-color: var(--btn-ghost-border-hover);
}

/* Enhanced button variants */
@utility btn-sm {
  padding: 0 var(--space-2);
  min-height: 32px;
  font-size: var(--text-sm);
}

@utility btn-lg {
  padding: 0 var(--space-6);
  min-height: 56px;
  font-size: var(--text-lg);
}

/* v4 utility for interactive states */
@utility btn-interactive {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-out);
  transform: translateZ(0);
}

@utility btn-interactive::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width var(--duration-base) var(--ease-out),
              height var(--duration-base) var(--ease-out);
}

@utility btn-interactive:active::before {
  width: 300px;
  height: 300px;
}
```

### 2.2 Implement Container Queries

**Target**: Utilize v4's built-in container query support for responsive components

**Actions**:
- Add container query utilities to the design system
- Refactor responsive components to use container queries
- Create container-based breakpoints for component-level responsiveness

**Implementation**:
```css
/* Container query utilities */
@utility container {
  container-type: inline-size;
}

/* Container-based responsive styles */
@container (min-width: 20rem) {
  .product-card {
    grid-template-columns: 1fr;
  }
}

@container (min-width: 40rem) {
  .product-card {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 60rem) {
  .product-card {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Enhanced search component with container queries */
@utility search-container {
  container-type: inline-size;
}

@container (min-width: 30rem) {
  .search-results {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 48rem) {
  .search-results {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container (min-width: 64rem) {
  .search-results {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Phase 3: Advanced Features Implementation

### 3.1 Enhanced Color System

**Target**: Fully utilize OKLCH color space with proper accessibility

**Actions**:
- Implement complete OKLCH color palette with proper lightness values
- Add color contrast utilities for accessibility
- Create theme-aware color variables for light/dark modes
- Implement color mixing for dynamic UI states

**Implementation**:
```css
@theme {
  /* OKLCH-based color system with perceptual uniformity */
  --brand-primary-50: oklch(0.98 0.01 240);
  --brand-primary-100: oklch(0.95 0.02 240);
  --brand-primary-200: oklch(0.90 0.04 240);
  --brand-primary-300: oklch(0.82 0.06 240);
  --brand-primary-400: oklch(0.72 0.09 240);
  --brand-primary-500: oklch(0.62 0.12 240);
  --brand-primary-600: oklch(0.52 0.15 240);
  --brand-primary-700: oklch(0.42 0.18 240);
  --brand-primary-800: oklch(0.32 0.15 240);
  --brand-primary-900: oklch(0.22 0.10 240);
  
  /* Semantic color tokens */
  --color-surface: var(--brand-primary-50);
  --color-surface-hover: oklch(from var(--brand-primary-50) l c h / 0.8);
  --color-text-primary: var(--brand-primary-900);
  --color-text-secondary: var(--brand-primary-700);
  
  /* Interactive states with color mixing */
  --color-primary-hover: color-mix(in oklch, var(--brand-primary-600) 85%, black 15%);
  --color-primary-active: color-mix(in oklch, var(--brand-primary-600) 75%, black 25%);
  --color-primary-disabled: color-mix(in oklch, var(--brand-primary-600) 40%, transparent);
  
  /* Favorite colors with OKLCH */
  --favorite-solid: oklch(0.55 0.18 15);
  --favorite-hover: oklch(0.45 0.20 15);
  --favorite-luxury: var(--burgundy-luxury-500);
  
  /* Shopping experience colors */
  --shopping-cart: var(--denim-indigo-500);
  --checkout-primary: var(--forest-emerald-500);
  --sale-accent: var(--burgundy-luxury-500);
  --new-arrival: var(--champagne-gold-500);
  --limited-edition: var(--fashion-charcoal-700);
}

/* Dark theme with color-mix */
[data-theme="dark"] {
  --color-surface: color-mix(in oklch, var(--brand-primary-900) 90%, white 10%);
  --color-text-primary: var(--brand-primary-50);
  --color-text-secondary: var(--brand-primary-200);
  
  /* Dark mode interactive states */
  --color-primary-hover: color-mix(in oklch, var(--brand-primary-500) 80%, white 20%);
  --color-primary-active: color-mix(in oklch, var(--brand-primary-400) 70%, white 30%);
}

/* v4 opacity utilities */
@utility text-black\/50 {
  color: color-mix(in oklch, var(--color-black) 50%, transparent);
}

@utility bg-black\/50 {
  background-color: color-mix(in oklch, var(--color-black) 50%, transparent);
}

@utility border-black\/50 {
  border-color: color-mix(in oklch, var(--color-black) 50%, transparent);
}

@utility ring-black\/50 {
  --tw-ring-color: color-mix(in oklch, var(--color-black) 50%, transparent);
}
```

### 3.2 Modern Animation System

**Target**: Implement performant animations using v4's animation utilities

**Actions**:
- Create custom keyframe animations for micro-interactions
- Implement prefers-reduced-motion support
- Add GPU-accelerated transforms for smooth animations
- Create animation variants for different interaction states

**Implementation**:
```css
/* Custom animations */
@theme {
  --animate-fade-in: fadeIn 0.3s ease-out;
  --animate-slide-up: slideUp 0.3s ease-out;
  --animate-scale-in: scaleIn 0.2s ease-out;
  --animate-pulse-subtle: pulseSubtle 2s ease-in-out infinite;
  --animate-heart-pulse: heartPulse 1s ease-out;
  --animate-bounce-in: bounceIn 0.5s ease-out;
  --animate-shimmer: shimmer 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes heartPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* GPU-accelerated animations */
@utility animated-element {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

@utility favorite-button {
  cursor: pointer;
  transition: transform var(--duration-fast) var(--ease-out);
}

@utility favorite-button:active {
  transform: scale(0.95);
}

@utility favorite-button.favorited {
  animation: var(--animate-heart-pulse);
  color: var(--favorite-solid);
}

/* Loading states */
@utility skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: var(--animate-shimmer);
}

@utility pulse-animation {
  animation: var(--animate-pulse-subtle);
}
```

## Phase 4: Performance Optimization

### 4.1 Build System Optimization

**Target**: Leverage v4's improved build system for optimal performance

**Actions**:
- Configure Vite for optimal CSS processing
- Implement CSS purging for production builds
- Optimize font loading with proper font-display
- Set up CSS chunking for better caching

**Implementation**:
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
  ],
  css: {
    postcss: {
      plugins: {
        "@tailwindcss/postcss": {},
      },
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate CSS chunks for better caching
          'tailwind-base': ['tailwindcss/theme.css'],
          'tailwind-utilities': ['tailwindcss/utilities.css'],
          'tailwind-components': ['@repo/ui/styles/components.css'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'tailwindcss',
      '@tailwindcss/vite',
    ],
  },
});
```

### 4.2 Runtime Optimization

**Target**: Optimize CSS runtime performance with modern patterns

**Actions**:
- Implement CSS containment for layout optimization
- Use `content-visibility` for improved rendering
- Add proper will-change declarations for animations
- Implement CSS layers for better specificity management

**Implementation**:
```css
/* Layout optimization */
@layer base {
  /* CSS containment for layout stability */
  .product-grid {
    contain: layout style paint;
  }
  
  /* Content visibility for off-screen content */
  .off-screen {
    content-visibility: hidden;
    contain-intrinsic-size: 0 500px;
  }
  
  /* GPU acceleration for animations */
  .animated-element {
    will-change: transform, opacity;
    backface-visibility: hidden;
    transform: translateZ(0);
  }
  
  /* Button cursor fix for v4 */
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  
  /* Placeholder color fix for v4 */
  input::placeholder,
  textarea::placeholder {
    color: var(--color-gray-400);
  }
  
  /* Dialog margin fix for v4 */
  dialog {
    margin: auto;
  }
  
  /* Default border color fix for v4 */
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}

/* Layer management for specificity */
@layer theme {
  /* Theme variables */
}

@layer base {
  /* Base styles and resets */
}

@layer components {
  /* Component styles */
}

@layer utilities {
  /* Utility classes */
}

/* Development utilities */
@layer utilities {
  @utility debug-grid {
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: var(--spacing-4) var(--spacing-4);
  }
  
  @utility debug-outline {
    outline: 2px dashed var(--color-red-500);
  }
  
  @utility inspect-colors {
    --color-1: var(--color-primary);
    --color-2: var(--color-secondary);
    --color-3: var(--color-accent);
    
    background: linear-gradient(to right, var(--color-1), var(--color-2), var(--color-3));
  }
}

/* Production-only optimizations */
@layer production {
  .dev-only {
    display: none !important;
  }
}
```

## Phase 5: Developer Experience Enhancement

### 5.1 Development Workflow

**Target**: Create an optimal development workflow for v4

**Actions**:
- Set up hot module replacement for CSS changes
- Create development tools for token inspection
- Implement CSS debugging utilities
- Set up proper linting and formatting for CSS

**Implementation**:
```css
/* Development-only styles */
@layer development {
  .dev-only {
    display: block;
  }
  
  /* CSS variable inspector */
  .token-inspector {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    max-width: 300px;
  }
  
  .token-inspector::before {
    content: "CSS Variables Inspector";
    font-weight: bold;
    display: block;
    margin-bottom: 8px;
  }
  
  .token-inspector ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .token-inspector li {
    margin-bottom: 4px;
    word-break: break-all;
  }
}

/* v4 hover behavior fix */
@custom-variant hover (&:hover);

/* CSS variable reference for debugging */
@utility debug-var {
  content: var(--value, "undefined");
  font-family: monospace;
  background: var(--color-gray-100);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
}
```

### 5.2 Documentation and Patterns

**Target**: Create comprehensive documentation for the new system

**Actions**:
- Document all design tokens and their usage
- Create component patterns with examples
- Establish best practices for v4 usage
- Create migration guide for future developers

**Implementation**:
```markdown
# Design System Documentation

## Token Usage

### Colors
- Use semantic tokens: `var(--color-surface)`, `var(--color-text-primary)`
- Use color-mix for states: `color-mix(in oklch, var(--brand-primary-600) 85%, black 15%)`
- Avoid direct color values: `oklch(0.62 0.12 240)`

### Spacing
- Use spacing scale: `var(--space-4)`, `var(--space-8)`
- Use fluid spacing: `var(--layout-gutter-md)`
- Avoid arbitrary values: `16px`, `1rem`

### Typography
- Use fluid typography: `var(--text-base)`, `var(--text-lg)`
- Leverage line-height tokens: `var(--leading-body)`, `var(--leading-heading)`
- Use semantic font weights: `var(--font-body)`, `var(--font-heading)`

## Component Patterns

### Buttons
```html
<button class="btn btn-primary btn-lg">
  Primary Button
</button>
```

### Product Cards with Container Queries
```html
<div class="product-card @container">
  <div class="product-image">
    <!-- Product image -->
  </div>
  <div class="product-info">
    <!-- Product info -->
  </div>
</div>
```

## Migration Patterns

### From v3 to v4
- Replace `@tailwind` with `@import "tailwindcss"`
- Update ring width: `ring-3` instead of `ring`
- Update color opacity: `text-black/50` instead of `text-opacity-50`
- Update CSS variables: `bg-(--brand-color)` instead of `bg-[--brand-color]`
```

## Phase 6: Migration Strategy

### 6.1 Step-by-Step Migration

1. **Phase 1**: Update configuration and foundation
   - Update Vite configuration
   - Refactor theme tokens
   - Test basic functionality

2. **Phase 2**: Migrate component styles
   - Convert `@layer components` to `@utility`
   - Update component usage
   - Test component functionality

3. **Phase 3**: Implement advanced features
   - Add container queries
   - Implement enhanced color system
   - Add modern animations

4. **Phase 4**: Optimize performance
   - Configure build optimization
   - Implement runtime optimizations
   - Test performance improvements

5. **Phase 5**: Enhance developer experience
   - Set up development tools
   - Create documentation
   - Establish best practices

### 6.2 Testing Strategy

1. **Visual Regression Testing**
   - Set up visual regression tests for all components
   - Test color system across different browsers
   - Validate responsive behavior

2. **Performance Testing**
   - Measure bundle size improvements
   - Test runtime performance
   - Validate build optimizations

3. **Accessibility Testing**
   - Validate color contrast ratios
   - Test reduced motion support
   - Check screen reader compatibility

### 6.3 Rollback Plan

1. **Version Control**
   - Create separate branch for migration
   - Tag pre-migration state
   - Document all changes

2. **Feature Flags**
   - Implement feature flags for new features
   - Allow gradual rollout
   - Enable quick rollback if needed

3. **Monitoring**
   - Set up error monitoring
   - Track performance metrics
   - Monitor user feedback

## Success Metrics

### Performance Metrics
- **Bundle Size**: Reduce CSS bundle size by 20%
- **Build Time**: Improve build time by 30%
- **Runtime Performance**: Improve First Contentful Paint by 15%

### Developer Experience Metrics
- **Development Speed**: Reduce styling time by 25%
- **Code Consistency**: Increase design token usage by 40%
- **Maintainability**: Reduce custom CSS by 50%

### User Experience Metrics
- **Loading Performance**: Improve page load time by 20%
- **Visual Consistency**: Achieve 100% design system adherence
- **Accessibility**: Meet WCAG 2.1 AA standards

## Conclusion

This refactor plan provides a comprehensive migration to Tailwind CSS v4, focusing on modern CSS patterns, performance optimization, and developer experience. The phased approach ensures a smooth transition while maintaining system stability and functionality.

The new system will provide:
- **Better Performance**: Through optimized build system and runtime improvements
- **Enhanced Developer Experience**: With CSS-based configuration and modern patterns
- **Improved Maintainability**: Through consistent design tokens and component patterns
- **Future-Proof Architecture**: Leveraging the latest CSS features and best practices

This migration positions the project for long-term success with a modern, performant, and maintainable styling architecture.