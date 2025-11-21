# Driplo Tailwind CSS v4 Full Project Migration Plan
## Complete Design System Overhaul Based on Context7 & Svelte MCP Best Practices

**Date:** October 16, 2025  
**Scope:** Entire `@repo/ui` package + `apps/web`  
**Goal:** Eliminate ALL hardcoded values, implement proper Tailwind v4 architecture  
**Current State:** ❌ Mixed inline utilities, hardcoded values, inconsistent token usage  
**Target State:** ✅ 100% token-based, zero hardcoding, production-ready design system

---

## 📊 Current Project Audit

### ✅ **What's Already Correct**
```
packages/ui/src/styles/tokens-v4/
├── foundations.css  ← ✅ Core tokens with @theme (OKLCH colors, spacing, typography)
├── semantic.css     ← ✅ Semantic color mappings
├── components.css   ← ✅ Component-specific tokens
└── dark-theme.css   ← ✅ Dark mode overrides
```

**Good Foundation:**
- OKLCH color system (perceptually uniform)
- Fluid typography with `clamp()`
- 4px spacing rhythm
- Proper z-index layers
- Animation durations & easing

---

### ❌ **What's Wrong (Major Issues)**

#### **Issue #1: Inline Hardcoded Utilities**
Found **100+ instances** of hardcoded Tailwind classes:

```svelte
<!-- ❌ WRONG: Hardcoded spacing, colors -->
<div class="px-3 sm:px-4 lg:px-6 py-1.5">
<span class="text-[17px] leading-none">
<div class="w-3.5 h-4 transition-transform">
<button class="flex items-center gap-1.5 px-2 h-9 rounded-md">
```

**Files Affected:**
- `BottomNav.svelte` - 20+ hardcoded classes
- `SearchInput.svelte` - 30+ hardcoded classes
- `CategoryPill.svelte` - 15+ hardcoded classes
- `ProductCard.svelte` - Mixed approach
- `Tooltip.svelte`, `ThemeToggle.svelte`, `Tabs.svelte`, etc.

---

#### **Issue #2: `bg-[color:var(--token)]` Anti-Pattern**
```svelte
<!-- ❌ WRONG: Mixing arbitrary values with CSS variables -->
<div class="bg-[color:var(--surface-base)]">
<span class="text-[color:var(--text-primary)]">
<button class="hover:bg-[color:var(--surface-subtle)]">
```

**Why Wrong:** This defeats the purpose of Tailwind v4's theme system. Should use scoped CSS instead.

---

#### **Issue #3: No Component Tokens**
```svelte
<!-- ❌ WRONG: Magic numbers -->
<div class="px-4 py-2 rounded-lg">  <!-- Why 4? Why 2? -->
<span class="text-sm font-medium">  <!-- Why sm? Why medium? -->
```

**Missing Component Tokens:**
- Navigation spacing
- Button sizes/states
- Input field dimensions
- Badge styling
- Card layouts
- Modal dimensions
- Dropdown menus
- Tab system

---

#### **Issue #4: Inconsistent Patterns**
```svelte
<!-- ❌ Pattern 1: Inline utilities -->
<div class="flex items-center gap-2 px-4 py-2">

<!-- ❌ Pattern 2: Arbitrary CSS variables -->
<div class="bg-[color:var(--surface-base)]">

<!-- ✅ Pattern 3: Scoped CSS (CORRECT, but rare) -->
<style>
  .component { background-color: var(--surface-base); }
</style>
```

**Result:** No consistency, hard to maintain, impossible to theme.

---

## 🎯 Tailwind CSS v4 Best Practices (Official Docs)

### **Core Principle: Single Source of Truth**

```css
/* ✅ CORRECT: Define ALL design decisions in @theme */
@theme {
  /* Component-specific tokens */
  --button-height-sm: calc(var(--spacing) * 8);     /* 32px */
  --button-height-md: calc(var(--spacing) * 10);    /* 40px */
  --button-height-lg: calc(var(--spacing) * 12);    /* 48px */
  
  --button-padding-x-sm: calc(var(--spacing) * 3);  /* 12px */
  --button-padding-x-md: calc(var(--spacing) * 4);  /* 16px */
  --button-padding-x-lg: calc(var(--spacing) * 6);  /* 24px */
  
  --button-radius: var(--radius-md);
  --button-font-size: var(--text-sm);
  --button-font-weight: var(--font-semibold);
}
```

