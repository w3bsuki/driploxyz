# Driplo Styling Guide (Tailwind v4 + Tokens)

**Audience:** Claude Code — Complete reference for production-quality styling  
**Scope:** Svelte 5 + SvelteKit 2 apps (`apps/web`, `apps/admin`) + UI package (`packages/ui`)  
**Goal:** Single source of truth for colors, spacing, typography with zero technical debt

---

## 🚀 Quick Reference

### Decision Tree: Which Token To Use?

```
Need color for...
├─ Brand actions (CTA, primary buttons) → `bg-primary text-white`
├─ Text content
│  ├─ Headlines, body text → `text-[color:var(--text-primary)]`
│  ├─ Captions, meta info → `text-[color:var(--text-secondary)]`
│  ├─ Disabled/placeholder → `text-[color:var(--text-muted)]`
│  └─ Links → `text-[color:var(--text-link)]`
├─ Backgrounds & Surfaces
│  ├─ Page/card background → `bg-[color:var(--surface-base)]`
│  ├─ Subtle section → `bg-[color:var(--surface-subtle)]`
│  └─ Hover states → `bg-[color:var(--surface-muted)]`
├─ Borders & Dividers
│  ├─ Card borders → `border-[color:var(--border-subtle)]`
│  ├─ Input borders → `border-[color:var(--border-default)]`
│  └─ Strong dividers → `border-[color:var(--border-emphasis)]`
├─ Status & Feedback
│  ├─ Success → `bg-[color:var(--status-success-bg)]`
│  ├─ Error → `bg-[color:var(--status-error-bg)]`
│  ├─ Warning → `bg-[color:var(--status-warning-bg)]`
│  └─ Info → `bg-[color:var(--status-info-bg)]`
└─ Still unsure? → Use Tailwind mapped colors: `bg-gray-100`, `text-blue-600`
```

### Emergency Fixes (Copy-Paste)

**Remove hardcoded colors:**
```bash
# Find hardcoded colors
rg "#[0-9a-fA-F]{3,8}|oklch\(|rgb\(" packages/ui/src apps/*/src --type svelte

# Replace common patterns
bg-blue-600 → bg-primary
hover:bg-blue-700 → hover:bg-[color:var(--primary-600)]
text-gray-500 → text-[color:var(--text-muted)]
border-red-200 → border-[color:var(--status-error-border)]
```

**Fix missing focus rings:**
```svelte
<!-- Add to all interactive elements -->
class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
```

**Fix touch targets:**
```svelte
<!-- Ensure minimum 44px for primary actions -->
class="min-h-[var(--touch-primary)]"
<!-- 36px for secondary actions -->
class="min-h-[var(--touch-standard)]"
```

### QA Checklist ✅
- [ ] No raw hex/OKLCH/RGB colors in component code
- [ ] Brand actions use `bg-primary` pattern
- [ ] All interactive elements have focus rings
- [ ] Touch targets meet 44px (primary) / 36px (standard) minimums  
- [ ] Status colors use semantic tokens (`--status-*-bg/border/text`)
- [ ] No `!important` overrides (restructure CSS instead)
- [ ] Components work in dark mode (rely on token overrides)

---

## 📋 Implementation Workflow

### Creating a New Component

**1. Choose Base Pattern**
```svelte
<!-- Button component -->
<button 
  class="btn btn-primary min-h-[var(--touch-primary)] px-4 rounded-md font-medium 
         bg-primary text-white hover:bg-[color:var(--primary-600)] 
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
         disabled:opacity-50"
>
  {children}
</button>

<!-- Input component -->
<input 
  class="input w-full min-h-[var(--touch-primary)] px-3 rounded-md 
         bg-[color:var(--surface-base)] text-[color:var(--text-primary)] 
         border border-[color:var(--border-default)]
         focus:ring-2 focus:ring-[color:var(--state-focus)] focus:border-[color:var(--state-focus)]"
/>

<!-- Card component -->
<div 
  class="card bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] 
         rounded-lg p-4"
>
  {children}
</div>
```

