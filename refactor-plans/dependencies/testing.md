# Testing & Quality Stack

## Current Tooling
| Layer | Dependency | Version | Usage | Notes |
| --- | --- | --- | --- | --- |
| Unit tests | `vitest` | ^3.2.x across apps/packages | Primary unit test runner (web/docs/ui/core) with shared configs exported from `@repo/testing`.【F:apps/web/package.json†L12-L69】【F:apps/docs/package.json†L18-L44】【F:packages/ui/package.json†L11-L88】【F:packages/testing/package.json†L1-L36】 | Several commands still pass `--passWithNoTests`; remove and enforce coverage per policy.【F:apps/web/package.json†L12-L18】【F:packages/ui/package.json†L11-L23】 |
| Component tests | `@testing-library/svelte`, `@testing-library/jest-dom` | ^5.2.8 / ^6.x | Provides DOM assertions for Svelte components in UI and web packages.【F:apps/web/package.json†L41-L69】【F:packages/ui/package.json†L59-L88】 | Ensure global setup handles rune APIs; docs/app share dependency to avoid duplication. |
| E2E tests | `@playwright/test` | ^1.55.0 | Browser automation for storefront/docs flows; integrated into turbo `test:integration`.【F:apps/web/package.json†L6-L45】【F:apps/docs/package.json†L18-L44】【F:turbo.json†L37-L52】 | Need deterministic seeding for Supabase data before running. |
| Accessibility audits | `@axe-core/playwright` | ^4.10.0 | Optional AXE scans for storefront pages during Playwright runs.【F:apps/web/package.json†L41-L69】 | Not currently invoked; integrate into CI scenario set. |
| Performance | `@lhci/cli`, `web-vitals` | ^0.12.0 / ^3.5.0 | CLI for Lighthouse regression; custom vitals instrumentation in web app.【F:package.json†L16-L23】 | Add baseline budgets and integrate into release gating. |

## Pain Points & Risks
- Coverage thresholds defined in TESTING.md but not enforced automatically; commands rely on manual discipline.【F:TESTING.md†L21-L48】
- Admin app lacks any automated tests (`test` script is placeholder).【F:apps/admin/package.json†L9-L33】
- Docs app tests may fail due to Tailwind import issues flagged in roadmap; fix build to restore E2E reliability.【F:ROADMAP.md†L15-L40】
- No centralized fixtures for Supabase seeding; E2E flows risk flakiness due to data drift.

## Target State
1. Shared Playwright setup package with fixtures, Supabase seeding, and accessibility checks toggled per suite.【F:packages/testing/package.json†L1-L36】
2. Enforce coverage via Vitest config and turbo pipeline; add thresholds per package aligning with TESTING.md.【F:TESTING.md†L21-L48】【F:turbo.json†L37-L60】
3. Introduce admin app smoke tests before shipping admin features.【F:apps/admin/package.json†L9-L33】

## Next Steps
- Create `tests/setup/supabase.ts` to reset database between suites using CLI or RPCs.【F:supabase/migrations/20250910_add_messaging_rpcs.sql†L1-L120】
- Remove `--passWithNoTests` from scripts after verifying coverage suites exist.【F:apps/web/package.json†L6-L18】【F:packages/ui/package.json†L16-L23】
- Add GitHub Actions workflow matrix to run unit + e2e suites in parallel on Node 22 with browsers installed.【F:package.json†L8-L23】【F:turbo.json†L33-L55】