### **Component Pattern:**
```svelte
<!-- ✅ CORRECT: Semantic classes + scoped CSS -->
<button class="btn btn--primary btn--md">
  Click me
</button>

<style>
  .btn {
    /* Base button styles */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--button-radius);
    font-size: var(--button-font-size);
    font-weight: var(--button-font-weight);
    transition: all var(--duration-fast) var(--ease-out);
  }
  
  .btn--md {
    height: var(--button-height-md);
    padding-inline: var(--button-padding-x-md);
  }
  
  .btn--primary {
    background-color: var(--color-burgundy-600);
    color: var(--color-white);
  }
  
  .btn--primary:hover {
    background-color: var(--color-burgundy-700);
  }
</style>
```

---

## 📋 Complete Migration Plan

### **Phase 1: Expand Token System** (Week 1)

#### 1.1 Add Missing Component Tokens to `components.css`

```css
/* packages/ui/src/styles/tokens-v4/components.css */
@theme {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BUTTON SYSTEM
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  /* Button Heights */
  --button-height-xs: calc(var(--spacing) * 6);   /* 24px */
  --button-height-sm: calc(var(--spacing) * 8);   /* 32px */
  --button-height-md: calc(var(--spacing) * 10);  /* 40px */
  --button-height-lg: calc(var(--spacing) * 12);  /* 48px */
  --button-height-xl: calc(var(--spacing) * 14);  /* 56px */
  
  /* Button Padding */
  --button-padding-x-xs: calc(var(--spacing) * 2);  /* 8px */
  --button-padding-x-sm: calc(var(--spacing) * 3);  /* 12px */
  --button-padding-x-md: calc(var(--spacing) * 4);  /* 16px */
  --button-padding-x-lg: calc(var(--spacing) * 6);  /* 24px */
  --button-padding-x-xl: calc(var(--spacing) * 8);  /* 32px */
  
  /* Button Visual */
  --button-radius: var(--radius-md);
  --button-font-size: var(--text-sm);
  --button-font-weight: var(--font-semibold);
  --button-transition: all var(--duration-fast) var(--ease-out);
  
  /* Button States */
  --button-primary-bg: var(--color-burgundy-600);
  --button-primary-hover: var(--color-burgundy-700);
  --button-primary-active: var(--color-burgundy-800);
  --button-primary-text: var(--color-white);
  
  --button-secondary-bg: var(--color-charcoal-100);
  --button-secondary-hover: var(--color-charcoal-200);
  --button-secondary-text: var(--color-charcoal-900);
  
  --button-ghost-hover: var(--color-charcoal-100);
  --button-ghost-text: var(--color-charcoal-700);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     INPUT SYSTEM
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --input-height-sm: calc(var(--spacing) * 8);   /* 32px */
  --input-height-md: calc(var(--spacing) * 10);  /* 40px */
  --input-height-lg: calc(var(--spacing) * 11);  /* 44px */
  
  --input-padding-x-sm: calc(var(--spacing) * 2);  /* 8px */
  --input-padding-x-md: calc(var(--spacing) * 3);  /* 12px */
  --input-padding-x-lg: calc(var(--spacing) * 4);  /* 16px */
  
  --input-radius: var(--radius-md);
  --input-font-size: var(--text-base);
  --input-border-width: 1px;
  
  --input-bg: var(--color-white);
  --input-border: var(--color-charcoal-300);
  --input-border-focus: var(--color-burgundy-500);
  --input-text: var(--color-charcoal-900);
  --input-placeholder: var(--color-charcoal-400);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BADGE/PILL SYSTEM
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --badge-height-sm: calc(var(--spacing) * 5);   /* 20px */
  --badge-height-md: calc(var(--spacing) * 6);   /* 24px */
  --badge-height-lg: calc(var(--spacing) * 7);   /* 28px */
  
  --badge-padding-x-sm: calc(var(--spacing) * 2);  /* 8px */
  --badge-padding-x-md: calc(var(--spacing) * 3);  /* 12px */
  --badge-padding-x-lg: calc(var(--spacing) * 4);  /* 16px */
  
  --badge-radius: var(--radius-full);
  --badge-font-size: var(--text-xs);
  --badge-font-weight: var(--font-medium);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     NAVIGATION SYSTEM
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --nav-height: calc(var(--spacing) * 14);        /* 56px */
  --nav-padding-x: calc(var(--spacing) * 4);      /* 16px */
  --nav-padding-x-lg: calc(var(--spacing) * 6);   /* 24px */
  
  --nav-item-gap: calc(var(--spacing) * 2);       /* 8px */
  --nav-item-padding: calc(var(--spacing) * 2);   /* 8px */
  --nav-item-radius: var(--radius-md);
  
  --nav-bg: var(--color-white);
  --nav-border: var(--color-charcoal-200);
  --nav-text: var(--color-charcoal-700);
  --nav-text-active: var(--color-burgundy-600);
  --nav-item-hover: var(--color-charcoal-100);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     MODAL/DIALOG SYSTEM
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --modal-width-sm: 24rem;    /* 384px */
  --modal-width-md: 32rem;    /* 512px */
  --modal-width-lg: 48rem;    /* 768px */
  --modal-width-xl: 64rem;    /* 1024px */
  
  --modal-padding: calc(var(--spacing) * 6);      /* 24px */
  --modal-radius: var(--radius-2xl);
  --modal-bg: var(--color-white);
  --modal-overlay: oklch(0 0 0 / 0.5);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     DROPDOWN/MENU SYSTEM
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --dropdown-min-width: 12rem;   /* 192px */
  --dropdown-max-width: 20rem;   /* 320px */
  --dropdown-padding-y: calc(var(--spacing) * 1);  /* 4px */
  --dropdown-item-height: calc(var(--spacing) * 9); /* 36px */
  --dropdown-item-padding-x: calc(var(--spacing) * 3); /* 12px */
  
  --dropdown-radius: var(--radius-lg);
  --dropdown-bg: var(--color-white);
  --dropdown-border: var(--color-charcoal-200);
  --dropdown-shadow: var(--shadow-lg);
  
  --dropdown-item-hover: var(--color-charcoal-100);
  --dropdown-item-active: var(--color-burgundy-50);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     PRODUCT CARD SYSTEM (Your existing work)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --product-card-image-gap: calc(var(--spacing) * 2);
  --product-card-content-gap: 0;
  --product-card-title-gap: calc(var(--spacing) * 0.5);
  --product-card-details-gap: calc(var(--spacing) * 1);
  
  --product-card-title-size: var(--text-sm);
  --product-card-title-weight: var(--font-normal);
  --product-card-title-color: var(--color-charcoal-900);
  --product-card-title-leading: 1.3;
  
  --product-card-price-size: var(--text-base);
  --product-card-price-weight: var(--font-bold);
  --product-card-price-color: var(--color-charcoal-900);
  
  --product-card-radius: var(--radius-lg);
  --product-card-image-bg: var(--color-charcoal-50);
  --product-card-hover-shadow: var(--shadow-sm);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CONDITION BADGE COLORS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --condition-new-bg: var(--color-emerald-50);
  --condition-new-border: var(--color-emerald-200);
  --condition-new-text: var(--color-emerald-700);
  
  --condition-likenew-bg: var(--color-charcoal-50);
  --condition-likenew-border: var(--color-charcoal-200);
  --condition-likenew-text: var(--color-charcoal-600);
  
  --condition-good-bg: var(--color-gold-50);
  --condition-good-border: var(--color-gold-200);
  --condition-good-text: var(--color-gold-800);
  
  --condition-worn-bg: var(--color-charcoal-100);
  --condition-worn-border: var(--color-charcoal-300);
  --condition-worn-text: var(--color-charcoal-700);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TOAST/NOTIFICATION SYSTEM
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --toast-width: 24rem;  /* 384px */
  --toast-padding: calc(var(--spacing) * 4);  /* 16px */
  --toast-radius: var(--radius-lg);
  --toast-shadow: var(--shadow-xl);
  
  --toast-success-bg: var(--color-emerald-500);
  --toast-error-bg: var(--color-burgundy-600);
  --toast-warning-bg: var(--color-gold-500);
  --toast-info-bg: var(--color-indigo-500);
}
```

