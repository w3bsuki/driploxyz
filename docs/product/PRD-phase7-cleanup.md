# Product Requirements – Phase 7 Cleanup Automation

## Problem Statement
Manual cleanup tracking created drift between documentation and implementation. Stakeholders need a single command that produces verifiable evidence of cleanup progress to unblock Phase 8.

## Goals
- Provide non-engineering stakeholders with a JSON report summarizing cleanup status.
- Ensure every removal or documentation deliverable mandated for Phase 7 is captured in the audit output.
- Keep the command fast (<5s in dry-run) and safe for CI usage.

## User Stories
1. **Ops Engineer** – “I can run `pnpm cleanup:audit` in CI and receive a pass/fail signal with a persisted report.”
2. **Product Manager** – “I can review the generated JSON to confirm required documents exist and legacy modules are gone.”
3. **Developer** – “I can run the script locally in dry-run mode to see what remains without mutating the repo.”

## Functional Requirements
- CLI accepts `--dry-run` to skip file writes but still execute the audit.
- Script writes `docs/refactor/reports/phase-7-cleanup-audit.json` when not in dry-run.
- Report must include counts of total checks, passed/failed, and derived metrics (service inventory, docs present).

## Non-Functional Requirements
- Works on Node 22+ without additional runtime dependencies besides the workspace toolchain.
- Idempotent across repeated runs.
- Emits structured logs suitable for CI (summary line + JSON payload when requested).

## Acceptance Criteria
- Report reflects removal of `apps/web/src/lib/services/notifications.ts`, `apps/web/src/lib/services/trending.ts`, and `apps/web/src/lib/components/FormErrorBoundary.svelte`.
- Design tokens CSS is reported at `packages/ui/src/lib/styles/design-tokens.css`.
- SPEC + PRD files exist and are linked from the audit output.
- Validation log for Phase 7 includes the actual command output.
