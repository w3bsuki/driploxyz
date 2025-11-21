# Tailwind CSS v4 + Svelte 5 Product Card Design System Plan
## Based on Official Context7 & Svelte MCP Documentation

**Date:** October 16, 2025  
**Goal:** Implement proper Tailwind CSS v4 design tokens and Svelte 5 best practices for product cards  
**Target:** Vinted.co.uk-inspired tight, professional product cards

---

## 📚 Documentation Sources

### Tailwind CSS v4 (Context7)
- **Library ID:** `/websites/tailwindcss`
- **Trust Score:** 9.5/10
- **Code Snippets:** 1604+ examples
- **Key Topics:** `@theme` directive, design tokens, Vite integration, CSS variables

### Svelte 5 MCP
- **Relevant Sections:**
  - `svelte/scoped-styles` - Component-specific styling
  - `svelte/$state`, `svelte/$derived`, `svelte/$props` - Reactive state management
  - `svelte/class` - Conditional styling
  - `cli/tailwind` - Tailwind integration with Svelte

---

## 🎯 Tailwind CSS v4 Best Practices (From Official Docs)

### 1. **Use `@theme` Directive for Design Tokens**
```css
/* ✅ CORRECT: Define tokens in a centralized CSS file */
@import "tailwindcss";

@theme {
  /* Spacing System */
  --spacing: 4px; /* Base unit */
  
  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --font-weight-normal: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Color System (OKLCH) */
  --color-charcoal-50: oklch(0.98 0.005 280);
  --color-charcoal-600: oklch(0.40 0.016 280);
  --color-charcoal-900: oklch(0.15 0.012 280);
  
  /* Visual Effects */
  --radius-lg: 0.5rem;
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

**Source:** [Tailwind CSS v4 @theme Directive Documentation](https://tailwindcss.com/docs/functions-and-directives)

---

### 2. **Vite Configuration with `@tailwindcss/vite`**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), // ✅ MUST come BEFORE sveltekit()
    sveltekit(),
  ],
})
```

