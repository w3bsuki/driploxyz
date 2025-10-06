# Tailwind CSS v4 MCP Refactor Plan

## Overview
This document provides a comprehensive refactor plan for migrating to Tailwind CSS v4, optimizing bundle size, removing unused CSS, implementing CSS-in-JS patterns, cleaning up the design system, and optimizing responsive design for production readiness.

## Objectives
- Migrate to Tailwind CSS v4 with latest features
- Remove unused CSS classes and optimize bundle size
- Implement modern CSS-in-JS patterns with Tailwind v4
- Clean up and optimize the design system
- Improve responsive design patterns
- Enhance performance and maintainability

## Prerequisites
- Tailwind CSS v4.1.12 or later installed
- Node.js 22.12.0 or later
- Vite 7.1.2 or later
- Existing Tailwind CSS v3 configuration

---

## 1. Migration to Tailwind CSS v4

### 1.1 Current State Analysis
```bash
# Check current Tailwind version
npm list tailwindcss

# Analyze current CSS usage
npx @tailwindcss/analyzer apps/web/src/app.css

# Check for legacy patterns
grep -r "theme(" apps/web/src packages/ui/src --include="*.css" --include="*.svelte"
```

### 1.2 Update Dependencies
```bash
# Update to Tailwind CSS v4
npm install tailwindcss@^4.1.12 @tailwindcss/vite@^4.1.12 @tailwindcss/forms@^0.5.10 @tailwindcss/typography@^0.5.16

# Remove legacy packages
npm uninstall @tailwindcss/typography autoprefixer postcss
```

### 1.3 Configuration Migration
```css
/* BEFORE: Tailwind CSS v3 configuration */
/* tailwind.config.js */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}

/* AFTER: Tailwind CSS v4 configuration */
/* apps/web/src/app.css */
@import 'tailwindcss';
@import '@tailwindcss/forms';
@import '@tailwindcss/typography';

@source '../../../packages/ui/src/**/*.{html,js,svelte,ts}';
@source './lib/**/*.{svelte,ts}';
@source './routes/**/*.{svelte,ts}';

@theme {
  --color-primary-50: oklch(0.98 0.01 240);
  --color-primary-500: oklch(0.62 0.12 240);
  --color-primary-900: oklch(0.22 0.10 240);
}
```

### 1.4 Vite Configuration Update
```typescript
// apps/web/vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite'; // v4 import
import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig({
  plugins: [
    tailwindcss(), // v4 plugin
    enhancedImages(),
    paraglideVitePlugin({
      project: '../../packages/i18n/project.inlang',
      outdir: '../../packages/i18n/lib/paraglide',
      strategy: ['cookie', 'url', 'baseLocale']
    }),
    sveltekit()
  ],
  // ... rest of config
});
```

---

## 2. Remove Unused CSS Classes

### 2.1 Purge Analysis
```bash
# Create a script to analyze unused CSS
# scripts/analyze-unused-css.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

function findUsedClasses() {
  const files = glob.sync('apps/web/src/**/*.{svelte,ts}');
  const usedClasses = new Set();
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const classMatches = content.match(/class[:=]["'][\s\S]*?["']/g);
    
    if (classMatches) {
      classMatches.forEach(match => {
        const classes = match.replace(/class[:=]["']/g, '').replace(/["']/g, '');
        classes.split(/\s+/).forEach(cls => {
          if (cls.trim()) usedClasses.add(cls.trim());
        });
      });
    }
  });
  
  return Array.from(usedClasses);
}

function findDefinedClasses() {
  const cssContent = fs.readFileSync('apps/web/src/app.css', 'utf8');
  const classMatches = cssContent.match(/\.[a-zA-Z0-9-_]+/g);
  
  return classMatches ? classMatches.map(cls => cls.substring(1)) : [];
}

function main() {
  const usedClasses = findUsedClasses();
  const definedClasses = findDefinedClasses();
  
  const unusedClasses = definedClasses.filter(cls => !usedClasses.includes(cls));
  
  console.log('Unused CSS classes:');
  unusedClasses.forEach(cls => console.log(`  .${cls}`));
  
  console.log(`\nFound ${unusedClasses.length} unused classes out of ${definedClasses.length} total`);
}

main();
```

