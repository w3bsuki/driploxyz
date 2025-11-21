# Main Page Search Bar - Tailwind v4 Audit Report

**Date:** October 17, 2025  
**Component:** `packages/ui/src/lib/compositions/navigation/MainPageSearchBar.svelte`  
**Status:** ❌ **FAILED - Multiple Violations**

---

## 🔍 Executive Summary

The MainPageSearchBar component contains **MULTIPLE VIOLATIONS** of our Tailwind v4 token system. It mixes hardcoded Tailwind v3 utilities with arbitrary CSS variable patterns, creating an inconsistent and unmaintainable codebase.

---

## ❌ Critical Issues Found

### 1. **Hardcoded Spacing Values** (CRITICAL)
```svelte
<!-- ❌ WRONG: Hardcoded Tailwind classes -->
<div class="px-3 sm:px-4 lg:px-6 py-1.5">
```

**Issue:** Uses hardcoded `px-3`, `px-4`, `px-6`, `py-1.5` instead of token variables.

**Available Tokens:**
- `--space-3` (12px) = 3 × 4px
- `--space-4` (16px) = 4 × 4px  
- `--space-6` (24px) = 6 × 4px
- Navigation tokens: `--header-padding-x-sm`, `--header-padding-x-md`, `--header-padding-x-lg`

**Fix Required:**
```svelte
<!-- ✅ CORRECT: Use tokens via scoped CSS -->
<div class="search-bar-container">

<style>
  .search-bar-container {
    padding-left: var(--header-padding-x-sm);
    padding-right: var(--header-padding-x-sm);
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
  }
  
  @media (min-width: 640px) {
    .search-bar-container {
      padding-left: var(--header-padding-x-md);
      padding-right: var(--header-padding-x-md);
    }
  }
  
  @media (min-width: 1024px) {
    .search-bar-container {
      padding-left: var(--header-padding-x-lg);
      padding-right: var(--header-padding-x-lg);
    }
  }
</style>
```

---

### 2. **Hardcoded Gap Values** (CRITICAL)
```svelte
<!-- ❌ WRONG -->
<nav class="flex items-center justify-start gap-2 overflow-x-auto scrollbarhide pt-2 pb-1 sm:justify-center">
```

**Issue:** Uses hardcoded `gap-2`, `pt-2`, `pb-1`.

**Available Tokens:**
- `--space-2` (8px)
- `--space-1` (4px)
- `--header-gap` (8px) - specifically for header spacing

**Fix Required:**
```svelte
<nav class="category-pills">

<style>
  .category-pills {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--header-gap); /* 8px */
    overflow-x: auto;
    padding-top: var(--space-2);
    padding-bottom: var(--space-1);
  }
  
  @media (min-width: 640px) {
    .category-pills {
      justify-content: center;
    }
  }
</style>
```

---

### 3. **Hardcoded Z-Index** (MEDIUM)
```svelte
<!-- ❌ WRONG: Uses arbitrary value syntax -->
<div class="bg-surface-base sticky top-[var(--app-header-offset)] z-[var(--z-sticky)] border-b border-border-subtle">
```

**Issue:** `z-[var(--z-sticky)]` is the **anti-pattern** mentioned in the migration plan. Tailwind v4 doesn't support arbitrary values with CSS variables in this way.

**Available Tokens:**
- `--z-sticky: 1100`

**Fix Required:**
```svelte
<div class="search-bar-wrapper">

<style>
  .search-bar-wrapper {
    background-color: var(--color-surface-base);
    position: sticky;
    top: var(--app-header-offset);
    z-index: var(--z-sticky);
    border-bottom: 1px solid var(--color-border-subtle);
  }
</style>
```

---

### 4. **Inline Utility Classes Mixed with Tokens** (CRITICAL)
```svelte
<!-- ❌ WRONG: Mixing patterns -->
<div class="bg-surface-base sticky ... border-b border-border-subtle">
```

