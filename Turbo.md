# Turbo and Tooling Playbook

Guides the workspace through pnpm, Turborepo, and automated quality gates. Complete this before deep refactors.

## Goals
- Standardise on Node 22.12.x across root and workspaces.
- Ensure Turbo tasks lint, type-check, test, and build without cache misses.
- Document TDD workflow so every refactor ships with automated coverage.

## Tasks
- [ ] Update root and app package.json files to enforce Node engines >= 22.12.0 < 23.
- [ ] Regenerate pnpm lockfile after nvm use 22.12.0 and pnpm install.
- [ ] Verify turbo.json tasks align with current scripts; remove unused entries such as performance artefact outputs if deprecated.
- [ ] Create or update Turborepo pipeline README snippet here summarising each task (dev, build, lint, check-types, test, performance-audit).
- [ ] Configure CI to call pnpm -w turbo run lint check-types test build before merging.
- [ ] Document quick commands for contributors: pnpm dev --filter web, pnpm --filter web lint, pnpm --filter web test, etc.
- [ ] Capture baseline timings for lint/type/test to detect regressions.

## Turborepo Pipeline

Turborepo is a high-performance build system that optimizes task execution across our monorepo workspaces through intelligent caching and parallelization. Our pipeline consists of:

### Core Tasks

**`dev`** - Development Server
- Starts local development servers with hot reload
- Cache disabled for continuous file watching
- Persistent task that runs until manually stopped
- Usage: `pnpm -w turbo run dev` or `pnpm dev --filter web`

**`build`** - Production Build
- Compiles and bundles all packages for production deployment
- Depends on upstream packages completing their builds first
- Outputs to `.svelte-kit/`, `dist/`, `lib/` directories
- Includes environment variable validation for deployment secrets
- Usage: `pnpm -w turbo run build`

**`lint`** - Code Quality Checks
- Runs ESLint across all workspaces to enforce coding standards
- Executes in dependency order to catch issues early
- Fast execution with Turbo's intelligent caching
- Usage: `pnpm -w turbo run lint` or `pnpm --filter web lint`

**`check-types`** - TypeScript Validation
- Performs static type checking without emitting files
- Validates TypeScript definitions across package boundaries
- Critical for catching type errors before runtime
- Usage: `pnpm -w turbo run check-types`

**`test`** - Test Suite Execution
- Runs unit tests (Vitest) and integration tests (Playwright)
- Depends on build completion for accurate testing environment
- Generates coverage reports in `coverage/` directories
- Usage: `pnpm -w turbo run test` or `pnpm --filter web test`

### Specialized Tasks

**`test:unit`** - Unit Tests Only
- Isolated unit testing with Vitest
- Faster feedback loop for component-level testing

**`test:integration`** - Integration Tests Only
- End-to-end testing with Playwright
- Validates complete user workflows

**`test:ui`** - Interactive Test Runner
- Visual test interface for debugging
- Cache disabled for interactive development

**`test:coverage`** - Coverage Analysis
- Generates detailed test coverage reports

## Quick Commands for Contributors

### Workspace-Wide Commands
- `pnpm -w turbo run lint` - Lint all packages
- `pnpm -w turbo run check-types` - Type check all packages
- `pnpm -w turbo run test` - Run all tests
- `pnpm -w turbo run build` - Build all packages

### Single Package Commands
- `pnpm dev --filter web` - Start web app development server
- `pnpm --filter web lint` - Lint only the web app
- `pnpm --filter web test` - Test only the web app
- `pnpm --filter web build` - Build only the web app
- `pnpm --filter @repo/ui test` - Test only the UI package
- `pnpm --filter @repo/core build` - Build only the core package

### Development Workflow
1. Start development: `pnpm dev --filter web`
2. Run tests in watch mode: `pnpm --filter web test:watch`
3. Type check: `pnpm --filter web check-types`
4. Before committing: `pnpm -w turbo run lint check-types test build`

## Validation
- Run pnpm -w turbo run lint.
- Run pnpm -w turbo run check-types.
- Run pnpm -w turbo run test.
- Run pnpm -w turbo run build.
All commands must pass using Node 22.12.x with zero warnings about engine mismatch.

## TDD Expectations
- Write failing unit or integration tests before modifying behaviour.
- Keep vitest watch scripts available for packages that support rapid feedback.
- Require Playwright smoke suite on every user-flow impacting change.
- Record command outputs or attach screenshots when handing work to reviewers or automation agents.

## Hand-off Requirements
- Update MAIN.md checklist once all tasks above are complete.
- Note any compromises or follow-up tickets at the end of this file.
- Keep CLAUDE.md and AGENTS.md references aligned with the latest command list.