### 2.2 Automated Cleanup
```bash
# Run the analysis script
node scripts/analyze-unused-css.js

# Create a cleanup script
# scripts/cleanup-unused-css.js
const fs = require('fs');
const { execSync } = require('child_process');

function removeUnusedClasses(unusedClasses) {
  const cssPath = 'apps/web/src/app.css';
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  
  unusedClasses.forEach(cls => {
    // Remove class definitions
    const classRegex = new RegExp(`\\.${cls}[^}]*}`, 'g');
    cssContent = cssContent.replace(classRegex, '');
    
    // Remove utility definitions
    const utilityRegex = new RegExp(`@utility ${cls}[^}]*}`, 'g');
    cssContent = cssContent.replace(utilityRegex, '');
  });
  
  fs.writeFileSync(cssPath, cssContent);
  console.log(`Removed ${unusedClasses.length} unused classes`);
}

// Get unused classes from analysis
const unusedClasses = [
  // List of classes to remove
];

removeUnusedClasses(unusedClasses);
```

### 2.3 Component Class Optimization
```svelte
<!-- BEFORE: Bloated class lists -->
<div class="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 ease-in-out">

<!-- AFTER: Optimized with semantic classes -->
<div class="card-interactive">
```

```css
/* apps/web/src/app.css */
@layer components {
  .card-interactive {
    @apply bg-white border border-gray-200 rounded-lg shadow-md p-4;
    @apply hover:shadow-lg transition-shadow duration-200 ease-in-out;
  }
}
```

---

## 3. Optimize Bundle Size

### 3.1 Bundle Analysis
```bash
# Analyze current bundle size
npm run build

# Use bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Update vite.config.ts to include bundle analyzer
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... other plugins
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ].filter(Boolean)
});
```

### 3.2 CSS Optimization Strategies
```css
/* BEFORE: Duplicated styles */
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded;
}

.btn-secondary {
  @apply bg-gray-500 text-white px-4 py-2 rounded;
}

/* AFTER: Optimized with base class */
.btn-base {
  @apply text-white px-4 py-2 rounded transition-colors;
}

.btn-primary {
  @apply btn-base bg-blue-500 hover:bg-blue-600;
}

.btn-secondary {
  @apply btn-base bg-gray-500 hover:bg-gray-600;
}
```

### 3.3 Critical CSS Extraction
```typescript
// scripts/extract-critical-css.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function extractCriticalCSS() {
  // Use critical CSS extraction tool
  execSync('npx critical apps/web/src/app.html --base apps/web --css apps/web/src/app.css --extract --output apps/web/static/critical.css', 
    { stdio: 'inherit' });
  
  console.log('Critical CSS extracted to apps/web/static/critical.css');
}

extractCriticalCSS();
```

### 3.4 Tree Shaking Configuration
```typescript
// vite.config.ts optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate CSS chunks
          'tailwind-base': ['tailwindcss'],
          'tailwind-components': ['@repo/ui/styles/components.css'],
          'tailwind-utilities': ['@repo/ui/styles/utilities.css']
        }
      }
    }
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        // Remove PostCSS plugins for Tailwind v4
      ]
    }
  }
});
```

---

## 4. Implement CSS-in-JS Patterns

### 4.1 Dynamic Theme System
```svelte
<!-- ThemeProvider.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { setContext, onMount } from 'svelte';
  
  interface Theme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
  }
  
  let { theme = 'light', children } = $props();
  
  let currentTheme = $state<Theme>({
    colors: {
      primary: 'oklch(0.62 0.12 240)',
      secondary: 'oklch(0.62 0.12 300)',
      accent: 'oklch(0.62 0.16 50)'
    },
    spacing: {
      xs: 'var(--space-1)',
      sm: 'var(--space-2)',
      md: 'var(--space-4)',
      lg: 'var(--space-6)'
    }
  });
  
  // Apply theme to CSS custom properties
  $effect(() => {
    if (!browser) return;
    
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
  });
  
  setContext('theme', currentTheme);
</script>

{@render children()}
```

