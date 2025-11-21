# Complete Tailwind CSS v4 Refactor Strategy

> **Strategic refactoring plan** with **official best practices** - Clean house first, then rebuild properly

**Created**: October 16, 2025 (Updated with v4.1.x best practices)  
**Status**: 🔴 Critical - UI/UX completely broken  
**Timeline**: 3 phases over 2-3 days  
**Standards**: `@theme` directive, `@utility` for components, `@tailwindcss/vite` plugin, Svelte 5 clsx pattern

---

## 🚨 Current Problems (What's Broken)

### Critical Issues Found

1. **Hamburger Menu (MobileNavigationDialog)**
   - ✅ Actually uses proper token references (`bg-surface-base`, `bg-surface-subtle`)
   - ❌ Root cause: **semantic token definitions have blue tints** instead of neutral greys
   - Fix: Update `semantic.css` to use `oklch(0 0 0 / 0.04)` for neutral states

2. **Blue Button/Touch Target Disease** 
   - Found **28+ instances** of `hover:bg-blue-*` hardcoded colors
   - `hover:bg-blue-700`, `bg-[var(--brand-primary-strong)]` everywhere
   - Should use: `hover:bg-[color:var(--button-primary-hover)]` or `hover:bg-[color:var(--state-hover)]`
   - Files affected:
     - `FollowButton.svelte`
     - `LazySearchResults.svelte`
     - `SearchFeedback.svelte`
     - `UnifiedCookieConsent.svelte`
     - `ErrorStates.svelte`
     - `OnboardingSuccessModal.svelte`
     - `ImageUploaderSupabase.svelte`

3. **Transparent Component Hell**
   - `bg-transparent` used **everywhere** inappropriately
   - `HeaderUserMenu.svelte`: 4x `bg-transparent` on same element (excessive)
   - Product cards, accordions, pills - all transparent when they need solid backgrounds
   - Should use: `bg-[color:var(--card-bg)]`, `bg-[color:var(--surface-base)]`

4. **Token System Chaos**
   - **TWO token systems coexist**:
     - `/packages/ui/src/styles/tokens/` (old v3 style with `@layer` - DELETE)
     - `/packages/ui/src/styles/tokens-v4/` (new v4 style with `@theme` - KEEP)
   - Components reference **both** randomly
   - Need single source of truth using v4 `@theme` directive

5. **Hardcoded Colors**
   - `border-black`, `text-white`, `bg-black/20`
   - Direct color values instead of semantic tokens
   - Inconsistent hover states (some blue, some grey, some none)
   - Should use: `border-[color:var(--border-subtle)]`, `text-[color:var(--text-primary)]`

---

## 📊 Damage Assessment

### File Inventory

```
🗂️ Token Systems (CONFLICTING)
├── packages/ui/src/styles/tokens/       # ❌ OLD v3 system - DELETE ENTIRE FOLDER
│   ├── semantic.css                     # Uses @layer (v3 pattern)
│   ├── foundations.css
│   ├── components.css
│   └── alias.css
│
└── packages/ui/src/styles/tokens-v4/    # ✅ NEW v4 system
    ├── tokens.css (entry)
    ├── foundations.css
    ├── semantic.css
    ├── semantic-enhanced.css
    ├── components.css
    ├── dark-theme.css
    ├── dark-theme-enhanced.css
    └── legacy.css

🎨 Broken Components (28+ files)
├── Navigation (8 files)
│   ├── MobileNavigationDialog.svelte
│   ├── HeaderUserMenu.svelte
│   ├── SearchFeedback.svelte
│   ├── LazySearchResults.svelte
│   ├── CategorySearchBar.svelte
│   ├── SearchPageSearchBar.svelte
│   ├── IntegratedSearchBar.svelte
│   └── EnhancedSearchBar.svelte
│
├── Buttons (2 files)
│   ├── FollowButton.svelte
│   └── (various button components)
│
├── Cards (2 files)
│   ├── ProductCard.svelte
│   └── ProductCardNew.svelte
│
├── Forms (2 files)
│   └── SearchInput.svelte
│
├── Modals (3 files)
│   ├── OnboardingSuccessModal.svelte
│   ├── UnifiedCookieConsent.svelte
│   └── ErrorStates.svelte
│
└── Misc (11+ files)
    ├── CategoryPill.svelte
    ├── Accordion.svelte
    ├── ImageUploaderSupabase.svelte
    └── ...more
```

### Antipattern Count