**2. Apply Token Selection (Use Decision Tree Above)**
- Brand/primary actions → `bg-primary`
- Text content → `text-[color:var(--text-primary|secondary|muted)]`
- Surfaces → `bg-[color:var(--surface-base|subtle|muted)]`
- Status/feedback → `bg-[color:var(--status-success-bg)]`

**3. Add Required Accessibility**
- Focus rings on all interactive: `focus-visible:ring-2 focus-visible:ring-primary`
- Touch targets: `min-h-[var(--touch-primary)]` (44px) or `min-h-[var(--touch-standard)]` (36px)
- Hover states only on hover-capable devices: `@media (hover: hover)`

**4. Test Checklist**
- [ ] Works in light and dark mode
- [ ] Focus ring visible on keyboard navigation
- [ ] Touch targets meet minimum sizes
- [ ] No hardcoded colors

### Refactoring Existing Components

**Step 1: Audit Current Colors**
```bash
# Find hardcoded colors in component
rg "#[0-9a-fA-F]{3,8}|oklch\(|rgb\(" path/to/component.svelte

# Find likely brand hardcodes
rg "bg-\(blue\|indigo\|black\)\|ring-\(blue\|black\)\|text-\(blue\|black\)" path/to/component.svelte
```

**Step 2: Replace Using Mapping**
```
BEFORE → AFTER
bg-blue-600 → bg-primary
hover:bg-blue-700 → hover:bg-[color:var(--primary-600)]
text-gray-500 (for muted text) → text-[color:var(--text-muted)]
bg-red-50 border-red-200 text-red-700 → bg-[color:var(--status-error-bg)] border-[color:var(--status-error-border)] text-[color:var(--status-error-text)]
```

**Step 3: Add Missing Accessibility**
```svelte
<!-- Add focus rings -->
class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"

<!-- Ensure touch targets -->
class="min-h-[var(--touch-primary)]"  <!-- 44px for primary actions -->
class="min-h-[var(--touch-standard)]" <!-- 36px for secondary actions -->
```

**Step 4: Validate** (see Validation section below)

---

## 🎨 Component Patterns

### Button System
```svelte
<!-- Primary (Brand Actions) -->
<button class="btn bg-primary text-white hover:bg-[color:var(--primary-600)] 
               focus-visible:ring-2 focus-visible:ring-primary 
               min-h-[var(--touch-primary)] px-6 rounded-md font-medium">
  Buy Now
</button>

<!-- Secondary (Supporting Actions) -->
<button class="btn bg-[color:var(--surface-muted)] text-[color:var(--text-primary)] 
               border border-[color:var(--border-default)]
               hover:bg-[color:var(--surface-emphasis)]
               focus-visible:ring-2 focus-visible:ring-primary 
               min-h-[var(--touch-standard)] px-4 rounded-md font-medium">
  Cancel
</button>

<!-- Ghost (Subtle Actions) -->
<button class="btn bg-transparent text-[color:var(--text-secondary)]
               hover:bg-[color:var(--surface-muted)]
               focus-visible:ring-2 focus-visible:ring-primary 
               min-h-[var(--touch-standard)] px-3 rounded-md font-medium">
  Skip
</button>
```

### Input System
```svelte
<!-- Standard Input -->
<input class="input w-full min-h-[var(--touch-primary)] px-3 rounded-md 
              bg-[color:var(--surface-base)] text-[color:var(--text-primary)]
              border border-[color:var(--border-default)]
              focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)]
              placeholder:text-[color:var(--text-muted)]
              disabled:bg-[color:var(--surface-muted)] disabled:text-[color:var(--text-disabled)]"
       placeholder="Enter text..." />

<!-- Error State -->
<input class="input [--state-focus:var(--status-error-solid)] 
              border-[color:var(--status-error-border)]
              focus:ring-[color:var(--status-error-solid)]"
       aria-invalid="true" />
```