**Source:** [Tailwind CSS v4 with SvelteKit](https://tailwindcss.com/docs/installation/framework-guides/sveltekit)

---

### 3. **CSS Import Structure**
```css
/* app.css */
@import 'tailwindcss';
@import './path/to/tokens.css'; /* Your @theme definitions */

/* ❌ WRONG: Don't use @tailwind directives */
/* @tailwind base; */
/* @tailwind components; */
/* @tailwind utilities; */
```

**Source:** [Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)

---

### 4. **Component-Specific CSS with Theme Variables**
```svelte
<!-- ProductCard.svelte -->
<button class="product-card">
  <div class="product-card__image">...</div>
  <div class="product-card__content">...</div>
</button>

<style>
  /* ✅ CORRECT: Use scoped CSS with theme variables */
  .product-card__image {
    width: 100%;
    aspect-ratio: 3 / 4;
    border-radius: var(--radius-lg);
    background-color: var(--color-charcoal-50);
    margin-bottom: calc(var(--spacing) * 2); /* 8px */
  }
  
  .product-card__title {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-normal);
    color: var(--color-charcoal-900);
    line-height: 1.3;
  }
</style>
```

**Key Principle:** Use `var(--token-name)` for all styling values. This ensures:
- Single source of truth
- Easy theming (light/dark mode)
- Type-safe design system
- Zero hardcoded values

---

### 5. **NO PostCSS Configuration Required**
```javascript
// postcss.config.cjs or postcss.config.mjs
// ✅ CORRECT: Leave this empty or delete it entirely
export default {
  plugins: {},
}
```

**Why?** Tailwind CSS v4's Vite plugin handles everything internally. PostCSS is automatically configured.

**Source:** [Tailwind CSS v4 Vite Integration](https://tailwindcss.com/docs/installation/framework-guides/sveltekit)

---

## 🎨 Proper Token Organization

### File Structure
```
packages/ui/src/styles/
├── tokens-v4/
│   ├── foundations.css      ← Core tokens (@theme)
│   ├── components.css        ← Component-specific tokens (@theme)
│   ├── semantic.css          ← Semantic tokens (e.g., --color-error)
│   └── dark-theme.css        ← Dark mode overrides (@theme)
└── base.css                  ← Global styles (body, html)
```

---

### ✅ CORRECT: Add Product Card Tokens to `components.css`
```css
/* packages/ui/src/styles/tokens-v4/components.css */
@theme {
  /* ━━━ PRODUCT CARD SPACING ━━━ */
  --product-card-image-gap: calc(var(--spacing) * 2);      /* 8px */
  --product-card-content-gap: 0;                            /* 0px - ultra tight */
  --product-card-title-gap: calc(var(--spacing) * 0.5);    /* 2px */
  --product-card-details-gap: calc(var(--spacing) * 1);    /* 4px */
  
  /* ━━━ PRODUCT CARD TYPOGRAPHY ━━━ */
  --product-card-title-size: var(--text-sm);                /* 14px */
  --product-card-title-weight: var(--font-weight-normal);   /* 400 */
  --product-card-title-color: var(--color-charcoal-900);
  --product-card-title-leading: 1.3;
  
  --product-card-price-size: var(--text-base);              /* 16px */
  --product-card-price-weight: var(--font-weight-bold);     /* 700 */
  --product-card-price-color: var(--color-charcoal-900);
  
  /* ━━━ PRODUCT CARD VISUAL ━━━ */
  --product-card-radius: var(--radius-lg);                  /* 8px */
  --product-card-image-bg: var(--color-charcoal-50);
  --product-card-hover-shadow: var(--shadow-sm);
}
```

**Why components.css?**
- Follows Tailwind's architecture pattern
- Keeps component tokens separate from foundations
- Maintains existing token structure
- Easy to find and maintain

---

### ❌ WRONG: Creating Separate `product-card-theme.css`
```css
/* ❌ DON'T DO THIS */
/* packages/ui/src/styles/product-card-theme.css */
@theme {
  --product-card-image-gap: 8px;
  /* ... */
}
```

**Why wrong?**
- Not part of official Tailwind v4 best practices
- Creates architectural inconsistency
- Fragments design system
- Requires manual export in package.json

---

## 🔧 Svelte 5 Component Architecture

### Modern Svelte 5 Pattern
```svelte
<script lang="ts">
  import type { Product } from '@repo/database/types';
  
  // ✅ CORRECT: Use $props rune (Svelte 5)
  interface Props {
    product: Product;
    priority?: boolean;
    className?: string;
    onclick?: () => void;
  }
  
  let {
    product,
    priority = false,
    className = '',
    onclick
  }: Props = $props();
  
  // ✅ CORRECT: $derived for computed values
  const formattedPrice = $derived(
    `$${product.price.toFixed(2)}`
  );
</script>

<button 
  type="button"
  class="product-card {className}"
  onclick={onclick}
>
  <div class="product-card__image">
    <img 
      src={product.images[0]} 
      alt={product.title}
      loading={priority ? 'eager' : 'lazy'}
    />
  </div>
  
  <div class="product-card__content">
    <h3 class="product-card__title">{product.title}</h3>
    <p class="product-card__price">{formattedPrice}</p>
  </div>
</button>

<style>
  /* Scoped component styles using theme variables */
  .product-card {
    display: block;
    width: 100%;
    cursor: pointer;
    background-color: transparent;
    transition: box-shadow 200ms ease;
  }
  
  .product-card:hover {
    box-shadow: var(--product-card-hover-shadow);
  }
  
  .product-card__image {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: var(--product-card-radius);
    background-color: var(--product-card-image-bg);
    margin-bottom: var(--product-card-image-gap);
  }
  
  .product-card__content {
    display: flex;
    flex-direction: column;
    gap: var(--product-card-content-gap);
  }
  
  .product-card__title {
    font-size: var(--product-card-title-size);
    font-weight: var(--product-card-title-weight);
    color: var(--product-card-title-color);
    line-height: var(--product-card-title-leading);
    margin-bottom: var(--product-card-title-gap);
    
    /* Clamp to 2 lines */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .product-card__price {
    font-size: var(--product-card-price-size);
    font-weight: var(--product-card-price-weight);
    color: var(--product-card-price-color);
  }
</style>
```

---

## 📋 Implementation Checklist

### Phase 1: Fix Architecture
- [ ] **Remove** `packages/ui/src/styles/product-card-theme.css`
- [ ] **Move** product card tokens to `packages/ui/src/styles/tokens-v4/components.css`
- [ ] **Remove** export for `product-card-theme.css` from `packages/ui/package.json`
- [ ] **Remove** import from `apps/web/src/app.css`
- [ ] **Verify** `foundations.css` has all base tokens (spacing, colors, typography)

### Phase 2: Update Components
- [ ] **Update** `ProductCard.svelte` to use semantic CSS classes
- [ ] **Remove** all inline Tailwind utility classes from `<style>` blocks
- [ ] **Use** `var(--product-card-*)` tokens exclusively
- [ ] **Test** image takes full width with `aspect-ratio: 3/4`
- [ ] **Test** spacing is ultra-tight (0-8px gaps)

### Phase 3: Update Badge Components
- [ ] **Add** condition badge tokens to `components.css`:
  ```css
  @theme {
    --condition-new-bg: var(--color-emerald-50);
    --condition-new-border: var(--color-emerald-200);
    --condition-new-text: var(--color-emerald-700);
    /* etc... */
  }
  ```
- [ ] **Update** `ConditionBadge.svelte` with scoped CSS
- [ ] **Remove** hardcoded color utilities

### Phase 4: Verify & Test
- [ ] Run `pnpm dev` - no errors
- [ ] Visual inspection: cards look like Vinted (tight, professional)
- [ ] Check DevTools: CSS variables resolve correctly
- [ ] Test dark mode (if applicable)
- [ ] Run type checking: `pnpm check`

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Create component-specific theme files
```css
/* ❌ WRONG */
/* product-card-theme.css */
@theme { ... }
```

### ✅ DO: Add component tokens to existing components.css
```css
/* ✅ CORRECT */
/* tokens-v4/components.css */
@theme {
  --product-card-*: ...;
  --button-*: ...;
  --modal-*: ...;
}
```

---

### ❌ DON'T: Use inline Tailwind utilities in CSS
```svelte
<style>
  .card {
    @apply rounded-lg bg-gray-50; /* ❌ WRONG */
  }
</style>
```

### ✅ DO: Use CSS variables from @theme
```svelte
<style>
  .card {
    border-radius: var(--radius-lg); /* ✅ CORRECT */
    background-color: var(--color-gray-50);
  }
</style>
```

---

### ❌ DON'T: Hardcode spacing values
```svelte
<style>
  .card__content {
    gap: 8px; /* ❌ WRONG - hardcoded */
  }
</style>
```

### ✅ DO: Use calc() with spacing tokens
```svelte
<style>
  .card__content {
    gap: calc(var(--spacing) * 2); /* ✅ CORRECT - 8px from token */
  }
</style>
```

---

## 📖 Official Documentation References

1. **Tailwind CSS v4 @theme Directive**  
   https://tailwindcss.com/docs/functions-and-directives

2. **Tailwind CSS v4 with Vite**  
   https://tailwindcss.com/docs/installation/framework-guides/sveltekit

3. **Tailwind CSS v4 Migration Guide**  
   https://tailwindcss.com/docs/upgrade-guide

4. **Tailwind CSS v4 Theme Variables**  
   https://tailwindcss.com/docs/theme

5. **Svelte 5 Scoped Styles**  
   (Use Svelte MCP: `mcp_svelte_get-documentation` with section "scoped-styles")

6. **Svelte 5 Runes ($props, $derived, $state)**  
   (Use Svelte MCP: `mcp_svelte_get-documentation` with sections "$props", "$derived", "$state")

---

## 🎯 Expected Outcome

### Before (Current Issues)
- ❌ Separate `product-card-theme.css` file
- ❌ Mixed inline utilities and CSS variables
- ❌ Hardcoded spacing values
- ❌ PostCSS confusion
- ❌ Inconsistent architecture

### After (Proper Architecture)
- ✅ All tokens in `tokens-v4/components.css`
- ✅ Pure CSS variables in component `<style>` blocks
- ✅ Zero hardcoded values
- ✅ Clean Vite + Tailwind v4 setup
- ✅ Follows official best practices
- ✅ Vinted-style tight, professional cards

---

## 💡 Key Principles Summary

1. **One Source of Truth:** All design tokens in `@theme` directive
2. **CSS Variables Everywhere:** Use `var(--token)` in component CSS
3. **No Inline Utilities:** Scoped `<style>` blocks with semantic classes
4. **Proper File Organization:** Follow existing `tokens-v4/` structure
5. **Vite Handles Everything:** No manual PostCSS configuration
6. **Svelte 5 Runes:** Use `$props`, `$derived`, `$state` for reactivity

---

**This plan is based on:**
- Context7 Tailwind CSS v4 documentation (9.5 trust score, 1604 snippets)
- Official Svelte 5 MCP server documentation
- Best practices from both frameworks' official docs

**Next Steps:** Review this plan, then implement Phase 1 to fix the architecture.