| Antipattern | Count | Severity |
|-------------|-------|----------|
| `hover:bg-blue-*` | 12+ | 🔴 Critical |
| `bg-transparent` (inappropriate) | 20+ | 🔴 Critical |
| `border-black` | 5+ | 🟡 Medium |
| Hardcoded `text-white` | 15+ | 🟡 Medium |
| Mixed token systems | 100+ | 🔴 Critical |

---

## 🎯 Refactoring Strategy (3 Phases)

### PHASE 1: Nuclear Cleanup (Day 1 - 4 hours) 🧹

**Goal**: Delete old systems, consolidate to v4 ONLY

#### 1.1 Delete Old Token System
```bash
# Remove old v3 tokens completely
rm -rf packages/ui/src/styles/tokens/

# Keep only v4
# packages/ui/src/styles/tokens-v4/ becomes canonical
```

#### 1.2 Fix Token Entry Point
Update `packages/ui/src/styles/tokens-v4/semantic.css`:

```css
/* FIX: Change blue-tinted states to NEUTRAL */

/* BEFORE (❌ BROKEN) */
--state-hover: oklch(0.98 0.015 245 / 0.3);  /* Blue tint! */

/* AFTER (✅ CORRECT) */
--state-hover: oklch(0 0 0 / 0.04);          /* Neutral grey */
--state-active: oklch(0 0 0 / 0.08);         /* Neutral grey */
```

#### 1.3 Verify Import Chain
Check that `app.css` imports ONLY v4:

```css
/* apps/web/src/app.css */
@import 'tailwindcss';
@import '@repo/ui/styles/tokens-v4/tokens.css';  /* ✅ v4 ONLY */
/* @import '@repo/ui/styles/tokens/...' */       /* ❌ REMOVE */
```

#### 1.4 Create Alias for Backwards Compatibility
Temporarily keep old token names working:

```css
/* packages/ui/src/styles/tokens-v4/legacy.css */
@theme {
  /* Old names → New names */
  --brand-primary-strong: var(--color-indigo-600);
  /* Add more as needed during migration */
}
```

**Deliverables Phase 1**:
- ✅ Single token system (v4 only)
- ✅ Neutral hover states (no blue tint)
- ✅ Clean import chain
- ✅ Backwards compat layer

**Test**: `pnpm dev` should compile without errors

---

### PHASE 2: Component Surgery (Day 1-2 - 8 hours) 🔧

**Goal**: Fix all broken components systematically

#### 2.1 Create Component Token Utilities (v4 `@utility` Pattern)

```css
/* packages/ui/src/styles/tokens-v4/components.css */
@theme {
  /* NAVIGATION TOKENS */
  --nav-item-hover: var(--state-hover);              /* Neutral grey overlay */
  --nav-item-active: var(--state-active);            /* Neutral grey overlay */
  
  /* BUTTON TOKENS */
  --button-primary-bg: var(--color-indigo-600);
  --button-primary-hover: var(--color-indigo-700);   /* Indigo, not blue-700! */
  --button-primary-text: var(--color-charcoal-0);
  
  /* CARD TOKENS */
  --card-bg: var(--surface-base);                    /* Solid white, not transparent */
  --card-border: var(--border-subtle);
  --card-hover-shadow: var(--shadow-md);
}

/* Custom button utilities using v4 @utility directive */
@utility btn-base {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 150ms ease;
  min-height: var(--touch-primary);  /* WCAG AAA = 44px */
}

@utility btn-primary {
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  
  &:hover {
    background-color: var(--button-primary-hover);
  }
}

@utility btn-ghost {
  background-color: transparent;
  
  &:hover {
    background-color: var(--state-hover);  /* Neutral, not blue! */
  }
}
  
  --button-ghost-bg: transparent;
  --button-ghost-hover: var(--state-hover);          /* Neutral */
  
  /* MOBILE MENU TOKENS */
  --mobile-menu-bg: var(--surface-base);             /* Solid white */
  --mobile-menu-item-hover: var(--state-hover);      /* Neutral */
  --mobile-menu-overlay: oklch(0 0 0 / 0.4);
  
  /* CARD TOKENS */
  --card-bg: var(--surface-base);                    /* Solid white */
  --card-border: var(--border-subtle);
  --card-hover-border: var(--border-default);
}
```

#### 2.2 Fix Components by Priority

**🔴 Priority 1: Navigation (Critical UX) - Svelte 5 Patterns**

