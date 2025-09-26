# SvelteKit 2 Server Contract Playbook

> **Claude execution prompt**  
> ```
> You are aligning Driplo with SvelteKit 2 data contracts. Work through the "Action plan" sequentially. After each phase, paste the updated route signatures and command outputs into the "Validation ledger" blocks and request Codex review before proceeding. Do not add `any`, disable TypeScript rules, or bypass serialisable return requirements.
> ```

## Current contract issues
- Several protected routes (orders, onboarding, messaging) export untyped `load` functions that return Supabase clients and non-serialisable values, leading to runtime drift and compiler failures recorded in `lint-output.txt` and `types-validation.txt`.
- Actions still return raw `Fail` objects or throw `error()` without structured form validation results, making optimistic UI impossible and violating the production checklist.
- Client components expect `data.supabase` and other server-only objects that are no longer provided by the new hooks, breaking SSR hydration.

## Action plan
1. **Baseline audit**  
   - Run `pnpm --filter web check` and capture every SvelteKit-specific error (missing `PageServerLoad`, invalid action return) in `notes/sveltekit-audit.md`.  
   - List affected routes, including nested layouts, and assign owners.
2. **Server load refactor**  
   - For each failing `+page.server.ts`, export typed functions: `export const load = (async ({ locals, params }) => {...}) satisfies PageServerLoad`.  
   - Ensure returned data is serialisable; convert Supabase clients to lightweight DTOs (e.g., return `Boolean` flags, `string` IDs).  
   - Update paired `+page.ts` files to consume typed data via `PageLoad` interfaces.
3. **Action normalization**  
   - Replace raw `fail()` usage with structured action results: `{ status: 'error', issues }` typed via zod schemas and `satisfies Actions`.  
   - Move file uploads and browser-only utilities behind `locals.supabase.storage` or client-side fetchers.
4. **Shared helpers**  
   - Centralise form parsing and Supabase session access in `src/lib/server/supabase`.  
   - Update existing routes to call the shared helpers instead of duplicating logic.
5. **SSR client boundary**  
   - Remove `data.supabase` from pages; instantiate the browser client in `onMount` equivalents using the provided factory.  
   - Update UI code accordingly and ensure hydration warnings are resolved.
6. **Regression coverage**  
   - Add vitest coverage for loaders/actions that perform significant branching (messaging, checkout).  
   - Update Playwright specs to assert on new action error messages or redirects.

## Completion criteria
- [ ] `pnpm --filter web check` passes without load/action errors.
- [ ] No route exports `default` load functions without `satisfies` typing.
- [ ] Actions return serialisable objects only (no Supabase clients, Response instances, or raw Errors).
- [ ] Updated documentation in `notes/sveltekit-audit.md` lists zero outstanding routes.

## Validation ledger
```text
# Phase 1 – baseline check output

```
```text
# Phase 2 – load refactor rerun

```
```text
# Phase 3 – action normalization rerun

```
```text
# Phase 4 – shared helper validation

```
```text
# Phase 5 – SSR boundary audit

```
```text
# Phase 6 – final quality gate outputs

```

## Escalation log
Record any blockers (missing Supabase RPC, schema mismatch) here with owners and due dates.

| Date | Route | Blocker | Owner | Next step |
| ---- | ----- | ------- | ----- | --------- |