### 4.2 Component-Specific Styles
```svelte
<!-- DynamicCard.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'default' | 'elevated' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    padding?: string;
    borderRadius?: string;
  }
  
  let { 
    variant = 'default', 
    size = 'md', 
    padding,
    borderRadius 
  }: Props = $props();
  
  let element: HTMLElement;
  
  // Dynamic styles based on props
  let styles = $derived(() => {
    const baseStyles = {
      transition: 'all 0.2s ease-in-out'
    };
    
    const variantStyles = {
      default: {
        backgroundColor: 'var(--surface-base)',
        border: '1px solid var(--border-default)'
      },
      elevated: {
        backgroundColor: 'var(--surface-elevated)',
        boxShadow: 'var(--elevation-md)'
      },
      outlined: {
        backgroundColor: 'transparent',
        border: '2px solid var(--border-emphasis)'
      }
    };
    
    const sizeStyles = {
      sm: { padding: 'var(--space-2)' },
      md: { padding: 'var(--space-4)' },
      lg: { padding: 'var(--space-6)' }
    };
    
    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(padding && { padding }),
      ...(borderRadius && { borderRadius })
    };
  });
  
  // Apply styles to element
  $effect(() => {
    if (!element) return;
    
    Object.entries(styles()).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  });
</script>

<div bind:this={element} class="dynamic-card">
  <slot />
</div>
```

### 4.3 CSS-in-JS Utilities
```typescript
// utils/css-in-js.ts
export function createStyleObject(styles: Record<string, string>) {
  return Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
}

export function applyDynamicStyles(
  element: HTMLElement,
  styles: Record<string, string>
) {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

export function createResponsiveStyles(
  breakpoint: 'sm' | 'md' | 'lg' | 'xl',
  styles: Record<string, string>
) {
  const mediaQuery = getBreakpointQuery(breakpoint);
  return `
    @media ${mediaQuery} {
      ${Object.entries(styles)
        .map(([property, value]) => `${property}: ${value}`)
        .join('; ')}
    }
  `;
}

function getBreakpointQuery(breakpoint: string) {
  const queries = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)'
  };
  return queries[breakpoint];
}
```

---

## 5. Design System Cleanup

### 5.1 Token System Optimization
```css
/* apps/web/src/app.css */
@theme {
  /* Color System - Modern OKLCH */
  --color-white: oklch(1 0 0);
  --color-black: oklch(0 0 0);
  
  /* Brand Colors */
  --color-brand-50: oklch(0.98 0.01 240);
  --color-brand-100: oklch(0.95 0.02 240);
  --color-brand-200: oklch(0.90 0.04 240);
  --color-brand-300: oklch(0.82 0.06 240);
  --color-brand-400: oklch(0.72 0.09 240);
  --color-brand-500: oklch(0.62 0.12 240);
  --color-brand-600: oklch(0.52 0.15 240);
  --color-brand-700: oklch(0.42 0.18 240);
  --color-brand-800: oklch(0.32 0.15 240);
  --color-brand-900: oklch(0.22 0.10 240);
  
  /* Semantic Colors */
  --color-surface-base: oklch(1 0 0);
  --color-surface-elevated: oklch(0.98 0.01 240);
  --color-surface-muted: oklch(0.96 0.02 240);
  
  --color-text-primary: oklch(0.15 0.02 240);
  --color-text-secondary: oklch(0.45 0.02 240);
  --color-text-muted: oklch(0.65 0.01 240);
  
  --color-border-default: oklch(0.88 0.01 240);
  --color-border-emphasis: oklch(0.78 0.02 240);
  --color-border-subtle: oklch(0.94 0.01 240);
  
  /* Spacing System - 4px base unit */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem;   /* 48px */
  --space-16: 4rem;   /* 64px */
  
  /* Typography Scale */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5.2 Component Library Standardization
```css
/* Component Base Classes */
@layer components {
  /* Button System */
  .btn {
    @apply inline-flex items-center justify-center rounded-md font-medium transition-all;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
    @apply disabled:pointer-events-none disabled:opacity-50;
  }
  
  .btn-sm {
    @apply h-8 px-3 text-xs;
  }
  
  .btn-md {
    @apply h-10 px-4 py-2 text-sm;
  }
  
  .btn-lg {
    @apply h-12 px-6 text-base;
  }
  
  .btn-primary {
    @apply bg-brand-600 text-white hover:bg-brand-700;
    @apply focus-visible:ring-brand-500;
  }
  
  .btn-secondary {
    @apply bg-surface-elevated border border-border-default text-text-primary;
    @apply hover:bg-surface-muted hover:border-border-emphasis;
    @apply focus-visible:ring-brand-500;
  }
  
  .btn-ghost {
    @apply text-text-secondary hover:text-text-primary hover:bg-surface-muted;
    @apply focus-visible:ring-brand-500;
  }
  
  /* Card System */
  .card {
    @apply bg-surface-base border border-border-default rounded-lg;
    @apply shadow-sm;
  }
  
  .card-hover {
    @apply transition-shadow hover:shadow-md;
  }
  
  .card-interactive {
    @apply transition-all hover:shadow-md hover:-translate-y-1;
  }
  
  /* Form System */
  .form-field {
    @apply space-y-2;
  }
  
  .form-label {
    @apply text-sm font-medium text-text-primary;
  }
  
  .form-input {
    @apply h-10 w-full rounded-md border border-border-default bg-surface-base px-3 py-2;
    @apply text-sm placeholder:text-text-muted;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2;
    @apply disabled:cursor-not-allowed disabled:opacity-50;
  }
  
  .form-error {
    @apply text-sm text-status-error-solid;
  }
}
```

### 5.3 Utility Cleanup
```css
/* Remove duplicate utilities and consolidate */
@layer utilities {
  /* Spacing Utilities */
  .space-y-1 > * + * { margin-top: var(--space-1); }
  .space-y-2 > * + * { margin-top: var(--space-2); }
  .space-y-3 > * + * { margin-top: var(--space-3); }
  .space-y-4 > * + * { margin-top: var(--space-4); }
  .space-y-6 > * + * { margin-top: var(--space-6); }
  
  .space-x-1 > * + * { margin-left: var(--space-1); }
  .space-x-2 > * + * { margin-left: var(--space-2); }
  .space-x-3 > * + * { margin-left: var(--space-3); }
  .space-x-4 > * + * { margin-left: var(--space-4); }
  .space-x-6 > * + * { margin-left: var(--space-6); }
  
  /* Text Utilities */
  .text-balance {
    text-wrap: balance;
  }
  
  .text-pretty {
    text-wrap: pretty;
  }
  
  /* Interactive Utilities */
  .tap-highlight {
    -webkit-tap-highlight-color: transparent;
  }
  
  .gpu-accelerated {
    transform: translateZ(0);
    will-change: transform;
  }
}
```

---

## 6. Responsive Design Optimization

### 6.1 Mobile-First Approach
```svelte
<!-- ResponsiveContainer.svelte -->
<script lang="ts">
  interface Props {
    children: import('svelte').Snippet;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: boolean;
    center?: boolean;
  }
  
  let { 
    children, 
    maxWidth = 'lg', 
    padding = true, 
    center = true 
  }: Props = $props();
  
  let classes = $derived(() => {
    const base = 'w-full';
    const widthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full'
    };
    
    const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';
    const centerClasses = center ? 'mx-auto' : '';
    
    return `${base} ${widthClasses[maxWidth]} ${paddingClasses} ${centerClasses}`;
  });
