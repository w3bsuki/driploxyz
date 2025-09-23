# Project Structure Blueprint

Target layout for the monorepo once cleanup is complete. Use this as the baseline during Phase 0 and keep it updated whenever packages or apps move.

## Top Level
- apps: all SvelteKit surfaces (web, admin, docs) using shared tooling.
- packages: shared libraries promoted from apps, versioned via workspace references.
- supabase: migrations, functions, seed scripts, and generated types.
- scripts and performance tools: automation retained only when actively used.
- turbo.json, pnpm-workspace.yaml, package.json: single sources for task orchestration.

## Apps Expectations
- web: storefront. Keep feature code in src/lib and routes grouped by locale when localisation is active.
- admin: staff console. Shares UI primitives but owns its auth flows.
- docs: marketing site. Uses the design system and keeps content-driven routes.

Each app must expose:
- package.json with Node engine 22.12.x and scripts that map to Turbo tasks.
- svelte.config.ts with consistent aliases pointing to packages.
- Tailwind configuration or CSS entry trimmed to only required plugins.
- tsconfig that extends the generated SvelteKit config plus workspace overrides.

## Packages Expectations
- ui: single entry that exports stable components, tokens, and utilities. All components ship TypeScript types and adhere to Svelte 5 rune conventions.
- core: combined auth, cookies, and utility helpers used by apps. Build with tsup and publish dist artifacts.
- database: generated Supabase types and shared Zod schemas if needed.
- i18n: Paraglide outputs and scripts. No runtime JS duplication.
- eslint-config and typescript-config: flat config consumed by every workspace.

Each package must provide:
- package.json with workspace version range and Node 22.12.x engine (where relevant).
- Build script that emits the files referenced by exports, or use source files only if no build is required.
- README or inline docs summarising purpose; update when contracts change.

## Required Artefacts Per Area
- Apps: vitest suites, Playwright smoke tests, svelte-check targets, localisation snapshots where relevant.
- Packages: unit tests or synthetic usage examples, published type declarations, changelog entry when behaviour changes.
- Supabase: migrations with paired revert strategy and verified RLS tests.
- Tooling: clearly scoped scripts with usage instructions inside README.

## Ownership and Review
- Update the owner matrix when teams change; every folder should have a primary and backup contact.
- Cross-link owner info from CLAUDE.md so automation agents know whom to involve.

## Phase 0 Audit Checklist
- [ ] Confirm only the expected top-level folders exist: apps/, packages/, supabase/, scripts/ (if retained), turbo.json, pnpm-workspace.yaml, package.json, vercel.json.
- [ ] Evaluate legacy folders such as .logs/, performance-tests/, performance-test-results/, scripts/ (deprecated utilities) and remove if redundant.
- [ ] Verify each workspace (apps/*, packages/*) has a README or inline purpose section explaining ownership.
- [ ] Ensure node_modules/ is ignored and no build artefacts are checked in.
- [ ] Cross-check alias usage so apps reference packages via @repo/* instead of relative deep imports.
