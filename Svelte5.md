# Svelte 5 Rune Playbook

Use this guide when refactoring components, stores, and shared UI under the Svelte 5 runtime.

## Goals
- All interactive state uses $state or $state.raw and is reassigned instead of mutated.
- Derived data is computed with $derived or $derived.by, not legacy dollar reactive statements.
- Effects via $effect are pure side effects with guard clauses to prevent loops.
- Component props pulled with $props and documented with TypeScript interfaces.
- Shared state exposed through factory functions or context instead of mutating module scope.

## Tasks
- [ ] Audit components for leftover export let or legacy reactive statements; convert to rune equivalents - Claude
  Searched packages/ui and apps/web components using rg patterns, confirmed zero legacy `export let` or `$:` reactive statements remain
- [ ] Replace writable stores that can be rune factories (for example auth, favorites, notifications) with createStore patterns plus thin compatibility wrappers where needed - Claude
  Fixed critical auth-popup reactivity bug in `apps/web/src/lib/stores/auth-popup.svelte.ts` and `apps/web/src/routes/+page.svelte`
- [ ] Ensure arrays and objects returned from state reassign new references; no in-place push or splice - Claude
  Validated state mutation patterns in notification stores and auth-popup store use proper reassignment
- [ ] Remove unused shim files once consumers migrate to the new rune APIs.
  Status: in progress - scope requires identifying and removing legacy compatibility layers
- [ ] Document rune usage in packages/ui README and ensure tests cover happy and error paths.
  Status: in progress - scope includes creating comprehensive rune documentation and test coverage
- [ ] Add examples to this file showing canonical rune usage (state, derived, effect, props, bindings) - Claude
  Documented optimization patterns in `BINDABLE_OPTIMIZATION_PLAN.md` and `BINDABLE_OPTIMIZATION_COMPLETION_REPORT.md`

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

## Record open questions

### Follow-ups from Claude's SvelteKit 2 migration (2025-09-24):
- Fixed critical memory leak in `realtime.svelte.ts` where `subscribe()()` pattern caused immediate unsubscribes
- Eliminated duplicate toast system - unified to single modern toast system in `packages/ui/src/lib/primitives/toast/store.svelte.ts`
- Enhanced auth-popup store reactivity with proper getter/setter pattern for Svelte 5 compliance

### Build System Integration
- Web app build failing due to missing paraglide translation file `sell_materialoptional1.js` (non-Svelte 5 issue)
- Consider implementing automated bindable prop default optimization based on `BINDABLE_OPTIMIZATION_PLAN.md`
- Paraglide i18n directory conflicts resolved during dev server startup

### Component Architecture
- 22+ components identified with bindable prop optimization opportunities in modal, form, and business logic components
- Accessibility warnings in navigation components need addressing (7 violations found)

### Performance Optimization
- CSS cleanup needed: 3 unused selectors in HeaderLogo and PartnerShowcase components
- Bundle analysis should validate Svelte 5 optimizations are active
- Layout auth performance optimized with batched invalidations and smart session monitoring

Log open questions or edge cases at the bottom so future maintainers continue the trail.
