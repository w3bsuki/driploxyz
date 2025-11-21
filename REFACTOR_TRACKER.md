# Refactor Execution Tracker

**Started**: October 16, 2025 (Updated with v4.1.x Best Practices)  
**Status**: 🟡 In Progress  
**Branch**: `refactor/tailwind-v4-cleanup`  
**Standards**: `@theme` directive, `@utility` components, Svelte 5 clsx pattern, Vite plugin optimization

---

## Phase 1: Nuclear Cleanup ✅ / 🔄 / ❌

### 1.1 Delete Old Token System
- [ ] Backup current codebase (`git checkout -b refactor/tailwind-v4-cleanup`)
- [ ] Delete `/packages/ui/src/styles/tokens/` directory (OLD v3 with `@layer`)
- [ ] Verify no imports reference old path (search for `@import.*tokens/`)
- [ ] Remove any `@layer components` usage (v3 pattern)
- [ ] Test build: `pnpm build`

### 1.2 Fix Semantic Tokens (Neutral States - CRITICAL)
- [ ] Open `packages/ui/src/styles/tokens-v4/semantic.css`
- [ ] Change `--state-hover` from `oklch(0.98 0.015 245 / 0.3)` to `oklch(0 0 0 / 0.04)` (remove blue tint!)
- [ ] Change `--state-active` from blue-tinted to `oklch(0 0 0 / 0.08)` (pure neutral grey)
- [ ] Verify `--state-focus` uses brand color (indigo OK for focused states)
- [ ] Remove any other blue tints from neutral interaction states
- [ ] Test: `pnpm dev` compiles without errors

### 1.3 Update Component Tokens (v4 `@theme` + `@utility`)
- [ ] Open `packages/ui/src/styles/tokens-v4/components.css`
- [ ] Add navigation tokens in `@theme {}` block
- [ ] Add mobile menu tokens
- [ ] Add button tokens (primary, secondary, ghost)
- [ ] Add card tokens (bg, border, hover shadow)
- [ ] Create `@utility btn-base` for reusable button styles
- [ ] Create `@utility btn-primary`, `@utility btn-ghost` using tokens

### 1.4 Verify Vite Configuration
- [ ] Check `vite.config.ts` has `tailwindcss()` plugin BEFORE `sveltekit()`
- [ ] Verify `css.transformer: 'lightningcss'` is set (v4 performance best practice)
- [ ] Verify `css.lightningcss.drafts.customMedia: true` for breakpoints
- [ ] Test HMR works: Change token value and verify instant browser update

### 1.5 Verify Import Chain
- [ ] Check `apps/web/src/app.css` uses `@import 'tailwindcss'` (v4 pattern)
- [ ] Verify imports v4 tokens: `@import '@repo/ui/styles/tokens-v4/tokens.css'`
- [ ] Remove any old token imports (grep for `tokens/` without `v4`)
- [ ] Verify `@source` paths point to all Svelte components
- [ ] Test compilation: `pnpm build`

**Phase 1 Complete**: ✅ / ❌

---

## Phase 2: Component Surgery (Svelte 5 Patterns) ✅ / 🔄 / ❌

### Priority 1: Navigation (Critical)

#### MobileNavigationDialog.svelte
- [ ] Convert to Svelte 5 `$props()` for reactive props
- [ ] Use `class={{}}` object pattern for conditional styles
- [ ] Verify backgrounds: `bg-[color:var(--mobile-menu-bg)]`
- [ ] Fix category buttons: `hover:bg-[color:var(--nav-item-hover)]` (neutral!)
- [ ] Fix profile section: Verify `bg-[color:var(--surface-subtle)]` is correct
- [ ] Ensure 44px touch targets: `min-h-[var(--touch-primary)]`
- [ ] Test mobile menu functionality on real device
- [ ] Visual QA: No blue tints, proper neutral hover states

#### HeaderUserMenu.svelte
- [ ] Remove excessive `bg-transparent` repetition (4x on same element is bad)
- [ ] Use class array: `class={['p-0 bg-transparent', 'hover:bg-[color:var(--state-hover)]', ...]}`
- [ ] Add proper hover state with neutral overlay
- [ ] Add focus ring: `focus:ring-2 focus:ring-[color:var(--color-indigo-500)]`
- [ ] Ensure 44px touch target
- [ ] Test dropdown functionality
- [ ] Visual QA: Neutral hover, proper focus state