1. **MobileNavigationDialog.svelte** (hamburger menu)
   ```svelte
   <script>
     let { isOpen } = $props();  // Svelte 5 $props()
   </script>
   
   <!-- Use Svelte 5.16+ class object pattern -->
   <button class={{
     'hover:bg-[color:var(--nav-item-hover)]': true,    /* Neutral, not blue! */
     'active:bg-[color:var(--nav-item-active)]': true,  /* Neutral, not blue! */
     'min-h-[var(--touch-primary)]': true,              /* 44px WCAG AAA */
     'rounded-lg px-4 py-3': true,
   }}>
     Menu Item
   </button>
   
   <!-- Profile section - already correct but verify -->
   <div class="bg-[color:var(--surface-subtle)] border border-[color:var(--border-subtle)] rounded-lg">
     Profile
   </div>
   ```

2. **HeaderUserMenu.svelte**
   ```svelte
   <!-- ❌ BEFORE (4x bg-transparent spam - terrible pattern) -->
   triggerClass="p-0 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent ..."
   
   <!-- ✅ AFTER (clean, uses Svelte 5 class object) -->
   <script>
     let { class: className } = $props();  // Accept class prop
   </script>
   
   <button class={[
     'p-0 bg-transparent rounded-full',
     'hover:bg-[color:var(--state-hover)]',        /* Neutral overlay */
     'focus:ring-2 focus:ring-[color:var(--color-indigo-500)]',
     'min-h-[var(--touch-primary)] min-w-[var(--touch-primary)]',  /* 44px */
     className,
   ]}>
     <!-- content -->
   </button>
   ```

3. **All Search Components** (Apply consistently)
   - SearchFeedback.svelte
   - LazySearchResults.svelte
   - SearchInput.svelte
   
   ```svelte
   <!-- ❌ FIND AND DESTROY -->
   hover:bg-blue-700
   bg-[var(--brand-primary-strong)]
   bg-blue-600
   
   <!-- ✅ REPLACE WITH TOKEN REFERENCES -->
   hover:bg-[color:var(--button-primary-hover)]
   bg-[color:var(--button-primary-bg)]
   
   <!-- Example: -->
   <button class={{
     'bg-[color:var(--button-primary-bg)]': true,
     'hover:bg-[color:var(--button-primary-hover)]': true,
     'text-[color:var(--button-primary-text)]': true,
     'rounded-lg px-4 py-2': true,
   }}>
     Search
   </button>
   ```

**🟡 Priority 2: Buttons & Cards**

4. **FollowButton.svelte**
   ```svelte
   <script>
     let { isFollowing } = $props();
   </script>
   
   <!-- ❌ BEFORE -->
   class={isFollowing 
     ? 'bg-surface-subtle hover:bg-surface-muted' 
     : 'bg-[var(--brand-primary-strong)] text-white hover:bg-blue-700'
   }
   
   <!-- ✅ AFTER (Svelte 5 class object pattern) -->
   <button class={{
     // Unfollow state (ghost button)
     'bg-[color:var(--surface-subtle)]': isFollowing,
     'hover:bg-[color:var(--surface-muted)]': isFollowing,
     'text-[color:var(--text-primary)]': isFollowing,
     
     // Follow state (primary button)
     'bg-[color:var(--button-primary-bg)]': !isFollowing,
     'hover:bg-[color:var(--button-primary-hover)]': !isFollowing,
     'text-[color:var(--button-primary-text)]': !isFollowing,
     
     // Base styles
     'rounded-lg px-4 py-2 font-semibold': true,
     'min-h-[var(--touch-primary)]': true,
   }}>
     {isFollowing ? 'Unfollow' : 'Follow'}
   </button>
   ```

5. **ProductCard.svelte & ProductCardNew.svelte**
   ```svelte
   <!-- BEFORE -->
   class="... bg-transparent hover:shadow-..."
   
   <!-- AFTER -->
   class="... bg-[color:var(--card-bg)] hover:shadow-..."
   ```

**🟢 Priority 3: Modals & Misc**

6. **All Modal Components**
   - OnboardingSuccessModal
   - UnifiedCookieConsent
   - ErrorStates
   ```svelte
   <!-- Replace all instances -->
   hover:bg-blue-700 → hover:bg-[color:var(--button-primary-hover)]
   bg-blue-600 → bg-[color:var(--button-primary-bg)]
   ```

7. **CategoryPill, Accordion, etc.**
   - Remove `bg-transparent` where inappropriate
   - Use `bg-[color:var(--surface-base)]` or leave transparent for pills

