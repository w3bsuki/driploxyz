# Styling Brand Finalization Plan (UI/UX, Tokens, Melt UI)

Owner: Frontend + Claude‑Code
Status: In Progress — Finalize brand mapping, remove legacy blues, adopt primitives
Target: Production‑ready, token‑driven, consistent brand styling across auth/sell/forms and UI

## Problems To Fix (What you’re seeing)

- Residual Tailwind blues (`bg-blue-*`, `text-blue-*`, `ring-blue-*`) in various components, causing brand mismatch.
- Inconsistent button styles (e.g., blue primary in places, black text elsewhere).
- Auth forms show “double ring” but color doesn’t match brand tokens.
- Link colors styled ad‑hoc with `text-blue-600` instead of a tokenized link color.
- Melt UI primitives exist, but not consistently used in auth/sell forms.

Examples to normalize (not exhaustive)
- apps/web/src/lib/components/ConversationList.svelte:96, 107, 116
- apps/web/src/lib/components/MessageThread.svelte:134–149, 230–233
- apps/web/src/lib/components/modular/ConversationSidebar.svelte:106
- apps/web/src/lib/components/product/ProductDetails.svelte:81, 92, 142–149
- apps/web/src/lib/components/UnifiedCookieConsent.svelte:338–396, 445, 462
- apps/web/src/routes/trust-safety/+page.svelte:36, 332

Use search to catch all:
- `git grep -n -I -E 'bg-blue-|text-blue-|border-blue-|ring-blue|fill-blue|stroke-blue|blue-[0-9]{2,3}\\b' apps/web/src packages/ui/src`

## Brand System — Final Decisions (apply via tokens)

- Primary brand color: `--brand-primary` (used for primary buttons, primary rings)
- Link color: `--text-link` (used for anchors and inline actions)
- Focus state: `--state-focus` (rings, outlines); should match brand primary unless accessibility dictates otherwise
- Status colors: use `--status-*-bg/border/text` (info/success/warning/error), never generic blues
- Surfaces/text/borders: always from `--surface-*`, `--text-*`, `--border-*`
- Typography: `--font-sans` (single source), sizes via tokens; confirm fonts are loaded once and used consistently

Mapping rules (replace everywhere)
- `bg-blue-600` → `bg-primary`
- `hover:bg-blue-700` → `hover:bg-[color:var(--primary-600)]`
- `text-blue-600` → `text-[color:var(--text-link)]` (for links) or `text-primary` for primary iconography
- `border-blue-200/500` → `border-[color:var(--border-emphasis)]` or status‑info border when conveying “info”
- `ring-blue-*` → `ring-primary`
- Blue “info” boxes → use `--status-info-*` tokens, not raw blues/indigos
- Gradients like `from-blue-50 to-indigo-50` → replace with status/info bg token or neutral surface if purely decorative
- Raw `text-black`/`bg-black` → use tokens (`text-[color:var(--text-primary)]`, `bg-[color:var(--surface-inverse)]`) or `bg-primary` if brand is black

Add token for links (if not present)
- `--text-link`: define in `packages/ui/src/styles/tokens.css` (light/dark) and map to Tailwind alias in app theme if needed.

## Melt UI Adoption (Primitives)

Adopt Melt‑based UI primitives across forms/auth:
- Buttons: `@repo/ui` Button variant system (primary/secondary/outline/ghost/danger)
- Inputs/Selects: consistent borders, rings, placeholders via tokens
- Tabs/Tooltip/Dialog already present — align to tokens

Targeted migrations
- Auth routes: `apps/web/src/routes/(auth)/login/+page.svelte`, `…/signup/+page.svelte`, `…/forgot-password/+page.svelte`
  - Use UI Button/Input; ensure primary submit button = `bg-primary text-white`, focus rings = `ring-primary ring-offset-2`
  - Links = `text-[color:var(--text-link)] hover:text-[color:var(--primary-600)]`
  - Keep the “double ring” (ring + offset) but color from tokens (not Tailwind blue)
- Sell flow: `apps/web/src/routes/(protected)/sell/+page.svelte`
  - Primary/Next buttons = `bg-primary text-white`; secondary = outline/ghost using tokens
  - No raw black/blue; rely on tokens only

## Execution Plan (Small PRs)