</script>

<div class={classes()}>
  {@render children()}
</div>
```

### 6.2 Responsive Breakpoint System
```css
/* Custom breakpoint utilities */
@layer utilities {
  /* Container Queries */
  @container (min-width: 320px) {
    .container-xs { /* styles for extra small containers */ }
  }
  
  @container (min-width: 640px) {
    .container-sm { /* styles for small containers */ }
  }
  
  @container (min-width: 768px) {
    .container-md { /* styles for medium containers */ }
  }
  
  @container (min-width: 1024px) {
    .container-lg { /* styles for large containers */ }
  }
  
  /* Responsive Typography */
  .text-responsive {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
  }
  
  .heading-responsive {
    font-size: clamp(1.5rem, 4vw, 2rem);
  }
  
  /* Responsive Spacing */
  .space-responsive {
    margin: clamp(1rem, 5vw, 2rem);
  }
  
  /* Responsive Grid */
  .grid-responsive {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
    gap: var(--space-4);
  }
}
```

### 6.3 Performance Optimization
```css
/* Optimize for mobile performance */
@media (max-width: 640px) {
  /* Reduce animations on mobile */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Optimize images for mobile */
  img {
    content-visibility: auto;
    contain-intrinsic-size: 300px 200px;
  }
  
  /* Optimize scrolling */
  .scroll-container {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
}

/* Optimize for reduced motion */
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
```

---

## 7. Build Process Optimization

### 7.1 CSS Minification and Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    cssMinify: 'lightningcss', // Use Lightning CSS for faster minification
    rollupOptions: {
      output: {
        // Optimize CSS chunking
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  css: {
    lightningcss: {
      targets: {
        // Support for modern browsers
        browsers: ['> 0.5%', 'last 2 versions', 'not dead']
      }
    }
  }
});
```

### 7.2 Critical CSS Inlining
```typescript
// scripts/inline-critical-css.js
const fs = require('fs');
const path = require('path');

function inlineCriticalCSS() {
  const htmlPath = 'apps/web/src/app.html';
  const criticalCSSPath = 'apps/web/static/critical.css';
  
  let html = fs.readFileSync(htmlPath, 'utf8');
  const criticalCSS = fs.readFileSync(criticalCSSPath, 'utf8');
  
  // Inline critical CSS
  html = html.replace(
    '</head>',
    `  <style>${criticalCSS}</style>\n</head>`
  );
  
  fs.writeFileSync(htmlPath, html);
  console.log('Critical CSS inlined successfully');
}

inlineCriticalCSS();
```

### 7.3 Post-Build Optimization
```bash
# scripts/optimize-css.sh
#!/bin/bash

# Run PurgeCSS to remove unused CSS
npx purgecss --css apps/web/src/app.css --content apps/web/src/**/*.svelte --output apps/web/src/app.optimized.css

# Replace original with optimized
mv apps/web/src/app.optimized.css apps/web/src/app.css

# Run CSSNano for additional optimization
npx cssnano apps/web/src/app.css apps/web/src/app.min.css

echo "CSS optimization complete"
```

---

## 8. Testing and Validation

### 8.1 Visual Regression Testing
```typescript
// tests/css-visual.test.ts
import { test, expect } from '@playwright/test';

test.describe('CSS Visual Tests', () => {
  test('button components render correctly', async ({ page }) => {
    await page.goto('/components/buttons');
    
    // Take screenshot of button variants
    await expect(page.locator('.btn-primary')).toHaveScreenshot('btn-primary.png');
    await expect(page.locator('.btn-secondary')).toHaveScreenshot('btn-secondary.png');
    await expect(page.locator('.btn-ghost')).toHaveScreenshot('btn-ghost.png');
  });
  
  test('responsive design works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toHaveScreenshot('mobile-view.png');
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toHaveScreenshot('tablet-view.png');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toHaveScreenshot('desktop-view.png');
  });
});
```

### 8.2 Performance Testing
```typescript
// tests/css-performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('CSS Performance Tests', () => {
  test('CSS bundle size is within limits', async ({ page }) => {
    const responses = [];
    
    page.on('response', response => {
      if (response.url().includes('.css')) {
        responses.push(response);
      }
    });
    
    await page.goto('/');
    
    // Check total CSS size
    const totalCSSSize = responses.reduce((total, response) => {
      return total + parseInt(response.headers()['content-length'] || '0');
    }, 0);
    
    // CSS should be less than 50KB gzipped
    expect(totalCSSSize).toBeLessThan(50 * 1024);
  });
  
  test('CSS loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for CSS to load
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // CSS should load within 1 second
    expect(loadTime).toBeLessThan(1000);
  });
});
```

---

## 9. Migration Checklist

### 9.1 Pre-Migration
- [ ] Backup current CSS files
- [ ] Analyze current CSS usage patterns
- [ ] Identify custom components and utilities
- [ ] Document current design tokens

### 9.2 Migration Tasks
- [ ] Update Tailwind CSS to v4
- [ ] Migrate configuration to @theme syntax
- [ ] Update Vite configuration
- [ ] Refactor color system to OKLCH
- [ ] Optimize component classes
- [ ] Remove unused CSS
- [ ] Implement responsive optimizations
- [ ] Set up CSS-in-JS patterns

### 9.3 Post-Migration
- [ ] Run visual regression tests
- [ ] Validate responsive design
- [ ] Check bundle size improvements
- [ ] Test performance metrics
- [ ] Update documentation

---

## 10. Success Criteria

### 10.1 Performance Metrics
- CSS bundle size reduced by at least 30%
- First Contentful Paint under 1.5 seconds
- Largest Contentful Paint under 2.5 seconds
- Cumulative Layout Shift under 0.1

### 10.2 Code Quality Metrics
- Zero unused CSS classes
- 100% OKLCH color system adoption
- Consistent design token usage
- Mobile-first responsive design

### 10.3 Developer Experience
- Clear component API
- Comprehensive documentation
- Easy theme customization
- Consistent naming conventions

---

## 11. Next Steps

1. Execute migration in phases
2. Set up automated CSS testing
3. Implement design system documentation
4. Create component library guidelines
5. Establish performance monitoring