### Status & Feedback
```svelte
<!-- Success Badge -->
<span class="badge bg-[color:var(--status-success-bg)] 
             text-[color:var(--status-success-text)]
             border border-[color:var(--status-success-border)]
             px-2 py-1 rounded-full text-xs font-medium">
  ✓ Available
</span>

<!-- Error Banner -->
<div class="banner bg-[color:var(--status-error-bg)] 
            border border-[color:var(--status-error-border)]
            text-[color:var(--status-error-text)]
            p-4 rounded-md">
  <p class="font-medium">Error</p>
  <p class="text-sm">Something went wrong. Please try again.</p>
</div>
```

### Cards & Surfaces
```svelte
<!-- Basic Card -->
<div class="card bg-[color:var(--surface-base)] 
            border border-[color:var(--border-subtle)]
            rounded-lg p-4">
  {children}
</div>

<!-- Interactive Card (hover effects) -->
<div class="card hover:border-[color:var(--border-default)]
            hover:shadow-md transition-all duration-200
            focus-within:ring-2 focus-within:ring-primary">
  {children}
</div>

<!-- Elevated Card -->
<div class="card bg-[color:var(--surface-base)]
            border border-[color:var(--border-subtle)]
            rounded-lg p-6 shadow-sm">
  {children}
</div>
```

---

## ✅ Validation & Testing

### Automated Validation

**1. Color Audit Commands**
```bash
# Find all hardcoded colors (should return minimal results)
rg "#[0-9a-fA-F]{3,8}|oklch\(|rgb\(" packages/ui/src apps/*/src --type svelte

# Find likely brand hardcodes that need replacing
rg "bg-\(blue\|indigo\|black\)\|ring-\(blue\|black\)\|text-\(blue\|black\)" packages/ui/src apps/*/src --type svelte

# Check for missing focus rings (interactive elements without focus styles)
rg "onclick|button|input|select|textarea" packages/ui/src apps/*/src --type svelte | rg -v "focus"
```

**2. Build Validation**
```bash
# Ensure no TypeScript errors after changes
pnpm -w turbo run check-types

# Lint for code quality
pnpm -w turbo run lint  

# Build to catch runtime issues
pnpm --filter web build
pnpm --filter admin build
```

**3. Visual Testing Checklist**
- [ ] Components render correctly in light mode
- [ ] Components render correctly in dark mode  
- [ ] Focus rings visible on keyboard navigation (Tab through)
- [ ] Touch targets are at least 44px for primary, 36px for secondary
- [ ] Text contrast meets WCAG AA standards
- [ ] No layout shift when switching color modes

### Manual Testing Workflow

**1. Cross-Browser Check**
- Chrome (desktop + mobile emulation)
- Safari (desktop + iOS if possible)
- Firefox (to catch CSS edge cases)

**2. Accessibility Testing**
```bash
# Use axe-core for automated accessibility checks
pnpm --filter web test:a11y  # if you have this set up

# Manual keyboard navigation test:
# - Tab through all interactive elements
# - Focus ring should be clearly visible
# - No elements should be unreachable
```

**3. Performance Impact**
- Check bundle size impact of token changes
- Verify no new layout shifts introduced
- Test touch target sizes on actual mobile devices

---

## 🚨 Troubleshooting

### Common Issues & Solutions

**Issue: "Focus ring not visible"**
```svelte
<!-- Problem: Missing focus styles -->
<button class="bg-primary text-white">Click me</button>

<!-- Solution: Add focus ring -->  
<button class="bg-primary text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
  Click me
</button>
```

**Issue: "Colors look wrong in dark mode"**
```svelte
<!-- Problem: Using fixed colors -->
<div class="bg-white text-black">Content</div>

<!-- Solution: Use semantic tokens -->
<div class="bg-[color:var(--surface-base)] text-[color:var(--text-primary)]">Content</div>
```

**Issue: "Touch targets too small on mobile"**
```svelte
<!-- Problem: Small touch target -->
<button class="px-2 py-1">Tap</button>

<!-- Solution: Use minimum touch targets -->
<button class="min-h-[var(--touch-primary)] px-6 py-3">Tap</button>
```

**Issue: "Button color inconsistent across components"**
```svelte
<!-- Problem: Hardcoded brand colors -->
<button class="bg-blue-600 hover:bg-blue-700">Save</button>

<!-- Solution: Use semantic brand tokens -->
<button class="bg-primary hover:bg-[color:var(--primary-600)]">Save</button>
```