PR 1 — Token groundwork
- Add/confirm `--text-link` token (light/dark) in `packages/ui/src/styles/tokens.css`
- Map any needed Tailwind aliases in `apps/web/src/app.css` theme block
- Verify `--state-focus` and `--brand-primary` align with desired brand color

PR 2 — Auth forms to tokens + primitives
- Files: `(auth)/*/+page.svelte`
- Replace any raw blues with tokens
- Ensure submit buttons use `bg-primary text-white` and `focus-visible:ring-primary ring-offset-2`
- Links use `--text-link`; remove `text-blue-*`
- Use `@repo/ui` Button/Input where possible

PR 3 — Sell flow buttons and actions
- Files: `(protected)/sell/+page.svelte` (+ internal components)
- Standardize primary/secondary/destructive using UI Button variants and tokens
- Remove any leftover raw colors (blue/black classes)

PR 4 — Site‑wide blue purge + info boxes
- Replace `text-blue-*`, `bg-blue-*`, `ring-blue-*`, gradients with token equivalents per mapping
- Info/notice components (e.g., CookieConsent, ProductDetails): switch to `--status-info-*`

PR 5 — Typography and link consistency
- Confirm font family is set via `--font-sans` and loaded once
- Add `.link` class utility to `app.css` using `--text-link` with hover state
- Convert ad‑hoc anchors to `.link` class or tokenized inline styles

## Acceptance Checklist (DoD)

- [ ] Zero `blue-*` classes in `apps/web/src` and `packages/ui/src` (except brand tokens if intentionally blue)
- [ ] Auth submit buttons: `bg-primary text-white focus-visible:ring-primary ring-offset-2`
- [ ] Sell flow buttons consistent with Button variants (primary/secondary/ghost/danger)
- [ ] Links use `--text-link`; no `text-blue-600` anchors
- [ ] Info states use `--status-info-*` tokens, not generic blues
- [ ] No `text-black`/`bg-black` in components; use tokens or brand primary
- [ ] Melt UI primitives used in auth/sell forms where available
- [ ] Light/dark mode verified; focus rings visible; touch targets 44/36

## Code Search Aids

- Find blue usage: `git grep -n -I -E 'bg-blue-|text-blue-|border-blue-|ring-blue|fill-blue|stroke-blue|blue-[0-9]{2,3}\\b' apps/web/src packages/ui/src`
- Find raw black/white: `git grep -n -I -E '\\btext-black\\b|\\bbg-black\\b|\\btext-white\\b' apps/web/src packages/ui/src`
- Confirm tokens: `git grep -n -I -E 'bg-\\[color:var\\(|text-\\[color:var\\(|ring-\\[color:var\\(' apps/web/src packages/ui/src`

## Copy‑Paste Prompt For Claude‑Code

"""
Finalize the brand styling system with tokens and primitives. Keep diffs minimal and focused.

1) Tokens/link color
   - Add `--text-link` to tokens (light/dark) and wire it in app theme if needed.
   - Ensure `--brand-primary` and `--state-focus` match the desired brand.

2) Auth forms
   - Update `(auth)/login`, `(auth)/signup`, `(auth)/forgot-password` to use Button/Input primitives.
   - Buttons: `bg-primary text-white focus-visible:ring-primary ring-offset-2`.
   - Links: `text-[color:var(--text-link)] hover:text-[color:var(--primary-600)]`.

3) Sell flow
   - Standardize buttons to variants; remove raw black/blue classes.

4) Purge blues and gradients
   - Replace all `text-blue-*`, `bg-blue-*`, `ring-blue-*`, and gradient blues with token equivalents or status‑info tokens.

5) Typography/link consistency
   - Confirm font usage via tokens; add `.link` utility; refactor anchors.

6) Output
   - PR list of files touched, before/after examples, and a 1‑paragraph changelog.
"""

---

## Design Intent & Palette (for clarity)

- Primary action: use brand primary for all high‑affordance actions (submit, continue, buy). Buttons are solid by default (`bg-primary text-white`).
- Secondary/tertiary: outline/ghost styles with tokenized borders/surfaces; never raw black or blue.
- Links: a single, readable link color (`--text-link`) with hover shifting toward `--primary-600`).
- Focus: `--state-focus` drives rings. We use a two‑layer ring (ring + ring‑offset) on critical inputs/actions.
- Status: never “generic blue info”; map to `--status-info-*` tokens.
- Typography: `--font-sans` across UI; sizes/padding per tokens; consistent line‑height.