**✅ Checklist:**
- [ ] Add button tokens
- [ ] Add input/form tokens
- [ ] Add badge/pill tokens
- [ ] Add navigation tokens
- [ ] Add modal tokens
- [ ] Add dropdown tokens
- [ ] Add toast tokens
- [ ] Add tab tokens
- [ ] Add tooltip tokens

---

### **Phase 2: Component Refactoring** (Weeks 2-3)

#### 2.1 Priority Order (High → Low)

**Tier 1: Core Components (Week 2)**
1. Button primitives
2. Input/SearchInput
3. Navigation (BottomNav, MainNav)
4. ProductCard (already started)
5. ConditionBadge

**Tier 2: Layout Components (Week 3)**
6. Modal/Dialog
7. Dropdown/Select
8. Tabs/TabGroup
9. Tooltip
10. Toast

**Tier 3: Specialty Components (Week 4)**
11. Skeletons
12. Spinners
13. Pills/Badges
14. Theme Toggle
15. Progress indicators

---

#### 2.2 Refactoring Template

**Before (SearchInput.svelte):**
```svelte
<button
  class="flex items-center gap-1.5 px-2 h-9 rounded-md bg-transparent hover:bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors text-sm font-medium"
>
  Filter
</button>
```

**After:**
```svelte
<button class="filter-button">
  Filter
</button>

<style>
  .filter-button {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 1.5);        /* 6px */
    padding-inline: var(--button-padding-x-xs);
    height: var(--button-height-sm);
    border-radius: var(--button-radius);
    background-color: transparent;
    color: var(--nav-text);
    font-size: var(--button-font-size);
    font-weight: var(--button-font-weight);
    transition: var(--button-transition);
  }
  
  .filter-button:hover {
    background-color: var(--nav-item-hover);
    color: var(--nav-text-active);
  }
</style>
```

