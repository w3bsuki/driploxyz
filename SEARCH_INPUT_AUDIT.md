# SearchInput Component - Tailwind v4 Audit Report

**Date:** October 17, 2025  
**Component:** `packages/ui/src/lib/compositions/forms/SearchInput.svelte`  
**Status:** ❌ **CRITICAL VIOLATIONS - Extensive Hardcoding**

---

## 🔍 Executive Summary

The SearchInput component has **EXTENSIVE HARDCODING** throughout. It's the worst offender we've seen, mixing:
- Hardcoded pixel values (`17px`, `16px`, `3.5`, `4`)
- Hardcoded spacing (`gap-1.5`, `px-2`, `h-9`, `h-11`)
- `bg-[color:var(--*)]` anti-patterns
- Inline style attributes
- Magic numbers everywhere

This component is a **TIER-1 PRIORITY** for refactoring.

---

## ❌ Critical Violations (Top 10)

### 1. **Hardcoded Font Size - Emoji Icon**
```svelte
<!-- ❌ Line 202 -->
<span class="text-[17px] leading-none align-middle">🛍️</span>
```

**Issue:** Magic number `17px` has no meaning or token.

**Fix:**
```svelte
<span class="filter-emoji">🛍️</span>

<style>
  .filter-emoji {
    font-size: var(--text-lg); /* 17-18px responsive */
    line-height: 1;
    vertical-align: middle;
  }
</style>
```

---

### 2. **Hardcoded Button Spacing**
```svelte
<!-- ❌ Line 196 -->
<button class="flex items-center gap-1.5 px-2 h-9 rounded-md ...">
```

**Issue:** Hardcoded `gap-1.5` (6px), `px-2` (8px), `h-9` (36px).

**Available Tokens:**
- `--space-2` = 8px
- `--space-1` = 4px (can use calc for 6px)
- `--btn-height-md` = 36px
- `--btn-radius` = 4px

**Fix:**
```svelte
<button class="filter-toggle-btn">

<style>
  .filter-toggle-btn {
    display: flex;
    align-items: center;
    gap: calc(var(--space-1) * 1.5); /* 6px */
    padding-left: var(--space-2);
    padding-right: var(--space-2);
    height: var(--btn-height-md);
    border-radius: var(--btn-radius);
    /* ... rest of styles */
  }
</style>
```

---

### 3. **Hardcoded Icon Size**
```svelte
<!-- ❌ Line 210 -->
<svg class="w-3.5 h-3.5 transition-transform ...">
```

**Issue:** `w-3.5 h-3.5` = 14px, not in our token system.

**Available Tokens:**
- `--icon-xs` = 16px (closest)
- `--space-3` = 12px (could use)
- `--space-4` = 16px

**Fix:**
```svelte
<svg class="filter-chevron">

<style>
  .filter-chevron {
    width: var(--icon-xs);
    height: var(--icon-xs);
    transition: transform var(--duration-fast) var(--ease-out);
  }
  
  .filter-chevron.open {
    transform: rotate(180deg);
  }
</style>
```

---

### 4. **Hardcoded Input Height**
```svelte
<!-- ❌ Line 253 -->
<input class="w-full h-11 pl-3 ...">
```

**Issue:** Hardcoded `h-11` (44px), `pl-3` (12px).

**Available Tokens:**
- `--input-height` = 44px
- `--input-padding` = 12px
- `--touch-primary` = 44px

**Fix:**
```svelte
<input class="search-input">

<style>
  .search-input {
    width: 100%;
    height: var(--input-height);
    padding-left: var(--input-padding);
    /* ... */
  }
</style>
```

---

### 5. **Anti-Pattern: bg-[color:var()]**
```svelte
<!-- ❌ Multiple instances -->
<div class="bg-[color:var(--surface-emphasis)]">
<button class="hover:bg-[color:var(--surface-subtle)]">
<div class="bg-[color:var(--surface-brand-subtle)]/40">
```

**Issue:** This is the **exact anti-pattern** from the migration plan. Defeats Tailwind v4 purpose.

**Fix:** Use scoped CSS:
```svelte
<div class="filter-menu">

<style>
  .filter-menu {
    background-color: var(--color-surface-emphasis);
  }
  
  .filter-option:hover {
    background-color: var(--color-surface-subtle);
  }
</style>
```

---

### 6. **Hardcoded Dropdown Positioning**
```svelte
<!-- ❌ Line 218 -->
<div class="absolute left-0 top-[calc(100%+6px)] ...">
```

**Issue:** Magic number `6px` gap.

**Fix:**
```svelte
<div class="filter-dropdown">

<style>
  .filter-dropdown {
    position: absolute;
    left: 0;
    top: calc(100% + var(--space-1)); /* 4px gap */
    /* Or use --space-2 for 8px */
  }
</style>
```

---

### 7. **Hardcoded Filter Option Styling**
```svelte
<!-- ❌ Line 82-84 -->
const filterOptionBaseClass = 'w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors';
```