**Issue:** Tries to use `bg-surface-base` and `border-border-subtle` as Tailwind utilities, but these are **CSS custom properties**, not Tailwind classes. This only works if we've defined custom utilities.

**Current Behavior:**
- `bg-surface-base` → ❌ Not defined as utility (unless we add it)
- Should use `var(--color-surface-base)` in scoped CSS

**Fix Required:**
Either:
1. Define utilities in `components.css` (recommended for frequently used values)
2. Use scoped CSS with CSS variables (recommended for unique layouts)

---

### 5. **Missing Component-Level Tokens** (MEDIUM)
The component doesn't use component-specific tokens like:
- `--nav-height-mobile` (56px)
- `--header-padding-x-*` tokens
- `--header-gap` (8px)
- `--pill-*` tokens for CategoryPill styling

---

## 📋 Complete Fix Implementation

### **MainPageSearchBar.svelte - Fixed Version**

```svelte
<script lang="ts">
import type { Database } from '@repo/database';
import { slide } from 'svelte/transition';
import SearchInput from '../../compositions/forms/SearchInput.svelte';
import CategoryPill from '../../primitives/pill/CategoryPill.svelte';

// ... [types and props remain the same]
</script>

<!-- Sticky Search + Category Navigation -->
<div class="main-search-wrapper">
  <div class="main-search-container">
    <div class="main-search-content">
      <!-- Hero Search -->
      <div id="hero-search-container" class="hero-search">
        <SearchInput
          bind:searchValue={searchQuery}
          onSearch={onSearch}
          placeholder={i18n.search_placeholder ? i18n.search_placeholder() : 'Търсете артикули, марки...'}
          searchId="hero-search-input"
          searchFunction={onQuickSearch}
          showDropdown={isSearching}
          maxResults={8}
        />
      </div>

      <!-- Category Pills -->
      <nav
        id="category-pills"
        aria-label={i18n.nav_browseCategories()}
        class="category-pills"
      >
        <!-- All Categories -->
        <CategoryPill
          variant="muted"
          label={i18n.search_all()}
          loading={loadingCategory === 'all'}
          disabled={loadingCategory === 'all'}
          ariaLabel={i18n.search_viewAll()}
          ariaCurrent={currentPath === '/search' ? 'page' : undefined}
          data-prefetch="hover"
          onmouseenter={() => onPrefetchSearch?.()}
          ontouchstart={() => onPrefetchSearch?.()}
          onclick={onNavigateToAll}
          onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 0)}
        />

        <!-- Main Categories -->
        {#each mainCategories as category, index (category.slug || category.id)}
          <CategoryPill
            label={category.name}
            loading={loadingCategory === category.slug}
            disabled={loadingCategory === category.slug}
            ariaLabel={`Browse ${category.name}`}
            itemCount={category.product_count || 0}
            showItemCount={(category.product_count || 0) > 0}
            data-prefetch="hover"
            data-category={category.slug}
            onmouseenter={() => prefetchCategoryPage(category.slug)}
            ontouchstart={() => prefetchCategoryPage(category.slug)}
            onclick={() => onCategorySelect(category.slug)}
            onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, index + 1)}
          />
        {/each}

        <!-- Virtual Categories -->
        {#each virtualCategories as virtualCategory, index (virtualCategory.slug || virtualCategory.id)}
          <CategoryPill
            variant="outline"
            label={virtualCategory.name}
            loading={loadingCategory === virtualCategory.slug}
            disabled={loadingCategory === virtualCategory.slug}
            ariaLabel={`Browse ${virtualCategory.name}`}
            itemCount={virtualCategory.product_count || 0}
            showItemCount={true}
            data-prefetch="hover"
            data-category={virtualCategory.slug}
            onmouseenter={() => prefetchCategoryPage(virtualCategory.slug)}
            ontouchstart={() => prefetchCategoryPage(virtualCategory.slug)}
            onclick={() => onCategorySelect(virtualCategory.slug)}
            onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, mainCategories.length + 1 + index)}
          />
        {/each}

        <!-- Condition Pills -->
        {#each conditionFilters as condition, index (condition.key)}
          <CategoryPill
            variant={selectedCondition === condition.key ? 'primary' : 'secondary'}
            label={condition.shortLabel}
            emoji={index === 0 ? '🏷️' : index === 1 ? '💎' : '👍'}
            ariaLabel={`Filter by ${condition.label}`}
            onclick={() => handleQuickCondition(condition.key)}
          />
        {/each}
      </nav>
    </div>
  </div>
</div>

<style>
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MAIN SEARCH BAR - Token-Driven Styles
     All values use Tailwind v4 design tokens
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .main-search-wrapper {
    background-color: var(--color-surface-base);
    position: sticky;
    top: var(--app-header-offset);
    z-index: var(--z-sticky);
    border-bottom: 1px solid var(--color-border-subtle);
  }
  
  .main-search-container {
    padding-left: var(--header-padding-x-sm);
    padding-right: var(--header-padding-x-sm);
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
  }
  
  .main-search-content {
    margin-left: auto;
    margin-right: auto;
    position: relative;
  }
  
  .hero-search {
    position: relative;
  }
  
  .category-pills {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--header-gap);
    overflow-x: auto;
    padding-top: var(--space-2);
    padding-bottom: var(--space-1);
  }
  
  /* Hide scrollbar while maintaining functionality */
  .category-pills {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  
  .category-pills::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     RESPONSIVE ADJUSTMENTS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  @media (min-width: 640px) {
    .main-search-container {
      padding-left: var(--header-padding-x-md);
      padding-right: var(--header-padding-x-md);
    }
    
    .category-pills {
      justify-content: center;
    }
  }
  
  @media (min-width: 1024px) {
    .main-search-container {
      padding-left: var(--header-padding-x-lg);
      padding-right: var(--header-padding-x-lg);
    }
  }
</style>
```

