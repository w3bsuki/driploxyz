# Phase 3: Component Patterns & Best Practices - Complete Refactor

## Context
Phase 1 (100% ✅): Foundation complete - tokens, Vite config, Lightning CSS
Phase 2 (100% ✅): Component color surgery - 65+ files, 150+ hardcoded colors eliminated, 200+ semantic token references

**Now execute Phase 3 to 100% completion. Follow Tailwind CSS v4 + Svelte 5 best practices per Context7 MCP and Svelte MCP.**

---

## Phase 3 Objectives

### 1. Component Pattern Consolidation with `@utility` (Priority 1)
**Target**: Eliminate repeated class strings across multiple files using Tailwind v4's `@utility` directive.

#### A. Button Pattern Consolidation
**Files to audit**: Search for repeated button patterns across:
- `packages/ui/src/components/**/*.svelte` 
- Focus on: PrimaryButton, SecondaryButton, GhostButton, IconButton patterns

**Pattern to extract**:
```typescript
// BEFORE (repeated in multiple files):
<button class="rounded-full px-5 py-2 font-semibold text-[var(--text-inverse)] bg-[var(--btn-primary-bg)] shadow-md hover:bg-[var(--state-hover)] focus:ring-2 focus:ring-[var(--border-focus)]">

// AFTER - Define in packages/ui/src/styles/tokens-v4/components.css:
@utility btn-primary {
  border-radius: calc(infinity * 1px);
  background-color: var(--btn-primary-bg);
  padding-inline: --spacing(5);
  padding-block: --spacing(2);
  font-weight: var(--font-weight-semibold);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  
  &:hover {
    @media (hover: hover) {
      background-color: var(--state-hover);
    }
  }
  
  &:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
}

@utility btn-secondary {
  border-radius: calc(infinity * 1px);
  border: 1px solid var(--border-primary);
  background-color: transparent;
  padding-inline: --spacing(5);
  padding-block: --spacing(2);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  
  &:hover {
    @media (hover: hover) {
      background-color: var(--state-hover-subtle);
    }
  }
}

@utility btn-ghost {
  border-radius: var(--radius);
  background-color: transparent;
  padding-inline: --spacing(3);
  padding-block: --spacing(1.5);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  
  &:hover {
    @media (hover: hover) {
      background-color: var(--state-hover-subtle);
    }
  }
}

// USE in components:
<button class="btn-primary">Save Changes</button>
<button class="btn-secondary">Cancel</button>
```

**Action**: 
1. `grep_search` for common button class patterns
2. Extract 3-5 most common button patterns into `@utility` definitions
3. Replace all instances with single utility class
4. Verify with `get_errors`

---

#### B. Card Pattern Consolidation
**Files to audit**: ProductCard, SellerProfileCard, CategoryCard, etc.

**Pattern to extract**:
```css
@utility card {
  background-color: var(--surface-card);
  border-radius: var(--radius-lg);
  padding: --spacing(6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-subtle);
}

@utility card-interactive {
  background-color: var(--surface-card);
  border-radius: var(--radius-lg);
  padding: --spacing(6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-subtle);
  transition: box-shadow 0.2s ease;
  
  &:hover {
    @media (hover: hover) {
      box-shadow: var(--shadow-md);
    }
  }
}
```

---

#### C. Form Input Pattern Consolidation
**Files to audit**: TagInput, PriceInput, BrandSelector, SearchBar components

**Pattern to extract**:
```css
@utility input-base {
  border-radius: var(--radius);
  border: 1px solid var(--border-input);
  background-color: var(--surface-input);
  padding-inline: --spacing(3);
  padding-block: --spacing(2);
  font-size: var(--text-base);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px var(--border-focus-ring);
  }
  
  &::placeholder {
    color: var(--text-placeholder);
  }
}

@utility input-error {
  border-color: var(--status-error-solid);
  
  &:focus {
    border-color: var(--status-error-solid);
    box-shadow: 0 0 0 3px var(--status-error-ring);
  }
}
```

---

### 2. Svelte 5 Best Practices - `class={{}}` Object Syntax (Priority 2)
**Per Svelte MCP**: Since Svelte 5.16+, use `class={{}}` with clsx-style objects/arrays for conditional classes.

#### Migration Pattern:
```typescript
// BEFORE (Phase 2 - individual classes):
<button 
  class="btn-primary"
  class:disabled={isDisabled}
  class:loading={isLoading}
>

// AFTER (Phase 3 - Svelte 5.16+ best practice):
<button class={['btn-primary', { disabled: isDisabled, loading: isLoading }]}>

// OR for complex conditions:
<button class={{
  'btn-primary': !secondary,
  'btn-secondary': secondary,
  'opacity-50 cursor-not-allowed': isDisabled,
  'animate-pulse': isLoading
}}>
```

**Files to refactor**:
1. All button components (20+ files)
2. Card components with hover/active states (15+ files)
3. Form inputs with error/focus states (10+ files)
4. Modal/dialog components with open/closed states (8+ files)