**Issue:** Hardcoded `gap-2`, `px-3`, `py-2.5`, `text-sm`.

**Available Tokens:**
- `--space-2` = 8px
- `--space-3` = 12px
- `--text-sm` = 13-14px
- `calc(var(--space-2) * 1.25)` for 10px

**Fix:** Use scoped CSS instead of class concatenation.

---

### 8. **Inline Style Attribute (Worst Practice)**
```svelte
<!-- ❌ Line 256 -->
style="border: none !important; outline: none !important; ..."
```

**Issue:** Inline styles defeat all CSS architecture. Also using `!important` is a red flag.

**Fix:**
```svelte
<input class="search-input">

<style>
  .search-input {
    border: none;
    outline: none;
    box-shadow: none;
  }
  
  .search-input:focus {
    outline: none;
    box-shadow: none;
  }
</style>
```

---

### 9. **Hardcoded Z-Index**
```svelte
<!-- ❌ Line 220 -->
<div class="... z-[60] ...">
<!-- ❌ Line 274 -->
<div class="... z-[55]">
```

**Issue:** Random z-index values `60` and `55` not in our system.

**Available Tokens:**
- `--z-dropdown` = 1000
- `--z-popover` = 1500

**Fix:**
```svelte
<style>
  .filter-dropdown {
    z-index: var(--z-popover);
  }
  
  .search-dropdown {
    z-index: var(--z-dropdown);
  }
</style>
```

---

### 10. **Hardcoded Border Width & Radius**
```svelte
<!-- ❌ Line 69 -->
const formBaseClass = `
  border border-[color:var(--border-subtle)]
  ...
  rounded-[var(--radius-sm)]
`;
```

**Issue:** `border` (1px) is ok, but mixing utility classes with arbitrary values.

---

## 📊 Violation Count

| Category | Count | Severity |
|----------|-------|----------|
| Hardcoded spacing | **15+** | 🔴 Critical |
| Hardcoded sizes | **10+** | 🔴 Critical |
| `bg-[color:var()]` anti-pattern | **8+** | 🔴 Critical |
| Inline styles | **2** | 🔴 Critical |
| Random z-index | **2** | 🟠 High |
| Magic numbers | **20+** | 🟠 High |
| **TOTAL** | **57+** | **CRITICAL** |

---

## ✅ Recommended Refactor Strategy

### **Phase 1: Remove Anti-Patterns**
1. Remove all `bg-[color:var()]` patterns
2. Remove inline `style` attributes
3. Convert class concatenation to scoped CSS

### **Phase 2: Apply Tokens**
1. Replace hardcoded spacing with `--space-*` tokens
2. Replace hardcoded heights with `--input-height`, `--btn-height-*`
3. Replace hardcoded font sizes with `--text-*` tokens
4. Replace z-index with `--z-*` tokens

### **Phase 3: Create Component Tokens**
Add to `components.css`:
```css
/* Search Input Specific Tokens */
--search-input-height: var(--input-height);
--search-input-padding: var(--input-padding);
--search-filter-btn-gap: calc(var(--space-1) * 1.5); /* 6px */
--search-filter-dropdown-gap: var(--space-1);
--search-emoji-size: var(--text-lg);
```

---

## 🚀 Refactored Example (Partial)