**✅ Benefits:**
- ✅ No hardcoded values
- ✅ All spacing from tokens
- ✅ Easy to theme
- ✅ Consistent across app
- ✅ Self-documenting

---

#### 2.3 Component Migration Checklist

**For EACH component:**
- [ ] Identify all hardcoded values
- [ ] Map to existing tokens (or create new ones)
- [ ] Create semantic CSS classes
- [ ] Move styles to scoped `<style>` block
- [ ] Remove inline utility classes
- [ ] Test all states (hover, focus, active, disabled)
- [ ] Verify dark mode (if applicable)
- [ ] Update Storybook examples
- [ ] Run type checking (`pnpm check`)
- [ ] Visual QA against Vinted reference

---

### **Phase 3: Global Cleanup** (Week 4)

#### 3.1 Remove Anti-Patterns

**Find & Replace:**
```bash
# Find all bg-[color:var(...)] patterns
rg "bg-\[color:var\(" --type svelte

# Find all text-[color:var(...)] patterns
rg "text-\[color:var\(" --type svelte

# Find hardcoded px/py values
rg "px-[0-9]|py-[0-9]" --type svelte

# Find hardcoded text sizes
rg "text-\[.*px\]" --type svelte
```

**Replace with:**
- Scoped CSS classes
- Token references via `var(--token-name)`

---

#### 3.2 Standardize Semantic Color System

Update `semantic.css`:
```css
/* packages/ui/src/styles/tokens-v4/semantic.css */
@theme {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEMANTIC SURFACE COLORS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --surface-base: var(--color-white);
  --surface-subtle: var(--color-charcoal-50);
  --surface-emphasis: var(--color-charcoal-100);
  --surface-muted: var(--color-charcoal-200);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEMANTIC TEXT COLORS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --text-primary: var(--color-charcoal-900);
  --text-secondary: var(--color-charcoal-700);
  --text-tertiary: var(--color-charcoal-500);
  --text-muted: var(--color-charcoal-400);
  --text-inverse: var(--color-white);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEMANTIC BORDER COLORS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --border-subtle: var(--color-charcoal-200);
  --border-emphasis: var(--color-charcoal-300);
  --border-strong: var(--color-charcoal-400);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEMANTIC STATE COLORS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --state-success: var(--color-emerald-600);
  --state-error: var(--color-burgundy-600);
  --state-warning: var(--color-gold-600);
  --state-info: var(--color-indigo-600);
  --state-focus: var(--color-burgundy-500);
  --state-active: var(--color-burgundy-50);
  
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BRAND COLORS
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  
  --brand-primary: var(--color-burgundy-600);
  --brand-primary-hover: var(--color-burgundy-700);
  --brand-primary-subtle: var(--color-burgundy-50);
}
```

---

### **Phase 4: Dark Mode Implementation** (Week 5)

Update `dark-theme.css`:
```css
/* packages/ui/src/styles/tokens-v4/dark-theme.css */
@theme {
  /* Dark mode overrides */
  @media (prefers-color-scheme: dark) {
    --surface-base: var(--color-charcoal-950);
    --surface-subtle: var(--color-charcoal-900);
    --surface-emphasis: var(--color-charcoal-800);
    
    --text-primary: var(--color-charcoal-50);
    --text-secondary: var(--color-charcoal-200);
    --text-tertiary: var(--color-charcoal-400);
    
    --border-subtle: var(--color-charcoal-800);
    --border-emphasis: var(--color-charcoal-700);
    
    /* Component adjustments */
    --button-secondary-bg: var(--color-charcoal-800);
    --button-secondary-hover: var(--color-charcoal-700);
    
    --input-bg: var(--color-charcoal-900);
    --input-border: var(--color-charcoal-700);
    
    --dropdown-bg: var(--color-charcoal-900);
    --dropdown-border: var(--color-charcoal-700);
  }
}
```

