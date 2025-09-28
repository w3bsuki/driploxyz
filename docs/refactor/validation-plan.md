# Validation Plan

Run these commands before handing a phase to Codex. Record outputs in the relevant phase report.

## Core Commands
1. `pnpm --filter web lint`
2. `pnpm --filter web check-types`
3. `pnpm --filter web build`
4. `pnpm -w turbo run lint`
5. `pnpm -w turbo run check-types`
6. `pnpm -w turbo run test`
7. `pnpm -w turbo run build`

## Optional / Contextual
- `pnpm --filter web test:e2e` – Playwright smoke when touching flows.
- `pnpm performance-audit` – Required for UI performance changes.
- `pnpm --filter @repo/ui build` – Ensure shared UI package compiles when UI components change.

Document any failures, their root cause, and the remediation plan in the phase report before requesting review.
