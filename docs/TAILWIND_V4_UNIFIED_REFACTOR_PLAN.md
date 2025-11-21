# Tailwind CSS v4 Unified Refactor Plan## Tailwind CSS v4 unified refactor (final)

**Svelte 5 + SvelteKit 2 + Vite — Minimal, authoritative, zero over-engineering**Svelte 5 + SvelteKit 2 + Vite, minimal and by the book. No over‑engineering.



> **Last updated:** 2025-10-15  Updated: 2025‑10‑15 (audited against official Tailwind v4 and Svelte/SvelteKit docs).

> **Audited against:** Official Tailwind v4 docs (Context7) + Svelte 5/SvelteKit 2 docs (Svelte MCP)

### Scope

---- Web app only (apps/web). Mobile remains isolated (NativeWind) — no coupling.



## Scope### Ground rules (authoritative)

- **Web app only** (`apps/web`). Mobile uses NativeWind — keep isolated.- Use Tailwind’s Vite plugin only: `@tailwindcss/vite`.

- **Goal:** Optimize existing Tailwind v4 setup; remove legacy patterns; establish minimal best practices.- CSS‑first config in a single stylesheet: `apps/web/src/app.css`.

- Bring plugins via CSS: `@plugin '@tailwindcss/forms'`, `@plugin '@tailwindcss/typography'`.

---- Detect sources via CSS: `@source` for `apps/web/src/**/*.{svelte,ts}` and `packages/ui/src/**/*.{svelte,ts}`.

- Do not add `@tailwindcss/postcss` to the web app. Keep `postcss.config.cjs` local with `plugins: []` to avoid workspace leakage.

## Ground Rules (Authoritative)- Prefer utilities in markup. When you need shared styles, use Tailwind v4 `@utility` (not `@layer components`).

- If a component’s scoped `<style>` needs `@apply`, add `@reference "../../app.css"` first. Prefer CSS variables instead of `@apply` for perf.

### 1. Setup- Don’t customize Vite build output unless we have a proven problem. Defaults are good.

✅ **Use `@tailwindcss/vite` exclusively**  

- Official guidance: "For Vite projects, use the dedicated Vite plugin for best performance and DX"---

- Location: `apps/web/vite.config.ts`

- Order: `tailwindcss()` can come before or after `sveltekit()` — both work## 1) Verify current setup (keep or fix)

What “good” looks like:

✅ **CSS-first config in a single entry point**  - Vite: `tailwindcss()` is in `plugins` after `sveltekit()` (order with other plugins isn’t critical).

- File: `apps/web/src/app.css`- CSS entry: `@import 'tailwindcss';` at the top of `apps/web/src/app.css`.

- Required imports:- Plugins: `@plugin '@tailwindcss/forms';` and `@plugin '@tailwindcss/typography';` in `app.css`.

  ```css- Sources: `@source '../../../packages/ui/src/**/*.{svelte,ts}';` and the app’s `lib/` and `routes/`.

  @import 'tailwindcss';- No `tailwind.config.*` in the web app (v4 doesn’t need it).

  @plugin '@tailwindcss/forms';- No `@tailwindcss/postcss` in web. Local `postcss.config.cjs` exists with `plugins: []`.

  @plugin '@tailwindcss/typography';

  @source '../../../packages/ui/src/**/*.{svelte,ts}';Acceptance:

  @source './lib/**/*.{svelte,ts}';- `pnpm --filter web run check` passes.

  @source './routes/**/*.{svelte,ts}';- Build includes `/*! tailwindcss v4.x */` at the top of the generated CSS.

  ```

---

✅ **No `tailwind.config.js` needed**  

- Tailwind v4 is CSS-first — all config via `@theme`, `@utility`, `@source` in CSS## 2) Clean up legacy v3 patterns (surgical)

- Remove any remaining `@layer components` blocks used for project‑made abstractions and convert to `@utility`.

✅ **No `@tailwindcss/postcss` in web app**  - Delete any leftover `safelist`/config‑based scanning — replaced by `@source` or `@source inline()` when truly needed.

- Keep `postcss.config.cjs` with `plugins: []` to prevent workspace config leakage- Remove ad‑hoc color hex codes in favor of tokens (keep semantic naming in CSS variables).



### 2. Custom StylesNotes:

✅ **Prefer utilities in markup first**- Third‑party styles you don’t own can still be targeted with `@layer components` when necessary. Use sparingly.

- Official guidance: "Use utility classes directly; only extract patterns when reused 3+ times"

---

✅ **When you need reusable styles, use `@utility` (NOT `@layer components`)**  

Per Tailwind v4 docs:## 3) Minimal shared utilities (only what we reuse)

