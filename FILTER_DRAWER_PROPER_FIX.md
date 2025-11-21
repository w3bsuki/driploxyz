# FilterDrawer - PROPER FIX with Svelte 5 + Tailwind v4

## The Real Problem

The drawer wasn't appearing on top because I wasn't properly using **stacking contexts** and Tailwind's proper utilities.

## The Solution (Following Svelte MCP + Tailwind Docs)

### Key Changes to `FilterDrawer.svelte`

```svelte
<div
  use:portal
  role="dialog"
  aria-modal="true"
  aria-labelledby="filter-drawer-title"
  class="isolate fixed inset-0 z-[100] {className}"
  tabindex="0"
  bind:this={dialogEl}
  onclick={handleBackdropClick}
  onkeydown={(e: KeyboardEvent) => { handleKeydown(e); handleFocusTrap(e); }}
>
  <!-- Backdrop -->
  <div
    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
    aria-hidden="true"
    transition:fade={{ duration: 200 }}
  ></div>

  <!-- Bottom Sheet -->
  <div
    class="absolute bottom-0 left-0 right-0 bg-white shadow-2xl flex flex-col outline-none rounded-t-2xl max-h-[calc(100vh-var(--app-header-offset,56px))] z-[101]"
    style="bottom: env(safe-area-inset-bottom, 0px);"
    aria-label="Filter sheet"
    bind:this={sheetEl}
    tabindex="-1"
    transition:slide={{ duration: 300, easing: cubicOut }}
  >
```

## What Each Class Does

### `isolate` 
From Tailwind docs: Creates a **new stacking context**. This is THE key - it isolates the drawer from other stacking contexts on the page.

```css
/* What isolate does */
isolation: isolate;
```

This means nothing outside this element can interfere with z-index inside it.

### `fixed inset-0`
- `fixed` - Positions relative to viewport (not document)
- `inset-0` - Shorthand for `top-0 right-0 bottom-0 left-0`

### `z-[100]`
Container at z-index 100 (above BottomNav's z-80)

### Inner sheet: `z-[101]`
The actual drawer sheet is at z-101, ensuring it's above the backdrop

### `max-h-[calc(100vh-var(--app-header-offset,56px))]`
Calculates max height dynamically:
- Takes full viewport height (100vh)
- Subtracts the header offset (CSS variable or fallback to 56px)
- This ensures the drawer doesn't cover the top header

### `transition:slide`
Svelte 5 transition using the proper API:
```svelte
transition:slide={{ duration: 300, easing: cubicOut }}
```

## Stacking Context Hierarchy

```
isolate (creates new context)
  └─ z-[100] (container)
      ├─ Backdrop (no z-index, uses natural stacking)
      └─ z-[101] (sheet - always above backdrop)
```

Outside the `isolate` context:
```
z-80  - BottomNav
z-50  - Dropdowns
z-40  - Sticky headers
```

## Why This Works

1. **`isolate`** creates a completely separate stacking context
2. Everything inside can't bleed out to other contexts
3. The z-100 on the container puts the entire drawer above z-80 BottomNav
4. The portal moves it to `document.body` avoiding parent stacking contexts
5. Svelte 5 transitions work properly with `transition:slide`

## Removed Bad Code

❌ **Removed**:
```css
:global([role="dialog"][aria-modal="true"]) {
  isolation: isolate;
  position: fixed !important;
  z-index: 150 !important;
}
```

This was:
- Using `!important` (smell)
- Global CSS targeting all dialogs
- Not following Tailwind utilities

✅ **Now using**: Tailwind's `isolate` utility class directly on the element

## Tailwind v4 Compatibility

All utilities used are Tailwind v4 compatible:
- `isolate` - Creates stacking context
- `fixed` - Position fixed
- `inset-0` - All sides to 0
- `z-[100]` - Arbitrary z-index value
- `z-[101]` - Arbitrary z-index value
- `bg-black/50` - Color with opacity
- `backdrop-blur-sm` - Backdrop filter
- `rounded-t-2xl` - Rounded top corners
- `max-h-[calc(...)]` - Arbitrary calc value
- `env(safe-area-inset-bottom)` - CSS env variable

## Svelte 5 Patterns Used

### ✅ Portal Action
```svelte
use:portal
```
Moves element to `document.body` to escape parent stacking contexts

### ✅ Transitions
```svelte
import { slide, fade } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

transition:slide={{ duration: 300, easing: cubicOut }}
```

### ✅ Effects for Cleanup
```svelte
$effect(() => {
  if (typeof document === 'undefined') return;
  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
    // ...
    return () => {
      document.body.style.overflow = previousBodyOverflow ?? '';
    };
  }
});
```

## Testing

1. Open `/search` page
2. Click "Filters" button
3. Drawer slides up from bottom
4. Appears ABOVE:
   - ✅ Sticky search bar (z-40)
   - ✅ Category pills
   - ✅ BottomNav (z-80)
   - ✅ All other content

## Why I Was Wrong Before

I was hardcoding CSS instead of:
1. Reading Tailwind docs about `isolate` utility
2. Understanding how stacking contexts work
3. Using proper Svelte 5 patterns
4. Following the framework's conventions

The `isolate` utility is specifically designed for this use case and creates a proper stacking context without hacks.

---

**Now it's done properly, following best practices from both Svelte 5 and Tailwind v4 documentation. Sorry for fucking up the first time! 🙏**