---

## 📊 Token Usage Summary

### **Spacing Tokens Used:**
- `--header-padding-x-sm` (12px) - Small screens
- `--header-padding-x-md` (16px) - Medium screens  
- `--header-padding-x-lg` (24px) - Large screens
- `--space-2` (8px) - Vertical padding
- `--space-1` (4px) - Bottom padding
- `--header-gap` (8px) - Pills gap

### **Color Tokens Used:**
- `--color-surface-base` - Background
- `--color-border-subtle` - Border

### **Layout Tokens Used:**
- `--z-sticky` (1100) - Z-index
- `--app-header-offset` - Top offset

---

## ✅ Compliance Checklist

- [x] **Zero hardcoded spacing** - All use tokens
- [x] **Zero hardcoded colors** - All use semantic tokens
- [x] **Zero inline utilities** - All use scoped CSS
- [x] **Proper responsive design** - Media queries with tokens
- [x] **Component-specific tokens** - Uses navigation tokens
- [x] **Accessible scrollbar hiding** - Cross-browser support
- [x] **No arbitrary value anti-patterns** - Pure CSS variables

---

## 🎯 Benefits of This Approach

1. **Maintainability** - Change tokens once, update everywhere
2. **Consistency** - All spacing follows 4px rhythm
3. **Theme Support** - Easy dark mode and brand customization
4. **Performance** - No runtime class concatenation
5. **Type Safety** - CSS custom properties are statically analyzable
6. **Debugging** - Inspector shows actual token values

---

## 🚀 Next Steps

1. Apply this fix to `MainPageSearchBar.svelte`
2. Audit `SearchInput.svelte` (found multiple violations there too)
3. Audit `SearchPageSearchBar.svelte` 
4. Create component-specific tokens if needed
5. Document the pattern for team

---

**Verdict:** ❌ **IMMEDIATE REFACTOR REQUIRED**

This component is a prime example of the anti-patterns we're eliminating. The fix is straightforward and will significantly improve maintainability.
