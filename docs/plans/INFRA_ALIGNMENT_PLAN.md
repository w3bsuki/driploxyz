# Infra Alignment — Types, Node, Stripe

Purpose: Ensure build stability, correct typings, and single Stripe SDK across the workspace.

Single-Task Mode: Keep changes small and isolated. Update CODEX_TASKLIST as you go.

## 1) Node 20 enforcement
- Local and CI use Node ≥20
- If needed, set engines in root and CI runtime images
- Validate: `pnpm -C apps/web run build` succeeds

## 2) i18n typings
- Add d.ts for `@repo/i18n/vite-plugin` and `@repo/i18n` runtime if missing
  - declare module '@repo/i18n/vite-plugin'
  - declare module '../lib/runtime.js' (inside @repo/i18n src)
- Validate: `pnpm -w turbo run check-types`

## 3) Stripe SDK alignment
- Align `@stripe/stripe-js` to ^7.x across apps and `@repo/ui`
- Consider making it a peerDependency of `@repo/ui` to prevent duplicate bundles
- Validate import sites in UI (`PaymentForm.svelte`, `BrandPaymentModal.svelte`)

## Acceptance Criteria
- Types check passes across workspace
- `apps/web` builds on Node 20 without plugin errors
- A single `@stripe/stripe-js` version is installed; no duplication in lockfile

