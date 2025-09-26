# Supabase Alignment & Auth Hardening Playbook

> **Claude execution prompt**  
> ```
> You are reconciling Driplo's Supabase schema, auth flows, and generated types with the application code. Execute the "Workflow" steps sequentially. After each stage, paste SQL diffs, Supabase CLI outputs, and relevant code snippets into the "Evidence" sections, then pause for Codex review before continuing. Never run migrations without recording them in the migration log template.
> ```

## Reality check
- The current repository has no verified link to a live Supabase project in this environment, so treat all schema claims in earlier audits as unverified.  
- `types-validation.txt` shows multiple RPC names (`get_conversation_messages`, `mark_conversation_read`) missing from the generated typings, indicating the Supabase client and database types are out of sync.【F:types-validation.txt†L33-L44】  
- Realtime subscriptions fail type-checking because the client overloads no longer match the generated `Database` interface, suggesting `packages/database` was regenerated without updating consumers.【F:types-validation.txt†L21-L26】

## Goals
1. Regenerate database types from the authoritative Supabase project and publish them via `packages/database`.
2. Audit and align auth/session handling so SSR hooks, browser clients, and API routes share a single source of truth.
3. Validate all RPCs, views, and triggers used by the app exist in the database, with matching return types and RLS coverage.
4. Document every schema change or required migration for manual execution, including rollback steps.

## Workflow
1. **Project verification**  
   - Run `pnpm --filter database supabase:status` (or equivalent CLI command) to confirm project connectivity.  
   - If unavailable, record missing credentials in `docs/supabase-handoff.md` and halt until provided.  
   - Capture command output in the Evidence section.
2. **Type regeneration**  
   - Execute `pnpm --filter database generate:types`.  
   - Commit updated `packages/database/src/generated.ts` and ensure exports remain stable.  
   - Re-run `pnpm --filter web check-types` to surface mismatches for remediation.
3. **Auth & session alignment**  
   - Review `hooks.server.ts`, `src/lib/server/supabase`, and client factories to ensure consistent session retrieval and cookie handling.  
   - Update onboarding/profile routes to use the shared helpers.  
   - Add integration tests covering login, logout, and authenticated actions.
4. **RPC audit**  
   - List all RPC calls (`rg "rpc" apps/web`) and verify each exists in the regenerated types.  
   - For missing entries, add migration stubs in `supabase/migrations/pending/` with the SQL definitions.  
   - Update server loaders to handle `{ data, error }` results without casting to `any`.
5. **Realtime & storage**  
   - Confirm channel names, schema, and table filters match the database definitions.  
   - Ensure storage buckets referenced in the app have corresponding policies documented in `supabase/storage-policies.md`.
6. **Security review**  
   - Run `pnpm --filter database supabase:policies` (or export policy definitions via CLI) and verify RLS coverage matches product requirements.  
   - Document gaps and required migrations in the handoff file.

## Completion checklist
- [ ] `pnpm --filter web check-types` passes with the regenerated database types.  
- [ ] All RPCs used by the app are defined in the database and typed in `@repo/database`.  
- [ ] Auth flows share a single helper set with integration test coverage.  
- [ ] Every required migration is captured in `supabase/migrations/pending/` with execution + rollback notes.

## Evidence
```text
# Step 1 – project verification output

```
```text
# Step 2 – type regeneration + compiler output

```
```text
# Step 3 – auth/session alignment tests

```
```text
# Step 4 – RPC audit results

```
```text
# Step 5 – realtime/storage alignment

```
```text
# Step 6 – policy export summary

```

## Escalation table
| Date | Issue | Owner | Action |
| ---- | ----- | ----- | ------ |


## Detailed task breakdown

### Schema inventory & verification
- [ ] Export the current schema (`pnpm --filter database supabase:schema dump`) and store the SQL snapshot in `supabase/snapshots/<date>-schema.sql`.
- [ ] Cross-check each table in the snapshot against `packages/database/src/generated.ts`; list mismatches in `notes/supabase-schema-audit.md`.
- [ ] For every table below, confirm columns, relationships, and RLS policies match the production requirements.

| Table / view | Expectations | Verification steps |
| ------------ | ------------ | ------------------ |
| `profiles` | Users can read public profile fields; only the owner can insert/update. | Validate policies via `supabase policies list profiles`; ensure onboarding actions use shared helpers. |
| `products` | Sellers manage their own products; public read for active listings. | Check indexes on `seller_id`, `slug`; confirm RPCs returning promoted products still exist. |
| `orders` | Buyer and seller only access; status transitions audited. | Run integration tests covering checkout, seller dashboard, and payouts. |
| `transactions` | Mirrors Stripe payouts, restricted to participants and admins. | Align with Stripe webhook payloads; verify `transactions` triggers create expected ledger entries. |
| `messages` | Only conversation participants read/write; mark-read RPC available. | Ensure secure RPCs (`get_conversation_messages_secure`, etc.) exist and match generated return types. |
| `favorites` | Authenticated users manage their list; public aggregate counts allowed. | Confirm realtime channel filters align with table policies. |
| `reviews` | Authenticated creation, owner edit/delete, public read. | Document outstanding migrations if the table/policies are missing. |

### RLS and policy review
- [ ] Run `supabase policies list --json > supabase/policies/latest.json` and attach the file to the Evidence section.
- [ ] Compare policies against the matrix above; record gaps or excessive privileges in `docs/supabase-handoff.md`.
- [ ] Ensure service role usage in server-side scripts is documented with justification.

### Functions, triggers, and RPCs
- [ ] Generate a catalog of RPCs via `supabase functions list` and reconcile with `rg "rpc" apps/web`.
- [ ] For each RPC used by the app, create a contract entry in `notes/supabase-rpc-audit.md` including purpose, expected parameters, and return types.
- [ ] Add regression tests (Vitest or integration) for high-risk RPCs such as messaging, orders, and payouts.

### Storage buckets
- [ ] Enumerate buckets with `supabase storage list-buckets` and confirm policies align with the file upload surfaces in the app.
- [ ] Document allowed MIME types, size limits, and lifecycle policies in `supabase/storage-policies.md`.

## Migration log template preview
If Claude identifies a schema change it cannot execute, capture it in `docs/supabase-handoff.md` before handing off to a teammate. Each entry must include:
- ✅ SQL migration (forward + rollback)
- ✅ Related Supabase CLI commands or dashboard actions
- ✅ Owner and due date
- ✅ Linked GitHub issue or ticket for tracking

## Evidence attachments
Paste CLI output, SQL snippets, and policy exports into the Evidence blocks above. When attaching lengthy outputs, prefer linking to committed files in `supabase/` instead of pasting thousands of lines inline.