#### Search Components (5 files) - Apply Consistently
- [ ] **SearchFeedback.svelte**: Replace `hover:bg-blue-700` with `hover:bg-[color:var(--button-primary-hover)]`
- [ ] **LazySearchResults.svelte**: Same pattern - find/replace blue buttons
- [ ] **SearchInput.svelte**: Verify transparent inputs are intentional (search bar should be solid)
- [ ] CategorySearchBar.svelte: Fix hover states
- [ ] SearchPageSearchBar.svelte: Fix hover states

### Priority 2: Buttons & Cards

#### FollowButton.svelte
- [ ] Replace `hover:bg-blue-700`
- [ ] Use `--button-primary-hover` token
- [ ] Test both states (follow/unfollow)

#### ProductCard Components
- [ ] ProductCard.svelte: Fix transparent bg
- [ ] ProductCardNew.svelte: Fix transparent bg
- [ ] Test hover effects
- [ ] Verify image placeholders

### Priority 3: Modals & Misc

#### Modal Components
- [ ] OnboardingSuccessModal.svelte: Fix blue button
- [ ] UnifiedCookieConsent.svelte: Fix blue buttons
- [ ] ErrorStates.svelte: Fix blue button

#### Other Components
- [ ] CategoryPill.svelte: Verify outline variant
- [ ] Accordion.svelte: Fix transparent borders
- [ ] ImageUploaderSupabase.svelte: Fix blue button

**Phase 2 Complete**: ✅ / ❌

---

## Phase 3: Polish & Dark Mode ✅ / 🔄 / ❌

### 3.1 Dark Mode Implementation
- [ ] Update `dark-theme.css` with correct overrides
- [ ] Test all components in dark mode
- [ ] Verify contrast ratios (WCAG AA)
- [ ] Test neutral hovers in dark mode

### 3.2 Documentation
- [ ] Update `DESIGN_TOKENS.md`
- [ ] Document migration from v3 to v4
- [ ] Add usage examples
- [ ] Create component guidelines

### 3.3 Final Testing
- [ ] Mobile menu (light mode)
- [ ] Mobile menu (dark mode)
- [ ] All buttons (light mode)
- [ ] All buttons (dark mode)
- [ ] Product cards
- [ ] Forms & inputs
- [ ] Modals & overlays
- [ ] Touch target sizes (44px)

### 3.4 Before/After Screenshots
- [ ] Mobile navigation (before)
- [ ] Mobile navigation (after)
- [ ] Buttons (before)
- [ ] Buttons (after)
- [ ] Overall UI (before)
- [ ] Overall UI (after)

**Phase 3 Complete**: ✅ / ❌

---

## Antipattern Count (Before → After)

| Antipattern | Before | After | Status |
|-------------|--------|-------|--------|
| `hover:bg-blue-*` | 28+ | 0 | ❌ → ✅ |
| `bg-transparent` (inappropriate) | 20+ | 0 | ❌ → ✅ |
| `border-black` | 5+ | 0 | ❌ → ✅ |
| Hardcoded colors | 50+ | 0 | ❌ → ✅ |
| Mixed token systems | 100+ | 0 | ❌ → ✅ |

---

## Build Status

```bash
# Last build attempt
pnpm build

# Status: ✅ Success / ❌ Failed
# Errors: [list any errors]
```

---

## Git Commits

```bash
# Phase 1
git commit -m "Phase 1: Remove old token system, fix neutral states"

# Phase 2.1
git commit -m "Phase 2.1: Fix navigation components (MobileNav, Header, Search)"

# Phase 2.2
git commit -m "Phase 2.2: Fix buttons, cards, pills"

# Phase 2.3
git commit -m "Phase 2.3: Fix modals and remaining components"

# Phase 3
git commit -m "Phase 3: Dark mode + documentation + final polish"

# Final
git commit -m "✨ Complete Tailwind v4 refactor - luxury design system"
```

---

## Notes & Issues

### Blockers
- [List any blockers here]

### Decisions Made
- [Document any key decisions]

### Future Improvements
- [ ] Add theme switcher UI
- [ ] Create component library Storybook
- [ ] Add visual regression tests
- [ ] Performance audit

---

**Last Updated**: [timestamp]