```cssDefine a tiny, stable set in CSS via `@utility`. Examples:

/* ❌ OLD (v3) - Don't do this */- Buttons: `@utility btn`, plus minimal variants like `btn-primary`, size variants `btn-sm`, `btn-lg`.

@layer components {- Inputs: `@utility input-base`, `input-focus`.

  .btn {- Layout: `@utility container { container-type: inline-size; }` if needed, otherwise use Tailwind’s stock utilities.

    border-radius: 0.5rem;

    padding: 0.5rem 1rem;Keep it lean. If a utility isn’t reused across features, don’t make it — use inline utilities in markup.

  }

}---



/* ✅ NEW (v4) - Do this */## 4) Token usage (pragmatic)

@utility btn {- Keep design tokens in CSS `@theme` files as we do today.

  border-radius: 0.5rem;- Prefer semantic tokens (surface/text/border/state) over raw color utilities.

  padding: 0.5rem 1rem;- For component styles, access tokens via `var(--token)`; in markup use Tailwind utilities unless a token is required.

}

```Accessibility:

- Keep focus styling token‑driven (no magic blues). Default ring width in v4 is 1px — bump with `ring-2/3` only where needed.

✅ **Exception: `@layer components` is OK for third-party overrides**

```css---

/* Styling external libraries you don't control */

@layer components {## 5) Svelte 5 / scoped styles guidance

  .select2-dropdown {- Prefer class utilities on elements; avoid heavy `<style>` blocks.

    @apply rounded-b-lg shadow-md;- If you must `@apply` inside a component style, add `@reference "../../app.css"` first per Tailwind v4 guidance.

  }- Favor CSS variables over `@apply` for performance in scoped styles.

}

```---



### 3. Svelte 5 Scoped Styles## 6) Performance & DX (defaults first)

✅ **Use class utilities directly — avoid heavy `<style>` blocks**- Don’t hand‑roll CSS chunking, “critical CSS”, or manual Rollup chunk maps. Measure first.

- Keep Vite/SvelteKit defaults; they’re fast.

✅ **If you MUST use `@apply` in scoped styles:**- Optional: add Prettier Tailwind plugin for class sorting if the team wants it; not required for function.

```svelte

<style>Acceptance (lightweight):

  @reference "../../app.css";- Dev server quick to start; HMR works.

  - No obvious CSS bloat; bundle size roughly stable.

  button {

    @apply bg-blue-500 hover:bg-blue-600;---

  }

</style>## 7) Tiny migration checklist

```1) Confirm plugin + sources + CSS entry are correct (Section 1).

2) Convert any internal `@layer components` to `@utility` (only what’s reused).

✅ **Better: Use CSS variables for performance**3) Replace remaining ad‑hoc colors with semantic tokens.

```svelte4) Keep scoped styles minimal; prefer utilities; use `@reference` if applying.

<style>5) Run checks: `pnpm --filter web run check` and a smoke build.

  button {

    background-color: var(--color-blue-500);Done means:

  }- No `tailwind.config.*` in web, no `@tailwindcss/postcss` usage in web.

</style>- Minimal `@utility` set exists and is referenced by components.

```- Tokens used where it matters; markup otherwise uses stock utilities.

- Checks pass; no regressions observed.

Official Svelte guidance: "CSS variables avoid Tailwind processing and improve build performance"

---

### 4. Dynamic Classes (Svelte 5.16+)

✅ **Use object/array syntax with `class` attribute (preferred)**## Appendix — Pointers to official guidance

```svelte- Tailwind v4 CSS‑first config, `@utility`, `@source`, `@plugin`, `@reference`.

<!-- Objects -->- SvelteKit + Vite: use `@tailwindcss/vite`; import global CSS in layout; defaults for build.

<div class={{ cool, lame: !cool }}>...</div>

This document is intentionally short. If a new requirement appears (measured perf issue, repeated patterns, 3rd‑party overrides), address it with the smallest possible addition here.

<!-- Arrays (perfect for Tailwind) -->
<div class={[faded && 'saturate-0 opacity-50', large && 'scale-200']}>...</div>
```

✅ **Avoid `class:` directive unless on older Svelte**
- `class` attribute is more powerful and composable in Svelte 5.16+

---

## Migration Checklist

### Step 1: Verify Foundation ✅
Current status verified 2025-10-15:
- [x] `@tailwindcss/vite` in `vite.config.ts` ✅
- [x] `@import 'tailwindcss'` in `app.css` ✅
- [x] `@plugin` for forms/typography ✅
- [x] `@source` paths configured ✅
- [x] No `tailwind.config.*` ✅
- [x] `postcss.config.cjs` empty ✅

**Action:** None needed — foundation is correct.

---

### Step 2: Convert Legacy `@layer components` → `@utility`

**Current state:**
- `packages/ui/src/styles/components.css` — has `.btn`, `.input` as regular classes
- `apps/web/src/app.css` — has 2x `@layer components` blocks (lines 275, 595)

**Action required:**

