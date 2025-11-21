# Comprehensive Clean UI Refactor Plan (Strict Zinc & Svelte 5)

## 🎯 Objective
Complete the transition to a **Strict Zinc** aesthetic (Shadcn/ui style) across the entire codebase, ensuring a high-trust, professional, and "invisible" UI. Simultaneously, audit and fix technical debt, ensuring full compliance with **Svelte 5** (Runes) and **Tailwind CSS v4** best practices.

## ✅ Implementation Status (Completed)

### 1. Marketing Pages (Refactored to Zinc)
- [x] **`routes/(marketing)/about/+page.svelte`**:
    - Removed rainbow gradients (`from-blue-50`, `to-purple-50`) from Hero, Mission, and Team sections.
    - Replaced with professional `bg-zinc-50`, `bg-zinc-100`, and `bg-zinc-900` backgrounds.
    - Neutralized "Values" icons (removed purple backgrounds).
- [x] **`routes/(marketing)/blog/+page.svelte`**:
    - Completely neutralized the blog layout.
    - Removed gradient text and backgrounds from featured articles and category cards.
- [x] **`routes/(app)/(shop)/brands/+page.svelte`**:
    - Removed gradient hero section.
- [x] **`routes/(protected)/become-seller/+page.svelte`**:
    - Replaced purple icons in the "Why Sell" section with neutral styling.

### 2. Authentication & Admin
- [x] **`routes/(auth)/login/+page.svelte`**:
    - Fixed focus rings on inputs (replaced `var(--state-focus)`/blue with `zinc-900`).
    - Updated social login buttons to match the monochrome theme.
- [x] **`routes/(admin)/admin/+page.svelte`**:
    - Updated status badges: "Delivered" (Purple) -> `bg-zinc-200`, "Shipped" -> `bg-zinc-100`.
    - Updated "Quick Actions": Removed blue/cyan gradient button, replaced with white/zinc style.
- [x] **`lib/auth/oauth.ts`**:
    - Updated OAuth provider configuration (Facebook, Google, GitHub) to use `bg-zinc-900` instead of brand colors.

### 3. Core App Components
- [x] **`routes/(protected)/sell/components/StepProductInfo.svelte`**:
    - Fixed focus rings on color selection buttons (replaced dynamic blue borders with `border-zinc-900`).
    - *Note: Kept `#9333EA` hex code for the actual "Purple" color option.*
- [x] **`routes/(protected)/sell/components/StepCategory.svelte`**:
    - Neutralized condition tags (Like New, Worn) from blue/purple to zinc variants.
- [x] **`routes/(protected)/messages/components/ChatWindow.svelte`**:
    - Removed blue loading spinners and shadows, replaced with Zinc versions.
- [x] **`routes/(protected)/dashboard/order-management/+page.svelte`**:
    - Removed purple gradient background for bundle icons.

## 🛠 Core Refactor Strategy (Remaining / Ongoing)

### 1. Design System: "Strict Zinc" Implementation
We will enforce the "Strict Zinc" theme primarily through **CSS Variables** and **Tailwind v4 Theme Configuration**, rather than manually refactoring every component class.

-   **Action**: Update `apps/web/src/app.css` to map `--brand-primary` tokens to Zinc scales.
    -   `--brand-primary-50` -> `zinc-50`
    -   `--brand-primary-500` -> `zinc-900` (Primary Action)
    -   `--brand-primary-600` -> `black`
-   **Goal**: "Brand" colors (Indigo/Blue) should effectively disappear from the structural UI, replaced by monochrome elegance.
-   **Exceptions**: Semantic colors (Error/Red, Success/Green) remain for feedback but should be muted/professional.

### 2. Codebase Audit & Cleanup
We will perform a deep clean of `apps/web` and `packages/ui`.

#### A. Svelte 5 Compliance (Runes & Snippets)
-   [ ] **Audit**: Verify no legacy `export let` exists in source files (mostly clean, but double-check `packages/ui`).
-   [ ] **Audit**: Verify no legacy `createEventDispatcher` (replace with callback props).
-   [ ] **Audit**: Verify no legacy `<slot />` (replace with `{@render children()}`).
-   [ ] **Audit**: Verify no legacy `on:click` (replace with `onclick`).
-   [ ] **Refactor**: Convert any remaining `$: ` reactive statements to `$derived` or `$effect`.

#### B. Tailwind CSS v4 Best Practices
-   [ ] **Config**: Ensure `app.css` uses `@theme` correctly for v4.
-   [ ] **Variables**: Use native CSS variables for all theme values (e.g., `bg-[var(--surface-base)]` instead of utility classes where semantic meaning is needed).
-   [ ] **Removal**: Remove any `@apply` usage that can be replaced by utility classes or theme variables.

#### C. Tech Debt & "Bad Practices"
-   [ ] **Hardcoding**: Identify hardcoded strings in `+page.svelte` and other routes; move to `@repo/i18n`.
-   [ ] **Comments**: Remove `// Reverted`, `// TODO`, and commented-out code blocks.
-   [ ] **Unused Imports**: Run a linter/cleanup pass to remove unused imports (e.g., `logInfo`, `logError` if unused).
-   [ ] **Duplicate Code**: Consolidate repeated logic (e.g., search navigation logic in `+page.svelte` vs `CategorySearchBar`).

### 3. Component Library Refactor (`packages/ui`)
-   [ ] **Button**: Verify `buttonVariants` uses `zinc-900` for primary.
-   [ ] **Badge**: Update `Badge.svelte` to remove `bg-indigo-*` and use `bg-zinc-100 text-zinc-900` for neutral badges.
-   [ ] **Inputs**: Ensure focus rings are `zinc-400` or `black`, not blue.

### 4. Page-Specific Refactor Plan

#### `apps/web/src/routes/+page.svelte` (Home)
-   [ ] **Visuals**: Remove "Welcome to Driplo" hardcoded section if it duplicates `FeaturedProducts` empty state, or style it strictly with Zinc.
-   [ ] **Search**: Ensure `MainPageSearchBar` uses the new monochrome style.
-   [ ] **Cleanup**: Remove `// Reverted` comments and unused `virtualCategories` if they are truly unused.

#### `apps/web/src/routes/+layout.svelte` (Global)
-   [ ] **Header**: Ensure `Header` component is strictly monochrome.
-   [ ] **Footer**: Ensure `Footer` is `zinc-50` or `white` with `zinc-900` text.
-   [ ] **Toasts**: Ensure `ToastContainer` and toasts use the new design system.

### 5. Verification & Testing (Playwright)
-   [ ] **Visual Regression**: Use Playwright to snapshot key pages (Home, Search, Product) to ensure no visual regressions during the color swap.
-   [ ] **Functional**: Verify search, navigation, and auth flows still work after refactoring event handlers.

## 🚀 Execution Order
1.  **Theme Update**: Modify `app.css` to swap color palettes. (High Impact, Low Effort)
2.  **UI Library Fixes**: Update `Badge`, `Button` to align with theme.
3.  **Home Page Cleanup**: Refactor `+page.svelte`.
4.  **Global Cleanup**: Scan and fix legacy Svelte syntax and tech debt across `apps/web`.
5.  **Final Audit**: Run `pnpm check` and Playwright tests.