Open question for you (Claude can propose, but confirm with us):
- Should `--text-link` equal `--brand-primary` for simplicity, or a separate hue for readability? Provide 2 proposal swatches in the PR.

---

## Button Variants — Spec (primitives and classes)

Shared base (all buttons)
- Min height: primary 44px, secondary 36px
- Radius: `var(--radius-md)`; Font: `var(--font-sans)` medium
- Focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`
- Disabled: `opacity-60 cursor-not-allowed`

Variants
- Primary: `bg-primary text-white hover:bg-[color:var(--primary-600)]`
- Secondary (outline): `bg-[color:var(--surface-base)] text-[color:var(--text-primary)] border border-[color:var(--border-default)] hover:bg-[color:var(--surface-muted)]`
- Ghost: `bg-transparent text-[color:var(--text-primary)] hover:bg-[color:var(--surface-muted)]`
- Danger: `bg-[color:var(--status-error-solid)] text-[color:var(--text-inverse)] hover:bg-[color:var(--status-error-solid)]/90`

Sizes
- sm: `min-h-[36px] px-3 text-sm`
- md: `min-h-[44px] px-4 text-sm`
- lg: `min-h-[48px] px-5 text-base`

Include these in `@repo/ui` Button props (variant, size) and ensure auth/sell use them.

---

## Inputs/Textareas — Spec

Base input
- `bg-[color:var(--surface-base)] text-[color:var(--text-primary)]`
- `border border-[color:var(--border-default)] rounded-lg`
- Placeholder: `placeholder:text-[color:var(--text-muted)]`
- Focus: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:border-primary`
- Error: `border-[color:var(--status-error-border)]` + subtle `bg-[color:var(--status-error-bg)]`

“Double ring” auth style
- Wrapper adds `p-1` (offset layer), input inside applies focus ring
- Ensure ring color = `--state-focus` (brand‑consistent); remove `ring-blue-*` use

---

## Link Utility — Spec

Add a `.link` utility to `apps/web/src/app.css` (or UI tokens layer):

```css
.link {
  color: var(--text-link);
  text-decoration: none;
}
.link:hover {
  color: var(--primary-600);
  text-decoration: underline;
}
.link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--state-focus);
}
```

Refactor anchors to use `.link` or tokenized equivalents.

---

## Iconography & Badges

- Icons within primary actions: `text-white` or `currentColor` (inherits from button text)
- Informational badges (not status): use neutral tokens, not `text-blue-*`
- Status badges: map to `--status-*` tokens (success/info/warning/error)

---

## Dark Mode & Contrast

- Define `--text-link` dark value with AA contrast on `--surface-base` dark
- Buttons: ensure `bg-primary` vs text inverse meets AA
- Inputs: maintain visible focus rings in dark (ring offsets help)

---

## Melt UI Mapping — Where to use primitives

- Auth forms: use UI Button + Input primitives. Keep page composition, swap raw classes for primitives + token classes.
- Sell steps: swap action buttons to UI Button variants; keep layout; no visual regressions.
- Tabs/Tooltip/Dialog are already present; align classes to tokens (done for tabs; double‑check tooltip/dialog)

---

## Validation & CI Guardrails

Automated checks (add to CI):
- Fail on `bg-blue-|text-blue-|ring-blue|border-blue|fill-blue|stroke-blue` in `apps/web/src`, `packages/ui/src`
- Warn on `\btext-black\b|\bbg-black\b` use in components (allow in SVG/brand assets if intentional)
- Enforce presence of `.link` utility usage where anchors are within forms/auth

Manual QA
- Auth pages (login/signup/forgot): verify primary button, double ring color, link color; light/dark modes
- Sell flow: primary/secondary consistency; no raw blacks/blues; a11y (focus/touch targets)

---

## Room for Thought (Claude, propose within PR)

- Two palettes for `--text-link`:
  - A) identical to `--brand-primary` (cohesive)
  - B) slightly desaturated variant (improves legibility on bright surfaces)
- Consider a subtle elevation token (`--shadow-focus`) applied on focused inputs in auth to enhance visual affordance (optional)
- Provide a before/after diff table for 3 key files (e.g., login, sell, ProductDetails) showing class/token substitutions
