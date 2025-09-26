# Svelte 5 Migration Playbook

> **Claude execution prompt**  
> ```
> You are migrating Driplo to idiomatic Svelte 5 runes. Follow the "Execution flow" section exactly. After each numbered phase:
>  1. Run the listed commands.
>  2. Paste the relevant diffs and terminal output into the "Progress journal" blocks.
>  3. Request Codex review before moving on.
> Use Melt UI toasts/components where instructed. Do not downgrade to legacy Svelte patterns or introduce new lint ignores.
> ```

## Current gaps
- Components in the onboarding, dashboard, orders, and messaging routes still rely on `export let`, `onMount`, and manual DOM alerts instead of `$state`, `$derived`, and Melt primitives. Audit notes from `lint-output.txt` confirm undefined helpers (`_showValidationError`) and unused state placeholders scattered through onboarding forms.【F:lint-output.txt†L32-L63】
- Store modules such as `orderSubscription.svelte.ts` mix rune factories with legacy `writable` stores and unsafe in-place mutation, contributing to TypeScript and lint errors.【F:types-validation.txt†L21-L26】
- Shared UI packages expose rune-compatible APIs, but app-level components continue to import `.svelte.ts` stores directly from the file system without a factory wrapper, breaking SSR expectations.

## Goals
1. Every interactive component uses rune state (`$state`, `$state.raw`) with reassignment semantics; no leftover `export let` or `$:` reactive statements remain outside of derived helpers.
2. Side effects run in `$effect` with explicit guards; derived state moves into `$derived` or computed helpers.
3. Client feedback flows through Melt toasts, dialogs, or modals instead of `alert`, `confirm`, or bare HTML popups.
4. Store access happens through dedicated factory functions (`createOrderSubscriptionStore`) so SSR and hydration stay aligned.

## Execution flow
1. **Inventory legacy patterns**  
   - Run `rg "export let" apps/web/src/routes` and `rg "\$:" apps/web/src/routes -g'*.svelte'`.  
   - Document components needing rune refactors in `notes/svelte5-inventory.md` with owner + priority.  
   - Capture output in the Progress journal.
2. **Refactor onboarding flow**  
   - Convert onboarding +page.svelte to rune state, replace `_showValidationError` with Melt toast notifications, and ensure async flows use `$effect`/actions.  
   - Update the paired server load/action to return typed DTOs consumed by rune props.  
   - Commands: `pnpm --filter web lint -- --max-warnings=0`, `pnpm --filter web check`.  
3. **Dashboard/orders messaging stores**  
   - Wrap `orderSubscription.svelte.ts` and messaging stores in factory functions returning rune state + unsubscribe handlers.  
   - Replace direct mutation with reassignment and typed helpers.  
   - Commands: `pnpm --filter web check-types`, `pnpm --filter web test --orders`, `pnpm --filter web test --messaging` (create targeted vitest suites if missing).
4. **Shared primitives alignment**  
   - Promote duplicated UI logic into `packages/ui` rune components (buttons, carousels, modals) and ensure apps import from the package index.  
   - Update stories/tests accordingly.  
   - Commands: `pnpm --filter ui build`, `pnpm --filter web check`.
5. **Final audit**  
   - Re-run the search for `export let`, `$:` reactive statements, `onMount`, and raw DOM alerts.  
   - Any remaining occurrences must have a documented rationale in `notes/svelte5-inventory.md`.  
   - Run `pnpm -w turbo run check` to ensure all apps comply.

## Acceptance checklist
- [ ] `rg "export let" apps/web/src/routes` returns zero matches (outside of `$props` wrappers).
- [ ] `rg "onMount" apps/web/src/routes` returns zero matches.
- [ ] All Melt toasts/dialogs have associated accessibility tests (see UI-UX.md for patterns).
- [ ] `pnpm --filter web check` passes without rune-related compile errors.

## Progress journal
```text
# Step 1 – legacy pattern inventory

```
```text
# Step 2 – onboarding rune migration

```
```text
# Step 3 – dashboard/orders/messaging refactor

```
```text
# Step 4 – shared primitives alignment

```
```text
# Step 5 – final audit run

```

## Known blockers & escalations
| Area | Description | Escalation path |
| ---- | ----------- | --------------- |
| Melt primitives | Missing toast/modal variant? | Propose API addition in `packages/ui/README.md` and assign to Design Systems owner |
| SSR restrictions | Component requires browser-only API | Gate with `if (browser)` and document in `notes/svelte5-inventory.md` |