### Debug Workflows

**1. Token Not Working?**
```bash
# Check if token exists in tokens.css
grep "your-token-name" packages/ui/src/styles/tokens.css

# Check if semantic.css is loaded (look for side effect import)
grep "semantic.css" packages/ui/src/lib/index.ts

# Check browser DevTools for CSS variable resolution
# Open element inspector, check computed styles for --your-token
```

**2. Dark Mode Issues?**
```bash
# Verify dark mode tokens are defined
grep "@media (prefers-color-scheme: dark)" packages/ui/src/styles/tokens.css

# Test dark mode manually
# DevTools → Rendering → Emulate CSS media → prefers-color-scheme: dark
```

**3. Component Not Following Design System?**
- Check if component uses `@repo/ui` patterns
- Audit for hardcoded colors using search commands above  
- Verify semantic tokens are used instead of raw colors
- Test keyboard navigation and focus states

### Emergency Fixes

**Quick fix for broken focus:**
```svelte
class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
```

**Quick fix for dark mode:**
```svelte
<!-- Replace hardcoded backgrounds -->
bg-white → bg-[color:var(--surface-base)]
bg-gray-50 → bg-[color:var(--surface-subtle)]
text-black → text-[color:var(--text-primary)]
text-gray-500 → text-[color:var(--text-muted)]
```

---

## 🔧 Maintenance Guide

### Adding New Semantic Tokens

**When to add new tokens:**
- You need the same color/value in 3+ components
- The value has semantic meaning (not just decoration)
- It needs dark mode override capability

**How to add new tokens:**

1. **Add to `packages/ui/src/styles/tokens.css`**
```css
/* Add in appropriate semantic section */
--new-semantic-name: var(--appropriate-base-color);
```

2. **Add dark mode override if needed**
```css
@media (prefers-color-scheme: dark) {
  @theme {
    --new-semantic-name: var(--appropriate-dark-color);
  }
}
```

3. **Add Tailwind mapping if needed (in app.css)**
```css
@theme {
  --color-new-semantic: var(--new-semantic-name);
}
```

4. **Update this guide** with new token in Quick Reference section

**Example: Adding a new status token**
```css
/* In tokens.css */
--status-pending-bg: var(--yellow-50);
--status-pending-border: var(--yellow-200);
--status-pending-text: var(--yellow-800);

/* Dark mode override */
@media (prefers-color-scheme: dark) {
  @theme {
    --status-pending-text: var(--yellow-200);
  }
}
```

### Extending Component Patterns

**Adding new component patterns:**
1. Follow existing semantic token structure
2. Ensure accessibility (focus rings, touch targets)
3. Test in both light and dark modes
4. Add to Component Patterns section of this guide
5. Create example in `@repo/ui` if reusable

### System Health Checks

**Monthly audit:**
```bash
# Check for token drift (hardcoded colors creeping back)
rg "#[0-9a-fA-F]{3,8}" packages/ui/src apps/*/src --type svelte

# Audit component consistency
rg "bg-primary" packages/ui/src apps/*/src --type svelte | wc -l
# vs
rg "bg-blue-" packages/ui/src apps/*/src --type svelte | wc -l
# Second number should be 0 or very small
```

**Performance monitoring:**
- Monitor CSS bundle size after token changes
- Check for unused tokens (can be cleaned up)
- Verify no layout shift regressions

---

## 📚 Technical Reference

### Architecture Overview

**Token Hierarchy:**
```
Raw Tokens (--blue-500, --gray-100, etc.)
    ↓
Semantic Tokens (--text-primary, --surface-base, etc.)
    ↓  
Alias Tokens (--primary, --success, etc.) [for backward compatibility]
    ↓
Tailwind Mappings (--color-primary, --color-success, etc.)
    ↓
Component Usage
```

**File Structure:**
```
packages/ui/src/styles/
├── tokens.css          # All design tokens + dark mode
└── semantic.css        # Component-specific styles (deprecated, being moved to Tailwind classes)

apps/*/src/
└── app.css            # Tailwind v4 setup + token mappings
```

### Technical Implementation Details