---

## 🚀 Implementation Strategy

### **Week 1: Token Expansion**
- [ ] Day 1-2: Add button/input tokens
- [ ] Day 3: Add navigation tokens
- [ ] Day 4: Add modal/dropdown tokens
- [ ] Day 5: Review & test token structure

### **Week 2: Core Components**
- [ ] Day 1: Button primitives
- [ ] Day 2: Input/SearchInput
- [ ] Day 3: Navigation components
- [ ] Day 4: ProductCard finalization
- [ ] Day 5: Badge/pill components

### **Week 3: Layout Components**
- [ ] Day 1: Modal/Dialog
- [ ] Day 2: Dropdown/Select
- [ ] Day 3: Tabs system
- [ ] Day 4: Tooltip
- [ ] Day 5: Toast/notifications

### **Week 4: Polish & Cleanup**
- [ ] Day 1-2: Remaining components
- [ ] Day 3: Global anti-pattern removal
- [ ] Day 4: Visual QA
- [ ] Day 5: Performance testing

### **Week 5: Dark Mode**
- [ ] Day 1-2: Dark theme tokens
- [ ] Day 3-4: Component dark mode
- [ ] Day 5: Final testing

---

## 📏 Success Metrics

### **Code Quality**
- ✅ Zero hardcoded spacing values
- ✅ Zero `text-[17px]` arbitrary values
- ✅ Zero `bg-[color:var(...)]` anti-patterns
- ✅ 100% scoped CSS for component styles
- ✅ All tokens defined in `@theme`

### **Performance**
- ✅ CSS bundle size < 50KB (gzipped)
- ✅ No unused CSS variables
- ✅ Lighthouse score > 95

### **Maintainability**
- ✅ Single source of truth (tokens)
- ✅ Easy to add new components
- ✅ Consistent patterns across codebase
- ✅ Self-documenting design system

### **Theming**
- ✅ Dark mode works automatically
- ✅ Can change brand colors in <5 minutes
- ✅ Can adjust spacing scale globally
- ✅ Can customize per-component tokens

---

## 🔍 Quality Assurance Checklist

### **Per Component:**
- [ ] All spacing uses `calc(var(--spacing) * n)`
- [ ] All colors use `var(--color-*` or `var(--semantic-*)`
- [ ] All typography uses `var(--text-*)` and `var(--font-*)`
- [ ] Hover/focus/active states defined
- [ ] Dark mode verified (if applicable)
- [ ] Storybook examples updated
- [ ] Type checking passes
- [ ] Visual comparison with Vinted

### **Global:**
- [ ] Run `rg "px-[0-9]" --type svelte` → 0 results
- [ ] Run `rg "text-\[.*px\]" --type svelte` → 0 results
- [ ] Run `rg "bg-\[color:var" --type svelte` → 0 results
- [ ] All tokens used (no orphans)
- [ ] CSS bundle size acceptable
- [ ] Lighthouse performance > 95

---

## 📚 Official Documentation References

1. **Tailwind CSS v4 @theme Directive**  
   https://tailwindcss.com/docs/functions-and-directives

2. **Tailwind CSS v4 with Vite**  
   https://tailwindcss.com/docs/installation/framework-guides/sveltekit

3. **Tailwind CSS v4 Theme Variables**  
   https://tailwindcss.com/docs/theme

4. **Tailwind CSS v4 Migration Guide**  
   https://tailwindcss.com/docs/upgrade-guide

5. **Context7 Tailwind CSS Documentation**  
   Library ID: `/websites/tailwindcss` (9.5 trust score, 1604 snippets)

6. **Svelte 5 Scoped Styles**  
   Use: `mcp_svelte_get-documentation` with section "scoped-styles"

7. **Svelte 5 Component Patterns**  
   Use: `mcp_svelte_get-documentation` with sections "$props", "class"

---

## 🎯 Expected Outcomes

