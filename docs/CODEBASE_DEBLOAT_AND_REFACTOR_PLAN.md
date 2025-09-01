# Codebase De‑bloat and Refactor Plan (Svelte 5 / SvelteKit 2)

This plan removes over‑engineered scrolling hacks, unnecessary complexity, duplicated styles, and performance anti‑patterns. It doubles down on native SvelteKit/Svelte 5 strengths and real, measurable optimizations (images, asset strategy, SSR/streaming, critical CSS), while pruning anything that adds code/maintenance cost without moving user‑perceived performance.

Focus areas:
- Remove fragile scrolling “optimizations” and custom virtualization where native/CSS is sufficient.
- Consolidate duplicated CSS/utilities and event patterns.
- Keep and improve real optimizations (WebP/AVIF, lazy/lite components, SSR streaming, client prefetch) with simple, correct implementations.
- Tighten SvelteKit 2 data flow and component lifecycles; prefer CSS‑first, observer‑based patterns over JS loops.


## 1) Scrolling Anti‑Patterns To Remove/Simplify

1.1 Non‑passive scroll listeners via DOM property handlers
- Issue: Using `onscroll={...}` attaches a non‑passive property handler, can block the main thread and hurts scroll performance.
- Replace with: Svelte event modifiers `on:scroll|passive` where a handler is needed; or remove when CSS/IO can replace it.
- Files:
  - apps/web/src/lib/components/MessageThread.svelte:176
  - apps/web/src/lib/components/modular/ChatWindow.svelte:210
  - packages/ui/src/lib/VirtualProductGrid.svelte:236

Action:
- Convert property handlers to Svelte events with passive:
  - `onscroll={handleScroll}` → `on:scroll|passive={handleScroll}`
- Where we only need “near top/bottom” detection for infinite load, prefer IntersectionObserver sentinels instead of continuous scroll polling.

1.2 Custom virtual scrolling with per‑scroll math (only where necessary)
- File: packages/ui/src/lib/VirtualProductGrid.svelte
- Issues:
  - Global containment rule: `.virtual-grid-container * { contain: layout style paint; }` is excessive; it forces heavy isolation on every child and can hurt overall layout/paint behavior.
  - Window‑level listeners + throttled handlers at ~60fps still execute very frequently; end‑reached checks run on each scroll.
  - Uses manual window scroll plumbing (`window.addEventListener('scroll'...)`) and `overflow-anchor: none` which can fight browser’s built‑in scroll anchoring.
- Keep virtualization only when list is large; otherwise use a simple CSS grid.

Action:
- Scope containment minimally:
  - Remove child wildcard containment: keep `contain: content` or `contain: layout paint` only on the scrolling container.
- Replace end‑of‑list detection with a sentinel `IntersectionObserver` (single observer, no per‑scroll checks) when `scrollParent === 'window'`.
- Reduce window listeners: prefer container scroll + IO sentinel; drop `orientationchange` unless there’s a specific bug.
- Keep virtualization only when items exceed a high threshold (e.g., > 100). Otherwise render a normal grid for simplicity (already partially done via packages/ui/src/lib/LazySearchResults.svelte).

1.3 Repeated scroll “jump to top” calls
- Files:
  - apps/web/src/routes/(protected)/onboarding/+page.svelte:163, 170 (calls to `window.scrollTo(0, 0)`)
  - apps/web/src/routes/(protected)/sell/+page.svelte:285, 693, 720 (via `scrollToTop()`)
- Guidance:
  - Use anchor + `scrollIntoView({ block: 'start' })` only when needed; rely on native route scroll restoration or page structure (sticky header + proper document flow) wherever possible.
  - For multi‑step in a fixed container, consider scoping the container with `tabindex="-1"` and `focus()` to anchor instead of calling `window.scrollTo`.

1.4 Smooth scrolling in UI primitives by default
- File: packages/ui/src/lib/primitives/tabs/Tabs.svelte:254
- Issue: `.tabs-list { scroll-behavior: smooth; }` enforces smooth scrolling everywhere; can feel sluggish and interfere with reduced‑motion users.
- Action: Default to `auto` and only perform a one‑off `element.scrollIntoView({ behavior: 'auto', block: 'nearest' })` when needed. Keep the `prefers-reduced-motion: reduce` override.


## 2) Duplicated CSS Utilities (Bloat)