```svelte
<script lang="ts">
// ... props remain same
</script>

<div class="search-input-container">
  <form class="search-form" class:dropdown-open={dropdownVisible}>
    {#if leftSection}
      {@render leftSection()}
    {/if}

    <!-- Filter Button -->
    <div class="filter-controls" bind:this={filterButtonContainer}>
      <button
        type="button"
        onclick={toggleFilterMenu}
        onmousedown={handleFilterMouseDown}
        class="filter-toggle"
        aria-haspopup="listbox"
        aria-expanded={filterMenuOpen}
      >
        {#if searchFilter === 'products'}
          <span class="filter-emoji">🛍️</span>
          <span class="filter-label">Products</span>
        {:else if searchFilter === 'brands'}
          <span class="filter-emoji">🏷️</span>
          <span class="filter-label">Brands</span>
        {:else}
          <span class="filter-emoji">👤</span>
          <span class="filter-label">Sellers</span>
        {/if}
        <svg class="filter-chevron" class:open={filterMenuOpen}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {#if filterMenuOpen}
        <div class="filter-dropdown" role="listbox">
          {#each filterOptions as option (option.key)}
            <button
              type="button"
              onclick={() => selectFilter(option.key)}
              class="filter-option"
              class:active={searchFilter === option.key}
            >
              <span class="filter-emoji">{option.key === 'products' ? '🛍️' : option.key === 'brands' ? '🏷️' : '👤'}</span>
              <span class="filter-option-label">{option.label}</span>
              {#if searchFilter === option.key}
                <svg class="filter-check"><!-- checkmark --></svg>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="search-input-wrapper">
      <input
        bind:this={inputElement}
        bind:value={searchValue}
        class="search-input"
        type="search"
        {placeholder}
        /* ... event handlers */
      />
    </div>

    {#if rightSection}
      {@render rightSection()}
    {/if}
  </form>

  {#if dropdownVisible && searchFunction}
    <div class="search-dropdown-wrapper">
      <SearchDropdown /* ... */ />
    </div>
  {/if}
</div>

<style>
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEARCH INPUT - Token-Driven Styles
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  .search-input-container {
    position: relative;
    width: 100%;
  }
  
  .search-form {
    background-color: var(--color-surface-emphasis);
    display: flex;
    align-items: center;
    position: relative;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    transition: border-color var(--duration-fast) var(--ease-out),
                box-shadow var(--duration-fast) var(--ease-out);
  }
  
  .search-form:hover {
    border-color: var(--color-border-emphasis);
  }
  
  .search-form:focus-within {
    border-color: var(--color-border-emphasis);
  }
  
  .search-form.dropdown-open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-color: transparent;
    box-shadow: var(--shadow-lg);
  }
  
  /* Filter Controls */
  .filter-controls {
    position: relative;
    flex-shrink: 0;
    margin-left: var(--space-2);
  }
  
  .filter-toggle {
    display: flex;
    align-items: center;
    gap: calc(var(--space-1) * 1.5); /* 6px */
    padding-left: var(--space-2);
    padding-right: var(--space-2);
    height: var(--btn-height-md);
    border-radius: var(--btn-radius);
    background-color: transparent;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: background-color var(--duration-fast) var(--ease-out),
                color var(--duration-fast) var(--ease-out);
    cursor: pointer;
    outline: none;
  }
  
  .filter-toggle:hover {
    background-color: var(--color-surface-subtle);
    color: var(--color-text-primary);
  }
  
  .filter-emoji {
    font-size: var(--text-lg);
    line-height: 1;
    vertical-align: middle;
  }
  
  .filter-label {
    display: none;
    line-height: 1;
  }
  
  @media (min-width: 640px) {
    .filter-label {
      display: inline;
    }
  }
  
  .filter-chevron {
    width: var(--icon-xs);
    height: var(--icon-xs);
    transition: transform var(--duration-fast) var(--ease-out);
  }
  
  .filter-chevron.open {
    transform: rotate(180deg);
  }
  
  /* Filter Dropdown */
  .filter-dropdown {
    position: absolute;
    left: 0;
    top: calc(100% + var(--space-2));
    background-color: var(--color-surface-emphasis);
    border: 1px solid var(--color-border-emphasis);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding-top: var(--space-1);
    padding-bottom: var(--space-1);
    z-index: var(--z-popover);
    min-width: 180px;
    overflow: hidden;
  }
  
  .filter-option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: calc(var(--space-2) * 1.25) var(--space-3); /* 10px 12px */
    width: 100%;
    font-size: var(--text-sm);
    text-align: left;
    color: var(--color-text-primary);
    background-color: transparent;
    transition: background-color var(--duration-fast) var(--ease-out),
                color var(--duration-fast) var(--ease-out);
    cursor: pointer;
  }
  
  .filter-option:hover {
    background-color: var(--color-surface-subtle);
  }
  
  .filter-option.active {
    color: var(--color-brand-primary);
    font-weight: var(--font-medium);
    background-color: oklch(from var(--color-surface-brand-subtle) l c h / 0.4);
  }
  
  .filter-option-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .filter-check {
    width: var(--space-4);
    height: var(--space-4);
    margin-left: auto;
    color: var(--color-brand-primary);
  }
  
  /* Search Input */
  .search-input-wrapper {
    flex: 1;
    position: relative;
  }
  
  .search-input {
    width: 100%;
    height: var(--input-height);
    padding-left: var(--input-padding);
    padding-right: var(--input-padding);
    background-color: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    font-size: var(--text-base);
    color: var(--color-text-primary);
  }
  
  .search-input::placeholder {
    color: var(--color-text-tertiary);
  }
  
  .search-input:focus {
    outline: none;
    box-shadow: none;
  }
  
  /* Dropdown */
  .search-dropdown-wrapper {
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    right: 0;
    z-index: var(--z-dropdown);
  }
</style>
```

---

## 📋 Action Items

1. **IMMEDIATE:** Remove inline `style` attributes
2. **HIGH:** Convert all `bg-[color:var()]` to scoped CSS
3. **HIGH:** Replace hardcoded spacing with tokens
4. **MEDIUM:** Replace hardcoded sizes with tokens
5. **MEDIUM:** Consolidate filter button styles
6. **LOW:** Add component-specific tokens to `components.css`

---

**Verdict:** ❌ **TIER-1 REFACTOR REQUIRED**

This component requires a **complete rewrite** using the scoped CSS pattern. The current implementation violates nearly every principle of our Tailwind v4 architecture.

**Estimated Effort:** 2-3 hours for complete refactor  
**Priority:** 🔴 **CRITICAL** - This is a core component used across the app