#### 2.3 Create Migration Script

```bash
#!/bin/bash
# scripts/migrate-components.sh

# Find all hardcoded blue colors
echo "Finding blue antipatterns..."
grep -r "hover:bg-blue" packages/ui/src --include="*.svelte"

# Find inappropriate bg-transparent
echo "Finding transparent antipatterns..."
grep -r "bg-transparent" packages/ui/src --include="*.svelte" | grep -v "pill\|tag\|badge"

# Create report
echo "Creating antipattern report..."
grep -r "hover:bg-blue\|border-black\|text-white" packages/ui/src --include="*.svelte" > antipattern-report.txt
```

**Deliverables Phase 2**:
- ✅ All 28+ components use proper tokens
- ✅ No more `hover:bg-blue-*`
- ✅ No inappropriate `bg-transparent`
- ✅ Consistent hover states (neutral)
- ✅ Component token system in place

**Test**: Visual QA of all fixed components

---

### PHASE 3: Polish & Dark Mode (Day 2-3 - 6 hours) ✨

**Goal**: Perfect the system, add dark mode, document

#### 3.1 Dark Mode Implementation

```css
/* packages/ui/src/styles/tokens-v4/dark-theme.css */
@media (prefers-color-scheme: dark) {
  :root {
    /* Surfaces */
    --surface-base: var(--color-charcoal-900);
    --surface-subtle: var(--color-charcoal-800);
    --surface-muted: var(--color-charcoal-700);
    
    /* Text */
    --text-primary: var(--color-charcoal-0);
    --text-secondary: var(--color-charcoal-200);
    --text-tertiary: var(--color-charcoal-400);
    
    /* Borders */
    --border-subtle: var(--color-charcoal-700);
    --border-default: var(--color-charcoal-600);
    
    /* States (STILL NEUTRAL) */
    --state-hover: oklch(1 0 0 / 0.08);   /* White overlay in dark */
    --state-active: oklch(1 0 0 / 0.12);
    
    /* Buttons */
    --button-primary-bg: var(--color-indigo-500);
    --button-primary-hover: var(--color-indigo-400);
    
    /* Mobile menu */
    --mobile-menu-bg: var(--color-charcoal-900);
    --mobile-menu-overlay: oklch(0 0 0 / 0.6);
  }
}
```

#### 3.2 Add Manual Dark Mode Toggle

```typescript
// packages/ui/src/lib/utils/theme.svelte.ts
export function useTheme() {
  let theme = $state<'light' | 'dark' | 'system'>('system');
  
  function setTheme(value: typeof theme) {
    theme = value;
    document.documentElement.classList.remove('light', 'dark');
    if (value !== 'system') {
      document.documentElement.classList.add(value);
    }
    localStorage.setItem('theme', value);
  }
  
  return { theme, setTheme };
}
```

#### 3.3 Component Testing Checklist

```markdown
## Visual QA Checklist

### Mobile Navigation
- [ ] Hamburger menu: solid white bg, no transparency
- [ ] Menu items: neutral hover (grey, not blue)
- [ ] Profile section: proper borders and bg
- [ ] Touch targets: 44px minimum
- [ ] Overlay: dark, semi-transparent backdrop

### Buttons
- [ ] Primary: indigo bg, darker hover
- [ ] Secondary: outline style, neutral hover
- [ ] Ghost: transparent, neutral hover
- [ ] No `blue-700` anywhere

### Cards
- [ ] Product cards: solid white bg
- [ ] Proper shadows on hover
- [ ] Border colors from tokens
- [ ] Image placeholders: subtle grey

### Forms
- [ ] Input fields: proper bg and borders
- [ ] Focus rings: indigo color
- [ ] Placeholder text: muted grey
- [ ] Error states: burgundy tokens

### Dark Mode
- [ ] All surfaces invert properly
- [ ] Text remains readable (WCAG AA)
- [ ] Borders visible but subtle
- [ ] Hover states work (white overlay)
```

#### 3.4 Documentation Update

Update `DESIGN_TOKENS.md` with:
- Complete token reference
- Usage examples for each component type
- Migration guide from old tokens
- Dark mode guidelines

**Deliverables Phase 3**:
- ✅ Dark mode fully functional
- ✅ All components tested
- ✅ Documentation complete
- ✅ Zero antipatterns remaining

---

## 🚀 Execution Plan

