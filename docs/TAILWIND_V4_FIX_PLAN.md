# Tailwind v4 Fix Plan — Token‑First, No Drift

Objective: eliminate styling drift and hardcoded colors, ensure Melt UI surfaces (menu/dialog/popover/tooltip/toast) render consistently on mobile/desktop using tokens. Keep diffs small; prefer deletions over new code.

## Why previous plan didn’t fully fix
- Conflicting CSS overrides: shared `.menu` rules set widths/left/right on mobile, fighting Floating‑UI and causing off‑anchor slides.
- Inline color overrides: `bg-white`/`!bg-white` and inline `background-color` bypassed token styles, causing dark/high‑contrast artifacts (e.g., black borders).
- Positioning hacks: cross‑axis offset on dropdowns and full‑width classes (`w-screen`) at call sites distorted placement.

## Guardrails
- No new deps. ≤ 300–400 LOC per PR. Token‑first styling only.
- semantic.css loads once via `@repo/ui` barrel; do not import in app.css.
- Apps import components from `@repo/ui` (not primitives paths).

## Fix Steps (Claude‑code)

1) Verify imports and scanning
- apps/web/src/app.css: keep `@import '../../../packages/ui/src/styles/tokens.css';` (OK) and Tailwind plugins.
- Ensure semantic.css is imported by `@repo/ui` barrel only; not in app.css.
- Keep `@source` minimal to avoid duplicate CSS from `dist/` unless required.

2) Normalize shared surface CSS (no positioning)
- In `packages/ui/src/styles/semantic.css`:
  - `.menu` must only define: min/max width, border, background, padding, shadow.
  - Remove width forcing (`width: 100vw`) and mobile overrides that set `left/right/width`.
  - Ensure token colors: `var(--surface-base)`, `var(--text-primary)`, `var(--border-subtle)`.
- Apply same token rules to `.dialog-content`, `.toast`, `.tooltip`.

3) Remove inline/hardcoded colors in shared UI
- Search: `bg-white`, `!bg-white`, `style=.*background-color`, raw colors `#\w{3,8}|rgb\(|oklch\(` within `packages/ui/**`.
- Replace with tokenized classes/styles via semantic.css.

4) Stop positioning hacks in dropdowns/menus
- Ensure dropdown uses `portal="body"` at call site.
- Remove cross‑axis offsets and let Floating‑UI compute placement; keep `gutter` only.
- At call site, avoid `w-screen` on menus; prefer `w-auto sm:w-56`.

5) Sweep for raw color literals in apps
- Replace raw colors with tokens or utilities backed by tokens.
- Keep shared surfaces in `@repo/ui` to centralize styles.

6) Validate (mobile & desktop)
- UI build + web build; visually check header menu, dialogs, toasts, tooltips.
- A11y: focus rings visible; 44px touch targets; Escape closes.

## Acceptance Criteria
- No inline color overrides in shared UI. Surfaces use tokens.
- Menu opens under avatar on mobile; no left slide; no black borders.
- Single semantic.css load; tokens.css loaded.
- No raw color literals in shared UI; minimal in apps.

## Commands (Windows‑friendly)
- Find color overrides:
  - `grep -RIn "bg-white\|!bg-white\|style=.*background-color\|#[0-9A-Fa-f]\|rgb(\|oklch\(" packages/ui`
- Find subpath imports:
  - `grep -RIn "@repo/ui/primitives" apps/web`

## Copy/Paste Prompts
- “Normalize `.menu` in semantic.css: keep min/max width + token border/bg; remove mobile left/right and width forcing.”
- “Remove `bg-white`/`!bg-white` and inline background colors in `packages/ui/**` components; rely on `.menu`, `.dialog-content`, `.toast` token styles.”
- “Use `portal=\"body\"` on header menu; remove `w-screen` at call site; keep `w-auto sm:w-56`.”

Owner: UI Platform (you + Claude‑code)
