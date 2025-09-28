# Supabase Bridge Plan

## Objectives
- Keep Supabase schema, generated types, and client helpers in sync.
- Document manual steps required when updating migrations.
- Provide guidance for handling service-role keys and environment validation.

## Current Findings (Phase 0)
- `packages/database/src/generated.ts` lacks `order_items` and other tables referenced in Stripe workflows.
- Server helpers import from `@repo/core/auth`, but alias configuration is missing in the web app, breaking builds.
- Env variable guards rely on `$env/dynamic/public` and must fall back to static values to satisfy TypeScript.

## Action Items
1. Capture full schema snapshot from Supabase CLI (`supabase gen types typescript --linked`).
2. Compare migrations under `supabase/migrations/` with generated types; note discrepancies in `supabase-schema-snapshot.md`.
3. Update shared auth utilities to expose cookie serialization helpers for hooks and endpoints.
4. Document manual migration steps and rollbacks.