**Action**:
1. Search for `class:` directive usage
2. Convert to `class={{}}` object syntax
3. Test conditional rendering works
4. Verify with `svelte-check`

---

### 3. TypeScript Best Practices for Props (Priority 3)
**Per Svelte MCP**: Use `ClassValue` type from `svelte/elements` for flexible class props.

#### Component Wrapper Pattern:
```typescript
<script lang="ts">
  import type { ClassValue } from 'svelte/elements';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    class?: ClassValue;
    children?: any;
  }

  let { 
    variant = 'primary', 
    size = 'md',
    class: className,
    children,
    ...rest 
  }: Props = $props();

  const buttonClass = $derived([
    'btn-base',
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-ghost': variant === 'ghost',
      'text-sm px-3 py-1.5': size === 'sm',
      'text-base px-5 py-2': size === 'md',
      'text-lg px-6 py-3': size === 'lg'
    },
    className
  ]);
</script>

<button {...rest} class={buttonClass}>
  {@render children?.()}
</button>
```

**Files to create/refactor**:
1. `Button.svelte` - Universal button component
2. `Card.svelte` - Universal card component  
3. `Input.svelte` - Universal input component
4. `Badge.svelte` - Universal badge component

---

### 4. Touch Target Audit (Priority 4)
**Per Mobile UX standards**: Minimum 44x44px touch targets on mobile.

**Files to audit**:
```bash
# Search for small interactive elements:
grep -r "h-8\|w-8\|h-9\|w-9\|h-10\|w-10" packages/ui/src/components/
```

**Upgrade pattern**:
```typescript
// BEFORE:
<button class="h-9 w-9 rounded-lg"> // 36x36px - too small!

// AFTER:
<button class="h-11 w-11 rounded-lg sm:h-9 sm:w-9"> // 44x44px mobile, 36x36px desktop
```

**Critical files**:
- IconButton components
- Close/dismiss buttons in modals
- Filter/sort dropdown toggles
- Pagination controls
- Social share buttons

---

### 5. Design Token Expansion (Priority 5)
**Add missing semantic tokens** based on Phase 2 patterns found:

```css
/* packages/ui/src/styles/tokens-v4/semantic.css */

/* Surface tokens (for cards, panels, inputs) */
@theme {
  --surface-card: var(--color-white);
  --surface-card-hover: var(--color-gray-50);
  --surface-input: var(--color-white);
  --surface-overlay: rgba(0, 0, 0, 0.5);
}

/* Border tokens */
@theme {
  --border-primary: var(--color-gray-300);
  --border-subtle: var(--color-gray-200);
  --border-input: var(--color-gray-300);
  --border-focus-ring: rgba(59, 130, 246, 0.2);
}

/* Text tokens */
@theme {
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --text-tertiary: var(--color-gray-500);
  --text-placeholder: var(--color-gray-400);
}

/* State tokens */
@theme {
  --state-hover-subtle: var(--color-gray-100);
  --state-active: var(--color-blue-100);
  --state-disabled-bg: var(--color-gray-100);
  --state-disabled-text: var(--color-gray-400);
}

/* Status ring tokens (for focus states) */
@theme {
  --status-error-ring: rgba(239, 68, 68, 0.2);
  --status-success-ring: rgba(34, 197, 94, 0.2);
  --status-warning-ring: rgba(234, 179, 8, 0.2);
}
```

---

## Execution Checklist

### Step 1: Button Pattern Consolidation
- [ ] `grep_search` for button class patterns in `packages/ui/src/components`
- [ ] Identify 3-5 most common button patterns
- [ ] Define `@utility btn-primary`, `btn-secondary`, `btn-ghost` in `components.css`
- [ ] Replace all button class strings with single utility classes
- [ ] Test button hover/focus states
- [ ] Run `get_errors` verification

### Step 2: Card Pattern Consolidation
- [ ] `grep_search` for card/panel class patterns
- [ ] Define `@utility card` and `@utility card-interactive`
- [ ] Replace repeated card patterns
- [ ] Test hover states
- [ ] Run `get_errors` verification

### Step 3: Form Input Pattern Consolidation
- [ ] `grep_search` for input class patterns
- [ ] Define `@utility input-base` and `@utility input-error`
- [ ] Replace repeated input patterns
- [ ] Test focus/error states
- [ ] Run `get_errors` verification

### Step 4: Convert to `class={{}}` Syntax
- [ ] Search for `class:` directive usage with `grep_search`
- [ ] Convert button components to `class={{}}` objects
- [ ] Convert card components to `class={{}}` objects
- [ ] Convert input components to `class={{}}` objects
- [ ] Convert modal components to `class={{}}` objects
- [ ] Test all conditional class rendering
- [ ] Run `svelte-check`