**Tailwind v4 Setup:**
```css
@reference;
@import 'tailwindcss';
@import '../../../packages/ui/src/styles/tokens.css';
@plugin '@tailwindcss/forms';

@source '../../../packages/ui/src/**/*.{html,js,svelte,ts}';

@theme {
  --color-primary: var(--brand-primary);
  --color-gray-500: var(--gray-500);
  /* etc... */
}
```

**Token Categories:**
- **Raw**: `--gray-500`, `--blue-600` (OKLCH colors)
- **Semantic**: `--text-primary`, `--surface-base` (purpose-based)
- **Component**: `--btn-height-lg`, `--card-padding-md` (component-specific)
- **Aliases**: `--primary`, `--success` (backward compatibility)

### Advanced Patterns

**Conditional tokens:**
```svelte
<!-- Dynamic status colors -->
<div class="badge" style="--badge-bg: var(--status-{status}-bg)">
  {statusText}
</div>
```

**Component token overrides:**
```svelte
<!-- Override default button radius -->
<button class="btn" style="--btn-radius: var(--radius-full)">
  Rounded Button
</button>
```

### Performance Guidelines

**Do:**
- Use CSS custom properties for reusable values
- Rely on browser's CSS variable caching
- Use semantic tokens over raw colors
- Keep token nesting under 3 levels

**Don't:**
- Create tokens for single-use values
- Override tokens with `!important`  
- Use inline styles instead of classes
- Create circular token dependencies

---

## 🎯 Summary

This guide prioritizes practical, debt-free implementation:
- **Quick Reference** for immediate decisions  
- **Implementation Workflow** for systematic work
- **Validation & Testing** to ensure quality
- **Troubleshooting** for rapid issue resolution
- **Maintenance** for long-term sustainability

**Key principles:** Semantic tokens, accessibility-first, mobile-optimized, performance-conscious, maintainable.

## ✅ Recent Implementation (Completed)

**Color System Debt Cleanup:**
- ✅ Fixed `PricingCard.svelte` - replaced 16+ hardcoded colors with semantic tokens
- ✅ Updated semantic token usage patterns: `bg-[color:var(--surface-base)]`, `text-[color:var(--text-primary)]`
- ✅ Fixed TypeScript errors in utility functions (`variants.ts`)

**Component UX Improvements:**
- ✅ **FavoriteButton redesign** - Streamlined from over-designed to clean minimal:
  ```svelte
  <!-- Before: Chunky with excessive styling -->
  class="group flex items-center gap-1 px-2 py-1.5 min-h-[var(--touch-standard)] bg-[color:var(--surface-base)]/95 md:backdrop-blur-sm rounded-full hover:bg-[color:var(--surface-base)] ... border border-[color:var(--border-subtle)]/50"
  
  <!-- After: Clean and integrated -->
  class="group flex items-center gap-1 p-1.5 bg-[color:var(--surface-base)]/90 hover:bg-[color:var(--surface-base)] rounded-lg ... hover:scale-105 active:scale-95"
  ```

**Animation/Behavior Cleanup:**
- ✅ Removed global `overscroll-behavior: contain` - applied only where needed
- ✅ Simplified over-engineered animations (complex scale transforms → simple fade-ins)
- ✅ Maintained genuinely useful UX animations (heart pulse on favorite)

**Quality Validation:**
- ✅ Zero critical TypeScript errors
- ✅ Clean Svelte 5 + SvelteKit 2 implementation maintained
- ✅ No feature creep or unnecessary dependencies added

For questions or edge cases not covered, consult the team or extend this guide.

---

## Guardrails & Enforcement (Do/Don’t)

- Do: Use semantic tokens via CSS variables everywhere (`text-[color:var(--text-*)]`, `bg-[color:var(--surface-*)]`).
- Do: Keep interaction states accessible (`focus-visible:ring-2`, `ring-offset-2`).
- Do: Keep touch targets ≥ 44px (primary) / 36px (secondary).
- Do: Prefer CSS `position: sticky`, `overscroll-behavior`, and `scroll-snap` for scrolling UI.
- Don’t: Hardcode colors (hex, rgb, oklch) in components.
- Don’t: Use `!important` — restructure styles instead.
- Don’t: Declare component‑local copies of shared utilities (e.g., `.scrollbar-hide`).

