# Tailwind CSS v4 Remediation Playbook

> **Claude execution prompt**  
> ```
> You are auditing Tailwind CSS v4 usage across the Driplo monorepo. Execute the tasks in the "Remediation sequence" exactly, updating the progress tables and screenshots as you go. After each phase, run the validation commands and paste outputs into the "Command log" blocks before requesting Codex approval. Do not introduce custom hex colours or bypass tokens.
> ```

## Why we need this
- Production builds still fail with accessibility warnings tied to shared navigation components; these surfaced during the last `pnpm --filter web build` run and remain unresolved.  
- Legacy utilities and unused selectors persist in Seller onboarding and marketing components (`HeaderLogo`, `PartnerShowcase`), bloating CSS bundles.  
- Multiple routes import Tailwind plugins or tokens inconsistently, risking divergence from the shared design system documented in `packages/ui/styles`.

## Remediation sequence
1. **Inventory current usage**  
   - Run `pnpm --filter web build > build-validation.txt` and capture all warnings related to Tailwind, accessibility, or CSS pruning.  
   - Use `pnpm --filter web lint -- --max-warnings=0` to surface `@apply` misuse and unused class warnings.  
   - Document problem files in `notes/tailwind-audit.md`.
2. **Token alignment**  
   - Ensure every component imports semantic classes from `@repo/ui/styles/semantic.css`; replace hard-coded colours/spacing with tokens.  
   - Promote repeated patterns into `packages/ui` primitives when three or more components share them.  
   - Update stories/tests as needed.
3. **Component clean-up**  
   - Fix navigation, carousel, and showcase components flagged by the build for accessibility (aria labels, button roles, focus order).  
   - Remove unused selectors and ensure touch targets meet 44px guidance from `UI-UX.md`.
4. **Plugin rationalisation**  
   - Audit each app’s `app.css` for duplicate `@plugin` declarations and prune anything unused.  
   - Confirm `@source` globs only cover actual component paths to keep build times down.
5. **Performance verification**  
   - Run `pnpm performance-audit` after major styling changes and attach Lighthouse reports or metrics to `docs/performance-log.md`.

## Completion checklist
- [ ] `pnpm --filter web build` completes with zero warnings.  
- [ ] No component imports `@apply` patterns duplicating semantic tokens.  
- [ ] Navigation components meet Axe accessibility checks in Playwright.  
- [ ] `notes/tailwind-audit.md` shows zero open items.

## Command log
```text
# Phase 1 – build & lint output

```
```text
# Phase 2 – token alignment check

```
```text
# Phase 3 – component clean-up rerun

```
```text
# Phase 4 – plugin rationalisation rerun

```
```text
# Phase 5 – performance audit output

```

## Artifacts
- Store before/after screenshots in `docs/tailwind/before-after/` with captions.  
- Record any new primitives added to `packages/ui` in `packages/ui/CHANGELOG.md`.