### Step 5: TypeScript Prop Types
- [ ] Create `Button.svelte` with `ClassValue` type
- [ ] Create `Card.svelte` with `ClassValue` type
- [ ] Create `Input.svelte` with `ClassValue` type
- [ ] Create `Badge.svelte` with `ClassValue` type
- [ ] Update existing components to use new base components
- [ ] Run `get_errors` verification

### Step 6: Touch Target Audit
- [ ] `grep_search` for small interactive elements (`h-8`, `h-9`, `h-10`)
- [ ] Upgrade IconButton components to 44x44px mobile
- [ ] Upgrade close/dismiss buttons to 44x44px mobile
- [ ] Upgrade filter toggles to 44x44px mobile
- [ ] Test on mobile viewport
- [ ] Run accessibility audit

### Step 7: Design Token Expansion
- [ ] Add surface tokens to `semantic.css`
- [ ] Add border tokens to `semantic.css`
- [ ] Add text tokens to `semantic.css`
- [ ] Add state tokens to `semantic.css`
- [ ] Add status ring tokens to `semantic.css`
- [ ] Replace hardcoded values with new tokens
- [ ] Run `get_errors` verification

### Step 8: Production Build Verification
- [ ] Run `pnpm --filter web run check` (Svelte type check)
- [ ] Run `pnpm build` (full production build)
- [ ] Verify no CSS variable resolution errors
- [ ] Test critical user flows in built app
- [ ] Check bundle size impact

---

## Best Practices Checklist

### Tailwind CSS v4 Best Practices (Context7 MCP)
- ✅ Use `@utility` for repeated component patterns (NOT `@layer components`)
- ✅ Use `@theme` for all design tokens (colors, spacing, etc.)
- ✅ Leverage Lightning CSS with literal breakpoint values
- ✅ Support variants with `@media (hover: hover)` for hover states
- ✅ Use CSS custom properties (`var(--token)`) for all theming
- ✅ Avoid `@apply` in component files - extract to `@utility` instead
- ✅ Use `@reference` in component `<style>` tags if needed

### Svelte 5 Best Practices (Svelte MCP)
- ✅ Use `class={{}}` object syntax over `class:` directive (5.16+)
- ✅ Use arrays for combining local/prop classes: `class={['base', props.class]}`
- ✅ Use `ClassValue` type from `svelte/elements` for flexible props
- ✅ Use `$derived` for computed class values
- ✅ Use `HTMLButtonAttributes` etc. for wrapper components
- ✅ Support `...rest` props spreading for flexibility
- ✅ Use `{@render children?.()}` for slot content

### TypeScript Best Practices
- ✅ Annotate all component props with types
- ✅ Use `interface Props` pattern for clarity
- ✅ Import types from `svelte/elements` for DOM elements
- ✅ Use `ClassValue` for flexible class props
- ✅ Enable `isolatedModules`, `verbatimModuleSyntax`, `target: ES2015`
- ✅ Run `svelte-check` for type verification

### Performance Best Practices
- ✅ Define utilities once, reuse everywhere
- ✅ Minimize class string duplication
- ✅ Use semantic tokens for consistent theming
- ✅ Leverage Lightning CSS for optimized output
- ✅ Test production bundle size impact

---

## Success Criteria

Phase 3 is **100% complete** when:

1. **Pattern Consolidation**: 3+ `@utility` definitions in `components.css` covering buttons, cards, inputs
2. **Class Syntax**: All conditional classes use `class={{}}` object syntax (no `class:` directives)
3. **TypeScript**: All reusable components have proper `ClassValue` types
4. **Touch Targets**: All interactive elements ≥44x44px on mobile viewports
5. **Design Tokens**: Expanded semantic token system with surface/border/text/state/ring tokens
6. **Zero Errors**: `pnpm --filter web run check` passes with no errors
7. **Production Build**: `pnpm build` succeeds with no CSS resolution errors
8. **Verified**: All critical user flows tested in built app

---

## Command Reference

```bash
# Search for patterns
grep -r "class:disabled" packages/ui/src/components/
grep -r "h-8\|h-9\|h-10" packages/ui/src/components/

# Type checking
pnpm --filter web run check

# Production build
pnpm build

# Dev server
pnpm dev
```

---

## Notes for Agent Execution

1. **Work Systematically**: Complete each step in order (buttons → cards → inputs → class syntax → types → touch targets → tokens)
2. **Verify After Each Step**: Run `get_errors` after major changes
3. **No Documentation**: Don't create docs unless explicitly requested - just execute
4. **Use Parallel Tools**: Call multiple `replace_string_in_file` operations in parallel when editing multiple files
5. **Real Values Only**: No placeholders - use actual grep results to guide refactoring
6. **Test Conditional Logic**: Verify `class={{}}` syntax works with state changes
7. **Lightning CSS Constraints**: Remember media queries need literal values, not CSS variables

**Agent: Execute Phase 3 to 100% completion following this plan. Start with Step 1 (Button Pattern Consolidation).**