### Day 1 Morning (4 hours) - PHASE 1
```bash
# 1. Backup current state
git checkout -b refactor/tailwind-v4-cleanup

# 2. Delete old tokens
rm -rf packages/ui/src/styles/tokens/

# 3. Fix semantic.css (neutral states)
# Edit: packages/ui/src/styles/tokens-v4/semantic.css

# 4. Test compilation
pnpm build

# 5. Commit
git add .
git commit -m "Phase 1: Remove old token system, fix neutral states"
```

### Day 1 Afternoon (4 hours) - PHASE 2 Priority 1
```bash
# Fix navigation components
# 1. MobileNavigationDialog.svelte
# 2. HeaderUserMenu.svelte  
# 3. Search components

# Test each component visually
pnpm dev
# Open http://localhost:5173 and test mobile menu

git add .
git commit -m "Phase 2.1: Fix navigation components"
```

### Day 2 Morning (4 hours) - PHASE 2 Priority 2 & 3
```bash
# Fix buttons, cards, modals
# Use search & replace for common patterns

git add .
git commit -m "Phase 2.2: Fix buttons, cards, modals"
```

### Day 2 Afternoon (3 hours) - PHASE 3
```bash
# Implement dark mode
# Test thoroughly

git add .
git commit -m "Phase 3: Dark mode + polish"
```

### Day 3 (3 hours) - Polish & QA
```bash
# Final testing
# Documentation
# Create before/after screenshots

git add .
git commit -m "Refactor complete: Tailwind v4 + Svelte 5 design system"
```

---

## 📝 Search & Replace Patterns

### Global Replacements (Safe)

```bash
# Replace blue hover states
find packages/ui/src -name "*.svelte" -type f -exec sed -i 's/hover:bg-blue-700/hover:bg-[color:var(--button-primary-hover)]/g' {} +

# Replace primary button bg
find packages/ui/src -name "*.svelte" -type f -exec sed -i 's/bg-\[var(--brand-primary-strong)\]/bg-[color:var(--button-primary-bg)]/g' {} +

# Replace hardcoded white text on buttons
# (Manual review needed)
```

### Component-Specific Replacements

```svelte
<!-- MobileNavigationDialog.svelte -->
FIND: hover:bg-surface-muted
REPLACE: hover:bg-[color:var(--nav-item-hover)]

<!-- HeaderUserMenu.svelte -->
FIND: bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent
REPLACE: bg-transparent hover:bg-[color:var(--state-hover)]

<!-- All buttons -->
FIND: hover:bg-blue-700
REPLACE: hover:bg-[color:var(--button-primary-hover)]

FIND: bg-blue-600
REPLACE: bg-[color:var(--button-primary-bg)]
```

---

## ✅ Success Criteria

### Must Have
- ✅ Zero `hover:bg-blue-*` in codebase
- ✅ Zero inappropriate `bg-transparent`
- ✅ Single token system (v4 only)
- ✅ Mobile menu: solid bg, neutral hovers
- ✅ All buttons use component tokens
- ✅ WCAG AA contrast minimum

### Nice to Have
- ✅ Dark mode fully functional
- ✅ WCAG AAA touch targets (44px)
- ✅ Comprehensive documentation
- ✅ Migration script for future changes

---

## 🎯 Final Outcome

**Before (Current State)**:
- 🔴 Transparent chaos
- 🔴 Blue buttons everywhere
- 🔴 Black borders, hardcoded colors
- 🔴 Two conflicting token systems
- 🔴 Broken mobile menu
- 🔴 No dark mode

**After (Target State)**:
- ✅ Solid, elegant backgrounds
- ✅ Neutral hover states (sophisticated grey)
- ✅ Refined borders from tokens
- ✅ Single v4 token system
- ✅ Beautiful mobile menu (Vinted-style)
- ✅ Full dark mode support
- ✅ WCAG AAA compliant
- ✅ World-class luxury aesthetic

---

## 🚨 Risk Mitigation

### Potential Issues

1. **Breaking Changes**
   - Solution: Create `legacy.css` compatibility layer
   - Test each component before moving to next

2. **Dark Mode Edge Cases**
   - Solution: Test systematically with checklist
   - Use color-mix() for subtle variations

3. **Performance**
   - Solution: v4 is faster than v3
   - CSS variables are native, zero runtime cost

4. **Team Coordination**
   - Solution: Work in feature branch
   - Create clear PR with before/after screenshots
   - Document all changes

---

**Ready to execute? Let's start with Phase 1! 🚀**