Enforcement commands
```bash
# 1) Fail on raw colors in Svelte/TS/JS
rg "#[0-9a-fA-F]{3,8}|oklch\(|rgb\(" packages/ui/src apps/*/src --type svelte --type-add 'ts:*.ts' --type-add 'js:*.js' --hidden --line-number

# 2) Find duplicate scrollbar utilities to remove
rg ".scrollbar-hide" packages/ui/src apps/*/src --type svelte --line-number
```

---

## Utilities & Scrolling (Unified)

- Single source for scrollbar hiding:
  - App utility exists in `apps/web/src/app.css` (`@utility scrollbar-hide`).
  - UI package should expose a single utility in `packages/ui/src/styles/semantic.css` when needed by library components.
- Don’t redefine `.scrollbar-hide` in components. Use the shared utility class instead.
- Default scroll behavior should be `auto` (never force `smooth` globally). Honor `prefers-reduced-motion`.
- For infinite lists and carousels: prefer `IntersectionObserver` sentinels and CSS snap; avoid per‑scroll JS math where possible.

Checklist
- [ ] No local `.scrollbar-hide` style blocks in components
- [ ] No default `scroll-behavior: smooth` on base lists/primitives
- [ ] Use `overscroll-behavior` thoughtfully to prevent scroll chaining only where needed

---

## Svelte 5 Patterns (Styling‑Relevant)

- Build classes with data‑driven state, avoid inline style strings when token utilities exist.
- Use `class:` directives for boolean state toggles (e.g., `class:favorited={isFav}`).
- For evented visual updates, prefer `on:scroll|passive` and CSS for visuals over JS loops.
- Keep presentational constants close to components but route all colors through tokens.

Example
```svelte
<button
  class="btn min-h-[var(--touch-standard)]
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
         text-[color:var(--text-primary)] bg-[color:var(--surface-base)]
         hover:bg-[color:var(--surface-muted)]"
  class:opacity-50={disabled}
  disabled={disabled}
>
  Save
</button>
```

---

## Token Primer (Naming & Mapping)

- Brand: `--brand-primary` → Tailwind alias: `--color-primary` → utility `bg-primary`, `text-primary`.
- Text: `--text-primary|secondary|muted|inverse` → `text-[color:var(--text-…)]`.
- Surfaces: `--surface-base|subtle|muted|inverse` → `bg-[color:var(--surface-…)]`.
- Borders: `--border-subtle|default|emphasis` → `border-[color:var(--border-…)]`.
- Status: `--status-*-bg|border|text|solid` → use the semantic variant (not raw hues).
- Motion: provide `prefers-reduced-motion` fallbacks for transitions.

Adding a new token
1) Define in `packages/ui/src/styles/tokens.css` (light + dark if applicable).
2) Map to Tailwind alias in app CSS theme block as needed.
3) Use only via semantic utilities in components.

---

## Additional TODOs (Actionable Backlog)

High‑impact
- [ ] Remove all component‑local `.scrollbar-hide` definitions; use the shared utility.
- [ ] Eliminate default `scroll-behavior: smooth` from primitives (tabs/lists); add reduced‑motion guards.
- [ ] Audit all components for hardcoded colors → replace with tokens.
- [ ] Ensure every control has `focus-visible` rings and meets touch size minima.

Targeted cleanups
- [ ] Tabs: ensure horizontal scroll uses shared `.scrollbar-hide`; remove default smooth scrolling.
- [ ] Favorite buttons/badges: ensure text and backgrounds use status tokens, not fixed reds.
- [ ] Cards/Sheets: surfaces and borders use `--surface-*` and `--border-*` tokens consistently.
- [ ] Toast/Tooltip/Dialog: verify dark mode tokens and ring/focus states.

Automation
- [ ] Add a CI check that fails on raw color usage in component code.
- [ ] Add a stylelint/Tailwind lint rule (or script) to warn on `!important` and local `.scrollbar-hide`.
