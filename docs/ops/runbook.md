# Ops Runbook – Release & Observability Checks

## Phase 8 Automation Commands

| Command | Purpose |
|---------|---------|
| `pnpm cleanup:audit` | Runs the automated cleanup audit and writes `docs/refactor/reports/phase-7-cleanup-audit.json`. |
| `pnpm --filter web build:metrics` | Builds the web app and prints bundle size metrics. |
| `pnpm --filter @repo/domain test` | Executes domain package tests (cleanup service coverage). |
| `pnpm --filter web test:ci` | Runs server-side Vitest suite without launching Playwright. |
| `pnpm release:observability` | Convenience command that runs the cleanup audit, bundle metrics, domain tests, and `test:ci` sequentially. |

### Usage
1. Run `pnpm release:observability` locally before tagging a release.
2. In CI, wire the job to call the same script to ensure cleanup audits, bundle metrics, and domain tests are green.
3. To inspect the audit without writing to disk, call `pnpm cleanup:audit -- --dry-run --print`.

### Observability Notes
- `createObservabilityHandle` attaches structured request logs and initializes Sentry when `OBS_SENTRY_ENABLED=true` (and `OBS_SENTRY_DEV=true` for dev environments).
- Logs surface status codes and duration for every server request; failures emit `request.failed` events captured by the logger.
- The bundle metrics script seeds placeholder Supabase public env vars when absent so CI builds do not fail on missing configuration.
- Full Playwright runs still require the Vite dev server to resolve workspace imports. If CI runners lack those dependencies, fall back to `pnpm --filter web test:ci` + targeted Playwright smoke tests locally.

### Release Checklist Additions
- Verify `docs/refactor/reports/phase-8-validation-log.md` is updated with the latest command output.
- Ensure ADR-0003 reflects current release criteria before promotion.