There are multiple local definitions of `.scrollbar-hide` scattered across components, while an app‑level utility already exists.
- Keep: apps/web/src/app.css:385 (utility `@utility scrollbar-hide`)
- Duplicates to remove (use the existing utility):
  - apps/web/src/lib/components/MessageInput.svelte:78
  - apps/web/src/lib/components/modular/ChatWindow.svelte:345
  - apps/web/src/lib/components/modular/ConversationSidebar.svelte:158
  - packages/ui/src/lib/primitives/tabs/Tabs.svelte:244
  - apps/web/src/routes/search/+page.svelte:style block near the end
  - packages/ui/src/lib/SmartStickySearch.svelte (local style block with scrollbar rules)

Action:
- Delete local `.scrollbar-hide` style definitions and rely on the shared utility.
- For the UI package (packages/ui/*), add a single shared scrollbar utility in `packages/ui/src/styles/semantic.css` and reuse it across UI components (since app.css may not be available inside the library bundle).


## 3) Prefer Observers and CSS Over Scroll Math

- Keep: IntersectionObserver usage for lazy components and images
  - apps/web/src/routes/+page.svelte: IO for PromotedHighlights
  - packages/ui/src/lib/ImageOptimized.svelte: lazy loading with IO
  - packages/ui/src/lib/LazySearchResults.svelte: infinite scroll sentinel
  - packages/ui/src/lib/SmartStickySearch.svelte: show/hide sticky bar via IO

Action:
- Expand IO sentinel pattern to replace “near‑end” calculations in VirtualProductGrid’s window scroll mode.
- Stick to CSS `position: sticky`, `overscroll-behavior`, and scroll snapping for carousels; avoid JS scroll handlers for purely visual effects.


## 4) Real Optimizations To Keep and Improve

- Images
  - Keep: packages/ui/src/lib/ImageOptimized.svelte (lazy, decoding=async, priority flag) and storage‑side WebP optimization.
  - Improve: add `<picture>` with AVIF/WebP fallback where image sources are external or not guaranteed to be pre‑optimized.
  - Add width/height where known to improve CLS.

- Data loading (SvelteKit 2)
  - Keep SSR/streamed data where already used; keep `preloadCode`/hover prefetch in critical flows.
  - Ensure load functions only return the minimal necessary data; avoid client‑side stores that mirror the server unless they add clear value.

- Asset strategy
  - Keep script/style code‑splitting, dynamic imports for heavy components (e.g., notification panel, promoted sections).
  - Maintain existing lighthouse/bundle analysis scripts; enforce budgets.


## 5) Concrete Refactors (by file)

- apps/web/src/lib/components/MessageThread.svelte:176
  - Change to `on:scroll|passive={onScroll}`
  - Remove local `.scrollbar-hide` duplicates (if any); use shared utility.

- apps/web/src/lib/components/modular/ChatWindow.svelte:210
  - Change to `on:scroll|passive={handleScroll}`
  - Consider swapping “load older when near top” to an IO sentinel at the top to remove continuous scroll checks.

- packages/ui/src/lib/VirtualProductGrid.svelte
  - Replace window scroll listeners + math with IO sentinel for “end reached” when using `scrollParent === 'window'`.
  - Remove `.virtual-grid-container * { contain: layout style paint; }`; retain containment only on the container.
  - Keep virtualization only for large lists; otherwise render a simple grid (already partly implemented via LazySearchResults threshold).
  - Convert any `onscroll` to `on:scroll|passive`.

- packages/ui/src/lib/primitives/tabs/Tabs.svelte
  - Default to `scroll-behavior: auto`; use one‑off `scrollIntoView({ behavior: 'auto' })` in code if needed.
  - Remove local `.scrollbar-hide`; rely on a single UI‑level utility.

- apps/web/src/routes/search/+page.svelte
  - Remove local `.scrollbar-hide` style block; use shared utility.
  - IO sentinel already implemented; keep.

- apps/web/src/lib/components/MessageInput.svelte and ConversationSidebar.svelte
  - Remove local `.scrollbar-hide` rules; use shared utility.

- packages/ui/src/lib/SmartStickySearch.svelte
  - Keep IO; ensure no duplicate scrollbar CSS; rely on shared UI utility if needed.


## 6) Accessibility and Motion

- Keep: existing `prefers-reduced-motion` fallbacks.
- Remove global smooth scrolling; prefer local, one‑off behavior and reduce motion in all cases when the user requests it.
- Avoid hiding scrollbars globally when it harms discoverability; only hide in horizontal pill rows where design requires it.


## 7) Tooling/Process Guardrails

- Bundle/Perf Budgets
  - Enforce size thresholds in Vite/SvelteKit config and keep using `scripts/analyze-bundle.js` and `scripts/advanced-bundle-analysis.js`.

- Linting/Style
  - One scrollbar utility, one place. No component‑local duplicates.
  - Prefer `on:scroll|passive` over `onscroll=` everywhere.
  - No wildcard containment rules.


## 8) Cutlist vs Keeplist

Cut (remove/simplify):
- Window‑level scroll listeners used for end‑of‑list detection (replace with IO sentinel).
- Per‑scroll calculations that can be replaced with CSS or IntersectionObserver.
- Component‑local `.scrollbar-hide` definitions (duplicate bloat).
- Global wildcard containment rules (`.container * { contain: ... }`).
- Default smooth scrolling in primitives.

Keep and improve:
- WebP/AVIF images, lazy loading, `decoding="async"`, and priority flags.
- SSR+streaming for above‑the‑fold content; defer non‑critical components.
- IntersectionObserver for lazy components and infinite scroll.
- CSS `position: sticky`, `overscroll-behavior`, `scroll-snap` for horizontal lists.


## 9) Implementation Checklist

- [ ] Convert non‑passive scroll handlers to `on:scroll|passive` (MessageThread.svelte:176, ChatWindow.svelte:210, VirtualProductGrid.svelte:236)
- [ ] Replace VirtualProductGrid window end‑reached logic with IO sentinel; drop extra window listeners
- [ ] Remove wildcard `contain` on children; keep containment on container only
- [ ] Default tabs scrolling to `auto`; remove default smooth behavior (Tabs.svelte: style section)
- [ ] Delete local `.scrollbar-hide` rules in components; add a single UI‑level utility in `packages/ui/src/styles/semantic.css` and reuse
- [ ] Replace repeated `window.scrollTo(0, 0)` with scoped anchors/focus or container scroll where possible
- [ ] Add width/height to known images to improve CLS; consider `<picture>` for AVIF where needed
- [ ] Re‑run bundle analysis and set/confirm budgets


## 10) Notes on Expected Impact

- Fewer scroll listeners and no per‑scroll math loops → smoother scrolling and less main‑thread contention.
- IO sentinel for infinite loading → fewer wakeups, simpler code, more reliable behavior across devices.
- Centralized utilities → smaller CSS, fewer duplicate rules, less maintenance.
- Scoped containment → fewer layout/paint barriers, better overall rendering performance.
- Motion defaults rationalized → more consistent UX and better accessibility.


---

If you want, I can apply these changes incrementally starting with the high‑impact items (passive scroll listeners, VirtualProductGrid end‑reached sentinel, and removal of duplicated `.scrollbar-hide`).

---

## Remaining Jobs (Tidy‑Up After Refactor)

- ChatWindow passive scroll handler
  - File: apps/web/src/lib/components/modular/ChatWindow.svelte
  - Change: `onscroll={handleScroll}` → `on:scroll|passive={handleScroll}`
  - Rationale: Align with passive event policy; avoid main‑thread blocking.

- Verify no stray window listeners
  - Search: `addEventListener('scroll'` in packages/ui and apps/web
  - Keep: Only IO sentinel for end‑reached; remove window scroll listeners unless absolutely needed.

- Ensure only one `.scrollbar-hide` source
  - Keep utility in packages/ui/src/styles/semantic.css:391
  - Remove/reject any component‑local `.scrollbar-hide { … }` re‑introductions.

- Double‑check reduced‑motion coverage
  - Confirm any remaining animated components respect `prefers-reduced-motion` and provide `scroll-behavior: auto` fallbacks.

---

## Copy‑Paste Prompt For Claude‑Code

"""
Please finish the de‑bloat tidy‑up with these surgical tasks:

1) Make ChatWindow scroll passive
   - File: apps/web/src/lib/components/modular/ChatWindow.svelte
   - Change: onscroll → `on:scroll|passive={handleScroll}`

2) Verify no window scroll listeners remain for product lists
   - Search for `addEventListener('scroll'` in packages/ui and apps/web.
   - Keep only the IntersectionObserver sentinel in VirtualProductGrid.

3) Enforce single scrollbar utility
   - Ensure `.scrollbar-hide` exists only in packages/ui/src/styles/semantic.css and not redeclared in components.

4) Reduced‑motion sanity check
   - Confirm tabs and any scrolling UI default to `scroll-behavior: auto` and respect `prefers-reduced-motion`.

Deliverables: minimal diffs, file paths changed, and a 1‑paragraph changelog.
"""

