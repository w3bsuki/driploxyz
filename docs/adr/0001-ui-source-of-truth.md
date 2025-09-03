# ADR 0001 — UI as Single Source of Truth

Status: Accepted
Date: 2025-09-03

Context
- Components were duplicated between `apps/web/src/lib/components` and `packages/ui`, causing drift and rework.

Decision
- All shared components live in `packages/ui/src/lib`. Apps import from `@repo/ui`.
- Allowed deep imports: `@repo/ui/types`, `@repo/ui/primitives`, `@repo/ui/styles/*`.
- “Rule of 2”: promote components used in 2+ places; delete app-local duplicates.

Consequences
- Clear ownership and discoverability; better a11y/UX consistency.
- Minor friction when promoting components, offset by long-term velocity.