1. **Convert reusable component classes to `@utility`:**
   ```css
   /* In packages/ui/src/styles/components.css */
   /* Replace regular classes with @utility for reused patterns */
   
   @utility btn {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     min-height: var(--height-button);
     padding: 0 var(--spacing-4);
     border-radius: var(--border-radius-lg);
     font-weight: var(--font-weight-medium);
     transition: all var(--duration-fast) var(--ease-in-out);
     cursor: pointer;
     user-select: none;
   }
   
   @utility btn-primary {
     background-color: var(--color-sky-600);
     color: var(--color-white);
   }
   
   /* Hover states work automatically with variants */
   ```

2. **Audit `@layer components` in app.css:**
   - Keep if styling 3rd-party components (Melt UI, external libs)
   - Convert if styling your own components (→ use `@utility` or inline utilities)

**Why:** Tailwind v4 `@utility` provides better specificity control and automatic variant support.

---

### Step 3: Token Usage Audit

**Current state:** Good foundation with `@theme` in tokens-v4/

**Action required:**
1. Search for hex colors in components: `grep -r "#[0-9a-f]{6}" apps/web/src`
2. Replace with semantic tokens:
   - `#ffffff` → `var(--surface-base)` or `bg-surface-base`
   - `#000000` → `var(--text-primary)` or `text-primary`
   - Focus colors → `var(--state-focus)`

**Why:** Consistency, themability, accessibility.

---

### Step 4: Scoped Style Optimization

**Action:**
1. Search for `<style>` blocks in Svelte components
2. For each block, choose:
   - **Best:** Remove `<style>`, use class utilities directly
   - **Good:** Keep but use CSS variables: `var(--token)`
   - **OK:** Use `@apply` with `@reference "../../app.css"` (adds build overhead)

**Example migration:**
```svelte
<!-- BEFORE -->
<style>
  button {
    background: #3b82f6;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }
</style>

<!-- AFTER (best) -->
<button class="rounded-lg bg-blue-500 px-4 py-2">

<!-- AFTER (good) -->
<style>
  button {
    background: var(--color-blue-500);
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius-lg);
  }
</style>

<!-- AFTER (ok) -->
<style>
  @reference "../../app.css";
  button {
    @apply rounded-lg bg-blue-500 px-4 py-2;
  }
</style>
```

---

### Step 5: Dynamic Classes Update (Svelte 5.16+)

**Action:** Replace `class:` with object/array syntax where appropriate

```svelte
<!-- BEFORE -->
<div class:active class:error={hasError}>

<!-- AFTER -->
<div class={{ active, error: hasError }}>
```

**Why:** More powerful, composable, works with Tailwind multi-class patterns:
```svelte
<div class={[
  faded && 'saturate-0 opacity-50',
  large && 'scale-200 font-bold'
]}>
```

---

## Validation

### Pre-deployment checks:
```bash
# 1. Type check
pnpm --filter web run check

# 2. Build test
pnpm --filter web build

# 3. Visual regression (if setup)
pnpm --filter web test:e2e

# 4. Bundle size (should be stable/smaller)
pnpm --filter web build:metrics
```

### Success criteria:
- ✅ `svelte-check` passes with 0 errors
- ✅ Build emits `/*! tailwindcss v4.1.x */` in CSS
- ✅ No `tailwind.config.*` exists in web app
- ✅ No `@layer components` for internal components (only 3rd-party overrides)
- ✅ Minimal `@utility` set (< 10 custom utilities)
- ✅ CSS bundle size stable or reduced

---

## Quick Reference

### File locations:
- **Vite config:** `apps/web/vite.config.ts`
- **CSS entry:** `apps/web/src/app.css`
- **Tokens:** `packages/ui/src/styles/tokens-v4/*.css`
- **Shared utilities:** `packages/ui/src/styles/components.css` (convert to `@utility`)

### Official docs referenced:
- [Tailwind v4 @utility directive](https://tailwindcss.com/docs/upgrade-guide#utility-directive)
- [Tailwind v4 @reference for scoped styles](https://tailwindcss.com/docs/upgrade-guide#scoped-styles)
- [SvelteKit + Tailwind guide](https://tailwindcss.com/docs/installation/framework-guides/sveltekit)
- [Svelte 5 class attribute enhancements](https://svelte.dev/docs/svelte/class)
- [Svelte 5 scoped styles](https://svelte.dev/docs/svelte/scoped-styles)

---

## Non-Goals (Explicitly Excluded)

❌ Don't preemptively optimize CSS chunking  
❌ Don't create "critical CSS" system  
❌ Don't add manual Rollup configs  
❌ Don't create utilities for one-off use  
❌ Don't convert ALL `@layer components` (keep 3rd-party overrides)  

**Philosophy:** Measure first, optimize only proven bottlenecks. Vite/SvelteKit defaults are excellent.