### **Before Migration:**
```svelte
<!-- ❌ Current state -->
<button class="flex items-center gap-1.5 px-2 h-9 rounded-md bg-transparent hover:bg-[color:var(--surface-subtle)] text-sm font-medium">
  Click me
</button>
```

**Issues:**
- Hardcoded spacing (`gap-1.5`, `px-2`, `h-9`)
- Mixed patterns (`bg-transparent` + `hover:bg-[color:...]`)
- Magic numbers everywhere
- Impossible to theme
- Hard to maintain

---

### **After Migration:**
```svelte
<!-- ✅ Target state -->
<button class="btn btn--ghost btn--sm">
  Click me
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing) * 1.5);
    border-radius: var(--button-radius);
    font-size: var(--button-font-size);
    font-weight: var(--button-font-weight);
    transition: var(--button-transition);
  }
  
  .btn--sm {
    height: var(--button-height-sm);
    padding-inline: var(--button-padding-x-sm);
  }
  
  .btn--ghost {
    background-color: transparent;
    color: var(--button-ghost-text);
  }
  
  .btn--ghost:hover {
    background-color: var(--button-ghost-hover);
  }
</style>
```

**Benefits:**
- ✅ Zero hardcoded values
- ✅ All spacing from tokens
- ✅ Self-documenting
- ✅ Easy to theme
- ✅ Consistent
- ✅ Maintainable

---

## 💡 Key Principles

1. **Single Source of Truth:** ALL design decisions in `@theme` blocks
2. **Semantic CSS:** Use BEM-like classes, not inline utilities
3. **Token Hierarchy:** Foundation → Semantic → Component tokens
4. **Component Isolation:** Scoped `<style>` blocks with `var(--tokens)`
5. **Zero Hardcoding:** Every px/rem/color must trace to a token
6. **Progressive Enhancement:** Start with core components, expand outward
7. **Test Everything:** Visual QA + automated checks

---

## 🚨 Anti-Patterns to Eliminate

### ❌ **NEVER DO THIS:**
```svelte
<!-- Hardcoded utilities -->
<div class="px-4 py-2 text-sm rounded-lg">

<!-- Arbitrary CSS variables -->
<div class="bg-[color:var(--surface-base)]">

<!-- Magic numbers -->
<span class="text-[17px]">

<!-- Inline arbitrary values -->
<div class="top-[117px]">
```

### ✅ **ALWAYS DO THIS:**
```svelte
<div class="component-name">

<style>
  .component-name {
    padding-inline: var(--component-padding-x);
    padding-block: var(--component-padding-y);
    font-size: var(--component-font-size);
    border-radius: var(--component-radius);
  }
</style>
```

---

## 📊 Progress Tracking

Create a tracking document to monitor migration:

```markdown
# Migration Progress

## Components (0/50 complete)

### Tier 1: Core (0/5)
- [ ] Button primitives
- [ ] Input/SearchInput
- [ ] Navigation (BottomNav, MainNav)
- [ ] ProductCard
- [ ] ConditionBadge

### Tier 2: Layout (0/5)
- [ ] Modal/Dialog
- [ ] Dropdown/Select
- [ ] Tabs/TabGroup
- [ ] Tooltip
- [ ] Toast

### Tier 3: Specialty (0/10)
...

## Metrics
- Hardcoded utilities removed: 0/100+
- Components refactored: 0/50
- Token coverage: 60% → 100%
- CSS bundle size: TBD
```

---

## 🎓 Team Guidelines

### **For Developers:**
1. **Before adding a component:** Check if tokens exist, create if needed
2. **Never hardcode:** Always use tokens via `var(--token-name)`
3. **Scoped CSS only:** No inline utility classes for styling
4. **Test dark mode:** Verify all components work in dark mode
5. **Update Storybook:** Keep component examples current

### **For Reviewers:**
1. **Check for hardcoding:** Reject PRs with magic numbers
2. **Verify token usage:** All styling must use tokens
3. **Dark mode:** Ensure dark mode tested
4. **Visual consistency:** Compare against Vinted reference
5. **Performance:** Check CSS bundle size impact

---

## 📈 Next Steps

1. **Review this plan** with the team
2. **Get buy-in** on timeline (5 weeks)
3. **Set up tracking** (GitHub project or similar)
4. **Start Phase 1** (token expansion)
5. **Weekly reviews** to track progress

---

**This plan transforms Driplo from a fragmented, hard-to-maintain codebase into a professional, token-based design system following official Tailwind CSS v4 best practices.**

**Target:** Production-ready, maintainable, themeable, Vinted-quality UI system.
