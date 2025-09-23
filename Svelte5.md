# Svelte 5 Rune Playbook

Use this guide when refactoring components, stores, and shared UI under the Svelte 5 runtime.

## Goals
- All interactive state uses $state or $state.raw and is reassigned instead of mutated.
- Derived data is computed with $derived or $derived.by, not legacy dollar reactive statements.
- Effects via $effect are pure side effects with guard clauses to prevent loops.
- Component props pulled with $props and documented with TypeScript interfaces.
- Shared state exposed through factory functions or context instead of mutating module scope.

## Tasks
- [ ] Audit components for leftover export let or legacy reactive statements; convert to rune equivalents.
- [ ] Replace writable stores that can be rune factories (for example auth, favorites, notifications) with createStore patterns plus thin compatibility wrappers where needed.
- [ ] Ensure arrays and objects returned from state reassign new references; no in-place push or splice.
- [ ] Remove unused shim files once consumers migrate to the new rune APIs.
- [ ] Document rune usage in packages/ui README and ensure tests cover happy and error paths.
- [ ] Add examples to this file showing canonical rune usage (state, derived, effect, props, bindings).

## Validation
- Run pnpm --filter web check-types to confirm TypeScript signatures remain strict.
- Run pnpm --filter web test to execute vitest suites covering UI logic.
- Manually smoke test critical components in story or playground once available.

## Anti-patterns to Eliminate
- Mixing rune state with legacy Svelte stores without a clear bridge.
- Using $effect for pure derivations where $derived would suffice.
- Keeping massive barrel exports that leak private components without design review.
- Leaving TODOs without owner and follow-up ticket.

## TDD Reminders
- Add tests before altering store behaviour; snapshot derived values where helpful.
- Use vitest with testing-library to assert DOM updates triggered by rune state.
- When fixing bugs, add regression coverage under packages/ui or apps/web tests.

Log open questions or edge cases at the bottom so future maintainers continue the trail.
