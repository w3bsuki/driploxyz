# ADR-0003 – Release Verification & Observability Guardrails

- **Status:** Accepted (Phase 8)
- **Date:** 2025-10-05

## Context
Phase 7 introduced an automated cleanup audit and removal of legacy modules. Phase 8 builds on that by wiring server-side observability (structured logging + optional Sentry) and defining a single command that CI can execute to validate release readiness.

## Decision
1. Adopt `createObservabilityHandle` within `apps/web/src/lib/server/hooks.ts` to instrument every request with structured logs and conditional Sentry initialization.
2. Require the `pnpm release:observability` command (cleanup audit → bundle metrics → domain tests) to pass before promoting a release candidate.
3. Maintain cleanup audit logic inside the `@repo/domain` package for reuse by future tooling.

## Consequences
- Observability can be toggled via environment flags (`OBS_SENTRY_ENABLED`, `OBS_SENTRY_DEV`, `OBS_LOGGING_ENABLED`) without touching application code.
- Releases must include regenerated audit reports and validation logs to demonstrate compliance.
- Additional cleanup/observability rules can extend `@repo/domain` without modifying the script entrypoint.
- Metrics builds automatically seed non-sensitive Supabase public env placeholders to keep CI deterministic when secrets are absent.
