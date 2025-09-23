# Tailwind CSS v4 Playbook

This guide keeps the design system lean while using Tailwind CSS v4 with design tokens.

## Goals
- All styling flows through tokens in packages/ui/src/styles with semantic aliases.
- Tailwind directives and plugins limited to what apps actually consume.
- Build output free of unused utilities by configuring content sources correctly.

## Tasks
- [ ] Audit Tailwind imports in app-level CSS (for example apps/web/src/app.css) and remove redundant declarations.
- [ ] Verify @plugin usage matches installed dependencies and remove legacy plugins.
- [ ] Ensure @source globs point to packages/ui and any app-specific component paths only.
- [ ] Document token naming conventions (color, spacing, typography) and update components to use them.
- [ ] Rebuild packages/ui stylesheets and ensure apps consume compiled CSS where appropriate.
- [ ] Capture before/after screenshots when adjusting critical UI components.

## Validation
- Run pnpm --filter web build to compile Tailwind styles and ensure no errors.
- Use pnpm --filter web test:e2e with Axe to confirm accessibility after styling changes.
- Optionally run pnpm performance-audit if CSS changes impact loading.

## Notes
- Prefer semantic class names (bg-surface-base) over direct brand colors in app code.
- Keep touch targets at least 44px height and document exceptions.
- Record any deleted CSS files in the changelog to avoid regressions.

Attach design review evidence when major visual updates land.
