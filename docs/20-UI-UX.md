# UI/UX Guidelines

This document defines the design system, component patterns, and styling conventions. The goal is consistent, accessible, fast UI with minimal custom CSS.

## 1) Design Tokens

- Colors, typography, spacing, radii, z‑index are defined as CSS variables under `:root` and mirrored in Tailwind theme.
- Light/dark modes switch by toggling a class on `<html>` and overriding variables.
- Keep token names semantic (e.g., `--color-primary`, `--space-2`), not literal.

Notes for Driplo:
- Use OKLCH color system in Tailwind v4 for consistent contrast on mobile displays.
- Maintain a 4px spacing baseline; primary CTAs 44px height, secondary 36–40px.

## 2) Tailwind Usage (v4)

- Prefer utilities in markup; keep custom CSS minimal and token‑based.
- Extract rare patterns into `@layer components` only when reused across features.
- Don’t stack >7 utility classes if a composed class would be clearer; prefer readability.
- Use responsive and state variants (`sm:`, `lg:`, `hover:`, `aria-`, `data-`) consistently.

## 3) Component Architecture (Modular by layers)

- UI Primitives (`src/lib/components/ui`): Button, Input, Select, Textarea, Checkbox, Switch, Label, Badge, Card, Dialog, Sheet, Tooltip, Toast.
- Composites (`src/lib/components/composite`): Form, DataTable, Pagination, ModalForm, EmptyState.
- Feature Components (`src/lib/features/*/components`): Feature‑specific UIs; compose primitives; no bespoke styling tokens.

Modularity: Good, with restraint. Prefer a small, stable set of primitives + compositions used everywhere. Avoid premature abstractions; duplicate once before extracting. Each component has:
- Clear, typed props; no “kitchen sink” options.
- Keyboard and screen reader support by default.
- Visual states: default/hover/active/disabled/focus/invalid.

Mobile‑first specifics:
- Provide `fullWidth`, `size="lg"` defaults for primary actions on phones.
- Keep bottom navigation stable at 44px; avoid hiding critical actions behind overflow.

## 4) Layout, Spacing, and Grid

- Use a consistent spacing scale (e.g., 4px baseline) via Tailwind spacing.
- Limit container widths (e.g., `max-w-screen-lg`) and use consistent page gutters.
- Prefer CSS grid/flex with gap utilities; avoid nesting for simple layouts.

## 5) Typography

- Define 3–5 text styles (e.g., `display`, `h1/h2`, `body`, `caption`).
- Line length target: 60–80 characters for body text.
- Use `leading-*` and `tracking-*` intentionally; don’t override per node unless necessary.

## 6) Forms

- Validate with schemas on the server; reflect errors inline with `aria-invalid` and `aria-describedby`.
- Use `+page.server.ts` actions and progressive enhancement; no client‑only submissions for core flows.
- Show optimistic UI sparingly; always handle server error states.

## 7) Motion

- Favor subtle, purposeful motion; durations 120–200ms for UI feedback.
- Reduce motion for users with `prefers-reduced-motion`.

## 8) Accessibility

- Every interactive element is keyboard‑reachable and focusable.
- Provide visible focus states; meet 3:1 contrast vs surrounding fill.
- Announce important changes via aria‑live where appropriate.
- No content is color‑only; pair with icons/patterns.

## 10) Mobile‑First Review

- 375px viewport sanity: no horizontal scroll; tap targets meet sizes.
- Bottom nav reachable with thumb; safe‑area insets respected.
- Images and carousels swipe smoothly; no blocking scroll‑jank.

## 9) Review Checklist (per UI PR)

- Matches primitives and spacing scale
- All states covered and accessible
- No custom CSS without tokens/rationale
- Works at `sm`, `md`, `lg` breakpoints
- RTL and i18n fit (no overflow, truncation)
